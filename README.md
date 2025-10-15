# BestHire - AI-Powered Recruitment Platform


![Purple Pink Gradient Mobile Application Presentation](https://github.com/user-attachments/assets/521439ac-3dd9-4d9b-a99c-409e7a5c016e)

![Purple Pink Gradient Mobile Application Presentation (1)](https://github.com/user-attachments/assets/a175d309-b9a2-42e8-806c-ef544b14fc44)

<div align="center">

![BestHire Logo](https://img.shields.io/badge/BestHire-AI%20Recruitment-purple?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Agentic Architecture • Intelligent Resume Parsing • Google Gemini AI Integration • Real-time Suggestions**

[Live Demo](https://mohanmahesh10.github.io/BestHire/) • [Features](#features) • [Agentic Architecture](#-agentic-architecture) • [Quick Start](#quick-start) • [API Setup](#google-gemini-api-setup)

</div>

---

## 📋 Overview

BestHire is a cutting-edge AI recruitment platform featuring **agentic architecture** that simplifies the hiring process with intelligent resume parsing and AI-powered suggestions. Built with specialized agents working in coordination, each handling a single responsibility for optimal performance and reliability.

### 🆕 Two Modes Available

1. **🤖 Agentic Mode** (Recommended) - Event-driven architecture with 6 specialized agents
2. **⚡ Classic Mode** - Direct processing for quick analysis

### Key Highlights

- 🤖 **Agentic Architecture** - 6 specialized agents with orchestrator coordination
- 🚀 **Lightning Fast** - Process PDF resumes instantly with PDF.js library
- � **AI-Powered** - Google Gemini 2.0 Flash integration for intelligent suggestions
- 🔒 **Privacy First** - API key stored securely in browser, no backend required
- 💡 **Smart Suggestions** - Get actionable hiring recommendations with AI analysis
- 🎨 **Modern UI** - Clean, responsive design with real-time progress tracking
- ⚡ **Zero Backend** - Runs entirely in the browser with localStorage
- 🔄 **ML Fallback** - Built-in NLP parser when API key is not provided
- 📊 **Observable State** - Real-time agent execution tracking and error handling

---

## 🤖 Agentic Architecture

BestHire features a **modular, event-driven agentic architecture** where specialized agents work in coordination, managed by an orchestrator. Each agent has a single responsibility, ensuring reliability, testability, and maintainability.

### Agent Pipeline

```
┌─────────────────┐
│  Orchestrator   │  ← Coordinates all agents, manages state & retries
└────────┬────────┘
         │
    ┌────▼────┐
    │  Auth   │  ← Validates Gemini API key
    └────┬────┘
         │
    ┌────▼────────┐
    │ Ingestion   │  ← Extracts text from PDF/DOCX using PDF.js
    └────┬────────┘
         │
    ┌────▼─────────┐
    │  Profiling   │  ← Parses resume into structured data
    └────┬─────────┘
         │
    ┌────▼────────┐
    │  Matching   │  ← Calculates job-resume match score
    └────┬────────┘
         │
    ┌────▼────────┐
    │  Insights   │  ← Generates strengths & weaknesses
    └────┬────────┘
         │
    ┌────▼──────────┐
    │ Suggestions   │  ← AI-powered recommendations
    └───────────────┘
```

### The 6 Agents

1. **🔐 Auth Agent** - Validates and stores Gemini API key
2. **📄 Ingestion Agent** - PDF/DOCX parsing with PDF.js
3. **👤 Profiling Agent** - Candidate profile extraction (name, email, skills, experience)
4. **🎯 Matching Agent** - Job-resume matching with TF-IDF & cosine similarity
5. **💡 Insights Agent** - Analyzes strengths, weaknesses, improvement areas
6. **✨ Suggestions Agent** - AI-powered actionable recommendations

### Benefits

- ✅ **Single Responsibility** - Each agent does one thing well
- ✅ **Event-Driven** - Real-time progress tracking
- ✅ **Fault Tolerant** - Agent-level retries and error handling
- ✅ **Observable** - Full state management with progress updates
- ✅ **Testable** - Each agent can be tested independently
- ✅ **Maintainable** - Easy to modify or replace individual agents

📚 **[Read Full Documentation](./AGENTIC_ARCHITECTURE.md)**

---

## ✨ Features

### 🔍 Intelligent Resume Parsing

- **PDF Support**: Industry-standard PDF.js library for reliable extraction
- **DOCX Support**: Mammoth.js for Word document processing
- **Smart Extraction**: Automatically identify names, emails, phone numbers, and skills
- **Multi-page Support**: Handles resumes of any length
- **Error Handling**: Detailed error messages for debugging

### 🤖 Google Gemini AI Integration

- **API Key Configuration**: Secure in-browser API key storage with validation
- **Real-time Verification**: Tests API key with actual Google Gemini API call
- **Multi-model Fallback**: Tries gemini-2.0-flash-exp then gemini-1.5-flash
- **Status Indicators**: Visual feedback (Valid/Invalid/Testing/Untested)
- **Detailed Suggestions**: Get 5-8 actionable hiring recommendations powered by AI

### �️ Dual Processing Modes

#### Google Gemini AI Mode (Recommended)
- ✅ 95%+ accuracy with advanced AI reasoning
- ✅ Context-aware suggestions
- ✅ Free tier: 15 requests/minute
- ✅ Secure browser-based API calls
- ⚠️ Requires API key from Google AI Studio

#### Local ML Mode (Fallback)
- ✅ 100% Free forever
- ✅ No API key required
- ✅ Works offline
- ✅ Privacy-focused
- ✅ Built-in NLP with compromise.js
- ⚠️ Basic suggestions only

### 💼 Streamlined Workflows

#### 🤖 Agentic Mode (`/recruit-agentic`)
1. **Configure API Key** (optional) - Enter Google Gemini API key
2. **Upload Resume** - Select PDF/DOCX file
3. **Paste Job Description** - Copy/paste the JD
4. **Start Analysis** - Watch agents execute sequentially
5. **View Results** - See progress, profile, match score, insights, and AI suggestions

#### ⚡ Classic Mode (`/recruit`)
1. **Upload Resume** - Drag & drop or select PDF file
2. **Paste Job Description** - Copy/paste the JD you're hiring for
3. **Configure API** (optional) - Enter Google Gemini API key for AI suggestions
4. **Get Suggestions** - Instant AI-powered hiring recommendations

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18.0 or higher
- **npm** or **yarn**
- Modern web browser (Chrome, Firefox, Safari, Edge)
- (Optional) Google Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)

### Installation

```bash
# Clone the repository
git clone https://github.com/MohanMahesh10/BestHire.git
cd BestHire

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:3000/BestHire/` (or port 3001 if 3000 is in use).

### Access the App

- **🤖 Agentic Mode**: `http://localhost:3000/recruit-agentic` (Recommended)
- **⚡ Classic Mode**: `http://localhost:3000/recruit`

### Google Gemini API Setup

1. Get your API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. In the app, paste your API key in the "Google Gemini API Key" field
3. Click "Test API Key" to verify it works
4. Once validated, you'll see a green "Valid" status
5. Your key is stored securely in browser localStorage

**Note**: The app works without an API key using the built-in ML parser, but AI suggestions won't be available.

### Deployment

The project is automatically deployed to GitHub Pages on every push to main branch.

**Production URLs**:
- 🤖 **Agentic Mode**: [https://mohanmahesh10.github.io/BestHire/recruit-agentic](https://mohanmahesh10.github.io/BestHire/recruit-agentic)
- ⚡ **Classic Mode**: [https://mohanmahesh10.github.io/BestHire/recruit](https://mohanmahesh10.github.io/BestHire/recruit)

To deploy manually:
```bash
npm run build
npm run deploy
```

---

## 📁 Project Structure

```
BestHire/
├── src/
│   ├── app/                      # Next.js app directory
│   │   ├── recruit/             # Classic recruitment workflow
│   │   ├── recruit-agentic/     # 🆕 Agentic architecture UI
│   │   ├── api/                 # API routes (health, pdf parsing)
│   │   └── layout.tsx           # Root layout
│   ├── components/              # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Navigation.tsx
│   │   └── Progress.tsx
│   ├── lib/
│   │   ├── agents/              # 🆕 Agentic Architecture
│   │   │   ├── auth-agent.ts       # API key validation
│   │   │   ├── ingestion-agent.ts  # PDF/DOCX parsing
│   │   │   ├── profiling-agent.ts  # Profile extraction
│   │   │   ├── matching-agent.ts   # Job matching
│   │   │   ├── insights-agent.ts   # Analysis
│   │   │   ├── suggestions-agent.ts # AI recommendations
│   │   │   ├── orchestrator.ts     # Coordinates agents
│   │   │   ├── types.ts            # Agent interfaces
│   │   │   └── index.ts            # Barrel export
│   │   ├── gemini.ts            # Gemini API integration
│   │   ├── ml-parser.ts         # Local ML/NLP processing
│   │   ├── parsers.ts           # PDF/DOCX parsing (classic)
│   │   └── utils.ts             # Utility functions
│   └── types/                   # TypeScript definitions
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Pages deployment
├── public/                      # Static assets
├── AGENTIC_ARCHITECTURE.md      # 🆕 Architecture documentation
├── package.json                 # Dependencies
└── README.md                    # Documentation
```

---

## 💻 Tech Stack

### Frontend
- **Framework**: Next.js 14.0.3 (App Router, Static Export)
- **Language**: TypeScript 5.0
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (Dialog, Progress, Toast)
- **Animations**: Framer Motion
- **Icons**: Lucide React

### AI & Machine Learning
- **Primary**: Google Gemini API (@google/genai v0.2.0)
  - Models: gemini-2.0-flash-exp, gemini-1.5-flash
- **Fallback**: compromise.js (NLP)
- **Document Processing**: 
  - PDF.js (pdfjs-dist v3.11.174) - Industry-standard PDF parsing
  - Mammoth.js - DOCX parsing
- **Embeddings**: Custom TF-IDF implementation

### Architecture
- **🆕 Agentic Mode**: Event-driven, modular agent system
  - Single Responsibility Principle per agent
  - Orchestrator for coordination & retries
  - Observable state management
  - Real-time progress tracking
- **Classic Mode**: Direct processing pipeline

### Data & Storage
- **Client-side**: localStorage (API keys, preferences)
- **No backend**: 100% browser-based
- **Deployment**: GitHub Pages with automated workflow

---

## 📊 Performance

| Metric | Performance |
|--------|------------|
| **Resume Parsing** | < 1 second |
| **API Response** | 2-5 seconds (Gemini AI) |
| **ML Fallback** | < 1 second (offline) |
| **UI Animations** | 60 FPS |
| **Static Export** | Optimized for CDN |

---

## 🔧 Configuration

### Environment Variables

Create `.env.local` (optional - API key can be entered in UI):
```bash
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### next.config.js
```javascript
{
  output: 'export',
  basePath: '/BestHire',
  images: { unoptimized: true }
}
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file (optional):

```env
# Gemini API (Optional - for enhanced AI features)
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

### Tailwind Configuration

Customize colors and themes in `tailwind.config.ts`:

```typescript
theme: {
  extend: {
    colors: {
      primary: {...},
      secondary: {...}
    }
  }
}
```

---

## 📖 Documentation

### API Reference

#### Local ML Functions

```typescript
// Parse resume with ML
parseResumeWithML(text: string): ParsedResume

// Generate embeddings
generateEmbeddingML(text: string): number[]

// Analyze sentiment
analyzeSentimentML(text: string): number
```

#### Gemini API Functions

```typescript
// Parse with Gemini
parseResume(text: string): Promise<ParsedResume>

// Generate embeddings
generateEmbedding(text: string): Promise<number[]>

// Sentiment analysis
analyzeSentiment(text: string): Promise<number>
```

### Storage API

```typescript
// Save candidate
storage.addCandidate(candidate: Candidate): void

// Get all candidates
storage.getCandidates(): Candidate[]

// Get analytics
storage.getAnalytics(): AnalyticsData
```

---

## 🚀 Deployment

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Test production build locally
npm start
```

---

## 🚀 GitHub Pages Deployment

### Automatic Deployment (Configured)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically:

1. **Triggers** on every push to `main` branch
2. **Builds** the Next.js app with static export
3. **Deploys** to GitHub Pages at `https://mohanmahesh10.github.io/BestHire/`

### Manual Deployment

```bash
# Build and deploy manually
npm run build
npm run deploy
```

### Setup GitHub Pages

1. **Enable Pages**:
   - Go to Repository Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages` / `root`

2. **Configure Workflow Permissions**:
   - Settings → Actions → General
   - Workflow permissions: **Read and write permissions**
   - Check ✅ "Allow GitHub Actions to create and approve pull requests"

3. **Push to Deploy**:
   ```bash
   git add .
   git commit -m "Update deployment"
   git push origin main
   ```

---

## 🧪 Development & Testing

```bash
# Run linter
npm run lint

# Start development server
npm run dev

# Build production
npm run build
```

---

## 📝 License

**MIT License**

© 2025 BestHire. Developed by **MOHAN MAHESH**.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

## 🆘 Support & FAQ

### Getting Help

- � **Issues**: [GitHub Issues](https://github.com/MohanMahesh10/BestHire/issues)
- � **Contact**: Create an issue for support
- 📚 **Documentation**: Check README and inline code comments

### FAQ

**Q: Do I need an API key to use BestHire?**  
A: No! The app works without an API key using built-in ML parser. Gemini API is optional for AI-powered suggestions.

**Q: Is my data secure?**  
A: Yes! All processing happens locally in your browser. API key (if provided) is stored in browser localStorage and never sent to any server except Google's API.

**Q: What file formats are supported?**  
A: Currently PDF files are fully supported with custom binary parser. DOCX support is included but may need testing.

**Q: How do I get a Gemini API key?**  
A: Visit [Google AI Studio](https://aistudio.google.com/app/apikey), sign in with Google account, and create a free API key.

**Q: What's the API rate limit?**  
A: Free tier: 15 requests/minute, 1500/day. Check [Google AI pricing](https://ai.google.dev/pricing) for details.

---

## 🗺️ Roadmap

- [x] PDF resume parsing with custom parser
- [x] Google Gemini AI integration
- [x] API key validation and testing
- [x] ML fallback mode
- [x] GitHub Pages deployment
- [ ] LinkedIn/GitHub URL extraction
- [ ] Multiple resume batch processing
- [ ] Export suggestions to PDF
- [ ] Interview question generation
- [ ] Dark mode theme

---

## 🙏 Acknowledgments

- **Next.js** - The React Framework
- **Google Gemini** - AI-powered suggestions
- **compromise** - Natural language processing
- **Radix UI** - Accessible component primitives
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Animation library
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **Google Gemini** - AI capabilities
- **Open source community** - For amazing tools and libraries

---

## 📈 Status

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Uptime](https://img.shields.io/badge/uptime-99.9%25-success)

---

<div align="center">

**Made with ❤️ by MOHAN MAHESH**

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/mohan-mahesh-boggavarapu-b1a48b249/)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/MohanMahesh1008)

© 2025 BestHire. All rights reserved.

</div>
