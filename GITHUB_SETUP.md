# GitHub Setup Guide

## Step 1: Create GitHub Repository

1. **Go to GitHub:**
   - Visit: https://github.com/new
   - Or click the "+" icon → "New repository"

2. **Repository Settings:**
   - **Repository name:** `weight-tracker` (or your choice)
   - **Description:** "Daily weight tracking web application"
   - **Visibility:** Public or Private (your choice)
   - **DO NOT** initialize with README, .gitignore, or license (we already have files)
   - Click **"Create repository"**

3. **Copy the repository URL:**
   - You'll see a URL like: `https://github.com/yourusername/weight-tracker.git`
   - Copy this URL

## Step 2: Connect and Push

After creating the repository, run these commands:

```bash
# Add the remote repository (replace with your actual URL)
git remote add origin https://github.com/yourusername/weight-tracker.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## Quick Commands

If you've already created the repository, just run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

Replace:
- `YOUR_USERNAME` with your GitHub username
- `YOUR_REPO_NAME` with your repository name

## Troubleshooting

**"remote origin already exists"?**
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
```

**Authentication issues?**
- Use GitHub Personal Access Token instead of password
- Or use SSH: `git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git`

**Need to update later?**
```bash
git add .
git commit -m "Your commit message"
git push
```

