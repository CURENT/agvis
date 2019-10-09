from __future__ import annotations
from andes_addon.dime import Dime
from time import sleep
import numpy as np
from pathlib import Path
from csv import DictReader
from timeit import default_timer as timer


def broadcastCommFiles(rootFolder="./", port=8819):
    root = Path(rootFolder)
    flow = root / 'stats' / 'net_stats_flow.csv'
    port = root / 'stats' / 'net_stats_port.csv'
    wecc = root / 'topology' / 'config_wecc_full.csv'
    node = root / 'topology' / 'sw_port_node.csv'

    switches: Dict[Idx, Tuple[Longitude, Latitude]] = {}
    pmus: Dict[Idx, Tuple[Longitude, Latitude]] = {}
    pdcs: Dict[Idx, Tuple[Longitude, Latitude]] = {}
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
            elif Type in ('Region', 'HwIntf'):
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

    dimec = Dime('LTBNET', 'tcp://127.0.0.1:8819')
    ok = dimec.start()
    if not ok:
        print('bad!')
        exit()

    dimec.broadcast('LTBNET_params', LTBNET_params)

    '''
    Here we garner the port information from the sw_port_node file,
    since the information does not have to be sent across dime, we use
    this data to simplify what we shall stream through dime vars later
    '''
    macandporttoidx: Dict[Tuple[MAC, int], Idx] = {}
    idtoswitch: Dict[SID, Idx] = {}
    mactoidx: Dict[MAC, Idx] = {}
    with open(node, 'r') as f:
        reader = DictReader(f)
        for row in reader:
            MAC = row['MAC']
            To = row['Node_Name']
            SID = row['Switch_ID']
            Port = int(row['Port'])
            From = row['Idx']

            macandporttoidx[MAC, Port] = To
            idtoswitch[SID] = From
            mactoidx[MAC] = From

    # Mac and Port mapped to an internal name (i.e. "s1"),
    # change that internal name from "s1" to actual switch S_BCTC
    for key, val in macandporttoidx.items():
        if val in idtoswitch:
            macandporttoidx[key] = idtoswitch[val]
    print(macandporttoidx)

    # mac maps to an internal name (i.e "s1"),
    # change that intenal name from "s1" to actual switch S_BCTC
    for key, val in mactoidx.items():
        if val in idtoswitch:
            mactoidx[key] = idtoswitch[val]

    # change (MAC, Port) -> IDX to (IDX, Port) -> Idx
    # this process could be skipped; however, it makes debugging easier
    fullportmap: Dict[Tuple[Idx, int], Idx] = {}
    for key, theidx in macandporttoidx.items():
        themac = key[0]
        theport = int(key[1])
        fullportmap[(mactoidx[themac], theport)] = theidx
    print(fullportmap)

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

            fromNode = mactoidx[flowMac]
            toNode = fullportmap[(fromNode, flowOutPort)]

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
            else:
                print(fromNode, toNode)
                raise NotImplementedError

            if aggregateTime not in flowDict:
                flowDict[aggregateTime] = []
            flowTime -= 1559160380
            flowDict[aggregateTime].append(
                (flowTime, FromType, FromIndex, ToType, ToIndex, flowPackets, flowBytes))

    # Create a timer, every second - broadcast new data
    currentTime = timer()
    oldTime = -1
    maxTime = -1
    for key in flowDict.keys():
        if key > maxTime:
            maxTime = key
    while (True):
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
                dimec.broadcast('LTBNET_vars', LTBNET_vars)
            oldTime = newTime
            # If the file is coming to a close, exit
            if newTime >= maxTime:
                break


def main(root, port):
    print(f'Broadcasting files in {root} to across DIME on {port}')
    broadcastCommFiles(root, port)


def cli():
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--root', default='./')
    parser.add_argument('--port', type=int, default=8819)
    args = vars(parser.parse_args())

    main(**args)


if __name__ == '__main__':
    cli()
