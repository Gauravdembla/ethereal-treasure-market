#!/usr/bin/env python3
"""
Angels On Earth - Local Server Runner
Simple Python script to serve the application locally
"""

import http.server
import socketserver
import os
import webbrowser
import sys
from pathlib import Path

def main():
    print("🌟 Angels On Earth - Local Server")
    print("=================================")
    
    # Change to dist directory
    dist_path = Path(__file__).parent / "dist"
    if not dist_path.exists():
        print("❌ Error: 'dist' folder not found!")
        print("Please make sure you're running this from the project root.")
        sys.exit(1)
    
    os.chdir(dist_path)
    
    # Set up server
    PORT = 8080
    Handler = http.server.SimpleHTTPRequestHandler
    
    try:
        with socketserver.TCPServer(("", PORT), Handler) as httpd:
            print(f"✅ Server starting on port {PORT}")
            print(f"🌐 Open your browser and go to: http://localhost:{PORT}")
            print("📱 You should see the Angels On Earth website!")
            print("⏹️  Press Ctrl+C to stop the server")
            print("")
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🚀 Browser should open automatically...")
            except:
                print("💡 Please manually open: http://localhost:8080")
            
            print("")
            httpd.serve_forever()
            
    except OSError as e:
        if "Address already in use" in str(e):
            print(f"❌ Port {PORT} is already in use!")
            print("Try a different port or stop the other service.")
            
            # Try alternative port
            PORT = 3000
            print(f"🔄 Trying port {PORT}...")
            try:
                with socketserver.TCPServer(("", PORT), Handler) as httpd:
                    print(f"✅ Server starting on port {PORT}")
                    print(f"🌐 Open your browser: http://localhost:{PORT}")
                    httpd.serve_forever()
            except:
                print("❌ Port 3000 also in use. Please free up a port and try again.")
        else:
            print(f"❌ Error starting server: {e}")

if __name__ == "__main__":
    main()
