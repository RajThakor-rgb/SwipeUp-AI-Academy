'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { cn } from '@/lib/utils';
import { logProgress } from '@/lib/notion';

// MCQ Questions
const mcqQuestions = [
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
  { title: 'Prompt Engineering for Beginners', duration: '15 min', url: 'https://www.youtube.com/watch?v=_ZvnD73m40o' },
  { title: 'How to Write Better AI Prompts for Business', duration: '10 min', url: 'https://www.youtube.com/watch?v=jC4v5AS4RIM' },
  { title: 'ChatGPT Prompt Engineering Course', duration: '20 min', url: 'https://www.youtube.com/watch?v=mBYu5NdD9XU' },
];

type Phase = 'prepare' | 'engage' | 'complete';
type EngageStep = 'iDo' | 'weDo' | 'youDo' | 'final';
type WeDoCard = 1 | 2 | 3;
type YouDoChallenge = 1 | 2 | 3;

export default function Module1Page() {
  const router = useRouter();
  const { progress, isLoaded, addXP, addBadge, completeModule2, completePrepare2, updateProgress } = useAcademyProgress();

  // Phase state
  const [phase, setPhase] = useState<Phase>('prepare');

  // Prepare state
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [mcqScore, setMcqScore] = useState(0);
  const [prepareLoading, setPrepareLoading] = useState(false);

  // Engage state
  const [engageStep, setEngageStep] = useState<EngageStep>('iDo');
  const [iDoWatched, setIDoWatched] = useState(false);
  const [weDoCard, setWeDoCard] = useState<WeDoCard>(1);
  const [weDoCard1Answers, setWeDoCard1Answers] = useState<string[]>([]);
  const [weDoCard2Text, setWeDoCard2Text] = useState('');
  const [weDoCard2Score, setWeDoCard2Score] = useState<number | null>(null);
  const [weDoCard3Text, setWeDoCard3Text] = useState('');
  const [weDoCard3Score, setWeDoCard3Score] = useState<number | null>(null);
  const [weDoCompleted, setWeDoCompleted] = useState(false);

  const [youDoChallenge, setYouDoChallenge] = useState<YouDoChallenge>(1);
  const [youDo1Text, setYouDo1Text] = useState('');
  const [youDo1Score, setYouDo1Score] = useState<number | null>(null);
  const [youDo2Text, setYouDo2Text] = useState('');
  const [youDo2Score, setYouDo2Score] = useState<number | null>(null);
  const [youDo3Text, setYouDo3Text] = useState('');
  const [youDo3Score, setYouDo3Score] = useState<number | null>(null);

  const [finalPrompt, setFinalPrompt] = useState('');
  const [finalExplanation, setFinalExplanation] = useState('');
  const [finalScore, setFinalScore] = useState<number | null>(null);

  const [moduleXP, setModuleXP] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect checks
  useEffect(() => {
    if (isLoaded) {
      if (!progress.studentName) {
        router.push('/');
      } else if (!progress.course2Unlocked) {
        router.push('/dashboard');
      } else if (progress.course2ModulesCompleted.includes(1)) {
        router.push('/course2');
      } else if (progress.course2PrepareCompleted.includes(1)) {
        setPhase('engage');
      }
    }
  }, [isLoaded, progress.studentName, progress.course2Unlocked, progress.course2ModulesCompleted, progress.course2PrepareCompleted, router]);

  // MCQ scoring
  const handleMcqSubmit = async () => {
    let correct = 0;
    mcqQuestions.forEach(q => {
      if (mcqAnswers[q.id] === q.correct) correct++;
    });
    setMcqScore(correct);
    setMcqSubmitted(true);

    if (correct === 5) {
      setPrepareLoading(true);
      completePrepare2(1);
      await logProgress({
        studentName: progress.studentName,
        studentId: progress.studentId,
        event: 'Module 1 Prepare Complete',
        details: 'MCQ score: 5/5',
        totalXP: progress.totalXP,
      });
      setTimeout(() => {
        setPhase('engage');
        setPrepareLoading(false);
      }, 1500);
    }
  };

  const resetMcq = () => {
    setMcqAnswers({});
    setMcqSubmitted(false);
    setMcqScore(0);
  };

  // We Do Card 1 check
  const checkWeDoCard1 = () => {
    const allCorrect = ['No role assigned to the AI', 'No output format specified', 'No brand context provided', 'No target audience mentioned'];
    const isAllSelected = allCorrect.every(opt => weDoCard1Answers.includes(opt));
    if (isAllSelected) {
      addXP(25);
      setModuleXP(prev => prev + 25);
      setWeDoCard(2);
    }
  };

  // Rule-based scoring for We Do Card 2
  const checkWeDoCard2 = () => {
    const text = weDoCard2Text.toLowerCase();
    let score = 0;
    if (text.includes('act as') || text.includes('you are') || text.includes('as a')) score++;
    if (text.includes('instagram') || text.includes('social media') || text.includes('post')) score++;
    if (text.includes('velara') || text.includes('brand') || text.includes('fashion') || text.includes('sustainable')) score++;
    if (text.includes('caption') || text.includes('format') || text.includes('characters') || text.includes('words')) score++;
    if (weDoCard2Text.split(/\s+/).length >= 30) score++;
    setWeDoCard2Score(score);
    addXP(25);
    setModuleXP(prev => prev + 25);
    setTimeout(() => setWeDoCard(3), 2000);
  };

  // Rule-based scoring for We Do Card 3
  const checkWeDoCard3 = () => {
    const text = weDoCard3Text.toLowerCase();
    let score = 0;
    if (text.includes('customer') || text.includes('complaint') || text.includes('delivery')) score++;
    if (text.includes('empath') || text.includes('apolog') || text.includes('professional')) score++;
    if (text.includes('email') || text.includes('response') || text.includes('reply')) score++;
    if (text.includes('tone') || text.includes('formal') || text.includes('brand voice')) score++;
    if (weDoCard3Text.split(/\s+/).length >= 40) score++;
    setWeDoCard3Score(score);
    addXP(50);
    setModuleXP(prev => prev + 50);
    setTimeout(() => {
      setWeDoCompleted(true);
      setEngageStep('youDo');
    }, 2000);
  };

  // You Do Challenge scoring
  const checkYouDo1 = () => {
    const text = youDo1Text.toLowerCase();
    let score = 0;
    if (text.includes('act as') || text.includes('you are') || text.includes('as a')) score++;
    if (text.includes('velara') || text.includes('midnight edit')) score++;
    if (text.includes('150') || text.includes('word count') || text.includes('length')) score++;
    if (text.includes('sophisticated') || text.includes('sustainable') || text.includes('british') || text.includes('elegant')) score++;
    if (text.includes('description') || text.includes('paragraph') || text.includes('copy')) score++;

    setYouDo1Score(score);
    const earned = score >= 4 ? 100 : score >= 2 ? 50 : 0;
    addXP(earned);
    setModuleXP(prev => prev + earned);
    setTimeout(() => setYouDoChallenge(2), 2000);
  };

  const checkYouDo2 = () => {
    const text = youDo2Text.toLowerCase();
    let score = 0;
    if (text.includes('5') || text.includes('five')) score++;
    if (text.includes('150') || text.includes('character')) score++;
    if (text.includes('emoji')) score++;
    if (text.includes('hashtag')) score++;
    if (youDo2Text.split(/\s+/).length >= 50) score++;

    setYouDo2Score(score);
    const earned = score >= 4 ? 150 : score >= 2 ? 75 : 0;
    addXP(earned);
    setModuleXP(prev => prev + earned);
    setTimeout(() => setYouDoChallenge(3), 2000);
  };

  const checkYouDo3 = () => {
    const text = youDo3Text.toLowerCase();
    let score = 0;
    if (text.includes('empath') || text.includes('apolog')) score++;
    if (text.includes('10%') || text.includes('discount') || text.includes('compensation')) score++;
    if (text.includes('brand voice') || text.includes('tone') || text.includes('sophisticated')) score++;
    if (text.includes('template') || text.includes('personal') || text.includes('generic')) score++;
    if (youDo3Text.split(/\s+/).length >= 60) score++;

    setYouDo3Score(score);
    const earned = score >= 4 ? 200 : score >= 2 ? 100 : 0;
    addXP(earned);
    setModuleXP(prev => prev + earned);
    setTimeout(() => setEngageStep('final'), 2000);
  };

  // Final Challenge scoring
  const checkFinalChallenge = async () => {
    setIsSubmitting(true);
    const promptText = finalPrompt.toLowerCase();
    const explainText = finalExplanation.toLowerCase();

    let promptScore = 0;
    if (promptText.includes('act as') || promptText.includes('you are') || promptText.includes('as a')) promptScore++;
    if (promptText.includes('board') || promptText.includes('director') || promptText.includes('stakeholder') || promptText.includes('executive')) promptScore++;
    if (promptText.includes('sales') || promptText.includes('revenue') || promptText.includes('performance') || promptText.includes('update')) promptScore++;
    if (promptText.includes('bullet') || promptText.includes('section') || promptText.includes('summary') || promptText.includes('format')) promptScore++;
    if (finalPrompt.split(/\s+/).length >= 40) promptScore++;

    let explainScore = 0;
    if (finalExplanation.split(/\s+/).length >= 30) explainScore++;
    if (explainText.includes('missing') || explainText.includes('lack') || explainText.includes('vague') || explainText.includes('unclear')) explainScore++;
    if (explainText.includes('context') || explainText.includes('specific') || explainText.includes('detail') || explainText.includes('audience')) explainScore++;

    const totalScore = promptScore + explainScore;
    setFinalScore(totalScore);

    const earned = totalScore >= 6 ? 250 : totalScore >= 4 ? 150 : 75;
    const newXP = moduleXP + earned;
    addXP(earned);
    addBadge('Prompt Specialist');
    completeModule2(1);

    await logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'Module 1 Complete',
      details: `Total XP earned in module: ${newXP}`,
      totalXP: progress.totalXP + earned,
    });

    setIsSubmitting(false);
    setPhase('complete');
  };

  if (!isLoaded || !progress.studentName || !progress.course2Unlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-gradient">
      {/* Header */}
      <header className="bg-secondary/50 border-b border-border sticky top-0 z-40 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button onClick={() => router.push('/course2')} className="text-slate-400 hover:text-white transition-colors">← Back</button>
          <div className="flex-1">
            <h1 className="font-bold text-white">Module 1: Prompt Engineering</h1>
            <p className="text-xs text-slate-400">Course 2: Productivity and Organisation</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">XP</p>
            <p className="text-gold font-bold">{progress.totalXP + moduleXP}</p>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* PREPARE PHASE */}
        {phase === 'prepare' && (
          <div className="animate-fade-in">
            <div className="bg-gold/10 border border-gold/30 rounded-xl p-4 mb-8">
              <p className="text-gold font-medium">Before you can access the simulation you need to complete the Prepare phase. This should take approximately 30 to 45 minutes.</p>
            </div>

            {/* Reading List */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Required Reading</h2>
              <div className="space-y-3">
                <div className="bg-secondary/30 border border-border rounded-lg p-4">
                  <p className="text-white font-medium">Kaplan, A. and Haenlein, M. (2019) 'Siri, Siri in my hand', Business Horizons, 62(1), pp. 15-25</p>
                  <p className="text-sm text-slate-400 mt-1">Available via ULaw library</p>
                </div>
                <div className="bg-secondary/30 border border-border rounded-lg p-4">
                  <p className="text-white font-medium">Haenlein, M. and Kaplan, A. (2019) 'A brief history of artificial intelligence', California Management Review, 61(4), pp. 5-14</p>
                  <p className="text-sm text-slate-400 mt-1">Available via ULaw library</p>
                </div>
              </div>
            </section>

            {/* Video Resources */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Watch Before Your Session</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                {videos.map((video, i) => (
                  <a key={i} href={video.url} target="_blank" rel="noopener noreferrer" className="bg-secondary/30 border border-border rounded-lg p-4 hover:border-gold transition-colors card-hover">
                    <p className="text-white font-medium mb-1">{video.title}</p>
                    <p className="text-sm text-slate-400">{video.duration}</p>
                    <span className="inline-block mt-2 text-xs text-gold">Watch →</span>
                  </a>
                ))}
              </div>
            </section>

            {/* MCQ Gate */}
            <section className="mb-8">
              <h2 className="text-xl font-bold text-white mb-2">Check Your Understanding</h2>
              <p className="text-slate-400 mb-6">Answer all 5 questions correctly to unlock the simulation. You can retry as many times as needed.</p>

              <div className="space-y-6">
                {mcqQuestions.map((q, idx) => (
                  <div key={q.id} className="bg-secondary/30 border border-border rounded-xl p-5">
                    <p className="text-white font-medium mb-3">{idx + 1}. {q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => (
                        <label key={optIdx} className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          mcqAnswers[q.id] === optIdx
                            ? "bg-gold/20 border-gold"
                            : "bg-background border-border hover:border-gold/50"
                        )}>
                          <input
                            type="radio"
                            name={q.id}
                            checked={mcqAnswers[q.id] === optIdx}
                            onChange={() => !mcqSubmitted && setMcqAnswers(prev => ({ ...prev, [q.id]: optIdx }))}
                            className="text-gold"
                            disabled={mcqSubmitted}
                          />
                          <span className="text-slate-200">{opt}</span>
                          {mcqSubmitted && optIdx === q.correct && (
                            <span className="ml-auto text-green-400 text-sm">✓ Correct</span>
                          )}
                          {mcqSubmitted && mcqAnswers[q.id] === optIdx && optIdx !== q.correct && (
                            <span className="ml-auto text-red-400 text-sm">✗ Incorrect</span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* MCQ Results */}
              {mcqSubmitted && (
                <div className={cn(
                  "mt-6 p-4 rounded-xl",
                  mcqScore === 5 ? "bg-green-900/30 border border-green-500/50" :
                  mcqScore >= 4 ? "bg-gold/10 border border-gold/30" :
                  "bg-red-900/30 border border-red-500/50"
                )}>
                  <p className="font-medium text-white mb-2">
                    {mcqScore === 5 && "Excellent preparation. The simulation is now unlocked."}
                    {mcqScore === 4 && "Almost there. One more try."}
                    {mcqScore <= 3 && "Some of the material needs another look. Please revisit the reading and videos above before trying again."}
                  </p>
                  <p className="text-slate-300">Score: {mcqScore}/5</p>
                  {mcqScore < 5 && (
                    <button onClick={resetMcq} className="mt-3 px-4 py-2 bg-gold text-navy rounded-lg font-medium hover:bg-gold-light transition-colors">
                      Try Again
                    </button>
                  )}
                </div>
              )}

              {!mcqSubmitted && (
                <button
                  onClick={handleMcqSubmit}
                  disabled={Object.keys(mcqAnswers).length < 5 || prepareLoading}
                  className="mt-6 px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {prepareLoading ? 'Unlocking...' : 'Submit Answers'}
                </button>
              )}
            </section>
          </div>
        )}

        {/* ENGAGE PHASE */}
        {phase === 'engage' && (
          <div className="animate-fade-in">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 text-green-400">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500 text-white">✓</span>
                <span className="text-sm font-medium">Prepare</span>
              </div>
              <div className="w-8 h-0.5 bg-green-500" />
              <div className={cn("flex items-center gap-2", engageStep !== 'final' || finalScore === null ? "text-gold" : "text-slate-500")}>
                <span className={cn("w-8 h-8 rounded-full flex items-center justify-center", engageStep ? "bg-gold text-navy" : "bg-slate-600 text-slate-400")}>2</span>
                <span className="text-sm font-medium">Engage</span>
              </div>
              <div className="w-8 h-0.5 bg-slate-600" />
              <div className="flex items-center gap-2 text-slate-500">
                <span className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-600 text-slate-400">3</span>
                <span className="text-sm font-medium">Complete</span>
              </div>
            </div>

            {/* I Do Section */}
            {engageStep === 'iDo' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2">I Do — Watch First</h2>
                <p className="text-slate-400 mb-6">Watch this short walkthrough before attempting the challenges. It shows exactly how Velara's problem plays out in practice.</p>

                {/* Video Placeholder */}
                <div className="bg-navy border-2 border-gold/30 rounded-xl aspect-video flex flex-col items-center justify-center mb-6">
                  <p className="text-gold text-xl font-bold mb-2">Module 1: Prompt Engineering Walkthrough</p>
                  <p className="text-slate-400">Loom video will be embedded here</p>
                  <p className="text-sm text-slate-500 mt-2">— Coming Soon —</p>
                </div>

                {/* Checkbox */}
                <label className="flex items-center gap-3 p-4 bg-secondary/30 border border-border rounded-xl cursor-pointer hover:border-gold transition-colors">
                  <input
                    type="checkbox"
                    checked={iDoWatched}
                    onChange={(e) => setIDoWatched(e.target.checked)}
                    className="w-5 h-5 text-gold"
                  />
                  <span className="text-white">I have watched the walkthrough video</span>
                </label>

                {iDoWatched && (
                  <button
                    onClick={() => setEngageStep('weDo')}
                    className="mt-6 px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors"
                  >
                    Continue to We Do →
                  </button>
                )}
              </div>
            )}

            {/* We Do Section */}
            {engageStep === 'weDo' && !weDoCompleted && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2">We Do — Guided Practice</h2>
                <p className="text-slate-400 mb-6">Velara's marketing team wrote these three prompts last week. Work through each one and identify what is wrong.</p>

                {/* Card 1 */}
                {weDoCard === 1 && (
                  <div className="bg-secondary/30 border border-border rounded-xl p-6">
                    <p className="text-xs text-gold uppercase tracking-wider mb-2">Velara Team Prompt</p>
                    <div className="bg-background border border-border rounded-lg p-4 mb-6">
                      <p className="text-slate-200 font-mono">"Write about our summer dress"</p>
                    </div>
                    <p className="text-white font-medium mb-4">What is missing from this prompt? (Select all that apply)</p>

                    <div className="space-y-2 mb-6">
                      {['No role assigned to the AI', 'No output format specified', 'No brand context provided', 'No target audience mentioned'].map((opt) => (
                        <label key={opt} className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          weDoCard1Answers.includes(opt)
                            ? "bg-gold/20 border-gold"
                            : "bg-background border-border hover:border-gold/50"
                        )}>
                          <input
                            type="checkbox"
                            checked={weDoCard1Answers.includes(opt)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setWeDoCard1Answers([...weDoCard1Answers, opt]);
                              } else {
                                setWeDoCard1Answers(weDoCard1Answers.filter(a => a !== opt));
                              }
                            }}
                          />
                          <span className="text-slate-200">{opt}</span>
                        </label>
                      ))}
                    </div>

                    <button
                      onClick={checkWeDoCard1}
                      disabled={weDoCard1Answers.length === 0}
                      className="px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      Submit
                    </button>
                  </div>
                )}

                {/* Card 2 */}
                {weDoCard === 2 && (
                  <div className="bg-secondary/30 border border-border rounded-xl p-6">
                    <p className="text-xs text-gold uppercase tracking-wider mb-2">Velara Team Prompt</p>
                    <div className="bg-background border border-border rounded-lg p-4 mb-6">
                      <p className="text-slate-200 font-mono">"Make our Instagram post good"</p>
                    </div>
                    <p className="text-white font-medium mb-4">Rewrite this prompt to make it effective. Include a role, context, format, and goal.</p>

                    <textarea
                      value={weDoCard2Text}
                      onChange={(e) => setWeDoCard2Text(e.target.value)}
                      placeholder="Write your improved prompt here..."
                      className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {weDoCard2Score !== null && (
                      <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                        <p className="text-gold font-medium">Score: {weDoCard2Score}/5</p>
                        <p className="text-sm text-slate-300 mt-1">+25 XP earned (practice round)</p>
                      </div>
                    )}

                    <button
                      onClick={checkWeDoCard2}
                      disabled={weDoCard2Text.length < 10 || weDoCard2Score !== null}
                      className="mt-4 px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      Check My Prompt
                    </button>
                  </div>
                )}

                {/* Card 3 */}
                {weDoCard === 3 && (
                  <div className="bg-secondary/30 border border-border rounded-xl p-6">
                    <p className="text-xs text-gold uppercase tracking-wider mb-2">Velara Team Prompt</p>
                    <div className="bg-background border border-border rounded-lg p-4 mb-6">
                      <p className="text-slate-200 font-mono">"Help with email"</p>
                    </div>
                    <p className="text-white font-medium mb-4">Sarah Chen needs to respond to a customer complaint about a late delivery. Write a complete prompt that would get a professional, empathetic response.</p>

                    <textarea
                      value={weDoCard3Text}
                      onChange={(e) => setWeDoCard3Text(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {weDoCard3Score !== null && (
                      <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                        <p className="text-gold font-medium">Score: {weDoCard3Score}/5</p>
                        <p className="text-sm text-slate-300 mt-1">+50 XP earned</p>
                      </div>
                    )}

                    <button
                      onClick={checkWeDoCard3}
                      disabled={weDoCard3Text.length < 10 || weDoCard3Score !== null}
                      className="mt-4 px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      Check My Prompt
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* You Do Section */}
            {engageStep === 'youDo' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2">You Do — Solo Challenges</h2>
                <p className="text-slate-400 mb-6">Three challenges of increasing difficulty. No guided help from here.</p>

                {/* Challenge 1 */}
                {youDoChallenge === 1 && (
                  <div className="bg-secondary/30 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-green-600/30 text-green-400 rounded text-xs font-medium">Easy</span>
                      <span className="text-gold font-medium">100 XP</span>
                    </div>
                    <p className="text-white mb-4">Velara is launching a new sustainable evening wear collection called <strong>The Midnight Edit</strong>. Write a prompt that gets an AI to produce a 150-word product description in Velara's brand voice: sophisticated, sustainable, and British.</p>

                    <textarea
                      value={youDo1Text}
                      onChange={(e) => setYouDo1Text(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {youDo1Score !== null && (
                      <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                        <p className="text-gold font-medium">Score: {youDo1Score}/5</p>
                        <p className="text-sm text-slate-300 mt-1">+{youDo1Score >= 4 ? 100 : youDo1Score >= 2 ? 50 : 0} XP earned</p>
                      </div>
                    )}

                    <button
                      onClick={checkYouDo1}
                      disabled={youDo1Text.length < 10 || youDo1Score !== null}
                      className="mt-4 px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      Submit Challenge 1
                    </button>
                  </div>
                )}

                {/* Challenge 2 */}
                {youDoChallenge === 2 && (
                  <div className="bg-secondary/30 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-gold/30 text-gold rounded text-xs font-medium">Medium</span>
                      <span className="text-gold font-medium">150 XP</span>
                    </div>
                    <p className="text-white mb-4">Velara's social media team needs to produce 5 Instagram captions every Monday. Write a prompt that generates all 5 in one go. Each caption must be under 150 characters, include one relevant emoji, and end with a branded hashtag.</p>

                    <textarea
                      value={youDo2Text}
                      onChange={(e) => setYouDo2Text(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {youDo2Score !== null && (
                      <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                        <p className="text-gold font-medium">Score: {youDo2Score}/5</p>
                        <p className="text-sm text-slate-300 mt-1">+{youDo2Score >= 4 ? 150 : youDo2Score >= 2 ? 75 : 0} XP earned</p>
                      </div>
                    )}

                    <button
                      onClick={checkYouDo2}
                      disabled={youDo2Text.length < 10 || youDo2Score !== null}
                      className="mt-4 px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      Submit Challenge 2
                    </button>
                  </div>
                )}

                {/* Challenge 3 */}
                {youDoChallenge === 3 && (
                  <div className="bg-secondary/30 border border-border rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2 py-1 bg-red-600/30 text-red-400 rounded text-xs font-medium">Hard</span>
                      <span className="text-gold font-medium">200 XP</span>
                    </div>
                    <p className="text-white mb-4">Velara receives approximately 30 identical late delivery complaints every week. The customer service team copies and pastes the same response. Write a prompt that generates a response which is empathetic, offers a 10% discount code, maintains Velara's sophisticated brand voice, and does not sound like a template.</p>

                    <textarea
                      value={youDo3Text}
                      onChange={(e) => setYouDo3Text(e.target.value)}
                      placeholder="Write your prompt here..."
                      className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                    />

                    {youDo3Score !== null && (
                      <div className="mt-4 p-3 bg-gold/10 border border-gold/30 rounded-lg">
                        <p className="text-gold font-medium">Score: {youDo3Score}/5</p>
                        <p className="text-sm text-slate-300 mt-1">+{youDo3Score >= 4 ? 200 : youDo3Score >= 2 ? 100 : 0} XP earned</p>
                      </div>
                    )}

                    <button
                      onClick={checkYouDo3}
                      disabled={youDo3Text.length < 10 || youDo3Score !== null}
                      className="mt-4 px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50"
                    >
                      Submit Challenge 3
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Final Challenge */}
            {engageStep === 'final' && (
              <div className="animate-fade-in">
                <h2 className="text-2xl font-bold text-white mb-2">Final Challenge</h2>
                <p className="text-slate-400 mb-6">No hints. Show what you've learned.</p>

                <div className="bg-secondary/30 border border-border rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 bg-purple-600/30 text-purple-400 rounded text-xs font-medium">Final</span>
                    <span className="text-gold font-medium">250 XP</span>
                  </div>

                  <p className="text-white mb-4">Sarah Chen has forwarded you this prompt her PA wrote this morning: <strong>"Write email"</strong></p>

                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-white font-medium mb-2">Part 1: Rewrite this prompt properly so it produces a professional weekly sales update email for Velara's board of directors.</label>
                      <textarea
                        value={finalPrompt}
                        onChange={(e) => setFinalPrompt(e.target.value)}
                        placeholder="Write your rewritten prompt here..."
                        className="w-full h-32 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                      />
                    </div>

                    <div>
                      <label className="block text-white font-medium mb-2">Part 2: In two to three sentences, explain what was wrong with the original prompt and why your version is better.</label>
                      <textarea
                        value={finalExplanation}
                        onChange={(e) => setFinalExplanation(e.target.value)}
                        placeholder="Write your explanation here..."
                        className="w-full h-24 px-4 py-3 bg-background border border-border rounded-lg text-white placeholder:text-slate-500 resize-none focus:border-gold"
                      />
                    </div>
                  </div>

                  {finalScore !== null && (
                    <div className="p-4 bg-gold/10 border border-gold/30 rounded-lg mb-4">
                      <p className="text-gold font-medium text-lg">Total Score: {finalScore}/8</p>
                      <p className="text-sm text-slate-300 mt-1">+{finalScore >= 6 ? 250 : finalScore >= 4 ? 150 : 75} XP earned</p>
                    </div>
                  )}

                  <button
                    onClick={checkFinalChallenge}
                    disabled={(finalPrompt.length < 20 || finalExplanation.length < 20) && finalScore === null}
                    className="px-6 py-3 bg-gold text-navy rounded-lg font-semibold hover:bg-gold-light transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting && <span className="spinner w-5 h-5" />}
                    Submit Final Challenge
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* COMPLETION SCREEN */}
        {phase === 'complete' && (
          <div className="animate-fade-in text-center">
            <div className="bg-secondary/30 border border-gold/50 rounded-2xl p-8 max-w-2xl mx-auto">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-bold text-white mb-4">Module 1 Complete</h2>

              {/* Badge */}
              <div className="inline-block badge-gold px-6 py-3 rounded-full text-lg font-bold mb-6">
                🏅 Prompt Specialist
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-background rounded-lg p-4">
                  <p className="text-slate-400 text-sm">XP Earned This Module</p>
                  <p className="text-2xl font-bold text-gold">{moduleXP}</p>
                </div>
                <div className="bg-background rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total XP</p>
                  <p className="text-2xl font-bold text-white">{progress.totalXP + moduleXP}</p>
                </div>
              </div>

              {/* Academic Reference */}
              <div className="text-left bg-background/50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gold font-medium mb-2">Academic Reference</p>
                <p className="text-sm text-slate-300 mb-2">Kaplan, A. and Haenlein, M. (2019) 'Siri, Siri in my hand: Who's the fairest in the land?', Business Horizons, 62(1), pp. 15-25.</p>
                <p className="text-sm text-slate-400">This research establishes how AI systems simulate human cognitive functions—the foundation of effective prompt engineering you just practiced.</p>
              </div>

              {/* Ethics Checkpoint */}
              <div className="text-left bg-red-900/20 border border-red-500/30 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-400 font-medium mb-2">Ethics Checkpoint</p>
                <p className="text-sm text-slate-300">Before Velara deploys AI-generated content publicly — what disclosure obligations apply? Consider the ASA guidelines on AI-generated advertising and ULaw AI Policy (2023).</p>
              </div>

              <button
                onClick={() => router.push('/course2')}
                className="px-8 py-4 bg-gold text-navy rounded-lg font-semibold text-lg hover:bg-gold-light transition-colors"
              >
                Next Module →
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
