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
import numpy as np
import base64

def encode_ndarray(obj):
    """Write a numpy array and its shape to base64 buffers"""
    shape = obj.shape
    if len(shape) == 1:
        shape = (1, obj.shape[0])
    if obj.flags.c_contiguous:
        obj = obj.T
    elif not obj.flags.f_contiguous:
        obj = np.asfortranarray(obj.T)
    else:
        obj = obj.T
    try:
        data = obj.astype(np.float64).tobytes()
    except AttributeError:
        data = obj.astype(np.float64).tostring()

    data = base64.b64encode(data).decode('utf-8')
    return data, shape


# JSON encoder extension to handle complex numbers and numpy arrays
class PymatEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, np.ndarray) and obj.dtype.kind in 'uif':
            data, shape = encode_ndarray(obj)
            return {'ndarray': True, 'shape': shape, 'data': data}
        elif isinstance(obj, ndarray) and obj.dtype.kind == 'c':
            real, shape = encode_ndarray(obj.real.copy())
            imag, _ = encode_ndarray(obj.imag.copy())
            return {
                'ndarray': True,
                'shape': shape,
                'real': real,
                'imag': imag
            }
        elif isinstance(obj, np.ndarray):
            return obj.tolist()
        elif isinstance(obj, complex):
            return {'real': obj.real, 'imag': obj.imag}
        elif isinstance(obj, generic):
            return obj.item()
        # Handle the default case
        return json.JSONEncoder.default(self, obj)


def decode_arr(data):
    """Extract a numpy array from a base64 buffer"""
    data = data.encode('utf-8')
    return np.frombuffer(base64.b64decode(data), np.float64)


# JSON decoder for arrays and complex numbers
def decode_pymat(dct):
    if 'ndarray' in dct and 'data' in dct:
        value = decode_arr(dct['data'])
        shape = dct['shape']
        if type(dct['shape']) is not list:
            shape = decode_arr(dct['shape']).astype(int)
        return value.reshape(shape, order='F')
    elif 'ndarray' in dct and 'imag' in dct:
        real = decode_arr(dct['real'])
        imag = decode_arr(dct['imag'])
        shape = decode_arr(dct['shape']).astype(int)
        data = real + 1j * imag
        return data.reshape(shape, order='F')
    elif 'real' in dct and 'imag' in dct:
        return complex(dct['real'], dct['imag'])
    return dct

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
        _g_cons_data = json.loads(message, object_hook = decode_pymat)

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
        _g_prod_value = json.dumps(_g_dimec.workspace[name], cls=PymatEncoder)
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


def main(name, bind, port, dhost, dport):
    print(f'Connecting to dime on {dhost}')
    dimec = Dime(name, f'{dhost}')
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
    parser.add_argument('--name', default='geovis')
    args = vars(parser.parse_args())

    main(**args)


if __name__ == '__main__':
    cli()
