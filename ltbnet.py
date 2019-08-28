from andes_addon.dime import Dime
from time import sleep
import numpy as np

dimec = Dime('LTBNET', 'tcp://127.0.0.1:8519')
ok = dimec.start()
if not ok:
	print('bad!')
	exit()

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