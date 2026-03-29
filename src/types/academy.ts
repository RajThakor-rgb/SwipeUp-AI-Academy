// SwipeUp AI Academy Types

export type SkillLevel = 'bronze' | 'silver' | 'gold';

export interface SkillBadgeProgress {
  id: string;
  name: string;
  level: SkillLevel;
  earnedDate?: string;
  xpEarned: number;
}

export interface PromptIteration {
  round: number;
  prompt: string;
  reflection: string;
  score: number;
  maxScore: number;
  passed: string[];
  failed: string[];
}

export interface ModuleProgress {
  moduleId: number;
  prompts: PromptIteration[];
  conversationLogs: string[];
  selfAssessments: Record<string, boolean>;
  skillLevel: SkillLevel;
  completedAt?: string;
}

export interface AcademyProgress {
  studentName: string;
  studentId: string;
  totalXP: number;
  badges: string[];
  skillBadges: SkillBadgeProgress[];
  // Course 1
  course1Completed: boolean;
  course1CompletionCode: string;
  // Course 2
  course2Unlocked: boolean;
  course2ModulesCompleted: number[];
  course2PrepareCompleted: number[];
  course2CertificateEarned: boolean;
  course2Module1Progress?: ModuleProgress;
  course2Module2Progress?: ModuleProgress;
  // Course 3-5
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
  skillBadges: [],
  course1Completed: false,
  course1CompletionCode: '',
  course2Unlocked: false,
  course2ModulesCompleted: [],
  course2PrepareCompleted: [],
  course2CertificateEarned: false,
  course2Module1Progress: undefined,
  course2Module2Progress: undefined,
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
  subtitle?: string;
  emoji?: string;
  icon?: string;
  description: string;
  xpAvailable?: number;
  xpReward?: number;
  duration: string;
  status?: 'unlocked' | 'in-progress' | 'completed' | 'locked';
  modules?: any[];
  externalUrl?: string;
}

export interface Module {
  id: number;
  title: string;
  miniCase: string;
  badge: string;
  status: 'unlocked' | 'locked' | 'completed';
}
