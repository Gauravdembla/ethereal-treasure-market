#!/bin/bash

# Angels On Earth - Download and Run Script
echo "🌟 Angels On Earth - Setup Script"
echo "=================================="

# Create a zip file of the built application
echo "📦 Creating deployment package..."
cd /mnt/persist/workspace
tar -czf angels-on-earth-app.tar.gz dist/ package.json README.md

echo "✅ Package created: angels-on-earth-app.tar.gz"
echo ""
echo "📋 INSTRUCTIONS:"
echo "1. Download the file 'angels-on-earth-app.tar.gz' from this container"
echo "2. Extract it on your local machine"
echo "3. Open terminal in the extracted folder"
echo "4. Run: npx serve dist -l 8080"
echo "5. Open browser: http://localhost:8080"
echo ""
echo "🌐 Alternative - Quick Deploy:"
echo "1. Extract the package"
echo "2. Upload the 'dist' folder to:"
echo "   - Netlify.com (drag & drop)"
echo "   - Vercel.com (import project)"
echo "   - Any web hosting service"
echo ""
echo "📁 Package contents:"
ls -la angels-on-earth-app.tar.gz
echo ""
echo "🎯 The application is ready to run!"
