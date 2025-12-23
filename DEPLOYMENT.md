# Deployment Guide

This guide will help you deploy the Weight Tracker web app online.

## Recommended Platforms

### Option 1: Render (Recommended - Easiest)
**Free tier available** - Great for full-stack apps

### Option 2: Railway
**Free tier available** - Simple deployment

### Option 3: Vercel (Frontend) + Railway/Render (Backend)
**Free tier available** - Separate frontend and backend

---

## Deployment on Render (Recommended)

### Step 1: Prepare Your Code

1. **Make sure your code is in a Git repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to GitHub:**
   - Create a new repository on GitHub
   - Push your code:
     ```bash
     git remote add origin <your-github-repo-url>
     git push -u origin main
     ```

### Step 2: Deploy on Render

1. **Sign up/Login to Render:**
   - Go to: https://render.com
   - Sign up with GitHub

2. **Create a New Web Service:**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select your repository

3. **Configure the Service:**
   - **Name:** `weight-tracker` (or your choice)
   - **Environment:** `Node`
   - **Build Command:** `npm run install-all && npm run build`
   - **Start Command:** `npm start`
   - **Plan:** Free (or choose a paid plan)

4. **Set Environment Variables:**
   Click "Advanced" → "Add Environment Variable" and add:
   ```
   NODE_ENV=production
   PORT=10000
   JWT_SECRET=<your-secret-key-here>
   DB_PATH=./weight_tracker.db
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   EMAIL_TO=your-email@gmail.com
   ```

5. **Deploy:**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Your app will be live at: `https://weight-tracker.onrender.com` (or your custom domain)

### Step 3: Update Frontend API URL

After deployment, update the API URL in your frontend:

1. **Update `client/src/api.js`:**
   ```javascript
   const API_URL = process.env.NODE_ENV === 'production' 
     ? 'https://your-app.onrender.com/api'
     : '/api';
   ```

Or use environment variables (see below).

---

## Deployment on Railway

### Step 1: Install Railway CLI (Optional)
```bash
npm i -g @railway/cli
```

### Step 2: Deploy

1. **Sign up at:** https://railway.app
2. **Click "New Project"** → "Deploy from GitHub repo"
3. **Select your repository**
4. **Add Environment Variables** (same as Render above)
5. **Railway will auto-detect** Node.js and deploy

---

## Environment Variables Setup

### Required Variables:
- `NODE_ENV=production`
- `PORT` (usually auto-set by platform)
- `JWT_SECRET` (generate a secure random string)
- `DB_PATH=./weight_tracker.db`
- `EMAIL_HOST` (e.g., `smtp.gmail.com`)
- `EMAIL_PORT` (e.g., `587`)
- `EMAIL_USER` (your email)
- `EMAIL_PASS` (your app password)
- `EMAIL_TO` (recipient email)

### Generate JWT_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Important Notes

### Database Persistence
- **Render/Railway:** SQLite database files persist on the filesystem
- **For production:** Consider upgrading to PostgreSQL for better reliability
- Database is stored in the service's filesystem

### Email Configuration
- Make sure your email credentials are correct
- Use App Passwords for Gmail (not regular password)
- Test email functionality after deployment

### CORS
- The backend already has CORS enabled
- For production, you may want to restrict CORS to your domain:
  ```javascript
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'https://your-app.onrender.com'
  }));
  ```

### Build Process
- Frontend builds to `client/build`
- Backend serves static files in production
- Both run on the same server/port

---

## Post-Deployment Checklist

- [ ] Test login functionality
- [ ] Test weight logging
- [ ] Test email reminders
- [ ] Verify database persistence
- [ ] Check logs for any errors
- [ ] Test on mobile devices
- [ ] Set up custom domain (optional)

---

## Troubleshooting

### Build Fails
- Check Node.js version (needs >= 18)
- Verify all dependencies are in package.json
- Check build logs for specific errors

### Database Issues
- SQLite file should persist automatically
- Check file permissions
- Verify DB_PATH is correct

### Email Not Working
- Verify environment variables are set correctly
- Check email credentials
- Review server logs for email errors

### CORS Errors
- Update CORS origin to match your frontend URL
- Check API_URL in frontend code

---

## Quick Deploy Commands

```bash
# Install dependencies
npm run install-all

# Build frontend
npm run build

# Start production server
npm start
```

---

## Support

For issues:
1. Check Render/Railway logs
2. Verify environment variables
3. Test locally first with `NODE_ENV=production npm start`

