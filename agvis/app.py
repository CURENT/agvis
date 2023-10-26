import os
import sys
import subprocess
from flask import Flask, render_template, send_from_directory
import requests

# Grab the operating system
os_name = sys.platform
file_dir = os.path.dirname(os.path.abspath(__file__))

# Create the Flask application
app = Flask(__name__)
app.requests_session = requests.Session()

def run_app(app_module, host='localhost', port=8810, workers=1):
    try:
        # Print out the URL to access the application
        print(f"AGVis will serve static files from directory \"{os.path.join(os.getcwd(), 'agvis/static')}\"")
        print(f"at the URL http://{host}:{port}. Open your web browser and navigate to the URL to access the application.")
        print("\nStarting AGVis... Press Ctrl+C to stop.\n")

        # Run flask as a development server if the operating system is Windows
        if (os_name == 'win32' or os_name == 'cygwin' or os_name == 'msys'):
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
                app_module
            ]

        with app.requests_session as session:
            p = subprocess.Popen(command, shell=False, cwd=file_dir)
            p.wait()

    except KeyboardInterrupt:
        print('\nAGVis has been stopped. You may now close the browser.')
    except Exception as e:
        print(f'An unexpected error occured while trying to start AGVis: {e}')

# Serve index.html
@app.route('/')
def index():
    return render_template('index.html')

# Serve static files
@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    return send_from_directory('static', path)

# Run the application
if __name__ == '__main__':
    run_app()