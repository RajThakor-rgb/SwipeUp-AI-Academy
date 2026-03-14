import { AcademyProgress } from '@/types/academy';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateOverallProgress(progress: AcademyProgress): number {
  let totalProgress = 0;
  
  // Course 1: 20% of total (completed if they have a code OR course1Completed is true)
  if (progress.course1Completed || progress.course1CompletionCode) {
    totalProgress += 20;
  }
  
  // Course 2: 20% of total (fractional based on modules completed)
  // 5 modules total, each module = 4%
  const course2ModulesProgress = (progress.course2ModulesCompleted.length / 5) * 20;
  totalProgress += course2ModulesProgress;
  
  // Course 3: 20% of total
  if (progress.course3Completed) {
    totalProgress += 20;
  }
  
  // Course 4: 20% of total
  if (progress.course4Completed) {
    totalProgress += 20;
  }
  
  // Course 5: 20% of total
  if (progress.course5Completed) {
    totalProgress += 20;
  }
  
  return Math.round(totalProgress);
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
