# Deploy Your App Now! 🚀

Your code is on GitHub: https://github.com/pshweta06/weight-tracker

## Quick Deploy Steps

### 1. Go to Render
👉 https://render.com

### 2. Sign Up/Login
- Click "Get Started for Free"
- Sign up with GitHub (use your GitHub account)

### 3. Create Web Service
- Click "New +" → "Web Service"
- Click "Connect account" if needed
- Find and select: **`pshweta06/weight-tracker`**
- Click "Connect"

### 4. Configure Settings

**Basic Settings:**
- **Name:** `weight-tracker`
- **Environment:** `Node`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** (leave empty)

**Build & Deploy:**
- **Build Command:** `npm run install-all && npm run build`
- **Start Command:** `npm start`

**Plan:**
- Select **Free** plan

### 5. Add Environment Variables

Click "Advanced" → Scroll to "Environment Variables" → Add these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `10000` |
| `JWT_SECRET` | `<paste-generated-secret-below>` |
| `DB_PATH` | `./weight_tracker.db` |
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_USER` | `pshweta06@gmail.com` |
| `EMAIL_PASS` | `<your-gmail-app-password>` |
| `EMAIL_TO` | `pshweta06@gmail.com` |

**Generate JWT_SECRET:**
Run this command and copy the output:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 6. Deploy!
- Click "Create Web Service"
- Wait 5-10 minutes for build and deployment
- Watch the logs to see progress

### 7. Your App is Live! 🎉

Once deployed, your app will be at:
`https://weight-tracker.onrender.com` (or your custom name)

---

## Test Your Deployment

1. **Visit your app URL**
2. **Test login:** `admin` / `admin123`
3. **Test weight logging**
4. **Test email** (go to Settings → Test Email)

---

## Troubleshooting

**Build taking too long?**
- First build can take 10-15 minutes
- Be patient!

**Build fails?**
- Check the build logs
- Make sure all environment variables are set
- Verify Node.js version (should be >= 18)

**Email not working?**
- Double-check EMAIL_USER and EMAIL_PASS
- Make sure you're using Gmail App Password (not regular password)

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Share your app URL with others
3. ✅ Set up custom domain (optional)
4. ✅ Monitor usage and logs

**Your app is ready to go live!** 🚀

