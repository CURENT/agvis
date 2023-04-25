"""
A custom HTTP request handler module that extends the SimpleHTTPRequestHandler class.

This module provides a custom HTTPRequestHandler class to handle GET and POST requests for
a web application.
It also sets the directory path for serving static files.
"""

import os
import http.server
import logging

logger = logging.getLogger(__name__)

class HTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
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
