// Auth & Config Agent - Handles API key validation and configuration

import { BaseAgent } from './types';

export interface AuthConfig {
  apiKey: string;
}

export interface AuthResult {
  isValid: boolean;
  model: string;
  error?: string;
}

export class AuthConfigAgent extends BaseAgent<AuthConfig, AuthResult> {
  constructor() {
    super({
      name: 'AuthConfigAgent',
      maxRetries: 2,
      retryDelay: 500,
      timeout: 10000,
    });
  }

  protected async process(input: AuthConfig): Promise<AuthResult> {
    const { apiKey } = input;

    // Validate API key format
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is required');
    }

    const trimmedKey = apiKey.trim();
    if (!trimmedKey.startsWith('AIza') || trimmedKey.length !== 39) {
      throw new Error('Invalid API key format. Must start with "AIza" and be 39 characters long');
    }

    // Test API key with Gemini
    const models = ['gemini-2.0-flash-exp', 'gemini-1.5-flash'];
    
    for (const model of models) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: 'Hello' }] }]
            })
          }
        );

        if (response.ok) {
          return {
            isValid: true,
            model,
          };
        }
      } catch (error) {
        // Try next model
        continue;
      }
    }

    throw new Error('API key validation failed with all models');
  }
}
