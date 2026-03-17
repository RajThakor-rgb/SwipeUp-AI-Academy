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

// Extended SavedAnswers interface to include scores and feedback
interface SavedAnswers {
  wd2Txt: string;
  wd2Score: { n: string; p: boolean }[];
  wd3Txt: string;
  wd3Score: { n: string; p: boolean }[];
  yd1Txt: string;
  yd1Score: { n: string; p: boolean }[];
  yd2Txt: string;
  yd2Score: { n: string; p: boolean }[];
  yd3Txt: string;
  yd3Score: { n: string; p: boolean }[];
  fp: string;
  fe: string;
  fScore: { n: string; p: boolean }[];
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

// Frameworks Data with enhanced educational content
const FRAMEWORKS = {
  craft: {
    name: 'CRAFT',
    color: '#7C6FD4',
    desc: 'CRAFT is a practical framework for business prompting. It ensures every prompt tells the AI who it is, what to produce, how to produce it, and in what style — reducing vague outputs dramatically.',
    whyItWorks: 'By systematically covering Context, Role, Action, Format, and Tone, CRAFT eliminates ambiguity. AI models perform significantly better when they understand the complete picture of what you need.',
    bestFor: 'Content creation, marketing copy, emails, and any task where the output style matters as much as the content.',
    letters: [
      { k: 'C', l: 'Context', h: 'Background information the AI needs to understand the situation', tip: 'Include brand details, audience info, and relevant constraints' },
      { k: 'R', l: 'Role', h: 'Who the AI should act as — e.g. "Act as a senior marketing copywriter"', tip: 'Be specific: "senior marketing copywriter" > "copywriter"' },
      { k: 'A', l: 'Action', h: 'The specific task — write, rewrite, summarise, generate, analyse', tip: 'Use strong verbs: write, create, develop, compose' },
      { k: 'F', l: 'Format', h: 'The shape of the output — bullet list, paragraph, email, 150 words', tip: 'Specify length, structure, and any formatting requirements' },
      { k: 'T', l: 'Tone', h: 'The voice and style — professional, warm, sophisticated, concise', tip: 'Match tone to your audience and brand voice' },
    ],
    example: {
      label: 'CRAFT applied to Velara Instagram',
      text: 'Context: Velara is a British sustainable luxury fashion brand targeting professionals aged 25-45 who value ethical production. Role: Act as a social media copywriter. Action: Write an Instagram caption for our new summer dress. Format: Under 150 characters with one emoji. Tone: Sophisticated, warm, and aspirational.',
    },
    beforeAfter: {
      before: 'Write an Instagram caption for our new dress.',
      after: 'Context: Velara is a British sustainable luxury fashion brand. Role: Act as a social media copywriter. Action: Write an Instagram caption for our new summer dress. Format: Under 150 characters with one emoji. Tone: Sophisticated, warm, and aspirational.',
      improvement: 'The CRAFT prompt provides context about the brand, assigns a specific role, and defines the format and tone — resulting in output that matches brand guidelines without revision.'
    },
  },
  costar: {
    name: 'CO-STAR',
    color: '#2B9EAA',
    desc: 'CO-STAR gives you granular control over how the AI responds. It separates the objective (what to achieve) from the audience (who it\'s for) and the response format — useful for multi-stakeholder communications.',
    whyItWorks: 'CO-STAR explicitly separates the outcome you want (Objective) from who will receive it (Audience). This helps AI tailor both content and complexity level appropriately.',
    bestFor: 'Strategic communications, stakeholder updates, sales materials, and any content where the target audience varies.',
    letters: [
      { k: 'C', l: 'Context', h: 'The setting or background — brand, situation, prior events', tip: 'Set the scene: what led to this need?' },
      { k: 'O', l: 'Objective', h: 'What you want to achieve — sell, inform, apologise, persuade', tip: 'Be clear about the desired outcome' },
      { k: 'S', l: 'Style', h: 'The writing style — journalistic, narrative, business formal', tip: 'Match style to the communication channel' },
      { k: 'T', l: 'Tone', h: 'Emotional register — empathetic, authoritative, friendly', tip: 'Tone shapes how the message feels' },
      { k: 'A', l: 'Audience', h: 'Who will read this — customers, board, press, Gen Z', tip: 'Audience determines vocabulary and complexity' },
      { k: 'R', l: 'Response', h: 'The exact format of the output — length, structure, sections', tip: 'Specify structure for consistent outputs' },
    ],
    example: {
      label: 'CO-STAR for the board email task',
      text: 'Context: Velara is a fashion brand preparing its weekly update. Objective: Inform board members of sales performance. Style: Executive business writing. Tone: Confident and direct. Audience: Board of directors. Response: Structured email with subject line, 3 bullet summary, and one recommendation.',
    },
    beforeAfter: {
      before: 'Write an email about our sales performance.',
      after: 'Context: Velara is a fashion brand preparing its weekly update. Objective: Inform board members of sales performance. Style: Executive business writing. Tone: Confident and direct. Audience: Board of directors. Response: Structured email with subject line, 3 bullet summary, and one recommendation.',
      improvement: 'CO-STAR transforms a vague request into a precise brief. The AI knows exactly who it\'s writing for (board), what style to use (executive), and what structure to follow.'
    },
  },
  risen: {
    name: 'RISEN',
    color: '#C9624C',
    desc: 'RISEN is best for complex tasks that need step-by-step logic. The "Steps" and "Narrowing" elements guide the AI through a process and constrain it to avoid common failure modes like being too generic.',
    whyItWorks: 'The Steps element breaks complex tasks into manageable pieces, while Narrowing prevents common AI pitfalls like being too verbose, too generic, or including unwanted elements.',
    bestFor: 'Multi-step processes, customer service responses, complex analyses, and tasks requiring specific constraints.',
    letters: [
      { k: 'R', l: 'Role', h: 'The persona the AI should take on for this specific task', tip: 'Choose a role with relevant expertise' },
      { k: 'I', l: 'Instructions', h: 'A clear, direct instruction — what to do in one sentence', tip: 'Keep it simple and actionable' },
      { k: 'S', l: 'Steps', h: 'A sequence the AI should follow — first do X, then do Y', tip: 'Number your steps for clarity' },
      { k: 'E', l: 'End goal', h: 'What a successful output looks like — the measurable outcome', tip: 'Define success criteria' },
      { k: 'N', l: 'Narrowing', h: 'Constraints — what to avoid, what not to include, word limits', tip: 'List what NOT to do as well as what to do' },
    ],
    example: {
      label: 'RISEN for the complaint response task',
      text: 'Role: You are a customer service specialist for Velara. Instruction: Write a reply to a late delivery complaint. Steps: 1) Open with empathy. 2) Acknowledge the delay. 3) Offer a 10% discount. 4) Close warmly. End goal: A response that retains the customer. Narrowing: Do not sound like a template. Under 150 words.',
    },
    beforeAfter: {
      before: 'Write a reply to a customer complaint.',
      after: 'Role: You are a customer service specialist for Velara. Instruction: Write a reply to a late delivery complaint. Steps: 1) Open with empathy. 2) Acknowledge the delay. 3) Offer a 10% discount. 4) Close warmly. End goal: A response that retains the customer. Narrowing: Do not sound like a template. Under 150 words.',
      improvement: 'RISEN ensures the response follows a proven structure, includes specific elements (empathy, apology, compensation), and avoids the "robotic template" feel that frustrates customers.'
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

// Pro Tips for prompt engineering
const PRO_TIPS = [
  { title: 'Be Specific with Roles', tip: 'Instead of "act as a writer", try "act as a senior B2B marketing copywriter with 10 years of experience in the fashion industry."' },
  { title: 'Define Success Criteria', tip: 'Tell the AI what "good" looks like: "A successful response will make the customer feel valued and include a concrete next step."' },
  { title: 'Use Constraints Wisely', tip: 'Constraints improve quality. "Under 100 words" forces focus. "No jargon" ensures accessibility. "Include 3 specific examples" adds substance.' },
  { title: 'Iterate with Follow-ups', tip: 'If the output isn\'t quite right, follow up with specific feedback: "Make it shorter" or "Add more emotional appeal" or "Try a more casual tone."' },
  { title: 'Test and Refine', tip: 'Save prompts that work well. Build a personal library of effective prompts you can adapt for different situations.' },
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

// Framework Reference Card Component - Enhanced with educational content
function FrameworkCard({ 
  activeFW, 
  setActiveFW, 
  isOpen, 
  setIsOpen,
  taskKey,
  showBeforeAfter = true
}: { 
  activeFW: FrameworkType; 
  setActiveFW: (fw: FrameworkType) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  taskKey: string;
  showBeforeAfter?: boolean;
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

          {/* Why It Works - New Section */}
          <div className="p-3 bg-[rgba(45,211,111,0.04)] border border-[rgba(45,211,111,0.15)] rounded mb-3">
            <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-2">💡 Why It Works</p>
            <p className="text-[12px] text-[#9DBBD4] leading-relaxed">{fw.whyItWorks}</p>
          </div>

          {/* Best For - New Section */}
          <div className="p-3 bg-[rgba(201,168,76,0.04)] border border-[rgba(201,168,76,0.15)] rounded mb-3">
            <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">🎯 Best For</p>
            <p className="text-[12px] text-[#9DBBD4] leading-relaxed">{fw.bestFor}</p>
          </div>

          {/* Letters Grid with Tips */}
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
                <p className="text-[10px] text-[#7A9AB5] leading-tight mt-1 italic">💡 {l.tip}</p>
              </div>
            ))}
          </div>

          {/* Example */}
          <div className="p-3 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded">
            <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">{fw.example.label}</p>
            <p className="text-[12px] text-[#9DBBD4] leading-relaxed">{fw.example.text}</p>
          </div>

          {/* Before/After Comparison - New Section */}
          {showBeforeAfter && fw.beforeAfter && (
            <div className="mt-3 p-3 bg-[#08131E] border border-[#1C3348] rounded">
              <p className="font-mono text-[9px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">📊 Before vs After</p>
              <div className="grid grid-cols-1 gap-2 mb-3">
                <div className="p-2.5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] rounded">
                  <p className="font-mono text-[9px] text-[#EF4444] mb-1">❌ BEFORE (Vague)</p>
                  <p className="text-[11px] text-[#7A9AB5]">"{fw.beforeAfter.before}"</p>
                </div>
                <div className="p-2.5 bg-[rgba(45,211,111,0.08)] border border-[rgba(45,211,111,0.2)] rounded">
                  <p className="font-mono text-[9px] text-[#2DD36F] mb-1">✓ AFTER (Structured)</p>
                  <p className="text-[11px] text-[#9DBBD4]">"{fw.beforeAfter.after}"</p>
                </div>
              </div>
              <p className="text-[11px] text-[#7A9AB5] leading-relaxed">
                <span className="text-[#C9A84C] font-semibold">Key improvement:</span> {fw.beforeAfter.improvement}
              </p>
            </div>
          )}

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

// Saved Score Display Component for Review Mode
function SavedScoreDisplay({ label, answer, score }: { label: string; answer: string; score: { n: string; p: boolean }[] }) {
  const pass = score?.filter(c => c.p).length || 0;
  const total = score?.length || 0;
  const cls = getScoreClass(pass, total);

  return (
    <div className="bg-[#08131E] border border-[rgba(45,211,111,0.25)] rounded p-3.5 mb-3">
      <p className="font-mono text-[9px] font-bold text-[#2DD36F] tracking-widest uppercase mb-2">{label}</p>
      <div className="text-[13px] text-[#9DBBD4] leading-relaxed whitespace-pre-wrap mb-3 p-2.5 bg-[#0D1E2E] rounded">{answer || 'No answer saved'}</div>
      {score && score.length > 0 && (
        <>
          <p className="font-mono text-[9px] font-bold text-[#3D5870] tracking-widest uppercase mb-2">FEEDBACK RECEIVED</p>
          <div className="grid grid-cols-2 gap-1.5">
            {score.map((cr, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between p-2 px-2.5 bg-[#112030] rounded text-[10px]",
                  cr.p ? "border-l-2 border-[#2DD36F] text-white" : "border-l-2 border-[rgba(239,68,68,0.3)] text-[#3D5870]"
                )}
              >
                <span>{cr.n}</span>
                <span className="text-[11px]">{cr.p ? '✓' : '✗'}</span>
              </div>
            ))}
          </div>
          <div className={cn(
            "mt-2 p-2 rounded text-center font-mono text-[11px] font-bold tracking-wider",
            cls === 'great' && "bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] text-[#2DD36F]",
            cls === 'ok' && "bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.25)] text-[#F59E0B]",
            cls === 'low' && "bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-[#EF4444]"
          )}>
            {pass}/{total} CRITERIA MET — {Math.round(pass / total * 100)}%
          </div>
        </>
      )}
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

// Pro Tips Component
function ProTipsSection() {
  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
      <p className="font-mono text-[11px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">⚡ PRO TIPS FOR BETTER PROMPTS</p>
      <div className="space-y-3">
        {PRO_TIPS.map((tip, idx) => (
          <div key={idx} className="flex items-start gap-2.5 p-2.5 bg-[#08131E] rounded border border-[#1C3348]">
            <span className="text-[#C9A84C] text-[14px] shrink-0">💡</span>
            <div>
              <p className="text-[12px] font-semibold text-white">{tip.title}</p>
              <p className="text-[11px] text-[#7A9AB5] leading-relaxed mt-0.5">{tip.tip}</p>
            </div>
          </div>
        ))}
      </div>
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
        const parsed = JSON.parse(saved);
        setSavedAnswers(parsed);
        return parsed;
      }
    } catch (e) {
      console.error('Error loading saved answers:', e);
    }
    return null;
  }, []);

  // Save answers to localStorage - now includes scores
  const saveAnswersWithScores = useCallback((answers: Partial<SavedAnswers>) => {
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

  // Check if returning user - properly restore all state including scores
  useEffect(() => {
    const savedData = loadSavedAnswers();
    
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
      
      // Load saved answers and scores
      if (savedData) {
        setWd2Txt(savedData.wd2Txt || '');
        setWd2Score(savedData.wd2Score || null);
        setWd3Txt(savedData.wd3Txt || '');
        setWd3Score(savedData.wd3Score || null);
        setYd1Txt(savedData.yd1Txt || '');
        setYd1Score(savedData.yd1Score || null);
        setYd2Txt(savedData.yd2Txt || '');
        setYd2Score(savedData.yd2Score || null);
        setYd3Txt(savedData.yd3Txt || '');
        setYd3Score(savedData.yd3Score || null);
        setFp(savedData.fp || '');
        setFe(savedData.fe || '');
        setFScore(savedData.fScore || null);
        setModuleXP(savedData.moduleXP || 700);
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
    // Save both text and score
    saveAnswersWithScores({ wd2Txt, wd2Score: criteria });
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
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 25);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    setWd3Done(true);
    saveAnswersWithScores({ wd3Txt, wd3Score: criteria });
  };

  const handleWd3Scaffold = (fields: Record<string, string>) => {
    const parts = Object.values(fields).filter(Boolean);
    if (parts.length) {
      setWd3Txt(parts.join('. ') + '.');
      setWd3Score(null);
    }
  };

  // YD1 handlers
  const handleYd1Submit = () => {
    const t = yd1Txt.toLowerCase();
    const criteria = [
      { n: 'Role assigned', p: t.includes('act as') || t.includes('you are') },
      { n: 'Context provided', p: t.includes('velara') || t.includes('fashion') || t.includes('brand') || t.includes('collection') },
      { n: 'Task clarity', p: t.includes('write') || t.includes('create') || t.includes('generate') || t.includes('compose') },
      { n: 'Format specified', p: t.includes('email') || t.includes('subject') || t.includes('150') || t.includes('word') },
      { n: 'Sufficient detail', p: wordCount(yd1Txt) >= 35 },
    ];
    setYd1Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 30);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswersWithScores({ yd1Txt, yd1Score: criteria });
  };

  // YD2 handlers
  const handleYd2Submit = () => {
    const t = yd2Txt.toLowerCase();
    const criteria = [
      { n: 'Framework used', p: t.includes('context') || t.includes('role') || t.includes('action') || t.includes('objective') || t.includes('instruction') },
      { n: 'Role assigned', p: t.includes('act as') || t.includes('you are') },
      { n: 'Stakeholder context', p: t.includes('board') || t.includes('director') || t.includes('investor') || t.includes('stakeholder') },
      { n: 'Clear objective', p: t.includes('inform') || t.includes('update') || t.includes('summarise') || t.includes('report') },
      { n: 'Sufficient detail', p: wordCount(yd2Txt) >= 40 },
    ];
    setYd2Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 30);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswersWithScores({ yd2Txt, yd2Score: criteria });
  };

  // YD3 handlers
  const handleYd3Submit = () => {
    const t = yd3Txt.toLowerCase();
    const criteria = [
      { n: 'Role assigned', p: t.includes('act as') || t.includes('you are') },
      { n: 'Scenario context', p: t.includes('customer') || t.includes('complaint') || t.includes('issue') || t.includes('problem') },
      { n: 'Steps defined', p: t.includes('step') || t.includes('first') || t.includes('then') || t.includes('next') || t.includes('finally') },
      { n: 'Constraints set', p: t.includes('under') || t.includes('avoid') || t.includes('do not') || t.includes('must') || t.includes('without') },
      { n: 'Sufficient detail', p: wordCount(yd3Txt) >= 45 },
    ];
    setYd3Score(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 35);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    saveAnswersWithScores({ yd3Txt, yd3Score: criteria });
  };

  // Final submit handler
  const handleFinalSubmit = () => {
    const t = fp.toLowerCase();
    const criteria = [
      { n: 'Framework applied', p: t.includes('context') || t.includes('role') || t.includes('action') || t.includes('objective') || t.includes('instruction') || t.includes('tone') },
      { n: 'Task context', p: t.includes('email') || t.includes('sales') || t.includes('performance') || t.includes('board') || t.includes('update') },
      { n: 'Sufficient detail', p: wordCount(fp) >= 50 },
    ];
    setFScore(criteria);
    const xp = xpForScore(criteria.filter(c => c.p).length, criteria.length, 50);
    addXP(xp);
    setModuleXP(prev => prev + xp);
    setFDone(true);
    
    // Save all final data
    saveAnswersWithScores({ fp, fe, fScore: criteria });
    
    // Complete module
    completeModule2(1);
    addBadge('prompt-engineer-1');
    setTimeout(() => {
      setPhase('consolidate');
    }, 2000);
  };

  // Calculate prepare progress
  const prepareProgress = Math.round(
    ((paper1Read ? 20 : 0) + (paper2Read ? 20 : 0) + videosWatched.filter(Boolean).length * 10 + (mcqSubmitted && mcqScore === 5 ? 30 : 0))
  );

  // Render Prepare Phase
  const renderPrepare = () => (
    <div className="min-h-screen bg-[#08131E]">
      {/* Header */}
      <div className="px-5 py-4 border-b border-[#1C3348]">
        <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
        <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">PREPARE</h1>
        <p className="text-[12px] text-[#7A9AB5] mt-1">Build your foundation before entering Headquarters</p>
      </div>

      {/* Progress Bar */}
      <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Intel Files Section */}
        <div className="mb-4">
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">📂 INTEL FILES</p>
          <p className="text-[12px] text-[#7A9AB5] mb-3">Read the background materials to prepare for your mission.</p>
          <div className="space-y-2">
            <IntelFileCard
              title="AI in Business: A Strategic Overview"
              subtitle="Kaplan & Haenlein (2019) — Understanding AI fundamentals"
              read={paper1Read}
              onToggle={() => setPaper1Read(!paper1Read)}
            />
            <IntelFileCard
              title="Velara Brand Briefing Document"
              subtitle="Internal company context for your mission tasks"
              read={paper2Read}
              onToggle={() => setPaper2Read(!paper2Read)}
            />
          </div>
        </div>

        {/* Video Resources */}
        <div className="mb-4">
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">🎥 VIDEO TRAINING</p>
          <p className="text-[12px] text-[#7A9AB5] mb-3">Watch these short tutorials on prompt engineering.</p>
          <div className="grid grid-cols-3 gap-2">
            {videos.map((v, i) => (
              <VideoCard
                key={v.title}
                {...v}
                watched={videosWatched[i]}
                onToggle={() => {
                  const newWatched = [...videosWatched];
                  newWatched[i] = !newWatched[i];
                  setVideosWatched(newWatched);
                }}
              />
            ))}
          </div>
        </div>

        {/* Pro Tips - New Section */}
        <ProTipsSection />

        {/* MCQ Gate */}
        <div className="mt-4">
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
    </div>
  );

  // Render Engage Phase
  const renderEngage = () => {
    // I Do Stage
    if (engageStage === 'iDo') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">I DO — Watch & Learn</h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Observe how a senior prompt engineer structures their work</p>
          </div>
          <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />
          
          <div className="p-5">
            <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">📋 THE SCENARIO</p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                A Velara marketing team member needs to write an Instagram caption for a new sustainable collection. Their first attempt is:
              </p>
              <div className="p-3 bg-[#08131E] rounded border border-[#1C3348] mb-4">
                <p className="text-[12px] text-[#EF4444] italic">"Write something about our new collection."</p>
              </div>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed">
                This prompt fails because it lacks <span className="text-[#F59E0B]">role, context, format, and tone</span>. The AI will produce generic content that doesn&apos;t match Velara&apos;s brand voice.
              </p>
            </div>

            <FrameworkCard 
              activeFW={activeFW} 
              setActiveFW={setActiveFW} 
              isOpen={fwOpen} 
              setIsOpen={setFwOpen} 
              taskKey="wd2"
              showBeforeAfter={true}
            />

            <div className="bg-[rgba(45,211,111,0.06)] border border-[rgba(45,211,111,0.2)] rounded-lg p-4">
              <p className="font-mono text-[10px] font-bold text-[#2DD36F] tracking-widest uppercase mb-3">✓ THE IMPROVED PROMPT (CRAFT)</p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed p-3 bg-[#08131E] rounded mb-3">
                Context: Velara is a British sustainable luxury fashion brand known for ethical production and timeless designs.
                Role: Act as a senior social media copywriter.
                Action: Write an Instagram caption for our new Summer Solstice collection.
                Format: Under 150 characters, include one emoji, end with #VelaraStyle
                Tone: Sophisticated, warm, aspirational — never pushy or salesy.
              </p>
              <p className="text-[12px] text-[#7A9AB5]">
                ✓ Notice how each element of CRAFT is addressed systematically. The AI now has everything it needs to produce on-brand content.
              </p>
            </div>

            <button
              onClick={() => setEngageStage('weDo')}
              className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
            >
              CONTINUE TO WE DO →
            </button>
          </div>
        </div>
      );
    }

    // We Do Stage
    if (engageStage === 'weDo') {
      return (
        <div className="min-h-screen bg-[#08131E]">
          <div className="px-5 py-4 border-b border-[#1C3348]">
            <BackButton onClick={() => setEngageStage('iDo')} label="Back to I Do" />
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">WE DO — Practice Together</h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Work through exercises with guidance and feedback</p>
          </div>
          <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

          <div className="p-5">
            {/* Task 1: Identify Missing Elements */}
            {weDoTask === 1 && (
              <div>
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">TASK 1: IDENTIFY THE PROBLEMS</p>
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    A colleague wrote this prompt: <span className="text-[#EF4444]">&quot;Write something about our new collection.&quot;</span>
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">Select ALL the missing elements that make this prompt ineffective:</p>
                  
                  <div className="space-y-2">
                    {WD_OPTS.map((opt) => (
                      <label
                        key={opt}
                        className={cn(
                          "flex items-center gap-2.5 p-3 border rounded-md cursor-pointer transition-all",
                          wd1Sel.includes(opt) ? "border-[#C9A84C] bg-[rgba(201,168,76,0.12)] text-white" : "border-[#1C3348] text-[#7A9AB5] hover:border-[rgba(201,168,76,0.4)]"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={wd1Sel.includes(opt)}
                          onChange={() => {
                            if (wd1Sel.includes(opt)) {
                              setWd1Sel(wd1Sel.filter(s => s !== opt));
                            } else {
                              setWd1Sel([...wd1Sel, opt]);
                            }
                          }}
                          className="accent-[#C9A84C]"
                        />
                        <span className="text-[13px]">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {wd1Sel.length === 4 && !wd1Done && (
                  <div className="bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] rounded-lg p-4 mb-4">
                    <XPBurst amount={15} label="Analysis Complete" />
                    <p className="text-[13px] text-[#9DBBD4] text-center">
                      Correct! The prompt is missing all four critical elements: role, format, brand context, and audience. Let&apos;s practice writing better prompts.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    if (wd1Sel.length === 4) {
                      setWd1Done(true);
                      addXP(15);
                      setModuleXP(prev => prev + 15);
                      setWeDoTask(2);
                    }
                  }}
                  disabled={wd1Sel.length < 4}
                  className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                >
                  {wd1Sel.length < 4 ? 'SELECT ALL MISSING ELEMENTS' : 'CONTINUE TO TASK 2 →'}
                </button>
              </div>
            )}

            {/* Task 2: Write Instagram Caption Prompt */}
            {weDoTask === 2 && (
              <div>
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">TASK 2: WRITE AN INSTAGRAM PROMPT</p>
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    Using a framework of your choice, write a prompt for Velara&apos;s Instagram caption. Focus on the new Summer Solstice collection.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">
                    Your prompt should address: role, context, action, format, and tone. Aim for at least 30 words.
                  </p>
                </div>

                <FrameworkCard 
                  activeFW={activeFW} 
                  setActiveFW={setActiveFW} 
                  isOpen={fwOpen} 
                  setIsOpen={setFwOpen} 
                  taskKey="wd2"
                  showBeforeAfter={true}
                />

                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <textarea
                    value={wd2Txt}
                    onChange={(e) => setWd2Txt(e.target.value)}
                    placeholder="Write your structured prompt here..."
                    className="w-full h-32 p-3 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]"
                  />
                  <p className="text-[10px] text-[#3D5870] mt-2 font-mono">Word count: {wordCount(wd2Txt)}</p>
                </div>

                {/* Submit button */}
                {!wd2Score && (
                  <button
                    onClick={handleWd2Submit}
                    disabled={wordCount(wd2Txt) < 15}
                    className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    SUBMIT FOR FEEDBACK
                  </button>
                )}

                {/* Score Display */}
                {wd2Score && (
                  <>
                    <ScoreGrid criteria={wd2Score} />
                    {wd2Score.filter(c => c.p).length < 4 && (
                      <>
                        <MissBox
                          missed={wd2Score.filter(c => !c.p)}
                          hints={{
                            'Role assigned': 'Try: "Act as a social media copywriter" or "You are Velara\'s Instagram manager"',
                            'Platform context': 'Mention Instagram, social media, or the platform you\'re creating for',
                            'Brand reference': 'Include "Velara", "sustainable", "luxury", or "fashion"',
                            'Format specified': 'Specify the output: "caption under 150 characters", "with emoji", "include hashtag"',
                            'Sufficient detail': 'Add more context and instructions — aim for 30+ words',
                          }}
                        />
                        <Scaffold task="wd2" activeFW={activeFW} onBuild={handleWd2Scaffold} />
                      </>
                    )}
                    <button
                      onClick={() => {
                        setWd2Done(true);
                        setWeDoTask(3);
                      }}
                      className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                    >
                      CONTINUE TO TASK 3 →
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Task 3: Customer Service Response */}
            {weDoTask === 3 && (
              <div>
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">TASK 3: CUSTOMER SERVICE PROMPT</p>
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    A Velara customer has complained that their order arrived two weeks late. They paid for express delivery. Write a prompt that will generate a professional, empathetic response email.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">
                    Consider: How would you structure this to sound genuine rather than templated? Aim for 40+ words.
                  </p>
                </div>

                <FrameworkCard 
                  activeFW={activeFW} 
                  setActiveFW={setActiveFW} 
                  isOpen={fwOpen} 
                  setIsOpen={setFwOpen} 
                  taskKey="wd3"
                  showBeforeAfter={true}
                />

                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <textarea
                    value={wd3Txt}
                    onChange={(e) => setWd3Txt(e.target.value)}
                    placeholder="Write your customer service prompt here..."
                    className="w-full h-32 p-3 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]"
                  />
                  <p className="text-[10px] text-[#3D5870] mt-2 font-mono">Word count: {wordCount(wd3Txt)}</p>
                </div>

                {!wd3Score && (
                  <button
                    onClick={handleWd3Submit}
                    disabled={wordCount(wd3Txt) < 20}
                    className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    SUBMIT FOR FEEDBACK
                  </button>
                )}

                {wd3Score && (
                  <>
                    <ScoreGrid criteria={wd3Score} />
                    {wd3Score.filter(c => c.p).length < 4 && (
                      <>
                        <MissBox
                          missed={wd3Score.filter(c => !c.p)}
                          hints={{
                            'Customer context': 'Reference the late delivery, the complaint, or the express delivery issue',
                            'Empathy/tone': 'Use words like "empathetic", "sincere apology", "genuinely sorry"',
                            'Response format': 'Specify "email reply", "response email", or format details',
                            'Brand voice': 'Reference Velara\'s sophisticated, caring brand voice',
                            'Sufficient detail': 'Expand your prompt with more specific instructions — aim for 40+ words',
                          }}
                        />
                        <Scaffold task="wd3" activeFW={activeFW} onBuild={handleWd3Scaffold} />
                      </>
                    )}
                    <button
                      onClick={() => setEngageStage('youDo')}
                      className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                    >
                      CONTINUE TO YOU DO →
                    </button>
                  </>
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
            <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">YOU DO — Independent Practice</h1>
            <p className="text-[12px] text-[#7A9AB5] mt-1">Apply what you&apos;ve learned with three independent tasks</p>
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

            {/* You Do Task 1: Product Email */}
            {youDoTask === 1 && (
              <div>
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">TASK 1: PRODUCT LAUNCH EMAIL</p>
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    Velara is launching a new Winter Essentials collection. Write a prompt that will generate an email to existing customers announcing the launch with a 15% early-access discount.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">
                    Consider: subject line, email structure, call to action. Aim for 35+ words in your prompt.
                  </p>
                </div>

                <FrameworkCard 
                  activeFW={activeFW} 
                  setActiveFW={setActiveFW} 
                  isOpen={fwOpen} 
                  setIsOpen={setFwOpen} 
                  taskKey="wd2"
                  showBeforeAfter={false}
                />

                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <textarea
                    value={yd1Txt}
                    onChange={(e) => setYd1Txt(e.target.value)}
                    placeholder="Write your product launch email prompt here..."
                    className="w-full h-32 p-3 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]"
                  />
                  <p className="text-[10px] text-[#3D5870] mt-2 font-mono">Word count: {wordCount(yd1Txt)}</p>
                </div>

                {!yd1Score && (
                  <button
                    onClick={handleYd1Submit}
                    disabled={wordCount(yd1Txt) < 15}
                    className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    SUBMIT FOR FEEDBACK
                  </button>
                )}

                {yd1Score && (
                  <>
                    <ScoreGrid criteria={yd1Score} />
                    <button
                      onClick={() => setYouDoTask(2)}
                      className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                    >
                      CONTINUE TO TASK 2 →
                    </button>
                  </>
                )}
              </div>
            )}

            {/* You Do Task 2: Board Update */}
            {youDoTask === 2 && (
              <div>
                <BackButton onClick={() => setYouDoTask(1)} label="Back to Task 1" />
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">TASK 2: BOARD UPDATE EMAIL</p>
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    Write a prompt to generate a weekly sales performance email for Velara&apos;s Board of Directors. The email should summarise key metrics, highlight one success, and flag one concern.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">
                    Consider: executive summary style, data presentation, clear recommendations. Aim for 40+ words.
                  </p>
                </div>

                <FrameworkCard 
                  activeFW={activeFW} 
                  setActiveFW={setActiveFW} 
                  isOpen={fwOpen} 
                  setIsOpen={setFwOpen} 
                  taskKey="wd3"
                  showBeforeAfter={false}
                />

                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <textarea
                    value={yd2Txt}
                    onChange={(e) => setYd2Txt(e.target.value)}
                    placeholder="Write your board update prompt here..."
                    className="w-full h-32 p-3 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]"
                  />
                  <p className="text-[10px] text-[#3D5870] mt-2 font-mono">Word count: {wordCount(yd2Txt)}</p>
                </div>

                {!yd2Score && (
                  <button
                    onClick={handleYd2Submit}
                    disabled={wordCount(yd2Txt) < 20}
                    className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    SUBMIT FOR FEEDBACK
                  </button>
                )}

                {yd2Score && (
                  <>
                    <ScoreGrid criteria={yd2Score} />
                    <button
                      onClick={() => setYouDoTask(3)}
                      className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                    >
                      CONTINUE TO TASK 3 →
                    </button>
                  </>
                )}
              </div>
            )}

            {/* You Do Task 3: Complex Scenario */}
            {youDoTask === 3 && (
              <div>
                <BackButton onClick={() => setYouDoTask(2)} label="Back to Task 2" />
                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">TASK 3: COMPLEX SCENARIO</p>
                  <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                    A customer has complained on social media that Velara&apos;s sizing is inconsistent and they&apos;ve received wrong sizes twice. Write a prompt to generate a response that addresses the complaint professionally and offers a concrete solution.
                  </p>
                  <p className="text-[12px] text-[#7A9AB5] mb-3">
                    Consider: public response nature, brand reputation, specific resolution steps. Aim for 45+ words.
                  </p>
                </div>

                <FrameworkCard 
                  activeFW={activeFW} 
                  setActiveFW={setActiveFW} 
                  isOpen={fwOpen} 
                  setIsOpen={setFwOpen} 
                  taskKey="wd3"
                  showBeforeAfter={false}
                />

                <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
                  <textarea
                    value={yd3Txt}
                    onChange={(e) => setYd3Txt(e.target.value)}
                    placeholder="Write your complex scenario prompt here..."
                    className="w-full h-32 p-3 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]"
                  />
                  <p className="text-[10px] text-[#3D5870] mt-2 font-mono">Word count: {wordCount(yd3Txt)}</p>
                </div>

                {!yd3Score && (
                  <button
                    onClick={handleYd3Submit}
                    disabled={wordCount(yd3Txt) < 25}
                    className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
                  >
                    SUBMIT FOR FEEDBACK
                  </button>
                )}

                {yd3Score && (
                  <>
                    <ScoreGrid criteria={yd3Score} />
                    <button
                      onClick={() => setEngageStage('final')}
                      className="w-full mt-4 py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
                    >
                      CONTINUE TO FINAL CHALLENGE →
                    </button>
                  </>
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
            <p className="text-[12px] text-[#7A9AB5] mt-1">Apply everything you&apos;ve learned to complete the mission</p>
          </div>
          <ProgressBar phase={phase} prepareProgress={prepareProgress} engageStage={engageStage} weDoTask={weDoTask} youDoTask={youDoTask} />

          <div className="p-5">
            {/* What Happened */}
            <div className="bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.25)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">📋 WHAT HAPPENED</p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed">
                After reviewing the team&apos;s AI-generated content, Velara&apos;s Managing Director has asked you to demonstrate proper prompting technique. She wants to see how a well-structured prompt improves output quality.
              </p>
            </div>

            {/* What Went Wrong */}
            <div className="bg-[rgba(239,68,68,0.06)] border border-[rgba(239,68,68,0.2)] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#EF4444] tracking-widest uppercase mb-3">❌ WHAT WENT WRONG</p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                The MD showed you 6 recent prompts from the team. All of them were missing key elements:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {['No role assigned', 'No context provided', 'No format specified', 'No tone guidance', 'No clear objective', 'No constraints set'].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 bg-[#08131E] rounded border border-[rgba(239,68,68,0.15)]">
                    <span className="text-[#EF4444] text-[12px]">✗</span>
                    <span className="text-[11px] text-[#7A9AB5]">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* The Task */}
            <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">🎯 YOUR TASK</p>
              <p className="text-[13px] text-[#9DBBD4] leading-relaxed mb-3">
                Write a prompt that the MD can use to generate a weekly sales performance email for the Board of Directors. This prompt will serve as a template the team can adapt for future communications.
              </p>
              <p className="text-[12px] text-[#7A9AB5] mb-3">
                Your prompt should be comprehensive enough that any team member could use it and get quality output. Aim for 50+ words.
              </p>
            </div>

            <FrameworkCard 
              activeFW={activeFW} 
              setActiveFW={setActiveFW} 
              isOpen={fwOpen} 
              setIsOpen={setFwOpen} 
              taskKey="wd3"
              showBeforeAfter={true}
            />

            <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
              <textarea
                value={fp}
                onChange={(e) => setFp(e.target.value)}
                placeholder="Write your comprehensive prompt here..."
                className="w-full h-40 p-3 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]"
              />
              <p className="text-[10px] text-[#3D5870] mt-2 font-mono">Word count: {wordCount(fp)}</p>
            </div>

            {/* Reflection */}
            <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
              <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">💭 REFLECTION (Optional)</p>
              <p className="text-[12px] text-[#7A9AB5] mb-3">
                In a few sentences, explain which framework you chose and why it works well for this task:
              </p>
              <textarea
                value={fe}
                onChange={(e) => setFe(e.target.value)}
                placeholder="Explain your framework choice..."
                className="w-full h-20 p-3 bg-[#08131E] border border-[#1C3348] rounded text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]"
              />
            </div>

            {!fScore && (
              <button
                onClick={handleFinalSubmit}
                disabled={wordCount(fp) < 30}
                className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                SUBMIT FINAL CHALLENGE
              </button>
            )}

            {fScore && (
              <>
                <ScoreGrid criteria={fScore} />
                <div className="mt-4 bg-[rgba(45,211,111,0.1)] border border-[rgba(45,211,111,0.25)] rounded-lg p-4 text-center">
                  <XPBurst amount={moduleXP} label="Module Complete!" />
                  <p className="text-[13px] text-[#2DD36F] mt-2">
                    Congratulations! You&apos;ve completed Module 1: Prompt Engineering Fundamentals.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      );
    }
  };

  // Render Consolidate Phase (Review Mode)
  const renderConsolidate = () => (
    <div className="min-h-screen bg-[#08131E]">
      <div className="px-5 py-4 border-b border-[#1C3348]">
        <BackButton onClick={() => router.push('/course2')} label="Back to Course" />
        <h1 className="font-mono text-[22px] font-bold text-white tracking-tight">CONSOLIDATE — Review Mode</h1>
        <p className="text-[12px] text-[#7A9AB5] mt-1">Review your completed work and feedback</p>
      </div>
      <ProgressBar phase={phase} prepareProgress={100} engageStage={'final'} weDoTask={3} youDoTask={3} />

      <div className="p-5">
        {/* Module Summary */}
        <div className="bg-[rgba(45,211,111,0.06)] border border-[rgba(45,211,111,0.2)] rounded-lg p-4 mb-4">
          <p className="font-mono text-[10px] font-bold text-[#2DD36F] tracking-widest uppercase mb-2">✓ MODULE COMPLETED</p>
          <div className="flex items-center gap-4 mt-2">
            <div className="text-center">
              <p className="font-mono text-[24px] font-bold text-[#C9A84C]">{moduleXP}</p>
              <p className="text-[10px] text-[#3D5870]">XP Earned</p>
            </div>
            <div className="text-center">
              <p className="font-mono text-[24px] font-bold text-[#2DD36F]">✓</p>
              <p className="text-[10px] text-[#3D5870]">Badge Earned</p>
            </div>
          </div>
        </div>

        {/* Key Learnings */}
        <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4 mb-4">
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">📚 KEY LEARNINGS</p>
          <div className="space-y-2">
            <div className="p-2.5 bg-[#08131E] rounded border border-[#1C3348]">
              <p className="text-[12px] text-white font-medium">Three Frameworks Mastered</p>
              <p className="text-[11px] text-[#7A9AB5]">CRAFT, CO-STAR, and RISEN — each suited for different prompt types</p>
            </div>
            <div className="p-2.5 bg-[#08131E] rounded border border-[#1C3348]">
              <p className="text-[12px] text-white font-medium">Role, Context, Format, Tone</p>
              <p className="text-[11px] text-[#7A9AB5]">The four essential elements of effective business prompts</p>
            </div>
            <div className="p-2.5 bg-[#08131E] rounded border border-[#1C3348]">
              <p className="text-[12px] text-white font-medium">Iterative Improvement</p>
              <p className="text-[11px] text-[#7A9AB5]">Using scaffolds and feedback to refine your prompts</p>
            </div>
          </div>
        </div>

        {/* Your Work with Scores */}
        <div className="mb-4">
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">📝 YOUR WORK & FEEDBACK</p>
          
          <SavedScoreDisplay 
            label="WE DO TASK 2: Instagram Prompt" 
            answer={savedAnswers?.wd2Txt || wd2Txt} 
            score={savedAnswers?.wd2Score || wd2Score || []} 
          />
          
          <SavedScoreDisplay 
            label="WE DO TASK 3: Customer Service Prompt" 
            answer={savedAnswers?.wd3Txt || wd3Txt} 
            score={savedAnswers?.wd3Score || wd3Score || []} 
          />
          
          <SavedScoreDisplay 
            label="YOU DO TASK 1: Product Launch Email" 
            answer={savedAnswers?.yd1Txt || yd1Txt} 
            score={savedAnswers?.yd1Score || yd1Score || []} 
          />
          
          <SavedScoreDisplay 
            label="YOU DO TASK 2: Board Update" 
            answer={savedAnswers?.yd2Txt || yd2Txt} 
            score={savedAnswers?.yd2Score || yd2Score || []} 
          />
          
          <SavedScoreDisplay 
            label="YOU DO TASK 3: Complex Scenario" 
            answer={savedAnswers?.yd3Txt || yd3Txt} 
            score={savedAnswers?.yd3Score || yd3Score || []} 
          />
          
          <SavedScoreDisplay 
            label="FINAL CHALLENGE: Board Email Template" 
            answer={savedAnswers?.fp || fp} 
            score={savedAnswers?.fScore || fScore || []} 
          />
        </div>

        {/* Next Steps */}
        <div className="bg-[rgba(201,168,76,0.06)] border border-[rgba(201,168,76,0.2)] rounded-lg p-4">
          <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-3">🚀 NEXT STEPS</p>
          <p className="text-[12px] text-[#9DBBD4] leading-relaxed mb-3">
            Ready to continue your learning journey? Module 2 will cover Advanced Prompting Techniques including chain-of-thought prompting, few-shot learning, and prompt chaining.
          </p>
          <button
            onClick={() => router.push('/course2')}
            className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-md font-mono text-[12px] font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[rgba(201,168,76,0.3)] transition-all"
          >
            RETURN TO COURSE →
          </button>
        </div>
      </div>
    </div>
  );

  // Main render
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-[#08131E] flex items-center justify-center">
        <p className="text-[#7A9AB5] font-mono">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08131E]">
      <PhaseIndicator 
        currentPhase={phase} 
        onPhaseClick={setPhase} 
        isCompleted={progress.course2ModulesCompleted.includes(1)} 
      />
      {phase === 'prepare' && renderPrepare()}
      {phase === 'engage' && renderEngage()}
      {phase === 'consolidate' && renderConsolidate()}
    </div>
  );
}
