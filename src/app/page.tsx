'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { logProgress } from '@/lib/notion';
import { cn } from '@/lib/utils';

// Course data for the strip
const courses = [
  { id: 1, title: 'Introduction to AI' },
  { id: 2, title: 'Productivity and Organisation' },
  { id: 3, title: 'Workflow Automation' },
  { id: 4, title: 'Data Analysis and Visualisation' },
  { id: 5, title: 'Career Development' },
];

export default function WelcomePage() {
  const router = useRouter();
  const { progress, isLoaded, registerStudent } = useAcademyProgress();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already registered
  useEffect(() => {
    if (isLoaded && progress.studentName) {
      router.push('/dashboard');
    }
  }, [isLoaded, progress.studentName, router]);

  const handleSubmit = async () => {
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    const idPattern = /^0[0-9]{6}$/;
    if (!idPattern.test(studentId)) {
      setError('Please check your Student ID. It must start with 0 and be 7 digits long.');
      return;
    }

    setIsSubmitting(true);

    // Save progress
    registerStudent(name.trim(), studentId);

    // Log to Notion
    await logProgress({
      studentName: name.trim(),
      studentId: studentId,
      event: 'Academy Joined',
      details: 'Student registered for SwipeUp AI Academy',
      totalXP: 0,
    });

    setIsSubmitting(false);
    router.push('/dashboard');
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Top Section - Story */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Logo and Title */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gold shadow-lg">
                <img
                  src="/SwipeUp-AI-Academy/swipeup-logo.jpeg"
                  alt="SwipeUp Logo"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              SwipeUp AI Learning Academy
            </h1>
            <p className="text-lg sm:text-xl text-gold font-medium">
              The practical AI skills your business career needs
            </p>
          </div>

          {/* Value Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center card-hover">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gold mb-2">Learn by Doing</h3>
              <p className="text-slate-300 text-sm">
                Real business case simulations, not passive reading
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center card-hover">
              <div className="text-4xl mb-3">📜</div>
              <h3 className="text-lg font-semibold text-gold mb-2">Earn Certificates</h3>
              <p className="text-slate-300 text-sm">
                Complete each course and earn LinkedIn-ready certificates
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center card-hover">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-semibold text-gold mb-2">Industry Ready</h3>
              <p className="text-slate-300 text-sm">
                Every tool you learn is used by real businesses today
              </p>
            </div>
          </div>

          {/* Course Strip */}
          <div className="mb-12 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h2 className="text-center text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">
              Your Learning Journey
            </h2>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {courses.map((course, index) => (
                <div key={course.id} className="flex items-center">
                  <div className="bg-secondary/50 border border-border rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                    <span className="text-xs sm:text-sm text-white">
                      <span className="text-gold font-bold">{course.id}.</span> {course.title}
                    </span>
                  </div>
                  {index < courses.length - 1 && (
                    <span className="hidden sm:inline text-gold mx-2">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Section - Sign In */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background/50">
        <div className="max-w-md mx-auto">
          <div className="bg-secondary/30 border border-border rounded-2xl p-6 sm:p-8 backdrop-blur animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Ready to start your journey?
            </h2>

            <div className="space-y-4">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Full Name <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 focus:border-gold transition-colors"
                />
              </div>

              {/* Student ID Field */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Student ID <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value.replace(/[^0-9]/g, '').slice(0, 7))}
                  placeholder="0123456"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 focus:border-gold transition-colors font-mono tracking-wider"
                />
                <p className="text-xs text-slate-500 mt-1.5">
                  Your Student ID starts with 0 followed by 6 digits, for example 0123456
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={cn(
                  "w-full py-4 rounded-lg font-semibold text-lg transition-all",
                  "bg-navy text-gold hover:bg-navy-light",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner w-5 h-5" />
                    Starting...
                  </span>
                ) : (
                  'Start Your Journey'
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2025 SwipeUp AI Society • University of Law
          </p>
        </div>
      </footer>
    </div>
  );
}
