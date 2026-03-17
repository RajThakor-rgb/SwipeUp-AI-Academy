'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { logProgress } from '@/lib/notion';
import { cn } from '@/lib/utils';

// Types
type Phase = 'prepare' | 'engage' | 'consolidate';
type EngageStage = 'iDo' | 'weDo' | 'youDo' | 'final';
type FrameworkType = 'craft' | 'costar' | 'risen';

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

interface SavedAnswers {
  wd2Txt: string;
  wd3Txt: string;
  yd1Txt: string;
  yd2Txt: string;
  yd3Txt: string;
  fp: string;
  fe: string;
  moduleXP: number;
}

// MCQ Questions
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

// We Do Task 1 Options
const WD_OPTS = ['No role assigned to the AI', 'No output format specified', 'No brand context provided', 'No target audience mentioned'];

// Frameworks Data
const FRAMEWORKS = {
  craft: {
    name: 'CRAFT',
    color: '#7C6FD4',
    desc: 'CRAFT is a practical framework for business prompting. It ensures every prompt tells the AI who it is, what to produce, how to produce it, and in what style — reducing vague outputs dramatically.',
    letters: [
      { k: 'C', l: 'Context', h: 'Background information the AI needs to understand the situation' },
      { k: 'R', l: 'Role', h: 'Who the AI should act as — e.g. "Act as a senior marketing copywriter"' },
      { k: 'A', l: 'Action', h: 'The specific task — write, rewrite, summarise, generate, analyse' },
      { k: 'F', l: 'Format', h: 'The shape of the output — bullet list, paragraph, email, 150 words' },
      { k: 'T', l: 'Tone', h: 'The voice and style — professional, warm, sophisticated, concise' },
    ],
    example: {
      label: 'CRAFT applied to Velara Instagram',
      text: 'Context: Velara is a British sustainable luxury fashion brand. Role: Act as a social media copywriter. Action: Write an Instagram caption for our new summer dress. Format: Under 150 characters with one emoji. Tone: Sophisticated, warm, and aspirational.',
    },
  },
  costar: {
    name: 'CO-STAR',
    color: '#2B9EAA',
    desc: 'CO-STAR gives you granular control over how the AI responds. It separates the objective (what to achieve) from the audience (who it\'s for) and the response format — useful for multi-stakeholder communications.',
    letters: [
      { k: 'C', l: 'Context', h: 'The setting or background — brand, situation, prior events' },
      { k: 'O', l: 'Objective', h: 'What you want to achieve — sell, inform, apologise, persuade' },
      { k: 'S', l: 'Style', h: 'The writing style — journalistic, narrative, business formal' },
      { k: 'T', l: 'Tone', h: 'Emotional register — empathetic, authoritative, friendly' },
      { k: 'A', l: 'Audience', h: 'Who will read this — customers, board, press, Gen Z' },
      { k: 'R', l: 'Response', h: 'The exact format of the output — length, structure, sections' },
    ],
    example: {
      label: 'CO-STAR for the board email task',
      text: 'Context: Velara is a fashion brand preparing its weekly update. Objective: Inform board members of sales performance. Style: Executive business writing. Tone: Confident and direct. Audience: Board of directors. Response: Structured email with subject line, 3 bullet summary, and one recommendation.',
    },
  },
  risen: {
    name: 'RISEN',
    color: '#C9624C',
    desc: 'RISEN is best for complex tasks that need step-by-step logic. The "Steps" and "Narrowing" elements guide the AI through a process and constrain it to avoid common failure modes like being too generic.',
    letters: [
      { k: 'R', l: 'Role', h: 'The persona the AI should take on for this specific task' },
      { k: 'I', l: 'Instructions', h: 'A clear, direct instruction — what to do in one sentence' },
      { k: 'S', l: 'Steps', h: 'A sequence the AI should follow — first do X, then do Y' },
      { k: 'E', l: 'End goal', h: 'What a successful output looks like — the measurable outcome' },
      { k: 'N', l: 'Narrowing', h: 'Constraints — what to avoid, what not to include, word limits' },
    ],
    example: {
      label: 'RISEN for the complaint response task',
      text: 'Role: You are a customer service specialist for Velara. Instruction: Write a reply to a late delivery complaint. Steps: 1) Open with empathy. 2) Acknowledge the delay. 3) Offer a 10% discount. 4) Close warmly. End goal: A response that retains the customer. Narrowing: Do not sound like a template. Under 150 words.',
    },
  },
};

// Framework apply hints per task
const FW_APPLY: Record<string, Record<FrameworkType, string[]>> = {
  wd2: {
    craft: [
      'C — Velara is a British sustainable luxury fashion brand',
      'R — Act as a social media copywriter for Velara',
      'A — Write an Instagram caption for [product/collection]',
      'F — One caption, under 150 characters',
      'T — Sophisticated and aspirational',
    ],
    costar: [
      'C — Velara sustainable fashion brand, UK',
      'O — Promote a product on Instagram',
      'S — Punchy social media writing',
      'T — Warm and aspirational',
      'A — Velara Instagram followers',
      'R — Single caption under 150 characters + hashtag',
    ],
    risen: [
      'R — You are Velara\'s social media manager',
      'I — Write an Instagram caption for the new collection',
      'S — Lead with the brand story, hook in line 1, CTA last',
      'E — A caption that drives engagement and fits the brand',
      'N — Under 150 characters, one emoji, no clichés',
    ],
  },
  wd3: {
    craft: [
      'C — A Velara customer\'s order arrived two weeks late',
      'R — Act as a senior customer service representative',
      'A — Write a professional email response to the complaint',
      'F — Email format, 100-150 words',
      'T — Empathetic, sophisticated, and genuinely apologetic',
    ],
    costar: [
      'C — Late delivery complaint at Velara fashion brand',
      'O — Retain the customer and resolve their frustration',
      'S — Professional customer service writing',
      'T — Warm, empathetic, and sincere',
      'A — Upset customer who paid premium prices',
      'R — Email reply, 100-150 words, with a discount offer',
    ],
    risen: [
      'R — You are Velara\'s head of customer experience',
      'I — Respond to a customer complaint about a late delivery',
      'S — 1) Empathise 2) Apologise 3) Explain 4) Compensate 5) Close warmly',
      'E — Customer feels heard and is likely to purchase again',
      'N — Must not sound like a template. Include 10% discount.',
    ],
  },
};

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

// Phase Progress Indicator Component
function PhaseIndicator({ currentPhase, onPhaseClick, isCompleted }: { currentPhase: Phase; onPhaseClick: (phase: Phase) => void; isCompleted: boolean }) {
  const phases = [
    { id: 'prepare', label: 'Prepare' },
    { id: 'engage', label: 'Engage' },
    { id: 'consolidate', label: 'Consolidate' },
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
              "flex-1 py-2.5 text-center font-mono text-[10px] tracking-widest uppercase border-r border-[#1C3348] last:border-r-0 transition-all",
              isActive && "bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border-b-2 border-b-[#C9A84C]",
              isPast && "text-[#2DD36F] hover:bg-[rgba(45,211,111,0.05)] cursor-pointer",
              !isActive && !isPast && "text-[#3D5870]",
              !isCompleted && !isPast && !isActive && "cursor-not-allowed"
            )}
          >
            {phase.label}
          </button>
        );
      })}
    </div>
  );
}

// Progress Bar Component
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
      if (engageStage === 'iDo') return 10;
      if (engageStage === 'weDo') return 20 + (weDoTask - 1) * 20;
      if (engageStage === 'youDo') return 60 + (youDoTask - 1) * 10;
      if (engageStage === 'final') return 88;
    }
    return 100;
  };
  
  const pct = getPercentage();

  return (
    <div className="flex items-center gap-3 px-5 py-2 bg-[#0D1E2E] border-b border-[#1C3348]">
      <span className="font-mono text-[10px] text-[#3D5870] tracking-wider shrink-0">MISSION</span>
      <div className="flex-1 h-[3px] bg-[#1C3348] rounded overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#C9A84C] to-[#E8C96A] rounded transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="font-mono text-[10px] text-[#C9A84C] shrink-0 min-w-[32px] text-right">{pct}%</span>
    </div>
  );
}

// Intel File Card Component
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

// Video Card Component
function VideoCard({ title, duration, url, watched, onToggle }: { title: string; duration: string; url: string; watched: boolean; onToggle: () => void }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className={cn(
        "bg-[#112030] border rounded-lg overflow-hidden transition-all block group",
        watched ? "border-[rgba(45,211,111,0.3)]" : "border-[#1C3348] hover:border-[rgba(201,168,76,0.4)] hover:-translate-y-0.5"
      )}
      onClick={onToggle}
    >
      <div className={cn(
        "h-14 flex items-center justify-center",
        watched ? "bg-[rgba(45,211,111,0.08)]" : "bg-[#1C3348]"
      )}>
        <div className={cn(
          "w-7 h-7 rounded-full border-1.5 flex items-center justify-center text-[11px]",
          watched ? "border-[#2DD36F] text-[#2DD36F]" : "border-[#C9A84C] text-[#C9A84C]"
        )}>
          {watched ? '✓' : '▶'}
        </div>
      </div>
      <div className="p-2.5">
        <p className="text-[11px] font-medium text-white leading-tight mb-0.5">{title}</p>
        <p className="font-mono text-[10px] text-[#3D5870]">{duration}</p>
      </div>
    </a>
  );
}

// MCQ Gate Component
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
      {/* Header */}
      <div className="bg-[rgba(201,168,76,0.08)] border-b border-[#1C3348] px-4.5 py-3 flex items-center justify-between">
        <span className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest">🔐 CLEARANCE REQUIRED</span>
        <span className="font-mono text-[10px] text-[#3D5870]">{isReviewMode ? 'REVIEW MODE' : 'SCORE 5/5 TO ENTER HQ'}</span>
      </div>

      {/* Questions */}
      <div className="p-4.5">
        {mcqQuestions.map((q, qi) => (
          <div key={q.id} className="mb-4.5 pb-4.5 border-b border-[#1C3348] last:border-0 last:mb-0 last:pb-0">
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

        {/* Result */}
        {submitted && (
          <div className={cn(
            "p-3.5 rounded-md text-center font-mono text-[11px] font-bold tracking-wider mb-3.5",
            score === 5 ? "bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.3)] text-[#2DD36F]" : "bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] text-[#C9A84C]"
          )}>
            {score === 5 ? `ACCESS GRANTED — ${score}/5 CORRECT` : `CLEARANCE DENIED — ${score}/5 — REVIEW INTEL AND RETRY`}
          </div>
        )}

        {/* Buttons */}
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

// Framework Reference Card Component
function FrameworkCard({ 
  activeFW, 
  setActiveFW, 
  isOpen, 
  setIsOpen,
  taskKey 
}: { 
  activeFW: FrameworkType; 
  setActiveFW: (fw: FrameworkType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  taskKey: string;
}) {
  const fw = FRAMEWORKS[activeFW];
  const applyHints = FW_APPLY[taskKey]?.[activeFW];

  return (
    <div className="bg-[#08131E] border border-[#1C3348] rounded-lg overflow-hidden mb-4">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-[rgba(201,168,76,0.05)] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">📐</span>
          <div className="text-left">
            <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest">FRAMEWORK REFERENCE</p>
            <p className="text-[11px] text-[#3D5870] mt-0.5">CRAFT · CO-STAR · RISEN — pick one and apply it below</p>
          </div>
        </div>
        <span className={cn(
          "font-mono text-[14px] text-[#C9A84C] transition-transform duration-250",
          isOpen && "rotate-180"
        )}>▼</span>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-4 pb-4 animate-fade-in">
          {/* Tabs */}
          <div className="flex gap-1.5 mb-3.5 pt-1">
            {(['craft', 'costar', 'risen'] as FrameworkType[]).map((fwKey) => {
              const f = FRAMEWORKS[fwKey];
              return (
                <button
                  key={fwKey}
                  onClick={() => setActiveFW(fwKey)}
                  className={cn(
                    "px-3 py-1.5 rounded font-mono text-[10px] font-bold tracking-wider uppercase transition-all border",
                    activeFW === fwKey 
                      ? `border-current` 
                      : "border-transparent"
                  )}
                  style={{
                    color: f.color,
                    backgroundColor: activeFW === fwKey ? `${f.color}26` : 'transparent',
                    borderColor: activeFW === fwKey ? f.color : `${f.color}4D`
                  }}
                >
                  {f.name}
                </button>
              );
            })}
          </div>

          {/* Description */}
          <div 
            className="text-[12px] text-[#7A9AB5] leading-relaxed p-3 rounded border-l-2 mb-3"
            style={{ borderColor: fw.color, backgroundColor: `${fw.color}0D` }}
          >
            {fw.desc}
          </div>

          {/* Letters Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-3">
            {fw.letters.map((l) => (
              <div
                key={l.k}
                className="p-2.5 rounded border"
                style={{ 
                  borderColor: `${fw.color}33`,
                  backgroundColor: `${fw.color}12`
                }}
              >
                <p className="font-mono text-[13px] font-bold" style={{ color: fw.color }}>{l.k}</p>
                <p className="text-[12px] font-semibold text-white mt-0.5">{l.l}</p>
                <p className="text-[11px] text-[#3D5870] leading-tight mt-0.5">{l.h}</p>
              </div>
            ))}
          </div>

          {/* Example */}
          <div className="p-3 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded">
            <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">{fw.example.label}</p>
            <p className="text-[12px] text-[#9DBBD4] leading-relaxed">{fw.example.text}</p>
          </div>

          {/* Apply Hints */}
          {applyHints && (
            <div className="mt-3 p-3 bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.15)] rounded">
              <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">Apply to this task</p>
              {applyHints.map((hint, idx) => {
                const letter = hint.split(' — ')[0];
                const text = hint.split(' — ')[1];
                return (
                  <div key={idx} className="flex items-baseline gap-1.5 text-[12px] mb-1 last:mb-0">
                    <span className="font-mono text-[11px] font-bold shrink-0" style={{ color: fw.color }}>{letter}</span>
                    <span className="text-[#7A9AB5]">{text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Score Grid Component
function ScoreGrid({ criteria }: { criteria: { n: string; p: boolean }[] }) {
  const pass = criteria.filter(c => c.p).length;
  const total = criteria.length;
  const cls = getScoreClass(pass, total);

  return (
    <div className="mt-3.5">
      <div className="grid grid-cols-2 gap-1.5">
        {criteria.map((cr, idx) => (
          <div
            key={idx}
            className={cn(
              "flex items-center justify-between p-2.5 px-3 bg-[#08131E] rounded text-[11px]",
              cr.p ? "border-l-2 border-[#2DD36F] text-white" : "border-l-2 border-[rgba(239,68,68,0.3)] text-[#3D5870]"
            )}
          >
            <span>{cr.n}</span>
            <span className="text-[12px]">{cr.p ? '✓' : '✗'}</span>
          </div>
        ))}
      </div>
      <div className={cn(
        "mt-2.5 p-3 rounded text-center font-mono text-[12px] font-bold tracking-wider",
        cls === 'great' && "bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] text-[#2DD36F]",
        cls === 'ok' && "bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-[#F59E0B]",
        cls === 'low' && "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444]"
      )}>
        {pass}/{total} CRITERIA MET — {Math.round(pass / total * 100)}%
      </div>
    </div>
  );
}

// XP Burst Component
function XPBurst({ amount, label }: { amount: number; label: string }) {
  return (
    <div className="text-center py-4 animate-pop-in">
      <span className="font-mono text-[26px] font-bold text-[#C9A84C]">+{amount} XP</span>
      <span className="block font-mono text-[10px] text-[#3D5870] tracking-widest mt-1">{label}</span>
    </div>
  );
}

// What Went Wrong Component
function MissBox({ missed, hints }: { missed: { n: string }[]; hints: Record<string, string> }) {
  return (
    <div className="bg-[#08131E] border border-[#1C3348] rounded p-3.5 mt-2.5">
      <p className="font-mono text-[9px] font-bold text-[#3D5870] tracking-widest uppercase mb-2">What to improve</p>
      {missed.map((m, idx) => (
        <div key={idx} className="flex items-start gap-2.5 py-2 border-b border-[#1C3348] last:border-0 last:pb-0">
          <span className="text-[#F59E0B] shrink-0">→</span>
          <div>
            <p className="text-[12px] font-medium text-[#3D5870]">{m.n}</p>
            <p className="text-[12px] text-[#7A9AB5]">{hints[m.n] || 'Add this element'}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Scaffold Component (fill-in-the-blank)
function Scaffold({ 
  task, 
  activeFW, 
  onBuild 
}: { 
  task: 'wd2' | 'wd3'; 
  activeFW: FrameworkType;
  onBuild: (fields: Record<string, string>) => void;
}) {
  const fw = FRAMEWORKS[activeFW];
  const [fields, setFields] = useState<Record<string, string>>({});

  const fieldDefs: Record<string, Record<FrameworkType, { key: string; label: string; ph: string }[]>> = {
    wd2: {
      craft: [
        { key: 'role', label: 'R — Role', ph: 'e.g. Act as a social media copywriter for Velara' },
        { key: 'platform', label: 'A — Action', ph: 'e.g. Write an Instagram caption for our summer collection' },
        { key: 'brand', label: 'C — Context', ph: 'e.g. Velara is a British sustainable luxury fashion brand' },
        { key: 'format', label: 'F — Format', ph: 'e.g. Under 150 characters, one emoji, hashtag #VelaraStyle' },
        { key: 'detail', label: 'T — Tone', ph: 'e.g. Sophisticated, warm, and aspirational' },
      ],
      costar: [
        { key: 'role', label: 'C — Context', ph: 'e.g. Velara is a British sustainable luxury fashion brand' },
        { key: 'platform', label: 'O — Objective', ph: 'e.g. Promote the summer collection on Instagram' },
        { key: 'brand', label: 'S — Style', ph: 'e.g. Punchy, image-led social media copy' },
        { key: 'format', label: 'T — Tone', ph: 'e.g. Warm and aspirational' },
        { key: 'detail', label: 'A+R — Audience & Response', ph: 'e.g. Velara followers. One caption under 150 characters + hashtag' },
      ],
      risen: [
        { key: 'role', label: 'R — Role', ph: "e.g. You are Velara's Instagram copywriter" },
        { key: 'platform', label: 'I — Instruction', ph: 'e.g. Write an Instagram caption for the new summer dress' },
        { key: 'brand', label: 'S — Steps', ph: 'e.g. Hook in line 1, brand story in line 2, CTA last' },
        { key: 'format', label: 'E — End goal', ph: 'e.g. A caption that drives engagement and fits the brand' },
        { key: 'detail', label: 'N — Narrowing', ph: 'e.g. Under 150 chars, one emoji, no generic phrases' },
      ],
    },
    wd3: {
      craft: [
        { key: 'role', label: 'R — Role', ph: 'e.g. Act as a senior customer service rep for Velara' },
        { key: 'context', label: 'C — Context', ph: 'e.g. A customer complained their order arrived two weeks late' },
        { key: 'tone', label: 'T — Tone', ph: 'e.g. Empathetic, apologetic, sophisticated — never robotic' },
        { key: 'format', label: 'F — Format', ph: 'e.g. Email reply, 100-150 words' },
        { key: 'detail', label: 'A — Action', ph: 'e.g. Write a response that retains the customer' },
      ],
      costar: [
        { key: 'role', label: 'C — Context', ph: 'e.g. Late delivery complaint at Velara fashion brand' },
        { key: 'context', label: 'O — Objective', ph: 'e.g. Retain the customer and resolve their frustration' },
        { key: 'tone', label: 'S+T — Style & Tone', ph: 'e.g. Professional, empathetic, and warm' },
        { key: 'format', label: 'A — Audience', ph: 'e.g. An upset customer who paid premium prices' },
        { key: 'detail', label: 'R — Response', ph: 'e.g. Email reply, 100-150 words, with 10% discount offer' },
      ],
      risen: [
        { key: 'role', label: 'R — Role', ph: "e.g. You are Velara's head of customer experience" },
        { key: 'context', label: 'I — Instruction', ph: 'e.g. Write a reply to a late delivery complaint' },
        { key: 'tone', label: 'S — Steps', ph: 'e.g. 1) Empathise 2) Apologise 3) Offer 10% discount 4) Close warmly' },
        { key: 'format', label: 'E — End goal', ph: 'e.g. Customer feels heard and stays loyal to Velara' },
        { key: 'detail', label: 'N — Narrowing', ph: 'e.g. Do not sound like a template. Under 150 words.' },
      ],
    },
  };

  const defs = fieldDefs[task][activeFW];

  return (
    <div className="mt-3 p-4 bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] rounded">
      <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase">🔧 GUIDED RETRY — Fill in each {fw.name} field, then hit Build</p>
      <p className="text-[11px] text-[#3D5870] mt-1 mb-3.5">The built prompt will replace what&apos;s in the text box above so you can edit and resubmit.</p>
      
      {defs.map((f) => (
        <div key={f.key} className="mb-2.5">
          <p className="text-[11px] font-medium text-[#7A9AB5] mb-1.5 flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-[#C9A84C] font-bold">{f.label}</span>
          </p>
          <input
            type="text"
            placeholder={f.ph}
            value={fields[f.key] || ''}
            onChange={(e) => setFields({ ...fields, [f.key]: e.target.value })}
            className="w-full p-2.5 px-3 bg-[#08131E] border border-[#1C3348] rounded text-[12px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors placeholder:text-[#3D5870]"
          />
        </div>
      ))}

      <button
        onClick={() => onBuild(fields)}
        className="w-full mt-2.5 py-3 bg-[rgba(201,168,76,0.15)] border border-[rgba(201,168,76,0.35)] rounded font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase hover:bg-[rgba(201,168,76,0.25)] hover:-translate-y-0.5 transition-all"
      >
        ▶ BUILD {fw.name} PROMPT — REPLACES TEXT BOX ABOVE
      </button>
    </div>
  );
}

// Back Button Component
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

// Saved Answer Display Component
function SavedAnswerDisplay({ label, answer }: { label: string; answer: string }) {
  return (
    <div className="bg-[#08131E] border border-[rgba(45,211,111,0.25)] rounded p-3.5 mb-3">
      <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-2">YOUR ANSWER</p>
      <p className="text-[13px] text-[#9DBBD4] leading-relaxed whitespace-pre-wrap">{answer || 'No answer saved'}</p>
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
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);

  // Engage state
  const [engageStage, setEngageStage] = useState<EngageStage>('iDo');
  const [idoCheck, setIdoCheck] = useState(false);

  // Framework state
  const [activeFW, setActiveFW] = useState<FrameworkType>('craft');
  const [fwOpen, setFwOpen] = useState(true);

  // We Do state
  const [weDoTask, setWeDoTask] = useState(1);
  const [wd1Sel, setWd1Sel] = useState<string[]>([]);
  const [wd1Done, setWd1Done] = useState(false);
  const [wd2Txt, setWd2Txt] = useState('');
  const [wd2Score, setWd2Score] = useState<{ n: string; p: boolean }[] | null>(null);
  const [wd2Done, setWd2Done] = useState(false);
  const [wd3Txt, setWd3Txt] = useState('');
  const [wd3Score, setWd3Score] = useState<{ n: string; p: boolean }[] | null>(null);
  const [wd3Done, setWd3Done] = useState(false);

  // You Do state
  const [youDoTask, setYouDoTask] = useState(1);
  const [yd1Txt, setYd1Txt] = useState('');
  const [yd1Score, setYd1Score] = useState<{ n: string; p: boolean }[] | null>(null);
  const [yd2Txt, setYd2Txt] = useState('');
  const [yd2Score, setYd2Score] = useState<{ n: string; p: boolean }[] | null>(null);
  const [yd3Txt, setYd3Txt] = useState('');
  const [yd3Score, setYd3Score] = useState<{ n: string; p: boolean }[] | null>(null);

  // Final state
  const [fp, setFp] = useState('');
  const [fe, setFe] = useState('');
  const [fScore, setFScore] = useState<{ n: string; p: boolean }[] | null>(null);
  const [fDone, setFDone] = useState(false);

  // Review mode state
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswers | null>(null);

  // Load saved answers from localStorage
  const loadSavedAnswers = useCallback(() => {
    try {
      const saved = localStorage.getItem('swipeup-module1-answers');
      if (saved) {
        setSavedAnswers(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Error loading saved answers:', e);
    }
  }, []);

  // Save answers to localStorage
  const saveAnswers = useCallback((answers: Partial<SavedAnswers>) => {
    try {
      const existing = localStorage.getItem('swipeup-module1-answers');
      const parsed = existing ? JSON.parse(existing) : {};
      const updated = { ...parsed, ...answers, moduleXP };
      localStorage.setItem('swipeup-module1-answers', JSON.stringify(updated));
      setSavedAnswers(updated);
    } catch (e) {
      console.error('Error saving answers:', e);
    }
  }, [moduleXP]);

  // Redirect checks
  useEffect(() => {
    if (isLoaded && !progress.studentName) {
      router.push('/');
    }
  }, [isLoaded, progress.studentName, router]);

  // Check if returning user - properly restore all state
  useEffect(() => {
    loadSavedAnswers();
    
    // If module is completed, show consolidate phase (review mode)
    if (progress.course2ModulesCompleted.includes(1)) {
      setIsReviewMode(true);
      setMcqSubmitted(true);
      setMcqScore(5);
      setPaper1Read(true);
      setPaper2Read(true);
      setVideosWatched([true, true, true]);
      setIdoCheck(true);
      setWd1Done(true);
      setWd1Sel(WD_OPTS);
      setWd2Done(true);
      setWd3Done(true);
      
      // Load saved answers
      const saved = localStorage.getItem('swipeup-module1-answers');
      if (saved) {
        const parsed = JSON.parse(saved);
        setWd2Txt(parsed.wd2Txt || '');
        setWd3Txt(parsed.wd3Txt || '');
        setYd1Txt(parsed.yd1Txt || '');
        setYd2Txt(parsed.yd2Txt || '');
        setYd3Txt(parsed.yd3Txt || '');
        setFp(parsed.fp || '');
        setFe(parsed.fe || '');
        setModuleXP(parsed.moduleXP || 700);
      }
      
      setPhase('consolidate');
    }
    // If prepare is completed but module not done, start at engage
    else if (progress.course2PrepareCompleted.includes(1)) {
      setMcqSubmitted(true);
      setMcqScore(5);
      setPaper1Read(true);
      setPaper2Read(true);
      setVideosWatched([true, true, true]);
      setPhase('engage');
    }
  }, [progress.course2PrepareCompleted, progress.course2ModulesCompleted, loadSavedAnswers]);

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
      completePrepare2(1);
      setTimeout(() => {
        setPhase('engage');
      }, 1800);
    }
  };

  const handleMcqRetry = () => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(0);
  };

  // WD2 handlers
  const handleWd2Submit = () => {
    const t = wd2Txt.toLowerCase();
    const criteria = [
      { n: 'Role assigned', p: t.includes('act as') || t.includes('you are') || t.includes('as a') },
      { n: 'Platform context', p: t.includes('instagram') || t.includes('social media') || t.includes('post') },
      { n: 'Brand reference', p: t.includes('velara') || t.includes('brand') || t.includes('fashion') || t.includes('sustainable') },
      { n: 'Format specified', p: t.includes('caption') || t.includes('format') || t.includes('character') || t.includes('150') || t.includes('hashtag') },
      { n: 'Sufficient detail', p: wordCount(wd2Txt) >= 30 },
    ];
    setWd2Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 25);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ wd2Txt });
  };

  const handleWd2Scaffold = (fields: Record<string, string>) => {
    const parts = Object.values(fields).filter(Boolean);
    if (parts.length) {
      setWd2Txt(parts.join('. ') + '.');
      setWd2Score(null);
    }
  };

  // WD3 handlers
  const handleWd3Submit = () => {
    const t = wd3Txt.toLowerCase();
    const criteria = [
      { n: 'Customer context', p: t.includes('customer') || t.includes('complaint') || t.includes('delivery') || t.includes('late') },
      { n: 'Empathy/tone', p: t.includes('empath') || t.includes('apolog') || t.includes('professional') || t.includes('understanding') },
      { n: 'Response format', p: t.includes('email') || t.includes('response') || t.includes('reply') },
      { n: 'Brand voice', p: t.includes('tone') || t.includes('formal') || t.includes('brand') || t.includes('velara') || t.includes('sophisticated') },
      { n: 'Sufficient detail', p: wordCount(wd3Txt) >= 40 },
    ];
    setWd3Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 50);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ wd3Txt });
  };

  const handleWd3Scaffold = (fields: Record<string, string>) => {
    const parts = Object.values(fields).filter(Boolean);
    if (parts.length) {
      setWd3Txt(parts.join('. ') + '.');
      setWd3Score(null);
    }
  };

  // You Do handlers
  const handleYd1Submit = () => {
    const t = yd1Txt.toLowerCase();
    const criteria = [
      { n: 'Role assigned', p: t.includes('act as') || t.includes('you are') || t.includes('as a') },
      { n: 'Product named', p: t.includes('velara') || t.includes('midnight edit') },
      { n: 'Word count specified', p: t.includes('150') || t.includes('word') },
      { n: 'Brand voice included', p: t.includes('sophisticated') || t.includes('sustainable') || t.includes('british') || t.includes('elegant') },
      { n: 'Output format clear', p: t.includes('description') || t.includes('paragraph') || t.includes('copy') },
    ];
    setYd1Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 100);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ yd1Txt });
  };

  const handleYd2Submit = () => {
    const t = yd2Txt.toLowerCase();
    const criteria = [
      { n: 'Quantity specified', p: t.includes('5') || t.includes('five') },
      { n: 'Character limit', p: t.includes('150') || t.includes('character') },
      { n: 'Emoji requirement', p: t.includes('emoji') },
      { n: 'Hashtag requirement', p: t.includes('hashtag') },
      { n: 'Sufficient detail', p: wordCount(yd2Txt) >= 40 },
    ];
    setYd2Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 150);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ yd2Txt });
  };

  const handleYd3Submit = () => {
    const t = yd3Txt.toLowerCase();
    const criteria = [
      { n: 'Empathy/apology', p: t.includes('empath') || t.includes('apolog') },
      { n: 'Discount specified', p: t.includes('10%') || t.includes('discount') || t.includes('compensation') },
      { n: 'Brand voice defined', p: t.includes('brand voice') || t.includes('tone') || t.includes('sophisticated') },
      { n: 'Anti-template note', p: t.includes('template') || t.includes('personal') || t.includes('generic') || t.includes('human') },
      { n: 'Sufficient detail', p: wordCount(yd3Txt) >= 50 },
    ];
    setYd3Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 200);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswers({ yd3Txt });
  };

  // Final handler
  const handleFinalSubmit = async () => {
    const t = fp.toLowerCase();
    const e = fe.toLowerCase();
    const criteria = [
      { n: 'Role assigned', p: t.includes('act as') || t.includes('you are') || t.includes('as a') },
      { n: 'Board audience', p: t.includes('board') || t.includes('director') || t.includes('executive') || t.includes('stakeholder') },
      { n: 'Sales context', p: t.includes('sales') || t.includes('revenue') || t.includes('performance') || t.includes('update') },
      { n: 'Format specified', p: t.includes('bullet') || t.includes('section') || t.includes('summary') || t.includes('format') || t.includes('structure') },
      { n: 'Prompt length', p: wordCount(fp) >= 35 },
      { n: 'Problem identified', p: e.includes('missing') || e.includes('lack') || e.includes('vague') || e.includes('unclear') || e.includes('no ') },
      { n: 'Improvement explained', p: e.includes('context') || e.includes('specific') || e.includes('detail') || e.includes('audience') || e.includes('role') || e.includes('framework') },
      { n: 'Explanation depth', p: wordCount(fe) >= 25 },
    ];
    setFScore(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 250);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    
    // Save all final answers
    saveAnswers({ fp, fe, moduleXP: moduleXP + xp });
    
    completeModule2(1);
    addBadge('Prompt Specialist');
    setFDone(true);

    await logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'Module 1 Complete',
      details: `Total XP earned: ${moduleXP + xp}`,
      totalXP: progress.totalXP + xp,
    });

    setPhase('consolidate');
  };

  // Prepare progress calculation
  const prepareProgress = Math.min(90, Object.keys(mcqAnswers).length * 12 + (paper1Read ? 8 : 0) + (paper2Read ? 8 : 0) + (videosWatched.filter(Boolean).length * 6));

  // Loading state
  if (!isLoaded || !progress.studentName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08131E]">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08131E]">
      {/* Header */}
      <header className="bg-[rgba(8,19,30,0.97)] border-b border-[#1C3348] sticky top-0 z-50 backdrop-blur-sm">
        <div className="flex items-center justify-between px-5 py-2.5">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => router.push('/course2')}
              className="text-[#7A9AB5] hover:text-[#C9A84C] transition-colors"
            >
              ← Back
            </button>
            <div className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest border border-[#C9A84C] px-2 py-1 rounded">SWIPEUP</div>
            <span className="font-semibold text-[13px] text-[#7A9AB5]">Module 01 — Prompt Engineering</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[13px] font-bold text-[#C9A84C]">⭐ {progress.totalXP + moduleXP} XP</span>
            {isReviewMode && (
              <span className="font-mono text-[9px] px-2 py-1 rounded tracking-wider bg-[rgba(45,211,111,0.1)] text-[#2DD36F] border border-[rgba(45,211,111,0.3)]">
                REVIEW MODE
              </span>
            )}
            <span className={cn(
              "font-mono text-[10px] px-2 py-1 rounded tracking-wider",
              mcqScore === 5 ? "border border-[#C9A84C] text-[#C9A84C]" : "border border-[#3D5870] text-[#3D5870]"
            )}>
              {mcqScore === 5 ? 'CLEARED' : 'UNCLEARED'}
            </span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <ProgressBar 
        phase={phase} 
        prepareProgress={prepareProgress}
        engageStage={engageStage}
        weDoTask={weDoTask}
        youDoTask={youDoTask}
      />

      {/* Phase Nav */}
      <PhaseIndicator currentPhase={phase} onPhaseClick={setPhase} isCompleted={isReviewMode} />

      <main className="max-w-[760px] mx-auto px-4 py-6 pb-24">
        {/* PREPARE PHASE */}
        {phase === 'prepare' && (
          <div className="animate-fade-in">
            {/* Back to Course Button */}
            <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
            
            {/* Transmission */}
            <div className="bg-[#112030] border border-[#1C3348] border-l-[3px] border-l-[#C9A84C] rounded-r-lg p-5 mb-5">
              <div className="flex items-center gap-2.5 flex-wrap mb-3">
                <span className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest border border-[#C9A84C] px-2 py-0.5 rounded">INCOMING</span>
                <span className="font-mono text-[10px] text-[#C9A84C]">Sarah Chen / MD Velara</span>
                <span className="font-mono text-[10px] text-[#3D5870] ml-auto">09:02 TODAY</span>
              </div>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed">
                We need your help — urgently. Our marketing team has been using AI for three months and the output is <strong className="text-white">embarrassing</strong>. Captions are generic, emails are completely off-brand, and nothing sounds like us. I&apos;ve cleared full intel access for you. <strong className="text-white">Review the files below, pass the security clearance check, and meet us inside HQ.</strong> — Sarah
              </p>
            </div>

            {/* Intel Files */}
            <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3 flex items-center gap-2.5">
              Intel Files
              <span className="flex-1 h-px bg-[#1C3348]" />
            </p>
            <div className="grid grid-cols-2 gap-2.5 mb-5">
              <IntelFileCard
                title="Kaplan & Haenlein (2019)"
                subtitle='Business Horizons 62(1) — "Siri, Siri in my hand"'
                read={paper1Read}
                onToggle={() => setPaper1Read(!paper1Read)}
              />
              <IntelFileCard
                title="Haenlein & Kaplan (2019)"
                subtitle='California Management Review 61(4) — "A brief history of AI"'
                read={paper2Read}
                onToggle={() => setPaper2Read(!paper2Read)}
              />
            </div>

            {/* Videos */}
            <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3 flex items-center gap-2.5">
              Briefing Videos
              <span className="flex-1 h-px bg-[#1C3348]" />
            </p>
            <div className="grid grid-cols-3 gap-2.5 mb-5">
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

            {/* MCQ */}
            <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3 flex items-center gap-2.5">
              Security Clearance Check
              <span className="flex-1 h-px bg-[#1C3348]" />
            </p>
            <MCQGate
              answers={mcqAnswers}
              submitted={mcqSubmitted}
              score={mcqScore}
              onAnswer={(qi, oi) => handleMcqAnswer(qi, oi)}
              onSubmit={handleMcqSubmit}
              onRetry={handleMcqRetry}
              isReviewMode={isReviewMode}
            />
          </div>
        )}

        {/* ENGAGE PHASE */}
        {phase === 'engage' && (
          <div className="animate-fade-in">
            {/* Back Button */}
            <BackButton onClick={() => setPhase('prepare')} label="Back to Prepare" />
            
            {/* HQ Banner */}
            <div className="bg-gradient-to-br from-[rgba(201,168,76,0.1)] to-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.3)] rounded-lg px-4.5 py-3 flex items-center justify-between mb-5">
              <span className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest">📍 INSIDE VELARA HQ</span>
              <span className="font-mono text-[10px] text-[#3D5870]">Marketing Dept · Floor 3</span>
            </div>

            {/* Stage Rail */}
            <div className="flex gap-1.5 mb-5">
              {[
                { id: 'iDo', label: 'I Do' },
                { id: 'weDo', label: 'We Do' },
                { id: 'youDo', label: 'You Do' },
                { id: 'final', label: 'Final' },
              ].map((s, i) => {
                const stages = ['iDo', 'weDo', 'youDo', 'final'];
                const ci = stages.indexOf(engageStage);
                return (
                  <button
                    key={s.id}
                    onClick={() => {
                      if (i <= ci || isReviewMode) {
                        setEngageStage(s.id as EngageStage);
                      }
                    }}
                    disabled={i > ci && !isReviewMode}
                    className={cn(
                      "flex-1 py-2.5 text-center font-mono text-[10px] tracking-widest uppercase rounded border transition-all",
                      i < ci && "bg-[rgba(45,211,111,0.07)] border-[rgba(45,211,111,0.3)] text-[#2DD36F] hover:bg-[rgba(45,211,111,0.1)] cursor-pointer",
                      i === ci && "bg-[rgba(201,168,76,0.12)] border-[#C9A84C] text-[#C9A84C]",
                      i > ci && !isReviewMode && "border-[#1C3348] text-[#3D5870] cursor-not-allowed",
                      i > ci && isReviewMode && "border-[rgba(45,211,111,0.2)] text-[#2DD36F] cursor-pointer hover:bg-[rgba(45,211,111,0.05)]"
                    )}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* I DO */}
            {engageStage === 'iDo' && (
              <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] tracking-wider">BRIEFING</span>
                </div>
                <h3 className="font-semibold text-[17px] text-white mb-2">I Do — Watch Marcus&apos;s Approach</h3>
                <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-4">
                  Senior Consultant Marcus Webb handled the same problem at a previous client. Watch how he structures every prompt before you try it yourself. Pay attention to how he uses the CRAFT framework.
                </p>
                
                {/* Video */}
                <div className="w-full aspect-video rounded border border-[#1C3348] bg-[#08131E] overflow-hidden mb-3.5">
                  <iframe
                    src="https://ulaw365-my.sharepoint.com/personal/abhirajsinh_thakor83_law_ac_uk/_layouts/15/embed.aspx?UniqueId=86ef4dee-b7c2-440f-849f-ef587752b1f5&embed=%7B%22ust%22%3Atrue%2C%22hv%22%3A%22CopyEmbedCode%22%7D&referrer=StreamWebApp&referrerScenario=EmbedDialog.Create"
                    className="w-full h-full border-none"
                    allowFullScreen
                    title="Marcus Webb Walkthrough"
                  />
                </div>

                {/* Key Takeaways */}
                <div className="bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded p-4 mb-4">
                  <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">📝 KEY TAKEAWAYS</p>
                  <ul className="text-[12px] text-[#9DBBD4] space-y-2">
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C]">1.</span>
                      <span><strong className="text-white">Role first:</strong> Always tell the AI who it should be before asking it to do anything</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C]">2.</span>
                      <span><strong className="text-white">Context matters:</strong> The more background you give, the more relevant the output</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C]">3.</span>
                      <span><strong className="text-white">Be specific:</strong> "Under 150 characters" is better than "short"</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-[#C9A84C]">4.</span>
                      <span><strong className="text-white">Tone sets the voice:</strong> Professional vs casual changes everything</span>
                    </li>
                  </ul>
                </div>

                {/* Checkbox */}
                <label className={cn(
                  "flex items-center gap-2.5 p-3 px-3.5 rounded border cursor-pointer transition-all",
                  idoCheck ? "border-[rgba(45,211,111,0.4)] bg-[rgba(45,211,111,0.05)] text-[#2DD36F]" : "border-[#1C3348] bg-[#08131E] text-[#7A9AB5]"
                )}>
                  <input
                    type="checkbox"
                    checked={idoCheck}
                    onChange={(e) => setIdoCheck(e.target.checked)}
                    className="accent-[#C9A84C] w-4 h-4"
                  />
                  <span className="text-[12px]">I have watched Marcus&apos;s walkthrough and I&apos;m ready to practise</span>
                </label>

                {idoCheck && (
                  <button
                    onClick={() => setEngageStage('weDo')}
                    className="w-full mt-3.5 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                  >
                    BEGIN WE DO CHALLENGES →
                  </button>
                )}
              </div>
            )}

            {/* WE DO */}
            {engageStage === 'weDo' && (
              <div>
                {/* Back Button */}
                <BackButton onClick={() => setEngageStage('iDo')} label="Back to I Do" />
                
                {/* Step Dots */}
                <div className="flex gap-1.5 mb-5">
                  {[1, 2, 3].map(i => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i <= weDoTask || isReviewMode) {
                          setWeDoTask(i);
                        }
                      }}
                      disabled={i > weDoTask && !isReviewMode}
                      className={cn(
                        "flex-1 h-1.5 rounded transition-all",
                        i < weDoTask && "bg-[#2DD36F]",
                        i === weDoTask && "bg-[#C9A84C]",
                        i > weDoTask && !isReviewMode && "bg-[#1C3348] cursor-not-allowed",
                        i > weDoTask && isReviewMode && "bg-[#2DD36F] cursor-pointer"
                      )}
                    />
                  ))}
                </div>

                <h3 className="font-semibold text-[18px] text-white mb-1">We Do — Learn the Frameworks</h3>
                <p className="text-[13px] text-[#7A9AB5] mb-5">Three frameworks, three tasks. Open the reference card, choose a framework, then apply it to the brief below.</p>

                {/* Framework Card */}
                <FrameworkCard
                  activeFW={activeFW}
                  setActiveFW={setActiveFW}
                  isOpen={fwOpen}
                  setIsOpen={setFwOpen}
                  taskKey={weDoTask === 1 ? 'wd2' : 'wd3'}
                />

                {/* Task 1: Diagnose */}
                {weDoTask === 1 && (
                  <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] tracking-wider">TASK 1 OF 3</span>
                      <span className="font-mono text-[10px] text-[#C9A84C] ml-auto">+20 XP</span>
                    </div>
                    <h4 className="font-semibold text-[17px] text-white mb-2">Diagnose the Broken Prompt</h4>
                    <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-4">
                      Before writing prompts, you need to spot what&apos;s missing. Velara&apos;s team sent this last Monday. Using the frameworks above as your guide, identify every element that&apos;s absent — select all that apply.
                    </p>
                    
                    <div className="bg-[#08131E] border border-[#1C3348] rounded p-3.5 px-4 font-mono text-[13px] text-[#9DBBD4] mb-4 relative">
                      <span className="absolute -top-2 left-3 text-[9px] font-bold tracking-widest text-[#3D5870] bg-[#112030] px-1.5">ORIGINAL PROMPT</span>
                      &quot;Write about our summer dress&quot;
                    </div>

                    {WD_OPTS.map(opt => (
                      <label
                        key={opt}
                        className={cn(
                          "flex items-center gap-2.5 p-2.5 px-3 border rounded cursor-pointer transition-all mb-1.5 text-[12px]",
                          wd1Sel.includes(opt) ? "border-[#C9A84C] bg-[rgba(201,168,76,0.12)] text-white" : "border-[#1C3348] text-[#7A9AB5] hover:border-[rgba(201,168,76,0.4)] hover:bg-[rgba(201,168,76,0.12)]"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={wd1Sel.includes(opt)}
                          onChange={() => {
                            if (wd1Sel.includes(opt)) {
                              setWd1Sel(wd1Sel.filter(x => x !== opt));
                            } else {
                              setWd1Sel([...wd1Sel, opt]);
                            }
                          }}
                          className="accent-[#C9A84C]"
                        />
                        {opt}
                      </label>
                    ))}

                    {wd1Done ? (
                      <>
                        <div className="p-3.5 bg-[rgba(45,211,111,0.08)] border border-[rgba(45,211,111,0.25)] rounded text-[12px] text-[#2DD36F] leading-relaxed mt-3">
                          <strong>All four correct.</strong> Map these back to any framework — CRAFT, CO-STAR, RISEN — and you&apos;ll see the same gaps: no role, no brand context, no audience, no format. That&apos;s why every output was generic.
                        </div>
                        <XPBurst amount={20} label="DIAGNOSIS COMPLETE" />
                        <button
                          onClick={() => setWeDoTask(2)}
                          className="w-full mt-3 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          CONTINUE TO TASK 2 →
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          if (WD_OPTS.every(o => wd1Sel.includes(o))) {
                            setWd1Done(true);
                            addXP(20);
                            setModuleXP(prev => prev + 20);
                          }
                        }}
                        disabled={wd1Sel.length < 4}
                        className="w-full mt-3 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        SUBMIT DIAGNOSIS
                      </button>
                    )}
                  </div>
                )}

                {/* Task 2: Instagram */}
                {weDoTask === 2 && (
                  <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] tracking-wider">TASK 2 OF 3</span>
                      <span className="font-mono text-[10px] text-[#C9A84C] ml-auto">+25 XP</span>
                    </div>
                    <h4 className="font-semibold text-[17px] text-white mb-2">Rewrite the Instagram Prompt</h4>
                    <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-4">
                      Choose a framework from the card above and apply it to improve this prompt. The reference card shows exactly how each letter maps to this task.
                    </p>
                    
                    <div className="bg-[#08131E] border border-[#1C3348] rounded p-3.5 px-4 font-mono text-[13px] text-[#9DBBD4] mb-4 relative">
                      <span className="absolute -top-2 left-3 text-[9px] font-bold tracking-widest text-[#3D5870] bg-[#112030] px-1.5">ORIGINAL PROMPT</span>
                      &quot;Make our Instagram post good&quot;
                    </div>

                    {isReviewMode && savedAnswers?.wd2Txt && (
                      <SavedAnswerDisplay label="Your Previous Answer" answer={savedAnswers.wd2Txt} />
                    )}

                    <textarea
                      value={wd2Txt}
                      onChange={(e) => setWd2Txt(e.target.value)}
                      placeholder="Choose CRAFT, CO-STAR, or RISEN above, then write your improved prompt here..."
                      className={cn(
                        "w-full min-h-[110px] p-3.5 px-4 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white leading-relaxed resize-y outline-none focus:border-[rgba(201,168,76,0.5)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.06)] transition-all placeholder:text-[#3D5870]",
                        isReviewMode && "opacity-75"
                      )}
                      readOnly={isReviewMode}
                    />
                    <div className="flex items-center justify-between mt-1.5 mb-3.5">
                      <span className={cn(
                        "font-mono text-[10px]",
                        wordCount(wd2Txt) >= 30 ? "text-[#2DD36F]" : "text-[#3D5870]"
                      )}>
                        {wordCount(wd2Txt)} words
                      </span>
                      <span className="font-mono text-[10px] text-[#3D5870]">AIM FOR 30+ WORDS</span>
                    </div>

                    {wd2Score && !isReviewMode ? (
                      <>
                        <ScoreGrid criteria={wd2Score} />
                        {wd2Score.filter(c => !c.p).length > 0 && wd2Score.filter(c => c.p).length < 4 && (
                          <MissBox
                            missed={wd2Score.filter(c => !c.p)}
                            hints={{
                              'Role assigned': 'Start with "Act as a social media copywriter for Velara"',
                              'Platform context': 'Name the platform — Instagram — so the AI formats correctly',
                              'Brand reference': 'Name the brand: Velara, and add 1-2 words about who they are',
                              'Format specified': 'Specify the output: caption, under 150 characters, with hashtag',
                              'Sufficient detail': 'Add tone, product details — aim for 30+ words total',
                            }}
                          />
                        )}
                        {wd2Score.filter(c => c.p).length < 4 && (
                          <Scaffold task="wd2" activeFW={activeFW} onBuild={handleWd2Scaffold} />
                        )}
                        <XPBurst amount={xpForScore(wd2Score.filter(c => c.p).length, wd2Score.length, 25)} label="TASK SCORED" />
                        {!wd2Done && (
                          <button
                            onClick={() => { setWd2Done(true); setWeDoTask(3); }}
                            className="w-full mt-3 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                          >
                            CONTINUE TO TASK 3 →
                          </button>
                        )}
                      </>
                    ) : !isReviewMode ? (
                      <button
                        onClick={handleWd2Submit}
                        disabled={wordCount(wd2Txt) < 8}
                        className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        SUBMIT PROMPT
                      </button>
                    ) : (
                      <div className="flex gap-2.5 mt-3">
                        <button
                          onClick={() => setWeDoTask(1)}
                          className="flex-1 py-3 border border-[#1C3348] text-[#7A9AB5] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:border-[rgba(201,168,76,0.4)] hover:text-[#C9A84C] transition-all"
                        >
                          ← PREVIOUS TASK
                        </button>
                        <button
                          onClick={() => setWeDoTask(3)}
                          className="flex-1 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          NEXT TASK →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Task 3: Complaint */}
                {weDoTask === 3 && (
                  <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] tracking-wider">TASK 3 OF 3</span>
                      <span className="font-mono text-[10px] text-[#C9A84C] ml-auto">+50 XP</span>
                    </div>
                    <h4 className="font-semibold text-[17px] text-white mb-2">Customer Complaint Response Prompt</h4>
                    <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-4">
                      Apply a framework to write a prompt that generates a professional, empathetic reply to a late delivery complaint. The &quot;Apply to this task&quot; section in the framework card above shows exactly what to include.
                    </p>

                    {isReviewMode && savedAnswers?.wd3Txt && (
                      <SavedAnswerDisplay label="Your Previous Answer" answer={savedAnswers.wd3Txt} />
                    )}

                    <textarea
                      value={wd3Txt}
                      onChange={(e) => setWd3Txt(e.target.value)}
                      placeholder="Use RISEN for complex, multi-step responses. Use CRAFT or CO-STAR for tone-focused briefs. Your choice..."
                      className={cn(
                        "w-full min-h-[110px] p-3.5 px-4 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white leading-relaxed resize-y outline-none focus:border-[rgba(201,168,76,0.5)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.06)] transition-all placeholder:text-[#3D5870]",
                        isReviewMode && "opacity-75"
                      )}
                      readOnly={isReviewMode}
                    />
                    <div className="flex items-center justify-between mt-1.5 mb-3.5">
                      <span className={cn(
                        "font-mono text-[10px]",
                        wordCount(wd3Txt) >= 40 ? "text-[#2DD36F]" : "text-[#3D5870]"
                      )}>
                        {wordCount(wd3Txt)} words
                      </span>
                      <span className="font-mono text-[10px] text-[#3D5870]">AIM FOR 40+ WORDS</span>
                    </div>

                    {wd3Score && !isReviewMode ? (
                      <>
                        <ScoreGrid criteria={wd3Score} />
                        {wd3Score.filter(c => !c.p).length > 0 && wd3Score.filter(c => c.p).length < 4 && (
                          <MissBox
                            missed={wd3Score.filter(c => !c.p)}
                            hints={{
                              'Customer context': 'Describe the situation: a customer complained about a late delivery',
                              'Empathy/tone': 'Specify: empathetic, apologetic, or professional tone',
                              'Response format': 'Clarify: this is an email reply — tell it the format explicitly',
                              'Brand voice': "Reference Velara's tone — sophisticated, warm, never corporate",
                              'Sufficient detail': "Use a framework's full structure — more detail gives better output",
                            }}
                          />
                        )}
                        {wd3Score.filter(c => c.p).length < 4 && (
                          <Scaffold task="wd3" activeFW={activeFW} onBuild={handleWd3Scaffold} />
                        )}
                        <XPBurst amount={xpForScore(wd3Score.filter(c => c.p).length, wd3Score.length, 50)} label="WE DO COMPLETE" />
                        {!wd3Done && (
                          <button
                            onClick={() => { setWd3Done(true); setEngageStage('youDo'); }}
                            className="w-full mt-3 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                          >
                            PROCEED TO YOU DO →
                          </button>
                        )}
                      </>
                    ) : !isReviewMode ? (
                      <button
                        onClick={handleWd3Submit}
                        disabled={wordCount(wd3Txt) < 8}
                        className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        SUBMIT PROMPT
                      </button>
                    ) : (
                      <div className="flex gap-2.5 mt-3">
                        <button
                          onClick={() => setWeDoTask(2)}
                          className="flex-1 py-3 border border-[#1C3348] text-[#7A9AB5] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:border-[rgba(201,168,76,0.4)] hover:text-[#C9A84C] transition-all"
                        >
                          ← PREVIOUS TASK
                        </button>
                        <button
                          onClick={() => setEngageStage('youDo')}
                          className="flex-1 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          NEXT SECTION →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* YOU DO */}
            {engageStage === 'youDo' && (
              <div>
                {/* Back Button */}
                <BackButton onClick={() => setEngageStage('weDo')} label="Back to We Do" />
                
                {/* Step Dots */}
                <div className="flex gap-1.5 mb-5">
                  {[1, 2, 3].map(i => (
                    <button
                      key={i}
                      onClick={() => {
                        if (i <= youDoTask || isReviewMode) {
                          setYouDoTask(i);
                        }
                      }}
                      disabled={i > youDoTask && !isReviewMode}
                      className={cn(
                        "flex-1 h-1.5 rounded transition-all",
                        i < youDoTask && "bg-[#2DD36F]",
                        i === youDoTask && "bg-[#C9A84C]",
                        i > youDoTask && !isReviewMode && "bg-[#1C3348] cursor-not-allowed",
                        i > youDoTask && isReviewMode && "bg-[#2DD36F] cursor-pointer"
                      )}
                    />
                  ))}
                </div>

                <h3 className="font-semibold text-[18px] text-white mb-1">You Do — Solo Challenges</h3>
                <p className="text-[13px] text-[#7A9AB5] mb-5">Three real Velara briefs. No guided hints this time — apply the frameworks independently.</p>

                {/* Challenge 1 */}
                {youDoTask === 1 && (
                  <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] tracking-wider">CHALLENGE 1 OF 3</span>
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(45,211,111,0.1)] text-[#2DD36F] border border-[rgba(45,211,111,0.25)] tracking-wider">EASY</span>
                      <span className="font-mono text-[10px] text-[#C9A84C] ml-auto">100 XP</span>
                    </div>
                    <h4 className="font-semibold text-[17px] text-white mb-2">The Midnight Edit — Product Description</h4>
                    <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-4">
                      Velara is launching a sustainable evening wear collection called The Midnight Edit. Write a prompt that produces a 150-word product description in Velara&apos;s brand voice: sophisticated, sustainable, and British.
                    </p>

                    {isReviewMode && savedAnswers?.yd1Txt && (
                      <SavedAnswerDisplay label="Your Previous Answer" answer={savedAnswers.yd1Txt} />
                    )}

                    <textarea
                      value={yd1Txt}
                      onChange={(e) => setYd1Txt(e.target.value)}
                      placeholder="Act as... Velara's Midnight Edit collection... 150-word description... brand voice: sophisticated, sustainable, British..."
                      className={cn(
                        "w-full min-h-[110px] p-3.5 px-4 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white leading-relaxed resize-y outline-none focus:border-[rgba(201,168,76,0.5)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.06)] transition-all placeholder:text-[#3D5870]",
                        isReviewMode && "opacity-75"
                      )}
                      readOnly={isReviewMode}
                    />
                    <div className="flex items-center justify-between mt-1.5 mb-3.5">
                      <span className={cn(
                        "font-mono text-[10px]",
                        wordCount(yd1Txt) >= 15 ? "text-[#2DD36F]" : "text-[#3D5870]"
                      )}>
                        {wordCount(yd1Txt)} words
                      </span>
                      <span className="font-mono text-[10px] text-[#3D5870]">MIN 15 WORDS</span>
                    </div>

                    {yd1Score && !isReviewMode ? (
                      <>
                        <ScoreGrid criteria={yd1Score} />
                        <XPBurst amount={xpForScore(yd1Score.filter(c => c.p).length, yd1Score.length, 100)} label="CHALLENGE SCORED" />
                        <button
                          onClick={() => setYouDoTask(2)}
                          className="w-full mt-3 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          NEXT CHALLENGE →
                        </button>
                      </>
                    ) : !isReviewMode ? (
                      <button
                        onClick={handleYd1Submit}
                        disabled={wordCount(yd1Txt) < 6}
                        className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        SUBMIT CHALLENGE
                      </button>
                    ) : (
                      <div className="flex gap-2.5 mt-3">
                        <button
                          onClick={() => setEngageStage('weDo')}
                          className="flex-1 py-3 border border-[#1C3348] text-[#7A9AB5] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:border-[rgba(201,168,76,0.4)] hover:text-[#C9A84C] transition-all"
                        >
                          ← WE DO
                        </button>
                        <button
                          onClick={() => setYouDoTask(2)}
                          className="flex-1 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          NEXT CHALLENGE →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Challenge 2 */}
                {youDoTask === 2 && (
                  <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] tracking-wider">CHALLENGE 2 OF 3</span>
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(245,158,11,0.1)] text-[#F59E0B] border border-[rgba(245,158,11,0.25)] tracking-wider">MEDIUM</span>
                      <span className="font-mono text-[10px] text-[#C9A84C] ml-auto">150 XP</span>
                    </div>
                    <h4 className="font-semibold text-[17px] text-white mb-2">Monday Caption Machine</h4>
                    <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-4">
                      Velara&apos;s social media team needs 5 Instagram captions every Monday morning. Write one prompt that generates all 5. Each caption: under 150 characters, one relevant emoji, branded hashtag.
                    </p>

                    {isReviewMode && savedAnswers?.yd2Txt && (
                      <SavedAnswerDisplay label="Your Previous Answer" answer={savedAnswers.yd2Txt} />
                    )}

                    <textarea
                      value={yd2Txt}
                      onChange={(e) => setYd2Txt(e.target.value)}
                      placeholder="Specify: how many captions, character limit, emoji rule, hashtag requirement, brand voice..."
                      className={cn(
                        "w-full min-h-[110px] p-3.5 px-4 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white leading-relaxed resize-y outline-none focus:border-[rgba(201,168,76,0.5)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.06)] transition-all placeholder:text-[#3D5870]",
                        isReviewMode && "opacity-75"
                      )}
                      readOnly={isReviewMode}
                    />
                    <div className="flex items-center justify-between mt-1.5 mb-3.5">
                      <span className={cn(
                        "font-mono text-[10px]",
                        wordCount(yd2Txt) >= 40 ? "text-[#2DD36F]" : "text-[#3D5870]"
                      )}>
                        {wordCount(yd2Txt)} words
                      </span>
                      <span className="font-mono text-[10px] text-[#3D5870]">MIN 40 WORDS</span>
                    </div>

                    {yd2Score && !isReviewMode ? (
                      <>
                        <ScoreGrid criteria={yd2Score} />
                        <XPBurst amount={xpForScore(yd2Score.filter(c => c.p).length, yd2Score.length, 150)} label="CHALLENGE SCORED" />
                        <button
                          onClick={() => setYouDoTask(3)}
                          className="w-full mt-3 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          FINAL CHALLENGE →
                        </button>
                      </>
                    ) : !isReviewMode ? (
                      <button
                        onClick={handleYd2Submit}
                        disabled={wordCount(yd2Txt) < 16}
                        className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        SUBMIT CHALLENGE
                      </button>
                    ) : (
                      <div className="flex gap-2.5 mt-3">
                        <button
                          onClick={() => setYouDoTask(1)}
                          className="flex-1 py-3 border border-[#1C3348] text-[#7A9AB5] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:border-[rgba(201,168,76,0.4)] hover:text-[#C9A84C] transition-all"
                        >
                          ← PREVIOUS
                        </button>
                        <button
                          onClick={() => setYouDoTask(3)}
                          className="flex-1 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          FINAL CHALLENGE →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Challenge 3 */}
                {youDoTask === 3 && (
                  <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5">
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] tracking-wider">CHALLENGE 3 OF 3</span>
                      <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(239,68,68,0.1)] text-[#EF4444] border border-[rgba(239,68,68,0.25)] tracking-wider">HARD</span>
                      <span className="font-mono text-[10px] text-[#C9A84C] ml-auto">200 XP</span>
                    </div>
                    <h4 className="font-semibold text-[17px] text-white mb-2">The Complaint That Keeps Coming Back</h4>
                    <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-4">
                      Velara receives 30 identical late delivery complaints every week. Write a prompt that generates a response that is: empathetic, offers a 10% discount code, maintains Velara&apos;s sophisticated voice, and does not sound like a template.
                    </p>

                    {isReviewMode && savedAnswers?.yd3Txt && (
                      <SavedAnswerDisplay label="Your Previous Answer" answer={savedAnswers.yd3Txt} />
                    )}

                    <textarea
                      value={yd3Txt}
                      onChange={(e) => setYd3Txt(e.target.value)}
                      placeholder="This is the hard one. How do you prompt for 'sounds personal, not template'? Use RISEN for step-by-step control."
                      className={cn(
                        "w-full min-h-[110px] p-3.5 px-4 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white leading-relaxed resize-y outline-none focus:border-[rgba(201,168,76,0.5)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.06)] transition-all placeholder:text-[#3D5870]",
                        isReviewMode && "opacity-75"
                      )}
                      readOnly={isReviewMode}
                    />
                    <div className="flex items-center justify-between mt-1.5 mb-3.5">
                      <span className={cn(
                        "font-mono text-[10px]",
                        wordCount(yd3Txt) >= 50 ? "text-[#2DD36F]" : "text-[#3D5870]"
                      )}>
                        {wordCount(yd3Txt)} words
                      </span>
                      <span className="font-mono text-[10px] text-[#3D5870]">MIN 50 WORDS</span>
                    </div>

                    {yd3Score && !isReviewMode ? (
                      <>
                        <ScoreGrid criteria={yd3Score} />
                        <XPBurst amount={xpForScore(yd3Score.filter(c => c.p).length, yd3Score.length, 200)} label="CHALLENGE SCORED" />
                        <button
                          onClick={() => setEngageStage('final')}
                          className="w-full mt-3 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          PROCEED TO FINAL CHALLENGE →
                        </button>
                      </>
                    ) : !isReviewMode ? (
                      <button
                        onClick={handleYd3Submit}
                        disabled={wordCount(yd3Txt) < 20}
                        className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                      >
                        SUBMIT CHALLENGE
                      </button>
                    ) : (
                      <div className="flex gap-2.5 mt-3">
                        <button
                          onClick={() => setYouDoTask(2)}
                          className="flex-1 py-3 border border-[#1C3348] text-[#7A9AB5] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:border-[rgba(201,168,76,0.4)] hover:text-[#C9A84C] transition-all"
                        >
                          ← PREVIOUS
                        </button>
                        <button
                          onClick={() => setEngageStage('final')}
                          className="flex-1 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          FINAL CHALLENGE →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* FINAL CHALLENGE */}
            {engageStage === 'final' && (
              <div>
                {/* Back Button */}
                <BackButton onClick={() => setEngageStage('youDo')} label="Back to You Do" />
                
                <h3 className="font-semibold text-[18px] text-white mb-1">Final Challenge</h3>
                <p className="text-[13px] text-[#7A9AB5] mb-5">Sarah Chen just forwarded you this from her PA. This is the last brief before you close the case.</p>

                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="font-mono text-[9px] font-bold px-2 py-1 rounded bg-[rgba(201,168,76,0.12)] text-[#C9A84C] border border-[rgba(201,168,76,0.3)] tracking-wider">FINAL MISSION</span>
                    <span className="font-mono text-[10px] text-[#C9A84C] ml-auto">+250 XP</span>
                  </div>
                  <h4 className="font-semibold text-[17px] text-white mb-2">Board-Level Email — Rewrite &amp; Explain</h4>

                  {/* Context - What happened */}
                  <div className="bg-[rgba(239,68,68,0.04)] border border-[rgba(239,68,68,0.15)] rounded p-4 mb-4">
                    <p className="font-mono text-[9px] font-bold text-[#EF9E9E] tracking-widest uppercase mb-2">📨 WHAT HAPPENED</p>
                    <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                      Sarah Chen&apos;s PA sent this prompt to ChatGPT on Monday morning, hoping for a professional weekly sales update email for the board of directors. Here&apos;s what they typed:
                    </p>
                    <div className="bg-[#08131E] border border-[#1C3348] rounded p-3.5 px-4 font-mono text-[15px] text-white text-center mb-3">
                      &quot;Write email&quot;
                    </div>
                    <p className="text-[12px] text-[#7A9AB5] leading-relaxed">
                      <strong className="text-[#EF9E9E]">The result?</strong> ChatGPT produced a generic, one-sentence placeholder with no context about Velara, no sales data, no board-level formatting, and no brand voice. Sarah was embarrassed when she had to manually rewrite it before the 9 AM meeting.
                    </p>
                  </div>

                  {/* What went wrong */}
                  <div className="bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded p-4 mb-4">
                    <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">🔍 WHAT WENT WRONG</p>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: 'NO ROLE', desc: 'AI didn\'t know who to be' },
                        { label: 'NO AUDIENCE', desc: 'Who is this email for?' },
                        { label: 'NO CONTEXT', desc: 'What is Velara? What industry?' },
                        { label: 'NO PURPOSE', desc: 'Sales update? Crisis? Celebration?' },
                        { label: 'NO FORMAT', desc: 'How should it be structured?' },
                        { label: 'NO TONE', desc: 'Professional? Casual? Urgent?' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 p-2 bg-[#08131E] rounded border border-[#1C3348]">
                          <span className="font-mono text-[9px] font-bold text-[#EF9E9E] tracking-wider">{item.label}</span>
                          <span className="text-[11px] text-[#7A9AB5]">{item.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Part 1 */}
                  <div className="border-t border-[#1C3348] pt-4 mt-4">
                    <p className="font-mono text-[10px] font-bold text-[#7A9AB5] tracking-widest uppercase mb-2">PART 1: Write the Improved Prompt</p>
                    <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-3">
                      Write a prompt that will produce a professional weekly sales update email for Velara&apos;s Board of Directors. Apply one of the three frameworks you learned. The email should include: a subject line, 3-bullet summary of key metrics, one notable highlight, and one strategic recommendation.
                    </p>
                    
                    {isReviewMode && savedAnswers?.fp && (
                      <SavedAnswerDisplay label="Your Previous Answer" answer={savedAnswers.fp} />
                    )}

                    <textarea
                      value={fp}
                      onChange={(e) => setFp(e.target.value)}
                      placeholder="Apply CRAFT, CO-STAR, or RISEN — structure your prompt to address all six missing elements..."
                      className={cn(
                        "w-full min-h-[110px] p-3.5 px-4 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white leading-relaxed resize-y outline-none focus:border-[rgba(201,168,76,0.5)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.06)] transition-all placeholder:text-[#3D5870]",
                        isReviewMode && "opacity-75"
                      )}
                      readOnly={isReviewMode}
                    />
                    <div className="flex items-center justify-between mt-1.5 mb-4">
                      <span className={cn(
                        "font-mono text-[10px]",
                        wordCount(fp) >= 35 ? "text-[#2DD36F]" : "text-[#3D5870]"
                      )}>
                        {wordCount(fp)} words
                      </span>
                      <span className="font-mono text-[10px] text-[#3D5870]">MIN 35 WORDS</span>
                    </div>
                  </div>

                  {/* Part 2 */}
                  <div className="border-t border-[#1C3348] pt-4 mt-4">
                    <p className="font-mono text-[10px] font-bold text-[#7A9AB5] tracking-widest uppercase mb-2">PART 2: Explain Your Improvement</p>
                    <p className="text-[13px] text-[#7A9AB5] leading-relaxed mb-3">
                      In 2–3 sentences, explain what was wrong with the original prompt and how your version fixes each problem.
                    </p>
                    
                    {isReviewMode && savedAnswers?.fe && (
                      <SavedAnswerDisplay label="Your Previous Explanation" answer={savedAnswers.fe} />
                    )}

                    <textarea
                      value={fe}
                      onChange={(e) => setFe(e.target.value)}
                      placeholder="The original prompt failed because... My improved version addresses this by..."
                      className={cn(
                        "w-full min-h-[80px] p-3.5 px-4 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white leading-relaxed resize-y outline-none focus:border-[rgba(201,168,76,0.5)] focus:shadow-[0_0_0_3px_rgba(201,168,76,0.06)] transition-all placeholder:text-[#3D5870]",
                        isReviewMode && "opacity-75"
                      )}
                      readOnly={isReviewMode}
                    />
                    <div className="flex items-center justify-between mt-1.5 mb-3.5">
                      <span className={cn(
                        "font-mono text-[10px]",
                        wordCount(fe) >= 25 ? "text-[#2DD36F]" : "text-[#3D5870]"
                      )}>
                        {wordCount(fe)} words
                      </span>
                      <span className="font-mono text-[10px] text-[#3D5870]">MIN 25 WORDS</span>
                    </div>
                  </div>

                  {fScore && !isReviewMode ? (
                    <>
                      <ScoreGrid criteria={fScore} />
                      <XPBurst amount={xpForScore(fScore.filter(c => c.p).length, fScore.length, 250)} label="MISSION COMPLETE" />
                      {!fDone && (
                        <button
                          onClick={() => setPhase('consolidate')}
                          className="w-full mt-3 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                        >
                          COMPLETE MODULE →
                        </button>
                      )}
                    </>
                  ) : !isReviewMode ? (
                    <button
                      onClick={handleFinalSubmit}
                      disabled={wordCount(fp) < 15 || wordCount(fe) < 10}
                      className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      SUBMIT FINAL CHALLENGE
                    </button>
                  ) : (
                    <div className="flex gap-2.5 mt-3">
                      <button
                        onClick={() => setEngageStage('youDo')}
                        className="flex-1 py-3 border border-[#1C3348] text-[#7A9AB5] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:border-[rgba(201,168,76,0.4)] hover:text-[#C9A84C] transition-all"
                      >
                        ← YOU DO
                      </button>
                      <button
                        onClick={() => setPhase('consolidate')}
                        className="flex-1 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all"
                      >
                        VIEW SUMMARY →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* CONSOLIDATE PHASE */}
        {phase === 'consolidate' && (
          <div className="animate-fade-in">
            {/* Back Button */}
            {isReviewMode && (
              <BackButton onClick={() => setPhase('engage')} label="Back to Engage" />
            )}
            
            <div className="text-center">
              {/* Badge */}
              <div className="mb-6">
                <div className="w-[110px] h-[110px] mx-auto rounded-full flex items-center justify-center text-5xl bg-[conic-gradient(#C9A84C,#E8C96A,#C9A84C)] shadow-[0_0_0_8px_rgba(201,168,76,0.1),0_0_40px_rgba(201,168,76,0.25)] animate-pulse">
                  🏅
                </div>
                <span className="inline-block mt-4 bg-[rgba(201,168,76,0.12)] border border-[rgba(201,168,76,0.4)] text-[#C9A84C] font-mono text-[11px] font-bold px-4 py-1.5 rounded tracking-widest">
                  PROMPT SPECIALIST
                </span>
              </div>

              <h2 className="font-bold text-[26px] text-white mb-1">Mission Accomplished</h2>
              <p className="text-[13px] text-[#7A9AB5] mb-5">Module 01 — Prompt Engineering — Complete</p>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-2.5 max-w-md mx-auto mb-5">
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 text-center">
                  <p className="font-mono text-[26px] font-bold text-[#C9A84C]">{savedAnswers?.moduleXP || moduleXP}</p>
                  <p className="font-mono text-[9px] text-[#3D5870] tracking-widest uppercase mt-1">XP This Module</p>
                </div>
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 text-center">
                  <p className="font-mono text-[26px] font-bold text-white">{progress.totalXP}</p>
                  <p className="font-mono text-[9px] text-[#3D5870] tracking-widest uppercase mt-1">Total XP</p>
                </div>
              </div>

              {/* Your Answers Summary */}
              {isReviewMode && savedAnswers && (
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-5 mb-5 text-left">
                  <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase mb-4">📝 YOUR SAVED ANSWERS</p>
                  
                  <div className="space-y-4">
                    {savedAnswers.wd2Txt && (
                      <div>
                        <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-1">WE DO - INSTAGRAM PROMPT</p>
                        <p className="text-[12px] text-[#9DBBD4] leading-relaxed line-clamp-2">{savedAnswers.wd2Txt}</p>
                      </div>
                    )}
                    {savedAnswers.wd3Txt && (
                      <div>
                        <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-1">WE DO - COMPLAINT PROMPT</p>
                        <p className="text-[12px] text-[#9DBBD4] leading-relaxed line-clamp-2">{savedAnswers.wd3Txt}</p>
                      </div>
                    )}
                    {savedAnswers.fp && (
                      <div>
                        <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-1">FINAL - BOARD EMAIL PROMPT</p>
                        <p className="text-[12px] text-[#9DBBD4] leading-relaxed line-clamp-2">{savedAnswers.fp}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Academic Insight */}
              <div className="bg-[#112030] border border-[#1C3348] border-l-[3px] border-l-[#C9A84C] rounded-r-lg p-4.5 px-5 mb-3 text-left">
                <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">📚 Academic Debrief</p>
                <p className="text-[12px] text-[#7A9AB5] leading-relaxed">
                  Kaplan and Haenlein (2019) define AI as systems that simulate human cognitive functions such as learning and problem-solving. The frameworks you used in this module — CRAFT, CO-STAR, RISEN — are structural tools for directing those cognitive functions deliberately. Role, context, format, goal, and detail are what separate useful AI output from generic noise.
                </p>
              </div>

              {/* Industry Application */}
              <div className="bg-[rgba(45,211,111,0.04)] border border-[rgba(45,211,111,0.2)] rounded-lg p-4.5 px-5 mb-3 text-left">
                <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-2">💼 Industry Application</p>
                <p className="text-[12px] text-[#9DBBD4] leading-relaxed">
                  In your future career, you&apos;ll use these frameworks daily: marketing teams use CRAFT for campaign copy, legal teams use RISEN for contract analysis, and executive assistants use CO-STAR for stakeholder communications. The ability to structure AI prompts effectively is now a core professional skill across every industry.
                </p>
              </div>

              {/* Ethics Checkpoint */}
              <div className="bg-[rgba(239,68,68,0.04)] border border-[rgba(239,68,68,0.2)] rounded-lg p-4.5 px-5 mb-5 text-left">
                <p className="font-mono text-[9px] font-bold text-[#EF9E9E] tracking-widest uppercase mb-2">⚖️ Ethics Checkpoint</p>
                <p className="text-[12px] text-[#9DBBD4] leading-relaxed">
                  Before Velara deploys AI-generated content publicly — what are their disclosure obligations? Consider the ASA guidelines on AI-generated advertising and ULaw&apos;s AI Policy (2023). How might transparency requirements affect their marketing strategy?
                </p>
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-2.5">
                <button
                  onClick={() => router.push('/course2')}
                  className="flex-1 px-6 py-3 border border-[#C9A84C] text-[#C9A84C] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[rgba(201,168,76,0.12)] transition-all"
                >
                  ← BACK TO COURSE
                </button>
                <button
                  onClick={() => {
                    setIsReviewMode(true);
                    setEngageStage('iDo');
                    setPhase('engage');
                  }}
                  className="flex-1 px-6 py-3 bg-[#C9A84C] text-[#08131E] rounded font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                >
                  REVIEW MODULE →
                </button>
              </div>

              {!progress.course2ModulesCompleted.includes(2) && !isReviewMode && (
                <p className="text-[#2DD36F] text-sm mt-4">✅ Module 2 is now unlocked!</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-12 border-t border-[#1C3348]">
        <div className="max-w-[760px] mx-auto text-center">
          <p className="text-[11px] text-[#3D5870]">© 2025 SwipeUp AI Society • University of Law</p>
        </div>
      </footer>
    </div>
  );
}
