"""
A custom TCP server module that extends the TCPServer class to allow reusing the server address.

This module provides a custom HTTPServer class to create a TCP server with the ability to reuse the
server address.
This can be useful when a new server instance needs to be created quickly after shutting down the previous one.
"""
import socketserver
import socket
import logging

logger = logging.getLogger(__name__)


class HTTPServer(socketserver.TCPServer):
    """
    A custom TCP server that extends the TCPServer class to allow
    reusing the server address.

    Attributes
    ----------
    allow_reuse_address : bool
        A boolean flag that determines whether the server address can
        be reused.

    Notes
    -----
    This class extends the functionality of the TCPServer class by
    providing the ability to reuse the server address, which can be
    useful in cases where a new server instance needs to be created
    quickly after shutting down the previous one.

    Examples
    --------
    >>> server = HTTPServer(('localhost', 8000), RequestHandlerClass)
    >>> server.server_bind()
    """
    allow_reuse_address = True

    def __init__(self, server_address, RequestHandlerClass, directory=None):
        self.directory = directory
        super().__init__(server_address, RequestHandlerClass)

    def server_bind(self):
        """
        Bind the server to the specified address.

        This method sets the SO_REUSEADDR option to 1 to allow
        reusing the server address, and then binds the server to
        the specified address.

        Returns
        -------
        None

        Examples
        --------
        >>> server = WebHTTPServer(('localhost', 8000), RequestHandlerClass)
        >>> server.server_bind()
        """
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)
