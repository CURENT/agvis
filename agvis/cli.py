import argparse
import logging
import platform
import sys
from time import strftime

import http.server
import socketserver
import os

from agvis.main import config_logger, find_log_path, get_log_dir

logger = logging.getLogger(__name__)


def create_parser():
    """
    Create a parser for the command-line interface.
    Returns
    -------
    argparse.ArgumentParser
        Parser with all AGVis options
    """

    parser = argparse.ArgumentParser()

    parser.add_argument(
        '-v', '--verbose',
        help='Verbosity level in 10-DEBUG, 20-INFO, 30-WARNING, '
             'or 40-ERROR.',
        type=int, default=20, choices=(1, 10, 20, 30, 40))

    sub_parsers = parser.add_subparsers(dest='command', help='[run] serve the web; '
                                        )

    run = sub_parsers.add_parser('run')
    run.add_argument('--host', default='127.0.0.1', help='Host to bind the server (default: 127.0.0.1)')
    run.add_argument('--port', default=8810, type=int, help='Port to bind the server (default: 8810)')

    return parser


def preamble():
    """
    Log the AGVis command-line preamble at the `logging.INFO` level
    """
    from agvis import __version__ as version

    py_version = platform.python_version()
    system_name = platform.system()
    date_time = strftime('%m/%d/%Y %I:%M:%S %p')

    logger.info("\n"
                rf"    _   _____   ___     | Version {version}" + '\n'
                rf"   /_\ / __\ \ / (_)___ | Python {py_version} on {system_name}, {date_time}" + '\n'
                r"  / _ \ (_ |\ V /| (_-< | " + "\n"
                r' /_/ \_\___| \_/ |_/__/ | Web-based geographical visualizer.' + '\n')

    log_path = find_log_path(logging.getLogger("agvis"))

    if len(log_path):
        logger.debug('Logging to file "%s"', log_path[0])


def main():
    """
    Entry point of the AGVis command-line interface.
    """

    parser = create_parser()
    args = parser.parse_args()

    # Set up logging
    config_logger(stream=True,
                  stream_level=args.verbose,
                  file=True,
                  log_path=get_log_dir(),
                  )
    logger.debug(args)

    if args.command == 'run':
        web_app_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), "static")
        os.chdir(web_app_dir)

        logger.info(f"AGVis serves on http://{args.host}:{args.port}")

        handler = http.server.SimpleHTTPRequestHandler
        httpd = socketserver.TCPServer((args.host, args.port), handler)

        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            logger.info(f"Server stopped.")
        finally:
            httpd.server_close()
    else:
        preamble()

    # Run the command
    if args.command is None:
        parser.parse_args(sys.argv.append('--help'))
