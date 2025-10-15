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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Bot className="h-6 sm:h-8 w-6 sm:w-8 text-indigo-600" />
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900">Agentic Recruitment</h1>
          </div>
          <p className="text-sm sm:text-lg text-gray-600 px-4">AI-powered multi-agent system for intelligent recruitment</p>
        </motion.div>

        {/* Step-by-Step Instructions - Mobile Responsive */}
        <Card className="mb-4 sm:mb-6 border-purple-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <CardContent className="pt-4 sm:pt-6 pb-4 sm:pb-6">
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <Bot className="h-6 sm:h-8 w-6 sm:w-8 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">How to Use Agentic Workflow</h3>
                <ol className="space-y-2 text-xs sm:text-sm text-gray-700">
                  <li className="flex items-start">
                    <span className="font-bold text-purple-600 mr-2 flex-shrink-0">1.</span>
                    <span>(Optional) Add your Gemini API key for AI-powered suggestions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-purple-600 mr-2 flex-shrink-0">2.</span>
                    <span>Upload a resume (PDF or DOCX format)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-purple-600 mr-2 flex-shrink-0">3.</span>
                    <span>Paste the job description you're hiring for</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-bold text-purple-600 mr-2 flex-shrink-0">4.</span>
                    <span>Click "Start Agentic Analysis" and watch the magic happen! ✨</span>
                  </li>
                </ol>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* API Key Configuration - Mobile Responsive */}
        <Card className="mb-4 sm:mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-3 sm:pb-6">
            <CardTitle className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-xl sm:text-2xl">🔑</span>
                <span className="text-base sm:text-lg">Gemini API Key</span>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
                  Optional
                </span>
              </div>
              <Button
                onClick={() => setShowApiKey(!showApiKey)}
                variant="outline"
                size="sm"
                className="w-full sm:w-auto"
              >
                {showApiKey ? 'Hide' : 'Configure'}
              </Button>
            </CardTitle>
            <CardDescription className="text-xs sm:text-sm">
              Add your Gemini API key for <strong>AI-powered suggestions</strong>. Leave empty for basic ML-based analysis.
            </CardDescription>
          </CardHeader>
          {showApiKey && (
            <CardContent className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your Gemini API key (starts with AIza...)"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-xs sm:text-sm transition-all"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  Get API Key from Google AI Studio →
                </a>
                
                <Button
                  onClick={() => {
                    if (apiKey.trim()) {
                      alert('API key will be validated when you start the analysis');
                    } else {
                      alert('Please enter an API key first');
                    }
                  }}
                  variant="outline"
                  size="sm"
                  disabled={!apiKey.trim()}
                  className="flex items-center space-x-2 w-full sm:w-auto"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Test API Key</span>
                </Button>
              </div>

              <div className="bg-blue-100 border border-blue-200 rounded-lg p-3 mt-3">
                <p className="text-xs text-blue-800">
                  <strong>💡 Pro Tip:</strong> With a Gemini API key, you'll get advanced AI-powered suggestions 
                  with 95%+ accuracy. Without it, you'll still get basic ML-based analysis for free!
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Input Section - Two Column Layout - Mobile Responsive */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6">
          {/* File Upload */}
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">📄</span>
                <span>Step 1: Upload Resume</span>
              </CardTitle>
              <CardDescription>
                Upload candidate's resume (PDF or DOCX format)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center w-full">
                <label className={`flex flex-col items-center justify-center w-full h-40 border-3 border-dashed rounded-lg cursor-pointer transition-all ${
                  file 
                    ? 'border-green-500 bg-green-100 hover:bg-green-200' 
                    : 'border-gray-300 bg-white hover:bg-gray-50'
                }`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {file ? (
                      <>
                        <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
                        <p className="text-sm font-semibold text-green-700 mb-1">
                          {file.name}
                        </p>
                        <p className="text-xs text-green-600">
                          {Math.round(file.size / 1024)}KB • Click to change
                        </p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-12 w-12 text-gray-400 mb-3" />
                        <p className="text-sm font-semibold text-gray-700 mb-1">
                          Click to upload resume
                        </p>
                        <p className="text-xs text-gray-500">
                          PDF or DOCX (Max 10MB)
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                  />
                </label>
              </div>
              
              {file && (
                <div className="mt-3 flex justify-center">
                  <Button
                    onClick={() => setFile(null)}
                    variant="outline"
                    size="sm"
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Remove File
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Description */}
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">💼</span>
                <span>Step 2: Job Description</span>
              </CardTitle>
              <CardDescription>
                Paste the job description to analyze candidate fit
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste job description here...

Example:
- Required skills: React, TypeScript, Node.js
- 3+ years of experience
- Strong communication skills"
                  className={`w-full h-40 p-4 border-2 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none transition-all ${
                    jobDescription.trim() 
                      ? 'border-orange-300 bg-white' 
                      : 'border-gray-300 bg-white'
                  }`}
                />
                <div className="absolute bottom-2 right-2 text-xs text-gray-500">
                  {jobDescription.length} characters
                </div>
              </div>
              
              {jobDescription.trim() && (
                <div className="mt-3 flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-700 font-medium">
                    Job description added ✓
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Execute Button Section */}
        <div className="mb-8">
          <Card className="border-indigo-300 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
            <CardContent className="pt-6 pb-6">
              <div className="flex flex-col items-center space-y-4">
                {/* Ready Status Indicators - Mobile Responsive */}
                <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 mb-2 w-full justify-center">
                  <div className="flex items-center space-x-2">
                    {file ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium whitespace-nowrap ${file ? 'text-green-700' : 'text-gray-500'}`}>
                      Resume
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {jobDescription.trim() ? (
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium whitespace-nowrap ${jobDescription.trim() ? 'text-green-700' : 'text-gray-500'}`}>
                      Job Description
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {apiKey.trim() ? (
                      <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                    )}
                    <span className={`text-sm font-medium whitespace-nowrap ${apiKey.trim() ? 'text-blue-700' : 'text-gray-500'}`}>
                      API Key (Optional)
                    </span>
                  </div>
                </div>

                {/* Execute Button - Mobile Responsive */}
                <Button
                  onClick={handleExecute}
                  disabled={Boolean(!file || jobDescription.trim().length === 0 || isLoading)}
                  size="lg"
                  className="w-full sm:w-auto px-8 sm:px-16 py-6 sm:py-7 text-lg sm:text-xl font-bold shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 sm:mr-3 h-6 sm:h-7 w-6 sm:w-7 animate-spin" />
                      <span className="text-base sm:text-xl">Processing...</span>
                    </>
                  ) : (
                    <>
                      <Bot className="mr-2 sm:mr-3 h-6 sm:h-7 w-6 sm:w-7" />
                      <span className="text-base sm:text-xl">Start Agentic Analysis</span>
                    </>
                  )}
                </Button>

                {/* Helper Text - Mobile Responsive */}
                {(!file || !jobDescription.trim()) && (
                  <p className="text-xs sm:text-sm text-gray-600 text-center px-4">
                    {!file && !jobDescription.trim() 
                      ? '📌 Please upload a resume and add job description to continue'
                      : !file
                      ? '📌 Please upload a resume to continue'
                      : '📌 Please add job description to continue'
                    }
                  </p>
                )}
                
                {file && jobDescription.trim() && !isLoading && (
                  <p className="text-xs sm:text-sm text-green-700 font-medium text-center flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 px-4">
                    <CheckCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Ready to analyze! Click the button above to start.</span>
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
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

            {/* AI-Powered Suggestions - Top 3 */}
            <Card className="border-purple-300 bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-purple-800 flex items-center space-x-2 text-2xl">
                      <span>💡</span>
                      <span>Top 3 Improvement Suggestions</span>
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {result.suggestions.usedAI 
                        ? `✨ AI-powered recommendations from ${result.suggestions.model}`
                        : '🤖 ML-based recommendations'
                      }
                    </CardDescription>
                  </div>
                  {result.suggestions.usedAI && (
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      AI-Powered
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {result.suggestions.suggestions.slice(0, 3).map((suggestion, idx) => {
                    // Extract category and content if formatted with **Category:**
                    const categoryMatch = suggestion.match(/^\*\*([^:]+):\*\*\s*(.+)/);
                    const category = categoryMatch ? categoryMatch[1] : null;
                    const content = categoryMatch ? categoryMatch[2] : suggestion;
                    
                    const colors = [
                      { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-500', text: 'text-blue-700' },
                      { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-500', text: 'text-green-700' },
                      { bg: 'bg-orange-50', border: 'border-orange-200', badge: 'bg-orange-500', text: 'text-orange-700' }
                    ];
                    
                    const color = colors[idx];
                    
                    return (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`relative p-5 ${color.bg} border-2 ${color.border} rounded-xl shadow-md hover:shadow-lg transition-all`}
                      >
                        {/* Number Badge */}
                        <div className={`absolute -left-3 -top-3 w-10 h-10 ${color.badge} text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                          {idx + 1}
                        </div>
                        
                        {/* Category Badge */}
                        {category && (
                          <div className="mb-2">
                            <span className={`inline-block ${color.badge} text-white px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide`}>
                              {category}
                            </span>
                          </div>
                        )}
                        
                        {/* Content */}
                        <p className={`text-sm ${color.text} leading-relaxed pl-2`}>
                          {content}
                        </p>
                      </motion.div>
                    );
                  })}
                </div>
                
                {/* Footer */}
                <div className="mt-6 pt-4 border-t-2 border-purple-200">
                  <p className="text-xs text-purple-700 text-center font-medium">
                    {result.suggestions.usedAI 
                      ? '✨ These AI-powered suggestions are tailored specifically to improve your match for this role'
                      : '💼 These suggestions are generated using machine learning analysis'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
