
import os
import http.server
import socketserver
import socket
import webbrowser
import threading

import logging

logger = logging.getLogger(__name__)


class webapp(object):
    """
    AGVis web application.
    """

    def __init__(self, host='localhost', port=8810, socket_path=None):
        self.host = host
        self.port = port
        self.httpd = None
        self.thread = None
        self.url = None
        self.socket_path = None

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
            server_address = ('', self.port)
            self.httpd = WebHTTPServer(server_address, WebHTTPRequestHandler)
            self.thread = threading.Thread(target=self.httpd.serve_forever)
            self.thread.daemon = True
            self.thread.start()
            self.url = 'http://' + self.host + ':' + str(self.port)
            logger.info(f"AGVis serves on {self.url}")
            if open_browser:
                # Open URL in default browser
                url = 'http://' + self.host + ':' + str(self.port)
                webbrowser.open(url)

            if self.socket_path:
                self.server_socket = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
                self.server_socket.bind(self.socket_path)
                self.server_socket.listen(1)
                logger.info(f"AGVis is listening on socket file {self.socket_path}")

            return True
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
            logger.warning(f"AGVis stopped, you can close the brwoser window.")

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


class WebHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    # TODO:
    def __init__(self, *args, **kwargs):
        # Get the path of the requested file
        path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "static")
        super().__init__(*args, directory=path, **kwargs)

    def do_GET(self):
        if self.path == '/':
            # TODO: Add custom request handling logic here
            super().do_GET()
        else:
            # For all other requests, use the default behavior
            super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        # Add custom POST request handling logic here
        if self.path == '/upload':
            pass
        else:
            # For all other POST requests, use the default behavior
            super().do_POST()


class WebHTTPServer(socketserver.TCPServer):
    allow_reuse_address = True

    def server_bind(self):
        self.socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.socket.bind(self.server_address)
