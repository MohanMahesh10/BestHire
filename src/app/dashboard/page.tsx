'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, TrendingUp, Award, Brain } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { storage } from '@/lib/storage';
import { AnalyticsData } from '@/types';

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    const data = storage.getAnalytics();
    setAnalytics(data);
  }, []);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const sentimentData = [
    { name: 'Positive', value: analytics.sentimentDistribution.positive, color: '#22c55e' },
    { name: 'Neutral', value: analytics.sentimentDistribution.neutral, color: '#eab308' },
    { name: 'Negative', value: analytics.sentimentDistribution.negative, color: '#ef4444' },
  ];

  const topSkillsData = analytics.topSkills.slice(0, 8);

  return (
    <div className="max-w-7xl mx-auto space-y-4 md:space-y-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <h1 className="text-2xl md:text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Visualize recruitment metrics and insights
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Total Candidates</CardTitle>
              <Users className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{analytics.totalCandidates}</div>
              <p className="text-xs text-muted-foreground">Resumes parsed</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Avg Match</CardTitle>
              <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">
                {(analytics.averageMatchScore * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">All candidates</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">Top Skills</CardTitle>
              <Award className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-xl md:text-2xl font-bold">{analytics.topSkills.length}</div>
              <p className="text-xs text-muted-foreground">Unique skills</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
              <CardTitle className="text-xs md:text-sm font-medium">AI Powered</CardTitle>
              <Brain className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
              <div className="text-lg md:text-2xl font-bold">Local ML</div>
              <p className="text-xs text-muted-foreground">Fast & Free</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Confusion Matrix */}
      {analytics.confusionMatrix && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Confusion Matrix</CardTitle>
              <CardDescription>Model prediction accuracy (Match Score vs Sentiment)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto">
                <div className="text-center">
                  <div className="text-xs md:text-sm text-muted-foreground mb-2">Predicted Positive</div>
                  <div className="space-y-2">
                    <div className="bg-green-100 border-2 border-green-500 p-3 md:p-4 rounded-lg">
                      <div className="text-lg md:text-2xl font-bold text-green-700">
                        {analytics.confusionMatrix.truePositive}
                      </div>
                      <div className="text-xs text-green-600">True Positive</div>
                    </div>
                    <div className="bg-orange-100 border-2 border-orange-500 p-3 md:p-4 rounded-lg">
                      <div className="text-lg md:text-2xl font-bold text-orange-700">
                        {analytics.confusionMatrix.falsePositive}
                      </div>
                      <div className="text-xs text-orange-600">False Positive</div>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-xs md:text-sm text-muted-foreground mb-2">Predicted Negative</div>
                  <div className="space-y-2">
                    <div className="bg-orange-100 border-2 border-orange-500 p-3 md:p-4 rounded-lg">
                      <div className="text-lg md:text-2xl font-bold text-orange-700">
                        {analytics.confusionMatrix.falseNegative}
                      </div>
                      <div className="text-xs text-orange-600">False Negative</div>
                    </div>
                    <div className="bg-green-100 border-2 border-green-500 p-3 md:p-4 rounded-lg">
                      <div className="text-lg md:text-2xl font-bold text-green-700">
                        {analytics.confusionMatrix.trueNegative}
                      </div>
                      <div className="text-xs text-green-600">True Negative</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-xs md:text-sm text-muted-foreground">
                  <span className="font-semibold">Accuracy: </span>
                  {(() => {
                    const total = analytics.confusionMatrix.truePositive + 
                                  analytics.confusionMatrix.trueNegative + 
                                  analytics.confusionMatrix.falsePositive + 
                                  analytics.confusionMatrix.falseNegative;
                    const correct = analytics.confusionMatrix.truePositive + analytics.confusionMatrix.trueNegative;
                    return total > 0 ? `${((correct / total) * 100).toFixed(1)}%` : 'N/A';
                  })()}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Match Distribution */}
      {analytics.matchDistribution && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Match Score Distribution</CardTitle>
              <CardDescription>Candidate distribution by match percentage</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                <BarChart data={analytics.matchDistribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="range" 
                    fontSize={10}
                    className="md:text-xs"
                  />
                  <YAxis fontSize={10} className="md:text-xs" />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Top Skills</CardTitle>
              <CardDescription>Most common skills across candidates</CardDescription>
            </CardHeader>
            <CardContent>
              {topSkillsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <BarChart data={topSkillsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="skill" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      fontSize={10}
                      className="md:text-xs"
                    />
                    <YAxis fontSize={10} className="md:text-xs" />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No skill data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Sentiment Distribution</CardTitle>
              <CardDescription>Candidate sentiment analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {analytics.totalCandidates > 0 ? (
                <ResponsiveContainer width="100%" height={250} className="md:h-[300px]">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={60}
                      className="md:outerRadius-80"
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                  No sentiment data available
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Top Skills List */}
      {analytics.topSkills.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>All Skills Breakdown</CardTitle>
              <CardDescription>Complete list of candidate skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
                {analytics.topSkills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 md:p-3 bg-secondary/50 rounded-lg"
                  >
                    <span className="font-medium text-xs md:text-sm truncate flex-1">{skill.skill}</span>
                    <span className="bg-primary text-primary-foreground px-2 py-0.5 md:py-1 rounded text-xs md:text-sm ml-2">
                      {skill.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {analytics.totalCandidates === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              No data available yet. Upload resumes to see analytics.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
