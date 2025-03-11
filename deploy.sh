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

# Check current branch name
BRANCH_NAME=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
echo "Current branch: $BRANCH_NAME"

# If no commits exist yet, create an initial commit
if [ -z "$(git log -1 2>/dev/null)" ]; then
  echo "No commits found. Creating initial commit..."
  git add .
  git commit -m "Initial commit"
fi

# Instructions for pushing to GitHub and deploying to Vercel
echo ""
echo "=== DEPLOYMENT INSTRUCTIONS ==="
echo ""
echo "1. Push your code to GitHub:"
if [ "$BRANCH_NAME" = "main" ]; then
  echo "   git push -u origin main"
elif [ "$BRANCH_NAME" = "master" ]; then
  echo "   Option 1: Push to master branch:"
  echo "   git push -u origin master"
  echo ""
  echo "   Option 2: Rename to main branch and push:"
  echo "   git branch -M main"
  echo "   git push -u origin main"
else
  echo "   First, create and switch to main branch:"
  echo "   git checkout -b main"
  echo "   Then push to GitHub:"
  echo "   git push -u origin main"
fi
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