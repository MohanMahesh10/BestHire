# BestHire - GitHub Pages Deployment Guide

## 🚀 Deployment Status

✅ **Successfully Deployed to GitHub Pages**

- **Live URL**: [https://mohanmahesh10.github.io/BestHire/](https://mohanmahesh10.github.io/BestHire/)
- **Repository**: [https://github.com/MohanMahesh10/BestHire](https://github.com/MohanMahesh10/BestHire)
- **Last Updated**: January 2025

---

## 📋 What Was Updated

### 1. README.md Improvements

✅ Updated project overview with current features
✅ Added Google Gemini API integration details
✅ Included live demo link
✅ Updated tech stack with actual dependencies
✅ Added API setup instructions
✅ Updated project structure to reflect actual files
✅ Added usage guide and FAQ
✅ Changed license to MIT
✅ Added comprehensive deployment section

### 2. GitHub Actions Workflow

✅ Pre-configured workflow at `.github/workflows/deploy.yml`
✅ Automatically builds and deploys on push to `main` branch
✅ Uses Node.js 20 with npm caching
✅ Deploys static export (`./out` folder) to GitHub Pages

---

## 🔧 How Automatic Deployment Works

### Workflow Triggers

Every time you push to the `main` branch:

1. **Build Job**:
   - Checks out code
   - Sets up Node.js 20
   - Installs dependencies (`npm install`)
   - Builds Next.js app (`npm run build`)
   - Uploads `./out` folder as artifact

2. **Deploy Job**:
   - Takes the built artifact
   - Deploys to GitHub Pages
   - Updates live site automatically

### Configuration Files

- **next.config.js**: Configured for static export with `basePath: '/BestHire'`
- **package.json**: Includes `output: 'export'` in build script
- **.github/workflows/deploy.yml**: Automated CI/CD pipeline

---

## 📝 Manual Deployment Steps (If Needed)

If you need to deploy manually:

```bash
# 1. Build the project
npm run build

# 2. Deploy to gh-pages branch (requires gh-pages package)
npm run deploy
```

Or using GitHub CLI:

```bash
# Build
npm run build

# Push out folder to gh-pages branch
git add out -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix out origin gh-pages
```

---

## ⚙️ GitHub Repository Settings

### Required Settings

1. **Pages Configuration**:
   - Go to: Settings → Pages
   - Source: `Deploy from a branch`
   - Branch: `gh-pages` (root)
   - Custom domain: (optional)

2. **Actions Permissions**:
   - Go to: Settings → Actions → General
   - Workflow permissions: ✅ **Read and write permissions**
   - ✅ Allow GitHub Actions to create and approve pull requests

3. **Branch Protection** (Optional):
   - Protect `main` branch
   - Require status checks before merge
   - Require pull request reviews

---

## 🔍 Monitoring Deployments

### Check Deployment Status

1. **GitHub Actions Tab**:
   - Visit: `https://github.com/MohanMahesh10/BestHire/actions`
   - View workflow runs and logs
   - Check for build errors or deployment issues

2. **Environments Tab**:
   - Settings → Environments → github-pages
   - View deployment history
   - See live URL and status

3. **Pages Settings**:
   - Settings → Pages
   - Shows current deployment status
   - Provides live site URL

---

## 🐛 Troubleshooting

### Build Fails

**Problem**: Workflow fails during `npm run build`

**Solutions**:
- Check for TypeScript errors locally: `npm run build`
- Verify all dependencies installed: `npm install`
- Check Node version matches (20.x): `node --version`
- Review build logs in Actions tab

### Deployment Fails

**Problem**: Build succeeds but deployment fails

**Solutions**:
- Verify Pages is enabled in repository settings
- Check workflow permissions (read & write)
- Ensure `gh-pages` branch exists or can be created
- Review deployment logs in Actions tab

### Site Shows 404

**Problem**: Live URL shows 404 error

**Solutions**:
- Verify `basePath: '/BestHire'` in next.config.js
- Check that Pages source is set to `gh-pages` branch
- Wait 2-3 minutes for DNS propagation
- Clear browser cache and try incognito mode

### Assets Not Loading

**Problem**: Site loads but CSS/JS missing

**Solutions**:
- Verify `basePath` matches repository name
- Check `assetPrefix` in next.config.js
- Ensure `images: { unoptimized: true }` is set
- Review browser console for 404 errors

---

## 🔄 Update Deployment

### Push New Changes

```bash
# 1. Make your changes
# Edit files...

# 2. Test locally
npm run dev

# 3. Build to verify
npm run build

# 4. Commit changes
git add .
git commit -m "Your commit message"

# 5. Push to trigger deployment
git push origin main
```

### Monitor Deployment

1. Go to Actions tab
2. Click on latest workflow run
3. Wait for both jobs (build + deploy) to complete ✅
4. Visit live site to verify changes

---

## 📊 Current Configuration

### next.config.js

```javascript
module.exports = {
  output: 'export',
  basePath: '/BestHire',
  images: {
    unoptimized: true
  },
  trailingSlash: true
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "deploy": "next build && gh-pages -d out"
  }
}
```

### Workflow Configuration

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
permissions:
  contents: read
  pages: write
  id-token: write
```

---

## ✅ Post-Deployment Checklist

- [x] README.md updated with latest features
- [x] Workflow file committed and pushed
- [x] Changes pushed to main branch
- [x] GitHub Actions workflow triggered
- [x] Build completed successfully
- [x] Deployment completed successfully
- [x] Live site accessible at [https://mohanmahesh10.github.io/BestHire/](https://mohanmahesh10.github.io/BestHire/)
- [ ] Test all features on live site
- [ ] Verify PDF upload works
- [ ] Test API key validation
- [ ] Check responsive design on mobile
- [ ] Verify all links work
- [ ] Check browser console for errors

---

## 🎯 Next Steps

### Recommended Actions

1. **Test Live Site**:
   - Upload a test PDF resume
   - Enter a job description
   - Configure Gemini API key
   - Generate suggestions

2. **Monitor Performance**:
   - Check Lighthouse scores
   - Test loading speed
   - Verify mobile responsiveness
   - Check browser compatibility

3. **Promote**:
   - Share live URL with users
   - Update portfolio with project link
   - Add to resume/CV
   - Share on social media

4. **Maintain**:
   - Monitor GitHub Actions for failures
   - Update dependencies regularly
   - Respond to issues
   - Keep README current

---

## 📞 Support

For deployment issues:

1. Check GitHub Actions logs
2. Review this troubleshooting guide
3. Create an issue on GitHub
4. Check Next.js static export docs

---

**Deployed with ❤️ by MOHAN MAHESH**

Last Updated: January 2025
