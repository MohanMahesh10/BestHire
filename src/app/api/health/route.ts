// Health check endpoint for production deployment
import { NextResponse } from 'next/server';
import { quickMLCheck } from '@/lib/ml-validator';

export async function GET() {
  const mlStatus = quickMLCheck();
  
  const health = {
    status: mlStatus ? 'healthy' : 'degraded',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    checks: {
      ml: mlStatus,
      api: true,
      storage: typeof window !== 'undefined' ? typeof localStorage !== 'undefined' : true
    }
  };
  
  return NextResponse.json(health, {
    status: mlStatus ? 200 : 503
  });
}

