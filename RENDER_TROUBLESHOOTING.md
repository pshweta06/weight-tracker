# Render Deployment Troubleshooting

## Common Error: Build Directory Not Found

If you're getting: `ENOENT: no such file or directory, stat '/opt/render/project/src/client/build/index.html'`

### Solution 1: Check Build Command in Render

1. **Go to Render Dashboard**
2. **Click on your service**
3. **Go to "Settings" tab**
4. **Check "Build Command"** - Should be:
   ```
   npm run install-all && npm run build
   ```
5. **Check "Start Command"** - Should be:
   ```
   npm start
   ```

### Solution 2: Verify Build Runs Successfully

1. **Go to "Logs" tab in Render**
2. **Look for build output**
3. **Check if you see:**
   ```
   ✓ built in X.XXs
   ```
4. **If build fails, check for errors**

### Solution 3: Check Environment Variables

Make sure these are set:
- `NODE_ENV=production` ✅ **CRITICAL**
- `PORT=10000` (or let Render auto-set)
- `JWT_SECRET=<your-secret>`
- All email variables

### Solution 4: Manual Build Verification

In Render logs, you should see:
```
> weight-tracker@1.0.0 build
> cd client && npm run build

vite v7.x.x building for production...
✓ built in X.XXs
```

If you don't see this, the build isn't running.

### Solution 5: Check Working Directory

Render might be running from a different directory. The server code now checks for build directory and logs the path.

Check Render logs for:
```
Build directory not found at: /opt/render/project/src/client/build
```

This will tell you the actual path Render is using.

---

## Quick Fix Checklist

- [ ] Build Command: `npm run install-all && npm run build`
- [ ] Start Command: `npm start`
- [ ] `NODE_ENV=production` is set
- [ ] Build completes successfully (check logs)
- [ ] `client/build/index.html` exists after build

---

## Still Not Working?

1. **Check Render Build Logs** - Look for any errors
2. **Verify Build Output** - Should see `✓ built` message
3. **Check File Structure** - Build should create `client/build/` directory
4. **Try Clean Deploy** - Delete service and recreate

---

## Alternative: Use Railway Instead

If Render continues to have issues:

1. Go to: https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Railway auto-detects and deploys!

