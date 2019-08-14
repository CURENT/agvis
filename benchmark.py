#!/usr/bin/env python3.7
"""

"""

from __future__ import annotations
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from typing import List, Dict, Tuple, Union, NewType
from dataclasses import dataclass
from andes_addon.dime import Dime
from time import sleep, time_ns
import numpy as np


def time():
	return time_ns() / 1e9

def human(n):
	suffixes = 'B KB MB GB'.split()
	i = 0
	mult = 1024
	while n > mult:
		n /= mult
		i += 1
	return f'{n:.0f} {suffixes[i]}'


Channel = NewType('Channel', str)
Address = NewType('Address', str)
Name = NewType('Name', str)
Value = NewType('Value', any)


@dataclass
class DimeClient:
	fromchannel: Channel
	tochannel: Channel
	address: Address
	dimec: Dime

	@classmethod
	def create(cls, fromchannel: Channel, tochannel: Channel, address: Address) -> DimeClient:
		dimec = Dime(fromchannel, address)

		ok = dimec.start()
		if not ok:
			raise ValueError('Could not start dimec')

		return cls(fromchannel, tochannel, address, dimec)
	
	def get(self, expected: Optional[Name]=None) -> Name:
		while True:
			varname = self.dimec.sync()
			if not varname:
				sleep(0.1)
				continue
			
			if expected is not None and varname != expected:
				raise ValueError(f'Unexpected variable: {varname!r}')

			return varname

	def __getitem__(self, varname: Name) -> Value:
		return self.dimec.workspace[varname]

	def __setitem__(self, varname, value):
		self.dimec.send_var(self.tochannel, varname, value)


def main_writer(dime: DimeClient, synack: bool):
	value = np.random.uniform(size=(50000,))
	size = len(value.tobytes())
	
	dime['syn'] = True
	dime.get('ack')

	total_size = 0
	start = time()
	for _ in range(100):
		dime['value'] = value

		if synack:
			dime['syn'] = True
			dime.get('ack')

		total_size += size
		now = time()
		rate = total_size / (now - start)
		print(f'rate = {human(rate)}/s ({human(total_size)} / {now - start} s)')
	
	dime['DONE'] = True


def main_reader(dime: DimeClient, synack: bool):
	dime.get('syn')
	dime['ack'] = True

	total_size = 0
	start = time()
	while True:
		varname = dime.get()
		if varname == 'DONE':
			break
		elif varname == 'value':
			value = dime[varname]
			size = len(value.tobytes())
			
			total_size += size
			now = time()
			rate = total_size / (now - start)
			print(f'rate = {human(rate)}/s ({human(total_size)} / {now - start} s)')

		elif varname == 'syn':
			if synack:
				dime['ack'] = True
		elif varname == 'ack':
			print('hmm')


def cli():
	def dime(s):
		address, fromchannel, tochannel = s.split(',')
		return DimeClient.create(fromchannel, tochannel, address)

	import argparse

	parser = argparse.ArgumentParser()
	parser.set_defaults(main=None)
	parser.add_argument('--synack', action='store_true')
	parser.add_argument('--dime', type=dime, required=True)

	subparsers = parser.add_subparsers(required=True)

	writer = subparsers.add_parser('writer')
	writer.set_defaults(main=main_writer)

	reader = subparsers.add_parser('reader')
	reader.set_defaults(main=main_reader)

	args = vars(parser.parse_args())
	main = args.pop('main')
	main(**args)


if __name__ == '__main__':
	cli()
