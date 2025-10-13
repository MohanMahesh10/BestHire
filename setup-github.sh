#!/bin/bash

# BestHire - GitHub Setup Script
# This script helps you quickly set up and push to GitHub

echo "🚀 BestHire - GitHub Setup"
echo "=========================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "📝 Please enter your GitHub username:"
read github_username

echo ""
echo "📝 Please enter your repository name (press Enter for 'besthire'):"
read repo_name
repo_name=${repo_name:-besthire}

echo ""
echo "🔄 Initializing Git repository..."
git init

echo "✅ Adding files..."
git add .

echo "✅ Creating initial commit..."
git commit -m "Initial commit: BestHire AI Recruitment Platform by MOHAN MAHESH"

echo "✅ Adding remote origin..."
git remote add origin https://github.com/$github_username/$repo_name.git

echo "✅ Setting main branch..."
git branch -M main

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create a repository on GitHub:"
echo "   https://github.com/new"
echo "   Name: $repo_name"
echo "   Description: AI-Powered Recruitment Platform"
echo ""
echo "2. Then run:"
echo "   git push -u origin main"
echo ""
echo "3. (Optional) Deploy to GitHub Pages:"
echo "   npm run deploy"
echo ""
echo "Your repository URL will be:"
echo "https://github.com/$github_username/$repo_name"
echo ""
echo "GitHub Pages URL will be:"
echo "https://$github_username.github.io/$repo_name"
echo ""
echo "🌟 Thank you for using BestHire!"
echo "© 2025 MOHAN MAHESH. All rights reserved."

