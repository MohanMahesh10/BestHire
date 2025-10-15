# Agentic Architecture - BestHire

## Overview

BestHire has been transformed into a **multi-agent system** where each agent is a small, single-responsibility component that processes specific tasks and communicates via events. The system follows the **Chain of Responsibility** pattern with intelligent retry logic, state management, and error handling.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      ORCHESTRATOR                           │
│  (Coordinates agents, manages state, handles retries)      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │       Event-Driven Agent Pipeline       │
        └─────────────────────────────────────────┘
                              │
    ┌─────────────────────────┴─────────────────────────┐
    │                                                     │
    ▼                                                     ▼
┌──────────────────┐      ┌──────────────────┐      ┌──────────────────┐
│  Auth & Config   │ ───▶ │   Ingestion      │ ───▶ │   Profiling      │
│     Agent        │      │     Agent        │      │     Agent        │
├──────────────────┤      ├──────────────────┤      ├──────────────────┤
│ • Validate API   │      │ • Extract text   │      │ • Parse resume   │
│ • Test Gemini    │      │ • PDF parsing    │      │ • Extract name   │
│ • Model selection│      │ • DOCX parsing   │      │ • Extract email  │
└──────────────────┘      └──────────────────┘      │ • Extract skills │
                                                     └──────────────────┘
                              │                              │
                              ▼                              ▼
                      ┌──────────────────┐      ┌──────────────────┐
                      │    Matching      │ ───▶ │    Insights      │
                      │     Agent        │      │     Agent        │
                      ├──────────────────┤      ├──────────────────┤
                      │ • Generate       │      │ • Strengths      │
                      │   embeddings     │      │ • Weaknesses     │
                      │ • Calculate      │      │ • Improvements   │
                      │   similarity     │      │ • Constraints    │
                      │ • Score match    │      └──────────────────┘
                      └──────────────────┘              │
                              │                         │
                              └────────────┬────────────┘
                                          ▼
                              ┌──────────────────┐
                              │   Suggestions    │
                              │     Agent        │
                              ├──────────────────┤
                              │ • Gemini API     │
                              │ • ML fallback    │
                              │ • Actionable     │
                              │   recommendations│
                              └──────────────────┘
```

---

## Agent Details

### 1. **Auth & Config Agent**

**Purpose**: Validates API keys and configures the AI model.

**Input**:
```typescript
{
  apiKey: string
}
```

**Output**:
```typescript
{
  isValid: boolean
  model: string
  error?: string
}
```

**Responsibilities**:
- Validate API key format (AIza..., 39 chars)
- Test API key with Gemini API
- Try multiple models (gemini-2.0-flash-exp, gemini-1.5-flash)
- Return the working model

**APIs Used**:
- Google Generative AI API (Gemini)

**Retry Logic**: 2 retries, 500ms delay

---

### 2. **Ingestion Agent**

**Purpose**: Extracts text from uploaded resumes (PDF/DOCX).

**Input**:
```typescript
{
  file: File
}
```

**Output**:
```typescript
{
  text: string
  fileName: string
  fileSize: number
  pageCount?: number
  extractedAt: number
}
```

**Responsibilities**:
- Detect file type
- Extract text from PDF using PDF.js
- Extract text from DOCX using Mammoth
- Validate extracted text (minimum 50 chars)

**APIs Used**:
- pdfjs-dist (PDF parsing)
- mammoth (DOCX parsing)

**Retry Logic**: 2 retries, 1000ms delay

---

### 3. **Profiling Agent**

**Purpose**: Extracts structured candidate information from resume text.

**Input**:
```typescript
{
  text: string
}
```

**Output**:
```typescript
{
  name: string
  email: string
  phone: string
  skills: string[]
  experience: string[]
  education: string[]
  summary: string
}
```

**Responsibilities**:
- Parse resume using ML
- Extract candidate name (multiple strategies)
- Extract email with regex
- Extract phone with multiple patterns
- Extract skills from database
- Extract experience and education

**APIs Used**:
- compromise (NLP library)
- Custom ML parser

**Retry Logic**: 1 retry, 500ms delay

---

### 4. **Matching Agent**

**Purpose**: Calculates compatibility score between resume and job description.

**Input**:
```typescript
{
  resumeText: string
  jobDescription: string
}
```

**Output**:
```typescript
{
  score: number
  fitCategory: 'good-fit' | 'partial-fit' | 'not-fit'
  resumeEmbedding: number[]
  jdEmbedding: number[]
}
```

**Responsibilities**:
- Generate TF-IDF embeddings for resume
- Generate TF-IDF embeddings for job description
- Calculate cosine similarity
- Determine fit category based on score

**APIs Used**:
- Custom ML embedding generator
- Cosine similarity calculation

**Retry Logic**: 1 retry, 500ms delay

---

### 5. **Insights Agent**

**Purpose**: Generates strengths, weaknesses, and improvement recommendations.

**Input**:
```typescript
{
  resumeText: string
  jobDescription: string
  matchScore: number
}
```

**Output**:
```typescript
{
  strengths: string[]
  weaknesses: string[]
  areasToImprove: string[]
  constraints: string[]
}
```

**Responsibilities**:
- Identify strengths (skills match, experience, leadership)
- Identify weaknesses (missing skills, gaps)
- Suggest areas to improve (projects, certifications)
- Note constraints (location, authorization)

**APIs Used**:
- Rule-based analysis
- Keyword extraction

**Retry Logic**: 1 retry, 500ms delay

---

### 6. **Suggestions Agent**

**Purpose**: Generates actionable suggestions using AI or ML.

**Input**:
```typescript
{
  resumeText: string
  jobDescription: string
  apiKey?: string
  model?: string
}
```

**Output**:
```typescript
{
  suggestions: string[]
  usedAI: boolean
  model?: string
}
```

**Responsibilities**:
- Try Gemini API if key provided
- Generate structured prompt for suggestions
- Parse AI response
- Fall back to ML-based suggestions if API fails

**APIs Used**:
- Google Generative AI API (Gemini) - primary
- Custom ML suggestion generator - fallback

**Retry Logic**: 2 retries, 1000ms delay

---

### 7. **Orchestrator**

**Purpose**: Coordinates all agents, manages state, and handles the pipeline.

**Input**:
```typescript
{
  file: File
  jobDescription: string
  apiKey?: string
}
```

**Output**:
```typescript
{
  profile: CandidateProfile
  matching: MatchingResult
  insights: InsightsResult
  suggestions: SuggestionsResult
  rawText: string
}
```

**Responsibilities**:
- Initialize all agents
- Execute agents in sequence
- Track progress (0-100%)
- Handle errors and retries
- Emit state changes via events
- Coordinate data handoffs between agents

**Event Types**:
- `start` - Agent starts processing
- `success` - Agent completes successfully
- `error` - Agent encounters error
- `retry` - Agent retrying after failure

---

## Event Flow

```
User Action
    │
    ▼
Orchestrator.execute()
    │
    ├──▶ Auth Agent (if API key)
    │       │
    │       ├─ emit('start')
    │       ├─ validate API key
    │       ├─ emit('success') or emit('error')
    │       └─ pass result to next
    │
    ├──▶ Ingestion Agent
    │       │
    │       ├─ emit('start')
    │       ├─ extract PDF/DOCX text
    │       ├─ emit('success') or emit('retry')
    │       └─ pass text to next
    │
    ├──▶ Profiling Agent
    │       │
    │       ├─ emit('start')
    │       ├─ parse resume structure
    │       ├─ emit('success')
    │       └─ pass profile to next
    │
    ├──▶ Matching Agent
    │       │
    │       ├─ emit('start')
    │       ├─ calculate embeddings
    │       ├─ compute similarity
    │       ├─ emit('success')
    │       └─ pass score to next
    │
    ├──▶ Insights Agent
    │       │
    │       ├─ emit('start')
    │       ├─ analyze strengths/weaknesses
    │       ├─ emit('success')
    │       └─ pass insights to next
    │
    └──▶ Suggestions Agent
            │
            ├─ emit('start')
            ├─ generate suggestions (AI or ML)
            ├─ emit('success') or emit('retry')
            └─ return final result
```

---

## Base Agent Features

All agents inherit from `BaseAgent` which provides:

### 1. **Event System**
```typescript
agent.on('start', (event) => { })
agent.on('success', (event) => { })
agent.on('error', (event) => { })
agent.on('retry', (event) => { })
agent.on('*', (event) => { }) // Listen to all events
```

### 2. **Automatic Retry Logic**
- Configurable max retries per agent
- Exponential backoff delay
- Retry count tracking
- Failure after max retries

### 3. **Timeout Protection**
- Each agent has a timeout
- Prevents hanging operations
- Throws timeout error

### 4. **State Management**
```typescript
{
  status: 'idle' | 'running' | 'success' | 'error' | 'retry'
  result?: any
  error?: Error
  retryCount: number
  startTime?: number
  endTime?: number
}
```

---

## Usage

### Basic Usage

```typescript
import { AgentOrchestrator } from '@/lib/agents';

const orchestrator = new AgentOrchestrator();

// Listen to state changes
orchestrator.onStateChange((state) => {
  console.log('Progress:', state.progress);
  console.log('Current agent:', state.currentAgent);
});

// Execute the pipeline
const result = await orchestrator.execute({
  file: resumeFile,
  jobDescription: jdText,
  apiKey: 'AIza...', // optional
});

// Access results
console.log('Candidate:', result.profile.name);
console.log('Match score:', result.matching.score);
console.log('Suggestions:', result.suggestions.suggestions);
```

### Individual Agent Usage

```typescript
import { IngestionAgent } from '@/lib/agents';

const agent = new IngestionAgent();

// Listen to events
agent.on('start', (event) => {
  console.log('Started extraction');
});

agent.on('retry', (event) => {
  console.log('Retrying...', event.data.attempt);
});

// Execute
const result = await agent.execute({ file: resumeFile });
console.log('Extracted text:', result.text);
```

---

## Benefits of Agentic Architecture

### 1. **Modularity**
- Each agent is independent
- Easy to test in isolation
- Can be reused in other contexts

### 2. **Maintainability**
- Single responsibility per agent
- Clear boundaries
- Easy to debug

### 3. **Scalability**
- Agents can run in parallel (future enhancement)
- Easy to add new agents
- Can distribute agents across services

### 4. **Resilience**
- Automatic retries
- Timeout protection
- Graceful degradation (AI → ML fallback)

### 5. **Observability**
- Event-driven logging
- Progress tracking
- State visibility

### 6. **Flexibility**
- Agents can be swapped
- Easy to A/B test different implementations
- Configurable behavior

---

## Future Enhancements

### 1. **Parallel Execution**
- Run independent agents concurrently
- Reduce total processing time

### 2. **Caching**
- Cache ingestion results
- Cache embeddings
- Reduce redundant processing

### 3. **Agent Chaining**
- Dynamic agent composition
- Conditional branches
- Loop detection

### 4. **Monitoring**
- Agent performance metrics
- Success/failure rates
- Average execution time

### 5. **Persistence**
- Save pipeline state
- Resume from failure
- Audit trail

---

## Testing

Each agent can be tested independently:

```typescript
describe('ProfilingAgent', () => {
  it('should extract candidate name', async () => {
    const agent = new ProfilingAgent();
    const result = await agent.execute({
      text: 'John Doe\njohn@example.com\n...'
    });
    expect(result.name).toBe('John Doe');
  });
});
```

---

## Routes

- **Current (monolithic)**: `/recruit`
- **Agentic version**: `/recruit-agentic`

Both routes are available for comparison and gradual migration.

---

## Conclusion

The agentic architecture transforms BestHire from a monolithic application into a composable, resilient, and observable multi-agent system. Each agent is a specialist that does one thing well, and the orchestrator ensures they work together seamlessly.
