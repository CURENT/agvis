from andes_addon.dime import Dime
from time import sleep
import numpy as np

dimec = Dime('geovis', 'tcp://127.0.0.1:8810')
ok = dimec.start()
if not ok:
	print('bad!')
	exit()

try:
	ctx = {}
	while True:
		varname = dimec.sync()
		if not varname:
			print('not ready', end='\r')
			sleep(0.1)
			continue

		var = dimec.workspace[varname]
		#print(f'got {varname!r} ({type(var)})')

		if varname == 'DONE':
			break
		elif varname == 'Idxvgs':
			print('Idxvgs', var)
			ctx['Idxvgs'] = var
			continue

			mask = np.zeros((1000,), dtype=bool)
			minimum = 100
			maximum = 0
			nBus = int(var['System']['nBus'])
			nLine = int(var['System']['nLine'])
			print(f'nBus = {nBus}')
			print(f'nLine = {nLine}')
			for k, v in var.items():
				for kk, vv in v.items():
					if kk in ('nBus', 'nLine'):
						continue
					print(f'{k}.{kk}={vv.shape} ({vv[:1]})')
					for vvv in vv.flatten():
						vvv = int(vvv)
						minimum = min(minimum, vvv)
						maximum = max(maximum, vvv)
						mask[vvv] = True

			print(minimum, maximum)
			print(mask[minimum:maximum+1].sum())

		elif varname == 'Varheader':
			ctx['Varheader'] = var
			dimec.send_var('sim', 'geovis', {
				'vgsvaridx': np.arange(1, len(var) + 1),
			})
		elif varname == 'SysParam':
			print('SysParam', var)
			ctx['SysParam'] = var
		elif varname == 'SysName':
			print('SysName', var)
			ctx['SysName'] = var
		elif varname == 'Varvgs':
			ctx['Varvgs'] = var
			for k, v in zip(ctx['Varheader'], var['vars'].flatten()):
				print(f'{k}={v!r}')
				break
		else:
			print(varname)
			raise NotImplementedError
finally:
	print('exiting')
	dimec.exit()
