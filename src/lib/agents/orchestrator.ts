// Orchestrator - Coordinates all agents, manages state, and handles retries

import { AuthConfigAgent, AuthResult } from './auth-agent';
import { IngestionAgent, IngestionResult } from './ingestion-agent';
import { ProfilingAgent, CandidateProfile } from './profiling-agent';
import { MatchingAgent, MatchingResult } from './matching-agent';
import { InsightsAgent, InsightsResult } from './insights-agent';
import { SuggestionsAgent, SuggestionsResult } from './suggestions-agent';
import { AgentEvent } from './types';

export interface OrchestratorInput {
  file: File;
  jobDescription: string;
  apiKey?: string;
}

export interface OrchestratorState {
  currentAgent: string;
  progress: number;
  auth?: AuthResult;
  ingestion?: IngestionResult;
  profile?: CandidateProfile;
  matching?: MatchingResult;
  insights?: InsightsResult;
  suggestions?: SuggestionsResult;
  error?: string;
  completed: boolean;
}

export interface OrchestratorResult {
  profile: CandidateProfile;
  matching: MatchingResult;
  insights: InsightsResult;
  suggestions: SuggestionsResult;
  rawText: string;
}

export class AgentOrchestrator {
  private state: OrchestratorState;
  private listeners: Set<(state: OrchestratorState) => void>;
  
  // Agents
  private authAgent: AuthConfigAgent;
  private ingestionAgent: IngestionAgent;
  private profilingAgent: ProfilingAgent;
  private matchingAgent: MatchingAgent;
  private insightsAgent: InsightsAgent;
  private suggestionsAgent: SuggestionsAgent;

  constructor() {
    this.state = {
      currentAgent: 'idle',
      progress: 0,
      completed: false,
    };

    this.listeners = new Set();

    // Initialize agents
    this.authAgent = new AuthConfigAgent();
    this.ingestionAgent = new IngestionAgent();
    this.profilingAgent = new ProfilingAgent();
    this.matchingAgent = new MatchingAgent();
    this.insightsAgent = new InsightsAgent();
    this.suggestionsAgent = new SuggestionsAgent();

    // Setup event listeners for all agents
    this.setupAgentListeners();
  }

  private setupAgentListeners(): void {
    const agents = [
      this.authAgent,
      this.ingestionAgent,
      this.profilingAgent,
      this.matchingAgent,
      this.insightsAgent,
      this.suggestionsAgent,
    ];

    agents.forEach(agent => {
      agent.on('*', (event: AgentEvent) => {
        this.handleAgentEvent(event);
      });
    });
  }

  private handleAgentEvent(event: AgentEvent): void {
    console.log(`[${event.agentName}] ${event.type}:`, event.data);

    if (event.type === 'start') {
      this.updateState({ currentAgent: event.agentName });
    } else if (event.type === 'retry') {
      console.warn(`Retrying ${event.agentName}:`, event.data);
    } else if (event.type === 'error') {
      this.updateState({ 
        error: `${event.agentName} failed: ${event.data.error}`,
      });
    }
  }

  // State management
  onStateChange(callback: (state: OrchestratorState) => void): void {
    this.listeners.add(callback);
  }

  offStateChange(callback: (state: OrchestratorState) => void): void {
    this.listeners.delete(callback);
  }

  private updateState(updates: Partial<OrchestratorState>): void {
    this.state = { ...this.state, ...updates };
    this.notifyListeners();
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback({ ...this.state }));
  }

  getState(): OrchestratorState {
    return { ...this.state };
  }

  // Main orchestration flow
  async execute(input: OrchestratorInput): Promise<OrchestratorResult> {
    try {
      this.updateState({
        currentAgent: 'starting',
        progress: 0,
        error: undefined,
        completed: false,
      });

      // Step 1: Auth & Config (if API key provided)
      let authResult: AuthResult | undefined;
      if (input.apiKey && input.apiKey.trim()) {
        this.updateState({ currentAgent: 'auth', progress: 10 });
        authResult = await this.authAgent.execute({ apiKey: input.apiKey });
        this.updateState({ auth: authResult, progress: 15 });
      }

      // Step 2: Ingestion
      this.updateState({ currentAgent: 'ingestion', progress: 20 });
      const ingestionResult = await this.ingestionAgent.execute({ file: input.file });
      this.updateState({ ingestion: ingestionResult, progress: 35 });

      // Step 3: Profiling
      this.updateState({ currentAgent: 'profiling', progress: 40 });
      const profileResult = await this.profilingAgent.execute({ 
        text: ingestionResult.text 
      });
      this.updateState({ profile: profileResult, progress: 55 });

      // Step 4: Matching
      this.updateState({ currentAgent: 'matching', progress: 60 });
      const matchingResult = await this.matchingAgent.execute({
        resumeText: ingestionResult.text,
        jobDescription: input.jobDescription,
      });
      this.updateState({ matching: matchingResult, progress: 70 });

      // Step 5: Insights
      this.updateState({ currentAgent: 'insights', progress: 75 });
      const insightsResult = await this.insightsAgent.execute({
        resumeText: ingestionResult.text,
        jobDescription: input.jobDescription,
        matchScore: matchingResult.score,
      });
      this.updateState({ insights: insightsResult, progress: 85 });

      // Step 6: Suggestions
      this.updateState({ currentAgent: 'suggestions', progress: 90 });
      const suggestionsResult = await this.suggestionsAgent.execute({
        resumeText: ingestionResult.text,
        jobDescription: input.jobDescription,
        apiKey: input.apiKey,
        model: authResult?.model,
      });
      this.updateState({ suggestions: suggestionsResult, progress: 100 });

      // Complete
      this.updateState({ 
        currentAgent: 'completed',
        progress: 100,
        completed: true,
      });

      return {
        profile: profileResult,
        matching: matchingResult,
        insights: insightsResult,
        suggestions: suggestionsResult,
        rawText: ingestionResult.text,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.updateState({
        currentAgent: 'failed',
        error: errorMessage,
        completed: false,
      });
      throw error;
    }
  }

  // Reset orchestrator
  reset(): void {
    this.state = {
      currentAgent: 'idle',
      progress: 0,
      completed: false,
    };
    this.notifyListeners();
  }
}
