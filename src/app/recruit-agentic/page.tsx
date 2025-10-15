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
            disabled={Boolean(!file || jobDescription.trim().length === 0 || isLoading)}
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
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-indigo-600 animate-pulse" />
                  <span>🤖 Agentic Workflow Pipeline</span>
                </CardTitle>
                <CardDescription>Event-driven multi-agent system executing specialized tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-semibold text-gray-700">Overall Progress</span>
                    <span className="text-indigo-600 font-bold">{orchestratorState.progress}%</span>
                  </div>
                  <Progress value={orchestratorState.progress} className="h-4" />
                </div>

                {/* Agent Pipeline Cards */}
                <div className="space-y-3">
                  {/* Auth Agent (only if API key provided) */}
                  {apiKey.trim() && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        orchestratorState.currentAgent === 'auth'
                          ? 'border-blue-500 bg-blue-50 shadow-lg'
                          : orchestratorState.auth
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            orchestratorState.auth
                              ? 'bg-green-500 text-white'
                              : orchestratorState.currentAgent === 'auth'
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-500'
                          }`}>
                            {orchestratorState.auth ? '✓' : '🔐'}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">Auth & Config Agent</h4>
                            <p className="text-xs text-gray-600">Validates API credentials & configuration</p>
                          </div>
                        </div>
                        {getAgentStatusIcon('auth')}
                      </div>
                    </motion.div>
                  )}
                  
                  {/* Ingestion Agent */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      orchestratorState.currentAgent === 'ingestion'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : orchestratorState.ingestion
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orchestratorState.ingestion
                            ? 'bg-green-500 text-white'
                            : orchestratorState.currentAgent === 'ingestion'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {orchestratorState.ingestion ? '✓' : '📄'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Ingestion Agent</h4>
                          <p className="text-xs text-gray-600">Extracts text from PDF/DOCX using PDF.js</p>
                        </div>
                      </div>
                      {getAgentStatusIcon('ingestion')}
                    </div>
                    {orchestratorState.ingestion && (
                      <div className="mt-2 pl-13 text-xs text-gray-600">
                        ✓ Extracted {orchestratorState.ingestion.pageCount || 1} pages • {Math.round(orchestratorState.ingestion.fileSize / 1024)}KB
                      </div>
                    )}
                  </motion.div>

                  {/* Profiling Agent */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      orchestratorState.currentAgent === 'profiling'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : orchestratorState.profile
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orchestratorState.profile
                            ? 'bg-green-500 text-white'
                            : orchestratorState.currentAgent === 'profiling'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {orchestratorState.profile ? '✓' : '👤'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Profiling Agent</h4>
                          <p className="text-xs text-gray-600">Parses candidate data (name, skills, experience)</p>
                        </div>
                      </div>
                      {getAgentStatusIcon('profiling')}
                    </div>
                    {orchestratorState.profile && (
                      <div className="mt-2 pl-13 text-xs text-gray-600">
                        ✓ Identified {orchestratorState.profile.skills.length} skills • {orchestratorState.profile.experience.length} experiences
                      </div>
                    )}
                  </motion.div>

                  {/* Matching Agent */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      orchestratorState.currentAgent === 'matching'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : orchestratorState.matching
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orchestratorState.matching
                            ? 'bg-green-500 text-white'
                            : orchestratorState.currentAgent === 'matching'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {orchestratorState.matching ? '✓' : '🎯'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Matching Agent</h4>
                          <p className="text-xs text-gray-600">Calculates job-resume compatibility score</p>
                        </div>
                      </div>
                      {getAgentStatusIcon('matching')}
                    </div>
                    {orchestratorState.matching && (
                      <div className="mt-2 pl-13 text-xs text-gray-600">
                        ✓ Match Score: {orchestratorState.matching.score}% • Category: {orchestratorState.matching.fitCategory}
                      </div>
                    )}
                  </motion.div>

                  {/* Insights Agent */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      orchestratorState.currentAgent === 'insights'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : orchestratorState.insights
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orchestratorState.insights
                            ? 'bg-green-500 text-white'
                            : orchestratorState.currentAgent === 'insights'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {orchestratorState.insights ? '✓' : '💡'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Insights Agent</h4>
                          <p className="text-xs text-gray-600">Analyzes strengths, weaknesses & improvement areas</p>
                        </div>
                      </div>
                      {getAgentStatusIcon('insights')}
                    </div>
                    {orchestratorState.insights && (
                      <div className="mt-2 pl-13 text-xs text-gray-600">
                        ✓ Found {orchestratorState.insights.strengths.length} strengths • {orchestratorState.insights.weaknesses.length} areas to improve
                      </div>
                    )}
                  </motion.div>

                  {/* Suggestions Agent */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      orchestratorState.currentAgent === 'suggestions'
                        ? 'border-blue-500 bg-blue-50 shadow-lg'
                        : orchestratorState.suggestions
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          orchestratorState.suggestions
                            ? 'bg-green-500 text-white'
                            : orchestratorState.currentAgent === 'suggestions'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-500'
                        }`}>
                          {orchestratorState.suggestions ? '✓' : '✨'}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">Suggestions Agent</h4>
                          <p className="text-xs text-gray-600">Generates AI-powered actionable recommendations</p>
                        </div>
                      </div>
                      {getAgentStatusIcon('suggestions')}
                    </div>
                    {orchestratorState.suggestions && (
                      <div className="mt-2 pl-13 text-xs text-gray-600">
                        ✓ Generated {orchestratorState.suggestions.suggestions.length} suggestions • {orchestratorState.suggestions.usedAI ? 'AI-powered' : 'ML-based'}
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Error Display */}
                {orchestratorState.error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start space-x-3"
                  >
                    <AlertCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800 mb-1">Agent Pipeline Error</p>
                      <p className="text-sm text-red-700">{orchestratorState.error}</p>
                    </div>
                  </motion.div>
                )}

                {/* Completion Message */}
                {orchestratorState.completed && !orchestratorState.error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-center space-x-3"
                  >
                    <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800">All Agents Completed Successfully! 🎉</p>
                      <p className="text-sm text-green-700">Scroll down to view the comprehensive analysis results.</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
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
