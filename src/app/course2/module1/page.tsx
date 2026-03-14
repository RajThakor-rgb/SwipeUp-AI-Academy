'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { logProgress } from '@/lib/notion';
import { cn } from '@/lib/utils';

// Types
type Phase = 'prepare' | 'engage' | 'consolidate';
type EngageStage = 'iDo' | 'weDo' | 'youDo' | 'final';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

// MCQ Questions (exactly as specified)
const mcqQuestions: MCQQuestion[] = [
  {
    id: 'q1',
    question: 'According to Kaplan and Haenlein (2019), which of the following best describes artificial intelligence?',
    options: [
      'Software that replaces human workers entirely',
      'Systems that simulate human cognitive functions such as learning and problem-solving',
      'Automated data storage and retrieval systems',
      'Internet-connected devices that collect user data',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    question: 'What is the single most important element of an effective business prompt?',
    options: [
      'Making the prompt as short as possible',
      'Using highly technical language',
      'Providing clear context and specifying the desired output',
      'Asking multiple questions within one prompt',
    ],
    correct: 2,
  },
  {
    id: 'q3',
    question: 'Which of the following is NOT a characteristic of a well-structured prompt?',
    options: [
      'Assigning a role to the AI',
      'Specifying the output format',
      'Keeping the prompt under five words',
      'Providing relevant background context',
    ],
    correct: 2,
  },
  {
    id: 'q4',
    question: 'A Velara team member writes this prompt: "Write something about our new collection." What is the main problem with this prompt?',
    options: [
      'It is too polite',
      'It lacks role, context, format and goal',
      'It is too long',
      'It uses informal language',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    question: 'Based on the briefing you read, what is Velara\'s primary AI-related problem?',
    options: [
      'They cannot afford AI tools',
      'Their MD does not believe in AI',
      'Their team is using AI without proper prompting skills and structure',
      'They have no internet connection in their office',
    ],
    correct: 2,
  },
];

// Video resources
const videos = [
  { title: 'Prompt Engineering Fundamentals', duration: '12 min', url: 'https://www.youtube.com/watch?v=_ZvnD73m40o' },
  { title: 'Business Prompt Writing Guide', duration: '8 min', url: 'https://www.youtube.com/watch?v=jC4v5AS4RIM' },
  { title: 'Advanced Prompting Techniques', duration: '15 min', url: 'https://www.youtube.com/watch?v=mBYu5NdD9XU' },
];

// Phase Progress Indicator Component
function PhaseIndicator({ currentPhase }: { currentPhase: Phase }) {
  const phases = [
    { id: 'prepare', label: 'Prepare', icon: '📖' },
    { id: 'engage', label: 'Engage', icon: '🎯' },
    { id: 'consolidate', label: 'Consolidate', icon: '🏅' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {phases.map((phase, idx) => {
        const isActive = phase.id === currentPhase;
        const isPast = phases.findIndex(p => p.id === currentPhase) > idx;
        
        return (
          <div key={phase.id} className="flex items-center">
            <div className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border transition-all",
              isActive && "bg-gold text-navy border-gold",
              isPast && "bg-green-500/20 text-green-400 border-green-500/50",
              !isActive && !isPast && "bg-slate-800 text-slate-400 border-slate-700"
            )}>
              <span>{phase.icon}</span>
              <span className="text-sm font-medium">{phase.label}</span>
            </div>
            {idx < phases.length - 1 && (
              <div className={cn(
                "w-8 h-0.5 mx-1",
                isPast ? "bg-green-500" : "bg-slate-700"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// Slack Message Component
function SlackMessage({ from, avatar, message, time }: { from: string; avatar: string; message: string; time: string }) {
  return (
    <div className="bg-slate-800/80 border border-slate-700 rounded-lg p-4 mb-4 animate-slide-in">
      <div className="flex gap-3">
        <div className="w-10 h-10 rounded-lg bg-gold flex items-center justify-center text-navy font-bold shrink-0">
          {avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-white">{from}</span>
            <span className="text-xs text-slate-500">{time}</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Intel File Card Component
function IntelFileCard({ title, subtitle, read, onToggle }: { title: string; subtitle: string; read: boolean; onToggle: () => void }) {
  return (
    <div className={cn(
      "bg-slate-900/80 border rounded-lg p-4 transition-all cursor-pointer",
      read ? "border-green-500/50 bg-green-500/5" : "border-slate-700 hover:border-gold/50"
    )} onClick={onToggle}>
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          read ? "bg-green-500/20 text-green-400" : "bg-navy text-gold"
        )}>
          {read ? '✓' : '📄'}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-white text-sm">{title}</h4>
          <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
        </div>
        <div className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">
          {read ? 'READ' : 'READ?'}
        </div>
      </div>
    </div>
  );
}

// Video Card Component
function VideoCard({ title, duration, url, watched, onToggle }: { title: string; duration: string; url: string; watched: boolean; onToggle: () => void }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "bg-slate-900/80 border rounded-lg p-4 transition-all block group",
        watched ? "border-green-500/50" : "border-slate-700 hover:border-gold/50"
      )}
      onClick={onToggle}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "w-16 h-12 rounded bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-navy transition-colors",
          watched && "bg-green-500/20"
        )}>
          {watched ? (
            <span className="text-green-400">✓</span>
          ) : (
            <span className="text-gold text-xl">▶</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-white text-sm group-hover:text-gold transition-colors">{title}</h4>
          <p className="text-xs text-slate-500 mt-1">{duration}</p>
        </div>
        <span className="text-slate-400 group-hover:text-gold transition-colors">↗</span>
      </div>
    </a>
  );
}

// MCQ Gate Component
function MCQGate({ onComplete }: { onComplete: () => void }) {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showRetry, setShowRetry] = useState(false);

  const handleSubmit = () => {
    let correct = 0;
    mcqQuestions.forEach(q => {
      if (answers[q.id] === q.correct) correct++;
    });
    setScore(correct);
    setSubmitted(true);

    if (correct === 5) {
      setTimeout(onComplete, 1500);
    } else {
      setShowRetry(true);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowRetry(false);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-navy px-4 py-3 border-b border-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gold text-lg">🔐</span>
            <h3 className="text-white font-semibold">Security Clearance</h3>
          </div>
          <span className="text-xs text-slate-400">Score 5/5 to proceed</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {mcqQuestions.map((q, idx) => (
          <div key={q.id} className="space-y-2">
            <p className="text-white text-sm font-medium">
              {idx + 1}. {q.question}
            </p>
            <div className="grid gap-2">
              {q.options.map((opt, optIdx) => (
                <label
                  key={optIdx}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                    submitted && optIdx === q.correct && "bg-green-500/20 border-green-500",
                    submitted && answers[q.id] === optIdx && optIdx !== q.correct && "bg-red-500/20 border-red-500",
                    !submitted && answers[q.id] === optIdx && "bg-gold/10 border-gold",
                    !submitted && answers[q.id] !== optIdx && "bg-slate-800 border-slate-700 hover:border-gold/50"
                  )}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === optIdx}
                    onChange={() => !submitted && setAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                    className="text-gold"
                    disabled={submitted}
                  />
                  <span className="text-sm text-slate-300">{opt}</span>
                  {submitted && optIdx === q.correct && (
                    <span className="ml-auto text-green-400 text-xs">✓ Correct</span>
                  )}
                  {submitted && answers[q.id] === optIdx && optIdx !== q.correct && (
                    <span className="ml-auto text-red-400 text-xs">✗ Incorrect</span>
                  )}
                </label>
              ))}
            </div>
          </div>
        ))}

        {submitted && (
          <div className={cn(
            "p-4 rounded-lg text-center",
            score === 5 ? "bg-green-500/20 border border-green-500/50" : "bg-gold/10 border border-gold/30"
          )}>
            <p className={cn("font-bold text-lg", score === 5 ? "text-green-400" : "text-gold")}>
              {score === 5 && "🎉 Security Clearance Granted! Proceeding to Engage phase..."}
              {score === 4 && "Almost there! One more try."}
              {score <= 3 && "Some material needs another look. Please review and retry."}
            </p>
            <p className="text-slate-400 text-sm mt-2">Score: {score}/5</p>
          </div>
        )}

        {!submitted ? (
          <button
            onClick={handleSubmit}
            disabled={Object.keys(answers).length < 5}
            className="w-full py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Submit for Verification
          </button>
        ) : showRetry && score < 5 ? (
          <button
            onClick={handleRetry}
            className="w-full py-3 bg-navy border border-gold text-gold rounded-lg font-semibold hover:bg-navy-light transition-all"
          >
            Retry Clearance Check
          </button>
        ) : null}
      </div>
    </div>
  );
}

// Task Card Component
function TaskCard({ title, children, badge }: { title: string; children: React.ReactNode; badge?: string }) {
  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-5 mb-4 animate-slide-in">
      {badge && (
        <div className="inline-block px-2 py-1 bg-gold/20 text-gold text-xs rounded mb-3">
          {badge}
        </div>
      )}
      <h4 className="text-white font-semibold mb-4">{title}</h4>
      {children}
    </div>
  );
}

// Score Breakdown Component
function ScoreBreakdown({ criteria }: { criteria: { name: string; passed: boolean }[] }) {
  const passedCount = criteria.filter(c => c.passed).length;
  
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-white">Score Breakdown</span>
        <span className={cn(
          "text-sm font-bold",
          passedCount >= 4 ? "text-green-400" : passedCount >= 2 ? "text-gold" : "text-red-400"
        )}>
          {passedCount}/{criteria.length}
        </span>
      </div>
      <div className="space-y-2">
        {criteria.map((c, idx) => (
          <div key={idx} className="flex items-center justify-between text-sm">
            <span className="text-slate-400">{c.name}</span>
            <span className={c.passed ? "text-green-400" : "text-red-400"}>
              {c.passed ? '✓' : '✗'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// XP Animation Component
function XPCounter({ amount }: { amount: number }) {
  return (
    <div className="text-center animate-fade-in">
      <span className="text-gold text-lg font-bold">+{amount} XP</span>
    </div>
  );
}

// Main Module 1 Component
export default function Module1Page() {
  const router = useRouter();
  const { progress, isLoaded, addXP, addBadge, completeModule2, completePrepare2 } = useAcademyProgress();
  
  // Phase state
  const [phase, setPhase] = useState<Phase>('prepare');
  const [moduleXP, setModuleXP] = useState(0);
  
  // Prepare state
  const [paper1Read, setPaper1Read] = useState(false);
  const [paper2Read, setPaper2Read] = useState(false);
  const [videosWatched, setVideosWatched] = useState<boolean[]>([false, false, false]);
  const [mcqComplete, setMcqComplete] = useState(false);
  
  // Engage state
  const [engageStage, setEngageStage] = useState<EngageStage>('iDo');
  const [iDoWatched, setIDoWatched] = useState(false);
  
  // We Do state
  const [weDoTask, setWeDoTask] = useState(1);
  const [weDo1Answers, setWeDo1Answers] = useState<string[]>([]);
  const [weDo1Complete, setWeDo1Complete] = useState(false);
  const [weDo2Text, setWeDo2Text] = useState('');
  const [weDo2Score, setWeDo2Score] = useState<{ name: string; passed: boolean }[] | null>(null);
  const [weDo3Text, setWeDo3Text] = useState('');
  const [weDo3Score, setWeDo3Score] = useState<{ name: string; passed: boolean }[] | null>(null);
  
  // You Do state
  const [youDoTask, setYouDoTask] = useState(1);
  const [youDo1Text, setYouDo1Text] = useState('');
  const [youDo1Score, setYouDo1Score] = useState<{ name: string; passed: boolean }[] | null>(null);
  const [youDo2Text, setYouDo2Text] = useState('');
  const [youDo2Score, setYouDo2Score] = useState<{ name: string; passed: boolean }[] | null>(null);
  const [youDo3Text, setYouDo3Text] = useState('');
  const [youDo3Score, setYouDo3Score] = useState<{ name: string; passed: boolean }[] | null>(null);
  
  // Final challenge state
  const [finalPrompt, setFinalPrompt] = useState('');
  const [finalExplanation, setFinalExplanation] = useState('');
  const [finalScore, setFinalScore] = useState<{ name: string; passed: boolean }[] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect checks
  useEffect(() => {
    if (isLoaded && !progress.studentName) {
      router.push('/');
    }
  }, [isLoaded, progress.studentName, router]);

  // Check if returning user
  useEffect(() => {
    if (progress.course2PrepareCompleted.includes(1)) {
      setMcqComplete(true);
      setPaper1Read(true);
      setPaper2Read(true);
      setPhase('engage');
    }
  }, [progress.course2PrepareCompleted]);

  // Handle MCQ complete
  const handleMcqComplete = async () => {
    setMcqComplete(true);
    completePrepare2(1);
    setPhase('engage');
    
    // Log prepare complete
    await logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'Module 1 Prepare Complete',
      details: 'MCQ passed with 5/5 score',
      totalXP: progress.totalXP,
    });
  };

  // We Do Task 1 - Multiple selection
  const handleWeDo1Submit = () => {
    const allCorrect = ['No role assigned to the AI', 'No output format specified', 'No brand context provided', 'No target audience mentioned'];
    const isAllSelected = allCorrect.every(opt => weDo1Answers.includes(opt));
    if (isAllSelected) {
      setWeDo1Complete(true);
      setWeDoTask(2);
    }
  };

  // We Do Task 2 - Rule-based scoring
  const handleWeDo2Submit = () => {
    const text = weDo2Text.toLowerCase();
    const criteria = [
      { name: 'Role Assignment', passed: text.includes('act as') || text.includes('you are') || text.includes('as a') },
      { name: 'Platform Context', passed: text.includes('instagram') || text.includes('social media') || text.includes('post') },
      { name: 'Brand Reference', passed: text.includes('velara') || text.includes('brand') || text.includes('fashion') || text.includes('sustainable') },
      { name: 'Format Specification', passed: text.includes('caption') || text.includes('format') || text.includes('characters') || text.includes('words') },
      { name: 'Sufficient Detail', passed: weDo2Text.split(/\s+/).length >= 30 },
    ];
    setWeDo2Score(criteria);
    
    const xp = 25;
    setModuleXP(prev => prev + xp);
    addXP(xp);
    
    setTimeout(() => {
      setWeDoTask(3);
    }, 2000);
  };

  // We Do Task 3
  const handleWeDo3Submit = () => {
    const text = weDo3Text.toLowerCase();
    const criteria = [
      { name: 'Customer Context', passed: text.includes('customer') || text.includes('complaint') || text.includes('delivery') },
      { name: 'Empathy Language', passed: text.includes('empath') || text.includes('apolog') || text.includes('professional') },
      { name: 'Email Format', passed: text.includes('email') || text.includes('response') || text.includes('reply') },
      { name: 'Tone Specification', passed: text.includes('tone') || text.includes('formal') || text.includes('brand voice') },
      { name: 'Sufficient Detail', passed: weDo3Text.split(/\s+/).length >= 40 },
    ];
    setWeDo3Score(criteria);
    
    const xp = 50;
    setModuleXP(prev => prev + xp);
    addXP(xp);
    
    setTimeout(() => {
      setEngageStage('youDo');
    }, 2000);
  };

  // You Do Challenge scoring functions
  const checkYouDo1 = () => {
    const text = youDo1Text.toLowerCase();
    const criteria = [
      { name: 'Role Assigned', passed: text.includes('act as') || text.includes('you are') || text.includes('as a') },
      { name: 'Product Mentioned', passed: text.includes('velara') || text.includes('midnight edit') },
      { name: 'Length Specified', passed: text.includes('150') || text.includes('word count') || text.includes('length') },
      { name: 'Brand Voice', passed: text.includes('sophisticated') || text.includes('sustainable') || text.includes('british') || text.includes('elegant') },
      { name: 'Output Format', passed: text.includes('description') || text.includes('paragraph') || text.includes('copy') },
    ];
    setYouDo1Score(criteria);
    
    const score = criteria.filter(c => c.passed).length;
    const xp = score >= 4 ? 100 : score >= 2 ? 50 : 0;
    setModuleXP(prev => prev + xp);
    addXP(xp);
    
    logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'You Do Challenge 1 Complete',
      details: `Score: ${score}/5, XP: ${xp}`,
      totalXP: progress.totalXP + xp,
    });
    
    setTimeout(() => setYouDoTask(2), 2000);
  };

  const checkYouDo2 = () => {
    const text = youDo2Text.toLowerCase();
    const criteria = [
      { name: 'Quantity Specified', passed: text.includes('5') || text.includes('five') },
      { name: 'Character Limit', passed: text.includes('150') || text.includes('character') },
      { name: 'Emoji Requirement', passed: text.includes('emoji') },
      { name: 'Hashtag Requirement', passed: text.includes('hashtag') },
      { name: 'Sufficient Detail', passed: youDo2Text.split(/\s+/).length >= 50 },
    ];
    setYouDo2Score(criteria);
    
    const score = criteria.filter(c => c.passed).length;
    const xp = score >= 4 ? 150 : score >= 2 ? 75 : 0;
    setModuleXP(prev => prev + xp);
    addXP(xp);
    
    logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'You Do Challenge 2 Complete',
      details: `Score: ${score}/5, XP: ${xp}`,
      totalXP: progress.totalXP + xp,
    });
    
    setTimeout(() => setYouDoTask(3), 2000);
  };

  const checkYouDo3 = () => {
    const text = youDo3Text.toLowerCase();
    const criteria = [
      { name: 'Empathy/Apology', passed: text.includes('empath') || text.includes('apolog') },
      { name: 'Discount Mentioned', passed: text.includes('10%') || text.includes('discount') || text.includes('compensation') },
      { name: 'Brand Voice', passed: text.includes('brand voice') || text.includes('tone') || text.includes('sophisticated') },
      { name: 'Personalization', passed: text.includes('template') || text.includes('personal') || text.includes('generic') },
      { name: 'Sufficient Detail', passed: youDo3Text.split(/\s+/).length >= 60 },
    ];
    setYouDo3Score(criteria);
    
    const score = criteria.filter(c => c.passed).length;
    const xp = score >= 4 ? 200 : score >= 2 ? 100 : 0;
    setModuleXP(prev => prev + xp);
    addXP(xp);
    
    logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'You Do Challenge 3 Complete',
      details: `Score: ${score}/5, XP: ${xp}`,
      totalXP: progress.totalXP + xp,
    });
    
    setTimeout(() => setEngageStage('final'), 2000);
  };

  // Final Challenge
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    
    const promptText = finalPrompt.toLowerCase();
    const explainText = finalExplanation.toLowerCase();
    
    const promptCriteria = [
      { name: 'Role Assigned', passed: promptText.includes('act as') || promptText.includes('you are') || promptText.includes('as a') },
      { name: 'Board Mentioned', passed: promptText.includes('board') || promptText.includes('director') || promptText.includes('stakeholder') || promptText.includes('executive') },
      { name: 'Sales Context', passed: promptText.includes('sales') || promptText.includes('revenue') || promptText.includes('performance') || promptText.includes('update') },
      { name: 'Format Specified', passed: promptText.includes('bullet') || promptText.includes('section') || promptText.includes('summary') || promptText.includes('format') },
      { name: 'Sufficient Length', passed: finalPrompt.split(/\s+/).length >= 40 },
    ];
    
    const explainCriteria = [
      { name: 'Sufficient Explanation', passed: finalExplanation.split(/\s+/).length >= 30 },
      { name: 'Problem Identified', passed: explainText.includes('missing') || explainText.includes('lack') || explainText.includes('vague') || explainText.includes('unclear') },
      { name: 'Solution Explained', passed: explainText.includes('context') || explainText.includes('specific') || explainText.includes('detail') || explainText.includes('audience') },
    ];
    
    const allCriteria = [...promptCriteria, ...explainCriteria];
    setFinalScore(allCriteria);
    
    const totalScore = allCriteria.filter(c => c.passed).length;
    const xp = totalScore >= 6 ? 250 : totalScore >= 4 ? 150 : 75;
    setModuleXP(prev => prev + xp);
    addXP(xp);
    
    // Complete the module
    completeModule2(1);
    addBadge('Prompt Specialist');
    
    await logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'Module 1 Complete',
      details: `Final score: ${totalScore}/8, Total XP earned: ${moduleXP + xp}`,
      totalXP: progress.totalXP + xp,
    });
    
    setIsSubmitting(false);
    setPhase('consolidate');
  };

  // Loading state
  if (!isLoaded || !progress.studentName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy/95 border-b border-gold/30 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/course2')}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              ← Mission Board
            </button>
            <span className="text-slate-600">|</span>
            <h1 className="text-white font-bold">Module 1: Prompt Engineering</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">XP this module</p>
              <p className="text-gold font-bold">{moduleXP}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Total</p>
              <p className="text-white font-bold">⭐ {progress.totalXP + moduleXP}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <PhaseIndicator currentPhase={phase} />

        {/* PREPARE PHASE */}
        {phase === 'prepare' && (
          <div className="animate-fade-in">
            {/* Slack notification */}
            <SlackMessage
              from="Sarah Chen"
              avatar="SC"
              time="9:02 AM"
              message="We need your help. Our marketing team has been using AI tools for three months and the output is embarrassing. Can you assess what's going wrong and fix it? I've cleared access to our intel files for your review. — Sarah"
            />

            {/* Intel Files Header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <span>📁</span> Intel Files
              </h2>
              <span className="text-xs text-slate-500">Review all materials before the briefing</span>
            </div>

            {/* Academic Papers */}
            <div className="grid sm:grid-cols-2 gap-3 mb-6">
              <IntelFileCard
                title="Kaplan & Haenlein (2019)"
                subtitle="Business Horizons 62(1), pp.15-25 — 'Siri, Siri in my hand'"
                read={paper1Read}
                onToggle={() => setPaper1Read(!paper1Read)}
              />
              <IntelFileCard
                title="Haenlein & Kaplan (2019)"
                subtitle="California Management Review 61(4), pp.5-14 — 'A brief history of AI'"
                read={paper2Read}
                onToggle={() => setPaper2Read(!paper2Read)}
              />
            </div>

            {/* Briefing Videos */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                <span>🎬</span> Briefing Videos
              </h3>
              <div className="grid sm:grid-cols-3 gap-3">
                {videos.map((video, idx) => (
                  <VideoCard
                    key={idx}
                    {...video}
                    watched={videosWatched[idx]}
                    onToggle={() => {
                      const newWatched = [...videosWatched];
                      newWatched[idx] = true;
                      setVideosWatched(newWatched);
                    }}
                  />
                ))}
              </div>
            </div>

            {/* MCQ Gate */}
            <MCQGate onComplete={handleMcqComplete} />
          </div>
        )}

        {/* ENGAGE PHASE */}
        {phase === 'engage' && (
          <div className="animate-fade-in">
            {/* HQ Banner */}
            <div className="bg-navy border border-gold/30 rounded-lg p-3 mb-6 text-center">
              <span className="text-gold text-sm font-medium">
                📍 You are now inside Velara HQ — Marketing Department
              </span>
            </div>

            {/* I DO */}
            {engageStage === 'iDo' && (
              <div>
                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">I Do — Watch Marcus's Approach</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Watch how Senior Consultant Marcus Webb handled the same problem at a previous client.
                  </p>
                  
                  {/* Video Placeholder */}
                  <div className="bg-navy aspect-video rounded-lg flex flex-col items-center justify-center border border-slate-700 mb-4">
                    <div className="text-6xl mb-4">🎬</div>
                    <p className="text-gold font-semibold">Marcus Webb — Prompt Engineering Walkthrough</p>
                    <p className="text-slate-400 text-sm">Video placeholder — Loom embed ready</p>
                  </div>

                  {/* Sign-off checkbox */}
                  <label className={cn(
                    "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                    iDoWatched ? "bg-green-500/10 border-green-500/50" : "bg-slate-800 border-slate-700 hover:border-gold/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={iDoWatched}
                      onChange={(e) => setIDoWatched(e.target.checked)}
                      className="w-5 h-5 text-gold rounded"
                    />
                    <span className={cn("text-sm", iDoWatched ? "text-green-400" : "text-slate-300")}>
                      ✓ I have reviewed Marcus's approach and am ready to proceed
                    </span>
                  </label>
                </div>

                {iDoWatched && (
                  <button
                    onClick={() => setEngageStage('weDo')}
                    className="w-full py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-all"
                  >
                    Proceed to We Do →
                  </button>
                )}
              </div>
            )}

            {/* WE DO */}
            {engageStage === 'weDo' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">We Do — Guided Practice</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Tasks are arriving on your desk. Work through each one with Marcus's guidance.
                </p>

                {/* Task 1 */}
                {weDoTask === 1 && (
                  <TaskCard title="Task 1: Diagnose the Problem" badge="Guided">
                    <p className="text-slate-300 text-sm mb-4">
                      Velara's marketing team wrote this prompt last week:
                    </p>
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-4 font-mono text-slate-200">
                      "Write about our summer dress"
                    </div>
                    <p className="text-white text-sm mb-3">What is missing from this prompt? (Select all that apply)</p>
                    
                    {['No role assigned to the AI', 'No output format specified', 'No brand context provided', 'No target audience mentioned'].map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all mb-2",
                          weDo1Answers.includes(opt) ? "bg-gold/10 border-gold" : "bg-slate-800 border-slate-700 hover:border-gold/50"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={weDo1Answers.includes(opt)}
                          onChange={() => {
                            if (weDo1Answers.includes(opt)) {
                              setWeDo1Answers(weDo1Answers.filter(a => a !== opt));
                            } else {
                              setWeDo1Answers([...weDo1Answers, opt]);
                            }
                          }}
                        />
                        <span className="text-slate-300 text-sm">{opt}</span>
                      </label>
                    ))}

                    <button
                      onClick={handleWeDo1Submit}
                      disabled={weDo1Answers.length < 4}
                      className="mt-4 w-full py-2 bg-gold text-navy rounded-lg font-medium disabled:opacity-50"
                    >
                      Submit Diagnosis
                    </button>

                    {weDo1Complete && (
                      <div className="mt-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <p className="text-green-400 text-sm">Correct! All four elements are missing from this prompt. The AI has almost nothing to work with.</p>
                      </div>
                    )}
                  </TaskCard>
                )}

                {/* Task 2 */}
                {weDoTask === 2 && (
                  <TaskCard title="Task 2: Rewrite the Prompt" badge="Guided">
                    <p className="text-slate-300 text-sm mb-4">
                      Velara's marketing team wrote this prompt:
                    </p>
                    <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-4 font-mono text-slate-200">
                      "Make our Instagram post good"
                    </div>
                    <p className="text-white text-sm mb-3">Rewrite this prompt to make it effective. Include a role, context, format, and goal.</p>
                    
                    <textarea
                      value={weDo2Text}
                      onChange={(e) => setWeDo2Text(e.target.value)}
                      placeholder="Write your improved prompt here..."
                      className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {weDo2Score && (
                      <div>
                        <ScoreBreakdown criteria={weDo2Score} />
                        <XPCounter amount={25} />
                      </div>
                    )}

                    <button
                      onClick={handleWeDo2Submit}
                      disabled={weDo2Text.length < 10 || weDo2Score !== null}
                      className="mt-4 w-full py-2 bg-gold text-navy rounded-lg font-medium disabled:opacity-50"
                    >
                      Submit Prompt
                    </button>
                  </TaskCard>
                )}

                {/* Task 3 */}
                {weDoTask === 3 && (
                  <TaskCard title="Task 3: Customer Complaint Scenario" badge="Guided">
                    <p className="text-slate-300 text-sm mb-4">
                      Sarah Chen needs to respond to a customer complaint about a late delivery. Write a complete prompt that would get a professional, empathetic response.
                    </p>
                    
                    <textarea
                      value={weDo3Text}
                      onChange={(e) => setWeDo3Text(e.target.value)}
                      placeholder="Write your prompt for the customer complaint response..."
                      className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {weDo3Score && (
                      <div>
                        <ScoreBreakdown criteria={weDo3Score} />
                        <XPCounter amount={50} />
                      </div>
                    )}

                    <button
                      onClick={handleWeDo3Submit}
                      disabled={weDo3Text.length < 10 || weDo3Score !== null}
                      className="mt-4 w-full py-2 bg-gold text-navy rounded-lg font-medium disabled:opacity-50"
                    >
                      Submit Prompt
                    </button>
                  </TaskCard>
                )}
              </div>
            )}

            {/* YOU DO */}
            {engageStage === 'youDo' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">You Do — Solo Challenges</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Three challenges of increasing difficulty. Apply what you've learned without guidance.
                </p>

                {/* Challenge 1 */}
                {youDoTask === 1 && (
                  <TaskCard title="Quick Fix (Easy)" badge="100 XP">
                    <p className="text-slate-300 text-sm mb-4">
                      Velara is launching a new sustainable evening wear collection called <strong>The Midnight Edit</strong>. 
                      Write a prompt that gets an AI to produce a 150-word product description in Velara's brand voice: sophisticated, sustainable, and British.
                    </p>
                    
                    <textarea
                      value={youDo1Text}
                      onChange={(e) => setYouDo1Text(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {youDo1Score && (
                      <div>
                        <ScoreBreakdown criteria={youDo1Score} />
                        <XPCounter amount={youDo1Score.filter(c => c.passed).length >= 4 ? 100 : youDo1Score.filter(c => c.passed).length >= 2 ? 50 : 0} />
                      </div>
                    )}

                    <button
                      onClick={checkYouDo1}
                      disabled={youDo1Text.length < 10 || youDo1Score !== null}
                      className="mt-4 w-full py-2 bg-gold text-navy rounded-lg font-medium disabled:opacity-50"
                    >
                      Submit Challenge
                    </button>
                  </TaskCard>
                )}

                {/* Challenge 2 */}
                {youDoTask === 2 && (
                  <TaskCard title="Client Presentation (Medium)" badge="150 XP">
                    <p className="text-slate-300 text-sm mb-4">
                      Velara's social media team needs to produce 5 Instagram captions every Monday. 
                      Write a prompt that generates all 5 in one go. Each caption must be under 150 characters, include one relevant emoji, and end with a branded hashtag.
                    </p>
                    
                    <textarea
                      value={youDo2Text}
                      onChange={(e) => setYouDo2Text(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {youDo2Score && (
                      <div>
                        <ScoreBreakdown criteria={youDo2Score} />
                        <XPCounter amount={youDo2Score.filter(c => c.passed).length >= 4 ? 150 : youDo2Score.filter(c => c.passed).length >= 2 ? 75 : 0} />
                      </div>
                    )}

                    <button
                      onClick={checkYouDo2}
                      disabled={youDo2Text.length < 10 || youDo2Score !== null}
                      className="mt-4 w-full py-2 bg-gold text-navy rounded-lg font-medium disabled:opacity-50"
                    >
                      Submit Challenge
                    </button>
                  </TaskCard>
                )}

                {/* Challenge 3 */}
                {youDoTask === 3 && (
                  <TaskCard title="Board-Level Decision (Hard)" badge="200 XP">
                    <p className="text-slate-300 text-sm mb-4">
                      Velara receives approximately 30 identical late delivery complaints every week. 
                      The customer service team copies and pastes the same response. 
                      Write a prompt that generates a response which is empathetic, offers a 10% discount code, maintains Velara's sophisticated brand voice, and does not sound like a template.
                    </p>
                    
                    <textarea
                      value={youDo3Text}
                      onChange={(e) => setYouDo3Text(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {youDo3Score && (
                      <div>
                        <ScoreBreakdown criteria={youDo3Score} />
                        <XPCounter amount={youDo3Score.filter(c => c.passed).length >= 4 ? 200 : youDo3Score.filter(c => c.passed).length >= 2 ? 100 : 0} />
                      </div>
                    )}

                    <button
                      onClick={checkYouDo3}
                      disabled={youDo3Text.length < 10 || youDo3Score !== null}
                      className="mt-4 w-full py-2 bg-gold text-navy rounded-lg font-medium disabled:opacity-50"
                    >
                      Submit Challenge
                    </button>
                  </TaskCard>
                )}
              </div>
            )}

            {/* FINAL CHALLENGE */}
            {engageStage === 'final' && (
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Final Challenge</h3>
                <p className="text-slate-400 text-sm mb-6">
                  Sarah Chen has forwarded you this prompt her PA wrote this morning.
                </p>

                <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6">
                  <div className="bg-slate-800 border border-slate-600 rounded-lg p-4 mb-6 font-mono text-slate-200 text-center text-lg">
                    "Write email"
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-white font-medium mb-2">
                        Part 1: Rewrite this prompt properly so it produces a professional weekly sales update email for Velara's board of directors.
                      </label>
                      <textarea
                        value={finalPrompt}
                        onChange={(e) => setFinalPrompt(e.target.value)}
                        placeholder="Write your rewritten prompt here..."
                        className="w-full h-32 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">
                        Part 2: In 2-3 sentences, explain what was wrong with the original prompt and why your version is better.
                      </label>
                      <textarea
                        value={finalExplanation}
                        onChange={(e) => setFinalExplanation(e.target.value)}
                        placeholder="Write your explanation here..."
                        className="w-full h-24 px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                      />
                    </div>
                  </div>

                  {finalScore && (
                    <div className="mt-6">
                      <ScoreBreakdown criteria={finalScore} />
                      <XPCounter amount={finalScore.filter(c => c.passed).length >= 6 ? 250 : finalScore.filter(c => c.passed).length >= 4 ? 150 : 75} />
                    </div>
                  )}

                  <button
                    onClick={handleFinalSubmit}
                    disabled={(finalPrompt.length < 20 || finalExplanation.length < 20) && finalScore === null}
                    className={cn(
                      "mt-6 w-full py-3 rounded-lg font-semibold transition-all flex items-center justify-center gap-2",
                      "bg-gold text-navy hover:bg-gold-light disabled:opacity-50"
                    )}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner w-5 h-5" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Final Challenge'
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONSOLIDATE PHASE */}
        {phase === 'consolidate' && (
          <div className="animate-fade-in text-center">
            {/* Badge */}
            <div className="mb-8">
              <div className="inline-block relative">
                <div className="w-32 h-32 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center shadow-lg shadow-gold/30 animate-pulse-gold">
                  <span className="text-5xl">🏅</span>
                </div>
                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-navy border border-gold px-4 py-1 rounded-full">
                  <span className="text-gold font-bold text-sm">Prompt Specialist</span>
                </div>
              </div>
            </div>

            <h2 className="text-3xl font-bold text-white mb-2">Module Complete!</h2>
            <p className="text-slate-400 mb-8">You have successfully completed the Prompt Engineering module.</p>

            {/* XP Stats */}
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8">
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">XP This Module</p>
                <p className="text-2xl font-bold text-gold">{moduleXP}</p>
              </div>
              <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total XP</p>
                <p className="text-2xl font-bold text-white">{progress.totalXP}</p>
              </div>
            </div>

            {/* Academic Insight */}
            <div className="bg-slate-900/80 border border-slate-700 rounded-xl p-6 mb-6 text-left max-w-2xl mx-auto">
              <h3 className="text-gold font-semibold mb-3 flex items-center gap-2">
                <span>📚</span> Academic Insight
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Kaplan and Haenlein (2019) define AI as systems that simulate human cognitive functions such as learning and problem-solving. 
                Your work in this module demonstrates how to effectively direct these cognitive functions through structured prompts. 
                The five elements of effective prompting — role, context, format, goal, and detail — align with their framework for human-AI collaboration.
              </p>
            </div>

            {/* Ethics Checkpoint */}
            <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-6 mb-8 text-left max-w-2xl mx-auto">
              <h3 className="text-red-400 font-semibold mb-3 flex items-center gap-2">
                <span>⚖️</span> Ethics Checkpoint
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Before Velara deploys AI-generated content publicly — what are their disclosure obligations? 
                Consider the ASA (Advertising Standards Authority) guidelines on AI-generated advertising and ULaw's AI Policy (2023). 
                How might transparency requirements affect their marketing strategy?
              </p>
            </div>

            {/* Navigation */}
            <button
              onClick={() => router.push('/course2')}
              className="px-8 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-all"
            >
              Return to Mission Board →
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2025 SwipeUp AI Society • University of Law
          </p>
        </div>
      </footer>
    </div>
  );
}
