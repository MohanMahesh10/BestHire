// Agent Types and Interfaces

export type AgentStatus = 'idle' | 'running' | 'success' | 'error' | 'retry';

export interface AgentEvent<T = any> {
  type: string;
  agentName: string;
  timestamp: number;
  data: T;
  metadata?: Record<string, any>;
}

export interface AgentState {
  status: AgentStatus;
  result?: any;
  error?: Error;
  retryCount: number;
  startTime?: number;
  endTime?: number;
}

export interface AgentConfig {
  name: string;
  maxRetries: number;
  retryDelay: number;
  timeout: number;
}

export abstract class BaseAgent<TInput = any, TOutput = any> {
  protected config: AgentConfig;
  protected state: AgentState;
  protected listeners: Map<string, Set<(event: AgentEvent) => void>>;

  constructor(config: Partial<AgentConfig>) {
    this.config = {
      name: config.name || 'UnnamedAgent',
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      timeout: config.timeout || 30000,
    };

    this.state = {
      status: 'idle',
      retryCount: 0,
    };

    this.listeners = new Map();
  }

  // Event system
  on(eventType: string, callback: (event: AgentEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);
  }

  off(eventType: string, callback: (event: AgentEvent) => void): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.delete(callback);
    }
  }

  protected emit(eventType: string, data: any, metadata?: Record<string, any>): void {
    const event: AgentEvent = {
      type: eventType,
      agentName: this.config.name,
      timestamp: Date.now(),
      data,
      metadata,
    };

    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }

    // Emit to 'any' listeners
    const anyListeners = this.listeners.get('*');
    if (anyListeners) {
      anyListeners.forEach(callback => callback(event));
    }
  }

  // Core execution logic
  async execute(input: TInput): Promise<TOutput> {
    this.state.status = 'running';
    this.state.startTime = Date.now();
    this.state.retryCount = 0;
    this.emit('start', { input });

    try {
      const result = await this.runWithRetry(input);
      this.state.status = 'success';
      this.state.result = result;
      this.state.endTime = Date.now();
      this.emit('success', result);
      return result;
    } catch (error) {
      this.state.status = 'error';
      this.state.error = error as Error;
      this.state.endTime = Date.now();
      this.emit('error', { error: (error as Error).message });
      throw error;
    }
  }

  private async runWithRetry(input: TInput): Promise<TOutput> {
    while (this.state.retryCount <= this.config.maxRetries) {
      try {
        const result = await Promise.race([
          this.process(input),
          this.timeout(),
        ]);
        return result;
      } catch (error) {
        this.state.retryCount++;
        
        if (this.state.retryCount > this.config.maxRetries) {
          throw error;
        }

        this.emit('retry', {
          attempt: this.state.retryCount,
          maxRetries: this.config.maxRetries,
          error: (error as Error).message,
        });

        await this.delay(this.config.retryDelay * this.state.retryCount);
      }
    }

    throw new Error(`Agent ${this.config.name} failed after ${this.config.maxRetries} retries`);
  }

  private timeout(): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Agent ${this.config.name} timed out after ${this.config.timeout}ms`));
      }, this.config.timeout);
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Abstract method to be implemented by subclasses
  protected abstract process(input: TInput): Promise<TOutput>;

  // State getters
  getState(): AgentState {
    return { ...this.state };
  }

  getStatus(): AgentStatus {
    return this.state.status;
  }
}
