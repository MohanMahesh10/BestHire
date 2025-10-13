# Deployment Guide - BestHire

## GitHub Pages Deployment

### Prerequisites
- GitHub account
- Git installed locally
- BestHire repository ready

### Step-by-Step Instructions

#### 1. Prepare Your Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - BestHire v1.0"
```

#### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `besthire`
3. Description: "AI-Powered Recruitment Platform"
4. Public or Private (your choice)
5. **Do NOT** initialize with README (you already have one)
6. Click "Create repository"

#### 3. Push to GitHub

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/besthire.git

# Push to main branch
git branch -M main
git push -u origin main
```

#### 4. Configure for GitHub Pages (Static Export)

Add to `package.json`:

```json
{
  "scripts": {
    "export": "next build && next export",
    "deploy": "npm run export && gh-pages -d out"
  }
}
```

Install gh-pages:

```bash
npm install --save-dev gh-pages
```

#### 5. Update next.config.js

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/besthire' : '',
}

module.exports = nextConfig
```

#### 6. Deploy to GitHub Pages

```bash
# Build and deploy
npm run deploy
```

#### 7. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings"
3. Scroll to "Pages"
4. Source: Deploy from branch
5. Branch: `gh-pages` / `root`
6. Click "Save"

#### 8. Access Your Site

Your site will be available at:
```
https://YOUR_USERNAME.github.io/besthire
```

---

## Alternative: Vercel Deployment (Recommended)

### Why Vercel?
- ✅ Optimized for Next.js
- ✅ Automatic deployments
- ✅ Free SSL
- ✅ Global CDN
- ✅ No configuration needed

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

Or use the Vercel dashboard:
1. Go to https://vercel.com
2. Click "Import Project"
3. Import from GitHub
4. Select your repository
5. Click "Deploy"

---

## Alternative: Netlify Deployment

1. Go to https://netlify.com
2. Click "Add new site" → "Import existing project"
3. Connect to GitHub
4. Select your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
6. Click "Deploy"

---

## Environment Variables

For production deployments with Gemini API:

### Vercel
1. Go to Project Settings
2. Environment Variables
3. Add: `NEXT_PUBLIC_GEMINI_API_KEY`

### Netlify
1. Site settings → Environment
2. Add variable: `NEXT_PUBLIC_GEMINI_API_KEY`

### GitHub Pages
API keys should be entered via the setup page (not in environment)

---

## Custom Domain (Optional)

### For GitHub Pages:
1. Add `CNAME` file to `public/` folder
2. Content: `yourdomain.com`
3. Configure DNS:
   - Type: `A`
   - Host: `@`
   - Value: GitHub Pages IPs

### For Vercel/Netlify:
1. Go to domain settings
2. Add custom domain
3. Follow DNS configuration instructions

---

## Troubleshooting

### Build Failures
```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### GitHub Pages 404
- Check `basePath` in next.config.js
- Ensure `gh-pages` branch exists
- Wait 5-10 minutes for deployment

### Vercel/Netlify Issues
- Check build logs
- Verify environment variables
- Check Next.js version compatibility

---

## Maintenance

### Update Deployment
```bash
# Make changes
git add .
git commit -m "Update: description"
git push origin main

# For GitHub Pages, also run:
npm run deploy
```

### Rollback
```bash
# Vercel
vercel rollback

# GitHub Pages
git revert HEAD
npm run deploy
```

---

## Support

For deployment issues:
- GitHub Pages: https://docs.github.com/pages
- Vercel: https://vercel.com/docs
- Netlify: https://docs.netlify.com

---

**Need help?** Open an issue on GitHub!

