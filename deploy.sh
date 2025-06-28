#!/bin/bash

# Martingale Calculator Deployment Script

echo "🚀 Starting deployment process..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the project
echo "🔨 Building the project..."
npm run build

# Check if build was successful
if [ ! -d "dist/spa" ]; then
    echo "❌ Error: Build failed. dist/spa directory not found."
    exit 1
fi

# Deploy to GitHub Pages
echo "🌐 Deploying to GitHub Pages..."
npx gh-pages -d dist/spa

echo "✅ Deployment completed successfully!"
echo "🌍 Your app should be available at: https://[username].github.io/martingale-calculator/" 