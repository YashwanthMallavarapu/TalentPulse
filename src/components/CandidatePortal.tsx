import React, { useState, useEffect } from 'react';
import { 
  JobPosting, 
  CandidateApplication, 
  MicroChallenge, 
  ChallengeQuestion,
  PreProcessingResult 
} from '../types';
import { 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Zap, 
  Clock, 
  Code, 
  Sparkles, 
  Send, 
  ArrowRight, 
  TrendingUp, 
  Award, 
  Check, 
  FileText, 
  BrainCircuit, 
  ChevronRight,
  ShieldAlert,
  Flame,
  UserCheck,
  Scan,
  Database,
  Layers,
  Cpu,
  UploadCloud,
  FileUp,
  FileCheck,
  Trash2,
  Eye,
  EyeOff,
  Paperclip,
  Loader2
} from 'lucide-react';

interface CandidatePortalProps {
  jobs: JobPosting[];
  applications: CandidateApplication[];
  activeChallenge: MicroChallenge | null;
  onApply: (jobId: string, candidateData: {
    candidateName: string;
    candidateEmail: string;
    candidateTitle: string;
    resumeText: string;
    yearsExperience: number;
  }) => Promise<any>;
  onStartChallenge: (challengeId: string) => Promise<void>;
  onSubmitChallenge: (challengeId: string, answers: Record<string, number>) => Promise<any>;
  onSelectChallenge: (challenge: MicroChallenge) => void;
  onCloseChallengeModal: () => void;
}

export const CandidatePortal: React.FC<CandidatePortalProps> = ({
  jobs,
  applications,
  activeChallenge,
  onApply,
  onStartChallenge,
  onSubmitChallenge,
  onSelectChallenge,
  onCloseChallengeModal
}) => {
  const [selectedJob, setSelectedJob] = useState<JobPosting>(jobs[0] || null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [candidateName, setCandidateName] = useState('Devon Vance');
  const [candidateEmail, setCandidateEmail] = useState('devon.vance@example.com');
  const [candidateTitle, setCandidateTitle] = useState('Java Software Engineer');
  const [yearsExperience, setYearsExperience] = useState(4);
  const [datasetSource, setDatasetSource] = useState('CHBMIT Dataset / Profile #04');
  const [resumeText, setResumeText] = useState(
    'Java Developer with 4 years building enterprise RESTful APIs with Spring Boot and PostgreSQL. Experienced in Docker containerization and Git workflows. Looking to deepen Apache Kafka and microservices experience.'
  );

  // Resume File State (PDF preferred, DOCX, TXT)
  const [resumeFileName, setResumeFileName] = useState<string>('Devon_Vance_Resume.pdf');
  const [resumeFileSize, setResumeFileSize] = useState<string>('124 KB');
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [fileParseError, setFileParseError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [showExtractedPreview, setShowExtractedPreview] = useState<boolean>(false);

  const SAMPLE_RESUMES = [
    {
      fileName: 'Devon_Vance_Resume.pdf',
      fileSize: '142 KB',
      candidateName: 'Devon Vance',
      candidateEmail: 'devon.vance@example.com',
      candidateTitle: 'Java Software Engineer',
      yearsExperience: 4,
      datasetSource: 'Devon Vance (Target: Borderline Boost)',
      text: 'Devon Vance\nTitle: Java Software Engineer\nEmail: devon.vance@example.com\nExperience: 4 years of professional experience building enterprise RESTful APIs with Spring Boot, Java 17, and PostgreSQL. Experienced in Docker containerization, Git workflows, and CI/CD pipelines. Looking to deepen Apache Kafka and microservices experience.\nCore Skills: Java 17, Spring Boot, REST APIs, PostgreSQL, Docker, Git.'
    },
    {
      fileName: 'Elena_Rostova_Resume.pdf',
      fileSize: '215 KB',
      candidateName: 'Elena Rostova',
      candidateEmail: 'elena.rostova@example.com',
      candidateTitle: 'Lead Distributed Systems Architect',
      yearsExperience: 8,
      datasetSource: 'Elena Rostova (Target: Direct Shortlist)',
      text: 'Elena Rostova\nTitle: Lead Distributed Systems Architect\nEmail: elena.rostova@example.com\nExperience: 8 years designing resilient high-throughput distributed systems. Expert in Java 17, Spring Boot, Apache Kafka, Microservices architecture, Docker, Kubernetes, and PostgreSQL.\nCore Skills: Java 17, Spring Boot, Apache Kafka, Microservices, PostgreSQL, Docker, Kubernetes, Distributed Systems, CI/CD, Redis, REST APIs.'
    },
    {
      fileName: 'Marcus_Sterling_Resume.pdf',
      fileSize: '95 KB',
      candidateName: 'Marcus Sterling',
      candidateEmail: 'marcus.sterling@example.com',
      candidateTitle: 'Junior Web Assistant',
      yearsExperience: 1,
      datasetSource: 'Marcus Sterling (Target: Reject)',
      text: 'Marcus Sterling\nTitle: Junior Web Assistant\nEmail: marcus.sterling@example.com\nExperience: 1 year writing basic HTML, CSS, JavaScript, and markdown scripts. Basic Git awareness.\nCore Skills: HTML, CSS, JavaScript, Git.'
    }
  ];

  const handleSelectSampleResume = (sample: typeof SAMPLE_RESUMES[0]) => {
    setResumeFileName(sample.fileName);
    setResumeFileSize(sample.fileSize);
    setCandidateName(sample.candidateName);
    setCandidateEmail(sample.candidateEmail);
    setCandidateTitle(sample.candidateTitle);
    setYearsExperience(sample.yearsExperience);
    setResumeText(sample.text);
    setDatasetSource(sample.datasetSource);
    setPreProcessingResult(null);
    setFileParseError(null);
  };

  const handleProcessUploadedFile = async (file: File) => {
    if (!file) return;
    setIsParsingFile(true);
    setFileParseError(null);
    setResumeFileName(file.name);
    setResumeFileSize(`${Math.round(file.size / 1024)} KB`);

    // Plain text reading
    if (file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain') {
      try {
        const text = await file.text();
        setResumeText(text);
        const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
        if (emailMatch) setCandidateEmail(emailMatch[0]);
        const expMatch = text.match(/(\d{1,2})\+?\s*(?:years?|yrs?)(?:\s+of)?(?:\s+(?:professional\s+)?experience)?/i);
        if (expMatch) setYearsExperience(parseInt(expMatch[1], 10));
        setIsParsingFile(false);
      } catch (err: any) {
        setFileParseError('Failed to read text file: ' + err.message);
        setIsParsingFile(false);
      }
      return;
    }

    // PDF or other document via parse API
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const res = await fetch('/api/resumes/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            fileName: file.name
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.extractedText) {
            setResumeText(data.extractedText);
            if (data.detectedEmail) setCandidateEmail(data.detectedEmail);
            if (data.detectedExperience) setYearsExperience(data.detectedExperience);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          setFileParseError(errData.error || 'Failed to parse resume document.');
        }
      } catch (err: any) {
        setFileParseError('Error parsing resume file: ' + err.message);
      } finally {
        setIsParsingFile(false);
      }
    };
    reader.onerror = () => {
      setFileParseError('Could not read the uploaded file.');
      setIsParsingFile(false);
    };
    reader.readAsDataURL(file);
  };

  // Pre-Processing Pipeline State (Phase-1, Phase-2, Phase-3)
  const [preProcessingResult, setPreProcessingResult] = useState<PreProcessingResult | null>(null);
  const [isPreProcessing, setIsPreProcessing] = useState(false);
  const [chbmitSamples, setChbmitSamples] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/preprocessing/chbmit-samples')
      .then(async r => {
        if (!r.ok) return [];
        const ct = r.headers.get('content-type');
        if (ct && !ct.includes('application/json')) return [];
        return await r.json();
      })
      .then(data => {
        if (Array.isArray(data)) setChbmitSamples(data);
      })
      .catch(err => console.warn('Could not load CHBMIT samples:', err));
  }, []);

  const selectChbmitProfile = (profile: any) => {
    setCandidateName(profile.candidateName);
    setCandidateEmail(profile.candidateEmail);
    setCandidateTitle(profile.candidateTitle);
    setYearsExperience(profile.yearsExperience);
    setResumeText(profile.rawText);
    setDatasetSource(profile.datasetSource);
    setPreProcessingResult(null);
  };

  const handleRunPreProcessingOnly = async () => {
    setIsPreProcessing(true);
    try {
      const res = await fetch('/api/preprocessing/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName,
          resumeText,
          datasetSource
        })
      });
      if (res.ok) {
        const ct = res.headers.get('content-type');
        if (ct && ct.includes('application/json')) {
          const data = await res.json();
          setPreProcessingResult(data);
        }
      }
    } catch (err) {
      console.error('Error running preprocessing pipeline:', err);
    } finally {
      setIsPreProcessing(false);
    }
  };

  // Live Evaluation Feedback Banner
  const [latestResult, setLatestResult] = useState<{
    application: CandidateApplication;
    challenge: MicroChallenge | null;
    message: string;
  } | null>(null);

  // Challenge Taking State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [challengeResult, setChallengeResult] = useState<any | null>(null);
  const [quizTimerSeconds, setQuizTimerSeconds] = useState<number>(300);

  useEffect(() => {
    if (!activeChallenge || challengeResult) return;
    setQuizTimerSeconds(300);
    const timer = setInterval(() => {
      setQuizTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [activeChallenge?.id, challengeResult]);

  const formatQuizTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Persona Presets
  const applyPersona = (type: 'borderline' | 'shortlist' | 'reject') => {
    if (type === 'borderline') {
      setCandidateName('Devon Vance');
      setCandidateEmail('devon.vance@example.com');
      setCandidateTitle('Java Software Engineer');
      setYearsExperience(4);
      setResumeText(
        'Java Developer with 4 years building enterprise RESTful APIs with Spring Boot and PostgreSQL. Experienced in Docker containerization and Git workflows. Looking to deepen Apache Kafka and microservices experience.'
      );
    } else if (type === 'shortlist') {
      setCandidateName('Elena Rostova');
      setCandidateEmail('elena.rostova@example.com');
      setCandidateTitle('Lead Backend Developer');
      setYearsExperience(6);
      setResumeText(
        'Senior Backend Developer with 6 years experience in Java 17, Spring Boot, Apache Kafka, Microservices architecture, Docker, and PostgreSQL. Built scalable distributed payment rails with Redis caching and Spring Cloud Gateway.'
      );
    } else if (type === 'reject') {
      setCandidateName('Marcus Sterling');
      setCandidateEmail('marcus.s@example.com');
      setCandidateTitle('Junior Java Programmer');
      setYearsExperience(1);
      setResumeText(
        'Junior programmer with 1 year experience writing basic core Java console scripts and introductory HTML/CSS. Completed university coursework in algorithms.'
      );
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    setIsSubmitting(true);
    try {
      const res = await onApply(selectedJob.id, {
        candidateName,
        candidateEmail,
        candidateTitle,
        resumeText,
        yearsExperience: Number(yearsExperience)
      });
      setLatestResult(res);
      setShowApplyModal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
    if (!activeChallenge) return;
    setIsSubmitting(true);
    try {
      const res = await onSubmitChallenge(activeChallenge.id, selectedAnswers);
      setChallengeResult(res);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Dark Hero Banner matching Image 1 */}
      <div className="relative overflow-hidden rounded-3xl bg-[#0c1322] border border-[#1e293b] p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/40 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            Borderline Boost Interceptor
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Turn ATS Rejections Into <span className="text-orange-500">Merit-Based Second Chances</span>
          </h1>
          <p className="mt-3 text-slate-400 text-sm sm:text-base leading-relaxed">
            Candidates scoring just below the shortlisting threshold (e.g. 60–74%) aren't rejected. Our event-driven Kafka engine intercepts the application, generates a targeted 15-minute technical micro-challenge for missing skills, and awards a score boost directly into the shortlist!
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              id="hero-apply-btn"
              onClick={() => {
                setSelectedJob(jobs[0]);
                setShowApplyModal(true);
              }}
              className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-600/30 flex items-center gap-2 transition"
            >
              <FileText className="h-4 w-4" />
              Apply with Resume & Test ATS
            </button>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300 bg-[#080d19] px-3.5 py-2 rounded-xl border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Thresholds: Shortlist &ge; 75% | Borderline 60–74% | Max Boost +16%
            </div>
          </div>
        </div>
      </div>

      {/* Open Engineering Roles with Borderline Boost Active (matches Image 1) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-orange-500" />
              Open Engineering Roles with Borderline Boost Active
            </h2>
            <p className="text-xs text-slate-400">Select any position to test the candidate application and ATS scoring workflow</p>
          </div>
          <span className="text-xs font-mono text-slate-400 bg-[#0c1322] px-3 py-1 rounded-lg border border-slate-800 shadow-2xs">
            {jobs.length} Positions Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.map(job => (
            <div
              key={job.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between bg-[#0c1322] ${
                selectedJob?.id === job.id
                  ? 'border-orange-500 ring-1 ring-orange-500/40 shadow-xl shadow-orange-950/20'
                  : 'border-[#1e293b] hover:border-slate-700 shadow-2xs hover:shadow-xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-mono text-slate-400 font-medium">
                    {job.department}
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    {job.salary}
                  </span>
                </div>

                <h3 className="font-bold text-white text-base leading-snug">
                  {job.title}
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-3 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                {/* Skills pills */}
                <div className="space-y-2 mb-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block mb-1">
                      Required Skills:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {job.requiredSkills.map(skill => (
                        <span key={skill} className="text-[11px] px-2 py-0.5 rounded-md bg-[#080d19] text-slate-300 font-medium border border-slate-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Threshold specifications */}
                <div className="p-3 rounded-xl bg-[#080d19] border border-slate-800/80 text-[11px] font-mono text-slate-400 space-y-1.5 mb-4">
                  <div className="flex justify-between">
                    <span>Shortlist Cutoff:</span>
                    <span className="text-emerald-400 font-bold">&ge; {job.shortlistThreshold}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Borderline Window:</span>
                    <span className="text-orange-400 font-bold">{job.borderlineThreshold}% – {job.shortlistThreshold - 1}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Boost Delta:</span>
                    <span className="text-amber-400 font-bold">+{job.maxBoostDelta}% Score</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    setSelectedJob(job);
                    setShowApplyModal(true);
                  }}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                    selectedJob?.id === job.id
                      ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-md shadow-orange-600/30'
                      : 'bg-[#0e1628] hover:bg-[#141f38] text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Apply & Evaluate ATS <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Application History Table (matches Image 1) */}
      <div className="bg-[#0c1322] border border-[#1e293b] rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-500" />
              Recent Candidate ATS Ingestions & Boost Outings
            </h2>
            <p className="text-xs text-slate-400">Applications processed through ATS scoring, Kafka event emission, and micro-challenge boosts</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 bg-[#080d19] uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Candidate</th>
                <th className="py-3 px-4">Target Job</th>
                <th className="py-3 px-4">Base Score</th>
                <th className="py-3 px-4">Boost Delta</th>
                <th className="py-3 px-4">Final Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {applications.map(app => {
                const job = jobs.find(j => j.id === app.jobId);
                return (
                  <tr key={app.id} className="hover:bg-[#10192d] transition">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{app.candidateName}</div>
                      <div className="text-[11px] text-slate-400">{app.candidateEmail}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-300">
                      {job?.title || 'Senior Software Engineer'}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-white">
                      {app.baseScore}%
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {app.boostDelta ? (
                        <span className="text-emerald-400 font-bold">+{app.boostDelta}%</span>
                      ) : (
                        <span className="text-slate-600 font-mono">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-white">
                      {app.finalScore ? (
                        <span>{app.finalScore}%</span>
                      ) : (
                        <span>{app.baseScore}%</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        app.status === 'SHORTLISTED'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/80'
                          : app.status === 'BOOSTED_SHORTLISTED'
                          ? 'bg-amber-950/60 text-amber-400 border border-amber-800/80 font-extrabold'
                          : app.status === 'BORDERLINE'
                          ? 'bg-orange-950/60 text-orange-400 border border-orange-800/80'
                          : 'bg-rose-950/60 text-rose-400 border border-rose-800/80'
                      }`}>
                        {app.status === 'BOOSTED_SHORTLISTED' && <Award className="h-3 w-3 text-amber-400" />}
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {app.challengeId && (
                        <button
                          onClick={() => {
                            onSelectChallenge({
                              id: app.challengeId!,
                              applicationId: app.id,
                              jobId: app.jobId,
                              candidateName: app.candidateName,
                              targetSkills: app.missingSkills,
                              questions: [],
                              timeLimitMinutes: 15,
                              status: app.boostCompletedAt ? 'COMPLETED' : 'PENDING'
                            });
                            onStartChallenge(app.challengeId!);
                          }}
                          className="px-3 py-1.5 rounded-xl border border-orange-500/60 text-orange-400 hover:bg-orange-500/10 font-bold text-[11px] transition"
                        >
                          View Challenge
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Latest Evaluation Result Feedback Banner (if active) */}
      {latestResult && (
        <div className={`p-5 rounded-2xl border transition-all shadow-xl ${
          latestResult.application.status === 'SHORTLISTED'
            ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
            : latestResult.application.status === 'BORDERLINE'
            ? 'bg-orange-950/40 border-orange-800/80 text-orange-200'
            : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
        }`}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              {latestResult.application.status === 'SHORTLISTED' ? (
                <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0 mt-0.5" />
              ) : latestResult.application.status === 'BORDERLINE' ? (
                <div className="h-9 w-9 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-xs animate-bounce">
                  <Flame className="h-5 w-5" />
                </div>
              ) : (
                <XCircle className="h-8 w-8 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-white">
                    Application Result for {latestResult.application.candidateName}
                  </h3>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    latestResult.application.status === 'SHORTLISTED'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : latestResult.application.status === 'BORDERLINE'
                      ? 'bg-orange-950/80 text-orange-400 border border-orange-800'
                      : 'bg-rose-950/80 text-rose-400 border border-rose-800'
                  }`}>
                    {latestResult.application.status} • {latestResult.application.baseScore}% Score
                  </span>
                </div>
                
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {latestResult.application.status === 'BORDERLINE' 
                    ? `Candidate fell within the Borderline range (Base: ${latestResult.application.baseScore}% vs Cutoff 75%). Missing skills detected: ${latestResult.application.missingSkills.join(', ')}. Verification challenge automatically generated!`
                    : latestResult.message}
                </p>

                {/* Score breakdown metrics */}
                <div className="flex items-center gap-4 mt-2 text-xs font-mono text-slate-400">
                  <span>Skills Match: <strong className="text-white">{latestResult.application.scoreBreakdown.skillMatchScore}%</strong></span>
                  <span>Experience: <strong className="text-white">{latestResult.application.scoreBreakdown.experienceScore}%</strong></span>
                  <span>Bonus: <strong className="text-emerald-400">+{latestResult.application.scoreBreakdown.preferredSkillBonus}%</strong></span>
                </div>
              </div>
            </div>

            {/* If Borderline, Show Launch Challenge Action */}
            {latestResult.application.status === 'BORDERLINE' && latestResult.challenge && (
              <div className="shrink-0 flex items-center gap-3">
                <button
                  id="launch-boost-challenge-btn"
                  onClick={() => {
                    onSelectChallenge(latestResult.challenge!);
                    onStartChallenge(latestResult.challenge!.id);
                  }}
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-orange-600/30 flex items-center gap-2 transition"
                >
                  <Zap className="h-4 w-4" />
                  Launch Micro-Challenge (+{selectedJob?.maxBoostDelta || 16}% Boost)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Interactive Workflow Architecture Pipeline (Diagram Specification) */}
      <div className="bg-[#0c1322] border border-[#1e293b] rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase font-mono px-2 py-0.5 rounded-md bg-orange-950/60 text-orange-400 border border-orange-500/40">
                End-to-End SOA Execution Workflow
              </span>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded-md border border-emerald-800/60 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Services Active
              </span>
            </div>
            <h2 className="text-base font-extrabold text-white mt-1">
              Resume Scanning & Candidate Evaluation Workflow
            </h2>
            <p className="text-xs text-slate-400">
              Direct mapping of input resumes, scanning extraction, cleansing, scoring threshold evaluation, and automated borderline skill challenges.
            </p>
          </div>
        </div>

        {/* 5 Architectural Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-1">
          {/* Step 1 */}
          <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-500">Step 01</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/60 text-blue-400 border border-blue-800/50 font-bold">Input Data</span>
              </div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5 text-blue-400" /> CHBMIT / Profiles
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Raw candidate resumes or standard benchmark profiles ingested via API Gateway.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500">
              API Gateway
            </div>
          </div>

          {/* Step 2 */}
          <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-orange-400">Step 02</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-orange-950/60 text-orange-400 border border-orange-500/40 font-bold">Phase 1-3</span>
              </div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Scan className="h-3.5 w-3.5 text-orange-400" /> Pre-Processing Pipeline
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Phase-1 OCR (confidence score), Phase-2 Cleansing & PII strip, Phase-3 Skill extraction.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-orange-400 font-bold">
              PREPROCESSING-SERVICE
            </div>
          </div>

          {/* Step 3 */}
          <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-amber-400">Step 03</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-950/60 text-amber-400 border border-amber-800/50 font-bold">Decision</span>
              </div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <BrainCircuit className="h-3.5 w-3.5 text-amber-400" /> ATS Match Engine
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                &ge;75% Direct Shortlist<br />
                60-74% Borderline Alert<br />
                &lt;60% Direct Rejection
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-amber-400 font-bold">
              JOB-ATS-SERVICE
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-400">Step 04</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/60 text-rose-400 border border-rose-800/50 font-bold">Borderline</span>
              </div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-rose-400" /> Event-Driven Boost
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Applications scoring 60-74% emit candidate.borderline events to Kafka topic for challenge generation.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-rose-400 font-bold">
              EVENT-BUS / KAFKA
            </div>
          </div>

          {/* Step 5 */}
          <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-400">Step 05</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/60 text-emerald-400 border border-emerald-800/50 font-bold">Elevation</span>
              </div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Award className="h-3.5 w-3.5 text-emerald-400" /> Shortlist Elevation
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Candidate completes micro-challenge; scores boosted into the shortlist with audit trails.
              </p>
            </div>
            <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400 font-bold">
              RECRUITER-PORTAL
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. APPLY MODAL (Dark Enterprise Themed) */}
      {/* ========================================================================= */}
      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0c1322] border border-[#1e293b] rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-white">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Submit Candidate Application & Test ATS
                </h3>
                <p className="text-xs text-slate-400">Position: {selectedJob.title}</p>
              </div>
              <button
                onClick={() => setShowApplyModal(false)}
                className="text-slate-400 hover:text-white p-1 font-bold text-base transition"
              >
                ✕
              </button>
            </div>

            {/* Persona & CHBMIT Presets */}
            <div className="my-4 p-4 rounded-2xl bg-[#080d19] border border-slate-800 space-y-3">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 font-mono">
                  1-Click CHBMIT & Standard Test Profiles:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => applyPersona('borderline')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      candidateName === 'Devon Vance'
                        ? 'bg-orange-950/60 border-orange-500 text-orange-200 ring-1 ring-orange-500'
                        : 'bg-[#0c1322] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-orange-400">
                      <Zap className="h-3 w-3" /> Devon Vance
                    </div>
                    <div className="text-[10px] text-slate-400">Borderline (~66%) &rarr; Boost</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPersona('shortlist')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      candidateName === 'Elena Rostova' || candidateName === 'Maya Patel'
                        ? 'bg-emerald-950/60 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500'
                        : 'bg-[#0c1322] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" /> Elena Rostova
                    </div>
                    <div className="text-[10px] text-slate-400">Top Tier (~92%) &rarr; Shortlist</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => applyPersona('reject')}
                    className={`p-2.5 rounded-xl border text-left text-xs transition ${
                      candidateName === 'Marcus Sterling' || candidateName === "Liam O'Connor"
                        ? 'bg-rose-950/60 border-rose-500 text-rose-200 ring-1 ring-rose-500'
                        : 'bg-[#0c1322] border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1 text-rose-400">
                      <XCircle className="h-3 w-3" /> Marcus Sterling
                    </div>
                    <div className="text-[10px] text-slate-400">Junior (~32%) &rarr; Rejected</div>
                  </button>
                </div>
              </div>

              {chbmitSamples.length > 0 && (
                <div className="pt-2 border-t border-slate-800">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1 uppercase font-bold">
                    Or Select Raw Ingest from CHBMIT Benchmark Dataset:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {chbmitSamples.map(sample => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => selectChbmitProfile(sample)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-bold border transition ${
                          candidateName === sample.candidateName
                            ? 'bg-orange-600 text-white border-orange-500 shadow-2xs'
                            : 'bg-[#0c1322] text-slate-300 border-slate-800 hover:border-orange-500/50'
                        }`}
                      >
                        {sample.candidateName} ({sample.expectedScoreBucket})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Candidate Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateName}
                    onChange={e => setCandidateName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Email Address (For Magic Link Alerts)
                  </label>
                  <input
                    type="email"
                    required
                    value={candidateEmail}
                    onChange={e => setCandidateEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Current Professional Title
                  </label>
                  <input
                    type="text"
                    required
                    value={candidateTitle}
                    onChange={e => setCandidateTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Years of Relevant Experience
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    required
                    value={yearsExperience}
                    onChange={e => setYearsExperience(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Resume File Upload (PDF preferred) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-orange-500" />
                    Attach Resume File <span className="text-orange-400 text-[11px] font-semibold">(PDF Preferred)</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleRunPreProcessingOnly}
                    disabled={isPreProcessing || isParsingFile}
                    className="text-[11px] font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
                  >
                    <Scan className="h-3 w-3" />
                    {isPreProcessing ? 'Scanning Resume Content...' : 'Scan Resume for ATS Match'}
                  </button>
                </div>

                {/* Drag and Drop Zone or Uploaded File Card */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragOver(false);
                    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                      handleProcessUploadedFile(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`relative p-4 rounded-2xl border-2 transition-all ${
                    isDragOver
                      ? 'border-orange-500 bg-orange-950/30 shadow-md'
                      : resumeFileName
                      ? 'border-slate-800 bg-[#080d19]'
                      : 'border-dashed border-slate-700 bg-[#080d19] hover:border-orange-500 hover:bg-orange-950/10'
                  }`}
                >
                  <input
                    type="file"
                    id="resume-file-input"
                    accept=".pdf,.docx,.txt"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleProcessUploadedFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {resumeFileName ? (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-orange-950/60 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
                          {isParsingFile ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <FileCheck className="h-5 w-5 text-emerald-400" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white font-mono">{resumeFileName}</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-950/60 text-orange-400 border border-orange-500/30">
                              {resumeFileSize}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                              PDF Parsed
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {isParsingFile
                              ? 'Extracting candidate skills and experience from resume...'
                              : `Extracted ${resumeText.length} characters — ready for ATS calculation.`}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => setShowExtractedPreview(!showExtractedPreview)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:bg-[#0c1322] text-slate-300 text-[11px] font-medium flex items-center gap-1 transition"
                        >
                          {showExtractedPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                          {showExtractedPreview ? 'Hide Details' : 'Preview Data'}
                        </button>
                        <label
                          htmlFor="resume-file-input"
                          className="px-3 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-[11px] font-bold cursor-pointer flex items-center gap-1 transition shadow-xs"
                        >
                          <FileUp className="h-3 w-3" />
                          Change File
                        </label>
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="resume-file-input"
                      className="cursor-pointer flex flex-col items-center justify-center py-4 text-center"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-[#0c1322] border border-slate-800 text-orange-400 flex items-center justify-center mb-2.5">
                        <UploadCloud className="h-6 w-6" />
                      </div>
                      <span className="text-xs font-bold text-white">
                        Click to upload resume or drag and drop
                      </span>
                      <span className="text-[11px] text-slate-400 mt-0.5">
                        PDF preferred (also accepts DOCX, TXT) • Max 10MB
                      </span>
                    </label>
                  )}

                  {fileParseError && (
                    <div className="mt-2.5 p-2 rounded-xl bg-rose-950/60 border border-rose-800/80 text-xs text-rose-300 font-medium">
                      ⚠️ {fileParseError}
                    </div>
                  )}
                </div>

                {/* Quick Sample PDF Resumes for instant testing */}
                <div className="p-2.5 rounded-xl bg-[#080d19] border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 font-mono">
                    <Paperclip className="h-3 w-3 text-orange-400" />
                    Or test with a pre-configured PDF resume:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {SAMPLE_RESUMES.map(sample => (
                      <button
                        key={sample.fileName}
                        type="button"
                        onClick={() => handleSelectSampleResume(sample)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition ${
                          resumeFileName === sample.fileName
                            ? 'bg-orange-600 text-white border-orange-500 shadow-2xs'
                            : 'bg-[#0c1322] text-slate-300 border-slate-800 hover:border-orange-500/50'
                        }`}
                      >
                        📄 {sample.fileName.replace('_Resume.pdf', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collapsible Extracted Resume Text Preview */}
                {showExtractedPreview && (
                  <div className="p-3 rounded-xl bg-[#080d19] border border-slate-800 text-xs animate-fade-in space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-300 uppercase font-mono">
                        Extracted Resume Text (Used for ATS Scoring)
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {resumeText.length} characters
                      </span>
                    </div>
                    <textarea
                      rows={3}
                      value={resumeText}
                      onChange={e => setResumeText(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#0c1322] border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/30 font-mono"
                      placeholder="Resume content extracted from PDF..."
                    />
                  </div>
                )}
              </div>

              {/* Pre-Processing Pipeline Live Output */}
              {preProcessingResult && (
                <div className="p-3.5 rounded-2xl bg-orange-950/20 border border-orange-500/30 text-xs space-y-2 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-orange-300 flex items-center gap-1.5">
                      <Scan className="h-3.5 w-3.5 text-orange-400" />
                      Resume Analysis & Skill Verification Passed
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
                      Cleaned & Verified
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-[#080d19] border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Document Scan</span>
                      <span className="text-white font-bold">{preProcessingResult.phase1_ocr.confidenceScore}% Conf</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#080d19] border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Data Cleansing</span>
                      <span className="text-white font-bold">{preProcessingResult.phase2_cleansing.noiseTokensRemoved} Noise Removed</span>
                    </div>
                    <div className="p-2 rounded-xl bg-[#080d19] border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">Detected Skills</span>
                      <span className="text-white font-bold">{preProcessingResult.phase3_features.extractedSkills.length} Skills Found</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Extracted Skills:</span>
                    {preProcessingResult.phase3_features.extractedSkills.map(skill => (
                      <span key={skill} className="px-2 py-0.5 rounded bg-[#080d19] text-[10px] font-mono text-orange-400 border border-orange-500/30 font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowApplyModal(false)}
                  className="px-4 py-2 rounded-xl bg-[#080d19] hover:bg-[#131f38] text-slate-300 text-xs font-bold border border-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isParsingFile}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center gap-1.5 transition"
                >
                  {isSubmitting ? 'Evaluating ATS Score...' : 'Submit Resume & Calculate ATS Score'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. LIVE MICRO-CHALLENGE MODAL (Dark Enterprise Themed) */}
      {/* ========================================================================= */}
      {activeChallenge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#0c1322] border border-[#1e293b] rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[95vh] text-white">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-950/60 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-xs">
                  <BrainCircuit className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Borderline Boost Technical Assessment
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-950/60 text-orange-400 border border-orange-500/40 font-bold font-mono">
                      Live Sandbox
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Candidate: <strong className="text-white">{activeChallenge.candidateName}</strong> • Missing Skills: <span className="text-orange-400 font-mono font-bold">{activeChallenge.targetSkills.join(', ')}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <div className={`flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-mono font-bold ${
                  quizTimerSeconds < 60
                    ? 'bg-rose-950/60 text-rose-300 border-rose-800/80 animate-pulse'
                    : 'bg-orange-950/60 text-orange-300 border-orange-800/60'
                }`}>
                  <Clock className="h-3.5 w-3.5 text-orange-400" />
                  {formatQuizTimer(quizTimerSeconds)} (5-Min Limit)
                </div>
                <button
                  onClick={onCloseChallengeModal}
                  className="text-slate-400 hover:text-white p-1 text-sm font-bold transition"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Assessment State Body */}
            {challengeResult ? (
              /* Challenge Submission Review */
              <div className="py-6 space-y-6">
                <div className={`p-6 rounded-2xl border text-center ${
                  challengeResult.application?.status === 'BOOSTED_SHORTLISTED'
                    ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                    : 'bg-[#080d19] border-slate-800 text-slate-200'
                }`}>
                  <Award className="h-12 w-12 text-amber-400 mx-auto mb-2 animate-bounce" />
                  <h4 className="text-xl font-black text-white">
                    Technical Assessment Completed!
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 max-w-lg mx-auto">
                    {challengeResult.message}
                  </p>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mt-5 p-4 rounded-xl bg-[#080d19] border border-slate-800 shadow-2xs">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Assessment Score</span>
                      <span className="text-xl font-bold font-mono text-white">{activeChallenge.scorePercentage || 100}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">Boost Delta</span>
                      <span className="text-xl font-bold font-mono text-emerald-400">+{activeChallenge.scoreBoostDelta || 14}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-mono">New Status</span>
                      <span className="text-xs font-bold text-amber-400 uppercase block mt-1">Shortlisted (Boosted)</span>
                    </div>
                  </div>
                </div>

                {/* Challenge Completion Notification */}
                <div className="p-4 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-slate-300">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                    <Check className="h-4 w-4" /> Challenge Evaluation Completed & Recorded
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Evaluation score successfully processed and sent to the recruiter dashboard with automated audit trail.
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={onCloseChallengeModal}
                    className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 transition"
                  >
                    Done & View ATS Roster
                  </button>
                </div>
              </div>
            ) : activeChallenge.questions && activeChallenge.questions.length > 0 ? (
              /* Active Question Taking UI */
              <div className="py-6 space-y-5">
                
                {/* Question Stepper */}
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span className="font-bold text-white font-mono">
                    Question {currentQuestionIndex + 1} of {activeChallenge.questions.length}
                  </span>
                  <span className="font-mono text-orange-400 font-bold">
                    Target Skill: {activeChallenge.questions[currentQuestionIndex]?.skill}
                  </span>
                </div>

                {/* Question Content */}
                {activeChallenge.questions[currentQuestionIndex] && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-white leading-relaxed">
                      {activeChallenge.questions[currentQuestionIndex].question}
                    </h4>

                    {/* Code snippet context */}
                    {activeChallenge.questions[currentQuestionIndex].codeContext && (
                      <div className="p-3.5 rounded-xl bg-[#080d19] border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre">
                        {activeChallenge.questions[currentQuestionIndex].codeContext}
                      </div>
                    )}

                    {/* Options */}
                    <div className="space-y-2 pt-1">
                      {activeChallenge.questions[currentQuestionIndex].options.map((option, optIdx) => {
                        const qId = activeChallenge.questions[currentQuestionIndex].id;
                        const isSelected = selectedAnswers[qId] === optIdx;
                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleAnswerSelect(qId, optIdx)}
                            className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                              isSelected
                                ? 'bg-orange-950/40 border-orange-500 text-white ring-1 ring-orange-500'
                                : 'bg-[#080d19] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-[#0c1322]'
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'border-orange-500 bg-orange-600 text-white'
                                : 'border-slate-700 bg-[#0c1322] text-slate-400'
                            }`}>
                              <span className="text-[10px] font-bold">{String.fromCharCode(65 + optIdx)}</span>
                            </div>
                            <span className="text-xs leading-relaxed">{option}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Navigation Controls */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-4 py-2 rounded-xl bg-[#080d19] hover:bg-[#131f38] text-slate-300 text-xs font-bold disabled:opacity-40 transition border border-slate-800"
                  >
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {currentQuestionIndex < activeChallenge.questions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition"
                      >
                        Next Question
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmitQuiz}
                        className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-lg shadow-orange-600/30 flex items-center gap-1.5 transition"
                      >
                        {isSubmitting ? 'Evaluating Answers...' : 'Submit Assessment & Claim Boost'}
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <BrainCircuit className="h-10 w-10 mx-auto text-orange-500 mb-2 animate-spin" />
                <p className="text-xs">Generating targeted technical assessment from dynamic challenge service...</p>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
