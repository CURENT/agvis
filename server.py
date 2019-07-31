#!/usr/bin/env python3.7
"""

"""

from __future__ import annotations
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from typing import List, Dict, Tuple, Union


_g_foo: Dict[str, int] = None


class RequestHandler(SimpleHTTPRequestHandler):
	protocol_version = 'HTTP/1.1'

	def do_GET(self):
		if self.path == '/':
			self.directory = 'static'
			super().do_GET()
		elif self.path == '/favicon.ico':
			self.directory = 'static'
			super().do_GET()
		elif self.path.startswith('/static/'):
			self.directory = 'static'
			self.path = self.path[len('/static'):]
			super().do_GET()
		elif self.path.startswith('/foo/'):
			self.do_GET_foo()
		else:
			print('GET', self.path)
			raise NotImplementedError
	
	def do_GET_foo(self):
		"GET /foo/:name"
		_, foo, name = self.path.split('/')
		assert _ == ''
		assert foo == 'foo'
		name = name.encode('utf-8')

		count = _g_foo.get(name, 0)

		content = b'Hello %s (from GET)!\r\nSeen %d times' % (name, count)

		_g_foo[name] = count + 1

		self.send('text/plain', content)
	
	def do_POST(self):
		length = self.headers['content-length']
		nbytes = int(length)
		data = self.rfile.read(nbytes)
		# throw away extra data? see Lib/http/server.py:1203-1205
		self.data = data

		if self.path == '/foo/':
			self.do_POST_foo()
		else:
			print('POST', self.path)
			raise NotImplementedError
	
	def do_POST_foo(self):
		"POST /foo/"
		_, foo, _2 = self.path.split('/')
		assert _ == ''
		assert foo == 'foo'
		assert _2 == ''

		name = self.data

		count = _g_foo.get(name, 0)

		content = b'Hello %s (from POST)!\r\nSeen %d times\r\n' % (name, count)

		_g_foo[name] = count + 1

		self.send('text/plain', name)
	
	def send(self, content_type, content):
		use_keep_alive = self._should_use_keep_alive()
		use_gzip = self._should_use_gzip()

		if use_gzip:
			import gzip
			content = gzip.compress(content)
		
		self.send_response(200)
		self.send_header('Content-Type', content_type)
		self.send_header('Content-Length', str(len(content)))
		if use_keep_alive:
			self.send_header('Connection', 'keep-alive')
		if use_gzip:
			self.send_header('Content-Encoding', 'gzip')
		self.end_headers()
		self.wfile.write(content)

	def _should_use_keep_alive(self):
		connection = self.headers['connection']
		if connection is None:
			return False
		if connection != 'keep-alive':
			return False
		return True
	
	def _should_use_gzip(self):
		accept_encoding = self.headers['accept-encoding']
		if accept_encoding is None:
			return False
		if 'gzip' not in accept_encoding:
			return False
		return True


def main(bind, port):
	foo = {}

	global _g_foo
	_g_foo = foo

	address = (bind, port)
	print(f'Listening on {address}')
	server = ThreadingHTTPServer(address, RequestHandler)
	server.serve_forever()


def cli():
	import argparse

	parser = argparse.ArgumentParser()
	parser.add_argument('--bind', default='')
	parser.add_argument('--port', type=int, default=8810)
	args = vars(parser.parse_args())

	main(**args)


if __name__ == '__main__':
	cli()
