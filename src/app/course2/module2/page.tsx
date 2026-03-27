'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { cn } from '@/lib/utils';

// Types
type Phase = 'prepare' | 'engage' | 'consolidate';
type EngageStage = 'toolSelect' | 'iDo' | 'weDo' | 'youDo' | 'final';
type ToolType = 'tidio' | 'botpress' | 'landbot';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

interface SavedAnswers {
  wd2Prompt: string;
  wd2Score: { n: string; p: boolean }[];
  wd3Reflect1: string;
  wd3Reflect2: string;
  wd3Reflect3: string;
  wd3Refined: string;
  wd3RefinedScore: { n: string; p: boolean }[];
  yd1Prompt: string;
  yd1Score: { n: string; p: boolean }[];
  yd2Scripts: string;
  yd2Score: { n: string; p: boolean }[];
  yd3Reflect: string;
  fp: string;
  fScore: { n: string; p: boolean }[];
  selectedTool: ToolType;
  moduleXP: number;
  scopeChecklist: boolean[];
}

// MCQ Questions
const mcqQuestions: MCQQuestion[] = [
  {
    id: 'q1',
    question: 'According to Daugherty and Wilson (2018), what is the key to effective human-AI collaboration in customer service?',
    options: [
      'Replacing human agents entirely with AI',
      'Having AI handle routine tasks while humans manage complex emotional situations',
      'Keeping AI and human work completely separate',
      'Using AI only for data storage',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    question: 'What is a system prompt in a chatbot?',
    options: [
      'The first message a customer sends',
      'The visible text on the chat widget',
      'Hidden instructions that define how the AI behaves, its persona, and its rules',
      'The error message shown when the AI fails',
    ],
    correct: 2,
  },
  {
    id: 'q3',
    question: 'Why is escalation language important in a customer service chatbot?',
    options: [
      'It makes the chatbot sound more sophisticated',
      'It prevents the AI from attempting to resolve issues beyond its capability',
      'It speeds up all customer interactions',
      'It reduces the number of customer messages',
    ],
    correct: 1,
  },
  {
    id: 'q4',
    question: 'A customer mentions "Trading Standards" to your chatbot. What should happen?',
    options: [
      'The chatbot should offer a larger discount',
      'The chatbot should immediately promise a full refund',
      'The chatbot should escalate to a human team without attempting resolution',
      'The chatbot should ignore the mention',
    ],
    correct: 2,
  },
  {
    id: 'q5',
    question: 'What does the SCOPE framework help you define for a chatbot?',
    options: [
      'The price of the chatbot subscription',
      'The visual design of the chat widget',
      'Scenario, Channel, Objective, Persona, and Escalation rules',
      'The number of customers the chatbot can handle',
    ],
    correct: 2,
  },
];

// ============================================================
// ENHANCED: Video resources with REAL YouTube URLs
// ============================================================
const videos = [
  { 
    title: 'AI Chatbots for Business', 
    duration: '20 min', 
    url: 'https://www.youtube.com/watch?v=-Ga-bgC4kPM',
    embedUrl: 'https://www.youtube.com/embed/-Ga-bgC4kPM',
    description: 'Learn how AI chatbots transform customer service and business operations'
  },
  { 
    title: 'Conversation Design for Chatbots', 
    duration: '45 min', 
    url: 'https://www.youtube.com/watch?v=hDJLJTWN9-E',
    embedUrl: 'https://www.youtube.com/embed/hDJLJTWN9-E',
    description: 'Master the art of designing effective chatbot conversations'
  },
  { 
    title: 'Tidio Tutorial for Beginners', 
    duration: '15 min', 
    url: 'https://www.youtube.com/watch?v=yKBeMkVp8kU',
    embedUrl: 'https://www.youtube.com/embed/yKBeMkVp8kU',
    description: 'Step-by-step guide to setting up your first chatbot in Tidio'
  },
];

// Tool options
const TOOLS = {
  tidio: {
    name: 'Tidio',
    subtitle: 'Quick Setup',
    description: 'Free plan (50 chats/mo), 5 min setup',
    badge: 'Limited free tier',
    color: '#4A90D9',
    features: ['No credit card required', 'AI assistant (Lyro)', 'Live preview mode', 'Easy embedding'],
    setupSteps: [
      'Go to tidio.com and sign up with your email to create a free account (no card needed)',
      'In the dashboard, click "Lyro" or "AI Assistant" in the left menu',
      'Click "Create AI Agent" or "Customise Responses"',
      'Find the text box where you can add custom instructions',
    ],
  },
  botpress: {
    name: 'Botpress',
    subtitle: 'Recommended',
    description: 'Free tier (500 msgs/mo), deeper control & powerful',
    badge: 'Best for Learning',
    color: '#E8785A',
    features: ['Generous free tier', 'Visual flow builder', 'Custom integrations', 'AI agent support'],
    setupSteps: [
      'Go to botpress.cloud and sign up (no credit card needed)',
      'Click "Create Bot" -> choose "Blank Bot" and give it a name',
      'Click on your new bot to open the studio',
      'In the left sidebar, find "Agent" or click the AI icon to configure system instructions',
    ],
  },
  landbot: {
    name: 'Landbot',
    subtitle: 'Visual',
    description: 'Sandbox Free (100 chats/mo), drag and drop',
    badge: 'Best for visual thinkers',
    color: '#5DC779',
    features: ['Visual flow builder', 'Drag and drop', 'Template library', 'WhatsApp integration'],
    setupSteps: [
      'Go to landbot.io and sign up for the free Sandbox plan',
      'Click "Create New Bot" -> choose "Start from Scratch"',
      'Add a "Questions" block or "AI Input" block to your flow',
      'In the block settings, find where to add custom AI instructions',
    ],
  },
};

// SCOPE Framework Data
const SCOPE_FRAMEWORK = {
  name: 'SCOPE',
  color: '#4A90D9',
  desc: 'SCOPE is a design brief framework for chatbots and AI assistants. It ensures you define the scenario, channel constraints, objectives, persona, and escalation rules — everything an AI needs to behave correctly in a business context.',
  whyItWorks: 'By systematically covering all five elements, SCOPE prevents the most common chatbot failures: wrong tone, missing escalation triggers, unclear objectives, and inappropriate channel behaviour.',
  bestFor: 'Customer service chatbots, sales assistants, internal help bots, and any AI that interacts with humans in a business context.',
  letters: [
    { k: 'S', l: 'Scenario', h: 'The business context and situations the AI will handle', tip: 'Define the brand, products, and typical customer issues' },
    { k: 'C', l: 'Channel', h: 'Where the AI operates and the format constraints', tip: 'Specify platform, word limits, and response format' },
    { k: 'O', l: 'Objective', h: 'What success looks like for each interaction', tip: 'Clear goals: resolve, inform, escalate, retain' },
    { k: 'P', l: 'Persona', h: 'The AI\'s name, voice, and personality', tip: 'Give it a name, tone, and brand alignment' },
    { k: 'E', l: 'Escalation', h: 'When and how the AI hands off to humans', tip: 'List specific triggers and exact handoff language' },
  ],
  example: {
    label: 'SCOPE for Velara Customer Service',
    text: 'Scenario: Velara is a British sustainable luxury fashion brand. Handle orders, returns, sizing, delivery.\nChannel: Email and chat. Under 150 words per response.\nObjective: Resolve the issue completely while making customers feel valued.\nPersona: Name is Aria. Warm, professional, never scripted.\nEscalation: Solicitor, Trading Standards, refunds over £200, physical damage → pass to senior team within 24 hours.',
  },
};

// Quick SCOPE tips for tasks
const SCOPE_TIPS = {
  systemPrompt: [
    'S — Velara sustainable luxury fashion brand',
    'C — Chat and email, under 150 words',
    'O — Resolve issues, retain customers',
    'P — Name: Aria. Warm, professional tone',
    'E — Escalate: solicitor, Trading Standards, £200+ refunds',
  ],
  difficult: [
    'S — Gift delivery emergency, birthday tomorrow',
    'C — Same channel constraints apply',
    'O — De-escalate, show empathy, offer solution',
    'P — Maintain Aria\'s warm, caring persona',
    'E — May need human follow-up for expedited shipping',
  ],
  escalation: [
    'S — Three specific trigger scenarios',
    'C — Clear, brief handoff messages',
    'O — Reassure customer, set expectation',
    'P — Stay empathetic, not defensive',
    'E — Exact words for each trigger',
  ],
};

// Test scenarios
const TEST_SCENARIOS = [
  {
    id: 1,
    type: 'Routine',
    message: '"Hi, I placed an order 5 days ago and haven\'t received a shipping update."',
    description: 'Standard order enquiry',
  },
  {
    id: 2,
    type: 'Complaint',
    message: '"My dress arrived and the colour is completely different from the photos."',
    description: 'Product complaint',
  },
  {
    id: 3,
    type: 'Escalation',
    message: '"I\'ve already contacted Trading Standards about this. I want a full refund of £250."',
    description: 'Escalation trigger — should hand off',
  },
];

// Word count helper
function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

// Score class helper
function getScoreClass(pass: number, total: number): 'great' | 'ok' | 'low' {
  if (pass / total >= 0.8) return 'great';
  if (pass / total >= 0.5) return 'ok';
  return 'low';
}

// XP for score helper
function xpForScore(pass: number, total: number, max: number): number {
  if (pass / total >= 0.8) return max;
  if (pass / total >= 0.5) return Math.round(max * 0.5);
  return Math.round(max * 0.2);
}

// ============================================================
// ENHANCED: Phase Progress Indicator with icons
// ============================================================
function PhaseIndicator({ currentPhase, onPhaseClick, isCompleted }: { currentPhase: Phase; onPhaseClick: (phase: Phase) => void; isCompleted: boolean }) {
  const phases = [
    { id: 'prepare', label: 'Prepare', icon: '📚' },
    { id: 'engage', label: 'Engage', icon: '🔧' },
    { id: 'consolidate', label: 'Consolidate', icon: '🏆' },
  ];
  const currentIndex = phases.findIndex(p => p.id === currentPhase);

  return (
    <div className="flex bg-[#0D1E2E] border-b border-[#1C3348]">
      {phases.map((phase, idx) => {
        const isActive = idx === currentIndex;
        const isPast = idx < currentIndex;
        
        return (
          <button
            key={phase.id}
            onClick={() => {
              if (isCompleted || isPast || isActive) {
                onPhaseClick(phase.id as Phase);
              }
            }}
            disabled={!isCompleted && !isPast && !isActive}
            className={cn(
              "flex-1 py-3 text-center font-mono text-[11px] tracking-widest uppercase border-r border-[#1C3348] last:border-r-0 transition-all flex items-center justify-center gap-2",
              isActive && "bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border-b-2 border-b-[#C9A84C]",
              isPast && "text-[#2DD36F] hover:bg-[rgba(45,211,111,0.05)] cursor-pointer",
              !isActive && !isPast && "text-[#3D5870]",
              !isCompleted && !isPast && !isActive && "cursor-not-allowed"
            )}
          >
            <span>{phase.icon}</span>
            <span>{phase.label}</span>
            {isPast && <span className="text-[#2DD36F]">✓</span>}
          </button>
        );
      })}
    </div>
  );
}

// ============================================================
// ENHANCED: Progress Bar with step indicator
// ============================================================
function ProgressBar({ phase, prepareProgress, engageStage, weDoTask, youDoTask }: { 
  phase: Phase; 
  prepareProgress: number;
  engageStage: EngageStage;
  weDoTask: number;
  youDoTask: number;
}) {
  const getPercentage = () => {
    if (phase === 'prepare') return Math.min(90, prepareProgress);
    if (phase === 'engage') {
      if (engageStage === 'toolSelect') return 5;
      if (engageStage === 'iDo') return 10;
      if (engageStage === 'weDo') return 20 + (weDoTask - 1) * 15;
      if (engageStage === 'youDo') return 55 + (youDoTask - 1) * 12;
      if (engageStage === 'final') return 88;
    }
    return 100;
  };
  
  const pct = getPercentage();
  
  const getStepLabel = () => {
    if (phase === 'prepare') return 'Step 1 of 3: Prepare';
    if (phase === 'engage') {
      if (engageStage === 'toolSelect') return 'Step 2 of 3: Choose Tool';
      if (engageStage === 'iDo') return 'Step 2 of 3: I Do';
      if (engageStage === 'weDo') return `Step 2 of 3: We Do (Task ${weDoTask}/3)`;
      if (engageStage === 'youDo') return `Step 2 of 3: You Do (Task ${youDoTask}/3)`;
      if (engageStage === 'final') return 'Step 2 of 3: Final Challenge';
    }
    return 'Step 3 of 3: Consolidate';
  };

  return (
    <div className="px-5 py-3 bg-[#0D1E2E] border-b border-[#1C3348]">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[10px] text-[#3D5870] tracking-wider">MISSION PROGRESS</span>
        <span className="font-mono text-[10px] text-[#C9A84C]">{getStepLabel()}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-[6px] bg-[#1C3348] rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="font-mono text-[12px] text-[#C9A84C] font-bold min-w-[40px] text-right">{pct}%</span>
      </div>
    </div>
  );
}

// Intel File Card
function IntelFileCard({ title, subtitle, read, onToggle }: { title: string; subtitle: string; read: boolean; onToggle: () => void }) {
  return (
    <div
      className={cn(
        "bg-[#112030] border rounded-lg p-3.5 cursor-pointer transition-all flex items-center gap-3",
        read ? "border-[rgba(45,211,111,0.35)] bg-[rgba(45,211,111,0.04)]" : "border-[#1C3348] hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-0.5"
      )}
      onClick={onToggle}
    >
      <div className={cn(
        "w-10 h-12 rounded flex flex-col items-center justify-center font-mono text-[9px] font-bold tracking-wider shrink-0",
        read ? "bg-[rgba(45,211,111,0.1)] text-[#2DD36F]" : "bg-[#1C3348] text-[#3D5870]"
      )}>
        {read ? <span className="text-lg">✓</span> : 'PDF'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-[13px]">{title}</h4>
        <p className="text-[11px] text-[#3D5870] leading-tight mt-0.5">{subtitle}</p>
      </div>
      <span className={cn(
        "font-mono text-[9px] px-2 py-1 rounded tracking-wider shrink-0",
        read ? "bg-[rgba(45,211,111,0.12)] text-[#2DD36F] border border-[rgba(45,211,111,0.3)]" : "border border-[#3D5870] text-[#3D5870]"
      )}>
        {read ? 'READ' : 'UNREAD'}
      </span>
    </div>
  );
}

// ============================================================
// ENHANCED: Video Card with embedded YouTube player
// ============================================================
function VideoCard({ 
  title, 
  duration, 
  embedUrl, 
  description,
  watched, 
  onToggle,
  isExpanded,
  onExpand
}: { 
  title: string; 
  duration: string; 
  embedUrl: string;
  description: string;
  watched: boolean; 
  onToggle: () => void;
  isExpanded: boolean;
  onExpand: () => void;
}) {
  return (
    <div className={cn(
      "bg-[#112030] border rounded-lg overflow-hidden transition-all",
      watched ? "border-[rgba(45,211,111,0.3)]" : "border-[#1C3348]"
    )}>
      {/* Video Thumbnail / Player */}
      {isExpanded ? (
        <div className="aspect-video">
          <iframe 
            src={embedUrl}
            title={title}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : (
        <button 
          onClick={() => {
            onExpand();
            if (!watched) onToggle();
          }}
          className={cn(
            "w-full aspect-video flex items-center justify-center relative",
            watched ? "bg-[rgba(45,211,111,0.08)]" : "bg-[#1C3348] hover:bg-[#253545] transition-colors"
          )}
        >
          <div className={cn(
            "w-14 h-14 rounded-full flex items-center justify-center transition-all",
            watched ? "bg-[rgba(45,211,111,0.2)]" : "bg-[rgba(201,168,76,0.2)] group-hover:scale-110"
          )}>
            <span className={cn("text-2xl", watched ? "text-[#2DD36F]" : "text-[#C9A84C]")}>
              {watched ? '✓' : '▶'}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-mono">
            {duration}
          </div>
        </button>
      )}
      
      {/* Video Info */}
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-[12px] font-semibold text-white leading-tight mb-1">{title}</p>
            <p className="text-[10px] text-[#7A9AB5] leading-tight">{description}</p>
          </div>
          {watched && (
            <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-[rgba(45,211,111,0.15)] text-[#2DD36F] tracking-wider shrink-0">
              WATCHED
            </span>
          )}
        </div>
        {isExpanded && (
          <button
            onClick={() => onExpand()}
            className="mt-2 text-[10px] text-[#C9A84C] hover:text-[#E8C96A] font-mono tracking-wider"
          >
            ▲ COLLAPSE VIDEO
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// NEW: SCOPE Interactive Checklist Component
// ============================================================
function ScopeChecklist({ checked, onChange }: { checked: boolean[]; onChange: (idx: number) => void }) {
  const letters = SCOPE_FRAMEWORK.letters;
  const completed = checked.filter(Boolean).length;
  
  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase">
          📐 SCOPE LEARNING CHECKLIST
        </p>
        <span className={cn(
          "font-mono text-[10px] px-2 py-1 rounded tracking-wider",
          completed === 5 
            ? "bg-[rgba(45,211,111,0.15)] text-[#2DD36F]" 
            : "bg-[#1C3348] text-[#7A9AB5]"
        )}>
          {completed}/5 COMPLETE
        </span>
      </div>
      
      <div className="space-y-2">
        {letters.map((letter, idx) => (
          <label 
            key={letter.k}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border",
              checked[idx] 
                ? "bg-[rgba(45,211,111,0.06)] border-[rgba(45,211,111,0.2)]" 
                : "bg-[#08131E] border-[#1C3348] hover:border-[rgba(201,168,76,0.4)]"
            )}
          >
            <input
              type="checkbox"
              checked={checked[idx]}
              onChange={() => onChange(idx)}
              className="accent-[#2DD36F] mt-0.5 shrink-0 w-4 h-4"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-[18px] font-bold" style={{ color: SCOPE_FRAMEWORK.color }}>
                  {letter.k}
                </span>
                <span className="text-[13px] font-semibold text-white">{letter.l}</span>
              </div>
              <p className="text-[11px] text-[#7A9AB5] leading-tight">{letter.h}</p>
              {checked[idx] && (
                <p className="text-[10px] text-[#2DD36F] mt-1 italic">💡 {letter.tip}</p>
              )}
            </div>
            {checked[idx] && (
              <span className="text-[#2DD36F] text-lg">✓</span>
            )}
          </label>
        ))}
      </div>
      
      {completed === 5 && (
        <div className="mt-3 p-3 bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] rounded-lg text-center">
          <span className="font-mono text-[12px] font-bold text-[#2DD36F]">🎉 +10 XP — SCOPE FRAMEWORK MASTERED!</span>
        </div>
      )}
    </div>
  );
}

// MCQ Gate
function MCQGate({ answers, submitted, score, onAnswer, onSubmit, onRetry, isReviewMode }: {
  answers: Record<string, number>;
  submitted: boolean;
  score: number;
  onAnswer: (qi: number, oi: number) => void;
  onSubmit: () => void;
  onRetry: () => void;
  isReviewMode: boolean;
}) {
  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg overflow-hidden">
      <div className="bg-[rgba(201,168,76,0.08)] border-b border-[#1C3348] px-4 py-3 flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest">🔐 CLEARANCE REQUIRED</span>
        <span className="font-mono text-[10px] text-[#3D5870]">{isReviewMode ? 'REVIEW MODE' : 'SCORE 5/5 TO ENTER HQ'}</span>
      </div>

      <div className="p-4">
        {mcqQuestions.map((q, qi) => (
          <div key={q.id} className="mb-4 pb-4 border-b border-[#1C3348] last:border-0 last:mb-0 last:pb-0">
            <p className="font-mono text-[10px] text-[#C9A84C] tracking-wider mb-1.5">Q{qi + 1} OF 5</p>
            <p className="text-[13px] text-white leading-relaxed mb-2.5">{q.question}</p>
            <div className="space-y-1.5">
              {q.options.map((opt, oi) => {
                const isSelected = answers[qi] === oi;
                const isCorrect = q.correct === oi;
                const showCorrect = submitted && isCorrect;
                const showWrong = submitted && isSelected && !isCorrect;
                
                return (
                  <label
                    key={oi}
                    className={cn(
                      "flex items-center gap-2.5 p-2.5 px-3 border rounded-md cursor-pointer transition-all text-[12px]",
                      showCorrect && "border-[#2DD36F] bg-[rgba(45,211,111,0.08)] text-[#2DD36F]",
                      showWrong && "border-[#EF4444] bg-[rgba(239,68,68,0.08)] text-[#EF4444]",
                      !submitted && isSelected && "border-[#C9A84C] bg-[rgba(201,168,76,0.12)] text-white",
                      !submitted && !isSelected && "border-[#1C3348] text-[#7A9AB5] hover:border-[rgba(201,168,76,0.4)] hover:bg-[rgba(201,168,76,0.12)]",
                      submitted && !showCorrect && !showWrong && "border-[#1C3348] text-[#7A9AB5] cursor-default"
                    )}
                  >
                    <input
                      type="radio"
                      name={q.id}
                      checked={isSelected}
                      onChange={() => !submitted && onAnswer(qi, oi)}
                      className="accent-[#C9A84C] shrink-0"
                      disabled={submitted}
                    />
                    <span>{opt}</span>
                    {showCorrect && <span className="ml-auto text-[11px]">✓</span>}
                    {showWrong && <span className="ml-auto text-[11px]">✗</span>}
                  </label>
                );
              })}
            </div>
          </div>
        ))}

        {submitted && (
          <div className={cn(
            "p-3 rounded text-center font-mono text-[11px] font-bold tracking-wider mb-3",
            score === 5 ? "bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.3)] text-[#2DD36F]" : "bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] text-[#C9A84C]"
          )}>
            {score === 5 ? `ACCESS GRANTED — ${score}/5 CORRECT` : `CLEARANCE DENIED — ${score}/5 — REVIEW INTEL AND RETRY`}
          </div>
        )}

        {!submitted ? (
          <button
            onClick={onSubmit}
            disabled={Object.keys(answers).length < 5}
            className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            SUBMIT FOR VERIFICATION
          </button>
        ) : score < 5 && !isReviewMode ? (
          <button
            onClick={onRetry}
            className="w-full py-2.5 bg-transparent border border-[#C9A84C] text-[#C9A84C] rounded-md font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-[rgba(201,168,76,0.12)] transition-all"
          >
            RETRY CLEARANCE CHECK
          </button>
        ) : null}
      </div>
    </div>
  );
}

// SCOPE Framework Card
function ScopeFrameworkCard({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (open: boolean) => void }) {
  const fw = SCOPE_FRAMEWORK;

  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[rgba(201,168,76,0.05)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📐</span>
          <div className="text-left">
            <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest">SCOPE FRAMEWORK</p>
            <p className="text-[11px] text-[#3D5870] mt-0.5">Design brief for chatbots and AI assistants</p>
          </div>
        </div>
        <span className={cn(
          "font-mono text-[14px] text-[#C9A84C] transition-transform duration-250",
          isOpen && "rotate-180"
        )}>▼</span>
      </button>

      {isOpen && (
        <div className="px-4 pb-4">
          {/* Description */}
          <div 
            className="text-[13px] text-[#9DBBD4] leading-relaxed p-3 rounded border-l-2 mb-3"
            style={{ borderColor: fw.color, backgroundColor: `${fw.color}0D` }}
          >
            {fw.desc}
          </div>

          {/* Why It Works & Best For */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-[rgba(45,211,111,0.04)] border border-[rgba(45,211,111,0.15)] rounded">
              <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-1.5">💡 Why It Works</p>
              <p className="text-[12px] text-[#9DBBD4] leading-relaxed">{fw.whyItWorks}</p>
            </div>
            <div className="p-3 bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] rounded">
              <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-1.5">🎯 Best For</p>
              <p className="text-[12px] text-[#9DBBD4] leading-relaxed">{fw.bestFor}</p>
            </div>
          </div>

          {/* Letters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {fw.letters.map((l) => (
              <div
                key={l.k}
                className="p-2.5 rounded border"
                style={{ borderColor: `${fw.color}33`, backgroundColor: `${fw.color}12` }}
              >
                <p className="font-mono text-[16px] font-bold" style={{ color: fw.color }}>{l.k}</p>
                <p className="text-[12px] font-semibold text-white">{l.l}</p>
                <p className="text-[10px] text-[#7A9AB5] leading-tight mt-0.5">{l.h}</p>
                <p className="text-[9px] text-[#3D5870] leading-tight mt-1 italic">💡 {l.tip}</p>
              </div>
            ))}
          </div>

          {/* Example */}
          <div className="p-3 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded">
            <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-1.5">{fw.example.label}</p>
            <p className="text-[12px] text-[#9DBBD4] leading-relaxed whitespace-pre-line">{fw.example.text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Quick SCOPE Tip
function QuickScopeTip({ tips }: { tips: string[] }) {
  const fw = SCOPE_FRAMEWORK;

  return (
    <div className="bg-[#08131E] border border-[#1C3348] rounded-lg p-3 mb-3">
      <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">📐 SCOPE Quick Reference</p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {tips.map((tip, idx) => (
          <span key={idx} className="text-[11px] text-[#7A9AB5]">
            <span className="font-mono font-bold" style={{ color: fw.color }}>{tip.split(' — ')[0]}</span>
            <span className="text-[#7A9AB5]"> — {tip.split(' — ')[1]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// Tool Selection Card
function ToolCard({ tool, selected, onSelect }: { tool: ToolType; selected: boolean; onSelect: () => void }) {
  const t = TOOLS[tool];

  return (
    <button
      onClick={onSelect}
      className={cn(
        "bg-[#112030] border rounded-lg p-4 text-left transition-all",
        selected ? "border-[#C9A84C] bg-[rgba(201,168,76,0.08)]" : "border-[#1C3348] hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-0.5"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-mono text-[12px] font-bold tracking-wider" style={{ color: t.color }}>{t.name}</p>
          <p className="text-[10px] text-[#7A9AB5]">{t.subtitle}</p>
        </div>
        <span className={cn(
          "font-mono text-[8px] px-2 py-0.5 rounded uppercase tracking-wider",
          selected ? "bg-[#C9A84C] text-[#08131E]" : "bg-[#1C3348] text-[#3D5870]"
        )}>
          {t.badge}
        </span>
      </div>
      <p className="text-[11px] text-[#9DBBD4] mb-2">{t.description}</p>
      <div className="space-y-1">
        {t.features.map((f, i) => (
          <p key={i} className="text-[10px] text-[#7A9AB5]">✓ {f}</p>
        ))}
      </div>
      {selected && (
        <div className="mt-3 pt-2 border-t border-[#1C3348]">
          <p className="font-mono text-[9px] text-[#2DD36F] tracking-widest uppercase">✓ SELECTED</p>
        </div>
      )}
    </button>
  );
}

// Score Grid
function ScoreGrid({ criteria }: { criteria: { n: string; p: boolean }[] }) {
  const pass = criteria.filter(c => c.p).length;
  const total = criteria.length;
  const cls = getScoreClass(pass, total);

  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-1.5">
        {criteria.map((cr, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center justify-between p-2 px-3 bg-[#08131E] rounded text-[11px]",
              cr.p ? "border-l-2 border-[#2DD36F] text-white" : "border-l-2 border-[rgba(239,68,68,0.3)] text-[#3D5870]"
            )}
          >
            <span>{cr.n}</span>
            <span className="text-[12px]">{cr.p ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>
      <div className={cn(
        "mt-2 p-2.5 rounded text-center font-mono text-[11px] font-bold tracking-wider",
        cls === 'great' && "bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] text-[#2DD36F]",
        cls === 'ok' && "bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-[#F59E0B]",
        cls === 'low' && "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444]"
      )}>
        {pass}/{total} CRITERIA MET — {Math.round(pass / total * 100)}%
      </div>
    </div>
  );
}

// XP Burst
function XPBurst({ amount, label }: { amount: number; label: string }) {
  return (
    <div className="text-center py-3">
      <span className="font-mono text-[22px] font-bold text-[#C9A84C]">+{amount} XP</span>
      <span className="block font-mono text-[10px] text-[#3D5870] tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

// Back Button
function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 text-[#7A9AB5] hover:text-[#C9A84C] transition-colors mb-4 text-[12px]"
    >
      <span className="text-[14px]">←</span>
      <span>{label}</span>
    </button>
  );
}

// Task Card
function TaskCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-3">
      <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">{title}</p>
      {children}
    </div>
  );
}

// Textarea Component
function PromptInput({ 
  value, 
  onChange, 
  placeholder, 
  minWords, 
  onSubmit, 
  submitted,
  score,
  rows = 5
}: { 
  value: string; 
  onChange: (v: string) => void; 
  placeholder: string; 
  minWords: number;
  onSubmit: () => void;
  submitted: boolean;
  score: { n: string; p: boolean }[] | null;
  rows?: number;
}) {
  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={submitted && score !== null}
        rows={rows}
        className={cn(
          "w-full p-3 bg-[#08131E] border border-[#1C3348] rounded text-[12px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]",
          submitted && score && "opacity-80"
        )}
      />
      <div className="flex items-center justify-between mt-2">
        <p className="font-mono text-[10px] text-[#3D5870]">{wordCount(value)} words</p>
        {!score && (
          <button
            onClick={onSubmit}
            disabled={wordCount(value) < minWords}
            className="px-4 py-2 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[10px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            SUBMIT
          </button>
        )}
      </div>
    </div>
  );
}

// Checkbox Component
function ConfirmCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label className="flex items-start gap-3 p-3 bg-[#08131E] border border-[#1C3348] rounded-lg cursor-pointer hover:border-[rgba(201,168,76,0.4)] transition-all">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-[#C9A84C] mt-1 shrink-0"
      />
      <span className="text-[12px] text-[#9DBBD4]">{label}</span>
    </label>
  );
}

// Scenario Card
function ScenarioCard({ scenario }: { scenario: typeof TEST_SCENARIOS[0] }) {
  return (
    <div className={cn(
      "p-3 rounded border mb-2",
      scenario.type === 'Escalation' 
        ? "bg-[rgba(239,68,68,0.06)] border-[rgba(239,68,68,0.2)]" 
        : scenario.type === 'Complaint'
        ? "bg-[rgba(245,158,11,0.06)] border-[rgba(245,158,11,0.2)]"
        : "bg-[#08131E] border-[#1C3348]"
    )}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={cn(
          "font-mono text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded",
          scenario.type === 'Escalation' && "bg-[rgba(239,68,68,0.15)] text-[#EF4444]",
          scenario.type === 'Complaint' && "bg-[rgba(245,158,11,0.15)] text-[#F59E0B]",
          scenario.type === 'Routine' && "bg-[rgba(45,211,111,0.15)] text-[#2DD36F]"
        )}>
          {scenario.type}
        </span>
        <span className="text-[10px] text-[#7A9AB5]">{scenario.description}</span>
      </div>
      <p className="text-[12px] text-[#9DBBD4] italic">{scenario.message}</p>
    </div>
  );
}

// Main Module Component
export default function Module2Page() {
  const router = useRouter();
  const { progress, isLoaded, addXP, addBadge, completeModule2, completePrepare2 } = useAcademyProgress();

  // Phase state
  const [phase, setPhase] = useState<Phase>('prepare');
  const [moduleXP, setModuleXP] = useState(0);

  // Prepare state
  const [paper1Read, setPaper1Read] = useState(false);
  const [paper2Read, setPaper2Read] = useState(false);
  const [videosWatched, setVideosWatched] = useState<boolean[]>([false, false, false]);
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const [scopeOpen, setScopeOpen] = useState(true);
  const [scopeChecklist, setScopeChecklist] = useState<boolean[]>([false, false, false, false, false]);
  const [scopeXPAwarded, setScopeXPAwarded] = useState(false);

  // Engage state
  const [engageStage, setEngageStage] = useState<EngageStage>('toolSelect');
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);

  // We Do state
  const [weDoTask, setWeDoTask] = useState(1);
  const [wd1Done, setWd1Done] = useState(false);
  const [WorkspaceUrl, setWorkspaceUrl] = useState('');
  const [wd2Prompt, setWd2Prompt] = useState('');
  const [wd2Score, setWd2Score] = useState<{ n: string; p: boolean }[] | null>(null);
  const [wd2Pasted, setWd2Pasted] = useState(false);
  const [wd3Reflect1, setWd3Reflect1] = useState('');
  const [wd3Reflect2, setWd3Reflect2] = useState('');
  const [wd3Reflect3, setWd3Reflect3] = useState('');
  const [wd3Refined, setWd3Refined] = useState('');
  const [wd3RefinedScore, setWd3RefinedScore] = useState<{ n: string; p: boolean }[] | null>(null);

  // You Do state
  const [youDoTask, setYouDoTask] = useState(1);
  const [yd1Prompt, setYd1Prompt] = useState('');
  const [yd1Score, setYd1Score] = useState<{ n: string; p: boolean }[] | null>(null);
  const [yd2Scripts, setYd2Scripts] = useState('');
  const [yd2Score, setYd2Score] = useState<{ n: string; p: boolean }[] | null>(null);
  const [yd3Reflect, setYd3Reflect] = useState('');

  // Final state
  const [fp, setFp] = useState('');
  const [fScore, setFScore] = useState<{ n: string; p: boolean }[] | null>(null);

  // Review mode
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswers | null>(null);

  // Load saved answers
  const loadSavedAnswers = useCallback(() => {
    try {
      const saved = localStorage.getItem('swipeup-module2-answers');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedAnswers(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading saved answers:', e);
    }
    return null;
  }, []);

  // Save answers
  const saveAnswers = useCallback((answers: Partial<SavedAnswers>) => {
    try {
      const existing = localStorage.getItem('swipeup-module2-answers');
      const parsed = existing ? JSON.parse(existing) : {};
      const updated = { ...parsed, ...answers, selectedTool: selectedTool || 'tidio', moduleXP, scopeChecklist };
      localStorage.setItem('swipeup-module2-answers', JSON.stringify(updated));
      setSavedAnswers(updated);
    } catch (e) {
      console.error('Error saving answers:', e);
    }
  }, [moduleXP, selectedTool, scopeChecklist]);

  // Redirect checks
  useEffect(() => {
    if (isLoaded && !progress.studentName) {
      router.push('/');
    }
  }, [isLoaded, progress.studentName, router]);

  // Load saved state
  useEffect(() => {
    const savedData = loadSavedAnswers();
    
    if (progress.course2ModulesCompleted.includes(2)) {
      setIsReviewMode(true);
      setMcqSubmitted(true);
      setMcqScore(5);
      setPaper1Read(true);
      setPaper2Read(true);
      setVideosWatched([true, true, true]);
      setScopeChecklist([true, true, true, true, true]);
      
      if (savedData) {
        setSelectedTool(savedData.selectedTool || 'tidio');
        setWd2Prompt(savedData.wd2Prompt || '');
        setWd2Score(savedData.wd2Score || null);
        setWd3Reflect1(savedData.wd3Reflect1 || '');
        setWd3Reflect2(savedData.wd3Reflect2 || '');
        setWd3Reflect3(savedData.wd3Reflect3 || '');
        setWd3Refined(savedData.wd3Refined || '');
        setYd1Prompt(savedData.yd1Prompt || '');
        setYd1Score(savedData.yd1Score || null);
        setYd2Scripts(savedData.yd2Scripts || '');
        setYd2Score(savedData.yd2Score || null);
        setYd3Reflect(savedData.yd3Reflect || '');
        setFp(savedData.fp || '');
        setFScore(savedData.fScore || null);
        setModuleXP(savedData.moduleXP || 255);
        if (savedData.scopeChecklist) {
          setScopeChecklist(savedData.scopeChecklist);
        }
      }
      
      setPhase('consolidate');
    } else if (progress.course2PrepareCompleted.includes(2)) {
      setMcqSubmitted(true);
      setMcqScore(5);
      setPaper1Read(true);
      setPaper2Read(true);
      setVideosWatched([true, true, true]);
      setScopeChecklist([true, true, true, true, true]);
      setPhase('engage');
    }
  }, [progress.course2PrepareCompleted, progress.course2ModulesCompleted, loadSavedAnswers]);

  // ============================================================
  // NEW: SCOPE Checklist handler
  // ============================================================
  const handleScopeCheck = (idx: number) => {
    const newChecked = [...scopeChecklist];
    newChecked[idx] = !newChecked[idx];
    setScopeChecklist(newChecked);
    
    // Award XP when all 5 are checked
    if (newChecked.every(Boolean) && !scopeXPAwarded) {
      addXP(10);
      setModuleXP(prev => prev + 10);
      setScopeXPAwarded(true);
      saveAnswers({ scopeChecklist: newChecked });
    }
  };

  // MCQ handlers
  const handleMcqAnswer = (qi: number, oi: number) => {
    setMcqAnswers({ ...mcqAnswers, [qi]: oi });
  };

  const handleMcqSubmit = () => {
    let sc = 0;
    mcqQuestions.forEach((q, i) => {
      if (mcqAnswers[i] === q.correct) sc++;
    });
    setMcqScore(sc);
    setMcqSubmitted(true);
    if (sc === 5) {
      addXP(50);
      setModuleXP(prev => prev + 50);
      completePrepare2(2);
      setTimeout(() => setPhase('engage'), 1800);
    }
  };

  const handleMcqRetry = () => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(0);
  };

  // WD2 handler
  const handleWd2Submit = () => {
    const t = wd2Prompt.toLowerCase();
    const criteria = [
      { n: 'Scenario defined', p: t.includes('velara') || t.includes('fashion') || t.includes('brand') },
      { n: 'Channel/format set', p: t.includes('word') || t.includes('150') || t.includes('email') || t.includes('chat') },
      { n: 'Objective stated', p: t.includes('resolv') || t.includes('help') || t.includes('assist') || t.includes('loyal') || t.includes('retain') },
      { n: 'Persona described', p: t.includes('aria') || t.includes('name') || t.includes('tone') || t.includes('warm') || t.includes('professional') },
      { n: 'Escalation rules set', p: t.includes('escalat') || t.includes('senior') || t.includes('human') || t.includes('pass') || t.includes('solicitor') || t.includes('trading') },
      { n: 'Sufficient detail', p: wordCount(wd2Prompt) >= 60 },
    ];
    setWd2Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 30);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ wd2Prompt, wd2Score: criteria });
  };

  // WD3 handlers
  const handleWd3Submit = () => {
    if (wordCount(wd3Reflect1) >= 15 && wordCount(wd3Reflect2) >= 15 && wordCount(wd3Reflect3) >= 15) {
      addXP(20);
      setModuleXP(prev => prev + 20);
      saveAnswers({ wd3Reflect1, wd3Reflect2, wd3Reflect3 });
    }
  };

  const handleWd3RefinedSubmit = () => {
    const t = wd3Refined.toLowerCase();
    const criteria = [
      { n: 'Scenario defined', p: t.includes('velara') || t.includes('fashion') || t.includes('brand') },
      { n: 'Channel/format set', p: t.includes('word') || t.includes('150') || t.includes('email') || t.includes('chat') },
      { n: 'Objective stated', p: t.includes('resolv') || t.includes('help') || t.includes('assist') },
      { n: 'Persona described', p: t.includes('aria') || t.includes('tone') || t.includes('warm') },
      { n: 'Escalation rules set', p: t.includes('escalat') || t.includes('senior') || t.includes('pass') },
      { n: 'Sufficient detail', p: wordCount(wd3Refined) >= 60 },
    ];
    setWd3RefinedScore(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 15);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ wd3Refined, wd3RefinedScore: criteria });
  };

  // YD handlers
  const handleYd1Submit = () => {
    const t = yd1Prompt.toLowerCase();
    const criteria = [
      { n: 'Urgency acknowledged', p: t.includes('urgent') || t.includes('birthday') || t.includes('gift') || t.includes('tomorrow') || t.includes('time') },
      { n: 'Empathy instruction', p: t.includes('empath') || t.includes('apolog') || t.includes('understand') || t.includes('sorry') },
      { n: 'Concrete action', p: t.includes('expedit') || t.includes('priorit') || t.includes('contact') || t.includes('refund') || t.includes('replacement') },
      { n: 'Tone specified', p: t.includes('warm') || t.includes('genuine') || t.includes('tone') || t.includes('velara') },
      { n: 'Sufficient detail', p: wordCount(yd1Prompt) >= 40 },
    ];
    setYd1Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 30);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ yd1Prompt, yd1Score: criteria });
  };

  const handleYd2Submit = () => {
    const t = yd2Scripts.toLowerCase();
    const criteria = [
      { n: 'Three scenarios covered', p: wordCount(yd2Scripts) >= 80 },
      { n: 'Timeframe given', p: t.includes('24') || t.includes('48') || t.includes('hours') || t.includes('day') },
      { n: 'No false promises', p: !t.includes('will refund') && !t.includes('definitely') },
      { n: 'Brand voice maintained', p: t.includes('velara') || t.includes('team') || t.includes('care') || t.includes('valued') || t.includes('priority') },
      { n: 'Empathetic tone', p: t.includes('understand') || t.includes('apolog') || t.includes('important') || t.includes('matters') },
    ];
    setYd2Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 35);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ yd2Scripts, yd2Score: criteria });
  };

  const handleYd3Submit = () => {
    if (wordCount(yd3Reflect) >= 50) {
      addXP(25);
      setModuleXP(prev => prev + 25);
      saveAnswers({ yd3Reflect });
    }
  };

  // Final submit
  const handleFinalSubmit = () => {
    const t = fp.toLowerCase();
    const criteria = [
      { n: 'Problem stated', p: t.includes('inbox') || t.includes('volume') || t.includes('monday') || t.includes('message') || t.includes('customer service') },
      { n: 'Tool justified', p: t.includes('tidio') || t.includes('free') || t.includes('no-code') || t.includes('tool') },
      { n: 'System prompt included', p: t.includes('aria') || t.includes('escalat') || t.includes('scope') || t.includes('velara') },
      { n: 'Example interactions', p: t.includes('scenario') || t.includes('example') || t.includes('test') || t.includes('conversation') },
      { n: 'Limitation acknowledged', p: t.includes('limit') || t.includes('scale') || t.includes('improve') || t.includes('future') || t.includes('cannot') },
      { n: 'Portfolio quality', p: wordCount(fp) >= 150 },
    ];
    setFScore(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 50);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ fp, fScore: criteria });
    completeModule2(2);
    addBadge('chatbot-builder-1');
    setTimeout(() => setPhase('consolidate'), 2000);
  };

  // Calculate prepare progress
  const prepareProgress = Math.round(
    ((paper1Read ? 15 : 0) + (paper2Read ? 15 : 0) + videosWatched.filter(Boolean).length * 8 + (scopeChecklist.filter(Boolean).length * 2) + (mcqSubmitted && mcqScore === 5 ? 40 : 0))
  );

  // Render Prepare Phase
  const renderPrepare = () => (
    <div className="min-h-screen bg-[#08131E]">
      <div className="px-5 py-4 border-b border-[#1C3348]">
        <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
        <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">PREPARE</h1>
        <p className="text-[12px] text-[#7A9AB5] mt-1">Build your foundation for chatbot development</p>
      </div>

      <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

      <div className="p-5 space-y-4">
        {/* Intel Files */}
        <div>
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">📂 INTEL FILES</p>
          <div className="space-y-2">
            <IntelFileCard
              title="Human + Machine: Reimagining Work"
              subtitle="Daugherty & Wilson (2018) — Human-AI collaboration"
              read={paper1Read}
              onToggle={() => setPaper1Read(!paper1Read)}
            />
            <IntelFileCard
              title="Velara Customer Service Briefing"
              subtitle="Volume data, complaint types, brand voice, escalation policy"
              read={paper2Read}
              onToggle={() => setPaper2Read(!paper2Read)}
            />
          </div>
        </div>

        {/* ============================================================ */}
        {/* ENHANCED: Video Resources with Embedded YouTube */}
        {/* ============================================================ */}
        <div>
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">🎥 VIDEO TRAINING</p>
          <p className="text-[11px] text-[#7A9AB5] mb-3">Click a video to watch. All videos open directly in this page.</p>
          <div className="space-y-3">
            {videos.map((v, i) => (
              <VideoCard
                key={v.title}
                title={v.title}
                duration={v.duration}
                embedUrl={v.embedUrl}
                description={v.description}
                watched={videosWatched[i]}
                onToggle={() => {
                  const newWatched = [...videosWatched];
                  newWatched[i] = true;
                  setVideosWatched(newWatched);
                }}
                isExpanded={expandedVideo === i}
                onExpand={() => setExpandedVideo(expandedVideo === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* ============================================================ */}
        {/* NEW: SCOPE Framework Interactive Checklist */}
        {/* ============================================================ */}
        <div>
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">📐 LEARNING CHECKLIST</p>
          <p className="text-[11px] text-[#7A9AB5] mb-3">Check off each SCOPE element as you understand it. Complete all 5 to earn XP!</p>
          <ScopeChecklist 
            checked={scopeChecklist} 
            onChange={handleScopeCheck} 
          />
        </div>

        {/* SCOPE Framework Reference */}
        <div>
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">📐 FRAMEWORK GUIDE</p>
          <p className="text-[11px] text-[#7A9AB5] mb-3">Expand for the full SCOPE framework reference.</p>
          <ScopeFrameworkCard isOpen={scopeOpen} setIsOpen={setScopeOpen} />
        </div>

        {/* MCQ Gate */}
        <MCQGate
          answers={mcqAnswers}
          submitted={mcqSubmitted}
          score={mcqScore}
          onAnswer={handleMcqAnswer}
          onSubmit={handleMcqSubmit}
          onRetry={handleMcqRetry}
          isReviewMode={isReviewMode}
        />
      </div>
    </div>
  );

  // Render Engage Phase
  const renderEngage = () => {
    // Tool Selection Stage
    if (engageStage === 'toolSelect') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">CHOOSE YOUR TOOL</h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Select the chatbot platform you&apos;ll use for this module</p>
          </div>
          <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

          <div className="p-5">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {(['tidio', 'botpress', 'landbot'] as ToolType[]).map((tool) => (
                <ToolCard
                  key={tool}
                  tool={tool}
                  selected={selectedTool === tool}
                  onSelect={() => setSelectedTool(tool)}
                />
              ))}
            </div>

            {selectedTool && (
              <div className="bg-[rgba(45,211,111,0.08)] border border-[rgba(45,211,111,0.25)] rounded-lg p-4 mb-4">
                <p className="font-mono text-[10px] font-bold text-[#2DD36F] tracking-widest uppercase mb-2">✓ {TOOLS[selectedTool].name} SELECTED</p>
                <p className="text-[12px] text-[#9DBBD4]">
                  You&apos;ll use {TOOLS[selectedTool].name} to build your chatbot. The setup instructions will be tailored to this platform.
                </p>
              </div>
            )}

            <button
              onClick={() => selectedTool && setEngageStage('iDo')}
              disabled={!selectedTool}
              className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              CONTINUE TO I DO →
            </button>
          </div>
        </div>
      );
    }

    // I Do Stage
    if (engageStage === 'iDo') {
      const tool = selectedTool ? TOOLS[selectedTool] : TOOLS.tidio;

      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('toolSelect')} label="Back to Tool Selection" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">I DO — Watch & Learn</h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Watch an expert build a chatbot from scratch</p>
          </div>
          <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

          <div className="p-5">
            {/* Video */}
            <div className="bg-[#112030] border border-[#1C3348] rounded-lg overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-[#1C3348] flex items-center gap-2">
                <span className="text-lg">🎬</span>
                <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase">EXPERT WALKTHROUGH — {tool.name.toUpperCase()}</p>
              </div>
              <div className="aspect-video bg-[#08131E] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#1C3348] flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#C9A84C] text-2xl">▶</span>
                  </div>
                  <p className="text-[12px] text-[#7A9AB5]">Video placeholder: {tool.name} setup walkthrough</p>
                </div>
              </div>
            </div>

            {/* Expert's System Prompt */}
            <div className="bg-[rgba(45,211,111,0.06)] border border-[rgba(45,211,111,0.2)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#2DD36F] tracking-widest uppercase mb-2">✓ THE EXPERT&apos;S SYSTEM PROMPT</p>
              <div className="text-[12px] text-[#9DBBD4] leading-relaxed p-3 bg-[#08131E] rounded whitespace-pre-line font-mono">
{`You are Aria, the customer service assistant for Velara — 
a British sustainable luxury fashion brand.

You handle email and chat enquiries about orders, returns, 
sizing, and delivery. Keep all responses under 150 words. 
Use clear, warm, professional language. Never sound like 
a script.

Your goal is to resolve the customer's issue completely 
while making them feel valued.

If a customer mentions a solicitor, Trading Standards, 
a refund over £200, or a physically damaged product, 
do not attempt to resolve it. Say: "I want to make sure 
this is handled properly. I'm passing your case to our 
senior team, who will contact you within 24 hours."`}
              </div>
            </div>

            {/* Key Takeaway */}
            <div className="bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">💡 KEY TAKEAWAYS</p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-2">Notice three things the expert did:</p>
              <ul className="space-y-1.5">
                <li className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
                  <span className="text-[#C9A84C]">1.</span>
                  Gave the AI a <span className="text-[#C9A84C]">name and brand identity</span>
                </li>
                <li className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
                  <span className="text-[#C9A84C]">2.</span>
                  Set a clear <span className="text-[#C9A84C]">word limit and tone</span>
                </li>
                <li className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
                  <span className="text-[#C9A84C]">3.</span>
                  Defined <span className="text-[#C9A84C]">exact escalation language — word for word</span>
                </li>
              </ul>
              <p className="text-[11px] text-[#7A9AB5] mt-3 italic">The AI does not improvise on escalation. You tell it exactly what to say.</p>
            </div>

            <button
              onClick={() => setEngageStage('weDo')}
              className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
            >
              CONTINUE TO WE DO →
            </button>
          </div>
        </div>
      );
    }

    // We Do Stage
    if (engageStage === 'weDo') {
      const tool = selectedTool ? TOOLS[selectedTool] : TOOLS.tidio;

      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('iDo')} label="Back to I Do" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">WE DO — Build Together</h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Follow the steps to build your chatbot</p>
          </div>
          <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

          <div className="p-5">
            {/* Task 1: Account Setup */}
            {weDoTask === 1 && (
              <div>
                <TaskCard title="TASK 1: CREATE YOUR ACCOUNT">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">Follow these steps to set up your {tool.name} account:</p>
                  <div className="space-y-2 mb-4">
                    {tool.setupSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-3 p-2.5 bg-[#08131E] rounded border border-[#1C3348]">
                        <span className="font-mono text-[11px] font-bold text-[#C9A84C]">Step {i + 1}:</span>
                        <span className="text-[12px] text-[#9DBBD4]">{step}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-[12px] text-[#7A9AB5]">This is where your system prompt goes. Do not paste anything yet — just confirm you can see the settings panel.</p>
                </TaskCard>
      
                {/* URL Verification Gate */}
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-3">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">🔗 VERIFY YOUR SETUP</p>
                  <p className="text-[12px] text-[#9DBBD4] mb-3">
                    Paste your {tool.name} workspace or chatbot URL to prove you've set it up:
                  </p>
                  <input
                    type="url"
                    value={workspaceUrl}
                    onChange={(e) => setWorkspaceUrl(e.target.value)}
                    placeholder={tool.name === 'Tidio'
                      ? 'e.g., https://app.tidio.com/...' 
                      : tool.name === 'Botpress'
                      ? 'e.g., https://botpress.cloud/...'
                      : 'e.g., https://landbot.io/...'}
                    className="w-full p-3 bg-[#08131E] border border-[#1C3348] rounded text-[12px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] mb-2 placeholder:text-[#3D5870]"
                  />
                  <p className={cn(
                    "text-[10px]",
                    workspaceUrl.toLowerCase().includes(tool.name.toLowerCase())
                      ? "text-[#2DD36F]"
                      : "text-[#7A9AB5]"
                  )}>
                    {workspaceUrl.toLowerCase().includes(tool.name.toLowerCase())
                      ? '✓ Valid link detected'
                      : 'Enter a valid ' + tool.name + ' URL to continue'}
                  </p>
                </div>

                <button
                  onClick={() => workspaceUrl.toLowerCase().includes(tool.name.toLowerCase()) && setWeDoTask(2)}
                  disabled={!workspaceUrl.toLowerCase().includes(tool.name.toLowerCase())}
                  className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  CONTINUE TO TASK 2 →
                </button>
              </div>
            )}

            {/* Task 2: Write System Prompt */}
            {weDoTask === 2 && (
              <div>
                <TaskCard title="TASK 2: WRITE YOUR SCOPE SYSTEM PROMPT">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    Write your system prompt for Velara&apos;s AI assistant using SCOPE. Then paste it into your {tool.name} settings and save it.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5]">Minimum 60 words. Cover all five SCOPE elements.</p>
                </TaskCard>

                <QuickScopeTip tips={SCOPE_TIPS.systemPrompt} />

                <PromptInput
                  value={wd2Prompt}
                  onChange={setWd2Prompt}
                  placeholder="Write your SCOPE-structured system prompt here..."
                  minWords={30}
                  onSubmit={handleWd2Submit}
                  submitted={!!wd2Score}
                  score={wd2Score}
                  rows={8}
                />

                {wd2Score && (
                  <>
                    <ScoreGrid criteria={wd2Score} />
                    
                    <div className="mt-4 p-4 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg">
                      <p className="text-[12px] text-[#9DBBD4] mb-3">
                        Now paste this system prompt into your {tool.name} assistant settings and click Save. Then come back and confirm below.
                      </p>
                      <ConfirmCheckbox
                        checked={wd2Pasted}
                        onChange={() => setWd2Pasted(true)}
                        label={`I have pasted my system prompt into ${tool.name} and saved it`}
                      />
                    </div>

                    {wd2Pasted && (
                      <button
                        onClick={() => setWeDoTask(3)}
                        className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                      >
                        CONTINUE TO TASK 3 →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Task 3: Test Scenarios */}
            {weDoTask === 3 && (
              <div>
                <TaskCard title="TASK 3: TEST YOUR CHATBOT">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    Open the {tool.name} preview window. Send these three messages to your chatbot and see how it responds:
                  </p>
                  
                  <div className="mb-4">
                    {TEST_SCENARIOS.map((scenario) => (
                      <ScenarioCard key={scenario.id} scenario={scenario} />
                    ))}
                  </div>
                </TaskCard>

                <TaskCard title="REFLECTION QUESTIONS">
                  <p className="text-[12px] text-[#7A9AB5] mb-3">Answer each question (minimum 15 words):</p>
                  
                  <div className="space-y-3">
                    <div>
                      <p className="text-[11px] text-[#9DBBD4] mb-1.5">How did your chatbot handle Scenario 1?</p>
                      <textarea
                        value={wd3Reflect1}
                        onChange={(e) => setWd3Reflect1(e.target.value)}
                        placeholder="Describe the response quality..."
                        rows={2}
                        className="w-full p-2.5 bg-[#08131E] border border-[#1C3348] rounded text-[12px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] resize-none placeholder:text-[#3D5870]"
                      />
                      <p className="text-[9px] text-[#3D5870] mt-1">{wordCount(wd3Reflect1)} words</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#9DBBD4] mb-1.5">Did it escalate correctly on Scenario 3? What did it say?</p>
                      <textarea
                        value={wd3Reflect2}
                        onChange={(e) => setWd3Reflect2(e.target.value)}
                        placeholder="Describe the escalation response..."
                        rows={2}
                        className="w-full p-2.5 bg-[#08131E] border border-[#1C3348] rounded text-[12px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] resize-none placeholder:text-[#3D5870]"
                      />
                      <p className="text-[9px] text-[#3D5870] mt-1">{wordCount(wd3Reflect2)} words</p>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#9DBBD4] mb-1.5">What would you change in your system prompt based on the test?</p>
                      <textarea
                        value={wd3Reflect3}
                        onChange={(e) => setWd3Reflect3(e.target.value)}
                        placeholder="Describe improvements..."
                        rows={2}
                        className="w-full p-2.5 bg-[#08131E] border border-[#1C3348] rounded text-[12px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] resize-none placeholder:text-[#3D5870]"
                      />
                      <p className="text-[9px] text-[#3D5870] mt-1">{wordCount(wd3Reflect3)} words</p>
                    </div>
                  </div>
                </TaskCard>

                {/* Refinement */}
                <TaskCard title="REFINE YOUR SYSTEM PROMPT">
                  <p className="text-[12px] text-[#9DBBD4] mb-3">
                    Based on your test, refine your system prompt. What would you change or add? Write the improved version below:
                  </p>
                </TaskCard>

                <PromptInput
                  value={wd3Refined}
                  onChange={setWd3Refined}
                  placeholder="Write your refined system prompt..."
                  minWords={30}
                  onSubmit={handleWd3RefinedSubmit}
                  submitted={!!wd3RefinedScore}
                  score={wd3RefinedScore}
                  rows={6}
                />

                {!wd3RefinedScore && wordCount(wd3Reflect1) >= 15 && wordCount(wd3Reflect2) >= 15 && wordCount(wd3Reflect3) >= 15 && (
                  <button
                    onClick={handleWd3Submit}
                    className="w-full mb-4 py-2.5 bg-[rgba(45,211,111,0.15)] border border-[rgba(45,211,111,0.35)] rounded font-mono text-[10px] font-bold text-[#2DD36F] tracking-widest uppercase hover:bg-[rgba(45,211,111,0.25)] transition-all"
                  >
                    SUBMIT REFLECTIONS (+20 XP)
                  </button>
                )}

                {wd3RefinedScore && (
                  <button
                    onClick={() => setEngageStage('youDo')}
                    className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                  >
                    CONTINUE TO YOU DO →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // You Do Stage
    if (engageStage === 'youDo') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('weDo')} label="Back to We Do" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">YOU DO — Independent Build</h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Extend your chatbot independently</p>
          </div>
          <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

          <div className="p-5">
            {/* Task navigation */}
            <div className="flex gap-1.5 mb-4">
              {[1, 2, 3].map((t) => (
                <button
                  key={t}
                  onClick={() => setYouDoTask(t)}
                  className={cn(
                    "flex-1 py-2 rounded font-mono text-[10px] font-bold tracking-wider uppercase border transition-all",
                    youDoTask === t
                      ? "bg-[rgba(201,168,76,0.12)] border-[#C9A84C] text-[#C9A84C]"
                      : "border-[#1C3348] text-[#3D5870] hover:border-[rgba(201,168,76,0.4)]"
                  )}
                >
                  Task {t}
                </button>
              ))}
            </div>

            {/* Task 1 */}
            {youDoTask === 1 && (
              <div>
                <TaskCard title="TASK 1: HANDLE A DIFFICULT CUSTOMER">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed">
                    A customer says their item is a gift and the delivery is late for a birthday happening tomorrow. They are upset but not threatening.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mt-2">
                    Write a system prompt addition for this scenario. Aim for 40+ words.
                  </p>
                </TaskCard>

                <QuickScopeTip tips={SCOPE_TIPS.difficult} />

                <PromptInput
                  value={yd1Prompt}
                  onChange={setYd1Prompt}
                  placeholder="Write your scenario handling instructions..."
                  minWords={20}
                  onSubmit={handleYd1Submit}
                  submitted={!!yd1Score}
                  score={yd1Score}
                  rows={4}
                />

                {yd1Score && (
                  <button
                    onClick={() => setYouDoTask(2)}
                    className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                  >
                    CONTINUE TO TASK 2 →
                  </button>
                )}
              </div>
            )}

            {/* Task 2 */}
            {youDoTask === 2 && (
              <div>
                <BackButton onClick={() => setYouDoTask(1)} label="Back to Task 1" />
                <TaskCard title="TASK 2: WRITE THE ESCALATION SCRIPTS">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-2">
                    Write the exact words Aria should say for each escalation trigger:
                  </p>
                  <ul className="text-[12px] text-[#7A9AB5] space-y-1 mb-3">
                    <li>1. Customer mentions a solicitor</li>
                    <li>2. Refund request over £200</li>
                    <li>3. Physically damaged product on arrival</li>
                  </ul>
                  <p className="text-[12px] text-[#7A9AB5]">Each should be under 60 words, sound like Velara, and give a clear next step.</p>
                </TaskCard>

                <QuickScopeTip tips={SCOPE_TIPS.escalation} />

                <PromptInput
                  value={yd2Scripts}
                  onChange={setYd2Scripts}
                  placeholder="Write all three escalation scripts..."
                  minWords={40}
                  onSubmit={handleYd2Submit}
                  submitted={!!yd2Score}
                  score={yd2Score}
                  rows={6}
                />

                {yd2Score && (
                  <button
                    onClick={() => setYouDoTask(3)}
                    className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                  >
                    CONTINUE TO TASK 3 →
                  </button>
                )}
              </div>
            )}

            {/* Task 3 */}
            {youDoTask === 3 && (
              <div>
                <BackButton onClick={() => setYouDoTask(2)} label="Back to Task 2" />
                <TaskCard title="TASK 3: SCREENSHOT YOUR LIVE CHATBOT">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-2">
                    Open your chatbot preview. Have a conversation as if you are a Velara customer.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5]">
                    Reflect on what you see: Did it maintain brand voice? Did it handle complexity well? What are you most proud of? Minimum 50 words.
                  </p>
                </TaskCard>

                <PromptInput
                  value={yd3Reflect}
                  onChange={setYd3Reflect}
                  placeholder="Describe your chatbot conversation and reflect on its performance..."
                  minWords={25}
                  onSubmit={handleYd3Submit}
                  submitted={wordCount(yd3Reflect) >= 50}
                  score={null}
                  rows={5}
                />

                {/* Portfolio note */}
                <div className="bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg p-4 mb-4">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">💼 PORTFOLIO NOTE</p>
                  <p className="text-[12px] text-[#9DBBD4]">
                    Save your chatbot link or screenshot. This is your first deployable AI tool — it goes in your portfolio.
                  </p>
                </div>

                {wordCount(yd3Reflect) >= 50 && (
                  <button
                    onClick={() => setEngageStage('final')}
                    className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                  >
                    CONTINUE TO FINAL CHALLENGE →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Final Stage
    if (engageStage === 'final') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('youDo')} label="Back to You Do" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">FINAL CHALLENGE</h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Present your chatbot to the board</p>
          </div>
          <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

          <div className="p-5">
            <div className="bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">📋 THE BRIEF</p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed">
                Sarah Chen wants to present your chatbot to the Velara board as a proof of concept. Write a one-page brief including:
              </p>
              <ul className="text-[12px] text-[#7A9AB5] mt-2 space-y-1">
                <li>1. The problem it solves (the Monday inbox crisis)</li>
                <li>2. The tool you used and why</li>
                <li>3. Your complete system prompt</li>
                <li>4. Three example interactions</li>
                <li>5. One limitation and how you&apos;d address it at scale</li>
              </ul>
              <p className="text-[12px] text-[#C9A84C] mt-3">Aim for 150+ words. Portfolio quality.</p>
            </div>

            <PromptInput
              value={fp}
              onChange={setFp}
              placeholder="Write your board presentation brief..."
              minWords={75}
              onSubmit={handleFinalSubmit}
              submitted={!!fScore}
              score={fScore}
              rows={10}
            />

            {fScore && (
              <div className="mt-4 bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] rounded-lg p-4 text-center">
                <XPBurst amount={moduleXP} label="Module Complete!" />
                <p className="text-[13px] text-[#9DBBD4] mt-2">🎉 Congratulations! You&apos;ve completed Module 2: Chatbot Design.</p>
              </div>
            )}
          </div>
        </div>
      );
    }
  };

  // Render Consolidate Phase
  const renderConsolidate = () => (
    <div className="min-h-screen bg-[#08131E]">
      <div className="px-5 py-4 border-b border-[#1C3348]">
        <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
        <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">CONSOLIDATE</h1>
        <p className="text-[12px] text-[#7A9AB5] mt-1">Review your progress and portfolio item</p>
      </div>
      <PhaseIndicator currentPhase={phase} onPhaseClick={setPhase} isCompleted={true} />

      <div className="p-5">
        {/* Module Summary */}
        <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
          <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">🏆 MODULE COMPLETE</p>
          <div className="text-center py-4">
            <span className="font-mono text-[32px] font-bold text-[#C9A84C]">+{moduleXP} XP</span>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Badge earned: Chatbot Builder</p>
          </div>
        </div>

        {/* What You Built */}
        <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
          <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">✓ WHAT YOU BUILT</p>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
              <span className="text-[#2DD36F]">✓</span>
              A live AI customer service chatbot using {selectedTool ? TOOLS[selectedTool].name : 'Tidio'}
            </li>
            <li className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
              <span className="text-[#2DD36F]">✓</span>
              A SCOPE-structured system prompt with persona, behaviour, and escalation rules
            </li>
            <li className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
              <span className="text-[#2DD36F]">✓</span>
              Tested against 3 real customer scenarios
            </li>
            <li className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
              <span className="text-[#2DD36F]">✓</span>
              A one-page deployment brief for your portfolio
            </li>
          </ul>
        </div>

        {/* Portfolio Reminder */}
        <div className="bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg p-4 mb-4">
          <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">💼 BEFORE YOU LEAVE</p>
          <div className="space-y-2">
            <ConfirmCheckbox checked={false} onChange={() => {}} label="Save your chatbot link or take a screenshot" />
            <ConfirmCheckbox checked={false} onChange={() => {}} label="Copy your final system prompt into your portfolio notes" />
            <ConfirmCheckbox checked={false} onChange={() => {}} label='Add "Chatbot Design" to your LinkedIn skills' />
          </div>
        </div>
        {/* Try Another Tool */}
        <div className="bg-[rgba(74,144,217,0.06)] border border-[rgba(74,144,217,0.2)] rounded-lg p-4 mb-4">
          <p className="font-mono text-[11px] font-bold text-[#4A90D9] tracking-widest uppercase mb-3">🔄 TRY ANOTHER TOOL</p>
          <p className="text-[12px] text-[#9DBBD4] leading-relaxed mb-3">
            Want to expand your skills? Build the same chatbot with a different platform.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['tidio', 'botpress', 'landbot'] as ToolType[])
              .filter(tool => tool !== selectedTool)
              .map((tool) => (
                <button
                  key={tool}
                  onClick={() => {
                    setSelectedTool(tool);
                    setEngageStage('toolSelect');
                    setWeDoTask(1);
                    setYouDoTask(1);
                    setWd1Done(false);
                    setWd2Prompt('');
                    setWd2Score(null);
                    setWd2Pasted(false);
                    setWd3Reflect1('');
                    setWd3Reflect2('');
                    setWd3Reflect3('');
                    setWd3Refined('');
                    setWd3RefinedScore(null);
                    setYd1Prompt('');
                    setYd1Score(null);
                    setYd2Scripts('');
                    setYd2Score(null);
                    setYd3Reflect('');
                    setFp('');
                    setFScore(null);
                    setPhase('engage');
                  }}
                  className="p-3 bg-[#112030] border border-[#1C3348] rounded-lg text-left hover:border-[#4A90D9] hover:bg-[rgba(74,144,217,0.08)] transition-all"
                >
                  <p className="font-mono text-[11px] font-bold" style={{ color: TOOLS[tool].color }}>{TOOLS[tool].name}</p>
                  <p className="text-[10px] text-[#7A9AB5]">{TOOLS[tool].subtitle}</p>
                </button>
              ))}
          </div>
        </div>
        {/* Next Module Teaser */}
        <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
          <p className="font-mono text-[11px] font-bold text-[#4A90D9] tracking-widest uppercase mb-3">🔮 NEXT: MODULE 3 — WORKFLOW AUTOMATION</p>
          <p className="text-[12px] text-[#9DBBD4] leading-relaxed">
            Velara&apos;s systems still don&apos;t talk to each other. A new order comes in. Nothing updates automatically. Staff are copying data between five different platforms.
          </p>
          <p className="text-[12px] text-[#C9A84C] mt-2">Your next job: fix that without writing a single line of code.</p>
        </div>

        <button
          onClick={() => router.push('/course2')}
          className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
        >
          RETURN TO COURSE →
        </button>
      </div>
    </div>
  );

  // Main render
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#08131E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-[11px] text-[#3D5870] tracking-widest uppercase">Loading module...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08131E]">
      <PhaseIndicator currentPhase={phase} onPhaseClick={setPhase} isCompleted={progress.course2ModulesCompleted.includes(2)} />
      
      {phase === 'prepare' && renderPrepare()}
      {phase === 'engage' && renderEngage()}
      {phase === 'consolidate' && renderConsolidate()}
    </div>
  );
}
