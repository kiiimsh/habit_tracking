import http.server
import socketserver
import json
import os
import urllib.parse

PORT = 3000
DATA_FILE = 'data/habits.json'

class HabitHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/api/data':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            if os.path.exists(DATA_FILE):
                with open(DATA_FILE, 'r') as f:
                    self.wfile.write(f.read().encode())
            else:
                self.wfile.write(json.dumps({"habits": [], "completionData": {}}).encode())
        else:
            # Serve static files for everything else
            return super().do_GET()

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        data = json.loads(post_data.decode())

        if self.path == '/api/habits':
            name = data.get('name')
            current_data = self.load_data()
            if name not in current_data['habits']:
                current_data['habits'].append(name)
                self.save_data(current_data)
                self.send_json_response(201, {"habits": current_data['habits']})
            else:
                self.send_json_response(400, {"error": "Already exists"})

        elif self.path == '/api/toggle':
            date = data.get('date')
            name = data.get('name')
            is_checked = data.get('isChecked')
            current_data = self.load_data()
            
            if date not in current_data['completionData']:
                current_data['completionData'][date] = []
            
            if is_checked:
                if name not in current_data['completionData'][date]:
                    current_data['completionData'][date].append(name)
            else:
                if name in current_data['completionData'][date]:
                    current_data['completionData'][date].remove(name)
            
            self.save_data(current_data)
            self.send_json_response(200, {"completionData": current_data['completionData']})

    def do_DELETE(self):
        if self.path.startswith('/api/habits/'):
            name = urllib.parse.unquote(self.path.replace('/api/habits/', ''))
            current_data = self.load_data()
            current_data['habits'] = [h for h in current_data['habits'] if h != name]
            self.save_data(current_data)
            self.send_json_response(200, {"habits": current_data['habits']})

    def load_data(self):
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        return {"habits": [], "completionData": {}}

    def save_data(self, data):
        os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)

    def send_json_response(self, status, data):
        self.send_response(status)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())

with socketserver.TCPServer(("", PORT), HabitHandler) as httpd:
    print(f"Server serving at port {PORT}")
    httpd.serve_forever()
