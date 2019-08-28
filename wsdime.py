#!/usr/bin/env python3.7
"""

"""

from __future__ import annotations
from typing import List, Dict, Tuple, Union
import json
from asyncio import get_event_loop, ensure_future, wait, FIRST_COMPLETED, sleep
from websockets import serve
from andes_addon.dime import Dime
from andes_addon.pymatbridge import _Session



# Patch Dime's decode function to not do special processing
_Session.json_decode = lambda self, x: json.loads(x)
_Session.json_encode = lambda self, x: json.dumps(x)


S_CONS_NAME = 0
S_CONS_TARGET = 1
S_CONS_DATA = 2

S_PROD_RECV = 0
S_PROD_VALUE = 1


_g_dimec: Dime = None
_g_cons_state = S_CONS_NAME
_g_cons_name = None
_g_cons_target = None
_g_cons_data = None
_g_prod_state = S_PROD_RECV
_g_prod_name = None
_g_prod_value = None


async def consumer(message: str):
	global _g_cons_state
	global _g_cons_name
	global _g_cons_target
	global _g_cons_data

	print(f'cons: {_g_cons_state}')

	if _g_cons_state == S_CONS_NAME:
		_g_cons_name = message
		_g_cons_state = S_CONS_TARGET
	elif _g_cons_state == S_CONS_TARGET:
		_g_cons_target = message
		_g_cons_state = S_CONS_DATA
	elif _g_cons_state == S_CONS_DATA:
		_g_cons_data = json.loads(message)

		_g_dimec.send_var(_g_cons_target, _g_cons_name, _g_cons_data)
		
		_g_cons_state = S_CONS_NAME
	else:
		raise NotImplementedError


async def producer() -> str:
	global _g_prod_state
	global _g_prod_name
	global _g_prod_value

	print(f'prod: {_g_prod_state}')

	if _g_prod_state == S_PROD_RECV:
		while True:
			name = _g_dimec.sync()
			if not name:
				await sleep(0.1)
				continue
			
			break
			
		_g_prod_name = name
		_g_prod_value = json.dumps(_g_dimec.workspace[name])
		_g_prod_state = S_PROD_VALUE
		return _g_prod_name

	elif _g_prod_state == S_PROD_VALUE:
		_g_prod_state = S_PROD_RECV
		return _g_prod_value
	else:
		raise NotImplementedError


async def consumer_handler(websocket, path):
	async for message in websocket:
		await consumer(message)


async def producer_handler(websocket, path):
	while True:
		message = await producer()
		await websocket.send(message)


async def handler(websocket, path):
	consumer_task = ensure_future(consumer_handler(websocket, path))
	producer_task = ensure_future(producer_handler(websocket, path))
	done, pending = await wait([consumer_task, producer_task], return_when=FIRST_COMPLETED)
	for task in pending:
		task.cancel()


def main(bind, port, dhost, dport):
	print(f'Connecting to dime on tcp://{dhost}:{dport}')
	dimec = Dime('geovis', f'tcp://{dhost}:{dport}')
	ok = dimec.start()
	if not ok:
		raise ValueError('Could not start dime client')
		return

	global _g_dimec
	_g_dimec = dimec

	print(f'Listening on {bind}:{port}')
	start_server = serve(handler, bind, port)
	
	loop = get_event_loop()
	loop.run_until_complete(start_server)
	loop.run_forever()


def cli():
	import argparse

	parser = argparse.ArgumentParser()
	parser.add_argument('--bind', default='')
	parser.add_argument('--port', type=int, default=8810)
	parser.add_argument('--dhost', default='127.0.0.1')
	parser.add_argument('--dport', default=8819)
	args = vars(parser.parse_args())

	main(**args)


if __name__ == '__main__':
	cli()
