#!/usr/bin/env python3
"""
Proxy server for PHP API with static file serving
Handles both API requests and static files
"""

import http.server
import socketserver
import subprocess
import os
import mimetypes
import urllib.request
import urllib.error

PORT = 8000
PHP_PORT = 8080
API_DIR = os.path.dirname(os.path.abspath(__file__))

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    daemon_threads = True
    allow_reuse_address = True

class ProxyHandler(http.server.BaseHTTPRequestHandler):
    def send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_cors_headers()
        self.end_headers()
    
    def do_GET(self):
        path = self.path.split('?')[0]
        
        # Serve static files
        if path.startswith('/uploads/'):
            self.serve_static_file(path)
        else:
            self.proxy_to_php()
    
    def do_POST(self):
        self.proxy_to_php()
    
    def do_PUT(self):
        self.proxy_to_php()
    
    def do_DELETE(self):
        self.proxy_to_php()
    
    def serve_static_file(self, path):
        file_path = os.path.join(API_DIR, path.lstrip('/'))
        
        if not os.path.isfile(file_path):
            self.send_error(404, 'File not found')
            return
        
        try:
            content_type, _ = mimetypes.guess_type(file_path)
            if content_type is None:
                content_type = 'application/octet-stream'
            
            file_size = os.path.getsize(file_path)
            
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(file_size))
            self.send_cors_headers()
            self.send_header('Cache-Control', 'public, max-age=86400')
            self.end_headers()
            
            with open(file_path, 'rb') as f:
                while True:
                    chunk = f.read(8192)
                    if not chunk:
                        break
                    self.wfile.write(chunk)
        except Exception as e:
            print(f"Error serving file: {e}")
    
    def proxy_to_php(self):
        try:
            url = f'http://127.0.0.1:{PHP_PORT}{self.path}'
            
            # Read request body if present
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length) if content_length > 0 else None
            
            # Create request
            req = urllib.request.Request(url, data=body, method=self.command)
            
            # Copy headers
            for header, value in self.headers.items():
                if header.lower() not in ['host', 'content-length']:
                    req.add_header(header, value)
            
            # Make request to PHP
            with urllib.request.urlopen(req, timeout=30) as response:
                self.send_response(response.status)
                
                # Track if CORS headers already sent by PHP
                cors_sent = False
                
                for header, value in response.headers.items():
                    header_lower = header.lower()
                    if header_lower not in ['transfer-encoding', 'connection']:
                        # Skip CORS headers from PHP, we'll add our own
                        if header_lower.startswith('access-control-'):
                            cors_sent = True
                            continue
                        self.send_header(header, value)
                
                # Always add our CORS headers (only once)
                self.send_cors_headers()
                self.end_headers()
                
                self.wfile.write(response.read())
                
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.send_cors_headers()
            self.end_headers()
            self.wfile.write(e.read())
        except Exception as e:
            print(f"Proxy error: {e}")
            self.send_error(502, f'Bad Gateway: {e}')
    
    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {args[0]}")

if __name__ == '__main__':
    mimetypes.init()
    mimetypes.add_type('image/webp', '.webp')
    
    # Set environment variables for PHP
    os.environ['JWT_SECRET'] = 'yemen_cars_super_secret_key_2026_minimum_32_chars'
    os.environ['APP_ENV'] = 'development'
    
    # Start PHP server in background with environment
    print(f"Starting PHP server on port {PHP_PORT}...")
    php_process = subprocess.Popen(
        ['php', '-S', f'127.0.0.1:{PHP_PORT}', '-t', API_DIR],
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        env={**os.environ}
    )
    
    print(f"Starting proxy server on http://0.0.0.0:{PORT}")
    print(f"API requests proxied to PHP on port {PHP_PORT}")
    print(f"Static files served from {API_DIR}")
    
    try:
        with ThreadedHTTPServer(("0.0.0.0", PORT), ProxyHandler) as httpd:
            httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        php_process.terminate()
