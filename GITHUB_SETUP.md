# 🚀 GitHub Setup & Deployment Guide

## Quick Start - Upload to GitHub

### Step 1: Install gh-pages Package

```bash
npm install --save-dev gh-pages
```

### Step 2: Initialize Git Repository

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: BestHire AI Recruitment Platform"
```

### Step 3: Create GitHub Repository

1. Go to: https://github.com/new
2. **Repository name**: `besthire` (or your preferred name)
3. **Description**: `AI-Powered Recruitment Platform - Smart Resume Parsing & Candidate Matching`
4. **Visibility**: Choose Public or Private
5. **DO NOT** check "Initialize with README" (you already have one)
6. Click **"Create repository"**

### Step 4: Link Local to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/besthire.git

# Push code
git branch -M main
git push -u origin main
```

### Step 5: Deploy to GitHub Pages (Optional)

```bash
# Build and deploy
npm run deploy
```

### Step 6: Enable GitHub Pages

1. Go to your repository: `https://github.com/YOUR_USERNAME/besthire`
2. Click **"Settings"** tab
3. Scroll to **"Pages"** section (left sidebar)
4. Under "Source":
   - Branch: Select `gh-pages`
   - Folder: `/ (root)`
5. Click **"Save"**
6. Wait 2-5 minutes

Your site will be live at: `https://YOUR_USERNAME.github.io/besthire`

---

## Alternative: Deploy to Vercel (Recommended)

Vercel is optimized for Next.js and requires zero configuration!

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

### Option B: Vercel Dashboard

1. Go to: https://vercel.com/new
2. Click **"Import Git Repository"**
3. Select your GitHub repository
4. Click **"Deploy"**
5. Done! Your site is live

---

## Repository Details

### Update Repository Info

After creating on GitHub, update these files:

**README.md** - Replace placeholders:
- `YOUR_USERNAME` → your GitHub username
- `your-email@example.com` → your email
- Add screenshots to `docs/screenshots/`

**package.json** - Add repository info:
```json
{
  "name": "besthire",
  "version": "1.0.0",
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/besthire.git"
  },
  "author": "MOHAN MAHESH",
  "license": "PROPRIETARY"
}
```

### Add Topics (Tags)

On GitHub repository page:
1. Click ⚙️ (gear icon) next to "About"
2. Add topics: `recruitment`, `ai`, `nextjs`, `typescript`, `resume-parser`, `machine-learning`
3. Save changes

---

## Commands Summary

```bash
# Install dependencies
npm install

# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Run production server

# Deployment
npm run export       # Export static files
npm run deploy       # Deploy to GitHub Pages

# Code Quality
npm run lint         # Run linter
```

---

## File Structure

```
besthire/
├── .git/                    # Git repository
├── .gitignore              # Git ignore rules
├── README.md               # Main documentation
├── CONTRIBUTING.md         # Contribution guidelines
├── DEPLOYMENT.md           # Deployment guide
├── package.json            # Dependencies
├── src/                    # Source code
├── public/                 # Static files
└── node_modules/           # Dependencies (ignored)
```

---

## Troubleshooting

### Issue: "git push" fails with authentication

**Solution 1**: Use Personal Access Token
1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`
4. Use token as password

**Solution 2**: Use SSH
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Add to GitHub: Settings → SSH Keys → New SSH key

# Change remote to SSH
git remote set-url origin git@github.com:YOUR_USERNAME/besthire.git
```

### Issue: GitHub Pages not working

1. Check if `gh-pages` branch exists
2. Verify Pages settings in repository
3. Wait 5-10 minutes
4. Check Actions tab for deployment status

### Issue: "gh-pages: command not found"

```bash
# Reinstall gh-pages
npm install --save-dev gh-pages

# Or run directly
npx gh-pages -d .next
```

---

## Next Steps After Upload

1. ✅ Add repository description on GitHub
2. ✅ Add topics/tags
3. ✅ Enable Issues (Settings → Features)
4. ✅ Add LICENSE file (if needed)
5. ✅ Create releases/tags
6. ✅ Add screenshots to README
7. ✅ Set up GitHub Actions (optional)

---

## Security

### Sensitive Data

**NEVER commit:**
- `.env` files with API keys
- `node_modules/`
- Personal data

**Always use:**
- `.gitignore` to exclude sensitive files
- Environment variables for secrets
- GitHub Secrets for Actions

---

## Resources

- **GitHub Docs**: https://docs.github.com
- **GitHub Pages**: https://pages.github.com
- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs

---

## Support

Need help?
- 📧 Email: support@besthire.com
- 🐛 Issues: https://github.com/YOUR_USERNAME/besthire/issues
- 📖 Docs: See DEPLOYMENT.md

---

**Ready to deploy?** Follow the steps above! 🚀

© 2025 MOHAN MAHESH. All rights reserved.

