
import os
import http.server
import socketserver
import socket
import webbrowser

import logging

from agvis.cli import is_port_available, find_available_port

logger = logging.getLogger(__name__)


def run(host='127.0.1', port=8810, open_browser=False):
    """
    Load the AGVis CLI.
    Returns
    -------
    function
        The AGVis CLI handler.
    """
    web_app_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "static")
    os.chdir(web_app_dir)

    if is_port_available(port):
        available_port = port
    else:
        available_port = find_available_port(8810, 8900)
        if available_port is not None:
            logger.warning(f"Port {port} conflict, switch port to {available_port}.")
        else:
            logger.error("No available port found in the default range.")

    logger.info(f"AGVis serves on http://{host}:{available_port}")

    handler = http.server.SimpleHTTPRequestHandler
    httpd = socketserver.TCPServer((host, available_port), handler)

    httpd.server_activate()

    if open_browser:
        # Open URL in default browser
        url = 'http://' + host + ':' + str(available_port)
        webbrowser.open(url)
    return httpd
