'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAcademyProgress } from '@/hooks/useAcademyProgress';
import { logProgress } from '@/lib/notion';
import { cn } from '@/lib/utils';

// Course 2 Module Data - 5 Departments, 5 Modules
const modules = [
  {
    id: 1,
    title: 'Prompt Engineering',
    department: 'Marketing',
    departmentIcon: '📢',
    problem: "Marketing's AI outputs are generic and off-brand",
    xpAvailable: 700,
    estimatedTime: '45 min',
    difficulty: 'Foundation',
    badge: 'Prompt Specialist',
  },
  {
    id: 2,
    title: 'Customer Service Automation',
    department: 'Customer Service',
    departmentIcon: '🎧',
    problem: '200+ unread emails every Monday morning',
    xpAvailable: 850,
    estimatedTime: '60 min',
    difficulty: 'Intermediate',
    badge: 'Automation Architect',
  },
  {
    id: 3,
    title: 'Workflow Intelligence',
    department: 'Operations',
    departmentIcon: '⚙️',
    problem: 'Manual processes costing 12 hours per week',
    xpAvailable: 900,
    estimatedTime: '75 min',
    difficulty: 'Intermediate',
    badge: 'Efficiency Expert',
  },
  {
    id: 4,
    title: 'Data-Driven Insights',
    department: 'Finance',
    departmentIcon: '📊',
    problem: 'Customer data sitting unused in spreadsheets',
    xpAvailable: 800,
    estimatedTime: '60 min',
    difficulty: 'Advanced',
    badge: 'Data Strategist',
  },
  {
    id: 5,
    title: 'AI-Powered Collaboration',
    department: 'HR & Culture',
    departmentIcon: '👥',
    problem: 'Knowledge silos between departments',
    xpAvailable: 750,
    estimatedTime: '50 min',
    difficulty: 'Advanced',
    badge: 'Collaboration Champion',
  },
];

// Mind Map Node Interface
interface MindMapNode {
  id: string;
  label: string;
  x: number;
  y: number;
  isCenter?: boolean;
  isDepartment?: boolean;
  moduleId?: number;
  children?: string[];
}

// Mind Map Component
function MindMap({ onNodeClick, highlightedModule }: { onNodeClick: (id: number) => void; highlightedModule: number | null }) {
  const nodes: MindMapNode[] = [
    { id: 'velara', label: 'Velara', x: 300, y: 200, isCenter: true },
    { id: 'marketing', label: 'Marketing', x: 120, y: 80, isDepartment: true, moduleId: 1 },
    { id: 'cs', label: 'Customer Service', x: 480, y: 80, isDepartment: true, moduleId: 2 },
    { id: 'ops', label: 'Operations', x: 80, y: 200, isDepartment: true, moduleId: 3 },
    { id: 'finance', label: 'Finance', x: 120, y: 320, isDepartment: true, moduleId: 4 },
    { id: 'hr', label: 'HR & Culture', x: 480, y: 320, isDepartment: true, moduleId: 5 },
  ];

  const connections = [
    { from: 'velara', to: 'marketing' },
    { from: 'velara', to: 'cs' },
    { from: 'velara', to: 'ops' },
    { from: 'velara', to: 'finance' },
    { from: 'velara', to: 'hr' },
  ];

  const getNodePosition = (id: string) => {
    const node = nodes.find(n => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <svg viewBox="0 0 600 400" className="w-full h-full">
      <defs>
        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#1B3A6B" />
          <stop offset="100%" stopColor="#E8A020" />
        </linearGradient>
      </defs>

      {/* Connection Lines */}
      {connections.map((conn, idx) => {
        const from = getNodePosition(conn.from);
        const to = getNodePosition(conn.to);
        return (
          <line
            key={idx}
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="url(#lineGradient)"
            strokeWidth="2"
            strokeDasharray="5,5"
            opacity="0.6"
          />
        );
      })}

      {/* Nodes */}
      {nodes.map((node) => {
        const isHighlighted = node.moduleId === highlightedModule;
        return (
          <g
            key={node.id}
            onClick={() => node.moduleId && onNodeClick(node.moduleId)}
            className={node.moduleId ? 'cursor-pointer' : ''}
            style={{ transition: 'all 0.3s ease' }}
          >
            {/* Node Circle */}
            <circle
              cx={node.x}
              cy={node.y}
              r={node.isCenter ? 45 : 35}
              fill={node.isCenter ? '#E8A020' : isHighlighted ? '#E8A020' : '#1B3A6B'}
              stroke={isHighlighted ? '#E8A020' : '#E8A020'}
              strokeWidth="2"
              filter={isHighlighted || node.isCenter ? 'url(#glow)' : undefined}
              className={cn(
                "transition-all duration-300",
                isHighlighted && "animate-pulse-gold"
              )}
            />
            {/* Node Label */}
            <text
              x={node.x}
              y={node.y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={node.isCenter || isHighlighted ? '#1B3A6B' : '#E8A020'}
              fontSize={node.isCenter ? 14 : 11}
              fontWeight="600"
              className="pointer-events-none select-none"
            >
              {node.label}
            </text>
          </g>
        );
      })}

      {/* Department Problem Indicators */}
      {nodes.filter(n => n.isDepartment).map((node) => (
        <g key={`problem-${node.id}`}>
          <circle
            cx={node.x + 30}
            cy={node.y - 25}
            r="8"
            fill="#ef4444"
            stroke="#fff"
            strokeWidth="1"
          />
          <text
            x={node.x + 30}
            y={node.y - 25}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize="10"
            fontWeight="bold"
          >
            !
          </text>
        </g>
      ))}
    </svg>
  );
}

// Case Study Document Component
function CaseStudyDocument({ highlightedModule }: { highlightedModule: number | null }) {
  const sections = [
    {
      title: 'Company Overview',
      icon: '🏢',
      content: `Velara is a British sustainable luxury fashion retailer founded in 2018. Headquartered in London with flagship stores in Mayfair and Knightsbridge. Revenue: £4.2M (FY2024). Team: 34 employees across five departments. E-commerce accounts for 65% of sales. Brand positioning: "Timeless elegance, sustainable future."`,
    },
    {
      title: 'The Problem',
      icon: '⚠️',
      content: `Despite rapid growth, Velara has fallen behind competitors in AI adoption. Managing Director Sarah Chen acknowledges the team knows they "should" use AI but lacks the expertise to do so effectively. A recent incident where AI-generated product copy mentioned a competitor by name became a wake-up call.`,
    },
    {
      title: 'Key People',
      icon: '👥',
      content: `Sarah Chen (MD) — Former Buyer at Selfridges, founded Velara aged 28. Visionary but tech-hesitant. Marcus Webb (Senior Consultant, SwipeUp) — Your mentor on this engagement. 15 years consulting experience. Available for guidance via recorded briefings.`,
    },
    {
      title: 'The Brief',
      icon: '📋',
      content: `You have been engaged as an external AI consultant. Your mandate: diagnose AI productivity problems across all five departments and implement working solutions. Timeline: 6 weeks. Deliverables: each department must have at least one AI tool working effectively by project end.`,
    },
  ];

  const getModuleHighlight = () => {
    if (!highlightedModule) return null;
    const mod = modules.find(m => m.id === highlightedModule);
    return mod ? (
      <div className="bg-gold/20 border border-gold rounded-lg p-3 mb-4">
        <p className="text-gold text-sm font-medium">
          Module {mod.id}: {mod.title}
        </p>
        <p className="text-slate-300 text-xs mt-1">
          Department: {mod.department} — {mod.problem}
        </p>
      </div>
    ) : null;
  };

  return (
    <div className="bg-slate-900/80 border border-slate-700 rounded-lg overflow-hidden">
      {/* Document Header */}
      <div className="bg-navy px-4 py-3 border-b border-gold/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-gold text-lg">📁</span>
            <span className="text-white font-mono text-sm uppercase tracking-wider">
              Client Briefing Document
            </span>
          </div>
          <span className="text-xs bg-red-600/80 text-white px-2 py-0.5 rounded font-mono">
            CONFIDENTIAL
          </span>
        </div>
      </div>

      {/* Document Content */}
      <div className="p-4 space-y-4">
        {getModuleHighlight()}
        
        {sections.map((section, idx) => (
          <div key={idx} className="border-l-2 border-gold/30 pl-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-gold">{section.icon}</span>
              <h3 className="text-gold font-semibold text-sm uppercase tracking-wide">
                {section.title}
              </h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {section.content}
            </p>
          </div>
        ))}
      </div>

      {/* Document Footer */}
      <div className="bg-slate-800/50 px-4 py-2 border-t border-slate-700">
        <p className="text-xs text-slate-500 font-mono">
          Ref: VEL-2024-AI-001 | Classification: Client Confidential
        </p>
      </div>
    </div>
  );
}

// Mission Card Component
function MissionCard({ 
  module, 
  status, 
  onClick 
}: { 
  module: typeof modules[0]; 
  status: 'locked' | 'available' | 'complete';
  onClick: () => void;
}) {
  return (
    <div 
      className={cn(
        "relative bg-slate-900/80 border rounded-xl overflow-hidden transition-all duration-300",
        status === 'locked' 
          ? "border-slate-700 opacity-60" 
          : status === 'complete'
          ? "border-green-500/50 hover:border-green-500"
          : "border-slate-700 hover:border-gold hover:shadow-lg hover:shadow-gold/10 cursor-pointer"
      )}
      onClick={status !== 'locked' ? onClick : undefined}
    >
      {/* Status Banner */}
      <div className={cn(
        "absolute top-0 right-0 px-3 py-1 text-xs font-semibold rounded-bl-lg",
        status === 'locked' && "bg-slate-700 text-slate-400",
        status === 'available' && "bg-gold text-navy",
        status === 'complete' && "bg-green-500 text-white"
      )}>
        {status === 'locked' && '🔒 LOCKED'}
        {status === 'available' && '⚡ AVAILABLE'}
        {status === 'complete' && '✓ COMPLETE'}
      </div>

      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          {/* Department Icon */}
          <div className={cn(
            "w-14 h-14 rounded-lg flex items-center justify-center text-2xl shrink-0",
            status === 'complete' 
              ? "bg-green-500/20 border border-green-500/30" 
              : "bg-navy border border-gold/30"
          )}>
            {module.departmentIcon}
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <p className="text-xs text-gold font-mono uppercase tracking-wider mb-1">
              Module {module.id} — {module.department}
            </p>
            <h4 className="text-lg font-bold text-white mb-1">
              {module.title}
            </h4>
            <p className="text-sm text-slate-400">
              {module.problem}
            </p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
          <span className="flex items-center gap-1">
            <span className="text-gold">⚡</span> {module.xpAvailable} XP
          </span>
          <span className="flex items-center gap-1">
            <span className="text-gold">⏱</span> {module.estimatedTime}
          </span>
          <span className={cn(
            "px-2 py-0.5 rounded",
            module.difficulty === 'Foundation' && "bg-green-500/20 text-green-400",
            module.difficulty === 'Intermediate' && "bg-gold/20 text-gold",
            module.difficulty === 'Advanced' && "bg-red-500/20 text-red-400"
          )}>
            {module.difficulty}
          </span>
        </div>

        {/* Badge Preview */}
        {status === 'complete' && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <span>🏅</span>
            <span>{module.badge} Earned</span>
          </div>
        )}

        {/* Start Button */}
        {status === 'available' && (
          <button className="w-full py-2 bg-gold text-navy rounded-lg font-semibold text-sm hover:bg-gold-light transition-colors mt-2">
            Begin Mission →
          </button>
        )}
      </div>
    </div>
  );
}

export default function Course2Page() {
  const router = useRouter();
  const { progress, isLoaded, updateProgress, addXP, addBadge, completeModule2 } = useAcademyProgress();
  
  const [briefAccepted, setBriefAccepted] = useState(false);
  const [highlightedModule, setHighlightedModule] = useState<number | null>(null);
  const [isAccepting, setIsAccepting] = useState(false);

  // Load brief acceptance state
  useEffect(() => {
    const saved = localStorage.getItem('velara-brief-accepted');
    if (saved === 'true') {
      setBriefAccepted(true);
    }
  }, []);

  // Redirect if not registered
  useEffect(() => {
    if (isLoaded && !progress.studentName) {
      router.push('/');
    }
  }, [isLoaded, progress.studentName, router]);

  // Accept the brief
  const handleAcceptBrief = async () => {
    setIsAccepting(true);
    
    // Save to localStorage
    localStorage.setItem('velara-brief-accepted', 'true');
    setBriefAccepted(true);

    // Log to Notion
    await logProgress({
      studentName: progress.studentName,
      studentId: progress.studentId,
      event: 'Case Study Brief Accepted',
      details: 'Student accepted the Velara case study brief',
      totalXP: progress.totalXP,
    });

    setIsAccepting(false);

    // Scroll to mission board
    setTimeout(() => {
      document.getElementById('mission-board')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // Handle module click
  const handleModuleClick = (moduleId: number) => {
    const status = getModuleStatus(moduleId);
    if (status !== 'locked') {
      router.push(`/course2/module${moduleId}`);
    }
  };

  // Get module status
  const getModuleStatus = (moduleId: number): 'locked' | 'available' | 'complete' => {
    if (progress.course2ModulesCompleted.includes(moduleId)) {
      return 'complete';
    }
    if (moduleId === 1 && briefAccepted) {
      return 'available';
    }
    if (moduleId > 1 && progress.course2ModulesCompleted.includes(moduleId - 1)) {
      return 'available';
    }
    return 'locked';
  };

  // Loading state
  if (!isLoaded || !progress.studentName) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-navy/95 border-b border-gold/30 sticky top-0 z-50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-slate-400 hover:text-white transition-colors text-sm"
            >
              ← Dashboard
            </button>
            <span className="text-slate-600">|</span>
            <h1 className="text-white font-bold">Course 2: The Velara Case</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">{progress.studentName}</p>
              <p className="text-gold font-bold text-sm">⭐ {progress.totalXP} XP</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Briefing Room Title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-block px-4 py-1 bg-gold/20 text-gold text-sm font-medium rounded-full mb-3">
            BRIEFING ROOM
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Client Briefing: Velara
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Review the case study materials below. Click on departments in the mind map to explore their AI challenges. 
            Accept the brief to begin your engagement.
          </p>
        </div>

        {/* Two Column Layout: Case Study + Mind Map */}
        <div className="grid lg:grid-cols-2 gap-6 mb-8 animate-fade-in" style={{ animationDelay: '0.1s' }}>
          {/* Left: Case Study Document */}
          <div>
            <CaseStudyDocument highlightedModule={highlightedModule} />
          </div>

          {/* Right: Interactive Mind Map */}
          <div className="bg-slate-900/60 border border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-gold font-semibold text-sm uppercase tracking-wider">
                Organisation Structure
              </h3>
              <span className="text-xs text-slate-500">Click a department to explore</span>
            </div>
            <div className="h-80">
              <MindMap 
                onNodeClick={(id) => setHighlightedModule(id === highlightedModule ? null : id)}
                highlightedModule={highlightedModule}
              />
            </div>
          </div>
        </div>

        {/* Accept Brief Button */}
        {!briefAccepted && (
          <div className="text-center mb-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <button
              onClick={handleAcceptBrief}
              disabled={isAccepting}
              className={cn(
                "px-12 py-4 bg-gold text-navy rounded-lg font-bold text-lg transition-all",
                "hover:bg-gold-light hover:scale-105 active:scale-100",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "shadow-lg shadow-gold/30"
              )}
            >
              {isAccepting ? (
                <span className="flex items-center gap-2">
                  <span className="spinner w-5 h-5" />
                  Processing...
                </span>
              ) : (
                'Accept the Brief'
              )}
            </button>
            <p className="text-slate-500 text-sm mt-3">
              By accepting, you confirm you have reviewed the case materials
            </p>
          </div>
        )}

        {/* Mission Board */}
        <div id="mission-board" className={cn(
          "transition-all duration-500",
          !briefAccepted && "opacity-50 pointer-events-none"
        )}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-white">Mission Board</h3>
              <p className="text-slate-400 text-sm">Complete each module to help Velara transform their AI capabilities</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Progress</p>
              <p className="text-gold font-bold">{progress.course2ModulesCompleted.length}/5 Modules</p>
            </div>
          </div>

          <div className="space-y-4">
            {modules.map((module) => (
              <MissionCard
                key={module.id}
                module={module}
                status={getModuleStatus(module.id)}
                onClick={() => handleModuleClick(module.id)}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm text-slate-500">
            © 2025 SwipeUp AI Society • University of Law
          </p>
        </div>
      </footer>
    </div>
  );
}
