import os
import sys
import subprocess
from flask import Flask, render_template, send_from_directory
import requests

# flask_app = Flask(__name__)

class AgvisWeb():

    def __init__(self):
        self.os_name = sys.platform
        self.app = self.create_app()

    def create_app(self):
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


    def run(self, app_module, host='localhost', port=8810, workers=1):
        try:
            # Print out the URL to access the application
            print(f"AGVis will serve static files from directory \"{os.path.join(os.getcwd(), 'agvis/static')}\"")
            print(f"at the URL http://{host}:{port}. Open your web browser and navigate to the URL to access the application.")
            print("\nStarting AGVis... Press Ctrl+C to stop.\n")

            # Run flask as a development server if the operating system is Windows
            if (self.os_name == 'win32' or self.os_name == 'cygwin' or self.os_name == 'msys'):
                command = [
                    'flask',
                    'run',
                    '--host', host,
                    '--port', str(port),
                    '--no-reload'
                ]
            # Run flask as a production server if the operating system is Linux
            else:
                command = [
                    'gunicorn',
                    '-b', f'{host}:{port}',
                    '-w', str(workers),
                    '--timeout', '600',
                    app_module
                ]

            # Start the application
            with self.app.requests_session as session:
                subprocess.run(command, check=True)

        except KeyboardInterrupt:
            print('\nAGVis has been stopped. You may now close the browser.')
            
        except Exception as e:
            print(f'An unexpected error has occured while trying to start AGVis: {e}')

webapp = AgvisWeb()
app = webapp.app