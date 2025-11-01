#!/bin/bash

# Quick Deploy to Hostinger VPS
# This script copies the deployment script and provides instructions

VPS_IP="91.108.105.252"
MONGODB_URI="mongodb+srv://connect_db_user:bl2JT2Wc3Bacj5Lb@cluster0.6pjokiu.mongodb.net/ethereal-treasure"

echo "=========================================="
echo "🚀 Deploying to Hostinger VPS"
echo "=========================================="
echo ""
echo "VPS IP: $VPS_IP"
echo ""

# Step 1: Copy deployment script
echo "📦 Step 1: Copying deployment script to VPS..."
echo ""
scp DEPLOY_DEVELOPMENT_BRANCH.sh root@$VPS_IP:/root/

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Script copied successfully!"
    echo ""
    echo "=========================================="
    echo "📋 Next Steps:"
    echo "=========================================="
    echo ""
    echo "1. SSH into your VPS:"
    echo "   ssh root@$VPS_IP"
    echo ""
    echo "2. Run the deployment script:"
    echo "   bash /root/DEPLOY_DEVELOPMENT_BRANCH.sh $VPS_IP $VPS_IP \"$MONGODB_URI\""
    echo ""
    echo "3. Wait 5-10 minutes for deployment to complete"
    echo ""
    echo "4. Access your site at: http://$VPS_IP"
    echo ""
    echo "=========================================="
    echo ""
    echo "💡 Tip: The script will ask for SSL installation."
    echo "   Press 'n' to skip for now (you can add it later)"
    echo ""
else
    echo ""
    echo "❌ Failed to copy script. Please check:"
    echo "   - VPS IP is correct: $VPS_IP"
    echo "   - You have SSH access"
    echo "   - Root password is correct"
    echo ""
fi

