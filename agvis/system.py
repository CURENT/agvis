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

    class WebHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
        """
        A custom HTTP request handler that extends the SimpleHTTPRequestHandler
        class to add custom handling logic for GET and POST requests.
        """

        def __init__(self, *args, **kwargs):
            # Get the path of the requested file
            path = os.path.join(os.path.dirname(os.path.realpath(__file__)), "static")
            super().__init__(*args, directory=path, **kwargs)

        def do_GET(self):
            super().do_GET()

        def do_POST(self):
            super().do_POST()

    class WebHTTPServer(socketserver.TCPServer):
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
        >>> server = WebHTTPServer(('localhost', 8000), RequestHandlerClass)
        >>> server.server_bind()
        """
        allow_reuse_address = True

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

    def __init__(self, host='localhost', port=8810, socket_path=None):
        self.host = host
        self.port = port
        self.httpd = None
        self.thread = None
        self.url = None
        self.socket_path = socket_path
        self.server_socket = None
        self.stop_event = threading.Event()

    def _start_server(self):
        """
        Initialize and start the HTTP server and Unix domain socket.
        """
        server_address = ('', self.port)
        self.httpd = self.WebHTTPServer(server_address, self.WebHTTPRequestHandler)
        self.thread = threading.Thread(target=self.httpd.serve_forever)
        self.thread.daemon = True
        self.thread.start()
        self.url = 'http://' + self.host + ':' + str(self.port)
        logger.info(f"AGVis serves on {self.url}, open your browser and visit it.")
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
