# Fix: Build Files Not Found Error

## Problem
Error: "Build files not found. Please ensure the frontend is built."

This means the build command isn't running successfully in Render.

## Solution

### Step 1: Verify Build Command in Render

1. **Go to Render Dashboard**
2. **Click your service** (`weight-tracker`)
3. **Go to "Settings" tab**
4. **Check "Build Command"** - Should be EXACTLY:
   ```
   npm run install-all && npm run build
   ```
5. **Check "Start Command"** - Should be:
   ```
   npm start
   ```

### Step 2: Check Build Logs

1. **Go to "Logs" tab**
2. **Look for build output** - You should see:
   ```
   > weight-tracker@1.0.0 build
   > cd client && npm run build
   
   vite v7.x.x building for production...
   ✓ built in X.XXs
   ```
3. **If you don't see this**, the build isn't running

### Step 3: Common Issues

#### Issue 1: Build Command Not Running
**Fix:** Make sure Build Command is set correctly:
```
npm run install-all && npm run build
```

#### Issue 2: Build Fails Silently
**Check logs for:**
- npm install errors
- Vite build errors
- Missing dependencies

#### Issue 3: Build Runs But Files Not Found
**The server now checks multiple paths** and logs which one it finds.

### Step 4: Manual Build Test

To test locally:
```bash
npm run install-all
npm run build
ls -la client/build/index.html
```

If this works locally but not on Render, it's a Render configuration issue.

---

## Updated Code

I've updated the code to:
- ✅ Check multiple possible build paths
- ✅ Log diagnostic information
- ✅ Verify build exists before starting server
- ✅ Better error messages

---

## Render Build Command Checklist

Make sure in Render Settings:

- [ ] **Build Command:** `npm run install-all && npm run build`
- [ ] **Start Command:** `npm start`
- [ ] **Root Directory:** (leave empty)
- [ ] **Environment:** `Node`
- [ ] **Node Version:** 18+ (auto-detected)

---

## After Fixing

1. **Update Build Command** in Render settings
2. **Save changes**
3. **Trigger manual deploy**
4. **Check logs** - should see build output
5. **Verify** - app should load

---

## Still Not Working?

Check Render logs for:
- Build command output
- Any error messages
- Whether `client/build/index.html` exists after build

The server now logs the exact path it's checking, which will help debug.

