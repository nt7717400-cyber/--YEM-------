#!/usr/bin/env python3
"""
Multi-threaded HTTP server for serving static files
Handles concurrent connections better than the default http.server
"""

import http.server
import socketserver
import os
import sys
import mimetypes

PORT = 8001
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

class ThreadedHTTPServer(socketserver.ThreadingMixIn, http.server.HTTPServer):
    """Handle requests in a separate thread."""
    daemon_threads = True
    allow_reuse_address = True

class CORSRequestHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP request handler with CORS support."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def do_GET(self):
        """Handle GET requests with proper streaming."""
        # Parse the path
        path = self.translate_path(self.path.split('?')[0])
        
        if os.path.isfile(path):
            # Get file info
            file_size = os.path.getsize(path)
            
            # Determine content type
            content_type, _ = mimetypes.guess_type(path)
            if content_type is None:
                content_type = 'application/octet-stream'
            
            # Send response headers
            self.send_response(200)
            self.send_header('Content-Type', content_type)
            self.send_header('Content-Length', str(file_size))
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            self.send_header('Cache-Control', 'public, max-age=86400')
            self.send_header('Connection', 'keep-alive')
            self.end_headers()
            
            # Stream the file
            try:
                with open(path, 'rb') as f:
                    while True:
                        chunk = f.read(65536)  # 64KB chunks
                        if not chunk:
                            break
                        self.wfile.write(chunk)
            except (BrokenPipeError, ConnectionResetError):
                pass
        else:
            super().do_GET()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', '*')
        self.end_headers()
    
    def log_message(self, format, *args):
        """Log messages."""
        print(f"[{self.log_date_time_string()}] {args[0]}")

if __name__ == '__main__':
    os.chdir(DIRECTORY)
    
    # Initialize mimetypes
    mimetypes.init()
    mimetypes.add_type('image/webp', '.webp')
    
    with ThreadedHTTPServer(("0.0.0.0", PORT), CORSRequestHandler) as httpd:
        print(f"Static file server running at http://0.0.0.0:{PORT}")
        print(f"Directory: {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down...")
            httpd.shutdown()
