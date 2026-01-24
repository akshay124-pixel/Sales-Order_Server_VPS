#!/bin/bash

echo "🚀 Starting Sales Order Deployment..."

cd /www/wwwroot/Sales_Order-Server || exit 1

echo "🧹 Cleaning code only (preserving Uploads folder)..."
git reset --hard
git clean -fd -e Uploads

echo "⬇️ Pulling latest code..."
git pull origin main

echo "📦 Installing dependencies..."
rm -rf node_modules
npm install --production

echo "🔁 Restarting PM2 service..."
pm2 restart sales_order

echo "✅ Sales Order Deployment completed successfully!"
