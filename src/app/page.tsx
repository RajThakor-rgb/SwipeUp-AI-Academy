'use client';

import { useState, useEffect, useRef } from 'react';
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

// Dev mode password
const DEV_PASSWORD = 'SwipeUpAdmin2025!';

// ─── Under Construction Page ──────────────────────────────────────────────────
function UnderConstructionPage({
  onLogoClick,
  showDevLogin,
  devPassword,
  setDevPassword,
  devError,
  handleDevLogin,
  setShowDevLogin,
}: {
  onLogoClick: () => void;
  showDevLogin: boolean;
  devPassword: string;
  setDevPassword: (v: string) => void;
  devError: string;
  handleDevLogin: () => void;
  setShowDevLogin: (v: boolean) => void;
}) {
  return (
    <div className="min-h-screen bg-navy-gradient flex flex-col items-center justify-center px-4 relative overflow-hidden">

      {/* Decorative animated rings */}
      <div style={{
        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
        justifyContent: 'center', pointerEvents: 'none', overflow: 'hidden',
      }}>
        {[400, 600, 800, 1000].map((size, i) => (
          <div key={size} style={{
            position: 'absolute', width: size, height: size, borderRadius: '50%',
            border: '1px solid rgba(232,160,32,0.06)',
            animation: `spin ${20 + i * 8}s linear infinite ${i % 2 === 0 ? '' : 'reverse'}`,
          }} />
        ))}
      </div>

      {/* Main content card */}
      <div className="relative z-10 text-center max-w-xl w-full animate-fade-in">

        {/* Logo — hidden dev trigger (5 rapid clicks) */}
        <div className="flex justify-center mb-8">
          <div
            className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-gold shadow-2xl cursor-pointer transition-transform hover:scale-105"
            onClick={onLogoClick}
            title="SwipeUp AI Academy"
          >
            <img
              src="/SwipeUp-AI-Academy/swipeup-logo.jpeg"
              alt="SwipeUp Logo"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 leading-tight">
          SwipeUp AI Academy
        </h1>
        <p className="text-gold text-lg font-medium mb-10">
          The practical AI skills your business career needs
        </p>

        {/* Under construction badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '10px',
          background: 'rgba(232,160,32,0.12)', border: '1px solid rgba(232,160,32,0.35)',
          borderRadius: '9999px', padding: '10px 22px', marginBottom: '32px',
        }}>
          <span style={{ fontSize: '20px' }}>🚧</span>
          <span style={{ color: '#E8A020', fontWeight: 600, fontSize: '15px', letterSpacing: '0.03em' }}>
            Under Construction
          </span>
        </div>

        {/* Message */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px', padding: '28px 32px', marginBottom: '40px', backdropFilter: 'blur(8px)',
        }}>
          <p className="text-slate-300 text-base leading-relaxed mb-4">
            We're putting the finishing touches on something exciting. The SwipeUp AI Academy
            is almost ready to launch — packed with practical AI courses built for modern business careers.
          </p>
          <p className="text-slate-400 text-sm leading-relaxed">
            Check back soon. We can't wait to show you what we've been building. 🎓
          </p>
        </div>

        {/* Course preview strip */}
        <div className="mb-10">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-4 font-medium">Coming Courses</p>
          <div className="flex flex-wrap justify-center gap-2">
            {courses.map((course) => (
              <div key={course.id} className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                <span className="text-xs text-white/70">
                  <span className="text-gold font-bold">{course.id}.</span> {course.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-sm text-slate-600">© 2025 SwipeUp AI Society · University of Law</p>
      </div>

      {/* Dev Login Modal */}
      {showDevLogin && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-secondary border border-gold rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="text-xl font-bold text-gold">Admin Access</h3>
              <p className="text-sm text-slate-400 mt-1">Enter admin password to continue</p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDevLogin()}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 focus:border-gold transition-colors"
                autoFocus
              />
              {devError && <p className="text-red-400 text-sm text-center">{devError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDevLogin(false); setDevPassword(''); }}
                  className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDevLogin}
                  className="flex-1 py-3 rounded-lg bg-gold text-navy font-bold hover:bg-gold/90 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Full Welcome Page (shown only in dev mode) ────────────────────────────────
function WelcomePageContent({
  onLogoClick,
  showDevLogin,
  devPassword,
  setDevPassword,
  devError,
  handleDevLogin,
  setShowDevLogin,
  isLoaded,
  name,
  setName,
  studentId,
  setStudentId,
  error,
  isSubmitting,
  handleSubmit,
}: {
  onLogoClick: () => void;
  showDevLogin: boolean;
  devPassword: string;
  setDevPassword: (v: string) => void;
  devError: string;
  handleDevLogin: () => void;
  setShowDevLogin: (v: boolean) => void;
  isLoaded: boolean;
  name: string;
  setName: (v: string) => void;
  studentId: string;
  setStudentId: (v: string) => void;
  error: string;
  isSubmitting: boolean;
  handleSubmit: () => void;
}) {
  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-gradient">
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 animate-fade-in">
            <div className="flex justify-center mb-6">
              <div
                className="w-20 h-20 rounded-lg overflow-hidden border-2 border-gold shadow-lg cursor-pointer"
                onClick={onLogoClick}
              >
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center card-hover">
              <div className="text-4xl mb-3">🎯</div>
              <h3 className="text-lg font-semibold text-gold mb-2">Learn by Doing</h3>
              <p className="text-slate-300 text-sm">Real business case simulations, not passive reading</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center card-hover">
              <div className="text-4xl mb-3">📜</div>
              <h3 className="text-lg font-semibold text-gold mb-2">Earn Certificates</h3>
              <p className="text-slate-300 text-sm">Complete each course and earn LinkedIn-ready certificates</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-xl p-6 text-center card-hover">
              <div className="text-4xl mb-3">💼</div>
              <h3 className="text-lg font-semibold text-gold mb-2">Industry Ready</h3>
              <p className="text-slate-300 text-sm">Every tool you learn is used by real businesses today</p>
            </div>
          </div>

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

      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-background/50">
        <div className="max-w-md mx-auto">
          <div className="bg-secondary/30 border border-border rounded-2xl p-6 sm:p-8 backdrop-blur animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <h2 className="text-2xl font-bold text-white text-center mb-6">
              Ready to start your journey?
            </h2>
            <div className="space-y-4">
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
              {error && (
                <div className="bg-red-900/30 border border-red-500/50 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}
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

      <footer className="py-6 px-4 border-t border-border">
        <div className="max-w-5xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2025 SwipeUp AI Society • University of Law
          </p>
        </div>
      </footer>

      {showDevLogin && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-secondary border border-gold rounded-2xl p-6 w-full max-w-sm">
            <div className="text-center mb-4">
              <div className="text-3xl mb-2">🔐</div>
              <h3 className="text-xl font-bold text-gold">Admin Access</h3>
              <p className="text-sm text-slate-400 mt-1">Enter admin password to continue</p>
            </div>
            <div className="space-y-4">
              <input
                type="password"
                value={devPassword}
                onChange={(e) => setDevPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleDevLogin()}
                placeholder="Enter password"
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 focus:border-gold transition-colors"
                autoFocus
              />
              {devError && <p className="text-red-400 text-sm text-center">{devError}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDevLogin(false); setDevPassword(''); }}
                  className="flex-1 py-3 rounded-lg border border-slate-600 text-slate-400 font-medium hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDevLogin}
                  className="flex-1 py-3 rounded-lg bg-gold text-navy font-bold hover:bg-gold/90 transition-colors"
                >
                  Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Root export ───────────────────────────────────────────────────────────────
export default function WelcomePage() {
  const router = useRouter();
  const { progress, isLoaded, registerStudent } = useAcademyProgress();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dev mode state
  const [showDevLogin, setShowDevLogin] = useState(false);
  const [devPassword, setDevPassword] = useState('');
  const [devError, setDevError] = useState('');
  const logoClickCount = useRef(0);

  // 'construction' = public under-construction page | 'full' = full site (dev only)
  const [siteMode, setSiteMode] = useState<'construction' | 'full'>('construction');

  // Redirect if already registered
  useEffect(() => {
    if (isLoaded && progress.studentName) {
      router.push('/dashboard');
    }
  }, [isLoaded, progress.studentName, router]);

  // ?dev=true in URL → show full page + dev login prompt
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('dev') === 'true') {
      setSiteMode('full');
      setShowDevLogin(true);
    }
  }, []);

  // Hidden trigger: click logo 5 times rapidly
  const handleLogoClick = () => {
    logoClickCount.current += 1;
    setTimeout(() => { logoClickCount.current = 0; }, 1500);
    if (logoClickCount.current >= 5) {
      setSiteMode('full');
      setShowDevLogin(true);
      logoClickCount.current = 0;
    }
  };

  const handleDevLogin = () => {
    setDevError('');
    if (devPassword === DEV_PASSWORD) {
      const devProgress = {
        studentName: 'Dev Admin',
        studentId: 'DEV0000',
        totalXP: 9999,
        badges: ['AI Explorer', 'Prompt Engineer', 'Chatbot Builder'],
        course1Completed: true,
        course1CompletionCode: 'DEV-MODE-FULL-ACCESS',
        course2Unlocked: true,
        course2ModulesCompleted: [1, 2],
        course2PrepareCompleted: [1, 2],
        course2CertificateEarned: false,
        course3Unlocked: false,
        course3Completed: false,
        course4Unlocked: false,
        course4Completed: false,
        course5Unlocked: false,
        course5Completed: false,
        lastActive: new Date().toISOString(),
      };
      localStorage.setItem('swipeup-academy-progress', JSON.stringify(devProgress));
      window.location.href = window.location.origin + '/SwipeUp-AI-Academy/dashboard';
    } else {
      setDevError('Incorrect password');
    }
  };

  const handleSubmit = async () => {
    setError('');
    if (!name.trim()) { setError('Please enter your full name.'); return; }
    const idPattern = /^0[0-9]{6}$/;
    if (!idPattern.test(studentId)) {
      setError('Please check your Student ID. It must start with 0 and be 7 digits long.');
      return;
    }
    setIsSubmitting(true);
    registerStudent(name.trim(), studentId);
    await logProgress({
      studentName: name.trim(),
      studentId,
      event: 'Academy Joined',
      details: 'Student registered for SwipeUp AI Academy',
      totalXP: 0,
    });
    setIsSubmitting(false);
    router.push('/dashboard');
  };

  if (siteMode === 'construction') {
    return (
      <UnderConstructionPage
        onLogoClick={handleLogoClick}
        showDevLogin={showDevLogin}
        devPassword={devPassword}
        setDevPassword={setDevPassword}
        devError={devError}
        handleDevLogin={handleDevLogin}
        setShowDevLogin={setShowDevLogin}
      />
    );
  }

  return (
    <WelcomePageContent
      onLogoClick={handleLogoClick}
      showDevLogin={showDevLogin}
      devPassword={devPassword}
      setDevPassword={setDevPassword}
      devError={devError}
      handleDevLogin={handleDevLogin}
      setShowDevLogin={setShowDevLogin}
      isLoaded={isLoaded}
      name={name}
      setName={setName}
      studentId={studentId}
      setStudentId={setStudentId}
      error={error}
      isSubmitting={isSubmitting}
      handleSubmit={handleSubmit}
    />
  );
}
