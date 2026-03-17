'use client';

import { useState, useEffect, useCallback } from 'react';
import { AcademyProgress, defaultProgress } from '@/types/academy';

const STORAGE_KEY = 'swipeup-academy-progress';

export function useAcademyProgress() {
  const [progress, setProgress] = useState<AcademyProgress>(defaultProgress);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as AcademyProgress;
        setProgress({ ...defaultProgress, ...parsed });
      } catch {
        console.error('Failed to parse saved progress');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever progress changes
  const saveProgress = useCallback((newProgress: AcademyProgress) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    setProgress(newProgress);
  }, []);

  // Register student
  const registerStudent = useCallback((name: string, studentId: string) => {
    const newProgress: AcademyProgress = {
      ...defaultProgress,
      studentName: name,
      studentId: studentId,
      lastActive: new Date().toISOString(),
    };
    saveProgress(newProgress);
    return newProgress;
  }, [saveProgress]);

  // Update progress
  const updateProgress = useCallback((updates: Partial<AcademyProgress>) => {
    const newProgress: AcademyProgress = {
      ...progress,
      ...updates,
      lastActive: new Date().toISOString(),
    };
    saveProgress(newProgress);
    return newProgress;
  }, [progress, saveProgress]);

  // Add XP
  const addXP = useCallback((amount: number) => {
    const newProgress = {
      ...progress,
      totalXP: progress.totalXP + amount,
      lastActive: new Date().toISOString(),
    };
    saveProgress(newProgress);
    return newProgress;
  }, [progress, saveProgress]);

  // Add badge
  const addBadge = useCallback((badge: string) => {
    if (progress.badges.includes(badge)) return progress;
    const newProgress = {
      ...progress,
      badges: [...progress.badges, badge],
      lastActive: new Date().toISOString(),
    };
    saveProgress(newProgress);
    return newProgress;
  }, [progress, saveProgress]);

  // Complete module in Course 2
  const completeModule2 = useCallback((moduleNum: number) => {
    if (progress.course2ModulesCompleted.includes(moduleNum)) return progress;
    const newProgress = {
      ...progress,
      course2ModulesCompleted: [...progress.course2ModulesCompleted, moduleNum],
      lastActive: new Date().toISOString(),
    };
    saveProgress(newProgress);
    return newProgress;
  }, [progress, saveProgress]);

  // Complete prepare phase for Course 2 module
  const completePrepare2 = useCallback((moduleNum: number) => {
    if (progress.course2PrepareCompleted.includes(moduleNum)) return progress;
    const newProgress = {
      ...progress,
      course2PrepareCompleted: [...progress.course2PrepareCompleted, moduleNum],
      lastActive: new Date().toISOString(),
    };
    saveProgress(newProgress);
    return newProgress;
  }, [progress, saveProgress]);

  // Unlock Course 2 with code
  // Also marks Course 1 as completed and awards badge
  const unlockCourse2 = useCallback((code: string) => {
    const newProgress = {
      ...progress,
      course2Unlocked: true,
      course1Completed: true, // Mark Course 1 as completed
      course1CompletionCode: code,
      badges: progress.badges.includes('AI Explorer') 
        ? progress.badges 
        : [...progress.badges, 'AI Explorer'], // Award badge for Course 1
      lastActive: new Date().toISOString(),
    };
    saveProgress(newProgress);
    return newProgress;
  }, [progress, saveProgress]);

  // Validate completion code format
  // Format: SWIPEUP-XXXX-XXX-XXXX (name part + numbers + random part)
  // Name part may contain spaces if name is shorter than 4 chars
  const validateCodeFormat = useCallback((code: string): boolean => {
    // Remove any extra spaces and normalize
    const normalizedCode = code.toUpperCase().replace(/\s+/g, ' ').trim();
    // Pattern: SWIPEUP-[4 chars including possible space]-[numbers]-[alphanumeric]
    const pattern = /^SWIPEUP-[A-Z ]{4}-\d+-.+$/;
    return pattern.test(normalizedCode);
  }, []);

  // Clear progress
  const clearProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(defaultProgress);
  }, []);

  return {
    progress,
    isLoaded,
    registerStudent,
    updateProgress,
    addXP,
    addBadge,
    completeModule2,
    completePrepare2,
    unlockCourse2,
    validateCodeFormat,
    clearProgress,
  };
}
