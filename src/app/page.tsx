'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Upload, Users, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/Button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/Card';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to recruit page immediately
    router.replace('/recruit');
  }, [router]);

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-4 rounded-2xl shadow-lg animate-pulse">
            <Sparkles className="h-12 w-12 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Redirecting to BestHire...</h2>
        <p className="text-gray-600">Please wait</p>
      </div>
    </div>
  );

  const features = [
    {
      icon: Upload,
      title: 'AI Resume Parsing',
      description: 'Upload PDF/DOCX resumes and extract structured data using Gemini AI',
      href: '/upload',
    },
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'Match candidates with job descriptions using AI embeddings and similarity scores',
      href: '/match',
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Visualize recruitment metrics, top skills, and sentiment analysis',
      href: '/dashboard',
    },
  ];

  return (
    <div className="space-y-8 md:space-y-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 px-4"
      >
        <div className="flex items-center justify-center gap-3">
          <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-2xl shadow-lg shadow-purple-500/50">
            <Sparkles className="h-6 w-6 md:h-8 md:w-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold gradient-text">BestHire</h1>
        </div>
        <p className="text-base md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
          AI-powered recruitment platform that helps you parse resumes, rank candidates, 
          and make <span className="font-semibold gradient-text">data-driven hiring decisions</span>.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center pt-4">
          <Link href="/upload" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-base">
              🚀 Get Started
            </Button>
          </Link>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-base">
              📊 View Analytics
            </Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Link href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <Icon className="h-8 w-8 md:h-10 md:w-10 text-primary mb-2" />
                    <CardTitle className="text-lg md:text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-sm">{feature.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl p-6 md:p-8 text-center shadow-2xl shadow-purple-500/30"
      >
        <h2 className="text-xl md:text-2xl font-bold mb-2 text-white">✨ Powered by Local ML</h2>
        <p className="text-sm md:text-base text-white/90">
          Advanced AI technology for resume parsing, semantic matching, and sentiment analysis.
          <br className="hidden md:block" />
          <span className="font-semibold">All data stored locally</span> for privacy and speed. 100% Free Forever!
        </p>
      </motion.div>
    </div>
  );
}
