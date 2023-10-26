# ================================================================================
# File Name:   web.py
# Author:      Zack Malkmus
# Date:        10/20/2023 (last modified)
# Description: The backend for the AGVis web application.
# API Docs:    https://ltb.readthedocs.io/projects/agvis/en/latest/?badge=stable
# ================================================================================

import os
import sys
import subprocess
from flask import Flask, render_template, send_from_directory
import requests

class AgvisWeb():
    """
    The backend for the AGVis web application.
    This class handles all routes and web application logic.
    """

    def __init__(self):
        """
        Initializes the AgvisWeb class with operating system name and
        application directory.
        """
        self.os_name = sys.platform
        self.app_dir = os.path.dirname(os.path.abspath(__file__))
    

    def create_app(self):
        """
        Create the Flask application.

        Returns
        -------
        app
            Flask application with added routes
        """
        app = Flask(__name__)
        app.requests_session = requests.Session()

        # Add Routes
        @app.route('/')
        def index():
            return render_template('index.html')

        @app.route('/<path:path>', methods=['GET'])
        def static_proxy(path):
            return send_from_directory('static', path)
        
        return app


    def run(self, app, app_module, host='localhost', port=8810, workers=1, dev=False):
        """
        Run the AGVis web application using Gunicorn.
        For windows, use Flask's development server.
        """
        try:
            # Print out the URL to access the application
            print(f"AGVis will serve static files from directory \"{os.path.join(os.getcwd(), 'agvis/static')}\"")
            print(f"at the URL http://{host}:{port}. Open your web browser and navigate to the URL to access the application.")
            print("\nStarting AGVis... Press Ctrl+C to stop.\n")

            # Check if AGVis is running on Windows
            if (self.os_name == 'win32' or self.os_name == 'cygwin' or self.os_name == 'msys'):
                print("WARNING: AGVis is running on Windows. This is not recommended for production use.")
                print("Please use a Linux-based operating system for production use.")
                dev = True

            # Run flask as a development server
            if (dev == True):
                command = [
                    'flask',
                    '--app', 'main',
                    'run',
                    '--host', host,
                    '--port', str(port),
                    '--no-reload'
                ]
            # Run flask as a production server
            else:
                command = [
                    'gunicorn',
                    '-b', f'{host}:{port}',
                    '-w', str(workers),
                    '--timeout', '600',
                    app_module
                ]

            # Start the application
            with app.requests_session as session:
                # p = subprocess.Popen(command, cwd=self.app_dir)
                # p.wait()
                subprocess.run(command, check=True, cwd=self.app_dir)

        except KeyboardInterrupt:
            print('\nAGVis has been stopped. You may now close the browser.')
            
        except Exception as e:
            print(f'An unexpected error has occured while trying to start AGVis: {e}')