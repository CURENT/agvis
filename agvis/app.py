from flask import Flask, render_template, request, jsonify, send_file, send_from_directory, abort
import requests

app = Flask(__name__)
app.requests_session = requests.Session()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run()

    