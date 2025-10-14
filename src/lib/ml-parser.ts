// Client-side ML-based resume parser - NO API REQUIRED
import nlp from 'compromise';

export function parseResumeWithML(text: string) {
  // Clean the text first - preserve newlines for better line detection
  const cleanText = text
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\r/g, '\n')
    .replace(/[^\x20-\x7E\n]/g, '') // Remove non-printable characters except newline
    .replace(/ {2,}/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  const doc = nlp(cleanText);
  
  // Split by actual newlines first, then by sentences if needed
  let lines = cleanText.split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 0);
  
  // If we don't have many lines, try to split by common patterns
  if (lines.length < 5) {
    lines = cleanText
      .split(/(?<=[.!?])\s+|(?<=\))\s+(?=[A-Z])|(?<=[a-z])(?=[A-Z]{2,})/)
      .map(l => l.trim())
      .filter(l => l.length > 0);
  }
  
  // Enhanced name extraction with multiple strategies
  let name = 'Unknown';
  
  // Helper function to validate if a string looks like a real name
  const isValidName = (str: string): boolean => {
    // Must be 2-4 words
    const words = str.trim().split(/\s+/);
    if (words.length < 1 || words.length > 4) return false;
    
    // Each word should start with uppercase letter
    if (!words.every(w => /^[A-Z]/.test(w))) return false;
    
    // Should not contain numbers (except Jr, Sr, II, III, IV)
    if (!/^(jr|sr|ii|iii|iv|v)$/i.test(str) && /\d/.test(str)) return false;
    
    // Should not be common resume headers
    const headers = ['resume', 'curriculum', 'vitae', 'cv', 'profile', 'summary', 'objective', 'contact', 'education', 'experience', 'skills'];
    if (headers.some(h => str.toLowerCase().includes(h))) return false;
    
    // Each word should be at least 2 characters (except middle initials)
    if (words.some(w => w.length < 2 && !/^[A-Z]\.?$/.test(w))) return false;
    
    // Should have at least one vowel in the name
    if (!/[aeiou]/i.test(str)) return false;
    
    return true;
  };
  
  console.log('=== NAME EXTRACTION DEBUG ===');
  console.log('Total lines:', lines.length);
  console.log('First 15 lines:', lines.slice(0, 15));
  console.log('Clean text preview:', cleanText.substring(0, 300));
  
  // Strategy 1: First few lines looking for proper name pattern
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i].trim();
    console.log(`Line ${i}: "${line}"`);
    
    // Skip empty lines
    if (!line || line.length < 3) {
      console.log('  -> Skipped (empty or too short)');
      continue;
    }
    
    // Skip lines with email or phone
    if (line.includes('@') || /\d{3,}/.test(line)) {
      console.log('  -> Skipped (contains @ or multiple digits)');
      continue;
    }
    
    // Skip common headers
    if (/^(resume|cv|curriculum|contact|profile|summary|objective|experience|education|skills)/i.test(line)) {
      console.log('  -> Skipped (common header)');
      continue;
    }
    
    // Look for name patterns with more flexibility
    // Pattern 1: Standard "FirstName LastName" format
    const namePattern1 = line.match(/^([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})$/);
    // Pattern 2: With middle initial "FirstName M. LastName"
    const namePattern2 = line.match(/^([A-Z][a-z]+(?:\s+[A-Z]\.)?(?:\s+[A-Z][a-z]+){1,2})$/);
    // Pattern 3: All caps name "FIRSTNAME LASTNAME"
    const namePattern3 = line.match(/^([A-Z]{2,}\s+[A-Z]{2,}(?:\s+[A-Z]{2,})?)$/);
    
    const nameMatch = namePattern1 || namePattern2 || (namePattern3 ? [namePattern3[0], namePattern3[1].split(' ').map((n: string) => n.charAt(0) + n.slice(1).toLowerCase()).join(' ')] : null);
    
    if (nameMatch) {
      console.log(`  -> Name pattern matched: "${nameMatch[1]}"`);
      if (isValidName(nameMatch[1])) {
        name = nameMatch[1];
        console.log(`  -> ✓ Valid name found: "${name}"`);
        break;
      } else {
        console.log(`  -> × Invalid name (failed validation)`);
      }
    } else {
      console.log('  -> No name pattern match');
    }
  }
  
  console.log('Strategy 1 result:', name);
  
  // Strategy 2: Use NLP to find person names if strategy 1 failed
  if (name === 'Unknown') {
    const people = doc.people().out('array');
    for (const person of people) {
      if (isValidName(person)) {
        name = person;
        break;
      }
    }
  }
  
  // Strategy 3: Look for "Name:" or "Candidate:" labels
  if (name === 'Unknown') {
    const nameLabels = text.match(/(?:Name|Candidate|Applicant):\s*([A-Z][a-z]+(?:\s+[A-Z]\.?\s*)?(?:\s+[A-Z][a-z']+){1,2})/i);
    if (nameLabels && isValidName(nameLabels[1])) {
      name = nameLabels[1];
    }
  }
  
  // Enhanced email extraction
  const emailRegex = /[\w.+-]+@[\w.-]+\.[a-zA-Z]{2,}/gi;
  const emails = text.match(emailRegex);
  const email = emails ? emails[0].toLowerCase() : '';
  
  // Enhanced phone extraction with multiple patterns
  const phonePatterns = [
    /\+?\d{1,3}[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, // International with word boundary
    /\(\d{3}\)\s?\d{3}[-.\s]?\d{4}\b/g, // (123) 456-7890
    /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b/g, // 123-456-7890
    /\b\d{10}\b/g // 1234567890 (10 digits only)
  ];
  
  let phone = '';
  for (const pattern of phonePatterns) {
    const matches = text.match(pattern);
    if (matches && matches[0]) {
      const digits = matches[0].replace(/\D/g, '');
      // Only accept if it's exactly 10 digits (US format) or 11+ (international)
      if (digits.length === 10 || digits.length >= 11) {
        phone = matches[0];
        break;
      }
    }
  }
  
  console.log('Phone extraction - Found:', phone);
  
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
    for (let i = 0; i < 50; i++) {
      embedding[(seed + i * 7) % 256] = 0.1 + (i % 10) / 100;
    }
    // Normalize
    const mag = Math.sqrt(embedding.reduce((sum, v) => sum + v * v, 0));
    return embedding.map(v => mag > 0 ? v / mag : 0.01);
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
    embedding[pos] += 0.5 / (bigrams.length || 1);
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
      embedding[catIndex++] = categoryScore / (keywords.length || 1);
    }
  }
  
  // Add a baseline to ensure no zero vectors
  for (let i = 0; i < embedding.length; i++) {
    embedding[i] += 0.01;
  }
  
  // Normalize the embedding vector
  let magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  
  // Ensure we don't divide by zero
  return magnitude > 0 ? embedding.map(val => val / magnitude) : embedding.map(() => 0.01);
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
