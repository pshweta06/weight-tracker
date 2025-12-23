# Quick Deployment Guide

## Deploy to Render (Easiest - Recommended)

### Step 1: Push to GitHub
```bash
git init
git add .
git commit -m "Ready for deployment"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Deploy on Render

1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Click "New +" → "Web Service"**
4. **Connect your GitHub repo**
5. **Configure:**
   - **Name:** `weight-tracker`
   - **Environment:** `Node`
   - **Build Command:** `npm run install-all && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. **Add Environment Variables:**
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=<generate-with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
   DB_PATH=./weight_tracker.db
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_TO=your-email@gmail.com
   ```

7. **Click "Create Web Service"**
8. **Wait 5-10 minutes** for deployment
9. **Your app is live!** 🎉

### Step 3: Test Your Deployment

- Visit your Render URL (e.g., `https://weight-tracker.onrender.com`)
- Test login: `admin` / `admin123`
- Test weight logging
- Test email functionality

---

## Alternative: Railway

1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **Click "New Project" → "Deploy from GitHub repo"**
4. **Select your repo**
5. **Add same environment variables** as above
6. **Railway auto-detects** and deploys!

---

## Important Notes

- **Database:** SQLite file persists automatically on Render/Railway
- **Email:** Make sure to use Gmail App Password (not regular password)
- **Free Tier:** Render free tier spins down after 15 min inactivity (wakes up on first request)
- **Custom Domain:** You can add a custom domain in Render settings

---

## Troubleshooting

**Build fails?**
- Check Node.js version (needs >= 18)
- Verify all dependencies in package.json

**Email not working?**
- Double-check EMAIL_USER and EMAIL_PASS
- Use App Password for Gmail

**Database issues?**
- SQLite file should persist automatically
- Check logs if issues occur

---

## Need Help?

Check the full `DEPLOYMENT.md` file for detailed instructions!

