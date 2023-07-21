import subprocess
from flask import Flask, render_template, send_from_directory
import requests

app = Flask(__name__)
app.requests_session = requests.Session()

def run_app(app_module, host='localhost', port=8810, workers=1):
    command = [
        'gunicorn',
        '-b', f'{host}:{port}',
        '-w', str(workers),
        app_module
    ]
    
    subprocess.run(command)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    run_app()