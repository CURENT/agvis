from __future__ import annotations
from andes_addon.dime import Dime
from time import sleep
import numpy as np
from pathlib import Path
from csv import DictReader


root = Path('/home/thobson2/tmp/Data/Data/ltbnet_data')
flow = root / 'stats' / 'net_stats_flow.csv'
port = root / 'stats' / 'net_stats_port.csv'
wecc = root / 'topology' / 'config_wecc_full.csv'
node = root / 'topology' / 'sw_port_node.csv'

ports: Dict[Tuple[Idx, Idx], int] = {}
switchids: Dict[Idx, SID] = {}
with open(node, 'r') as f:
  reader = DictReader(f)
  for row in reader:
    To = row['Idx']
    SID = row['Switch_ID']
    Port = int(row['Port'])
    From = row['Node_Name']

    ports[From, To] = Port
    switchids[From] = SID

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
exit()

"""
pdc_params = []
link_params = []

for line in the_topology_csv:
  if col[0] == 'PDC':
    lat = col[8]
    lng = col[9]
    num = col[1]
    pdc_params.append(lat, lng, num)
  elif col[0] == 'Link':
    from = col[3]
    to = col[4]
    link_params.append()

# Send the topology of the communication network. Once.
dimec.broadcast('LTBNET_params', {
  "PDC": np.array(pdc_params),
  "Link": np.array(link_params),
})

# For good samaratins only
dimec.broadcast('LTBNET_header', [
  'Link_1_rx', 'Link_1_tx', 'Link_2_rx', 'Link_2_tx',
])

dimec.broadcast('LTBNET_idx', {
  'Link': {
    'rx': [1, 3, 5, 7, ...],
    'tx': [2, 4, 6, 8, ...],
  },
})

for line in the_stats_csv:
  data = []
  for link in links:
    epoch_time = ...
    rx_rate = ...
    tx_rate = ...
    the_who = ...
    data.append(rx_rate, tx_rate)
  
  dimec.broadcast('LTBNET_vars', {
    't': the_current_timestamp_from_zero,
    'vars': np.array(data),
  })

exit()
"""