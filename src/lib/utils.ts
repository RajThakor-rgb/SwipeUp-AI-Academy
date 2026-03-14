import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function validateStudentId(studentId: string): boolean {
  const pattern = /^0[0-9]{6}$/;
  return pattern.test(studentId);
}

export function generateCompletionCode(name: string, xp: number): string {
  const namePart = name.slice(0, 4).toUpperCase().padEnd(4, 'X');
  const xpPart = Math.floor(xp / 10);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SWIPEUP-${namePart}-${xpPart}-${randomPart}`;
}

export function calculateOverallProgress(progress: {
  course1Completed: boolean;
  course2CertificateEarned: boolean;
  course3Completed: boolean;
  course4Completed: boolean;
  course5Completed: boolean;
}): number {
  let completed = 0;
  if (progress.course1Completed) completed++;
  if (progress.course2CertificateEarned) completed++;
  if (progress.course3Completed) completed++;
  if (progress.course4Completed) completed++;
  if (progress.course5Completed) completed++;
  return Math.round((completed / 5) * 100);
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
