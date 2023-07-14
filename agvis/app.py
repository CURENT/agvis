from flask import Flask, render_template, send_from_directory
import requests

# gunicorn agvis.app:app -w=1 -b localhost:8810
# dime -vv -l unix:/tmp/dime2 -l ws:8818
# andes run wecc.xlsx -r tds --dime-address ipc:///tmp/dime2

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