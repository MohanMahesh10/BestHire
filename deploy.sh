#!/bin/bash

echo "========================================"
echo " BestHire - GitHub Pages Deployment"
echo " Developed by MOHAN MAHESH 2025"
echo "========================================"
echo ""

echo "[1/4] Checking Git status..."
git status
echo ""

echo "[2/4] Building Next.js app for production..."
npm run export
if [ $? -ne 0 ]; then
    echo "ERROR: Build failed!"
    exit 1
fi
echo ""

echo "[3/4] Deploying to GitHub Pages..."
gh-pages -d out
if [ $? -ne 0 ]; then
    echo "ERROR: Deployment failed!"
    exit 1
fi
echo ""

echo "[4/4] Deployment complete!"
echo ""
echo "========================================"
echo " Your site will be live in 2-5 minutes"
echo " URL: https://YOUR_USERNAME.github.io/BestHire"
echo "========================================"
echo ""

