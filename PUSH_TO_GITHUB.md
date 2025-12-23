# Push to GitHub - Authentication Required

## Option 1: Use Personal Access Token (Recommended)

### Step 1: Create Personal Access Token

1. **Go to GitHub Settings:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - **Note:** Give it a name like "Weight Tracker"
   - **Expiration:** Choose 90 days or No expiration
   - **Select scopes:** Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **IMPORTANT:** Copy the token immediately (you won't see it again!)

### Step 2: Push Using Token

Run this command (it will prompt for username and password):

```bash
git push -u origin main
```

When prompted:
- **Username:** `pshweta06`
- **Password:** Paste your Personal Access Token (NOT your GitHub password)

---

## Option 2: Use SSH (Alternative)

### Step 1: Set up SSH Key

1. **Check if you have SSH key:**
   ```bash
   ls -al ~/.ssh
   ```

2. **Generate SSH key (if needed):**
   ```bash
   ssh-keygen -t ed25519 -C "your_email@example.com"
   ```
   Press Enter to accept default location, then set a passphrase (optional)

3. **Add SSH key to GitHub:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output, then:
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your key and save

### Step 2: Change Remote to SSH

```bash
git remote set-url origin git@github.com:pshweta06/weight-tracker.git
git push -u origin main
```

---

## Option 3: Use GitHub CLI (Easiest)

1. **Install GitHub CLI:**
   ```bash
   brew install gh
   ```

2. **Authenticate:**
   ```bash
   gh auth login
   ```

3. **Push:**
   ```bash
   git push -u origin main
   ```

---

## Quick Push (After Authentication)

Once authenticated, you can push with:

```bash
git push -u origin main
```

For future updates:
```bash
git add .
git commit -m "Your commit message"
git push
```

