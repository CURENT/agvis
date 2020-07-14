from __future__ import annotations
#from andes_addon.dime import Dime
from dime_wrapper import Dime
import numpy as np
from pathlib import Path
from csv import DictReader
from timeit import default_timer as timer
import pprint


def broadcastCommFiles(rootFolder="./", dime_address='ipc:///tmp/dime.sock'):
    root = Path(rootFolder)
    flow = root / 'stats' / 'net_stats_flow.csv'
    port = root / 'stats' / 'net_stats_port.csv'
    wecc = root / 'topology' / 'config_wecc_full.csv'
    node = root / 'topology' / 'sw_port_node.csv'

    switches: Dict[Idx, Tuple[Longitude, Latitude]] = {}
    pmus: Dict[Idx, Tuple[Longitude, Latitude]] = {}
    pdcs: Dict[Idx, Tuple[Longitude, Latitude]] = {}
    hwintfs = {}
    tchwintfs = {}
    macs: Dict[Idx, MAC] = {}
    links: List[Tuple[Idx, Idx]] = []

    with open(wecc, 'r') as f:
        reader = DictReader(f)
        for row in reader:
            Idx = row['Idx']
            Type = row['Type']
            Longitude = row['Latitude']
            Latitude = row['Longitude']
            MAC = row['MAC'].replace(':', '')
            From = row['From']
            To = row['To']

            if Type == 'Switch':
                switches[Idx] = (float(Longitude), float(Latitude))
                macs[Idx] = MAC
            elif Type == 'PMU':
                pmus[Idx] = (float(Longitude), float(Latitude))
            elif Type == 'PDC':
                pdcs[Idx] = (float(Longitude), float(Latitude))
            elif Type == 'Link':
                links.append((From, To))
            elif Type == 'HwIntf':
                hwintfs[Idx] = (float(Longitude), float(Latitude))
            elif Type == 'TCHwIntf':
                tchwintfs[Idx] = (float(Longitude), float(Latitude))
            elif Type in ('Region'):
                pass
            else:
                print('Unknown: ' + Type)

    LTBNET_params = {}

    Switch = np.zeros((len(switches), 2))
    LTBNET_params['Switch'] = Switch
    SwitchIndex: Dict[Idx, int] = {}
    SwitchIndexInv: Dict[int, Idx] = {}
    for i, (Idx, (Longitude, Latitude)) in enumerate(switches.items()):
        SwitchIndex[Idx] = i
        SwitchIndexInv[i] = Idx

        Switch[i] = (Latitude, Longitude)

    Pmu = np.zeros((len(pmus), 2))
    LTBNET_params['Pmu'] = Pmu
    PmuIndex: Dict[Idx, int] = {}
    PmuIndexInv: Dict[int, Idx] = {}
    for i, (Idx, (Longitude, Latitude)) in enumerate(pmus.items()):
        PmuIndex[Idx] = i
        PmuIndexInv[i] = Idx

        Pmu[i] = (Latitude, Longitude)

    Pdc = np.zeros((len(pdcs), 2))
    LTBNET_params['Pdc'] = Pdc
    PdcIndex: Dict[Idx, int] = {}
    PdcIndexInv: Dict[int, Idx] = {}
    for i, (Idx, (Longitude, Latitude)) in enumerate(pdcs.items()):
        PdcIndex[Idx] = i
        PdcIndexInv[i] = Idx

        Pdc[i] = (Latitude, Longitude)

    Hwintf = np.zeros((len(hwintfs), 2))
    LTBNET_params['Hwintf'] = Hwintf
    HwintfIndex: Dict[Idx, int] = {}
    HwintfIndexInv: Dict[int, Idx] = {}
    for i, (Idx, (Longitude, Latitude)) in enumerate(hwintfs.items()):
        HwintfIndex[Idx] = i
        HwintfIndexInv[i] = Idx

        Hwintf[i] = (Latitude, Longitude)

    Tchwintf = np.zeros((len(tchwintfs), 2))
    LTBNET_params['Tchwintf'] = Tchwintf
    TchwintfIndex: Dict[Idx, int] = {}
    TchwintfIndexInv: Dict[int, Idx] = {}
    for i, (Idx, (Longitude, Latitude)) in enumerate(tchwintfs.items()):
        TchwintfIndex[Idx] = i
        TchwintfIndexInv[i] = Idx

        Tchwintf[i] = (Latitude, Longitude)

    Link = np.zeros((len(links), 4))
    LTBNET_params['Link'] = Link
    LinkIndex: Dict[Tuple[Idx, Idx], int] = {}
    LinkIndexInv: Dict[int, Tuple[Idx, Idx]] = {}
    for i, (From, To) in enumerate(links):
        LinkIndex[From, To] = i
        LinkIndexInv[i] = (From, To)

        FromType = None
        FromIndex = None
        if From in switches:
            FromType = 0
            FromIndex = SwitchIndex[From]
        elif From in pmus:
            FromType = 1
            FromIndex = PmuIndex[From]
        elif From in pdcs:
            FromType = 2
            FromIndex = PdcIndex[From]
        else:
            print(From)
            raise NotImplementedError

        ToType = None
        ToIndex = None
        if To in switches:
            ToType = 0
            ToIndex = SwitchIndex[To]
        elif To in pmus:
            ToType = 1
            ToIndex = PmuIndex[To]
        elif To in pdcs:
            ToType = 2
            ToIndex = PdcIndex[To]
        else:
            raise NotImplementedError

        Link[i] = (FromType, FromIndex, ToType, ToIndex)

    LTBNET_header = []
    LTBNET_idx = {}
    LTBNET_vars = {}

    dimec = Dime('LTBNET', dime_address)

    dimec.broadcast_r(LTBNET_params=LTBNET_params)

    '''
    Here we garner the port information from the sw_port_node file,
    since the information does not have to be sent across dime, we use
    this data to simplify what we shall stream through dime vars later
    '''
    mac_and_port_to_idx: Dict[Tuple[MAC, int], Idx] = {}
    id_to_switch: Dict[SID, Idx] = {}
    mac_to_idx: Dict[MAC, Idx] = {}
    with open(node, 'r') as f:
        reader = DictReader(f)
        for row in reader:
            MAC = row['MAC']
            To = row['Node_Name']
            SID = row['Switch_ID']
            Port = int(row['Port'])
            From = row['Idx']

            mac_and_port_to_idx[MAC, Port] = To
            id_to_switch[SID] = From
            mac_to_idx[MAC] = From

    # Mac and Port mapped to an internal name (i.e. "s1"),
    # change that internal name from "s1" to actual switch S_BCTC
    for key, val in mac_and_port_to_idx.items():
        if val in id_to_switch:
            mac_and_port_to_idx[key] = id_to_switch[val]
    pprint.pprint(mac_and_port_to_idx)

    # mac maps to an internal name (i.e "s1"),
    # change that intenal name from "s1" to actual switch S_BCTC
    for key, val in mac_to_idx.items():
        if val in id_to_switch:
            mac_to_idx[key] = id_to_switch[val]

    # change (MAC, Port) -> IDX to (IDX, Port) -> Idx
    # this process could be skipped; however, it makes debugging easier
    full_port_map: Dict[Tuple[Idx, int], Idx] = {}
    for key, theidx in mac_and_port_to_idx.items():
        themac = key[0]
        theport = int(key[1])
        full_port_map[(mac_to_idx[themac], theport)] = theidx
    pprint.pprint(full_port_map)

    # FlowDict = Dictionary{TimeAtSecond[TimeAtMilliSecond, fromType, fromIndex, toType, toIndex, packets, bytes]}
    flowDict: Dict[int, List[Tuple[float, int, int, int, int, int, int]]] = {}
    with open(flow, 'r') as f:
        reader = DictReader(f)
        gotTime = False
        startTime = 0
        for row in reader:
            flowMac = row['datapath']
            flowTime = float(row['epoch-time'])
            flowOutPort = int(row['out-port'], 16)
            flowPackets = int(row['packets'])
            flowBytes = int(row['bytes'])

            fromNode = mac_to_idx[flowMac]
            toNode = full_port_map[(fromNode, flowOutPort)]

            # Why subtracr a set time?
            # A: Because our data set starts at a UNIX TimeStamp.
            # Subtract the initial time to set the staring value's time stamp to 0
            if not gotTime:
                startTime = int(flowTime)
                gotTime = True
            aggregateTime = int(flowTime - startTime)

            FromType = None
            FromIndex = None
            if fromNode in switches:
                FromType = 0
                FromIndex = SwitchIndex[fromNode]
            elif fromNode in pmus:
                FromType = 1
                FromIndex = PmuIndex[fromNode]
            elif fromNode in pdcs:
                FromType = 2
                FromIndex = PdcIndex[fromNode]
            else:
                print(fromNode)
                raise NotImplementedError

            ToType = None
            ToIndex = None
            if toNode in switches:
                ToType = 0
                ToIndex = SwitchIndex[toNode]
            elif toNode in pmus:
                ToType = 1
                ToIndex = PmuIndex[toNode]
            elif toNode in pdcs:
                ToType = 2
                ToIndex = PdcIndex[toNode]
            elif toNode in hwintfs:
                ToType = 3
                ToIndex = HwintfIndex[toNode]
            elif toNode in tchwintfs:
                ToType = 4
                ToIndex = TchwintfIndex[toNode]
            else:
                print(fromNode, toNode)
                raise NotImplementedError

            if aggregateTime not in flowDict:
                flowDict[aggregateTime] = []
            flowTime -= startTime
            flowDict[aggregateTime].append(
                (flowTime, FromType, FromIndex, ToType, ToIndex, flowPackets, flowBytes))

    # Create a timer, every second - broadcast new data
    currentTime = timer()
    oldTime = -1
    maxTime = -1

    for key in flowDict.keys():
        if key > maxTime:
            maxTime = key
    while True:
        # For every second, try to get the new data
        newTime = int(timer() - currentTime)
        if newTime != oldTime:
            if newTime in flowDict:
                Transfer = np.zeros((len(flowDict[newTime]), 7))
                LTBNET_vars['Transfer'] = Transfer

                for i, (flowTime, FromType, FromIndex, ToType, ToIndex, flowPackets, flowBytes) in enumerate(
                        flowDict[newTime]):
                    Transfer[i] = (flowTime, FromType, FromIndex, ToType, ToIndex, flowPackets, flowBytes)
                print(len(flowDict[newTime]))
                dimec.broadcast_r(LTBNET_vars=LTBNET_vars)

            oldTime = newTime
            # If the file is coming to a close, exit
            if newTime >= maxTime:
                break


def main(root, dime_address):
    print(f'Broadcasting files in {root} to across DIME on {dime_address}')
    broadcastCommFiles(root, dime_address)


def cli():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='./')
    parser.add_argument('--dime_address', default='/tmp/dime.sock')
    args = vars(parser.parse_args())

    main(**args)


if __name__ == '__main__':
    cli()
