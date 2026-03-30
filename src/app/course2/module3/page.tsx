'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { cn } from '@/lib/utils';
import {
  IterationRounds,
  SelfAssessmentChecklist,
  ConversationLogInput,
  ExportPortfolioButton,
  SkillLevelDisplay,
} from '@/components/SimplifiedFeatures';

// ─────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────
type Phase = 'prepare' | 'engage' | 'consolidate';
type EngageStage = 'toolSelect' | 'iDo' | 'weDo' | 'youDo' | 'final';
type CrmTool = 'hubspot' | 'salesforce' | 'zoho';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

interface IterationRound {
  round: number;
  prompt: string;
  reflection: string;
  score: number;
  maxScore: number;
  improvements: string[];
}

interface SavedAnswers {
  selectedTool: CrmTool;
  wd1Confirmed: boolean;
  wd2RadarBrief: string;
  wd2RadarScore: { n: string; p: boolean }[];
  wd2Iterations: IterationRound[];
  wd2CurrentRound: number;
  wd2PropertiesConfirmed: boolean;
  wd3CleanPrompt: string;
  wd3CleanScore: { n: string; p: boolean }[];
  wd3ImportConfirmed: boolean;
  yd1VipPrompt: string;
  yd1VipScore: { n: string; p: boolean }[];
  yd1SegmentConfirmed: boolean;
  yd2LapsedPrompt: string;
  yd2LapsedScore: { n: string; p: boolean }[];
  yd2AutomationConfirmed: boolean;
  yd3AnalysisPrompt: string;
  yd3AnalysisScore: { n: string; p: boolean }[];
  yd3Reflection: string;
  selfAssessmentItems: { id: string; label: string; hint?: string; checked: boolean }[];
  averageScore: number;
  skillLevel: 'bronze' | 'silver' | 'gold';
  fp: string;
  fScore: { n: string; p: boolean }[];
  moduleXP: number;
  radarChecklist: boolean[];
}

// ─────────────────────────────────────────────────────────────
// MCQ QUESTIONS
// ─────────────────────────────────────────────────────────────
const mcqQuestions: MCQQuestion[] = [
  {
    id: 'q1',
    question:
      'According to Agrawal, Gans and Goldfarb (2018), what is the primary business value of AI in customer relationship management?',
    options: [
      'Replacing human sales teams entirely',
      'Improving the accuracy of predictions about customer behaviour such as churn and repeat purchase likelihood',
      'Automating the creation of new products',
      'Reducing the cost of customer acquisition advertising',
    ],
    correct: 1,
  },
  {
    id: 'q2',
    question:
      'Velara discovers that 23 per cent of its revenue comes from 8 per cent of its customers. What is the most strategically important action?',
    options: [
      'Acquire more new customers through advertising',
      'Reduce prices to convert one-time buyers faster',
      'Identify and protect those high-value customers with personalised retention activity',
      'Hire more customer service staff',
    ],
    correct: 2,
  },
  {
    id: 'q3',
    question: 'What does the D in the RADAR framework stand for?',
    options: [
      'Data — the information you collect about customers',
      'Deploy — launching the CRM to the sales team',
      'Divide — segmenting contacts into meaningful groups',
      'Dashboard — the analytics view in the CRM',
    ],
    correct: 2,
  },
  {
    id: 'q4',
    question:
      'A CRM automation sends a win-back email to every contact who has not purchased in 90 days. A VIP customer who always buys in Q4 receives the win-back email in August. Which RADAR element was not applied correctly?',
    options: [
      'Records — the wrong fields were captured',
      'Attributes — the system did not account for seasonal purchase patterns',
      'Automate — the trigger was set incorrectly',
      'Review — the open rate was not being tracked',
    ],
    correct: 1,
  },
  {
    id: 'q5',
    question: 'Which of the following best describes the role of AI in a CRM system?',
    options: [
      'AI writes and sends all customer communications without human oversight',
      'AI replaces the need to collect customer data',
      'AI identifies patterns in customer data and surfaces insights a human would miss or not have time to find',
      'AI manages the CRM database and deletes duplicate records',
    ],
    correct: 2,
  },
];

// ─────────────────────────────────────────────────────────────
// VIDEO RESOURCES
// ─────────────────────────────────────────────────────────────
const videos = [
  {
    title: 'What is a CRM and why does every business need one?',
    duration: '8 min',
    url: 'https://www.youtube.com/watch?v=Jg6GoNP1dA0',
    embedUrl: 'https://www.youtube.com/embed/Jg6GoNP1dA0',
    description: 'Understand the fundamentals of CRM and how it transforms business relationships',
  },
  {
    title: 'HubSpot CRM full tutorial for beginners',
    duration: '18 min',
    url: 'https://www.youtube.com/watch?v=HVHKN5hXrJo',
    embedUrl: 'https://www.youtube.com/embed/HVHKN5hXrJo',
    description: 'Step-by-step walkthrough of setting up HubSpot from scratch',
  },
  {
    title: 'AI in CRM: HubSpot AI, Salesforce Einstein, and Zoho Zia',
    duration: '12 min',
    url: 'https://www.youtube.com/watch?v=3rg3Y1kFBgk',
    embedUrl: 'https://www.youtube.com/embed/3rg3Y1kFBgk',
    description: 'How AI features inside CRM tools surface insights and automate follow-up',
  },
];

// ─────────────────────────────────────────────────────────────
// CRM TOOL DATA
// ─────────────────────────────────────────────────────────────
const CRM_TOOLS = {
  hubspot: {
    name: 'HubSpot',
    subtitle: 'Recommended',
    description: 'Free forever tier, best AI features, easiest setup',
    badge: 'Best for Beginners',
    color: '#FF7A59',
    features: [
      'Free forever — no credit card',
      'AI-powered contact suggestions',
      'Built-in email sequences',
      'Visual deal pipeline',
    ],
    setupSteps: [
      'Go to hubspot.com/products/crm and sign up for the free tier — no credit card needed',
      'Skip the onboarding tour and go straight to Contacts in the left menu',
      'Click Settings (top right gear icon) > Properties > Create Property',
      'You are now ready to add custom properties — confirm you can see the property creation screen',
    ],
    aiFeature: 'HubSpot AI suggests contact properties, writes email copy, and predicts deal close probability.',
  },
  salesforce: {
    name: 'Salesforce',
    subtitle: 'Industry Standard',
    description: 'Free via Trailhead sandbox, most recognised on a CV',
    badge: 'Best for Enterprise',
    color: '#00A1E0',
    features: [
      'Free Developer Edition via Trailhead',
      'Einstein AI built in',
      'Industry-standard platform',
      'Strongest for enterprise roles',
    ],
    setupSteps: [
      'Go to trailhead.salesforce.com and create a free account',
      'From your Trailhead profile, launch a free Developer Edition org',
      'Navigate to the Contacts object in the App Launcher',
      'Go to Setup > Object Manager > Contact > Fields & Relationships to add custom fields',
    ],
    aiFeature: 'Salesforce Einstein AI predicts churn risk, scores leads, and suggests next best actions for each contact.',
  },
  zoho: {
    name: 'Zoho CRM',
    subtitle: 'SME Specialist',
    description: 'Free tier up to 3 users, clean interface, great for Velara\'s size',
    badge: 'Best for SMEs',
    color: '#E42527',
    features: [
      'Free tier — up to 3 users',
      'Zia AI assistant built in',
      'Clean, fast interface',
      'Perfect for Velara\'s scale',
    ],
    setupSteps: [
      'Go to zoho.com/crm and sign up for the free tier',
      'Skip the setup wizard and go directly to the Contacts module',
      'Click Settings > CRM Settings > Modules and Fields > Contacts',
      'Click Fields to see existing fields and add new custom ones — confirm you can see this screen',
    ],
    aiFeature: 'Zoho Zia AI detects anomalies in sales data, predicts contact scores, and suggests the best time to contact each customer.',
  },
};

// ─────────────────────────────────────────────────────────────
// RADAR FRAMEWORK
// ─────────────────────────────────────────────────────────────
const RADAR_FRAMEWORK = {
  name: 'RADAR',
  color: '#4A90D9',
  desc: 'RADAR is a design brief framework for CRM systems. It forces you to think through what data you need, what it tells you, how you group it, what actions it triggers automatically, and how you measure success. A CRM without RADAR is just a very expensive address book.',
  whyItWorks:
    'Most businesses collect customer data but never use it. RADAR closes the gap between data you have and decisions you make. Each element depends on the previous one — you cannot automate what you have not segmented.',
  bestFor:
    'Any business with repeat customers, a sales pipeline, or a need to personalise communication at scale.',
  letters: [
    {
      k: 'R',
      l: 'Records',
      h: 'Who are you tracking and what data do you capture?',
      tip: 'Think about what fields you need: purchase frequency, order value, last order date',
    },
    {
      k: 'A',
      l: 'Attributes',
      h: 'What do you know about each contact that changes how you treat them?',
      tip: 'VIP customers need different treatment than one-time buyers or lapsed customers',
    },
    {
      k: 'D',
      l: 'Divide',
      h: 'How do you segment contacts into meaningful groups?',
      tip: 'VIPs, active, lapsed, one-time buyers — each group needs a different strategy',
    },
    {
      k: 'A',
      l: 'Automate',
      h: 'What happens automatically when a contact meets a condition?',
      tip: 'Lapsed 90 days → win-back email. VIP → early access. New buyer → follow-up',
    },
    {
      k: 'R',
      l: 'Review',
      h: 'How do you know if the system is working?',
      tip: 'Track repeat purchase rate, email open rate, churn rate monthly',
    },
  ],
  example: {
    label: 'RADAR applied to Velara',
    text:
      'Records: Contacts with — Total Orders, Lifetime Value, Last Purchase Date, Preferred Category\nAttributes: VIP (3+ orders or £500+ spend), Active (bought in last 60 days), Lapsed (no purchase in 90+ days)\nDivide: VIP, Active, Lapsed, One-time buyers\nAutomate: Lapsed → win-back email at day 91. VIP → early access email before new collection.\nReview: Track repeat purchase rate monthly. Target: lift from 23% to 35% within 6 months.',
  },
};

// ─────────────────────────────────────────────────────────────
// QUICK RADAR TIPS
// ─────────────────────────────────────────────────────────────
const RADAR_TIPS = {
  radarBrief: [
    'R — Contacts: Total Orders, Lifetime Value, Last Purchase Date',
    'A — VIP = 3+ orders or £500+. Lapsed = no purchase 90+ days',
    'D — Four segments: VIP, Active, Lapsed, One-time buyers',
    'A — Lapsed → win-back email. VIP → early access.',
    'R — Track repeat purchase rate monthly',
  ],
  vipEmail: [
    'R — VIP customers: 3+ orders or £500+ lifetime value',
    'A — They buy regularly and expect recognition',
    'D — This email is VIP-only, exclusive access',
    'A — Early access to new collection, personal tone',
    'R — Track open rate and click-through',
  ],
  lapsedEmail: [
    'R — Lapsed: no purchase in 90+ days',
    'A — They liked Velara once — they just drifted',
    'D — Win-back, not a generic newsletter',
    'A — 10% discount, warm tone, no pressure',
    'R — Measure reactivation rate',
  ],
  analysis: [
    'R — 10 contacts, vary in spend and order frequency',
    'A — Identify who is at churn risk',
    'D — Which segment is missing from the data?',
    'A — Who should Velara call this week?',
    'R — What metric would you track to know if it worked?',
  ],
};

// ─────────────────────────────────────────────────────────────
// SAMPLE CUSTOMER DATA (used in WD Task 3)
// ─────────────────────────────────────────────────────────────
const SAMPLE_DATA = `name,email,orders,spend,last_order
emma thompson,emma.t@gmail.com,4,620,12/01/2025
James W,jamesw@hotmail.co.uk,,180,
Sophie Chen,s.chen@outlook.com,1,145,15/03/2025
robert,,2,290,22/02/2025
ALICE MORGAN,ALICE.M@GMAIL.COM,7,1240,03/04/2025
ben harris,ben@benharris.co.uk,1,95,
Charlotte Davies,cdavies@yahoo.com,3,,18/01/2025
mike,mike.jones@gmail.com,2,310,27/03/2025
NATALIE PRICE,n.price@outlook.com,,165,02/02/2025
Tom,tom.baker99@gmail.com,5,870,`;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
function wordCount(s: string): number {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

function getScoreClass(pass: number, total: number): 'great' | 'ok' | 'low' {
  if (pass / total >= 0.8) return 'great';
  if (pass / total >= 0.5) return 'ok';
  return 'low';
}

function xpForScore(pass: number, total: number, max: number): number {
  if (pass / total >= 0.8) return max;
  if (pass / total >= 0.5) return Math.round(max * 0.5);
  return Math.round(max * 0.2);
}

// ─────────────────────────────────────────────────────────────
// SHARED UI COMPONENTS
// ─────────────────────────────────────────────────────────────
function PhaseIndicator({
  currentPhase,
  onPhaseClick,
  isCompleted,
}: {
  currentPhase: Phase;
  onPhaseClick: (phase: Phase) => void;
  isCompleted: boolean;
}) {
  const phases = [
    { id: 'prepare', label: 'Prepare', icon: '📚' },
    { id: 'engage', label: 'Engage', icon: '🔧' },
    { id: 'consolidate', label: 'Consolidate', icon: '🏆' },
  ];
  const currentIndex = phases.findIndex((p) => p.id === currentPhase);
  return (
    <div className="flex bg-[#0D1E2E] border-b border-[#1C3348]">
      {phases.map((phase, idx) => {
        const isActive = idx === currentIndex;
        const isPast = idx < currentIndex;
        return (
          <button
            key={phase.id}
            onClick={() => {
              if (isCompleted || isPast || isActive) onPhaseClick(phase.id as Phase);
            }}
            disabled={!isCompleted && !isPast && !isActive}
            className={cn(
              'flex-1 py-3 text-center font-mono text-[11px] tracking-widest uppercase border-r border-[#1C3348] last:border-r-0 transition-all flex items-center justify-center gap-2',
              isActive && 'bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border-b-2 border-b-[#C9A84C]',
              isPast && 'text-[#2DD36F] hover:bg-[rgba(45,211,111,0.05)] cursor-pointer',
              !isActive && !isPast && 'text-[#3D5870]',
              !isCompleted && !isPast && !isActive && 'cursor-not-allowed'
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

function ProgressBar({
  phase,
  prepareProgress,
  engageStage,
  weDoTask,
  youDoTask,
}: {
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
      if (engageStage === 'iDo') return 12;
      if (engageStage === 'weDo') return 22 + (weDoTask - 1) * 15;
      if (engageStage === 'youDo') return 57 + (youDoTask - 1) * 11;
      if (engageStage === 'final') return 88;
    }
    return 100;
  };
  const pct = getPercentage();
  const getStepLabel = () => {
    if (phase === 'prepare') return 'Step 1 of 3: Prepare';
    if (phase === 'engage') {
      if (engageStage === 'toolSelect') return 'Step 2 of 3: Choose CRM';
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

function IntelFileCard({
  title,
  subtitle,
  read,
  onToggle,
}: {
  title: string;
  subtitle: string;
  read: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={cn(
        'bg-[#112030] border rounded-lg p-3.5 cursor-pointer transition-all flex items-center gap-3',
        read
          ? 'border-[rgba(45,211,111,0.35)] bg-[rgba(45,211,111,0.04)]'
          : 'border-[#1C3348] hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-0.5'
      )}
      onClick={onToggle}
    >
      <div
        className={cn(
          'w-10 h-12 rounded flex flex-col items-center justify-center font-mono text-[9px] font-bold tracking-wider shrink-0',
          read ? 'bg-[rgba(45,211,111,0.1)] text-[#2DD36F]' : 'bg-[#1C3348] text-[#3D5870]'
        )}
      >
        {read ? <span className="text-lg">✓</span> : 'PDF'}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-[13px]">{title}</h4>
        <p className="text-[11px] text-[#3D5870] leading-tight mt-0.5">{subtitle}</p>
      </div>
      <span
        className={cn(
          'font-mono text-[9px] px-2 py-1 rounded tracking-wider shrink-0',
          read
            ? 'bg-[rgba(45,211,111,0.12)] text-[#2DD36F] border border-[rgba(45,211,111,0.3)]'
            : 'border border-[#3D5870] text-[#3D5870]'
        )}
      >
        {read ? 'READ' : 'UNREAD'}
      </span>
    </div>
  );
}

function VideoCard({
  title,
  duration,
  embedUrl,
  description,
  watched,
  onToggle,
  isExpanded,
  onExpand,
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
    <div
      className={cn(
        'bg-[#112030] border rounded-lg overflow-hidden transition-all',
        watched ? 'border-[rgba(45,211,111,0.3)]' : 'border-[#1C3348]'
      )}
    >
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
            'w-full aspect-video flex items-center justify-center relative',
            watched ? 'bg-[rgba(45,211,111,0.08)]' : 'bg-[#1C3348] hover:bg-[#253545] transition-colors'
          )}
        >
          <div
            className={cn(
              'w-14 h-14 rounded-full flex items-center justify-center transition-all',
              watched ? 'bg-[rgba(45,211,111,0.2)]' : 'bg-[rgba(201,168,76,0.2)]'
            )}
          >
            <span className={cn('text-2xl', watched ? 'text-[#2DD36F]' : 'text-[#C9A84C]')}>
              {watched ? '✓' : '▶'}
            </span>
          </div>
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-1 rounded font-mono">
            {duration}
          </div>
        </button>
      )}
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
            onClick={onExpand}
            className="mt-2 text-[10px] text-[#C9A84C] hover:text-[#E8C96A] font-mono tracking-wider"
          >
            ▲ COLLAPSE VIDEO
          </button>
        )}
      </div>
    </div>
  );
}

function RadarChecklist({
  checked,
  onChange,
}: {
  checked: boolean[];
  onChange: (idx: number) => void;
}) {
  const letters = RADAR_FRAMEWORK.letters;
  const completed = checked.filter(Boolean).length;
  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase">
          📐 RADAR LEARNING CHECKLIST
        </p>
        <span
          className={cn(
            'font-mono text-[10px] px-2 py-1 rounded tracking-wider',
            completed === 5
              ? 'bg-[rgba(45,211,111,0.15)] text-[#2DD36F]'
              : 'bg-[#1C3348] text-[#7A9AB5]'
          )}
        >
          {completed}/5 COMPLETE
        </span>
      </div>
      <div className="space-y-2">
        {letters.map((letter, idx) => (
          <label
            key={letter.k + idx}
            className={cn(
              'flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all border',
              checked[idx]
                ? 'bg-[rgba(45,211,111,0.06)] border-[rgba(45,211,111,0.2)]'
                : 'bg-[#08131E] border-[#1C3348] hover:border-[rgba(201,168,76,0.4)]'
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
                <span
                  className="font-mono text-[18px] font-bold"
                  style={{ color: RADAR_FRAMEWORK.color }}
                >
                  {letter.k}
                </span>
                <span className="text-[13px] font-semibold text-white">{letter.l}</span>
              </div>
              <p className="text-[11px] text-[#7A9AB5] leading-tight">{letter.h}</p>
              {checked[idx] && (
                <p className="text-[10px] text-[#2DD36F] mt-1 italic">💡 {letter.tip}</p>
              )}
            </div>
            {checked[idx] && <span className="text-[#2DD36F] text-lg">✓</span>}
          </label>
        ))}
      </div>
      {completed === 5 && (
        <div className="mt-3 p-3 bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] rounded-lg text-center">
          <span className="font-mono text-[12px] font-bold text-[#2DD36F]">
            🎉 +10 XP — RADAR FRAMEWORK MASTERED!
          </span>
        </div>
      )}
    </div>
  );
}

function RadarFrameworkCard({
  isOpen,
  setIsOpen,
}: {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) {
  const fw = RADAR_FRAMEWORK;
  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg overflow-hidden mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[rgba(201,168,76,0.05)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📐</span>
          <div className="text-left">
            <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest">
              RADAR FRAMEWORK
            </p>
            <p className="text-[11px] text-[#3D5870] mt-0.5">CRM design brief for customer intelligence</p>
          </div>
        </div>
        <span
          className={cn(
            'font-mono text-[14px] text-[#C9A84C] transition-transform duration-250',
            isOpen && 'rotate-180'
          )}
        >
          ▼
        </span>
      </button>
      {isOpen && (
        <div className="px-4 pb-4">
          <div
            className="text-[13px] text-[#9DBBD4] leading-relaxed p-3 rounded border-l-2 mb-3"
            style={{ borderColor: fw.color, backgroundColor: `${fw.color}0D` }}
          >
            {fw.desc}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-[rgba(45,211,111,0.04)] border border-[rgba(45,211,111,0.15)] rounded">
              <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-1.5">
                💡 Why It Works
              </p>
              <p className="text-[12px] text-[#9DBBD4] leading-relaxed">{fw.whyItWorks}</p>
            </div>
            <div className="p-3 bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] rounded">
              <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-1.5">
                🎯 Best For
              </p>
              <p className="text-[12px] text-[#9DBBD4] leading-relaxed">{fw.bestFor}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
            {fw.letters.map((l, idx) => (
              <div
                key={l.k + idx}
                className="p-2.5 rounded border"
                style={{ borderColor: `${fw.color}33`, backgroundColor: `${fw.color}12` }}
              >
                <p className="font-mono text-[16px] font-bold" style={{ color: fw.color }}>
                  {l.k}
                </p>
                <p className="text-[12px] font-semibold text-white">{l.l}</p>
                <p className="text-[10px] text-[#7A9AB5] leading-tight mt-0.5">{l.h}</p>
                <p className="text-[9px] text-[#3D5870] leading-tight mt-1 italic">💡 {l.tip}</p>
              </div>
            ))}
          </div>
          <div className="p-3 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded">
            <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-1.5">
              {fw.example.label}
            </p>
            <p className="text-[12px] text-[#9DBBD4] leading-relaxed whitespace-pre-line">
              {fw.example.text}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function QuickRadarTip({ tips }: { tips: string[] }) {
  return (
    <div className="bg-[#08131E] border border-[#1C3348] rounded-lg p-3 mb-3">
      <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
        📐 RADAR Quick Reference
      </p>
      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {tips.map((tip, idx) => (
          <span key={idx} className="text-[11px] text-[#7A9AB5]">
            <span className="font-mono font-bold" style={{ color: RADAR_FRAMEWORK.color }}>
              {tip.split(' — ')[0]}
            </span>
            <span className="text-[#7A9AB5]"> — {tip.split(' — ')[1]}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function MCQGate({
  answers,
  submitted,
  score,
  onAnswer,
  onSubmit,
  onRetry,
  isReviewMode,
}: {
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
        <span className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest">
          🔐 CLEARANCE REQUIRED
        </span>
        <span className="font-mono text-[10px] text-[#3D5870]">
          {isReviewMode ? 'REVIEW MODE' : 'SCORE 5/5 TO ENTER HQ'}
        </span>
      </div>
      <div className="p-4">
        {mcqQuestions.map((q, qi) => (
          <div
            key={q.id}
            className="mb-4 pb-4 border-b border-[#1C3348] last:border-0 last:mb-0 last:pb-0"
          >
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
                      'flex items-center gap-2.5 p-2.5 px-3 border rounded-md cursor-pointer transition-all text-[12px]',
                      showCorrect && 'border-[#2DD36F] bg-[rgba(45,211,111,0.08)] text-[#2DD36F]',
                      showWrong && 'border-[#EF4444] bg-[rgba(239,68,68,0.08)] text-[#EF4444]',
                      !submitted &&
                        isSelected &&
                        'border-[#C9A84C] bg-[rgba(201,168,76,0.12)] text-white',
                      !submitted &&
                        !isSelected &&
                        'border-[#1C3348] text-[#7A9AB5] hover:border-[rgba(201,168,76,0.4)] hover:bg-[rgba(201,168,76,0.12)]',
                      submitted &&
                        !showCorrect &&
                        !showWrong &&
                        'border-[#1C3348] text-[#7A9AB5] cursor-default'
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
          <div
            className={cn(
              'p-3 rounded text-center font-mono text-[11px] font-bold tracking-wider mb-3',
              score === 5
                ? 'bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.3)] text-[#2DD36F]'
                : 'bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] text-[#C9A84C]'
            )}
          >
            {score === 5
              ? `ACCESS GRANTED — ${score}/5 CORRECT`
              : `CLEARANCE DENIED — ${score}/5 — REVIEW INTEL AND RETRY`}
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

function CrmToolCard({
  tool,
  selected,
  onSelect,
}: {
  tool: CrmTool;
  selected: boolean;
  onSelect: () => void;
}) {
  const t = CRM_TOOLS[tool];
  return (
    <button
      onClick={onSelect}
      className={cn(
        'bg-[#112030] border rounded-lg p-4 text-left transition-all',
        selected
          ? 'border-[#C9A84C] bg-[rgba(201,168,76,0.08)]'
          : 'border-[#1C3348] hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-0.5'
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p
            className="font-mono text-[13px] font-bold tracking-wider"
            style={{ color: t.color }}
          >
            {t.name}
          </p>
          <p className="text-[10px] text-[#7A9AB5]">{t.subtitle}</p>
        </div>
        <span
          className={cn(
            'font-mono text-[8px] px-2 py-0.5 rounded uppercase tracking-wider',
            selected ? 'bg-[#C9A84C] text-[#08131E]' : 'bg-[#1C3348] text-[#3D5870]'
          )}
        >
          {t.badge}
        </span>
      </div>
      <p className="text-[11px] text-[#9DBBD4] mb-2">{t.description}</p>
      <div className="space-y-1">
        {t.features.map((f, i) => (
          <p key={i} className="text-[10px] text-[#7A9AB5]">
            ✓ {f}
          </p>
        ))}
      </div>
      <div className="mt-3 pt-2 border-t border-[#1C3348]">
        <p className="text-[10px] text-[#3D5870] italic">{t.aiFeature}</p>
      </div>
      {selected && (
        <div className="mt-2 pt-2 border-t border-[#1C3348]">
          <p className="font-mono text-[9px] text-[#2DD36F] tracking-widest uppercase">✓ SELECTED</p>
        </div>
      )}
    </button>
  );
}

function ScoreGrid({ criteria }: { criteria: { n: string; p: boolean }[] }) {
  const pass = criteria.filter((c) => c.p).length;
  const total = criteria.length;
  const cls = getScoreClass(pass, total);
  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-1.5">
        {criteria.map((cr, idx) => (
          <div
            key={idx}
            className={cn(
              'flex items-center justify-between p-2 px-3 bg-[#08131E] rounded text-[11px]',
              cr.p
                ? 'border-l-2 border-[#2DD36F] text-white'
                : 'border-l-2 border-[rgba(239,68,68,0.3)] text-[#3D5870]'
            )}
          >
            <span>{cr.n}</span>
            <span className="text-[12px]">{cr.p ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>
      <div
        className={cn(
          'mt-2 p-2.5 rounded text-center font-mono text-[11px] font-bold tracking-wider',
          cls === 'great' &&
            'bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] text-[#2DD36F]',
          cls === 'ok' &&
            'bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-[#F59E0B]',
          cls === 'low' &&
            'bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444]'
        )}
      >
        {pass}/{total} CRITERIA MET — {Math.round((pass / total) * 100)}%
      </div>
    </div>
  );
}

function XPBurst({ amount, label }: { amount: number; label: string }) {
  return (
    <div className="text-center py-3">
      <span className="font-mono text-[22px] font-bold text-[#C9A84C]">+{amount} XP</span>
      <span className="block font-mono text-[10px] text-[#3D5870] tracking-widest mt-0.5">
        {label}
      </span>
    </div>
  );
}

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

function TaskCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-3">
      <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function PromptInput({
  value,
  onChange,
  placeholder,
  minWords,
  onSubmit,
  submitted,
  score,
  rows = 5,
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
          'w-full p-3 bg-[#08131E] border border-[#1C3348] rounded text-[12px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]',
          submitted && score && 'opacity-80'
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

function ConfirmCheckbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
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

function CopyableDataCard({ data }: { data: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="bg-[#08131E] border border-[#1C3348] rounded-lg p-3 mb-3">
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase">
          📋 VELARA SAMPLE DATA — COPY THIS INTO CHATGPT OR CLAUDE
        </p>
        <button
          onClick={() => {
            navigator.clipboard.writeText(data);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className={cn(
            'font-mono text-[9px] px-2.5 py-1 rounded border tracking-wider uppercase transition-all',
            copied
              ? 'bg-[rgba(45,211,111,0.15)] border-[rgba(45,211,111,0.3)] text-[#2DD36F]'
              : 'border-[#3D5870] text-[#3D5870] hover:border-[#C9A84C] hover:text-[#C9A84C]'
          )}
        >
          {copied ? '✓ COPIED' : 'COPY'}
        </button>
      </div>
      <pre className="text-[10px] text-[#7A9AB5] font-mono leading-relaxed overflow-x-auto whitespace-pre">
        {data}
      </pre>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN MODULE COMPONENT
// ─────────────────────────────────────────────────────────────
export default function Module3Page() {
  const router = useRouter();
  const { progress, isLoaded, addXP, addBadge, completeModule2, completePrepare2 } =
    useAcademyProgress();

  // ── phase state ──
  const [phase, setPhase] = useState<Phase>('prepare');
  const [moduleXP, setModuleXP] = useState(0);

  // ── prepare state ──
  const [paper1Read, setPaper1Read] = useState(false);
  const [paper2Read, setPaper2Read] = useState(false);
  const [videosWatched, setVideosWatched] = useState<boolean[]>([false, false, false]);
  const [expandedVideo, setExpandedVideo] = useState<number | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const [radarOpen, setRadarOpen] = useState(true);
  const [radarChecklist, setRadarChecklist] = useState<boolean[]>([
    false, false, false, false, false,
  ]);
  const [radarXPAwarded, setRadarXPAwarded] = useState(false);

  // ── engage state ──
  const [engageStage, setEngageStage] = useState<EngageStage>('toolSelect');
  const [selectedTool, setSelectedTool] = useState<CrmTool | null>(null);

  // ── we do state ──
  const [weDoTask, setWeDoTask] = useState(1);
  const [wd1Confirmed, setWd1Confirmed] = useState(false);

  // WD Task 2 — RADAR brief with iteration
  const [wd2Iterations, setWd2Iterations] = useState<IterationRound[]>([
    { round: 1, prompt: '', reflection: '', score: 0, maxScore: 6, improvements: [] },
    { round: 2, prompt: '', reflection: '', score: 0, maxScore: 6, improvements: [] },
  ]);
  const [wd2CurrentRound, setWd2CurrentRound] = useState(1);
  const [wd2PropertiesConfirmed, setWd2PropertiesConfirmed] = useState(false);

  // WD Task 3 — AI data cleaning
  const [wd3CleanPrompt, setWd3CleanPrompt] = useState('');
  const [wd3CleanScore, setWd3CleanScore] = useState<{ n: string; p: boolean }[] | null>(null);
  const [wd3ImportConfirmed, setWd3ImportConfirmed] = useState(false);

  // ── you do state ──
  const [youDoTask, setYouDoTask] = useState(1);

  // YD Task 1 — VIP segment
  const [yd1VipPrompt, setYd1VipPrompt] = useState('');
  const [yd1VipScore, setYd1VipScore] = useState<{ n: string; p: boolean }[] | null>(null);
  const [yd1SegmentConfirmed, setYd1SegmentConfirmed] = useState(false);

  // YD Task 2 — Lapsed segment + automation
  const [yd2LapsedPrompt, setYd2LapsedPrompt] = useState('');
  const [yd2LapsedScore, setYd2LapsedScore] = useState<{ n: string; p: boolean }[] | null>(null);
  const [yd2AutomationConfirmed, setYd2AutomationConfirmed] = useState(false);

  // YD Task 3 — AI analysis
  const [yd3AnalysisPrompt, setYd3AnalysisPrompt] = useState('');
  const [yd3AnalysisScore, setYd3AnalysisScore] = useState<{ n: string; p: boolean }[] | null>(
    null
  );
  const [yd3Reflection, setYd3Reflection] = useState('');

  // ── final state ──
  const [fp, setFp] = useState('');
  const [fScore, setFScore] = useState<{ n: string; p: boolean }[] | null>(null);

  // ── review / persistence ──
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswers | null>(null);

  // ── skill tracking ──
  const [averageScore, setAverageScore] = useState(0);
  const [skillLevel, setSkillLevel] = useState<'bronze' | 'silver' | 'gold'>('bronze');

  // ── self assessment ──
  const [selfAssessmentItems, setSelfAssessmentItems] = useState<
    { id: string; label: string; hint?: string; checked: boolean }[]
  >([
    {
      id: 'records',
      label: 'My CRM has the right custom properties set up',
      hint: 'Total Orders, Lifetime Value, Last Purchase Date',
      checked: false,
    },
    {
      id: 'data',
      label: 'I have imported clean customer data using AI',
      hint: '10 records with normalised formatting',
      checked: false,
    },
    {
      id: 'vip',
      label: 'My VIP segment is correctly defined and populated',
      hint: '3+ orders or £500+ lifetime value',
      checked: false,
    },
    {
      id: 'lapsed',
      label: 'My Lapsed segment has a live win-back automation',
      hint: 'Email triggers at day 91 after last purchase',
      checked: false,
    },
    {
      id: 'analysis',
      label: 'I used AI to analyse the data and identify churn risk',
      hint: 'AI named specific contacts at risk and why',
      checked: false,
    },
  ]);

  // ─────────────────────────────────────────────────────────────
  // PERSISTENCE
  // ─────────────────────────────────────────────────────────────
  const loadSavedAnswers = useCallback(() => {
    try {
      const saved = localStorage.getItem('swipeup-module3-answers');
      if (saved) {
        const parsed = JSON.parse(saved);
        setSavedAnswers(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading module3 answers:', e);
    }
    return null;
  }, []);

  const saveAnswers = useCallback(
    (answers: Partial<SavedAnswers>) => {
      try {
        const existing = localStorage.getItem('swipeup-module3-answers');
        const parsed = existing ? JSON.parse(existing) : {};
        const updated = {
          ...parsed,
          ...answers,
          selectedTool: selectedTool || 'hubspot',
          moduleXP,
          radarChecklist,
        };
        localStorage.setItem('swipeup-module3-answers', JSON.stringify(updated));
        setSavedAnswers(updated);
      } catch (e) {
        console.error('Error saving module3 answers:', e);
      }
    },
    [moduleXP, selectedTool, radarChecklist]
  );

  // ─────────────────────────────────────────────────────────────
  // INIT / REDIRECT
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isLoaded && !progress.studentName) router.push('/');
  }, [isLoaded, progress.studentName, router]);

  useEffect(() => {
    const savedData = loadSavedAnswers();

    if (progress.course2ModulesCompleted.includes(3)) {
      setIsReviewMode(true);
      setMcqSubmitted(true);
      setMcqScore(5);
      setPaper1Read(true);
      setPaper2Read(true);
      setVideosWatched([true, true, true]);
      setRadarChecklist([true, true, true, true, true]);

      if (savedData) {
        setSelectedTool(savedData.selectedTool || 'hubspot');
        setWd2Iterations(savedData.wd2Iterations || wd2Iterations);
        setWd2CurrentRound(savedData.wd2CurrentRound || 1);
        setWd2PropertiesConfirmed(savedData.wd2PropertiesConfirmed || false);
        setWd3CleanPrompt(savedData.wd3CleanPrompt || '');
        setWd3CleanScore(savedData.wd3CleanScore || null);
        setYd1VipPrompt(savedData.yd1VipPrompt || '');
        setYd1VipScore(savedData.yd1VipScore || null);
        setYd2LapsedPrompt(savedData.yd2LapsedPrompt || '');
        setYd2LapsedScore(savedData.yd2LapsedScore || null);
        setYd3AnalysisPrompt(savedData.yd3AnalysisPrompt || '');
        setYd3AnalysisScore(savedData.yd3AnalysisScore || null);
        setYd3Reflection(savedData.yd3Reflection || '');
        setFp(savedData.fp || '');
        setFScore(savedData.fScore || null);
        setModuleXP(savedData.moduleXP || 270);
        if (savedData.selfAssessmentItems) setSelfAssessmentItems(savedData.selfAssessmentItems);
        if (savedData.averageScore) setAverageScore(savedData.averageScore);
        if (savedData.skillLevel) setSkillLevel(savedData.skillLevel);
      }
      setPhase('consolidate');
    } else if (progress.course2PrepareCompleted.includes(3)) {
      setMcqSubmitted(true);
      setMcqScore(5);
      setPaper1Read(true);
      setPaper2Read(true);
      setVideosWatched([true, true, true]);
      setRadarChecklist([true, true, true, true, true]);
      setPhase('engage');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress.course2PrepareCompleted, progress.course2ModulesCompleted, loadSavedAnswers]);

  // ─────────────────────────────────────────────────────────────
  // HANDLERS — PREPARE
  // ─────────────────────────────────────────────────────────────
  const handleRadarCheck = (idx: number) => {
    const next = [...radarChecklist];
    next[idx] = !next[idx];
    setRadarChecklist(next);
    if (next.every(Boolean) && !radarXPAwarded) {
      addXP(10);
      setModuleXP((p) => p + 10);
      setRadarXPAwarded(true);
      saveAnswers({ radarChecklist: next });
    }
  };

  const handleMcqAnswer = (qi: number, oi: number) =>
    setMcqAnswers({ ...mcqAnswers, [qi]: oi });

  const handleMcqSubmit = () => {
    let sc = 0;
    mcqQuestions.forEach((q, i) => {
      if (mcqAnswers[i] === q.correct) sc++;
    });
    setMcqScore(sc);
    setMcqSubmitted(true);
    if (sc === 5) {
      addXP(50);
      setModuleXP((p) => p + 50);
      completePrepare2(3);
      setTimeout(() => setPhase('engage'), 1800);
    }
  };

  const handleMcqRetry = () => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(0);
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS — WD TASK 2 ITERATION
  // ─────────────────────────────────────────────────────────────
  const handleWd2PromptChange = (round: number, prompt: string) =>
    setWd2Iterations((prev) => prev.map((r) => (r.round === round ? { ...r, prompt } : r)));

  const handleWd2ReflectionChange = (round: number, reflection: string) =>
    setWd2Iterations((prev) =>
      prev.map((r) => (r.round === round ? { ...r, reflection } : r))
    );

  const handleWd2IterationSubmit = (round: number) => {
    const current = wd2Iterations.find((r) => r.round === round);
    if (!current || wordCount(current.prompt) < 50) return;
    const t = current.prompt.toLowerCase();
    const criteria = [
      { n: 'Records defined', p: t.includes('contact') || t.includes('field') || t.includes('property') || t.includes('capture') },
      { n: 'Attributes specified', p: t.includes('value') || t.includes('order') || t.includes('frequency') || t.includes('spend') || t.includes('last purchase') },
      { n: 'Segments described', p: t.includes('segment') || t.includes('vip') || t.includes('lapsed') || t.includes('group') || t.includes('divide') },
      { n: 'Automation planned', p: t.includes('automat') || t.includes('trigger') || t.includes('email') || t.includes('workflow') || t.includes('when') },
      { n: 'Review metric included', p: t.includes('review') || t.includes('track') || t.includes('measure') || t.includes('rate') || t.includes('metric') },
      { n: 'Sufficient detail', p: wordCount(current.prompt) >= 60 },
    ];
    const score = criteria.filter((c) => c.p).length;
    const improvements = criteria.filter((c) => !c.p).map((c) => c.n);
    const updated = wd2Iterations.map((r) =>
      r.round === round ? { ...r, score, improvements } : r
    );
    setWd2Iterations(updated);
    const xp = score >= 5 ? 40 : score >= 4 ? 30 : 20;
    addXP(xp);
    setModuleXP((p) => p + xp);
    if (round < 2) setWd2CurrentRound(round + 1);
    // update average
    const scores = updated
      .filter((r) => r.score > 0)
      .map((r) => r.score / r.maxScore);
    if (scores.length) {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      setAverageScore(Math.round(avg * 100));
      setSkillLevel(avg >= 0.9 ? 'gold' : avg >= 0.75 ? 'silver' : 'bronze');
    }
    saveAnswers({
      wd2Iterations: updated,
      wd2CurrentRound: round < 2 ? round + 1 : round,
    });
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS — WD TASK 3 (AI DATA CLEANING)
  // ─────────────────────────────────────────────────────────────
  const handleWd3Submit = () => {
    const t = wd3CleanPrompt.toLowerCase();
    const criteria = [
      { n: 'Clean instruction given', p: t.includes('clean') || t.includes('format') || t.includes('fix') || t.includes('standardise') || t.includes('correct') },
      { n: 'CSV format requested', p: t.includes('csv') || t.includes('import') || t.includes('spreadsheet') || t.includes('column') },
      { n: 'Missing data addressed', p: t.includes('missing') || t.includes('empty') || t.includes('blank') || t.includes('fill') },
      { n: 'Role assigned', p: t.includes('you are') || t.includes('act as') || t.includes('as a') },
      { n: 'Sufficient detail', p: wordCount(wd3CleanPrompt) >= 30 },
    ];
    setWd3CleanScore(criteria);
    const xp = xpForScore(criteria.filter((c) => c.p).length, criteria.length, 25);
    addXP(xp);
    setModuleXP((p) => p + xp);
    saveAnswers({ wd3CleanPrompt, wd3CleanScore: criteria });
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLERS — YOU DO
  // ─────────────────────────────────────────────────────────────
  const handleYd1Submit = () => {
    const t = yd1VipPrompt.toLowerCase();
    const criteria = [
      { n: 'VIP context provided', p: t.includes('vip') || t.includes('loyal') || t.includes('best customer') || t.includes('top') || t.includes('3 order') || t.includes('500') },
      { n: 'Email type specified', p: t.includes('email') || t.includes('early access') || t.includes('exclusive') || t.includes('collection') },
      { n: 'Velara voice referenced', p: t.includes('velara') || t.includes('luxury') || t.includes('sustainable') || t.includes('brand') },
      { n: 'Format specified', p: t.includes('subject') || t.includes('format') || t.includes('word') || t.includes('line') },
      { n: 'Sufficient detail', p: wordCount(yd1VipPrompt) >= 40 },
    ];
    setYd1VipScore(criteria);
    const xp = xpForScore(criteria.filter((c) => c.p).length, criteria.length, 30);
    addXP(xp);
    setModuleXP((p) => p + xp);
    saveAnswers({ yd1VipPrompt, yd1VipScore: criteria });
  };

  const handleYd2Submit = () => {
    const t = yd2LapsedPrompt.toLowerCase();
    const criteria = [
      { n: 'Lapsed context clear', p: t.includes('lapsed') || t.includes('inactive') || t.includes('miss') || t.includes('90 day') || t.includes('not purchased') || t.includes('win-back') },
      { n: 'Tone instruction', p: t.includes('warm') || t.includes('genuine') || t.includes('not desperate') || t.includes('tone') || t.includes('empathetic') },
      { n: 'Offer included', p: t.includes('10%') || t.includes('discount') || t.includes('offer') || t.includes('incentive') },
      { n: 'Brand voice maintained', p: t.includes('velara') || t.includes('luxury') || t.includes('sustainable') || t.includes('brand') || t.includes('premium') },
      { n: 'Sufficient detail', p: wordCount(yd2LapsedPrompt) >= 45 },
    ];
    setYd2LapsedScore(criteria);
    const xp = xpForScore(criteria.filter((c) => c.p).length, criteria.length, 35);
    addXP(xp);
    setModuleXP((p) => p + xp);
    saveAnswers({ yd2LapsedPrompt, yd2LapsedScore: criteria });
  };

  const handleYd3Submit = () => {
    const t = yd3AnalysisPrompt.toLowerCase();
    const criteria = [
      { n: 'Analysis task clear', p: t.includes('analys') || t.includes('identify') || t.includes('calculate') || t.includes('recommend') || t.includes('suggest') },
      { n: 'Data context provided', p: t.includes('velara') || t.includes('customer') || t.includes('data') || t.includes('contact') || t.includes('record') },
      { n: 'Multiple questions', p: t.includes('1.') || t.includes('first') || t.includes('also') || t.includes('and') || t.includes('second') },
      { n: 'Output format defined', p: t.includes('summary') || t.includes('bullet') || t.includes('list') || t.includes('table') || t.includes('brief') },
      { n: 'Sufficient detail', p: wordCount(yd3AnalysisPrompt) >= 50 },
    ];
    setYd3AnalysisScore(criteria);
    const xp = xpForScore(criteria.filter((c) => c.p).length, criteria.length, 40);
    addXP(xp);
    setModuleXP((p) => p + xp);
    saveAnswers({ yd3AnalysisPrompt, yd3AnalysisScore: criteria });
  };

  // ─────────────────────────────────────────────────────────────
  // HANDLER — FINAL
  // ─────────────────────────────────────────────────────────────
  const handleFinalSubmit = () => {
    const t = fp.toLowerCase();
    const criteria = [
      { n: 'Problem quantified', p: t.includes('23%') || t.includes('8%') || t.includes('invisible') || t.includes('no segment') || t.includes('spreadsheet') || t.includes('revenue') },
      { n: 'CRM system described', p: t.includes('hubspot') || t.includes('salesforce') || t.includes('zoho') || t.includes('crm') || t.includes('segment') || t.includes('workflow') },
      { n: 'RADAR brief included', p: t.includes('records') || t.includes('attributes') || t.includes('divide') || t.includes('automate') || t.includes('review') },
      { n: 'Emails referenced', p: t.includes('vip') || t.includes('lapsed') || t.includes('win-back') || t.includes('early access') || t.includes('email') },
      { n: 'Data insight present', p: t.includes('churn') || t.includes('risk') || t.includes('lifetime value') || t.includes('priority') || t.includes('segment') },
      { n: 'Limitation acknowledged', p: t.includes('limit') || t.includes('scale') || t.includes('manual') || t.includes('data quality') || t.includes('clean') || t.includes('accurate') },
      { n: 'Portfolio quality', p: wordCount(fp) >= 250 },
    ];
    setFScore(criteria);
    const xp = xpForScore(criteria.filter((c) => c.p).length, criteria.length, 60);
    addXP(xp);
    setModuleXP((p) => p + xp);
    saveAnswers({ fp, fScore: criteria, selfAssessmentItems, averageScore, skillLevel });
    completeModule2(3);
    addBadge('crm-analyst-1');
    setTimeout(() => setPhase('consolidate'), 2000);
  };

  // ─────────────────────────────────────────────────────────────
  // PREPARE PROGRESS
  // ─────────────────────────────────────────────────────────────
  const prepareProgress = Math.round(
    (paper1Read ? 15 : 0) +
      (paper2Read ? 15 : 0) +
      videosWatched.filter(Boolean).length * 8 +
      radarChecklist.filter(Boolean).length * 2 +
      (mcqSubmitted && mcqScore === 5 ? 40 : 0)
  );

  // ─────────────────────────────────────────────────────────────
  // RENDER — PREPARE
  // ─────────────────────────────────────────────────────────────
  const renderPrepare = () => (
    <div className="min-h-screen bg-[#08131E]">
      <div className="px-5 py-4 border-b border-[#1C3348]">
        <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
        <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">PREPARE</h1>
        <p className="text-[12px] text-[#7A9AB5] mt-1">
          Build your foundation for CRM and customer intelligence
        </p>
      </div>
      <ProgressBar
        phase={phase}
        prepareProgress={prepareProgress}
        engageStage={engageStage}
        weDoTask={weDoTask}
        youDoTask={youDoTask}
      />
      <div className="p-5 space-y-4">
        {/* Intel files */}
        <div>
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
            📂 INTEL FILES
          </p>
          <div className="space-y-2">
            <IntelFileCard
              title="Prediction Machines — Agrawal, Gans and Goldfarb (2018)"
              subtitle="How AI improves prediction in customer behaviour and churn"
              read={paper1Read}
              onToggle={() => setPaper1Read(!paper1Read)}
            />
            <IntelFileCard
              title="Velara Customer Intelligence Briefing"
              subtitle="12 months of order data, segment gaps, and the revenue concentration problem"
              read={paper2Read}
              onToggle={() => setPaper2Read(!paper2Read)}
            />
          </div>
        </div>

        {/* Videos */}
        <div>
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
            🎥 VIDEO TRAINING
          </p>
          <p className="text-[11px] text-[#7A9AB5] mb-3">
            Click a video to watch. All videos open directly in this page.
          </p>
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
                  const next = [...videosWatched];
                  next[i] = true;
                  setVideosWatched(next);
                }}
                isExpanded={expandedVideo === i}
                onExpand={() => setExpandedVideo(expandedVideo === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* RADAR checklist */}
        <div>
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
            📐 LEARNING CHECKLIST
          </p>
          <p className="text-[11px] text-[#7A9AB5] mb-3">
            Check off each RADAR element as you understand it. Complete all 5 to earn XP.
          </p>
          <RadarChecklist checked={radarChecklist} onChange={handleRadarCheck} />
        </div>

        {/* RADAR framework reference */}
        <div>
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
            📐 FRAMEWORK GUIDE
          </p>
          <RadarFrameworkCard isOpen={radarOpen} setIsOpen={setRadarOpen} />
        </div>

        {/* MCQ gate */}
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

  // ─────────────────────────────────────────────────────────────
  // RENDER — ENGAGE
  // ─────────────────────────────────────────────────────────────
  const renderEngage = () => {
    const tool = selectedTool ? CRM_TOOLS[selectedTool] : CRM_TOOLS.hubspot;

    // ── Tool Selection ──
    if (engageStage === 'toolSelect') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">
              CHOOSE YOUR CRM
            </h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">
              Select the CRM platform you will build in for this module
            </p>
          </div>
          <ProgressBar
            phase={phase}
            prepareProgress={prepareProgress}
            engageStage={engageStage}
            weDoTask={weDoTask}
            youDoTask={youDoTask}
          />
          <div className="p-5">
            <div className="bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
                📋 THE VELARA SITUATION
              </p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed">
                Velara has been trading for 12 years. They have thousands of customers. They do not know who any of them are. No segments. No lifetime value data. 23 per cent of Velara&apos;s revenue comes from just 8 per cent of customers — and nobody can name a single one of them.
              </p>
              <p className="text-[12px] text-[#C9A84C] mt-2 font-mono">
                Your job: build their CRM from scratch and fix that.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {(['hubspot', 'salesforce', 'zoho'] as CrmTool[]).map((t) => (
                <CrmToolCard
                  key={t}
                  tool={t}
                  selected={selectedTool === t}
                  onSelect={() => setSelectedTool(t)}
                />
              ))}
            </div>
            {selectedTool && (
              <div className="bg-[rgba(45,211,111,0.08)] border border-[rgba(45,211,111,0.25)] rounded-lg p-4 mb-4">
                <p className="font-mono text-[10px] font-bold text-[#2DD36F] tracking-widest uppercase mb-1">
                  ✓ {CRM_TOOLS[selectedTool].name} SELECTED
                </p>
                <p className="text-[12px] text-[#9DBBD4]">
                  Setup instructions will be tailored to {CRM_TOOLS[selectedTool].name} throughout this module.
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

    // ── I Do ──
    if (engageStage === 'iDo') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('toolSelect')} label="Back to CRM Selection" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">
              I DO — Watch &amp; Learn
            </h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">
              Watch an expert configure a CRM using the RADAR framework
            </p>
          </div>
          <ProgressBar
            phase={phase}
            prepareProgress={prepareProgress}
            engageStage={engageStage}
            weDoTask={weDoTask}
            youDoTask={youDoTask}
          />
          <div className="p-5">
            {/* Expert video placeholder */}
            <div className="bg-[#112030] border border-[#1C3348] rounded-lg overflow-hidden mb-4">
              <div className="px-4 py-3 border-b border-[#1C3348] flex items-center gap-2">
                <span className="text-lg">🎬</span>
                <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase">
                  EXPERT WALKTHROUGH — {tool.name.toUpperCase()}
                </p>
              </div>
              <div className="aspect-video bg-[#08131E] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full bg-[#1C3348] flex items-center justify-center mx-auto mb-3">
                    <span className="text-[#C9A84C] text-2xl">▶</span>
                  </div>
                  <p className="text-[12px] text-[#7A9AB5]">
                    Expert demo: {tool.name} CRM setup using RADAR
                  </p>
                </div>
              </div>
            </div>

            {/* Problem */}
            <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#EF4444] tracking-widest uppercase mb-2">
                ❌ THE PROBLEM
              </p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-2">
                Velara&apos;s current customer intelligence:
              </p>
              <ul className="space-y-1 text-[12px] text-[#7A9AB5]">
                <li>→ A Google Sheet with 4,200 rows</li>
                <li>→ Columns: Name, Email, Order Date, Amount</li>
                <li>→ No purchase frequency field</li>
                <li>→ No segment or tag of any kind</li>
                <li>→ No follow-up process after any purchase</li>
                <li>→ Last time anyone looked at it: six weeks ago</li>
              </ul>
              <p className="text-[12px] text-[#EF4444] mt-3 font-mono">
                Sarah Chen&apos;s best customers are invisible to her.
              </p>
            </div>

            {/* Expert RADAR brief */}
            <div className="bg-[rgba(45,211,111,0.06)] border border-[rgba(45,211,111,0.2)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#2DD36F] tracking-widest uppercase mb-2">
                ✓ THE EXPERT&apos;S RADAR BRIEF
              </p>
              <div className="text-[12px] text-[#9DBBD4] leading-relaxed p-3 bg-[#08131E] rounded font-mono space-y-1.5">
                <p><span className="text-[#4A90D9] font-bold">Records:</span> Contacts with — Total Orders, Lifetime Value, Last Purchase Date, Preferred Category</p>
                <p><span className="text-[#4A90D9] font-bold">Attributes:</span> VIP = 3+ orders or £500+ spend. Lapsed = no purchase in 90+ days.</p>
                <p><span className="text-[#4A90D9] font-bold">Divide:</span> Four segments — VIP, Active, Lapsed, One-time buyers</p>
                <p><span className="text-[#4A90D9] font-bold">Automate:</span> Lapsed → win-back email at day 91. VIP → early access before new collection.</p>
                <p><span className="text-[#4A90D9] font-bold">Review:</span> Repeat purchase rate monthly. Target: lift from 23% to 35% in 6 months.</p>
              </div>
            </div>

            {/* Key takeaways */}
            <div className="bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
                💡 KEY TAKEAWAYS
              </p>
              <ul className="space-y-2">
                {[
                  ['The expert wrote the RADAR brief before opening the CRM.', 'The build was fast because every decision was already made.'],
                  ['Four custom properties.', 'Two segments. Two automations. That is enough to go from zero customer intelligence to a system that actively retains customers.'],
                  ['AI was used twice:', 'to suggest the right properties to capture, and to write the email copy. The human made every strategic decision.'],
                ].map(([bold, rest], i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
                    <span className="text-[#C9A84C] shrink-0">→</span>
                    <span>
                      <span className="text-[#C9A84C] font-semibold">{bold}</span> {rest}
                    </span>
                  </li>
                ))}
              </ul>
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

    // ── We Do ──
    if (engageStage === 'weDo') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('iDo')} label="Back to I Do" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">
              WE DO — Build Together
            </h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">
              Set up your CRM, write your RADAR brief, and import real data using AI
            </p>
          </div>
          <ProgressBar
            phase={phase}
            prepareProgress={prepareProgress}
            engageStage={engageStage}
            weDoTask={weDoTask}
            youDoTask={youDoTask}
          />

          <div className="p-5">
            {/* ── WD Task 1: Account Setup ── */}
            {weDoTask === 1 && (
              <div>
                <TaskCard title="TASK 1: CREATE YOUR CRM ACCOUNT">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    Follow these steps to set up your {tool.name} account:
                  </p>
                  <div className="space-y-2 mb-4">
                    {tool.setupSteps.map((step, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 p-2.5 bg-[#08131E] rounded border border-[#1C3348]"
                      >
                        <span className="font-mono text-[11px] font-bold text-[#C9A84C] shrink-0">
                          Step {i + 1}:
                        </span>
                        <span className="text-[12px] text-[#9DBBD4]">{step}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 bg-[rgba(74,144,217,0.08)] border border-[rgba(74,144,217,0.2)] rounded mb-3">
                    <p className="font-mono text-[9px] font-bold text-[#4A90D9] tracking-widest uppercase mb-1">
                      🤖 {tool.name} AI FEATURE
                    </p>
                    <p className="text-[11px] text-[#9DBBD4]">{tool.aiFeature}</p>
                  </div>
                  <ConfirmCheckbox
                    checked={wd1Confirmed}
                    onChange={() => {
                      if (!wd1Confirmed) {
                        setWd1Confirmed(true);
                        saveAnswers({ wd1Confirmed: true });
                      }
                    }}
                    label={`I have created my ${tool.name} account and can see the contact fields or properties screen`}
                  />
                </TaskCard>
                {wd1Confirmed && (
                  <button
                    onClick={() => setWeDoTask(2)}
                    className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                  >
                    CONTINUE TO TASK 2 →
                  </button>
                )}
              </div>
            )}

            {/* ── WD Task 2: RADAR Brief + Custom Properties ── */}
            {weDoTask === 2 && (
              <div>
                <TaskCard title="TASK 2: WRITE YOUR RADAR BRIEF AND SET UP CUSTOM PROPERTIES">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-2">
                    Before you build anything, write Velara&apos;s RADAR brief. Cover all five elements. Aim for 60+ words. You will write two versions — each one better than the last.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5]">
                    Then create these 3 custom properties in your CRM: <span className="text-[#C9A84C]">Total Orders</span> (number), <span className="text-[#C9A84C]">Lifetime Value</span> (currency), <span className="text-[#C9A84C]">Last Purchase Date</span> (date).
                  </p>
                </TaskCard>

                <QuickRadarTip tips={RADAR_TIPS.radarBrief} />

                <IterationRounds
                  rounds={wd2Iterations}
                  currentRound={wd2CurrentRound}
                  onRoundChange={setWd2CurrentRound}
                  onPromptChange={handleWd2PromptChange}
                  onReflectionChange={handleWd2ReflectionChange}
                  onSubmit={handleWd2IterationSubmit}
                  minRounds={2}
                  maxRounds={2}
                  placeholder="Write your RADAR brief here — Records, Attributes, Divide, Automate, Review..."
                  reflectionPlaceholder="Which RADAR elements did you improve in this round? What still needs work?"
                />

                {wd2Iterations.every((r) => r.score > 0) && (
                  <div className="mt-4 p-4 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg">
                    <p className="text-[12px] text-[#9DBBD4] mb-3">
                      Now create the 3 custom properties in {tool.name}. Tick when done.
                    </p>
                    <ConfirmCheckbox
                      checked={wd2PropertiesConfirmed}
                      onChange={() => {
                        if (!wd2PropertiesConfirmed) {
                          setWd2PropertiesConfirmed(true);
                          addXP(10);
                          setModuleXP((p) => p + 10);
                          saveAnswers({ wd2PropertiesConfirmed: true });
                        }
                      }}
                      label="I have created Total Orders, Lifetime Value, and Last Purchase Date as custom properties in my CRM"
                    />
                  </div>
                )}

                {wd2PropertiesConfirmed && (
                  <button
                    onClick={() => setWeDoTask(3)}
                    className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                  >
                    CONTINUE TO TASK 3 →
                  </button>
                )}
              </div>
            )}

            {/* ── WD Task 3: AI Data Cleaning ── */}
            {weDoTask === 3 && (
              <div>
                <TaskCard title="TASK 3: CLEAN AND IMPORT DATA USING AI">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    Velara has given you a sample of 10 customer records. The data is messy — inconsistent formatting, missing fields, no segments applied.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">
                    Copy the data below into <span className="text-[#C9A84C]">ChatGPT or Claude</span>. Write a prompt asking AI to clean it, fill in missing fields where possible, and format it as a clean CSV ready for CRM import. Then import it.
                  </p>
                </TaskCard>

                <CopyableDataCard data={SAMPLE_DATA} />

                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-3">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
                    WRITE YOUR AI PROMPT BELOW (aim for 30+ words)
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">
                    Think about what you need AI to do: clean the data, fix formatting, handle missing values, and structure it for CRM import. Use the CRAFT skills from Module 1.
                  </p>
                </div>

                <PromptInput
                  value={wd3CleanPrompt}
                  onChange={setWd3CleanPrompt}
                  placeholder="Write the prompt you will use to ask AI to clean this data..."
                  minWords={15}
                  onSubmit={handleWd3Submit}
                  submitted={!!wd3CleanScore}
                  score={wd3CleanScore}
                  rows={4}
                />

                {wd3CleanScore && (
                  <>
                    <ScoreGrid criteria={wd3CleanScore} />
                    <div className="mt-4 p-3 bg-[rgba(45,211,111,0.06)] border border-[rgba(45,211,111,0.2)] rounded-lg">
                      <p className="text-[12px] text-[#9DBBD4] mb-3">
                        Run your prompt in ChatGPT or Claude, get the cleaned CSV, then import it into your {tool.name} CRM. You should have 10 contact records. Tick when done.
                      </p>
                      <ConfirmCheckbox
                        checked={wd3ImportConfirmed}
                        onChange={() => {
                          if (!wd3ImportConfirmed) {
                            setWd3ImportConfirmed(true);
                            addXP(15);
                            setModuleXP((p) => p + 15);
                            saveAnswers({ wd3ImportConfirmed: true });
                          }
                        }}
                        label="I have imported the cleaned data into my CRM and can see 10 contact records"
                      />
                    </div>
                  </>
                )}

                {wd3ImportConfirmed && (
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

    // ── You Do ──
    if (engageStage === 'youDo') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('weDo')} label="Back to We Do" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">
              YOU DO — Independent Build
            </h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">
              Build segments, automations, and use AI to analyse your data
            </p>
          </div>
          <ProgressBar
            phase={phase}
            prepareProgress={prepareProgress}
            engageStage={engageStage}
            weDoTask={weDoTask}
            youDoTask={youDoTask}
          />

          <div className="p-5">
            {/* Task tabs */}
            <div className="flex gap-1.5 mb-4">
              {[1, 2, 3].map((t) => (
                <button
                  key={t}
                  onClick={() => setYouDoTask(t)}
                  className={cn(
                    'flex-1 py-2 rounded font-mono text-[10px] font-bold tracking-wider uppercase border transition-all',
                    youDoTask === t
                      ? 'bg-[rgba(201,168,76,0.12)] border-[#C9A84C] text-[#C9A84C]'
                      : 'border-[#1C3348] text-[#3D5870] hover:border-[rgba(201,168,76,0.4)]'
                  )}
                >
                  Task {t}
                </button>
              ))}
            </div>

            {/* ── YD Task 1: VIP Segment ── */}
            {youDoTask === 1 && (
              <div>
                <TaskCard title="TASK 1: BUILD THE VIP SEGMENT AND WRITE THE EMAIL">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-2">
                    Create Velara&apos;s VIP segment in your CRM.
                  </p>
                  <div className="p-3 bg-[#08131E] border border-[#1C3348] rounded mb-3">
                    <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-1">
                      VIP DEFINITION
                    </p>
                    <p className="text-[12px] text-[#9DBBD4]">
                      A VIP customer has placed <span className="text-[#C9A84C]">3 or more orders</span> OR has a lifetime value of <span className="text-[#C9A84C]">£500 or more</span>.
                    </p>
                  </div>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">
                    Then use AI to write a personalised early access email for this segment. Write your AI prompt below (aim for 40+ words), then paste the email it produced underneath.
                  </p>
                </TaskCard>

                <QuickRadarTip tips={RADAR_TIPS.vipEmail} />

                <PromptInput
                  value={yd1VipPrompt}
                  onChange={setYd1VipPrompt}
                  placeholder="Write your AI prompt for the VIP early access email, then paste the output below it..."
                  minWords={20}
                  onSubmit={handleYd1Submit}
                  submitted={!!yd1VipScore}
                  score={yd1VipScore}
                  rows={6}
                />

                {yd1VipScore && (
                  <>
                    <ScoreGrid criteria={yd1VipScore} />
                    <div className="mt-4 p-3 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg">
                      <ConfirmCheckbox
                        checked={yd1SegmentConfirmed}
                        onChange={() => {
                          if (!yd1SegmentConfirmed) {
                            setYd1SegmentConfirmed(true);
                            addXP(10);
                            setModuleXP((p) => p + 10);
                            saveAnswers({ yd1SegmentConfirmed: true });
                          }
                        }}
                        label="I have created the VIP segment in my CRM and can see the qualifying contacts"
                      />
                    </div>
                    {yd1SegmentConfirmed && (
                      <button
                        onClick={() => setYouDoTask(2)}
                        className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                      >
                        CONTINUE TO TASK 2 →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── YD Task 2: Lapsed Segment + Automation ── */}
            {youDoTask === 2 && (
              <div>
                <BackButton onClick={() => setYouDoTask(1)} label="Back to Task 1" />
                <TaskCard title="TASK 2: BUILD THE LAPSED SEGMENT AND WIN-BACK AUTOMATION">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-2">
                    Create Velara&apos;s Lapsed customer segment and set up the win-back automation.
                  </p>
                  <div className="p-3 bg-[#08131E] border border-[#1C3348] rounded mb-3">
                    <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-1">
                      LAPSED DEFINITION
                    </p>
                    <p className="text-[12px] text-[#9DBBD4]">
                      Last Purchase Date more than <span className="text-[#C9A84C]">90 days ago</span>.
                    </p>
                  </div>
                  <p className="text-[12px] text-[#7A9AB5]">
                    Use AI to write a win-back email — warm, not desperate, offering 10% off. Write your AI prompt below (aim for 45+ words), paste the email output, then set up the automated sequence in your CRM.
                  </p>
                </TaskCard>

                <QuickRadarTip tips={RADAR_TIPS.lapsedEmail} />

                <PromptInput
                  value={yd2LapsedPrompt}
                  onChange={setYd2LapsedPrompt}
                  placeholder="Write your AI prompt for the win-back email, then paste the output below it..."
                  minWords={22}
                  onSubmit={handleYd2Submit}
                  submitted={!!yd2LapsedScore}
                  score={yd2LapsedScore}
                  rows={6}
                />

                {yd2LapsedScore && (
                  <>
                    <ScoreGrid criteria={yd2LapsedScore} />
                    <div className="mt-4 p-3 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg space-y-2">
                      <ConfirmCheckbox
                        checked={yd2AutomationConfirmed}
                        onChange={() => {
                          if (!yd2AutomationConfirmed) {
                            setYd2AutomationConfirmed(true);
                            addXP(15);
                            setModuleXP((p) => p + 15);
                            saveAnswers({ yd2AutomationConfirmed: true });
                          }
                        }}
                        label="I have created the Lapsed segment and set up the automated win-back email workflow in my CRM"
                      />
                    </div>
                    {yd2AutomationConfirmed && (
                      <button
                        onClick={() => setYouDoTask(3)}
                        className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                      >
                        CONTINUE TO TASK 3 →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── YD Task 3: AI Data Analysis ── */}
            {youDoTask === 3 && (
              <div>
                <BackButton onClick={() => setYouDoTask(2)} label="Back to Task 2" />
                <TaskCard title="TASK 3: USE AI TO ANALYSE YOUR CUSTOMER DATA">
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-2">
                    Copy your 10 contact records into ChatGPT or Claude. Ask AI to:
                  </p>
                  <ul className="text-[12px] text-[#7A9AB5] space-y-1 mb-3">
                    <li>1. Identify which customers are at highest churn risk</li>
                    <li>2. Calculate the average lifetime value across all contacts</li>
                    <li>3. Recommend which two customers to prioritise for a personal call this week and why</li>
                    <li>4. Suggest one segment Velara is missing that the data suggests they should create</li>
                  </ul>
                  <p className="text-[12px] text-[#7A9AB5]">
                    Write your prompt below (aim for 50+ words). After submitting, write your reflection — do you agree with AI&apos;s recommendations?
                  </p>
                </TaskCard>

                <CopyableDataCard data={SAMPLE_DATA} />

                <QuickRadarTip tips={RADAR_TIPS.analysis} />

                <PromptInput
                  value={yd3AnalysisPrompt}
                  onChange={setYd3AnalysisPrompt}
                  placeholder="Write your AI analysis prompt here..."
                  minWords={25}
                  onSubmit={handleYd3Submit}
                  submitted={!!yd3AnalysisScore}
                  score={yd3AnalysisScore}
                  rows={5}
                />

                {yd3AnalysisScore && (
                  <>
                    <ScoreGrid criteria={yd3AnalysisScore} />
                    <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mt-4">
                      <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
                        REFLECTION — DO YOU AGREE WITH AI? (aim for 60+ words)
                      </p>
                      <p className="text-[12px] text-[#7A9AB5] mb-3">
                        What did AI say? Do you agree with its churn risk assessment and contact recommendations? What would you do differently?
                      </p>
                      <textarea
                        value={yd3Reflection}
                        onChange={(e) => setYd3Reflection(e.target.value)}
                        placeholder="Summarise what AI told you, then give your critical assessment..."
                        rows={5}
                        className="w-full p-3 bg-[#08131E] border border-[#1C3348] rounded text-[12px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]"
                      />
                      <p className="font-mono text-[10px] text-[#3D5870] mt-2">
                        {wordCount(yd3Reflection)} words
                      </p>
                    </div>
                    {wordCount(yd3Reflection) >= 40 && (
                      <button
                        onClick={() => {
                          addXP(10);
                          setModuleXP((p) => p + 10);
                          saveAnswers({ yd3Reflection });
                          setEngageStage('final');
                        }}
                        className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                      >
                        CONTINUE TO FINAL CHALLENGE →
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    // ── Final Challenge ──
    if (engageStage === 'final') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('youDo')} label="Back to You Do" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">
              FINAL CHALLENGE
            </h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">
              Write the investor brief for Sarah Chen
            </p>
          </div>
          <ProgressBar
            phase={phase}
            prepareProgress={prepareProgress}
            engageStage={engageStage}
            weDoTask={weDoTask}
            youDoTask={youDoTask}
          />
          <div className="p-5">
            <div className="bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
                📋 THE BRIEF
              </p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                Sarah Chen is meeting with Velara&apos;s investors next week. She wants to show them that Velara now has a customer intelligence system — not just a spreadsheet. Write the complete Customer Intelligence Brief she will present.
              </p>
              <p className="text-[12px] text-[#7A9AB5] mb-2">It must include:</p>
              <ul className="text-[12px] text-[#7A9AB5] space-y-1">
                <li>1. The problem — what Velara did not know before (use the data: 23%, 8%)</li>
                <li>2. The system you built — CRM name, fields, segments, automations</li>
                <li>3. Your RADAR brief for the full system</li>
                <li>4. Two AI-generated emails and why you chose those prompts</li>
                <li>5. The AI data analysis — churn risk, priorities, missing segment</li>
                <li>6. One honest limitation and how Velara should address it at scale</li>
              </ul>
              <p className="text-[12px] text-[#C9A84C] mt-3 font-mono">
                Aim for 250+ words. Investor-facing. Portfolio quality.
              </p>
            </div>

            <PromptInput
              value={fp}
              onChange={setFp}
              placeholder="Write your Customer Intelligence Brief here..."
              minWords={100}
              onSubmit={handleFinalSubmit}
              submitted={!!fScore}
              score={fScore}
              rows={14}
            />

            {fScore && (
              <>
                <ScoreGrid criteria={fScore} />
                <div className="mt-4 bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] rounded-lg p-4 text-center">
                  <XPBurst amount={moduleXP} label="Module Complete!" />
                  <p className="text-[13px] text-[#9DBBD4] mt-2">
                    🎉 Congratulations! You&apos;ve completed Module 3: CRM and AI.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
  };

  // ─────────────────────────────────────────────────────────────
  // RENDER — CONSOLIDATE
  // ─────────────────────────────────────────────────────────────
  const renderConsolidate = () => (
    <div className="min-h-screen bg-[#08131E]">
      <div className="px-5 py-4 border-b border-[#1C3348]">
        <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
        <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">CONSOLIDATE</h1>
        <p className="text-[12px] text-[#7A9AB5] mt-1">Review your CRM build and portfolio items</p>
      </div>
      <PhaseIndicator
        currentPhase={phase}
        onPhaseClick={setPhase}
        isCompleted={true}
      />

      <div className="p-5 space-y-6">
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🎉</div>
          <h2 className="font-mono text-lg font-bold text-[#C9A84C] tracking-wider uppercase mb-2">
            Module Complete!
          </h2>
          <p className="text-[#9DBBD4]">You&apos;ve built Velara&apos;s entire customer intelligence system.</p>
        </div>

        <SkillLevelDisplay
          level={skillLevel}
          xp={moduleXP}
          skillName="CRM and Customer Intelligence"
          nextLevelXP={
            skillLevel === 'bronze' ? 150 : skillLevel === 'silver' ? 300 : undefined
          }
        />

        <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4">
          <p className="font-mono text-xs text-[#C9A84C] tracking-wider uppercase mb-3">
            Module Stats
          </p>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">{moduleXP}</p>
              <p className="text-xs text-[#3D5870]">XP Earned</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{averageScore}%</p>
              <p className="text-xs text-[#3D5870]">Avg Score</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {selectedTool ? CRM_TOOLS[selectedTool].name : 'HubSpot'}
              </p>
              <p className="text-xs text-[#3D5870]">CRM Used</p>
            </div>
          </div>
        </div>

        <ExportPortfolioButton
          data={{
            studentName: progress.studentName,
            studentId: progress.studentId,
            courseName: 'Productivity and Organisation',
            moduleName: 'Module 3: CRM and AI',
            completedDate: new Date().toLocaleDateString(),
            xpEarned: moduleXP,
            skillLevel: skillLevel,
            badge: 'CRM Analyst',
            prompts: [
              {
                title: 'RADAR Brief v1',
                prompt: wd2Iterations[0]?.prompt || '',
                score: wd2Iterations[0]?.score,
                maxScore: 6,
              },
              {
                title: 'RADAR Brief v2 (Refined)',
                prompt: wd2Iterations[1]?.prompt || '',
                score: wd2Iterations[1]?.score,
                maxScore: 6,
              },
              {
                title: 'AI Data Cleaning Prompt',
                prompt: wd3CleanPrompt,
              },
              {
                title: 'VIP Email Prompt',
                prompt: yd1VipPrompt,
              },
              {
                title: 'Win-Back Email Prompt',
                prompt: yd2LapsedPrompt,
              },
              {
                title: 'AI Analysis Prompt',
                prompt: yd3AnalysisPrompt,
              },
            ],
            reflections: [
              { question: 'AI Analysis Reflection', answer: yd3Reflection },
              { question: 'Investor Brief', answer: fp },
              ...selfAssessmentItems
                .filter((i) => i.checked)
                .map((i) => ({ question: i.label, answer: 'Verified' })),
            ],
          }}
        />

        <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4">
          <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">
            ✓ WHAT YOU BUILT
          </p>
          <ul className="space-y-2">
            {[
              `A ${selectedTool ? CRM_TOOLS[selectedTool].name : 'CRM'} configured with Velara-specific custom properties`,
              '10 customer records cleaned and imported using AI',
              'A VIP segment with an AI-written early access email',
              'A Lapsed segment with a live win-back automation',
              'An AI-powered data analysis identifying churn risk and contact priorities',
              'An investor-facing customer intelligence brief',
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-[12px] text-[#9DBBD4]">
                <span className="text-[#2DD36F]">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Self-assessment */}
        <SelfAssessmentChecklist
          title="CRM Quality Check"
          description="Verify your CRM is set up correctly before moving on"
          items={selfAssessmentItems}
          onChange={setSelfAssessmentItems}
          minRequired={4}
        />

        {/* Portfolio reminder */}
        <div className="bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg p-4">
          <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">
            💼 BEFORE YOU LEAVE
          </p>
          <div className="space-y-2">
            <ConfirmCheckbox
              checked={false}
              onChange={() => {}}
              label="Export or screenshot your CRM with contacts and segments visible"
            />
            <ConfirmCheckbox
              checked={false}
              onChange={() => {}}
              label="Save your two AI-generated emails — these are content samples for your portfolio"
            />
            <ConfirmCheckbox
              checked={false}
              onChange={() => {}}
              label={`Add "${selectedTool ? CRM_TOOLS[selectedTool].name : 'CRM'} (CRM)" to your LinkedIn skills`}
            />
            <ConfirmCheckbox
              checked={false}
              onChange={() => {}}
              label='Note this in your portfolio: "Built a customer segmentation system identifying churn risk across 10 contacts, with live win-back automation"'
            />
          </div>
        </div>

        {/* Try another CRM */}
        <div className="bg-[rgba(74,144,217,0.06)] border border-[rgba(74,144,217,0.2)] rounded-lg p-4">
          <p className="font-mono text-[11px] font-bold text-[#4A90D9] tracking-widest uppercase mb-3">
            🔄 TRY ANOTHER CRM
          </p>
          <p className="text-[12px] text-[#9DBBD4] leading-relaxed mb-3">
            Want to expand your skills? Build the same system in a different platform.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {(['hubspot', 'salesforce', 'zoho'] as CrmTool[])
              .filter((t) => t !== selectedTool)
              .map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTool(t);
                    setEngageStage('toolSelect');
                    setWeDoTask(1);
                    setYouDoTask(1);
                    setWd1Confirmed(false);
                    setWd2PropertiesConfirmed(false);
                    setWd3CleanPrompt('');
                    setWd3CleanScore(null);
                    setWd3ImportConfirmed(false);
                    setYd1VipPrompt('');
                    setYd1VipScore(null);
                    setYd1SegmentConfirmed(false);
                    setYd2LapsedPrompt('');
                    setYd2LapsedScore(null);
                    setYd2AutomationConfirmed(false);
                    setYd3AnalysisPrompt('');
                    setYd3AnalysisScore(null);
                    setYd3Reflection('');
                    setFp('');
                    setFScore(null);
                    setPhase('engage');
                  }}
                  className="p-3 bg-[#112030] border border-[#1C3348] rounded-lg text-left hover:border-[#4A90D9] hover:bg-[rgba(74,144,217,0.08)] transition-all"
                >
                  <p
                    className="font-mono text-[11px] font-bold"
                    style={{ color: CRM_TOOLS[t].color }}
                  >
                    {CRM_TOOLS[t].name}
                  </p>
                  <p className="text-[10px] text-[#7A9AB5]">{CRM_TOOLS[t].subtitle}</p>
                </button>
              ))}
          </div>
        </div>

        {/* Next module teaser */}
        <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4">
          <p className="font-mono text-[11px] font-bold text-[#4A90D9] tracking-widest uppercase mb-3">
            🔮 NEXT: MODULE 4 — NOTION AI FOR PROJECT MANAGEMENT
          </p>
          <p className="text-[12px] text-[#9DBBD4] leading-relaxed">
            Velara is running six product launches this year. Every one is tracked in a different person&apos;s inbox. No shared timeline. No task ownership. No visibility. Sarah Chen missed a launch deadline last month because nobody knew whose job it was.
          </p>
          <p className="text-[12px] text-[#C9A84C] mt-2">
            Your next job: build the project management system that makes sure that never happens again.
          </p>
        </div>

        <button
          onClick={() => {
            completeModule2(3);
            addBadge('crm-analyst-1');
            router.push('/course2');
          }}
          className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
        >
          RETURN TO COURSE →
        </button>
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // MAIN RENDER
  // ─────────────────────────────────────────────────────────────
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#08131E] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C9A84C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="font-mono text-[11px] text-[#3D5870] tracking-widest uppercase">
            Loading module...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08131E]">
      <PhaseIndicator
        currentPhase={phase}
        onPhaseClick={setPhase}
        isCompleted={progress.course2ModulesCompleted.includes(3)}
      />
      {phase === 'prepare' && renderPrepare()}
      {phase === 'engage' && renderEngage()}
      {phase === 'consolidate' && renderConsolidate()}
    </div>
  );
}
