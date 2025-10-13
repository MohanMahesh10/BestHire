# Deploy BestHire to GitHub Pages

## Quick Deployment Guide

Follow these steps to deploy BestHire to GitHub Pages:

### Step 1: Initialize Git Repository (if not done)

```bash
git init
git add .
git commit -m "Initial commit: BestHire AI Recruitment Platform"
```

### Step 2: Create GitHub Repository

1. Go to [https://github.com/new](https://github.com/new)
2. **Repository name**: `BestHire` (or your preferred name)
3. **Description**: "AI-Powered Recruitment Platform"
4. **Visibility**: Public (required for free GitHub Pages)
5. **Do NOT** check "Initialize with README" (you already have one)
6. Click **"Create repository"**

### Step 3: Connect to GitHub

Replace `YOUR_USERNAME` with your GitHub username:

```bash
git remote add origin https://github.com/YOUR_USERNAME/BestHire.git
git branch -M main
git push -u origin main
```

### Step 4: Build and Deploy

```bash
npm run deploy
```

This will:
- Build the Next.js app with static export
- Create an `out` folder with static files
- Push to `gh-pages` branch automatically

### Step 5: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** tab
3. Scroll down to **Pages** section (left sidebar)
4. Under **Source**:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

### Step 6: Access Your Site

After 2-5 minutes, your site will be live at:

```
https://YOUR_USERNAME.github.io/BestHire
```

---

## Important Notes

### ✅ What Works on GitHub Pages

- **Local ML Mode**: Fully functional (no API required)
- **Client-side processing**: Resume parsing, matching, analytics
- **LocalStorage**: All data storage works
- **Responsive UI**: Mobile and desktop views

### ⚠️ API Key Usage

- API keys should be entered through the Setup page
- Keys are stored in browser localStorage (secure)
- Do NOT commit API keys to the repository

### 🔄 Update Your Deployment

Whenever you make changes:

```bash
git add .
git commit -m "Description of changes"
git push origin main
npm run deploy
```

---

## Troubleshooting

### Issue: 404 Page Not Found

**Solution**: 
- Wait 5-10 minutes after deployment
- Check that `gh-pages` branch exists
- Verify GitHub Pages is enabled in Settings

### Issue: Build Fails

**Solution**:
```bash
# Clear cache
rm -rf .next out node_modules

# Reinstall dependencies
npm install

# Try again
npm run deploy
```

### Issue: Assets Not Loading

**Solution**:
- Ensure `basePath` in `next.config.js` matches your repo name
- Check browser console for 404 errors
- Verify `.nojekyll` file exists in `public/` folder

### Issue: API Routes Not Working

**Note**: GitHub Pages only supports static sites. API routes (`/api/*`) won't work. BestHire uses:
- Client-side ML processing (default)
- Direct Gemini API calls from browser (optional)

---

## Alternative Deployment Options

If you need server-side features or prefer easier deployment:

### Vercel (Recommended for Next.js)

```bash
npm i -g vercel
vercel login
vercel
```

Your site will be live instantly with a custom domain!

### Netlify

1. Go to [https://netlify.com](https://netlify.com)
2. Click "Add new site" → "Import from Git"
3. Select your GitHub repository
4. Deploy automatically

---

## Repository Settings for Best Results

### 1. Add Topics

On your GitHub repo, add topics:
- `nextjs`
- `ai`
- `recruitment`
- `machine-learning`
- `typescript`
- `tailwindcss`

### 2. Update About Section

- Description: "AI-Powered Recruitment Platform with Resume Parsing, Candidate Matching & Analytics"
- Website: Your GitHub Pages URL
- Add relevant topics

### 3. Create Releases

After deployment:
```bash
git tag -a v1.0.0 -m "Initial release"
git push origin v1.0.0
```

---

## Performance Tips

### Optimize for Production

The app is already optimized with:
- ✅ Static export for fast loading
- ✅ Code splitting
- ✅ Tailwind CSS purging
- ✅ Image optimization disabled (for GitHub Pages)
- ✅ Client-side caching

### Monitor Performance

Use Chrome DevTools:
- Lighthouse score
- Performance tab
- Network tab

---

## Security Best Practices

1. **Never commit API keys** - Use Setup page instead
2. **Keep dependencies updated** - Run `npm audit` regularly
3. **Review permissions** - Only grant necessary access
4. **Use HTTPS** - GitHub Pages provides free SSL

---

## Support

- **Documentation**: See `README.md`
- **Issues**: Create GitHub issue
- **GitHub Pages Docs**: [https://docs.github.com/pages](https://docs.github.com/pages)

---

**Developed by MOHAN MAHESH 2025. All rights reserved.**

