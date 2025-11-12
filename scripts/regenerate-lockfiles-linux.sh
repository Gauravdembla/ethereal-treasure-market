#!/bin/bash

# Regenerate package-lock.json files for Linux x64 platform
# This script should be run on a Linux x64 machine or in a Linux container
# to ensure the lockfiles don't contain platform-specific packages for macOS

set -e

echo "=========================================="
echo "🔧 Regenerating lockfiles for Linux x64"
echo "=========================================="
echo ""

# Check if we're on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "⚠️  WARNING: This script should be run on Linux x64"
    echo "   Current OS: $OSTYPE"
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_ROOT"

echo "→ Project root: $PROJECT_ROOT"
echo ""

# Step 1: Clean root lockfile
echo "→ Step 1: Regenerating root package-lock.json..."
rm -f package-lock.json
rm -rf node_modules
npm install
echo "✓ Root lockfile regenerated"
echo ""

# Step 2: Clean frontend lockfile
echo "→ Step 2: Regenerating frontend/package-lock.json..."
cd frontend
rm -f package-lock.json
rm -rf node_modules
npm install
cd ..
echo "✓ Frontend lockfile regenerated"
echo ""

# Step 3: Clean backend lockfile
echo "→ Step 3: Regenerating backend/package-lock.json..."
cd backend
rm -f package-lock.json
rm -rf node_modules
npm install
cd ..
echo "✓ Backend lockfile regenerated"
echo ""

# Step 4: Verify no platform-specific packages
echo "→ Step 4: Verifying no macOS-specific packages..."
echo ""

DARWIN_FOUND=0

if grep -r "@rollup/rollup-darwin" package-lock.json 2>/dev/null; then
    echo "⚠️  Found darwin-specific packages in root package-lock.json"
    DARWIN_FOUND=1
fi

if grep -r "@rollup/rollup-darwin" frontend/package-lock.json 2>/dev/null; then
    echo "⚠️  Found darwin-specific packages in frontend/package-lock.json"
    DARWIN_FOUND=1
fi

if grep -r "@rollup/rollup-darwin" backend/package-lock.json 2>/dev/null; then
    echo "⚠️  Found darwin-specific packages in backend/package-lock.json"
    DARWIN_FOUND=1
fi

if [ $DARWIN_FOUND -eq 0 ]; then
    echo "✓ No darwin-specific packages found"
else
    echo ""
    echo "⚠️  WARNING: Platform-specific packages still present!"
    echo "   This may cause deployment issues on Linux servers."
fi

echo ""
echo "=========================================="
echo "✅ Lockfile regeneration complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review the changes:"
echo "   git diff package-lock.json"
echo "   git diff frontend/package-lock.json"
echo "   git diff backend/package-lock.json"
echo ""
echo "2. Commit the new lockfiles:"
echo "   git add package-lock.json frontend/package-lock.json backend/package-lock.json"
echo "   git commit -m 'Regenerate lockfiles for Linux x64 platform'"
echo ""
echo "3. Push to remote:"
echo "   git push origin main"
echo ""

