"""
A simple web application module to serve the AGVis web application on a specified host and port.

This module provides a webapp class to create a web application, which can be started, stopped, and accessed using its methods.
The module uses Python's built-in HTTP server and socket server, and also supports logging.
"""
import os
import socket
import webbrowser
import threading
import logging

from agvis.httprequest import HTTPRequestHandler
from agvis.httpserver import HTTPServer

logger = logging.getLogger(__name__)


class webapp(object):
    """
    AGVis web application.
    """

    def __init__(self, host='localhost', port=8810, socket_path=None,
                 static_path=None):
        self.host = host
        self.port = port
        self.httpd = None
        self.thread = None
        self.url = None
        self.socket_path = socket_path
        self.server_socket = None
        self.stop_event = threading.Event()
        default_static_path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "static")
        self.static_path = static_path or default_static_path

    def _start_server(self):
        """
        Initialize and start the HTTP server and Unix domain socket.
        """
        server_address = ('', self.port)
        self.httpd = HTTPServer(server_address, HTTPRequestHandler, directory=self.static_path)
        self.thread = threading.Thread(target=self.httpd.serve_forever)
        self.thread.daemon = True
        self.thread.start()
        self.url = 'http://' + self.host + ':' + str(self.port)
        msg = f"AGVis serves static files from directory '{self.static_path}'\n" \
            f"at URL '{self.url}'. Open your web browser and\n" \
            f"navigate to the URL to access the application."
        logger.info(msg)
        if self.socket_path:
            self.server_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
            self.server_socket.bind(self.socket_path)
            self.server_socket.listen(1)
            logger.info(f"AGVis is listening on socket file {self.socket_path}")

    def _run_cli(self):
        """
        Start the AGVis from command line.

        Returns
        -------
        bool
            True if the AGVis is started successfully, otherwise False.
        """
        try:
            self._start_server()
            logger.info("AGVis started from the command line. Press Ctrl+C to stop it.")
            self.stop_event.wait()  # Block the main thread until the stop_event is set
        except KeyboardInterrupt:
            logger.info("\n")
            self.stop()
            return False

    def run(self, open_browser=False):
        """
        Start the AGVis.

        Parameters
        ----------
        open_browser: bool
            True to open the browser automatically.

        Returns
        -------
        bool
            True if the AGVis is started successfully, otherwise False.
        """
        try:
            self._start_server()
            if open_browser:
                # Open URL in default browser
                url = 'http://' + self.host + ':' + str(self.port)
                webbrowser.open(url)
            return True
        except KeyboardInterrupt:
            self.stop()
            return False
        except OSError:
            msg = f"Start AGVis on port {str(self.port)} failed, please try another port."
            logger.warning(msg)
            return False

    def stop(self):
        """
        Stop the AGVis.
        """
        if self.httpd:
            self.httpd.shutdown()
            self.httpd.server_close()
            self.httpd = None
            self.thread.join()
            self.thread = None
            logger.warning("AGVis stopped, you can close the brwoser.")
        self.stop_event.set()  # Signal the main thread to stop blocking

    def accept_connection(self):
        """
        Wait for a connection over the Unix domain socket.
        """
        if self.server_socket:
            conn, addr = self.server_socket.accept()
            logger.info(f"AGVis received a connection from {addr}")
            return conn
        else:
            return None
