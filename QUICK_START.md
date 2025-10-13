# 🚀 Quick Start Guide - BestHire

## For First-Time Users

### Step 1: Setup (One-Time)

```bash
# Install dependencies
npm install

# Install gh-pages for deployment
npm install --save-dev gh-pages
```

### Step 2: Run Locally

```bash
# Start development server
npm run dev
```

Open http://localhost:3000

### Step 3: Upload to GitHub

#### Option A: Use Setup Script (Windows)

```bash
# Double-click: setup-github.bat
# Follow the prompts
```

#### Option B: Manual Setup

```bash
# 1. Initialize git
git init

# 2. Add files
git add .

# 3. Commit
git commit -m "Initial commit: BestHire by MOHAN MAHESH"

# 4. Create repo on GitHub
# Go to: https://github.com/new
# Name: besthire

# 5. Link and push
git remote add origin https://github.com/YOUR_USERNAME/besthire.git
git branch -M main
git push -u origin main
```

### Step 4: Deploy (Optional)

#### Deploy to Vercel (Easiest - Recommended)

```bash
# Install Vercel
npm i -g vercel

# Deploy
vercel
```

#### Or Deploy to GitHub Pages

```bash
npm run deploy
```

Then enable Pages in GitHub Settings.

---

## Daily Workflow

```bash
# Make changes to code

# Test locally
npm run dev

# Commit changes
git add .
git commit -m "Description of changes"

# Push to GitHub
git push

# Deploy (if needed)
npm run deploy  # for GitHub Pages
# OR
vercel          # for Vercel
```

---

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |
| `npm run deploy` | Deploy to GitHub Pages |
| `git status` | Check what changed |
| `git add .` | Stage all changes |
| `git commit -m "msg"` | Commit changes |
| `git push` | Upload to GitHub |

---

## Project Structure

```
besthire/
├── src/app/          # Pages
│   ├── setup/        # Mode selection
│   ├── upload/       # Resume upload
│   ├── match/        # Candidate matching
│   └── dashboard/    # Analytics
├── src/components/   # UI components
├── src/lib/          # Core logic
├── public/           # Static files
└── README.md         # Documentation
```

---

## Need Help?

- 📖 Full docs: See README.md
- 🚀 Deployment: See DEPLOYMENT.md or GITHUB_SETUP.md
- 🤝 Contributing: See CONTRIBUTING.md
- 🐛 Issues: Open on GitHub

---

**Ready to build amazing recruitment tools?** 🎉

© 2025 MOHAN MAHESH

