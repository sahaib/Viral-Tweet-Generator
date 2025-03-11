#!/bin/bash

# Initialize Git repository if it doesn't exist
if [ ! -d .git ]; then
  echo "Initializing Git repository..."
  git init
  git add .
  git commit -m "Initial commit"
else
  echo "Git repository already exists."
fi

# Prepare for deployment
echo "Preparing for deployment..."
npm run prepare-deploy

# Set up the remote repository
echo "Setting up remote repository..."
git remote add origin https://github.com/sahaib/Viral-Tweet-Generator.git || git remote set-url origin https://github.com/sahaib/Viral-Tweet-Generator.git

# Instructions for pushing to GitHub and deploying to Vercel
echo ""
echo "=== DEPLOYMENT INSTRUCTIONS ==="
echo ""
echo "1. Push your code to GitHub:"
echo "   git push -u origin main"
echo ""
echo "2. Import your project in Vercel:"
echo "   - Go to https://vercel.com/new"
echo "   - Import your GitHub repository (https://github.com/sahaib/Viral-Tweet-Generator)"
echo "   - Add the following environment variables:"
echo "     - GROQ_API_KEY"
echo "     - OPENROUTER_API_KEY"
echo "     - NEWS_API_KEY"
echo "     - NEXT_PUBLIC_APP_URL (set to your Vercel deployment URL after deployment)"
echo ""
echo "3. Deploy your project!"
echo ""
echo "=== END OF INSTRUCTIONS ===" 