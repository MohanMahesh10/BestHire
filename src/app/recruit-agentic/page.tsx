'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader2, CheckCircle, AlertCircle, Bot } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Progress } from '@/components/Progress';
import { AgentOrchestrator, OrchestratorState, OrchestratorResult } from '@/lib/agents';

export default function AgenticRecruitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [orchestrator] = useState(() => new AgentOrchestrator());
  const [orchestratorState, setOrchestratorState] = useState<OrchestratorState | null>(null);
  const [result, setResult] = useState<OrchestratorResult | null>(null);

  // Subscribe to orchestrator state changes
  useEffect(() => {
    const handleStateChange = (state: OrchestratorState) => {
      setOrchestratorState(state);
    };

    orchestrator.onStateChange(handleStateChange);

    return () => {
      orchestrator.offStateChange(handleStateChange);
    };
  }, [orchestrator]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setResult(null);
  };

  const handleExecute = async () => {
    if (!file || !jobDescription.trim()) {
      return;
    }

    try {
      orchestrator.reset();
      setResult(null);

      const output = await orchestrator.execute({
        file,
        jobDescription: jobDescription.trim(),
        apiKey: apiKey.trim() || undefined,
      });

      setResult(output);
    } catch (error) {
      console.error('Orchestration failed:', error);
    }
  };

  const getAgentStatusIcon = (agentName: string) => {
    if (!orchestratorState) return <div className="w-3 h-3 rounded-full bg-gray-300" />;

    const current = orchestratorState.currentAgent;
    const isComplete = orchestratorState.completed;

    if (current === agentName) {
      return <Loader2 className="w-4 h-4 animate-spin text-blue-600" />;
    }

    // Check if this agent has completed
    const agentOrder = ['auth', 'ingestion', 'profiling', 'matching', 'insights', 'suggestions'];
    const currentIndex = agentOrder.indexOf(current);
    const thisIndex = agentOrder.indexOf(agentName);

    if (isComplete || (currentIndex > thisIndex && thisIndex >= 0)) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }

    if (orchestratorState.error) {
      return <AlertCircle className="w-4 h-4 text-red-600" />;
    }

    return <div className="w-3 h-3 rounded-full bg-gray-300" />;
  };

  const getFitColor = (category: string) => {
    switch (category) {
      case 'good-fit':
        return 'border-green-300 bg-green-50';
      case 'partial-fit':
        return 'border-yellow-300 bg-yellow-50';
      case 'not-fit':
        return 'border-red-300 bg-red-50';
      default:
        return 'border-gray-300';
    }
  };

  const isLoading = orchestratorState?.currentAgent && !orchestratorState?.completed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Bot className="h-8 w-8 text-indigo-600" />
            <h1 className="text-4xl font-bold text-gray-900">Agentic Recruitment</h1>
          </div>
          <p className="text-lg text-gray-600">AI-powered multi-agent system for intelligent recruitment</p>
        </motion.div>

        {/* API Key Configuration */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>🔑 Gemini API Key (Optional)</span>
              <Button
                onClick={() => setShowApiKey(!showApiKey)}
                variant="outline"
                size="sm"
              >
                {showApiKey ? 'Hide' : 'Show'}
              </Button>
            </CardTitle>
            <CardDescription>
              Add your Gemini API key for AI-powered suggestions. Leave empty for ML-based analysis.
            </CardDescription>
          </CardHeader>
          {showApiKey && (
            <CardContent>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key (starts with AIza...)"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
              />
            </CardContent>
          )}
        </Card>

        {/* File Upload */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📄 Upload Resume</CardTitle>
            <CardDescription>Upload PDF or DOCX resume for analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-10 w-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    {file ? file.name : 'Click to upload resume (PDF/DOCX)'}
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Job Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>💼 Job Description</CardTitle>
            <CardDescription>Paste the job description to match against</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Enter job description..."
              className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </CardContent>
        </Card>

        {/* Execute Button */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={handleExecute}
            disabled={!file || jobDescription.trim() === "" || isLoading}
            size="lg"
            className="px-12 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Bot className="mr-3 h-6 w-6" />
                Start Agentic Analysis
              </>
            )}
          </Button>
        </div>

        {/* Agent Pipeline Status */}
        {orchestratorState && orchestratorState.currentAgent !== 'idle' && (
          <Card className="mb-6 border-indigo-200 bg-indigo-50">
            <CardHeader>
              <CardTitle>🤖 Agent Pipeline</CardTitle>
              <CardDescription>Multi-agent system processing your request</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-medium">Progress</span>
                  <span className="text-gray-600">{orchestratorState.progress}%</span>
                </div>
                <Progress value={orchestratorState.progress} className="h-3" />
              </div>

              {/* Agent Status */}
              <div className="space-y-2">
                {apiKey.trim() && (
                  <div className="flex items-center space-x-3 p-2 rounded bg-white">
                    {getAgentStatusIcon('auth')}
                    <span className="font-medium text-sm">Auth & Config Agent</span>
                  </div>
                )}
                
                <div className="flex items-center space-x-3 p-2 rounded bg-white">
                  {getAgentStatusIcon('ingestion')}
                  <span className="font-medium text-sm">Ingestion Agent</span>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded bg-white">
                  {getAgentStatusIcon('profiling')}
                  <span className="font-medium text-sm">Profiling Agent</span>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded bg-white">
                  {getAgentStatusIcon('matching')}
                  <span className="font-medium text-sm">Matching Agent</span>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded bg-white">
                  {getAgentStatusIcon('insights')}
                  <span className="font-medium text-sm">Insights Agent</span>
                </div>

                <div className="flex items-center space-x-3 p-2 rounded bg-white">
                  {getAgentStatusIcon('suggestions')}
                  <span className="font-medium text-sm">Suggestions Agent</span>
                </div>
              </div>

              {/* Error Display */}
              {orchestratorState.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{orchestratorState.error}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Match Score */}
            <Card className={`border-2 ${getFitColor(result.matching.fitCategory)}`}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                    <div>
                      <h3 className="text-2xl font-bold capitalize">{result.matching.fitCategory.replace('-', ' ')}</h3>
                      <p className="text-sm opacity-75">AI Compatibility Assessment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-5xl font-bold">{result.matching.score}%</div>
                    <p className="text-sm opacity-75">Match Score</p>
                  </div>
                </div>
                <Progress value={result.matching.score} className="h-3" />
              </CardContent>
            </Card>

            {/* Candidate Profile */}
            <Card>
              <CardHeader>
                <CardTitle>👤 Candidate Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-1">Name</p>
                  <p className="text-xl font-bold text-gray-900">{result.profile.name}</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Contact</p>
                  <div className="space-y-1">
                    {result.profile.email && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">📧</span>
                        <p className="text-base text-gray-800 break-all">{result.profile.email}</p>
                      </div>
                    )}
                    {result.profile.phone && (
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600">📱</span>
                        <p className="text-base text-gray-800">{result.profile.phone}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-gray-500 mb-2">Skills ({result.profile.skills.length})</p>
                  <div className="flex flex-wrap gap-2">
                    {result.profile.skills.slice(0, 12).map((skill) => (
                      <span key={skill} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insights */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="border-green-200">
                <CardHeader className="bg-green-50">
                  <CardTitle className="text-green-700 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {result.insights.strengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <span className="text-sm text-gray-700">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="bg-red-50">
                  <CardTitle className="text-red-700 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    Areas to Improve
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {result.insights.weaknesses.map((weakness, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-red-600 mr-2">!</span>
                        <span className="text-sm text-gray-700">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* AI Suggestions */}
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-700">
                  💡 {result.suggestions.usedAI ? 'AI-Powered' : 'ML-Based'} Suggestions
                </CardTitle>
                <CardDescription>
                  {result.suggestions.usedAI 
                    ? `Generated by ${result.suggestions.model}`
                    : 'Generated by ML analysis'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {result.suggestions.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start space-x-2 p-3 bg-white rounded-lg">
                      <span className="text-purple-600 font-bold flex-shrink-0">{idx + 1}.</span>
                      <span className="text-sm text-gray-700">{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
