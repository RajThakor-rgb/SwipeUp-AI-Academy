'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Types
type Phase = 'prepare' | 'engage' | 'consolidate';
type EngageStage = 'ido' | 'wedo' | 'youdo' | 'final';
type ToolChoice = 'tidio' | 'botpress' | 'landbot';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'checkbox' | 'text' | 'textarea' | 'mcq' | 'scenario-test';
  completed: boolean;
  xp: number;
  earnedXp: number;
  answer?: string;
  options?: { id: string; label: string }[];
  selectedOption?: string;
  rubric?: { criteria: string; maxPoints: number }[];
  reflection?: string;
}

interface VideoProgress {
  videoId: string;
  watched: boolean;
  progress: number;
}

interface MCQQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

// SCOPE Framework Data
const SCOPE_FRAMEWORK = {
  name: 'SCOPE',
  description: 'A strategic framework for designing effective AI chatbots',
  elements: [
    {
      letter: 'S',
      name: 'Scenario',
      description: 'Define the specific use case and context where your chatbot will operate. What situations will it handle? What problems will it solve for users?',
      questions: [
        'What customer problems will this chatbot solve?',
        'What situations will the chatbot handle vs. escalate?',
        'What industry/domain context applies?'
      ],
      example: 'An e-commerce chatbot handling order tracking, returns, and product inquiries for a fashion retail brand'
    },
    {
      letter: 'C',
      name: 'Channel',
      description: 'Identify where and how users will interact with your chatbot. Consider platform constraints, user expectations, and integration requirements.',
      questions: [
        'Which platform(s) will host the chatbot?',
        'What are the channel-specific constraints?',
        'How does it integrate with existing systems?'
      ],
      example: 'Website widget (desktop & mobile), WhatsApp Business, and Instagram Messenger integration'
    },
    {
      letter: 'O',
      name: 'Objective',
      description: 'Set clear, measurable goals for your chatbot. What outcomes define success? How will you measure performance and impact?',
      questions: [
        'What is the primary business goal?',
        'How will success be measured (KPIs)?',
        'What conversion or resolution targets apply?'
      ],
      example: 'Reduce support tickets by 40%, achieve 85% customer satisfaction, resolve 70% of queries without human intervention'
    },
    {
      letter: 'P',
      name: 'Persona',
      description: 'Design your chatbot\'s personality, tone, and communication style. This creates consistent, engaging user experiences.',
      questions: [
        'What personality and tone should the chatbot have?',
        'How should it greet and address users?',
        'What language style fits the brand voice?'
      ],
      example: 'Friendly, helpful, fashion-forward assistant named "Style" that uses first names, offers styling tips, and represents the brand\'s youthful image'
    },
    {
      letter: 'E',
      name: 'Escalation',
      description: 'Plan how and when to transfer users to human agents. Clear escalation paths ensure complex issues get proper attention.',
      questions: [
        'When should the chatbot escalate to humans?',
        'What triggers an escalation?',
        'How is the handoff communicated?'
      ],
      example: 'Escalate after 3 failed attempts, when sentiment turns negative, for payment issues, or when users specifically request human help'
    }
  ]
};

// Intel Files Data
const INTEL_FILES = [
  {
    id: 'daugherty',
    title: 'Daugherty & Wilson - Customer Service Intelligence Report',
    type: 'PDF',
    pages: 12,
    summary: 'Industry analysis of AI chatbot adoption in customer service. Key findings: 67% of customers prefer chatbots for quick queries, average resolution time reduced by 40%, and customer satisfaction rates above 80% for well-designed bots.',
    keyPoints: [
      'Customers value speed and 24/7 availability over human interaction for simple queries',
      'Successful chatbots have clear escalation paths to human agents',
      'Personalization increases customer satisfaction by 23%',
      'Average cost savings of 30% on customer service operations'
    ]
  },
  {
    id: 'velara',
    title: 'Velara Hotels - Chatbot Briefing Document',
    type: 'Internal Memo',
    pages: 4,
    summary: 'Velara Hotels wants to implement a customer service chatbot for their booking platform. They need help designing a chatbot that handles common guest inquiries while maintaining their luxury brand image.',
    keyPoints: [
      'Target: Reduce front desk call volume by 50%',
      'Must handle: booking modifications, amenity questions, local recommendations',
      'Brand voice: Professional, warm, attentive - reflecting 5-star hospitality',
      'Integration needed with existing property management system',
      'Must escalate VIP guest queries to concierge immediately'
    ]
  }
];

// Videos Data
const VIDEOS = [
  {
    id: 'intro-chatbots',
    title: 'Introduction to AI Chatbots in Business',
    duration: '8:24',
    description: 'Overview of how businesses are using AI chatbots to transform customer service, sales, and operations.',
    keyTakeaways: [
      'Chatbots handle 80% of routine customer queries',
      'ROI typically achieved within 6-12 months',
      'Best practices for chatbot deployment'
    ]
  },
  {
    id: 'scope-explained',
    title: 'The SCOPE Framework Explained',
    duration: '12:15',
    description: 'Deep dive into each element of the SCOPE framework with real-world examples and case studies.',
    keyTakeaways: [
      'Scenario defines your chatbot\'s purpose',
      'Channel affects design decisions',
      'Objectives must be measurable',
      'Persona creates brand consistency',
      'Escalation ensures customer satisfaction'
    ]
  },
  {
    id: 'tidio-walkthrough',
    title: 'Tidio Platform Overview',
    duration: '6:42',
    description: 'Quick tour of Tidio\'s interface, features, and how to navigate the chatbot builder.',
    keyTakeaways: [
      'Drag-and-drop conversation builder',
      'AI response configuration',
      'Integration options available',
      'Analytics dashboard overview'
    ]
  }
];

// MCQ Questions for Prepare Phase
const MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: 'mcq1',
    question: 'In the SCOPE framework, what does the "S" stand for?',
    options: ['Strategy', 'Scenario', 'System', 'Service'],
    correctAnswer: 1,
    explanation: 'The "S" in SCOPE stands for Scenario - defining the specific use case and context where your chatbot will operate.'
  },
  {
    id: 'mcq2',
    question: 'Which element of SCOPE deals with when to transfer users to human agents?',
    options: ['Scenario', 'Channel', 'Objective', 'Escalation'],
    correctAnswer: 3,
    explanation: 'Escalation in SCOPE specifically addresses how and when to transfer users to human agents for complex issues.'
  },
  {
    id: 'mcq3',
    question: 'A luxury hotel chatbot should have which type of persona?',
    options: [
      'Casual and slang-heavy to appeal to young travelers',
      'Professional, warm, and attentive reflecting 5-star hospitality',
      'Minimal personality to stay neutral',
      'Humorous and entertaining to keep guests engaged'
    ],
    correctAnswer: 1,
    explanation: 'The persona should match the brand - a luxury hotel needs a professional, warm, and attentive persona that reflects their 5-star hospitality standards.'
  },
  {
    id: 'mcq4',
    question: 'What is a key success metric mentioned in the Daugherty & Wilson report?',
    options: [
      'Number of chatbot messages sent',
      'Time users spend chatting with the bot',
      'Customer satisfaction rates above 80% for well-designed bots',
      'Number of features used'
    ],
    correctAnswer: 2,
    explanation: 'The report found that well-designed chatbots achieve customer satisfaction rates above 80%.'
  },
  {
    id: 'mcq5',
    question: 'According to SCOPE, when should a chatbot escalate to a human agent?',
    options: [
      'Only when the chatbot crashes',
      'Never - chatbots should handle everything',
      'After failed attempts, negative sentiment, or user request',
      'Only during business hours'
    ],
    correctAnswer: 2,
    explanation: 'SCOPE recommends escalating after multiple failed attempts, when sentiment turns negative, for complex issues, or when users specifically request human help.'
  }
];

// I Do Example System Prompt
const IDO_EXAMPLE_PROMPT = `You are "Style", a friendly fashion assistant for TrendShop, an online fashion retailer.

PERSONALITY:
- Warm, enthusiastic, and fashion-forward
- Use the customer's name when available
- Keep responses concise but helpful
- Offer styling tips when relevant

CAPABILITIES:
- Help customers find products and check sizes
- Track orders and handle basic returns
- Answer questions about shipping, payments, and policies
- Provide personalized product recommendations

LIMITATIONS:
- Cannot process payments directly
- Cannot access accounts without verification
- Cannot modify shipped orders

ESCALATION TRIGGERS:
- Customer requests human agent
- Issue not resolved after 3 attempts
- Customer expresses frustration or anger
- Complex return or refund issues
- VIP customer queries

Always end with a helpful question or offer to assist further.`;

// We Do Tasks
const WEDO_TASKS: Task[] = [
  {
    id: 'wedo-1',
    title: 'Create Your Tidio Account',
    description: 'Go to tidio.com and create a free account. Verify your email and complete the initial setup wizard.',
    type: 'checkbox',
    completed: false,
    xp: 10,
    earnedXp: 0
  },
  {
    id: 'wedo-2',
    title: 'Write Your SCOPE System Prompt',
    description: 'Using the SCOPE framework, write a system prompt for Velara Hotels chatbot. Your prompt should address all 5 SCOPE elements.',
    type: 'textarea',
    completed: false,
    xp: 30,
    earnedXp: 0,
    rubric: [
      { criteria: 'Scenario: Clear use case defined', maxPoints: 6 },
      { criteria: 'Channel: Platform considerations addressed', maxPoints: 6 },
      { criteria: 'Objective: Measurable goals included', maxPoints: 6 },
      { criteria: 'Persona: Brand-aligned personality defined', maxPoints: 6 },
      { criteria: 'Escalation: Clear triggers and handoff process', maxPoints: 6 }
    ]
  },
  {
    id: 'wedo-3',
    title: 'Test 3 Customer Scenarios',
    description: 'Use your chatbot to test these three scenarios. Record the chatbot\'s response quality.',
    type: 'scenario-test',
    completed: false,
    xp: 30,
    earnedXp: 0,
    options: [
      { id: 'scenario1', label: 'Guest asks about late checkout' },
      { id: 'scenario2', label: 'Guest wants to modify booking dates' },
      { id: 'scenario3', label: 'Guest complains about room temperature' }
    ]
  }
];

// You Do Tasks
const YOUDO_TASKS: Task[] = [
  {
    id: 'youdo-1',
    title: 'Handle a Difficult Customer',
    description: 'Test your chatbot with this challenging scenario: A guest is upset because their room wasn\'t ready at check-in time and they missed an important meeting. Does your chatbot handle this appropriately?',
    type: 'textarea',
    completed: false,
    xp: 25,
    earnedXp: 0,
    rubric: [
      { criteria: 'Acknowledges customer frustration', maxPoints: 5 },
      { criteria: 'Offers apology/empathy', maxPoints: 5 },
      { criteria: 'Provides solution or escalation', maxPoints: 5 },
      { criteria: 'Maintains professional tone', maxPoints: 5 },
      { criteria: 'Appropriate escalation decision', maxPoints: 5 }
    ]
  },
  {
    id: 'youdo-2',
    title: 'Create Escalation Scripts',
    description: 'Write 3 different escalation messages your chatbot could use depending on the situation. Each should be contextually appropriate.',
    type: 'textarea',
    completed: false,
    xp: 20,
    earnedXp: 0,
    rubric: [
      { criteria: 'Three distinct escalation contexts', maxPoints: 5 },
      { criteria: 'Clear handoff messaging', maxPoints: 5 },
      { criteria: 'Sets appropriate expectations', maxPoints: 5 },
      { criteria: 'Maintains brand voice', maxPoints: 5 }
    ]
  },
  {
    id: 'youdo-3',
    title: 'Document Your Live Chatbot',
    description: 'Take a screenshot of your working chatbot and write a brief reflection on what works well and what could be improved.',
    type: 'textarea',
    completed: false,
    xp: 25,
    earnedXp: 0,
    rubric: [
      { criteria: 'Screenshot included', maxPoints: 5 },
      { criteria: 'Identifies strengths', maxPoints: 5 },
      { criteria: 'Identifies areas for improvement', maxPoints: 5 },
      { criteria: 'Shows critical thinking', maxPoints: 10 }
    ]
  }
];

// Test Scenarios for We Do
const TEST_SCENARIOS = [
  {
    id: 'scenario1',
    title: 'Late Checkout Request',
    prompt: 'Hi, I\'d like to request a late checkout for tomorrow. My flight isn\'t until 6pm.',
    evaluationCriteria: [
      'Acknowledges the request politely',
      'Provides checkout policy information',
      'Offers solution or takes action',
      'Maintains luxury hotel persona'
    ]
  },
  {
    id: 'scenario2',
    title: 'Booking Modification',
    prompt: 'I need to change my reservation from March 15-17 to March 16-18. Is that possible?',
    evaluationCriteria: [
      'Confirms understanding of request',
      'Checks availability (simulated)',
      'Provides clear options',
      'Handles date change appropriately'
    ]
  },
  {
    id: 'scenario3',
    title: 'Room Temperature Complaint',
    prompt: 'My room is freezing! The AC won\'t turn off and I\'ve been trying to sleep for an hour!',
    evaluationCriteria: [
      'Shows empathy for discomfort',
      'Apologizes appropriately',
      'Provides immediate solution',
      'Offers compensation if appropriate',
      'Escalates if needed'
    ]
  }
];

// Tool Options
const TOOL_OPTIONS = [
  {
    id: 'tidio' as ToolChoice,
    name: 'Tidio',
    recommended: true,
    description: 'User-friendly chatbot platform with AI capabilities. Perfect for beginners.',
    features: ['Drag-and-drop builder', 'AI responses', 'Multi-channel support', 'Free tier available'],
    timeToSetup: '15 minutes',
    difficulty: 'Beginner'
  },
  {
    id: 'botpress' as ToolChoice,
    name: 'Botpress',
    recommended: false,
    description: 'Advanced chatbot framework with powerful NLU. More technical but highly customizable.',
    features: ['Visual flow editor', 'Built-in NLU', 'Custom code integration', 'Self-hosted option'],
    timeToSetup: '45 minutes',
    difficulty: 'Advanced'
  },
  {
    id: 'landbot' as ToolChoice,
    name: 'Landbot',
    recommended: false,
    description: 'Visual conversational builder focused on marketing and lead generation.',
    features: ['No-code builder', 'Marketing templates', 'A/B testing', 'Analytics dashboard'],
    timeToSetup: '20 minutes',
    difficulty: 'Intermediate'
  }
];

export default function Module2Page() {
  // State
  const [currentPhase, setCurrentPhase] = useState<Phase>('prepare');
  const [engageStage, setEngageStage] = useState<EngageStage>('ido');
  const [selectedTool, setSelectedTool] = useState<ToolChoice | null>(null);
  const [showToolChoice, setShowToolChoice] = useState(true);
  
  // Prepare State
  const [watchedVideos, setWatchedVideos] = useState<VideoProgress[]>([]);
  const [readIntelFiles, setReadIntelFiles] = useState<string[]>([]);
  const [mcqAnswers, setMcqAnswers] = useState<Record<string, number>>({});
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [showFrameworkModal, setShowFrameworkModal] = useState(false);
  const [activeFrameworkElement, setActiveFrameworkElement] = useState(0);
  
  // Engage State
  const [weDoTasks, setWeDoTasks] = useState<Task[]>(WEDO_TASKS);
  const [youDoTasks, setYouDoTasks] = useState<Task[]>(YOUDO_TASKS);
  const [scenarioReflections, setScenarioReflections] = useState<Record<string, string>>({});
  const [scenarioRatings, setScenarioRatings] = useState<Record<string, number>>({});
  
  // UI State
  const [activeIntel, setActiveIntel] = useState<string | null>(null);
  const [showHint, setShowHint] = useState<string | null>(null);
  
  // XP State
  const [totalXP, setTotalXP] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  
  // Final Challenge
  const [finalBrief, setFinalBrief] = useState('');
  const [finalSubmitted, setFinalSubmitted] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('module2-progress');
    if (saved) {
      const data = JSON.parse(saved);
      setCurrentPhase(data.currentPhase || 'prepare');
      setEngageStage(data.engageStage || 'ido');
      setSelectedTool(data.selectedTool || null);
      setShowToolChoice(data.showToolChoice ?? true);
      setWatchedVideos(data.watchedVideos || []);
      setReadIntelFiles(data.readIntelFiles || []);
      setMcqAnswers(data.mcqAnswers || {});
      setMcqSubmitted(data.mcqSubmitted || false);
      setWeDoTasks(data.weDoTasks || WEDO_TASKS);
      setYouDoTasks(data.youDoTasks || YOUDO_TASKS);
      setTotalXP(data.totalXP || 0);
      setEarnedBadges(data.earnedBadges || []);
      setFinalBrief(data.finalBrief || '');
      setFinalSubmitted(data.finalSubmitted || false);
      setScenarioReflections(data.scenarioReflections || {});
      setScenarioRatings(data.scenarioRatings || {});
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const data = {
      currentPhase,
      engageStage,
      selectedTool,
      showToolChoice,
      watchedVideos,
      readIntelFiles,
      mcqAnswers,
      mcqSubmitted,
      weDoTasks,
      youDoTasks,
      totalXP,
      earnedBadges,
      finalBrief,
      finalSubmitted,
      scenarioReflections,
      scenarioRatings
    };
    localStorage.setItem('module2-progress', JSON.stringify(data));
  }, [currentPhase, engageStage, selectedTool, showToolChoice, watchedVideos, readIntelFiles, mcqAnswers, mcqSubmitted, weDoTasks, youDoTasks, totalXP, earnedBadges, finalBrief, finalSubmitted, scenarioReflections, scenarioRatings]);

  // Calculate XP
  const calculateMCQScore = () => {
    let correct = 0;
    MCQ_QUESTIONS.forEach((q, idx) => {
      if (mcqAnswers[q.id] === q.correctAnswer) correct++;
    });
    return correct * 10;
  };

  const getMCQCorrectCount = () => {
    let correct = 0;
    MCQ_QUESTIONS.forEach((q) => {
      if (mcqAnswers[q.id] === q.correctAnswer) correct++;
    });
    return correct;
  };

  // Check if Prepare is complete
  const isPrepareComplete = () => {
    const allVideosWatched = VIDEOS.every(v => 
      watchedVideos.some(wv => wv.videoId === v.id && wv.watched)
    );
    const allIntelRead = INTEL_FILES.every(f => readIntelFiles.includes(f.id));
    const mcqPassed = mcqSubmitted && getMCQCorrectCount() >= 3;
    return allVideosWatched && allIntelRead && mcqPassed;
  };

  // Mark video as watched
  const markVideoWatched = (videoId: string) => {
    setWatchedVideos(prev => {
      const existing = prev.find(v => v.videoId === videoId);
      if (existing) {
        return prev.map(v => v.videoId === videoId ? { ...v, watched: true, progress: 100 } : v);
      }
      return [...prev, { videoId, watched: true, progress: 100 }];
    });
  };

  // Handle MCQ answer
  const handleMCQAnswer = (questionId: string, answerIndex: number) => {
    setMcqAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
  };

  // Submit MCQ
  const submitMCQ = () => {
    setMcqSubmitted(true);
    const score = calculateMCQScore();
    setTotalXP(prev => prev + score);
  };

  // Handle task completion
  const handleTaskComplete = (taskId: string, taskType: 'wedo' | 'youdo') => {
    const tasks = taskType === 'wedo' ? weDoTasks : youDoTasks;
    const setTasks = taskType === 'wedo' ? setWeDoTasks : setYouDoTasks;
    
    const task = tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, completed: true, earnedXp: t.xp } : t
      ));
      setTotalXP(prev => prev + task.xp);
    }
  };

  // Update task answer
  const updateTaskAnswer = (taskId: string, answer: string, taskType: 'wedo' | 'youdo') => {
    const setTasks = taskType === 'wedo' ? setWeDoTasks : setYouDoTasks;
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, answer } : t
    ));
  };

  // Check We Do complete
  const isWeDoComplete = () => {
    return weDoTasks.every(t => t.completed);
  };

  // Check You Do complete
  const isYouDoComplete = () => {
    return youDoTasks.every(t => t.completed);
  };

  // Advance stages
  const advanceEngageStage = () => {
    if (engageStage === 'ido') {
      setEngageStage('wedo');
    } else if (engageStage === 'wedo' && isWeDoComplete()) {
      setEngageStage('youdo');
    } else if (engageStage === 'youdo' && isYouDoComplete()) {
      setEngageStage('final');
    }
  };

  // Final challenge submit
  const submitFinalChallenge = () => {
    if (finalBrief.length >= 100) {
      setFinalSubmitted(true);
      setTotalXP(prev => prev + 50);
      if (!earnedBadges.includes('chatbot-builder')) {
        setEarnedBadges(prev => [...prev, 'chatbot-builder']);
      }
    }
  };

  // Check if can proceed to Consolidate
  const canProceedToConsolidate = () => {
    return finalSubmitted;
  };

  // Select tool and proceed
  const selectTool = (tool: ToolChoice) => {
    setSelectedTool(tool);
    setShowToolChoice(false);
    setTotalXP(prev => prev + 5);
  };

  // Render Prepare Phase
  const renderPrepare = () => (
    <div className="space-y-8">
      {/* Intel Files Section */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📁</span>
          Intel Files
        </h2>
        <p className="text-slate-400 mb-4">Read these briefing documents to understand the context for your chatbot project.</p>
        
        <div className="grid gap-4 md:grid-cols-2">
          {INTEL_FILES.map((file) => (
            <motion.div
              key={file.id}
              className={`bg-slate-900/50 rounded-xl p-4 border cursor-pointer transition-all ${
                readIntelFiles.includes(file.id) 
                  ? 'border-emerald-500/50 bg-emerald-500/5' 
                  : 'border-slate-600 hover:border-purple-500/50'
              }`}
              onClick={() => {
                setActiveIntel(activeIntel === file.id ? null : file.id);
                if (!readIntelFiles.includes(file.id)) {
                  setReadIntelFiles(prev => [...prev, file.id]);
                  setTotalXP(prev => prev + 5);
                }
              }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-xs px-2 py-1 bg-purple-500/20 text-purple-300 rounded-full">
                    {file.type}
                  </span>
                  <h3 className="text-white font-semibold mt-2 text-sm">{file.title}</h3>
                </div>
                {readIntelFiles.includes(file.id) && (
                  <span className="text-emerald-400 text-xl">✓</span>
                )}
              </div>
              
              <AnimatePresence>
                {activeIntel === file.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 space-y-3"
                  >
                    <p className="text-slate-300 text-sm">{file.summary}</p>
                    <div className="space-y-2">
                      <p className="text-xs text-slate-400 font-semibold">Key Points:</p>
                      {file.keyPoints.map((point, idx) => (
                        <div key={idx} className="flex items-start gap-2">
                          <span className="text-purple-400 text-xs mt-1">•</span>
                          <span className="text-slate-300 text-xs">{point}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Videos Section */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎬</span>
          Video Lessons
        </h2>
        <p className="text-slate-400 mb-4">Watch these videos to build your foundational knowledge.</p>
        
        <div className="grid gap-4 md:grid-cols-3">
          {VIDEOS.map((video) => {
            const isWatched = watchedVideos.some(wv => wv.videoId === video.id && wv.watched);
            return (
              <motion.div
                key={video.id}
                className={`bg-slate-900/50 rounded-xl overflow-hidden border ${
                  isWatched ? 'border-emerald-500/50' : 'border-slate-600'
                }`}
                whileHover={{ scale: 1.02 }}
              >
                {/* Video Placeholder */}
                <div 
                  className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 flex items-center justify-center cursor-pointer relative group"
                  onClick={() => markVideoWatched(video.id)}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-all">
                    <span className="text-3xl text-white ml-1">▶</span>
                  </div>
                  {isWatched && (
                    <div className="absolute top-2 right-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                      ✓ Watched
                    </div>
                  )}
                  <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                    {video.duration}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-white font-semibold text-sm mb-1">{video.title}</h3>
                  <p className="text-slate-400 text-xs">{video.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* SCOPE Framework Section */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          SCOPE Framework
        </h2>
        <p className="text-slate-400 mb-4">
          Master the SCOPE framework to design effective chatbots. Click each element to learn more.
        </p>
        
        {/* Quick Framework Tips */}
        <div className="flex flex-wrap gap-3 mb-6">
          {SCOPE_FRAMEWORK.elements.map((element, idx) => (
            <motion.button
              key={element.letter}
              className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{
                backgroundColor: activeFrameworkElement === idx ? '#8B5CF6' : 'rgba(139, 92, 246, 0.2)',
                color: activeFrameworkElement === idx ? 'white' : '#C4B5FD'
              }}
              onClick={() => setActiveFrameworkElement(idx)}
              whileHover={{ scale: 1.05 }}
            >
              <span className="mr-1">{element.letter}</span>
              <span className="opacity-75">{element.name}</span>
            </motion.button>
          ))}
        </div>

        {/* Active Element Details */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFrameworkElement}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-slate-900/50 rounded-xl p-5 border border-slate-600"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-4xl font-bold text-purple-400">
                {SCOPE_FRAMEWORK.elements[activeFrameworkElement].letter}
              </span>
              <div>
                <h3 className="text-white font-bold text-lg">
                  {SCOPE_FRAMEWORK.elements[activeFrameworkElement].name}
                </h3>
                <p className="text-slate-400 text-sm">
                  {SCOPE_FRAMEWORK.elements[activeFrameworkElement].description}
                </p>
              </div>
            </div>
            
            <div className="space-y-2 mt-4">
              <p className="text-xs text-slate-500 font-semibold uppercase">Key Questions:</p>
              {SCOPE_FRAMEWORK.elements[activeFrameworkElement].questions.map((q, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm">
                  <span className="text-purple-400">?</span>
                  <span className="text-slate-300">{q}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20">
              <p className="text-xs text-purple-300 font-semibold mb-1">Example:</p>
              <p className="text-slate-300 text-sm">
                {SCOPE_FRAMEWORK.elements[activeFrameworkElement].example}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* View Full Framework Button */}
        <button
          onClick={() => setShowFrameworkModal(true)}
          className="mt-4 text-purple-400 text-sm hover:text-purple-300 flex items-center gap-2"
        >
          <span>📖</span>
          View Complete SCOPE Framework
        </button>
      </div>

      {/* MCQ Section */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Knowledge Check
        </h2>
        <p className="text-slate-400 mb-4">
          Answer these questions to test your understanding. You need at least 3 correct to proceed.
        </p>

        {!mcqSubmitted ? (
          <div className="space-y-6">
            {MCQ_QUESTIONS.map((question, qIdx) => (
              <div key={question.id} className="bg-slate-900/50 rounded-xl p-5 border border-slate-600">
                <p className="text-white font-medium mb-3">
                  {qIdx + 1}. {question.question}
                </p>
                <div className="grid gap-2">
                  {question.options.map((option, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleMCQAnswer(question.id, oIdx)}
                      className={`text-left p-3 rounded-lg border transition-all ${
                        mcqAnswers[question.id] === oIdx
                          ? 'border-purple-500 bg-purple-500/20 text-white'
                          : 'border-slate-600 text-slate-300 hover:border-purple-500/50'
                      }`}
                    >
                      <span className="mr-2">{String.fromCharCode(65 + oIdx)}.</span>
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            
            <button
              onClick={submitMCQ}
              disabled={Object.keys(mcqAnswers).length < MCQ_QUESTIONS.length}
              className={`w-full py-3 rounded-xl font-semibold transition-all ${
                Object.keys(mcqAnswers).length < MCQ_QUESTIONS.length
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-purple-600 text-white hover:bg-purple-700'
              }`}
            >
              Submit Answers
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Results Summary */}
            <div className={`p-4 rounded-xl border ${
              getMCQCorrectCount() >= 3 
                ? 'bg-emerald-500/10 border-emerald-500/50' 
                : 'bg-red-500/10 border-red-500/50'
            }`}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">
                  {getMCQCorrectCount() >= 3 ? '🎉' : '📚'}
                </span>
                <div>
                  <p className="text-white font-bold">
                    {getMCQCorrectCount() >= 3 ? 'Great Work!' : 'Keep Learning'}
                  </p>
                  <p className="text-slate-300 text-sm">
                    You got {getMCQCorrectCount()} out of {MCQ_QUESTIONS.length} correct
                    {getMCQCorrectCount() >= 3 && ` (+${calculateMCQScore()} XP)`}
                  </p>
                </div>
              </div>
            </div>

            {/* Show Results */}
            {MCQ_QUESTIONS.map((question, qIdx) => {
              const isCorrect = mcqAnswers[question.id] === question.correctAnswer;
              return (
                <div 
                  key={question.id}
                  className={`p-4 rounded-xl border ${
                    isCorrect ? 'border-emerald-500/50' : 'border-red-500/50'
                  }`}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>
                      {isCorrect ? '✓' : '✗'}
                    </span>
                    <p className="text-white font-medium">{question.question}</p>
                  </div>
                  <p className="text-sm text-slate-400 mb-1">
                    Your answer: {question.options[mcqAnswers[question.id]]}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-emerald-400">
                      Correct answer: {question.options[question.correctAnswer]}
                    </p>
                  )}
                  <p className="text-sm text-slate-500 mt-2 italic">
                    {question.explanation}
                  </p>
                </div>
              );
            })}

            {getMCQCorrectCount() >= 3 && (
              <button
                onClick={() => setCurrentPhase('engage')}
                className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
              >
                Continue to Engage Phase →
              </button>
            )}

            {getMCQCorrectCount() < 3 && (
              <button
                onClick={() => {
                  setMcqSubmitted(false);
                  setMcqAnswers({});
                }}
                className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
              >
                Try Again
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  // Render Tool Choice Screen
  const renderToolChoice = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">Choose Your Chatbot Platform</h2>
        <p className="text-slate-400">Select the tool you'll use to build your chatbot. You can change this later if needed.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {TOOL_OPTIONS.map((tool) => (
          <motion.div
            key={tool.id}
            className={`relative bg-slate-800/50 rounded-2xl p-6 border-2 cursor-pointer transition-all ${
              selectedTool === tool.id 
                ? 'border-purple-500 bg-purple-500/10' 
                : 'border-slate-600 hover:border-purple-500/50'
            }`}
            onClick={() => selectTool(tool.id)}
            whileHover={{ scale: 1.02 }}
          >
            {tool.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                Recommended
              </div>
            )}
            
            <h3 className="text-xl font-bold text-white mb-2">{tool.name}</h3>
            <p className="text-slate-400 text-sm mb-4">{tool.description}</p>
            
            <div className="space-y-2 mb-4">
              {tool.features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <span className="text-emerald-400">✓</span>
                  <span className="text-slate-300">{feature}</span>
                </div>
              ))}
            </div>
            
            <div className="flex justify-between text-xs text-slate-500 pt-4 border-t border-slate-600">
              <span>⏱ {tool.timeToSetup}</span>
              <span className={`px-2 py-1 rounded ${
                tool.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                tool.difficulty === 'Intermediate' ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {tool.difficulty}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );

  // Render I Do Stage
  const renderIDo = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <span className="text-2xl">👀</span>
          Watch an Expert Build a Chatbot
        </h2>
        <p className="text-slate-400 mb-6">
          Observe how a professional designs and configures a customer service chatbot using Tidio. Pay attention to how they apply the SCOPE framework.
        </p>

        {/* Video Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 cursor-pointer hover:bg-white/30 transition-all">
                <span className="text-4xl text-white ml-1">▶</span>
              </div>
              <p className="text-white font-semibold">Expert Chatbot Build: Tidio Walkthrough</p>
              <p className="text-slate-400 text-sm">18:32</p>
            </div>
          </div>
        </div>

        {/* Key Observations */}
        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-600 mb-6">
          <h3 className="text-white font-semibold mb-3">🔍 Key Things to Observe:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">1.</span>
              How the expert uses SCOPE to plan before building
            </li>
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">2.</span>
              The structure of the system prompt they create
            </li>
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">3.</span>
              How they test and iterate on responses
            </li>
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">4.</span>
              The escalation triggers they configure
            </li>
          </ul>
        </div>

        {/* Example System Prompt */}
        <div className="bg-slate-900/50 rounded-xl p-5 border border-purple-500/30">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <span>📝</span>
            Example System Prompt (from video)
          </h3>
          <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono bg-slate-950/50 p-4 rounded-lg overflow-x-auto">
            {IDO_EXAMPLE_PROMPT}
          </pre>
        </div>
      </div>

      <button
        onClick={advanceEngageStage}
        className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
      >
        Continue to We Do →
      </button>
    </div>
  );

  // Render We Do Stage
  const renderWeDo = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">🤝</span>
          We Do: Let's Build Together
        </h2>
        <p className="text-slate-400 mb-6">
          Complete these tasks with guidance. You'll set up your account, write a system prompt, and test your chatbot.
        </p>

        {/* Task 1: Account Setup */}
        <div className={`bg-slate-900/50 rounded-xl p-5 border mb-4 ${
          weDoTasks[0].completed ? 'border-emerald-500/50' : 'border-slate-600'
        }`}>
          <div className="flex items-start gap-4">
            <button
              onClick={() => handleTaskComplete('wedo-1', 'wedo')}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                weDoTasks[0].completed 
                  ? 'border-emerald-500 bg-emerald-500' 
                  : 'border-slate-500 hover:border-purple-500'
              }`}
            >
              {weDoTasks[0].completed && <span className="text-white text-sm">✓</span>}
            </button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{weDoTasks[0].title}</h3>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  {weDoTasks[0].xp} XP
                </span>
              </div>
              <p className="text-slate-400 text-sm">{weDoTasks[0].description}</p>
              
              {!weDoTasks[0].completed && (
                <div className="mt-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <p className="text-blue-300 text-sm">
                    💡 Go to <a href="https://tidio.com" target="_blank" rel="noopener noreferrer" className="underline">tidio.com</a> and sign up for a free account. Complete the initial setup wizard.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task 2: SCOPE System Prompt */}
        <div className={`bg-slate-900/50 rounded-xl p-5 border mb-4 ${
          weDoTasks[1].completed ? 'border-emerald-500/50' : 'border-slate-600'
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{weDoTasks[1].title}</h3>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  {weDoTasks[1].xp} XP
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3">{weDoTasks[1].description}</p>
              
              {/* Quick SCOPE Tips */}
              <div className="flex flex-wrap gap-2 mb-4">
                {SCOPE_FRAMEWORK.elements.map((el) => (
                  <button
                    key={el.letter}
                    onClick={() => setShowHint(showHint === el.letter ? null : el.letter)}
                    className="px-3 py-1 text-xs rounded-full bg-purple-500/20 text-purple-300 hover:bg-purple-500/30"
                  >
                    {el.letter} - {el.name}
                  </button>
                ))}
              </div>
              
              {/* Hint Display */}
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 p-3 bg-purple-500/10 rounded-lg border border-purple-500/20"
                  >
                    {SCOPE_FRAMEWORK.elements.find(e => e.letter === showHint) && (
                      <>
                        <p className="text-purple-300 text-sm font-semibold mb-1">
                          {showHint} - {SCOPE_FRAMEWORK.elements.find(e => e.letter === showHint)?.name}
                        </p>
                        <p className="text-slate-300 text-sm">
                          {SCOPE_FRAMEWORK.elements.find(e => e.letter === showHint)?.description}
                        </p>
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
              
              {/* Rubric */}
              <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 font-semibold mb-2">SCORING CRITERIA:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {weDoTasks[1].rubric?.map((r, idx) => (
                    <div key={idx} className="text-xs text-slate-400">
                      {r.criteria}: <span className="text-purple-400">{r.maxPoints}pts</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <textarea
                value={weDoTasks[1].answer || ''}
                onChange={(e) => updateTaskAnswer('wedo-2', e.target.value, 'wedo')}
                placeholder="Write your SCOPE-based system prompt for Velara Hotels..."
                className="w-full h-48 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
              />
              
              <button
                onClick={() => handleTaskComplete('wedo-2', 'wedo')}
                disabled={!weDoTasks[1].answer || weDoTasks[1].answer.length < 100}
                className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  weDoTasks[1].completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : !weDoTasks[1].answer || weDoTasks[1].answer.length < 100
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {weDoTasks[1].completed ? '✓ Completed' : 'Submit System Prompt'}
              </button>
            </div>
          </div>
        </div>

        {/* Task 3: Test Scenarios */}
        <div className={`bg-slate-900/50 rounded-xl p-5 border mb-4 ${
          weDoTasks[2].completed ? 'border-emerald-500/50' : 'border-slate-600'
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{weDoTasks[2].title}</h3>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  {weDoTasks[2].xp} XP
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-4">{weDoTasks[2].description}</p>
              
              {TEST_SCENARIOS.map((scenario, idx) => (
                <div key={scenario.id} className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-medium text-sm">
                      {idx + 1}. {scenario.title}
                    </h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">Rate response:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setScenarioRatings(prev => ({ ...prev, [scenario.id]: star }))}
                            className={`text-lg ${
                              (scenarioRatings[scenario.id] || 0) >= star ? 'text-yellow-400' : 'text-slate-600'
                            }`}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-2 bg-slate-900/50 rounded mb-2">
                    <p className="text-xs text-slate-500 mb-1">Test this prompt:</p>
                    <p className="text-slate-300 text-sm italic">"{scenario.prompt}"</p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-xs text-slate-500 mb-1">Evaluation criteria:</p>
                    <div className="flex flex-wrap gap-2">
                      {scenario.evaluationCriteria.map((c, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-slate-700 rounded text-slate-400">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <textarea
                    value={scenarioReflections[scenario.id] || ''}
                    onChange={(e) => setScenarioReflections(prev => ({ ...prev, [scenario.id]: e.target.value }))}
                    placeholder="How did your chatbot respond? What worked well? What could improve?"
                    className="w-full h-20 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
              ))}
              
              <button
                onClick={() => handleTaskComplete('wedo-3', 'wedo')}
                disabled={Object.keys(scenarioRatings).length < 3 || Object.keys(scenarioReflections).length < 3}
                className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                  weDoTasks[2].completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : Object.keys(scenarioRatings).length < 3 || Object.keys(scenarioReflections).length < 3
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {weDoTasks[2].completed ? '✓ All Scenarios Tested' : 'Complete Scenario Testing'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isWeDoComplete() && (
        <button
          onClick={advanceEngageStage}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
        >
          Continue to You Do →
        </button>
      )}
    </div>
  );

  // Render You Do Stage
  const renderYouDo = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">✨</span>
          You Do: Independent Practice
        </h2>
        <p className="text-slate-400 mb-6">
          Now it's your turn to work independently. These tasks will challenge you to apply what you've learned.
        </p>

        {/* Task 1: Difficult Customer */}
        <div className={`bg-slate-900/50 rounded-xl p-5 border mb-4 ${
          youDoTasks[0].completed ? 'border-emerald-500/50' : 'border-slate-600'
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{youDoTasks[0].title}</h3>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  {youDoTasks[0].xp} XP
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3">{youDoTasks[0].description}</p>
              
              <div className="mb-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-red-300 text-sm font-semibold mb-1">🚨 Difficult Scenario:</p>
                <p className="text-slate-300 text-sm italic">
                  "I arrived at 3pm for check-in and my room wasn't ready! The receptionist said to wait 30 minutes. 
                  I waited AN HOUR and still nothing! I had an important client meeting that I missed because of this. 
                  This is absolutely unacceptable for a 'luxury' hotel. I demand to speak to a manager RIGHT NOW!"
                </p>
              </div>
              
              {/* Rubric */}
              <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 font-semibold mb-2">SCORING CRITERIA:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {youDoTasks[0].rubric?.map((r, idx) => (
                    <div key={idx} className="text-xs text-slate-400">
                      {r.criteria}: <span className="text-purple-400">{r.maxPoints}pts</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <textarea
                value={youDoTasks[0].answer || ''}
                onChange={(e) => updateTaskAnswer('youdo-1', e.target.value, 'youdo')}
                placeholder="Describe how your chatbot handled this scenario. Did it escalate appropriately? How could the response be improved?"
                className="w-full h-32 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
              />
              
              <button
                onClick={() => handleTaskComplete('youdo-1', 'youdo')}
                disabled={!youDoTasks[0].answer || youDoTasks[0].answer.length < 50}
                className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  youDoTasks[0].completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : !youDoTasks[0].answer || youDoTasks[0].answer.length < 50
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {youDoTasks[0].completed ? '✓ Completed' : 'Submit Analysis'}
              </button>
            </div>
          </div>
        </div>

        {/* Task 2: Escalation Scripts */}
        <div className={`bg-slate-900/50 rounded-xl p-5 border mb-4 ${
          youDoTasks[1].completed ? 'border-emerald-500/50' : 'border-slate-600'
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{youDoTasks[1].title}</h3>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  {youDoTasks[1].xp} XP
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3">{youDoTasks[1].description}</p>
              
              {/* Rubric */}
              <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 font-semibold mb-2">SCORING CRITERIA:</p>
                <div className="grid grid-cols-2 gap-2">
                  {youDoTasks[1].rubric?.map((r, idx) => (
                    <div key={idx} className="text-xs text-slate-400">
                      {r.criteria}: <span className="text-purple-400">{r.maxPoints}pts</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3 mb-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Script 1: Technical Issue Escalation</p>
                  <textarea
                    value={youDoTasks[1].answer?.split('|||')[0] || ''}
                    onChange={(e) => {
                      const parts = (youDoTasks[1].answer || '|||').split('|||');
                      parts[0] = e.target.value;
                      updateTaskAnswer('youdo-2', parts.join('|||'), 'youdo');
                    }}
                    placeholder="Write an escalation message for when the chatbot can't resolve a technical issue..."
                    className="w-full h-20 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Script 2: VIP Guest Escalation</p>
                  <textarea
                    value={youDoTasks[1].answer?.split('|||')[1] || ''}
                    onChange={(e) => {
                      const parts = (youDoTasks[1].answer || '|||').split('|||');
                      parts[1] = e.target.value;
                      updateTaskAnswer('youdo-2', parts.join('|||'), 'youdo');
                    }}
                    placeholder="Write an escalation message for VIP guest queries..."
                    className="w-full h-20 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Script 3: Frustrated Customer Escalation</p>
                  <textarea
                    value={youDoTasks[1].answer?.split('|||')[2] || ''}
                    onChange={(e) => {
                      const parts = (youDoTasks[1].answer || '|||').split('|||');
                      parts[2] = e.target.value;
                      updateTaskAnswer('youdo-2', parts.join('|||'), 'youdo');
                    }}
                    placeholder="Write an escalation message for frustrated or angry customers..."
                    className="w-full h-20 bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                  />
                </div>
              </div>
              
              <button
                onClick={() => handleTaskComplete('youdo-2', 'youdo')}
                disabled={!youDoTasks[1].answer || youDoTasks[1].answer.split('|||').some(p => !p || p.length < 20)}
                className={`w-full py-2 rounded-lg text-sm font-semibold transition-all ${
                  youDoTasks[1].completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : !youDoTasks[1].answer || youDoTasks[1].answer.split('|||').some(p => !p || p.length < 20)
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {youDoTasks[1].completed ? '✓ Completed' : 'Submit Escalation Scripts'}
              </button>
            </div>
          </div>
        </div>

        {/* Task 3: Live Chatbot Documentation */}
        <div className={`bg-slate-900/50 rounded-xl p-5 border mb-4 ${
          youDoTasks[2].completed ? 'border-emerald-500/50' : 'border-slate-600'
        }`}>
          <div className="flex items-start gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-white font-semibold">{youDoTasks[2].title}</h3>
                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded">
                  {youDoTasks[2].xp} XP
                </span>
              </div>
              <p className="text-slate-400 text-sm mb-3">{youDoTasks[2].description}</p>
              
              {/* Rubric */}
              <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 font-semibold mb-2">SCORING CRITERIA:</p>
                <div className="grid grid-cols-2 gap-2">
                  {youDoTasks[2].rubric?.map((r, idx) => (
                    <div key={idx} className="text-xs text-slate-400">
                      {r.criteria}: <span className="text-purple-400">{r.maxPoints}pts</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="mb-4 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-blue-300 text-sm">
                  📸 <strong>Portfolio Artifact:</strong> Take a screenshot of your working chatbot. 
                  This will be part of your portfolio showing your practical AI skills.
                </p>
              </div>
              
              <textarea
                value={youDoTasks[2].answer || ''}
                onChange={(e) => updateTaskAnswer('youdo-3', e.target.value, 'youdo')}
                placeholder="Paste your screenshot link here (or describe your chatbot) and write a reflection: What works well? What could be improved? What did you learn from this process?"
                className="w-full h-40 bg-slate-800 border border-slate-600 rounded-lg p-3 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
              />
              
              <button
                onClick={() => handleTaskComplete('youdo-3', 'youdo')}
                disabled={!youDoTasks[2].answer || youDoTasks[2].answer.length < 100}
                className={`mt-3 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  youDoTasks[2].completed
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : !youDoTasks[2].answer || youDoTasks[2].answer.length < 100
                    ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                }`}
              >
                {youDoTasks[2].completed ? '✓ Completed' : 'Submit Documentation'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isYouDoComplete() && (
        <button
          onClick={advanceEngageStage}
          className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all"
        >
          Continue to Final Challenge →
        </button>
      )}
    </div>
  );

  // Render Final Challenge
  const renderFinalChallenge = () => (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-2xl p-6 border border-purple-500/30">
        <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-3xl">🏆</span>
          Final Challenge: Board Brief
        </h2>
        <p className="text-slate-300 mb-6">
          You've successfully built a working chatbot for Velara Hotels. Now prepare a one-page brief for the hotel's executive board summarizing your chatbot solution and its expected impact.
        </p>

        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-600 mb-6">
          <h3 className="text-white font-semibold mb-3">📋 Brief Requirements:</h3>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">1.</span>
              <strong>Problem Statement:</strong> What customer service challenges does the chatbot address?
            </li>
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">2.</span>
              <strong>Solution Overview:</strong> How does your chatbot work? What can it handle?
            </li>
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">3.</span>
              <strong>Key Features:</strong> SCOPE elements implemented (persona, escalation, etc.)
            </li>
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">4.</span>
              <strong>Expected Impact:</strong> Estimated benefits (time saved, customer satisfaction, etc.)
            </li>
            <li className="flex items-start gap-2 text-slate-300 text-sm">
              <span className="text-purple-400">5.</span>
              <strong>Recommendations:</strong> Next steps for further development
            </li>
          </ul>
        </div>

        <div className="bg-slate-900/50 rounded-xl p-5 border border-slate-600 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold">📝 Your Board Brief</h3>
            <span className={`text-xs px-2 py-1 rounded ${
              finalBrief.length >= 100 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-600 text-slate-400'
            }`}>
              {finalBrief.length} characters (min 100)
            </span>
          </div>
          
          <textarea
            value={finalBrief}
            onChange={(e) => setFinalBrief(e.target.value)}
            placeholder="Write your one-page executive brief here..."
            className="w-full h-64 bg-slate-800 border border-slate-600 rounded-lg p-4 text-white text-sm placeholder:text-slate-500 focus:border-purple-500 focus:outline-none resize-none"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="text-slate-400 text-sm">
            <span className="text-yellow-400">★</span> Complete this challenge to earn 50 XP and the Chatbot Builder badge!
          </div>
          
          {finalSubmitted ? (
            <div className="flex items-center gap-2 text-emerald-400">
              <span className="text-xl">✓</span>
              <span className="font-semibold">Challenge Completed!</span>
            </div>
          ) : (
            <button
              onClick={submitFinalChallenge}
              disabled={finalBrief.length < 100}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                finalBrief.length < 100
                  ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
              }`}
            >
              Submit Board Brief (50 XP)
            </button>
          )}
        </div>
      </div>

      {canProceedToConsolidate() && (
        <button
          onClick={() => setCurrentPhase('consolidate')}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all"
        >
          Complete Module & See Results →
        </button>
      )}
    </div>
  );

  // Render Engage Phase
  const renderEngage = () => {
    if (showToolChoice) {
      return renderToolChoice();
    }

    switch (engageStage) {
      case 'ido':
        return renderIDo();
      case 'wedo':
        return renderWeDo();
      case 'youdo':
        return renderYouDo();
      case 'final':
        return renderFinalChallenge();
      default:
        return renderIDo();
    }
  };

  // Render Consolidate Phase
  const renderConsolidate = () => (
    <div className="space-y-6">
      {/* XP Summary */}
      <div className="bg-gradient-to-br from-emerald-600/20 to-blue-600/20 rounded-2xl p-8 border border-emerald-500/30 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">🎉 Module Complete!</h2>
        <p className="text-slate-300 mb-6">Congratulations on completing the Chatbot Building module!</p>
        
        <div className="inline-flex items-center gap-4 bg-slate-900/50 rounded-2xl p-6 mb-6">
          <div className="text-5xl font-bold text-emerald-400">{totalXP}</div>
          <div className="text-left">
            <div className="text-white font-semibold">Total XP Earned</div>
            <div className="text-slate-400 text-sm">out of 255 possible</div>
          </div>
        </div>

        {/* Badge */}
        {earnedBadges.includes('chatbot-builder') && (
          <div className="inline-block bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="text-4xl mb-2">🤖</div>
            <div className="text-white font-semibold">Chatbot Builder</div>
            <div className="text-slate-400 text-xs">Badge Earned</div>
          </div>
        )}
      </div>

      {/* XP Breakdown */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">📊 XP Breakdown</h3>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">Intel Files Read</span>
            <span className="text-purple-400">{readIntelFiles.length * 5} XP</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">MCQ Score</span>
            <span className="text-purple-400">{calculateMCQScore()} XP</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">Tool Selection</span>
            <span className="text-purple-400">{selectedTool ? 5 : 0} XP</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">We Do Tasks</span>
            <span className="text-purple-400">{weDoTasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0)} XP</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">You Do Tasks</span>
            <span className="text-purple-400">{youDoTasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0)} XP</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-900/50 rounded-lg">
            <span className="text-slate-300">Final Challenge</span>
            <span className="text-purple-400">{finalSubmitted ? 50 : 0} XP</span>
          </div>
        </div>
      </div>

      {/* Portfolio Reminder */}
      <div className="bg-blue-500/10 rounded-2xl p-6 border border-blue-500/30">
        <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
          <span className="text-2xl">📁</span>
          Portfolio Artifact
        </h3>
        <p className="text-slate-300 mb-4">
          Your Velara Hotels chatbot and board brief are now part of your AI portfolio. This demonstrates your ability to:
        </p>
        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <span className="text-emerald-400">✓</span>
            Design chatbot solutions using the SCOPE framework
          </li>
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <span className="text-emerald-400">✓</span>
            Build and deploy a working AI chatbot
          </li>
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <span className="text-emerald-400">✓</span>
            Handle escalation and difficult customer scenarios
          </li>
          <li className="flex items-center gap-2 text-slate-300 text-sm">
            <span className="text-emerald-400">✓</span>
            Communicate AI solutions to business stakeholders
          </li>
        </ul>
      </div>

      {/* Next Module */}
      <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-2">➡️ What's Next?</h3>
        <p className="text-slate-400 mb-4">
          Ready to continue your AI journey? Module 3 will cover AI-Powered Content Creation, where you'll learn to use AI tools to create marketing content, social media posts, and more.
        </p>
        <button className="w-full py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all">
          Go to Module 3 →
        </button>
      </div>
    </div>
  );

  // Render Framework Modal
  const renderFrameworkModal = () => (
    <AnimatePresence>
      {showFrameworkModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setShowFrameworkModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-slate-800 rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">SCOPE Framework</h2>
              <button
                onClick={() => setShowFrameworkModal(false)}
                className="text-slate-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>
            
            <p className="text-slate-300 mb-6">{SCOPE_FRAMEWORK.description}</p>
            
            <div className="space-y-4">
              {SCOPE_FRAMEWORK.elements.map((element) => (
                <div key={element.letter} className="bg-slate-900/50 rounded-xl p-4 border border-slate-600">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl font-bold text-purple-400">{element.letter}</span>
                    <div>
                      <h3 className="text-white font-bold">{element.name}</h3>
                      <p className="text-slate-400 text-sm">{element.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="bg-slate-900/50 border-b border-slate-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Course 2: AI for Business Operations</p>
              <h1 className="text-xl font-bold text-white">Module 2: Chatbot Building</h1>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-slate-800 rounded-full px-3 py-1">
                <span className="text-yellow-400">★</span>
                <span className="text-white font-semibold">{totalXP}</span>
                <span className="text-slate-400 text-sm">XP</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Phase Indicator */}
      <div className="bg-slate-900/30 border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {(['prepare', 'engage', 'consolidate'] as Phase[]).map((phase, idx) => (
              <button
                key={phase}
                onClick={() => {
                  if (phase === 'prepare' || (phase === 'engage' && isPrepareComplete()) || (phase === 'consolidate' && canProceedToConsolidate())) {
                    setCurrentPhase(phase);
                  }
                }}
                disabled={
                  (phase === 'engage' && !isPrepareComplete()) ||
                  (phase === 'consolidate' && !canProceedToConsolidate())
                }
                className={`flex-1 py-2 px-4 text-sm font-semibold transition-all ${
                  currentPhase === phase
                    ? 'bg-purple-600 text-white'
                    : (phase === 'prepare' || (phase === 'engage' && isPrepareComplete()) || (phase === 'consolidate' && canProceedToConsolidate()))
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-800/50 text-slate-500 cursor-not-allowed'
                } ${idx > 0 ? 'ml-2' : ''} rounded-lg`}
              >
                {idx + 1}. {phase.charAt(0).toUpperCase() + phase.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Engage Stage Indicator */}
          {currentPhase === 'engage' && !showToolChoice && (
            <div className="flex items-center justify-center gap-2 mt-3">
              {(['ido', 'wedo', 'youdo', 'final'] as EngageStage[]).map((stage, idx) => {
                const isActive = engageStage === stage;
                const isComplete = 
                  (stage === 'ido' && engageStage !== 'ido') ||
                  (stage === 'wedo' && ['youdo', 'final'].includes(engageStage)) ||
                  (stage === 'youdo' && engageStage === 'final');
                
                return (
                  <div key={stage} className="flex items-center">
                    <button
                      onClick={() => {
                        if (stage === 'ido' || 
                            (stage === 'wedo' && engageStage !== 'ido') ||
                            (stage === 'youdo' && ['youdo', 'final'].includes(engageStage)) ||
                            (stage === 'final' && engageStage === 'final')) {
                          setEngageStage(stage);
                        }
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-purple-500 text-white'
                          : isComplete
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {stage === 'ido' ? 'I Do' : stage === 'wedo' ? 'We Do' : stage === 'youdo' ? 'You Do' : 'Final'}
                    </button>
                    {idx < 3 && <div className="w-4 h-px bg-slate-600 mx-1" />}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          key={currentPhase + engageStage}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {currentPhase === 'prepare' && renderPrepare()}
          {currentPhase === 'engage' && renderEngage()}
          {currentPhase === 'consolidate' && renderConsolidate()}
        </motion.div>
      </div>

      {/* Framework Modal */}
      {renderFrameworkModal()}
    </div>
  );
}
