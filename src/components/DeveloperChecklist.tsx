import React, { useState } from 'react';
import { 
  CheckSquare, 
  CheckCircle2, 
  Play, 
  RefreshCw, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  ShieldCheck, 
  Zap,
  Cpu
} from 'lucide-react';
import { DevTaskItem } from '../types';

interface DeveloperChecklistProps {
  onRunTest: (taskId: string) => Promise<{ passed: boolean; latencyMs: number; details: string }>;
}

export const DeveloperChecklist: React.FC<DeveloperChecklistProps> = ({ onRunTest }) => {
  const [tasks, setTasks] = useState<DevTaskItem[]>([
    // Category 1: Foundation & Platform Infrastructure
    {
      id: 'task-eureka',
      category: 'Foundation & Platform Infrastructure',
      title: 'Platform Service Directory & Health Registry',
      description: 'Connects all platform services into a central directory with real-time health checks every 30 seconds.',
      completed: true,
      springAnnotation: 'Service Discovery Registry',
      codeSnippet: `Service Directory:
  Status: Active & Registered
  Heartbeat Monitoring: Every 30 seconds
  Self-Healing Failover: Enabled
  Active Nodes: 5 connected application services`,
      testEndpoint: { method: 'GET', path: '/api/eureka/apps' }
    },
    {
      id: 'task-gateway',
      category: 'Foundation & Platform Infrastructure',
      title: 'Central Network Router & Traffic Protection',
      description: 'Directs incoming requests to appropriate services while verifying security permissions and session health.',
      completed: true,
      springAnnotation: 'Dynamic Request Routing',
      codeSnippet: `Network Router Configuration:
  Security Validation: Enforces role permissions on every request
  Target Routing: Maps candidate and recruiter dashboards to secure endpoints
  Protection: Blocks unauthorized traffic and rate-limits requests`,
      testEndpoint: { method: 'GET', path: '/api/gateway/routes' }
    },
    {
      id: 'task-docker',
      category: 'Foundation & Platform Infrastructure',
      title: 'Isolated Data Storage Architecture',
      description: 'Dedicated database storage for applicant data, skill verification tests, and user security accounts.',
      completed: true,
      springAnnotation: 'Isolated Per-Service Storage',
      codeSnippet: `Storage Configuration:
  Applicant Database: Stores resumes, job postings, and scoring results
  Challenge Database: Stores verification questions and test scores
  Security Database: Stores encrypted user credentials and permissions`,
      testEndpoint: { method: 'GET', path: '/api/health' }
    },
    {
      id: 'task-auth',
      category: 'Foundation & Platform Infrastructure',
      title: 'User Authentication & Role-Based Access Control',
      description: 'Secures candidate and recruiter logins, ensuring users only access their authorized portal and data.',
      completed: true,
      springAnnotation: 'Secure Session Management',
      codeSnippet: `Authentication Engine:
  Token Protection: Digitally signed session authorization
  Role Permissions: Strict separation between Recruiter and Candidate views
  Session Expiry: Automatic expiration and renewal for account protection`,
      testEndpoint: { method: 'POST', path: '/api/auth/token' }
    },

    // Category 2: Application Scoring & Candidate Processing
    {
      id: 'task-ocr',
      category: 'Application Scoring & Candidate Processing',
      title: 'Phase-1: Resume Scanning & Text Extraction',
      description: 'Scans uploaded resumes and extracts profile information with high text recognition accuracy.',
      completed: true,
      springAnnotation: 'Document Scanning Engine',
      codeSnippet: `Ingestion Phase:
  Input: PDF, DOCX, TXT candidate resume documents
  Output: Clean extracted text stream
  Accuracy Target: > 95% text recognition confidence`,
      testEndpoint: { method: 'GET', path: '/api/health' }
    },
    {
      id: 'task-cleansing',
      category: 'Application Scoring & Candidate Processing',
      title: 'Phase-2: Profile Cleansing & Privacy Masking',
      description: 'Normalizes resume formatting, removes special symbol artifacts, and safeguards personal candidate information.',
      completed: true,
      springAnnotation: 'Data Cleansing & Privacy Safeguards',
      codeSnippet: `Cleansing Phase:
  Noise Removal: Strips formatting artifacts and irregular characters
  Privacy Safeguard: Masks sensitive personal identifying information
  Structure: Standardizes work history, education, and skill categories`,
      testEndpoint: { method: 'GET', path: '/api/health' }
    },
    {
      id: 'task-features',
      category: 'Application Scoring & Candidate Processing',
      title: 'Phase-3: Skills & Experience Matching',
      description: 'Identifies core competencies against job descriptions and computes verified years of professional experience.',
      completed: true,
      springAnnotation: 'Competency Matching Algorithm',
      codeSnippet: `Matching Phase:
  Skill Detection: Identifies required skills from job postings
  Experience Calculation: Measures chronological tenure across roles
  Missing Skill Detection: Pinpoints key qualifications for challenge generation`,
      testEndpoint: { method: 'GET', path: '/api/health' }
    },
    {
      id: 'task-ats',
      category: 'Application Scoring & Candidate Processing',
      title: 'Candidate Scoring & Threshold Classification',
      description: 'Calculates applicant match score and classifies results into Shortlisted (≥75%), Borderline (60-74%), or Review.',
      completed: true,
      springAnnotation: 'Automated Scoring Engine',
      codeSnippet: `Scoring Classification:
  Direct Shortlist: Scores 75% - 100% (Directly qualified for interview)
  Borderline Range: Scores 60% - 74% (Eligible for skill verification boost)
  Standard Review: Scores below 60% (Sent for manual recruiter review)`,
      testEndpoint: { method: 'POST', path: '/api/jobs/1/apply' }
    },

    // Category 3: Real-Time Communication & Alerts
    {
      id: 'task-kafka-producer',
      category: 'Real-Time Communication & Alerts',
      title: 'Event Broadcaster: Skill Verification Triggers',
      description: 'Broadcasts instant notifications when a borderline candidate qualifies for a verification challenge.',
      completed: true,
      springAnnotation: 'Real-Time Event Dispatch',
      codeSnippet: `Event Dispatch:
  Trigger: Candidate scores within 60% - 74%
  Payload: Candidate ID, job requirements, and missing skill areas
  Action: Dispatches event without slowing down recruiter browsing`,
      testEndpoint: { method: 'POST', path: '/api/kafka/events' }
    },
    {
      id: 'task-kafka-consumer',
      category: 'Real-Time Communication & Alerts',
      title: 'Notification Service: Automated Candidate Invitations',
      description: 'Dispatches instant assessment invitations and secure, timed challenge links directly to candidates.',
      completed: true,
      springAnnotation: 'Automated Alert Delivery',
      codeSnippet: `Notification Delivery:
  Delivery Speed: Immediate dispatch upon qualification
  Assessment Link: Secure, single-use 15-minute verification link
  Channels: Email alert and in-app candidate dashboard banner`,
      testEndpoint: { method: 'GET', path: '/api/kafka/events' }
    },

    // Category 4: System Verification & Quality Assurance
    {
      id: 'task-tests',
      category: 'System Verification & Quality Assurance',
      title: 'End-to-End System Integration Tests',
      description: 'Comprehensive test suite verifying the complete candidate journey from application to score boost.',
      completed: true,
      springAnnotation: 'Automated Integration Testing',
      codeSnippet: `System Verification Tests:
  Test 1: Borderline application triggers challenge notification
  Test 2: Completing challenge adds merit points to candidate score
  Test 3: Recruiter dashboard updates in real-time with new rankings`,
      testEndpoint: { method: 'GET', path: '/api/health' }
    },
    {
      id: 'task-security',
      category: 'System Verification & Quality Assurance',
      title: 'Automated Security & Data Protection Audit',
      description: 'Scans platform configuration to ensure strong authentication, encrypted storage, and role enforcement.',
      completed: true,
      springAnnotation: 'Security & Access Audit',
      codeSnippet: `Security Validation:
  Data Encryption: Protects sensitive candidate and company records
  Role Guard: Prevents unauthorized cross-role data access
  Token Verification: Rejects expired or tampered session credentials`,
      testEndpoint: { method: 'GET', path: '/api/health' }
    }
  ]);

  const [expandedTaskId, setExpandedTaskId] = useState<string | null>('task-eureka');
  const [testResults, setTestResults] = useState<Record<string, { passed: boolean; latencyMs: number; details: string }>>({});
  const [isTesting, setIsTesting] = useState<Record<string, boolean>>({});

  const categories = [
    'Foundation & Platform Infrastructure',
    'Application Scoring & Candidate Processing',
    'Real-Time Communication & Alerts',
    'System Verification & Quality Assurance'
  ];

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleRunSingleTest = async (taskId: string) => {
    setIsTesting(prev => ({ ...prev, [taskId]: true }));
    try {
      const res = await onRunTest(taskId);
      setTestResults(prev => ({ ...prev, [taskId]: res }));
    } finally {
      setIsTesting(prev => ({ ...prev, [taskId]: false }));
    }
  };

  const handleRunAllTests = async () => {
    for (const task of tasks) {
      await handleRunSingleTest(task.id);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.completed).length;
  const percentComplete = Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="space-y-6 pb-12">
      
      {/* Header Banner with Overall Progress */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
              <CheckSquare className="h-6 w-6 text-orange-600" />
              Platform Verification & System Health Suite
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time verification of all core platform capabilities and live operational readiness checks.
            </p>
          </div>

          <button
            id="run-all-tests-btn"
            onClick={handleRunAllTests}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm shadow-orange-600/20 flex items-center gap-2 transition self-start sm:self-auto"
          >
            <Play className="h-4 w-4" />
            Run Full Automated Verification
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4">
          <div className="flex-1 bg-slate-100 rounded-full h-2.5 border border-slate-200 overflow-hidden">
            <div 
              className="bg-orange-500 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            ></div>
          </div>
          <span className="text-xs font-bold text-emerald-700 whitespace-nowrap">
            {completedTasks}/{totalTasks} Complete ({percentComplete}%)
          </span>
        </div>
      </div>

      {/* Task Categories Grid */}
      <div className="space-y-5">
        {categories.map((category, catIdx) => {
          const categoryTasks = tasks.filter(t => t.category === category);
          const categoryCompleted = categoryTasks.filter(t => t.completed).length;

          return (
            <div key={category} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
              
              {/* Category Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-lg bg-orange-100 text-orange-800 flex items-center justify-center text-xs font-bold">
                    {catIdx + 1}
                  </span>
                  {category}
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {categoryCompleted}/{categoryTasks.length} Ready
                </span>
              </div>

              {/* Task Items */}
              <div className="space-y-3">
                {categoryTasks.map(task => {
                  const isExpanded = expandedTaskId === task.id;
                  const result = testResults[task.id];
                  const testing = isTesting[task.id];

                  return (
                    <div 
                      key={task.id}
                      className={`border rounded-2xl transition overflow-hidden ${
                        task.completed 
                          ? 'border-slate-200 bg-white hover:border-slate-300' 
                          : 'border-amber-200 bg-amber-50/20'
                      }`}
                    >
                      <div className="p-4 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          
                          {/* Checkbox */}
                          <button
                            onClick={() => handleToggleTask(task.id)}
                            className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition shrink-0 ${
                              task.completed 
                                ? 'bg-orange-600 border-orange-600 text-white' 
                                : 'border-slate-300 hover:border-slate-400 bg-white'
                            }`}
                          >
                            {task.completed && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                          </button>

                          {/* Task Info */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs font-bold ${task.completed ? 'text-slate-900' : 'text-slate-600'}`}>
                                {task.title}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold border border-slate-200">
                                {task.springAnnotation}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500">
                              {task.description}
                            </p>
                          </div>
                        </div>

                        {/* Actions: Run Live Test & Expand */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleRunSingleTest(task.id)}
                            disabled={testing}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                              result?.passed 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : result?.passed === false
                                ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {testing ? (
                              <>
                                <RefreshCw className="h-3 w-3 animate-spin" />
                                Testing...
                              </>
                            ) : result ? (
                              <>
                                <CheckCircle2 className="h-3 w-3" />
                                {result.passed ? 'Healthy' : 'Error'} ({result.latencyMs}ms)
                              </>
                            ) : (
                              <>
                                <Play className="h-3 w-3" />
                                Test System
                              </>
                            )}
                          </button>

                          <button
                            onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Details & Verification Criteria */}
                      {isExpanded && (
                        <div className="p-4 bg-slate-50/80 border-t border-slate-200 space-y-3">
                          <div className="flex items-center justify-between text-xs text-slate-500">
                            <span className="font-bold flex items-center gap-1.5 text-slate-700">
                              <Cpu className="h-3.5 w-3.5 text-orange-600" />
                              System Verification Criteria:
                            </span>
                            <span>Endpoint: <strong>{task.testEndpoint.method} {task.testEndpoint.path}</strong></span>
                          </div>

                          <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs whitespace-pre font-mono overflow-x-auto">
                            {task.codeSnippet}
                          </div>

                          {result && (
                            <div className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                              result.passed 
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
                                : 'bg-rose-50 text-rose-800 border-rose-200'
                            }`}>
                              <span className="font-medium">{result.details}</span>
                              <span className="font-bold">Execution Time: {result.latencyMs}ms</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
