// SwipeUp AI Academy Types

export interface AcademyProgress {
  studentName: string;
  studentId: string;
  totalXP: number;
  badges: string[];
  course1Completed: boolean;
  course1CompletionCode: string;
  course2Unlocked: boolean;
  course2ModulesCompleted: number[];
  course2PrepareCompleted: number[];
  course2CertificateEarned: boolean;
  course3Unlocked: boolean;
  course3Completed: boolean;
  course4Unlocked: boolean;
  course4Completed: boolean;
  course5Unlocked: boolean;
  course5Completed: boolean;
  lastActive: string;
}

export const defaultProgress: AcademyProgress = {
  studentName: '',
  studentId: '',
  totalXP: 0,
  badges: [],
  course1Completed: false,
  course1CompletionCode: '',
  course2Unlocked: false,
  course2ModulesCompleted: [],
  course2PrepareCompleted: [],
  course2CertificateEarned: false,
  course3Unlocked: false,
  course3Completed: false,
  course4Unlocked: false,
  course4Completed: false,
  course5Unlocked: false,
  course5Completed: false,
  lastActive: '',
};

export interface Course {
  id: number;
  title: string;
  emoji: string;
  description: string;
  xpAvailable: number;
  duration: string;
  status: 'unlocked' | 'in-progress' | 'completed' | 'locked';
}

export interface Module {
  id: number;
  title: string;
  miniCase: string;
  badge: string;
  status: 'unlocked' | 'locked' | 'completed';
}
