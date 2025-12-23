#!/bin/bash

# Script to push to GitHub with authentication
# Usage: ./push-with-auth.sh

echo "Pushing to GitHub..."
echo ""
echo "You'll be prompted for credentials:"
echo "Username: pshweta06"
echo "Password: Use your GitHub Personal Access Token (not your password)"
echo ""
echo "If you don't have a token, create one at:"
echo "https://github.com/settings/tokens"
echo ""
echo "Press Enter to continue..."
read

git push -u origin main

