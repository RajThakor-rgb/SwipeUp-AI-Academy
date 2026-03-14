'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { cn, calculateOverallProgress } from '@/lib/utils';
import { logProgress } from '@/lib/notion';

// Course data
const courseData = [
  {
    id: 1,
    title: 'Introduction to AI',
    emoji: '📘',
    description: 'Master AI fundamentals through interactive missions and real-world scenarios.',
    xpAvailable: 1200,
    duration: '1 week',
  },
  {
    id: 2,
    title: 'Productivity and Organisation',
    emoji: '🛠️',
    description: 'Join Velara as an AI consultant and solve real business problems.',
    xpAvailable: 2500,
    duration: '2 weeks',
  },
  {
    id: 3,
    title: 'Workflow Automation',
    emoji: '⚡',
    description: 'Build AI-powered workflows with Zapier, Make, and Power Automate.',
    xpAvailable: 2000,
    duration: '2 weeks',
  },
  {
    id: 4,
    title: 'Data Analysis and Visualisation',
    emoji: '📊',
    description: 'Master AI-assisted analytics with Tableau, Power BI, and more.',
    xpAvailable: 2000,
    duration: '2 weeks',
  },
  {
    id: 5,
    title: 'Career Development',
    emoji: '💼',
    description: 'Build your professional brand with AI-powered CV and LinkedIn tools.',
    xpAvailable: 1500,
    duration: '2 weeks',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { progress, isLoaded, unlockCourse2, validateCodeFormat, updateProgress } = useAcademyProgress();
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState('');
  const [codeSuccess, setCodeSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCodeInput, setShowCodeInput] = useState(false);

  // Redirect if not registered
  useEffect(() => {
    if (isLoaded && !progress.studentName) {
      router.push('/');
    }
  }, [isLoaded, progress.studentName, router]);

  const getCourseStatus = (courseId: number): 'unlocked' | 'in-progress' | 'completed' | 'locked' => {
    switch (courseId) {
      case 1:
        return progress.course1Completed ? 'completed' : 'unlocked';
      case 2:
        if (progress.course2CertificateEarned) return 'completed';
        if (progress.course2Unlocked) return progress.course2ModulesCompleted.length > 0 ? 'in-progress' : 'unlocked';
        return 'locked';
      case 3:
        return progress.course3Completed ? 'completed' : progress.course3Unlocked ? 'unlocked' : 'locked';
      case 4:
        return progress.course4Completed ? 'completed' : progress.course4Unlocked ? 'unlocked' : 'locked';
      case 5:
        return progress.course5Completed ? 'completed' : progress.course5Unlocked ? 'unlocked' : 'locked';
      default:
        return 'locked';
    }
  };

  const handleEnterCourse = (courseId: number) => {
    if (courseId === 1) {
      window.open('https://rajthakor-rgb.github.io/SwipeUp-AI-Quest/', '_blank');
    } else if (courseId === 2) {
      router.push('/course2');
    } else {
      setToastMessage('Coming Soon! This course is under development.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  const handleCodeSubmit = () => {
    setCodeError('');
    const code = codeInput.toUpperCase().replace(/\s+/g, ' ').trim();

    if (!validateCodeFormat(code)) {
      setCodeError('Invalid code format. Code should look like: SWIPEUP-JOHN-120-2026 or SWIPEUP-RAJ -895-006Z');
      return;
    }

    unlockCourse2(code);
    setCodeSuccess(true);
    setCodeInput('');
    setShowCodeInput(false);

    logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'Course 2 Unlocked',
      details: `Completion code: ${code}`,
      totalXP: progress.totalXP,
    });

    setTimeout(() => setCodeSuccess(false), 3000);
  };

  const handleLinkedInShare = () => {
    const text = `I am working through the SwipeUp AI Learning Academy at University of Law. Building real AI skills through business case simulations. Check it out: https://rajthakor-rgb.github.io/SwipeUp-AI-Academy/`;
    navigator.clipboard.writeText(text);
    setToastMessage('LinkedIn post copied to clipboard!');
    setTimeout(() => setToastMessage(''), 3000);
  };

  if (!isLoaded || !progress.studentName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    );
  }

  const overallProgress = calculateOverallProgress(progress);
  const completedCourses = [progress.course1Completed, progress.course2CertificateEarned, progress.course3Completed, progress.course4Completed, progress.course5Completed].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-gold text-navy px-6 py-3 rounded-lg shadow-lg animate-slide-in font-medium">
          {toastMessage}
        </div>
      )}

      {/* Success Message */}
      {codeSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-slide-in font-medium">
          Course 2 Unlocked!
        </div>
      )}

      {/* Header */}
      <header className="bg-secondary/50 border-b border-border sticky top-0 z-40 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg overflow-hidden border border-gold">
              <img src="/SwipeUp-AI-Academy/swipeup-logo.jpeg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-white">AI Academy</h1>
              <p className="text-xs text-slate-400">SwipeUp AI Society</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-white font-medium">{progress.studentName}</p>
            <p className="text-xs text-gold">⭐ {progress.totalXP} XP</p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Section 1 - Hero */}
        <section className="mb-10 animate-fade-in">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            Welcome back, {progress.studentName.split(' ')[0]}!
          </h2>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2 text-gold">
              <span className="text-2xl">⭐</span>
              <span className="text-xl font-bold">{progress.totalXP}</span>
              <span className="text-slate-400 text-sm">XP earned</span>
            </div>
          </div>
          <div className="bg-secondary/30 border border-border rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-300">Academy Progress</span>
              <span className="text-gold font-medium">{overallProgress}%</span>
            </div>
            <div className="h-3 bg-background rounded-full overflow-hidden">
              <div
                className="h-full progress-gold transition-all duration-500"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </section>

        {/* Section 2 - Journey Roadmap */}
        <section className="mb-10 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Your Journey</h3>
          {/* Desktop Roadmap */}
          <div className="hidden md:flex items-center justify-between gap-2">
            {courseData.map((course, index) => {
              const status = getCourseStatus(course.id);
              return (
                <div key={course.id} className="flex items-center flex-1">
                  <div className={cn(
                    "flex-1 p-3 rounded-lg border text-center transition-all",
                    status === 'completed' && "bg-green-900/30 border-green-500/50",
                    status === 'in-progress' && "bg-gold/20 border-gold",
                    status === 'unlocked' && "bg-secondary/30 border-border",
                    status === 'locked' && "bg-background/50 border-border opacity-50"
                  )}>
                    <div className="text-2xl mb-1">{course.emoji}</div>
                    <p className="text-xs font-medium text-white">Course {course.id}</p>
                    <p className="text-xs text-slate-400 truncate">{course.duration}</p>
                    <div className={cn(
                      "mt-1 text-xs px-2 py-0.5 rounded-full inline-block",
                      status === 'completed' && "bg-green-600 text-white",
                      status === 'in-progress' && "bg-gold text-navy",
                      status === 'unlocked' && "bg-secondary text-slate-300",
                      status === 'locked' && "bg-slate-700 text-slate-400"
                    )}>
                      {status === 'completed' ? '✓' : status === 'in-progress' ? '▶' : status === 'locked' ? '🔒' : '○'}
                    </div>
                  </div>
                  {index < courseData.length - 1 && (
                    <div className={cn(
                      "h-0.5 w-4",
                      getCourseStatus(course.id) === 'completed' ? "bg-green-500" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
          {/* Mobile List */}
          <div className="md:hidden space-y-2">
            {courseData.map((course) => {
              const status = getCourseStatus(course.id);
              return (
                <div key={course.id} className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  status === 'completed' && "bg-green-900/30 border-green-500/50",
                  status === 'in-progress' && "bg-gold/20 border-gold",
                  status === 'unlocked' && "bg-secondary/30 border-border",
                  status === 'locked' && "bg-background/50 border-border opacity-50"
                )}>
                  <span className="text-2xl">{course.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">Course {course.id}: {course.title}</p>
                    <p className="text-xs text-slate-400">{course.duration}</p>
                  </div>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    status === 'completed' && "bg-green-600 text-white",
                    status === 'in-progress' && "bg-gold text-navy",
                    status === 'unlocked' && "bg-secondary text-slate-300",
                    status === 'locked' && "bg-slate-700 text-slate-400"
                  )}>
                    {status === 'completed' ? 'Completed' : status === 'in-progress' ? 'In Progress' : status === 'locked' ? 'Locked' : 'Unlocked'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 3 - Course Cards */}
        <section className="mb-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <h3 className="text-lg font-semibold text-white mb-4">Courses</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {courseData.map((course) => {
              const status = getCourseStatus(course.id);
              const isLocked = status === 'locked';

              return (
                <div key={course.id} className={cn(
                  "relative bg-secondary/30 border rounded-xl p-5 transition-all",
                  isLocked ? "opacity-60 border-border" : "border-border hover:border-gold card-hover"
                )}>
                  {/* Lock Icon */}
                  {isLocked && (
                    <div className="absolute top-3 right-3 text-slate-400 text-lg">🔒</div>
                  )}

                  {/* Completed Badge */}
                  {status === 'completed' && (
                    <div className="absolute top-3 right-3 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">✓</div>
                  )}

                  {/* Course Header */}
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-3xl">{course.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gold font-medium">Course {course.id}</p>
                      <h4 className="font-semibold text-white">{course.title}</h4>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-400 mb-3 line-clamp-2">{course.description}</p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                    <span>⚡ {course.xpAvailable} XP</span>
                    <span>⏱ {course.duration}</span>
                  </div>

                  {/* Code Input for Course 2 */}
                  {course.id === 2 && !progress.course2Unlocked && (
                    <div className="mb-3">
                      <button
                        onClick={() => setShowCodeInput(!showCodeInput)}
                        className="text-xs text-gold hover:underline"
                      >
                        Have a completion code from Course 1?
                      </button>
                      {showCodeInput && (
                        <div className="mt-2 space-y-2">
                          <input
                            type="text"
                            value={codeInput}
                            onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                            placeholder="SWIPEUP-XXXX-XXX-XXXX"
                            className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white text-sm placeholder:text-slate-500 font-mono"
                          />
                          {codeError && <p className="text-xs text-red-400">{codeError}</p>}
                          <button
                            onClick={handleCodeSubmit}
                            className="w-full py-2 bg-gold text-navy rounded-lg text-sm font-medium"
                          >
                            Unlock Course 2
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Button */}
                  <button
                    onClick={() => !isLocked && handleEnterCourse(course.id)}
                    disabled={isLocked}
                    className={cn(
                      "w-full py-2 rounded-lg font-medium text-sm transition-all",
                      isLocked
                        ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                        : status === 'completed'
                        ? "bg-green-600 text-white"
                        : status === 'in-progress'
                        ? "bg-gold text-navy"
                        : "bg-navy text-gold hover:bg-navy-light"
                    )}
                  >
                    {isLocked ? 'Locked' : status === 'completed' ? 'Completed' : status === 'in-progress' ? 'Continue' : course.id === 1 ? 'Enter Course ↗' : 'Enter Course'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 4 - Progress Bar */}
        <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <div className="bg-secondary/30 border border-border rounded-xl p-6">
            {/* Badges */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Badges Earned</h4>
              {progress.badges.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {progress.badges.map((badge, i) => (
                    <span key={i} className="badge-gold px-3 py-1 rounded-full text-sm">
                      🏅 {badge}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No badges earned yet. Complete modules to earn badges!</p>
              )}
            </div>

            {/* Summary */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border">
              <p className="text-slate-300">
                <span className="text-gold font-bold">{completedCourses}</span> of 5 courses completed
              </p>
              <button
                onClick={handleLinkedInShare}
                className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-lg text-sm font-medium hover:bg-[#006097] transition-colors"
              >
                <span>in</span>
                Share on LinkedIn
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-8 border-t border-border">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2025 SwipeUp AI Society • University of Law
          </p>
        </div>
      </footer>
    </div>
  );
}
