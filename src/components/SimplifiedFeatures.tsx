'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// SELF-ASSESSMENT CHECKLIST
// Simple checklist for students to verify their own work
// ============================================================

interface ChecklistItem {
  id: string;
  label: string;
  hint?: string;
  checked: boolean;
}

interface SelfAssessmentChecklistProps {
  title: string;
  description: string;
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  onComplete?: () => void;
  minRequired?: number;
}

export function SelfAssessmentChecklist({
  title,
  description,
  items,
  onChange,
  onComplete,
  minRequired = 3,
}: SelfAssessmentChecklistProps) {
  const checkedCount = items.filter(i => i.checked).length;
  const allChecked = checkedCount === items.length;
  const minMet = checkedCount >= minRequired;

  const toggleItem = (id: string) => {
    const updated = items.map(item =>
      item.id === id ? { ...item, checked: !item.checked } : item
    );
    onChange(updated);
    
    if (updated.every(i => i.checked) && onComplete) {
      setTimeout(onComplete, 500);
    }
  };

  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[rgba(45,211,111,0.08)] border-b border-[#1C3348]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">✅</span>
            <div>
              <p className="font-mono text-xs font-bold text-[#2DD36F] tracking-widest uppercase">
                {title}
              </p>
              <p className="text-[11px] text-slate-500">{description}</p>
            </div>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            allChecked ? "bg-green-500/20 text-green-400" :
            minMet ? "bg-[#C9A84C]/20 text-[#C9A84C]" :
            "bg-slate-700 text-slate-400"
          )}>
            {checkedCount}/{items.length} checked
          </span>
        </div>
      </div>

      {/* Checklist Items */}
      <div className="p-4 space-y-2">
        {items.map((item) => (
          <label
            key={item.id}
            className={cn(
              "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
              item.checked
                ? "bg-[rgba(45,211,111,0.08)] border-[rgba(45,211,111,0.3)]"
                : "bg-[#08131E] border-[#1C3348] hover:border-[rgba(201,168,76,0.4)]"
            )}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => toggleItem(item.id)}
              className="accent-[#2DD36F] mt-0.5 shrink-0 w-4 h-4"
            />
            <div className="flex-1">
              <p className={cn(
                "text-[13px] leading-relaxed",
                item.checked ? "text-[#2DD36F]" : "text-[#9DBBD4]"
              )}>
                {item.label}
              </p>
              {item.hint && !item.checked && (
                <p className="text-[11px] text-[#3D5870] mt-1">{item.hint}</p>
              )}
            </div>
            {item.checked && (
              <span className="text-[#2DD36F] text-sm">✓</span>
            )}
          </label>
        ))}

        {/* Status Message */}
        {!minMet && (
          <p className="text-xs text-[#F59E0B] bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] rounded p-2">
            ⚠️ Check at least {minRequired - checkedCount} more item{minRequired - checkedCount > 1 ? 's' : ''} to continue
          </p>
        )}
        {minMet && !allChecked && (
          <p className="text-xs text-[#C9A84C] bg-[rgba(201,168,76,0.08)] border border-[rgba(201,168,76,0.2)] rounded p-2">
            ✓ Minimum reached! Check all items for bonus XP
          </p>
        )}
        {allChecked && (
          <p className="text-xs text-[#2DD36F] bg-[rgba(45,211,111,0.08)] border border-[rgba(45,211,111,0.2)] rounded p-2 text-center font-medium">
            🎉 Great job! All checks passed!
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// ITERATION ROUNDS
// Simple tabbed interface for multiple prompt versions
// ============================================================

interface IterationRound {
  round: number;
  prompt: string;
  reflection: string;
  score: number;
  maxScore: number;
  improvements: string[];
}

interface IterationRoundsProps {
  rounds: IterationRound[];
  currentRound: number;
  onRoundChange: (round: number) => void;
  onPromptChange: (round: number, prompt: string) => void;
  onReflectionChange: (round: number, reflection: string) => void;
  onSubmit: (round: number) => void;
  minRounds?: number;
  maxRounds?: number;
  placeholder?: string;
  reflectionPlaceholder?: string;
}

export function IterationRounds({
  rounds,
  currentRound,
  onRoundChange,
  onPromptChange,
  onReflectionChange,
  onSubmit,
  minRounds = 2,
  maxRounds = 3,
  placeholder = "Write your prompt here...",
  reflectionPlaceholder = "What worked? What didn't? How can you improve?",
}: IterationRoundsProps) {
  const current = rounds.find(r => r.round === currentRound);
  const canAddRound = rounds.length < maxRounds && rounds[rounds.length - 1]?.score > 0;
  const minMet = rounds.filter(r => r.score > 0).length >= minRounds;

  const wordCount = (text: string) => text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[rgba(201,168,76,0.08)] border-b border-[#1C3348]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">🔄</span>
            <div>
              <p className="font-mono text-xs font-bold text-[#C9A84C] tracking-widest uppercase">
                Iteration Rounds
              </p>
              <p className="text-[11px] text-slate-500">Refine your prompt through multiple attempts</p>
            </div>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            minMet ? "bg-green-500/20 text-green-400" :
            "bg-[#C9A84C]/20 text-[#C9A84C]"
          )}>
            {rounds.filter(r => r.score > 0).length}/{minRounds} rounds needed
          </span>
        </div>
      </div>

      {/* Round Tabs */}
      <div className="flex border-b border-[#1C3348] bg-[#0D1E2E]">
        {rounds.map((r) => (
          <button
            key={r.round}
            onClick={() => onRoundChange(r.round)}
            className={cn(
              "flex-1 py-2.5 font-mono text-[11px] font-bold tracking-wider uppercase transition-all border-b-2",
              currentRound === r.round
                ? "border-[#C9A84C] text-[#C9A84C] bg-[rgba(201,168,76,0.08)]"
                : r.score > 0
                  ? "border-transparent text-[#2DD36F] hover:text-[#C9A84C]"
                  : "border-transparent text-[#3D5870] hover:text-[#C9A84C]"
            )}
          >
            {r.score > 0 ? `✓ Round ${r.round}` : `Round ${r.round}`}
          </button>
        ))}
        {canAddRound && (
          <button
            onClick={() => onRoundChange(rounds.length + 1)}
            className="px-4 py-2.5 text-[#3D5870] hover:text-[#C9A84C] transition-colors"
          >
            + Add Round
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {current && (
          <>
            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase">
                  {current.round === 1 ? 'Initial Prompt' : `Refined Prompt v${current.round}`}
                </label>
                <span className="font-mono text-[10px] text-[#3D5870]">
                  {wordCount(current.prompt)} words
                </span>
              </div>
              <textarea
                value={current.prompt}
                onChange={(e) => onPromptChange(currentRound, e.target.value)}
                placeholder={placeholder}
                rows={5}
                disabled={current.score > 0}
                className={cn(
                  "w-full p-3 bg-[#08131E] border border-[#1C3348] rounded-lg text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]",
                  current.score > 0 && "opacity-80"
                )}
              />
            </div>

            {/* Reflection (not for first round) */}
            {current.round > 1 && (
              <div>
                <label className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2 block">
                  Reflection: What did you improve?
                </label>
                <textarea
                  value={current.reflection}
                  onChange={(e) => onReflectionChange(currentRound, e.target.value)}
                  placeholder={reflectionPlaceholder}
                  rows={3}
                  disabled={current.score > 0}
                  className={cn(
                    "w-full p-3 bg-[#08131E] border border-[#1C3348] rounded-lg text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870]",
                    current.score > 0 && "opacity-80"
                  )}
                />
              </div>
            )}

            {/* Previous Round Score */}
            {current.round > 1 && rounds[current.round - 2] && (
              <div className="p-3 bg-[rgba(201,168,76,0.05)] border border-[rgba(201,168,76,0.15)] rounded-lg">
                <p className="font-mono text-[10px] font-bold text-[#C9A84C] tracking-widest uppercase mb-2">
                  📊 Round {current.round - 1} Score: {rounds[current.round - 2].score}/{rounds[current.round - 2].maxScore}
                </p>
                {rounds[current.round - 2].improvements.length > 0 && (
                  <div className="text-xs text-[#7A9AB5]">
                    <p className="font-medium mb-1">Areas to improve:</p>
                    <ul className="space-y-1">
                      {rounds[current.round - 2].improvements.map((imp, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#F59E0B]">→</span>
                          {imp}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Score Display */}
            {current.score > 0 && (
              <div className={cn(
                "p-3 rounded-lg border",
                current.score / current.maxScore >= 0.8
                  ? "bg-[rgba(45,211,111,0.08)] border-[rgba(45,211,111,0.2)]"
                  : "bg-[rgba(245,158,11,0.08)] border-[rgba(245,158,11,0.2)]"
              )}>
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "font-mono text-xs font-bold",
                    current.score / current.maxScore >= 0.8 ? "text-[#2DD36F]" : "text-[#F59E0B]"
                  )}>
                    Score: {current.score}/{current.maxScore} ({Math.round(current.score / current.maxScore * 100)}%)
                  </span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    current.score / current.maxScore >= 0.8
                      ? "bg-green-500/20 text-green-400"
                      : "bg-amber-500/20 text-amber-400"
                  )}>
                    {current.score / current.maxScore >= 0.8 ? 'Great!' : 'Keep refining'}
                  </span>
                </div>
                {current.improvements.length > 0 && (
                  <p className="text-xs text-[#7A9AB5]">
                    Next time: {current.improvements.join(', ')}
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            {current.score === 0 && (
              <button
                onClick={() => onSubmit(currentRound)}
                disabled={wordCount(current.prompt) < 20 || (current.round > 1 && wordCount(current.reflection) < 10)}
                className="w-full py-3 bg-[#C9A84C] text-[#08131E] rounded-lg font-mono text-xs font-bold tracking-widest uppercase hover:bg-[#E8C96A] hover:-translate-y-0.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:transform-none"
              >
                Submit Round {currentRound}
              </button>
            )}
          </>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2">
          {Array.from({ length: minRounds }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "flex-1 h-2 rounded-full transition-all",
                rounds[i]?.score > 0
                  ? rounds[i].score / rounds[i].maxScore >= 0.8
                    ? "bg-[#2DD36F]"
                    : "bg-[#F59E0B]"
                  : "bg-[#1C3348]"
              )}
            />
          ))}
        </div>
        <p className="text-center text-[10px] text-[#3D5870] mt-2">
          {minMet
            ? "✓ Minimum iterations complete!"
            : `Complete ${minRounds - rounds.filter(r => r.score > 0).length} more round${minRounds - rounds.filter(r => r.score > 0).length > 1 ? 's' : ''}`
          }
        </p>
      </div>
    </div>
  );
}

// ============================================================
// CONVERSATION LOG INPUT
// Simple textarea for pasting chatbot conversations
// ============================================================

interface ConversationLogInputProps {
  value: string;
  onChange: (value: string) => void;
  minWords?: number;
  placeholder?: string;
  label?: string;
}

export function ConversationLogInput({
  value,
  onChange,
  minWords = 50,
  placeholder = `Paste your conversation here...

Example:
Customer: Hi, I have a question about my order.
Bot: Hello! I'm Aria from Velara. I'd be happy to help with your order. Could you provide your order number?
Customer: It's VL-12345
Bot: Thank you! Let me check that for you...`,
  label = "Paste Your Chatbot Conversation",
}: ConversationLogInputProps) {
  const words = value.trim() ? value.trim().split(/\s+/).length : 0;
  const hasEnough = words >= minWords;

  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[rgba(74,144,217,0.08)] border-b border-[#1C3348]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">💬</span>
            <p className="font-mono text-xs font-bold text-[#4A90D9] tracking-widest uppercase">
              {label}
            </p>
          </div>
          <span className={cn(
            "px-2 py-1 rounded text-xs font-medium",
            hasEnough ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-400"
          )}>
            {words}/{minWords} words
          </span>
        </div>
      </div>

      {/* Textarea */}
      <div className="p-4">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className="w-full p-3 bg-[#08131E] border border-[#1C3348] rounded-lg text-[13px] text-white outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors resize-none placeholder:text-[#3D5870] font-mono"
        />
        {!hasEnough && (
          <p className="text-xs text-[#7A9AB5] mt-2">
            💡 Paste at least {minWords} words showing a conversation between a customer and your chatbot
          </p>
        )}
        {hasEnough && (
          <p className="text-xs text-[#2DD36F] mt-2">
            ✓ Conversation logged! This evidence will be saved.
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================
// EXPORT PORTFOLIO BUTTON
// Generates a downloadable summary of student work
// ============================================================

interface PortfolioData {
  studentName: string;
  studentId: string;
  courseName: string;
  moduleName: string;
  completedDate: string;
  xpEarned: number;
  badge?: string;
  prompts: {
    title: string;
    prompt: string;
    score?: number;
    maxScore?: number;
  }[];
  reflections?: {
    question: string;
    answer: string;
  }[];
  skillLevel?: 'bronze' | 'silver' | 'gold';
}

interface ExportPortfolioProps {
  data: PortfolioData;
  className?: string;
}

export function ExportPortfolioButton({ data, className }: ExportPortfolioProps) {
  const generatePortfolio = () => {
    const skillEmoji = data.skillLevel === 'gold' ? '🥇' : data.skillLevel === 'silver' ? '🥈' : '🥉';
    
    const content = `
================================================================================
                      SWIPEUP AI ACADEMY - STUDENT PORTFOLIO
================================================================================

Student: ${data.studentName}
Student ID: ${data.studentId}
Course: ${data.courseName}
Module: ${data.moduleName}
Completed: ${data.completedDate}
Total XP Earned: ${data.xpEarned}
 ${data.badge ? `Badge Earned: ${data.badge}` : ''}
 ${data.skillLevel ? `Skill Level: ${skillEmoji} ${data.skillLevel.charAt(0).toUpperCase() + data.skillLevel.slice(1)}` : ''}

================================================================================
                              PROMPTS SUBMITTED
================================================================================

 ${data.prompts.map((p, i) => `
--- ${p.title} ---
 ${p.prompt}
 ${p.score !== undefined ? `\nScore: ${p.score}/${p.maxScore} (${Math.round(p.score / (p.maxScore || 1) * 100)}%)` : ''}
`).join('\n')}

 ${data.reflections && data.reflections.length > 0 ? `
================================================================================
                              REFLECTIONS
================================================================================

 ${data.reflections.map(r => `
Q: ${r.question}
A: ${r.answer}
`).join('\n')}
` : ''}

================================================================================
                              VERIFICATION
================================================================================

This portfolio was generated by SwipeUp AI Academy.
Verify at: https://rajthakor-rgb.github.io/SwipeUp-AI-Academy/

© ${new Date().getFullYear()} SwipeUp AI Society • University of Law
================================================================================
`.trim();

    // Create and download file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SwipeUp-Portfolio-${data.studentId}-${data.moduleName.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={generatePortfolio}
      className={cn(
        "flex items-center justify-center gap-2 px-4 py-3 bg-[#4A90D9] text-white rounded-lg font-mono text-xs font-bold tracking-widest uppercase hover:bg-[#5BA3EC] hover:-translate-y-0.5 transition-all",
        className
      )}
    >
      <span>📄</span>
      Export My Portfolio
    </button>
  );
}

// ============================================================
// SKILL LEVEL DISPLAY
// Shows current skill level with progress bar
// ============================================================

interface SkillLevelDisplayProps {
  level: 'bronze' | 'silver' | 'gold';
  xp: number;
  nextLevelXP?: number;
  skillName: string;
}

export function SkillLevelDisplay({ level, xp, nextLevelXP, skillName }: SkillLevelDisplayProps) {
  const levelConfig = {
    bronze: { emoji: '🥉', color: '#CD7F32', label: 'Bronze', minXP: 0 },
    silver: { emoji: '🥈', color: '#C0C0C0', label: 'Silver', minXP: 100 },
    gold: { emoji: '🥇', color: '#FFD700', label: 'Gold', minXP: 250 },
  };

  const config = levelConfig[level];
  const progress = nextLevelXP ? Math.min(100, (xp / nextLevelXP) * 100) : 100;

  return (
    <div className="bg-[#112030] border border-[#1C3348] rounded-lg p-4">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{config.emoji}</span>
        <div>
          <p className="font-mono text-xs text-[#3D5870] tracking-wider uppercase">{skillName}</p>
          <p className="font-bold text-white">{config.label} Level</p>
        </div>
        <span className="ml-auto font-mono text-sm text-[#C9A84C]">{xp} XP</span>
      </div>
      
      {nextLevelXP && (
        <div>
          <div className="flex justify-between text-xs text-[#3D5870] mb-1">
            <span>Progress to {level === 'bronze' ? 'Silver' : 'Gold'}</span>
            <span>{xp}/{nextLevelXP} XP</span>
          </div>
          <div className="h-2 bg-[#1C3348] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                backgroundColor: config.color 
              }}
            />
          </div>
        </div>
      )}
      
      {!nextLevelXP && (
        <p className="text-center text-xs text-[#C9A84C] font-mono">
          🏆 HIGHEST LEVEL ACHIEVED
        </p>
      )}
    </div>
  );
}
