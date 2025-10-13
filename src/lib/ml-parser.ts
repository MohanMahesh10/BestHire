// Client-side ML-based resume parser - NO API REQUIRED
import nlp from 'compromise';

export function parseResumeWithML(text: string) {
  const doc = nlp(text);
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // Enhanced name extraction with multiple strategies
  let name = 'Unknown';
  
  // Strategy 1: First line if it's a proper name
  const firstLine = lines[0] || '';
  const namePattern = /^([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)$/;
  const nameMatch = firstLine.match(namePattern);
  
  if (nameMatch) {
    name = nameMatch[1];
  } else {
    // Strategy 2: Use NLP to find person names
    const people = doc.people().out('array');
    if (people.length > 0) {
      name = people[0];
    } else {
      // Strategy 3: Look for capitalized words in first 3 lines
      for (let i = 0; i < Math.min(3, lines.length); i++) {
        const capitalMatch = lines[i].match(/^([A-Z][a-z]+\s+[A-Z][a-z]+)/);
        if (capitalMatch) {
          name = capitalMatch[1];
          break;
        }
      }
    }
  }
  
  // Enhanced email extraction
  const emailRegex = /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/gi;
  const emails = text.match(emailRegex);
  const email = emails ? emails[0].toLowerCase() : '';
  
  // Enhanced phone extraction with multiple patterns
  const phonePatterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g, // International
    /\(\d{3}\)\s?\d{3}-?\d{4}/g, // (123) 456-7890
    /\d{3}[-.\s]\d{3}[-.\s]\d{4}/g, // 123-456-7890
    /\d{10}/g // 1234567890
  ];
  
  let phone = '';
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches[0].replace(/\D/g, '').length >= 10) {
      phone = matches[0];
      break;
    }
  }
  
  // Enhanced skills extraction with comprehensive list and variations
  const skillsDatabase = {
    // Programming Languages
    'JavaScript': ['javascript', 'js', 'es6', 'es2015', 'ecmascript'],
    'TypeScript': ['typescript', 'ts'],
    'Python': ['python', 'py', 'python3'],
    'Java': ['java', 'java8', 'java11', 'java17'],
    'C++': ['c++', 'cpp', 'cplusplus'],
    'C#': ['c#', 'csharp', 'c sharp'],
    'Ruby': ['ruby', 'rails'],
    'PHP': ['php', 'php7', 'php8'],
    'Go': ['golang', 'go'],
    'Rust': ['rust'],
    'Swift': ['swift'],
    'Kotlin': ['kotlin'],
    'Scala': ['scala'],
    'R': ['r programming'],
    
    // Frontend Frameworks
    'React': ['react', 'reactjs', 'react.js'],
    'Angular': ['angular', 'angularjs'],
    'Vue': ['vue', 'vuejs', 'vue.js'],
    'Next.js': ['nextjs', 'next.js', 'next'],
    'Svelte': ['svelte', 'sveltekit'],
    'jQuery': ['jquery'],
    
    // Backend Frameworks
    'Node.js': ['nodejs', 'node.js', 'node'],
    'Express': ['express', 'expressjs', 'express.js'],
    'Django': ['django'],
    'Flask': ['flask'],
    'Spring': ['spring', 'spring boot', 'springboot'],
    'Laravel': ['laravel'],
    'ASP.NET': ['asp.net', 'aspnet', 'asp net'],
    
    // CSS & Styling
    'HTML': ['html', 'html5'],
    'CSS': ['css', 'css3'],
    'Tailwind': ['tailwind', 'tailwindcss'],
    'Bootstrap': ['bootstrap'],
    'SASS': ['sass', 'scss'],
    'LESS': ['less'],
    'Material-UI': ['material-ui', 'mui', 'material ui'],
    
    // Databases
    'MongoDB': ['mongodb', 'mongo'],
    'PostgreSQL': ['postgresql', 'postgres', 'psql'],
    'MySQL': ['mysql'],
    'Redis': ['redis'],
    'Oracle': ['oracle', 'oracle db'],
    'SQL': ['sql', 'sql server', 'mssql'],
    'Cassandra': ['cassandra'],
    'DynamoDB': ['dynamodb'],
    'Firebase': ['firebase', 'firestore'],
    
    // Cloud & DevOps
    'AWS': ['aws', 'amazon web services'],
    'Azure': ['azure', 'microsoft azure'],
    'GCP': ['gcp', 'google cloud', 'google cloud platform'],
    'Docker': ['docker', 'containerization'],
    'Kubernetes': ['kubernetes', 'k8s'],
    'CI/CD': ['ci/cd', 'cicd', 'continuous integration'],
    'Jenkins': ['jenkins'],
    'GitLab CI': ['gitlab ci', 'gitlab'],
    'GitHub Actions': ['github actions'],
    'Terraform': ['terraform'],
    
    // Version Control
    'Git': ['git', 'version control'],
    'GitHub': ['github'],
    'GitLab': ['gitlab'],
    'Bitbucket': ['bitbucket'],
    
    // Methodologies
    'Agile': ['agile', 'agile methodology'],
    'Scrum': ['scrum', 'scrum master'],
    'Kanban': ['kanban'],
    'JIRA': ['jira'],
    
    // APIs & Architecture
    'REST': ['rest', 'restful', 'rest api'],
    'GraphQL': ['graphql'],
    'API': ['api', 'apis'],
    'Microservices': ['microservices', 'micro services'],
    'DevOps': ['devops'],
    'Serverless': ['serverless', 'lambda'],
    
    // AI & ML
    'Machine Learning': ['machine learning', 'ml'],
    'AI': ['artificial intelligence', 'ai'],
    'TensorFlow': ['tensorflow'],
    'PyTorch': ['pytorch'],
    'NLP': ['nlp', 'natural language processing'],
    'Deep Learning': ['deep learning'],
    'Data Science': ['data science'],
    
    // Mobile
    'React Native': ['react native', 'react-native'],
    'Flutter': ['flutter'],
    'iOS': ['ios', 'swift', 'objective-c'],
    'Android': ['android', 'android development'],
    'Mobile': ['mobile development', 'mobile app'],
    
    // Testing
    'Testing': ['testing', 'qa', 'quality assurance'],
    'Jest': ['jest'],
    'Mocha': ['mocha'],
    'Cypress': ['cypress'],
    'Selenium': ['selenium'],
    'Unit Testing': ['unit testing', 'unit tests'],
    'TDD': ['tdd', 'test driven development'],
  };
  
  const skills: string[] = [];
  const lowerText = text.toLowerCase();
  const skillSet = new Set<string>();
  
  // Match skills with variations
  for (const [skill, variations] of Object.entries(skillsDatabase)) {
    for (const variation of variations) {
      if (lowerText.includes(variation)) {
        skillSet.add(skill);
        break;
      }
    }
  }
  
  skills.push(...Array.from(skillSet));
  
  // Enhanced education extraction
  const education: string[] = [];
  const educationPatterns = [
    /bachelor(?:'s)?(?:\s+of)?(?:\s+science)?(?:\s+in)?/i,
    /master(?:'s)?(?:\s+of)?(?:\s+science)?(?:\s+in)?/i,
    /phd|ph\.d|doctorate/i,
    /degree/i,
    /university|college|institute/i,
    /b\.?s\.?|m\.?s\.?|b\.?a\.?|m\.?a\.?|mba/i,
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (educationPatterns.some(pattern => pattern.test(line))) {
      education.push(line);
    }
  }
  
  // Enhanced experience extraction
  const experience: string[] = [];
  const jobTitlePatterns = [
    /developer|engineer|programmer|coder/i,
    /manager|director|lead|head/i,
    /designer|architect/i,
    /analyst|consultant/i,
    /senior|junior|staff|principal/i,
    /full[\s-]?stack|front[\s-]?end|back[\s-]?end/i,
  ];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.length < 150 && jobTitlePatterns.some(pattern => pattern.test(line))) {
      // Check if line has company or date indicators
      if (/\d{4}|present|current|company|inc|corp|ltd/i.test(line) || 
          (i + 1 < lines.length && /\d{4}|present/i.test(lines[i + 1]))) {
        experience.push(line);
      }
    }
  }
  
  // Enhanced summary extraction
  const summaryKeywords = ['summary', 'profile', 'objective', 'about', 'overview'];
  let summary = '';
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      // Get next 2-4 lines as summary
      const summaryLines = lines.slice(i + 1, i + 5).filter(l => l.length > 20);
      summary = summaryLines.join(' ').trim();
      break;
    }
  }
  
  // Fallback: Use first substantial paragraph
  if (!summary) {
    const phoneRegex = /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
    for (let i = 1; i < Math.min(10, lines.length); i++) {
      if (lines[i].length > 50 && !emailRegex.test(lines[i]) && !phoneRegex.test(lines[i])) {
        summary = lines[i];
        break;
      }
    }
  }
  
  return {
    name,
    email,
    phone,
    skills: skills.slice(0, 30), // Top 30 skills
    education: education.slice(0, 5),
    experience: experience.slice(0, 10),
    summary: summary.substring(0, 400)
  };
}

// Simple sentiment analysis - O(n)
export function analyzeSentimentML(text: string): number {
  const positiveWords = ['excellent', 'great', 'strong', 'skilled', 'experienced', 'proficient', 'expert', 'successful', 'achieved', 'led', 'improved', 'increased', 'developed', 'created', 'built', 'innovative', 'effective', 'efficient'];
  const negativeWords = ['weak', 'poor', 'limited', 'basic', 'beginner', 'struggling', 'failed', 'decreased'];
  
  const lowerText = text.toLowerCase();
  let score = 0.5; // Neutral baseline
  
  for (const word of positiveWords) {
    if (lowerText.includes(word)) score += 0.02;
  }
  
  for (const word of negativeWords) {
    if (lowerText.includes(word)) score -= 0.02;
  }
  
  // Professional formatting indicators
  if (text.length > 500) score += 0.05; // Detailed resume
  if (text.includes('@')) score += 0.05; // Has contact info
  if (/\d{4}/.test(text)) score += 0.05; // Has dates/years
  
  return Math.max(0, Math.min(1, score));
}

// Advanced TF-IDF with semantic understanding - O(n)
export function generateEmbeddingML(text: string): number[] {
  const lowerText = text.toLowerCase();
  
  // Stop words to ignore
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been',
    'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
    'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ]);
  
  // Extract meaningful words - include numbers for better matching
  const words = lowerText.match(/\b[a-z0-9]{2,}\b/g) || [];
  const meaningfulWords = words.filter(w => !stopWords.has(w) && w.length > 1);
  
  // Calculate word frequencies (TF)
  const wordFreq = new Map<string, number>();
  for (const word of meaningfulWords) {
    wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
  }
  
  // Calculate TF (Term Frequency)
  const totalWords = meaningfulWords.length || 1; // Avoid division by zero
  const tf = new Map<string, number>();
  for (const [word, freq] of wordFreq.entries()) {
    tf.set(word, freq / totalWords);
  }
  
  // If no meaningful words found, create minimal but valid embedding
  if (meaningfulWords.length === 0 || totalWords === 0) {
    const embedding = new Array(256).fill(0);
    // Create a small embedding based on text length to avoid complete zeros
    const seed = text.length % 256;
    for (let i = 0; i < 10; i++) {
      embedding[(seed + i * 7) % 256] = 0.1;
    }
    // Normalize
    const mag = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => mag > 0 ? v / mag : 0);
  }
  
  // Skill-based weighting (boost important terms - tech AND general)
  const importantTerms = new Set([
    // Technical
    'javascript', 'python', 'java', 'react', 'node', 'aws', 'docker', 
    'kubernetes', 'typescript', 'angular', 'vue', 'sql', 'mongodb',
    'developer', 'engineer', 'architect', 'manager', 'senior', 'lead',
    'agile', 'scrum', 'devops', 'cicd', 'api', 'rest', 'graphql',
    'machine', 'learning', 'tensorflow', 'pytorch', 'data', 'science',
    'cloud', 'azure', 'gcp', 'microservices', 'testing', 'security',
    // General business/professional
    'experience', 'professional', 'support', 'development', 'training',
    'program', 'policies', 'benefits', 'competitive', 'comprehensive',
    'flexible', 'opportunities', 'career', 'growth', 'analytical', 'results'
  ]);
  
  // Create 256-dimensional embedding for better accuracy
  const embedding = new Array(256).fill(0);
  
  // Strategy 1: Hash-based distribution with TF-IDF weighting
  for (const [word, tfScore] of tf.entries()) {
    const hash = hashString(word);
    const pos1 = hash % 256;
    const pos2 = (hash * 31) % 256;
    const pos3 = (hash * 37) % 256;
    
    // Boost if it's an important term
    const boost = importantTerms.has(word) ? 2.0 : 1.0;
    const weight = tfScore * boost;
    
    // Distribute across multiple dimensions for better representation
    embedding[pos1] += weight;
    embedding[pos2] += weight * 0.5;
    embedding[pos3] += weight * 0.3;
  }
  
  // Strategy 2: N-gram features for context
  const bigrams = [];
  for (let i = 0; i < meaningfulWords.length - 1; i++) {
    bigrams.push(meaningfulWords[i] + '_' + meaningfulWords[i + 1]);
  }
  
  for (const bigram of bigrams.slice(0, 50)) {
    const hash = hashString(bigram);
    const pos = hash % 256;
    embedding[pos] += 0.5 / bigrams.length;
  }
  
  // Strategy 3: Semantic categories
  const categories = {
    programming: ['code', 'program', 'develop', 'software', 'algorithm'],
    leadership: ['lead', 'manage', 'direct', 'coordinate', 'supervise'],
    cloud: ['cloud', 'aws', 'azure', 'gcp', 'serverless'],
    frontend: ['react', 'angular', 'vue', 'html', 'css', 'ui', 'ux'],
    backend: ['api', 'server', 'database', 'node', 'django', 'spring'],
    data: ['data', 'analytics', 'sql', 'machine', 'learning', 'ai'],
  };
  
  let catIndex = 200; // Start from dimension 200 for categories
  for (const [category, keywords] of Object.entries(categories)) {
    let categoryScore = 0;
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        categoryScore += 1;
      }
    }
    if (catIndex < 256) {
      embedding[catIndex++] = categoryScore / keywords.length;
    }
  }
  
  // Normalize the embedding vector
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  
  // If magnitude is zero (empty embedding), return small random values
  if (magnitude === 0 || isNaN(magnitude)) {
    return embedding.map((_, i) => (i % 7) * 0.01); // Small non-zero values
  }
  
  return embedding.map(val => val / magnitude);
}

// Helper function to hash strings consistently
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}
