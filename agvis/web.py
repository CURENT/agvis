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
from flask import Flask, render_template, send_from_directory, send_file
from .flask_configurations import *
import requests

class AgvisWeb():
    """
    The backend for the AGVis web application.
    This class handles all routes and web application logic.
    """

    # ====================================================
    # Initialize Flask App
    # ====================================================

    def __init__(self):
        """
        Initializes the AgvisWeb class with operating system name and
        application directory.
        """
        self.os_name = sys.platform
        self.app_dir = os.path.dirname(os.path.abspath(__file__))
        self.app = self.create_app()

    # ====================================================
    # Create Event and Routes
    # ====================================================

    def create_app(self):
        """
        Create the Flask application.

        Returns
        -------
        app
            Flask application
        """
        app = Flask(__name__)
        app.requests_session = requests.Session()
        app.config.from_object(DefaultConfig())

        # Landing Page
        @app.route('/')
        def index():
            return render_template('index.html')

        # Static Routes
        @app.route('/<path:path>', methods=['GET'])
        def static_proxy(path):
            return send_from_directory('static', path)
        
        # Demo Simulations
        @app.route('/simulations/<filename>', methods=['GET'])
        def get_simulation(filename):
            file_path = f'cases/simulations/{filename}'
            return send_file(file_path, as_attachment=True)

        return app

    # ====================================================
    # Run server in Flask DEV mode
    # ====================================================

    def run_dev_server(self, host, port):
        self.app.config.from_object(DevelopmentConfig())
        command = ['flask','--app', 'main','run','--host', host,'--port', str(port),'--no-reload']
        with self.app.requests_session as session:
            subprocess.run(command, check=True, cwd=self.app_dir)

    # ====================================================
    # Run server with Gunicorn WSGI
    # ====================================================

    def run_prod_server(self, host, port, workers):
        self.app.config.from_object(ProductionConfig())
        command = ['gunicorn','-b', f'{host}:{port}','-w', str(workers),'--timeout', '600','agvis.main:app']
        with self.app.requests_session as session:
            subprocess.run(command, check=True, cwd=self.app_dir)

    # ====================================================
    # Handle user input and run the server
    # ====================================================

    def run(self, host='localhost', port=8810, static=None, workers=1, dev=False):
        """
        Run the AGVis web application using Gunicorn.
        For windows, use Flask's development server.
        """

        if (self.os_name == 'win32' or self.os_name == 'cygwin' or self.os_name == 'msys'):
            print("*** WARNING ***")
            print("AGVis is running on Windows. It is recommended to use Linux for production deployments.")
            print("Consider using a Linux-based operating system for improved performance and stability.")
            print("For more information, refer to the AGVis documentation: https://ltb.readthedocs.io/projects/agvis/en/latest/?badge=stable")
            print("\n")
            dev = True  

        if (static is not None):
            if not os.path.exists(static):
                print("Error: given file path does not exist. Exiting.")
                exit(1)
            else: self.app.static_folder = static

        # Print out the URL to access the application
        print(f"AGVis will serve static files from directory {self.app.static_folder}")
        print(f"at the URL http://{host}:{port}. Open your web browser and navigate to the URL to access the application.")
        print("\nStarting AGVis... Press Ctrl+C to stop.\n")

        try:
            if dev:
                self.run_dev_server(host, port)
            else:
                self.run_prod_server(host, port, workers)

        except KeyboardInterrupt:
            print('\nAGVis has been stopped. You may now close the browser.')
            
        except Exception as e:
            print(f'An unexpected error has occured while trying to start AGVis: {e}')