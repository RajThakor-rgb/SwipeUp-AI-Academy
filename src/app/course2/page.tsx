'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { cn } from '@/lib/utils';

// Module data for Course 2
const modules = [
  {
    id: 1,
    title: 'Prompt Engineering',
    miniCase: "Velara's marketing team is getting terrible results from AI",
    badge: 'Prompt Specialist',
  },
  {
    id: 2,
    title: 'Generative AI for Content',
    miniCase: 'Velara has no content pipeline and everything is produced manually',
    badge: 'Content Architect',
  },
  {
    id: 3,
    title: 'Customer Service Chatbots',
    miniCase: '200 unread customer emails arrive every Monday morning',
    badge: 'Chatbot Builder',
  },
  {
    id: 4,
    title: 'API Basics for Business',
    miniCase: "Velara's data is trapped in disconnected systems",
    badge: 'Integration Strategist',
  },
  {
    id: 5,
    title: 'Notion AI for Project Management',
    miniCase: "Last season's product launch had 6 missed deadlines",
    badge: 'Operations Lead',
  },
  {
    id: 6,
    title: 'CRM and Salesforce AI',
    miniCase: 'Three high-value customers switched to a competitor last month',
    badge: 'Customer Intelligence Lead',
  },
  {
    id: 7,
    title: 'Workflow Automation',
    miniCase: "Velara's team spends 4 hours every Monday on manual tasks",
    badge: 'Automation Architect',
  },
];

export default function Course2Page() {
  const router = useRouter();
  const { progress, isLoaded } = useAcademyProgress();

  // Redirect if not registered or Course 2 locked
  useEffect(() => {
    if (isLoaded) {
      if (!progress.studentName) {
        router.push('/');
      } else if (!progress.course2Unlocked) {
        router.push('/dashboard');
      }
    }
  }, [isLoaded, progress.studentName, progress.course2Unlocked, router]);

  const getModuleStatus = (moduleId: number): 'unlocked' | 'locked' | 'completed' => {
    if (progress.course2ModulesCompleted.includes(moduleId)) {
      return 'completed';
    }
    if (moduleId === 1) {
      return 'unlocked';
    }
    // Module is unlocked if the previous one is completed
    if (progress.course2ModulesCompleted.includes(moduleId - 1)) {
      return 'unlocked';
    }
    return 'locked';
  };

  const handleEnterModule = (moduleId: number) => {
    const status = getModuleStatus(moduleId);
    if (status === 'unlocked') {
      router.push(`/course2/module${moduleId}`);
    }
  };

  if (!isLoaded || !progress.studentName || !progress.course2Unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    );
  }

  const completedCount = progress.course2ModulesCompleted.length;

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Header */}
      <header className="bg-secondary/50 border-b border-border sticky top-0 z-40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-slate-400 hover:text-white transition-colors"
          >
            ← Back
          </button>
          <div className="flex-1">
            <h1 className="font-bold text-white">Course 2: Productivity and Organisation</h1>
            <p className="text-xs text-slate-400">SwipeUp AI Academy</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">XP</p>
            <p className="text-gold font-bold">{progress.totalXP}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Course Header */}
        <section className="mb-8 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Course 2: Productivity and Organisation
          </h2>
          <p className="text-lg text-gold mb-4">
            Your client is waiting. Six weeks. Seven problems. One AI consultant.
          </p>

          {/* Progress Bar */}
          <div className="bg-secondary/30 border border-border rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Modules Completed</span>
              <span className="text-gold font-medium">{completedCount}/7</span>
            </div>
            <div className="h-3 bg-background rounded-full overflow-hidden">
              <div
                className="h-full progress-gold transition-all duration-500"
                style={{ width: `${(completedCount / 7) * 100}%` }}
              />
            </div>
          </div>
        </section>

        {/* Velara Company Briefing */}
        <section className="mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="bg-white text-slate-900 rounded-xl overflow-hidden shadow-xl">
            {/* Brief Header */}
            <div className="bg-[#1B3A6B] text-white px-6 py-3 flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider">Client Briefing Document</span>
              <span className="text-xs bg-red-600 px-2 py-0.5 rounded font-medium">CONFIDENTIAL</span>
            </div>

            {/* Company Info */}
            <div className="px-6 py-5 border-b border-slate-200">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Company</p>
                  <p className="font-bold text-lg text-[#1B3A6B]">Velara</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Sector</p>
                  <p className="font-medium">Fashion Retail & E-Commerce</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Employees</p>
                  <p className="font-medium">70</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-wider">Annual Revenue</p>
                  <p className="font-medium">£4.2 million</p>
                </div>
              </div>
            </div>

            {/* Email Interface */}
            <div className="px-6 py-5">
              <div className="bg-slate-100 rounded-lg p-4">
                {/* Email Header */}
                <div className="grid gap-2 text-sm mb-4 pb-4 border-b border-slate-200">
                  <div className="flex">
                    <span className="w-16 text-slate-500">From:</span>
                    <span className="font-medium">Sarah Chen &lt;sarah.chen@velara.co.uk&gt;</span>
                  </div>
                  <div className="flex">
                    <span className="w-16 text-slate-500">To:</span>
                    <span className="font-medium">AI Consultant</span>
                  </div>
                  <div className="flex">
                    <span className="w-16 text-slate-500">Subject:</span>
                    <span className="font-medium text-[#1B3A6B]">Urgent — We need your help</span>
                  </div>
                </div>

                {/* Email Body */}
                <div className="text-sm leading-relaxed text-slate-700 space-y-4">
                  <p>Thank you for agreeing to take us on as a client.</p>
                  <p>I will be honest with you — we are behind. Every competitor we have is talking about AI. Our team knows they <em>should</em> be using it but nobody really knows <em>how</em>.</p>
                  <p>Last month someone used ChatGPT to write a product description and it mentioned one of our competitors by name. That was the moment I knew we needed outside help.</p>
                  <p>You have six weeks. Six weeks to transform how this business uses AI across every part of our operation.</p>
                  <p>I am giving you full access to our team and our processes.</p>
                  <p className="font-medium">Please do not let us down.</p>
                  <p className="text-slate-500 mt-4">
                    — Sarah Chen<br />
                    <span className="text-xs">Managing Director, Velara</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Module Roadmap */}
        <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Module Roadmap</h3>
          <div className="space-y-3">
            {modules.map((module) => {
              const status = getModuleStatus(module.id);
              const isLocked = status === 'locked';
              const isCompleted = status === 'completed';

              return (
                <div
                  key={module.id}
                  className={cn(
                    "bg-secondary/30 border rounded-xl p-4 transition-all",
                    isLocked ? "opacity-60 border-border" : "border-border hover:border-gold",
                    !isLocked && "card-hover"
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Module Number */}
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
                      isCompleted ? "bg-green-500 text-white" :
                      isLocked ? "bg-slate-700 text-slate-400" :
                      "bg-gold text-navy"
                    )}>
                      {isCompleted ? '✓' : module.id}
                    </div>

                    {/* Module Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-white">
                        Module {module.id}: {module.title}
                      </h4>
                      <p className="text-sm text-slate-400 line-clamp-1">{module.miniCase}</p>
                      <p className="text-xs text-gold mt-1">🏅 Badge: {module.badge}</p>
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isCompleted ? "bg-green-600/30 text-green-400" :
                        isLocked ? "bg-slate-700 text-slate-400" :
                        "bg-gold/20 text-gold"
                      )}>
                        {isCompleted ? 'Completed' : isLocked ? 'Locked' : 'Unlocked'}
                      </span>
                      <button
                        onClick={() => handleEnterModule(module.id)}
                        disabled={isLocked}
                        className={cn(
                          "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                          isLocked
                            ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                            : isCompleted
                            ? "bg-green-600 text-white hover:bg-green-700"
                            : "bg-gold text-navy hover:bg-gold-light"
                        )}
                      >
                        {isLocked ? 'Locked' : isCompleted ? 'Review' : 'Enter Module'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-8 border-t border-border">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2025 SwipeUp AI Society • University of Law
          </p>
        </div>
      </footer>
    </div>
  );
}
