import React, { useState } from 'react';
import { 
  JobPosting, 
  CandidateApplication, 
  MicroChallenge 
} from '../types';
import { 
  Award, 
  Users, 
  CheckCircle2, 
  Flame, 
  XCircle, 
  TrendingUp, 
  Search, 
  Filter, 
  Sliders, 
  Plus, 
  FileText, 
  Sparkles, 
  Clock, 
  ArrowUpRight,
  ShieldCheck, 
  ChevronDown, 
  Check, 
  Zap, 
  Layers, 
  ChevronRight, 
  X, 
  RotateCcw, 
  ArrowUpDown, 
  SlidersHorizontal,
  Eye,
  Copy,
  CheckCheck,
  Briefcase,
  Target,
  FileCheck2,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

interface RecruiterDashboardProps {
  jobs: JobPosting[];
  applications: CandidateApplication[];
  challenges: Record<string, MicroChallenge>;
  onAddNewJob: (jobData: Partial<JobPosting>) => Promise<void>;
  onSelectCandidate: (app: CandidateApplication) => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  jobs,
  applications,
  challenges,
  onAddNewJob,
  onSelectCandidate
}) => {
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [scoreFilter, setScoreFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'SCORE_DESC' | 'SCORE_ASC' | 'NAME_ASC' | 'BOOST_DESC' | 'RECENT'>('SCORE_DESC');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Job Creation Modal State
  const [showAddJobModal, setShowAddJobModal] = useState(false);
  const [newTitle, setNewTitle] = useState('Staff Distributed Systems Engineer');
  const [newDepartment, setNewDepartment] = useState('Core Architecture');
  const [newSalary, setNewSalary] = useState('$180,000 - $220,000');
  const [newRequiredSkills, setNewRequiredSkills] = useState('Java 17, Spring Boot, Apache Kafka, Distributed Systems, Docker');
  const [newPreferredSkills, setNewPreferredSkills] = useState('Kubernetes, Redis, Prometheus');
  const [newMinExp, setNewMinExp] = useState(5);
  const [newShortlistCutoff, setNewShortlistCutoff] = useState(75);
  const [newBorderlineCutoff, setNewBorderlineCutoff] = useState(60);
  const [newMaxBoost, setNewMaxBoost] = useState(16);

  // Selected Candidate Modal
  const [activeAppDetails, setActiveAppDetails] = useState<CandidateApplication | null>(null);
  const [copiedResume, setCopiedResume] = useState(false);

  // Metric calculations
  const totalApps = applications.length;
  const directShortlisted = applications.filter(a => a.status === 'SHORTLISTED').length;
  const boostedShortlisted = applications.filter(a => a.status === 'BOOSTED_SHORTLISTED').length;
  const borderlineInAssessment = applications.filter(a => a.status === 'BORDERLINE' || a.status === 'BOOST_IN_PROGRESS').length;
  const rejected = applications.filter(a => a.status === 'REJECTED').length;

  const boostedCandidates = applications.filter(a => a.boostDelta && a.boostDelta > 0);
  const avgBoostDelta = boostedCandidates.length > 0
    ? (boostedCandidates.reduce((acc, c) => acc + (c.boostDelta || 0), 0) / boostedCandidates.length).toFixed(1)
    : '14.0';

  // Helper to reset all search & filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('ALL');
    setScoreFilter('ALL');
    setSelectedJobFilter('ALL');
    setSortBy('SCORE_DESC');
  };

  const hasActiveFilters = searchQuery.trim() !== '' || statusFilter !== 'ALL' || scoreFilter !== 'ALL' || selectedJobFilter !== 'ALL';

  // Filtered applications based on name, status, score, skills, job, and score ranges
  const filteredApps = applications
    .filter(app => {
      // 1. Job Filter
      const matchesJob = selectedJobFilter === 'ALL' || app.jobId === selectedJobFilter;

      // 2. Status Filter
      let matchesStatus = true;
      if (statusFilter !== 'ALL') {
        if (statusFilter === 'BORDERLINE') {
          matchesStatus = app.status === 'BORDERLINE' || app.status === 'BOOST_IN_PROGRESS';
        } else {
          matchesStatus = app.status === statusFilter;
        }
      }

      // 3. Score Filter (Range / Tier evaluation)
      const effectiveScore = app.finalScore ?? app.baseScore;
      let matchesScore = true;
      if (scoreFilter === 'TIER_80') {
        matchesScore = effectiveScore >= 80;
      } else if (scoreFilter === 'SHORTLIST_75') {
        matchesScore = effectiveScore >= 75;
      } else if (scoreFilter === 'BORDERLINE_60_74') {
        matchesScore = effectiveScore >= 60 && effectiveScore < 75;
      } else if (scoreFilter === 'BELOW_60') {
        matchesScore = effectiveScore < 60;
      } else if (scoreFilter === 'BOOSTED') {
        matchesScore = Boolean(app.boostDelta && app.boostDelta > 0);
      }

      // 4. Search Query (matches name, status, score, skills, email, or role title)
      const query = searchQuery.trim().toLowerCase();
      let matchesSearch = true;
      if (query !== '') {
        const queryNumeric = query.replace(/[^0-9]/g, '');

        // Search by candidate name
        const nameMatch = app.candidateName.toLowerCase().includes(query);

        // Search by candidate email & title
        const emailMatch = app.candidateEmail.toLowerCase().includes(query);
        const titleMatch = app.candidateTitle.toLowerCase().includes(query);

        // Search by candidate status (raw or readable e.g., "shortlisted", "boosted shortlist", "borderline", "rejected")
        const readableStatus = app.status.replace(/_/g, ' ').toLowerCase();
        const statusMatch = readableStatus.includes(query) || 
          app.status.toLowerCase().includes(query) ||
          (query.includes('shortlist') && (app.status === 'SHORTLISTED' || app.status === 'BOOSTED_SHORTLISTED')) ||
          (query.includes('boost') && app.status === 'BOOSTED_SHORTLISTED') ||
          (query.includes('border') && (app.status === 'BORDERLINE' || app.status === 'BOOST_IN_PROGRESS')) ||
          (query.includes('reject') && app.status === 'REJECTED') ||
          (query.includes('disqual') && app.status === 'REJECTED');

        // Search by score (e.g. typing "80", "92", "75", "66", "75%", ">=75", "<60")
        let scoreMatch = false;
        if (queryNumeric) {
          scoreMatch = 
            app.baseScore.toString().includes(queryNumeric) ||
            (app.finalScore !== undefined && app.finalScore.toString().includes(queryNumeric)) ||
            (app.boostDelta !== undefined && app.boostDelta.toString().includes(queryNumeric));
        }

        // Support operator prefix searches like ">=75", ">70", "<60", "<=50"
        if (query.startsWith('>=') || query.startsWith('>') || query.startsWith('<=') || query.startsWith('<')) {
          const num = parseFloat(query.replace(/[^0-9.]/g, ''));
          if (!isNaN(num)) {
            if (query.startsWith('>=')) scoreMatch = effectiveScore >= num;
            else if (query.startsWith('>')) scoreMatch = effectiveScore > num;
            else if (query.startsWith('<=')) scoreMatch = effectiveScore <= num;
            else if (query.startsWith('<')) scoreMatch = effectiveScore < num;
          }
        }

        // Search by skills
        const skillMatch = 
          (app.matchedSkills && app.matchedSkills.some(s => s.toLowerCase().includes(query))) ||
          (app.detectedSkills && app.detectedSkills.some(s => s.toLowerCase().includes(query))) ||
          (app.missingSkills && app.missingSkills.some(s => s.toLowerCase().includes(query)));

        matchesSearch = nameMatch || statusMatch || scoreMatch || emailMatch || titleMatch || skillMatch;
      }

      return matchesJob && matchesStatus && matchesScore && matchesSearch;
    })
    .sort((a, b) => {
      const scoreA = a.finalScore ?? a.baseScore;
      const scoreB = b.finalScore ?? b.baseScore;

      if (sortBy === 'SCORE_DESC') return scoreB - scoreA;
      if (sortBy === 'SCORE_ASC') return scoreA - scoreB;
      if (sortBy === 'NAME_ASC') return a.candidateName.localeCompare(b.candidateName);
      if (sortBy === 'BOOST_DESC') return (b.boostDelta ?? 0) - (a.boostDelta ?? 0);
      if (sortBy === 'RECENT') {
        const timeA = a.appliedAt ? new Date(a.appliedAt).getTime() : 0;
        const timeB = b.appliedAt ? new Date(b.appliedAt).getTime() : 0;
        return timeB - timeA;
      }
      return 0;
    });

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddNewJob({
      title: newTitle,
      department: newDepartment,
      location: 'San Francisco, CA (Hybrid)',
      type: 'Full-time',
      experienceLevel: 'Senior',
      salary: newSalary,
      description: 'Lead high-throughput backend microservices platform engineering.',
      requiredSkills: newRequiredSkills.split(',').map(s => s.trim()).filter(Boolean),
      preferredSkills: newPreferredSkills.split(',').map(s => s.trim()).filter(Boolean),
      minExperienceYears: Number(newMinExp),
      shortlistThreshold: Number(newShortlistCutoff),
      borderlineThreshold: Number(newBorderlineCutoff),
      maxBoostDelta: Number(newMaxBoost)
    });
    setShowAddJobModal(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCopyResume = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      
      {/* Top Header & Job Creator Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-950/40 text-orange-400 border border-orange-500/30 text-xs font-bold uppercase tracking-wider mb-2 font-mono">
            <Sparkles className="h-3.5 w-3.5" />
            Recruiter ATS & Salvage Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Award className="h-7 w-7 text-orange-500" />
            Candidate ATS & Borderline Boost Engine
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Monitor applicant scoring vectors, examine borderline verification quizzes, and configure automated ATS shortlist criteria.
          </p>
        </div>

        <button
          id="recruiter-add-job-btn"
          onClick={() => setShowAddJobModal(true)}
          className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center gap-2 transition self-start sm:self-auto shrink-0"
        >
          <Plus className="h-4 w-4" />
          Create New Job & Policy
        </button>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        
        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800/80 shadow-md hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Total Applied</span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{totalApps}</div>
          <span className="text-[10px] text-slate-500">Across all roles</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800/80 shadow-md hover:border-emerald-900/60 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Direct Shortlist</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">{directShortlisted}</div>
          <span className="text-[10px] text-emerald-400/80 font-medium">&ge; 75% Initial Score</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1322] border border-amber-500/30 shadow-md hover:border-amber-500/50 transition">
          <div className="flex items-center justify-between text-amber-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Boosted Shortlist
            </span>
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-black text-amber-300 font-mono">{boostedShortlisted}</div>
          <span className="text-[10px] text-amber-400/90 font-bold">Rescued via Micro-Quiz</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800/80 shadow-md hover:border-orange-900/60 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">In Assessment</span>
            <Clock className="h-4 w-4 text-orange-400" />
          </div>
          <div className="text-2xl font-black text-orange-400 font-mono">{borderlineInAssessment}</div>
          <span className="text-[10px] text-orange-400/80 font-medium">Pending quiz verify</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800/80 shadow-md hover:border-rose-900/60 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Disqualified</span>
            <XCircle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono">{rejected}</div>
          <span className="text-[10px] text-rose-400/80 font-medium">&lt; 60% Cutoff</span>
        </div>

        <div className="p-4 rounded-2xl bg-[#0c1322] border border-slate-800/80 shadow-md hover:border-emerald-900/60 transition">
          <div className="flex items-center justify-between text-slate-400 mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Avg Boost Delta</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono">+{avgBoostDelta}%</div>
          <span className="text-[10px] text-slate-400">Score elevation</span>
        </div>

      </div>

      {/* Visual Pipeline Funnel */}
      <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 font-mono">
            <Sliders className="h-3.5 w-3.5 text-orange-500" />
            Candidate Pipeline & Salvage Funnel
          </h3>
          <span className="text-[11px] font-mono text-emerald-400 font-semibold">
            {totalApps > 0 ? `${Math.round(((directShortlisted + boostedShortlisted) / totalApps) * 100)}% Overall Shortlist Rate` : '0%'}
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
          
          <div className="p-3.5 rounded-xl bg-[#080d19] border border-slate-800 relative">
            <span className="text-[10px] text-slate-400 uppercase font-mono block mb-1">Stage 1: Ingested</span>
            <div className="text-lg font-extrabold text-white">{totalApps} Applications</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Parsed by ATS Keyword Engine</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080d19] border border-orange-500/30 relative">
            <span className="text-[10px] text-orange-400 uppercase font-mono font-bold block mb-1">Stage 2: Borderline Quarantined</span>
            <div className="text-lg font-extrabold text-orange-300">{borderlineInAssessment + boostedShortlisted} Candidates</div>
            <p className="text-[11px] text-orange-400/80 mt-0.5">Scores between 60% & 74%</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080d19] border border-amber-500/30 relative">
            <span className="text-[10px] text-amber-400 uppercase font-mono font-bold block mb-1">Stage 3: Challenges Dispatched</span>
            <div className="text-lg font-extrabold text-amber-300">{borderlineInAssessment + boostedShortlisted} Assessment Links</div>
            <p className="text-[11px] text-amber-400/80 mt-0.5">15-min Missing Skill Quizzes</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#080d19] border border-emerald-500/30 relative">
            <span className="text-[10px] text-emerald-400 uppercase font-mono font-bold block mb-1">Stage 4: Total Shortlisted</span>
            <div className="text-lg font-extrabold text-emerald-300">{directShortlisted + boostedShortlisted} Shortlisted</div>
            <p className="text-[11px] text-emerald-400/90 mt-0.5 font-bold">({boostedShortlisted} rescued via Boost!)</p>
          </div>

        </div>
      </div>

      {/* Candidate Filter & Management Table */}
      <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Status Filter Tab Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-slate-800/80">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1 font-mono">
            <Filter className="h-3.5 w-3.5 text-slate-400" /> Filter:
          </span>

          <button
            id="recruiter-status-tab-all"
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'ALL'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-[#080d19] hover:bg-slate-800 text-slate-300 border border-slate-800'
            }`}
          >
            <span>All Candidates</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              statusFilter === 'ALL' ? 'bg-slate-800 text-slate-200' : 'bg-slate-800 text-slate-400'
            }`}>
              {totalApps}
            </span>
          </button>

          <button
            id="recruiter-status-tab-shortlisted"
            type="button"
            onClick={() => setStatusFilter('SHORTLISTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'SHORTLISTED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800/60'
            }`}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Direct Shortlist (&ge;75%)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              statusFilter === 'SHORTLISTED' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-900/80 text-emerald-300'
            }`}>
              {directShortlisted}
            </span>
          </button>

          <button
            id="recruiter-status-tab-boosted"
            type="button"
            onClick={() => setStatusFilter('BOOSTED_SHORTLISTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'BOOSTED_SHORTLISTED'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/80'
            }`}
          >
            <Flame className="h-3.5 w-3.5 text-orange-400" />
            <span>Boosted Shortlist</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              statusFilter === 'BOOSTED_SHORTLISTED' ? 'bg-amber-700 text-amber-100' : 'bg-amber-900 text-amber-300'
            }`}>
              {boostedShortlisted}
            </span>
          </button>

          <button
            id="recruiter-status-tab-borderline"
            type="button"
            onClick={() => setStatusFilter('BORDERLINE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'BORDERLINE'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-950/40 hover:bg-orange-900/60 text-orange-300 border border-orange-800/70'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>Borderline (60-74%)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              statusFilter === 'BORDERLINE' ? 'bg-orange-700 text-orange-100' : 'bg-orange-900 text-orange-300'
            }`}>
              {borderlineInAssessment}
            </span>
          </button>

          <button
            id="recruiter-status-tab-rejected"
            type="button"
            onClick={() => setStatusFilter('REJECTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              statusFilter === 'REJECTED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60'
            }`}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Disqualified (&lt;60%)</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
              statusFilter === 'REJECTED' ? 'bg-rose-700 text-rose-100' : 'bg-rose-900 text-rose-300'
            }`}>
              {rejected}
            </span>
          </button>
        </div>

        {/* Search Bar & Multi-Dimensional Filters Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            
            {/* Search Bar for Name, Status, Score, or Skills */}
            <div className="relative flex-1 min-w-[260px] max-w-md">
              <Search className="h-4 w-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                id="recruiter-candidate-search"
                type="text"
                placeholder="Search candidate by name, status, skill, or score..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-0.5 rounded-full"
                  title="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Status Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                id="recruiter-status-filter"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="ALL">All Statuses ({totalApps})</option>
                <option value="SHORTLISTED">Direct Shortlist ({directShortlisted})</option>
                <option value="BOOSTED_SHORTLISTED">Boosted Shortlist ({boostedShortlisted})</option>
                <option value="BORDERLINE">Borderline / Assessment ({borderlineInAssessment})</option>
                <option value="REJECTED">Disqualified ({rejected})</option>
              </select>
            </div>

            {/* Score Filter Dropdown */}
            <div className="flex items-center gap-1.5">
              <select
                id="recruiter-score-filter"
                value={scoreFilter}
                onChange={e => setScoreFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              >
                <option value="ALL">All Scores</option>
                <option value="TIER_80">Top Tier (&ge; 80%)</option>
                <option value="SHORTLIST_75">Shortlist Cutoff (&ge; 75%)</option>
                <option value="BORDERLINE_60_74">Borderline Bracket (60% – 74%)</option>
                <option value="BELOW_60">Below Cutoff (&lt; 60%)</option>
                <option value="BOOSTED">Boost Delta Received (+)</option>
              </select>
            </div>

            {/* Job Role Filter */}
            <select
              id="recruiter-job-filter"
              value={selectedJobFilter}
              onChange={e => setSelectedJobFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
            >
              <option value="ALL">All Job Roles</option>
              {jobs.map(j => (
                <option key={j.id} value={j.id}>{j.title}</option>
              ))}
            </select>

            {/* Sort Order Selector */}
            <div className="flex items-center gap-1.5">
              <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 hidden sm:inline" />
              <select
                id="recruiter-sort-by"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs font-medium text-slate-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
              >
                <option value="SCORE_DESC">Score: Highest First</option>
                <option value="SCORE_ASC">Score: Lowest First</option>
                <option value="NAME_ASC">Name: A to Z</option>
                <option value="BOOST_DESC">Largest Boost Delta</option>
                <option value="RECENT">Most Recently Applied</option>
              </select>
            </div>

          </div>

          <div className="flex items-center gap-3 shrink-0 self-end lg:self-center">
            <span className="text-xs font-mono text-slate-400">
              Showing <span className="font-bold text-white">{filteredApps.length}</span> of {applications.length}
            </span>
          </div>
        </div>

        {/* Active Filter Tags & Quick Reset */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-[#080d19] border border-slate-800">
            <span className="text-[11px] font-bold text-slate-400 uppercase font-mono mr-1">
              Active Filters:
            </span>

            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-950/60 text-orange-300 text-xs font-medium border border-orange-800/60">
                <span>Query: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="hover:text-orange-200 p-0.5 rounded"
                  title="Remove query filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {statusFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700">
                <span>Status: {statusFilter.replace(/_/g, ' ')}</span>
                <button
                  type="button"
                  onClick={() => setStatusFilter('ALL')}
                  className="hover:text-white p-0.5 rounded"
                  title="Remove status filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {scoreFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/60 text-blue-300 text-xs font-medium border border-blue-800/60">
                <span>
                  Score: {
                    scoreFilter === 'TIER_80' ? '&ge; 80%' :
                    scoreFilter === 'SHORTLIST_75' ? '&ge; 75%' :
                    scoreFilter === 'BORDERLINE_60_74' ? '60% – 74%' :
                    scoreFilter === 'BELOW_60' ? '< 60%' :
                    'Boosted'
                  }
                </span>
                <button
                  type="button"
                  onClick={() => setScoreFilter('ALL')}
                  className="hover:text-blue-200 p-0.5 rounded"
                  title="Remove score filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            {selectedJobFilter !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-purple-950/60 text-purple-300 text-xs font-medium border border-purple-800/60">
                <span>Role: {jobs.find(j => j.id === selectedJobFilter)?.title || selectedJobFilter}</span>
                <button
                  type="button"
                  onClick={() => setSelectedJobFilter('ALL')}
                  className="hover:text-purple-200 p-0.5 rounded"
                  title="Remove job role filter"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            )}

            <button
              id="recruiter-clear-filters-btn"
              type="button"
              onClick={resetFilters}
              className="ml-auto inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
            >
              <RotateCcw className="h-3 w-3 text-slate-400" />
              Reset All Filters
            </button>
          </div>
        )}

        {/* Candidate Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full text-left text-xs">
            <thead className="text-slate-400 bg-[#080d19] uppercase font-mono text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Candidate Profile</th>
                <th className="py-3.5 px-4 font-semibold">Applied Role</th>
                <th className="py-3.5 px-4 font-semibold">Base ATS Score</th>
                <th className="py-3.5 px-4 font-semibold">Boost Delta</th>
                <th className="py-3.5 px-4 font-semibold">Final Score</th>
                <th className="py-3.5 px-4 font-semibold">ATS Verdict</th>
                <th className="py-3.5 px-4 font-semibold text-right">Application Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70 text-slate-300">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="max-w-sm mx-auto flex flex-col items-center justify-center space-y-2.5">
                      <div className="h-10 w-10 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                        <Search className="h-5 w-5" />
                      </div>
                      <div className="font-bold text-white text-sm">No matching candidates found</div>
                      <p className="text-xs text-slate-400">
                        No candidates matched your search criteria {searchQuery ? `for "${searchQuery}"` : ''} with current filters.
                      </p>
                      {hasActiveFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="mt-2 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-md transition"
                        >
                          Clear All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredApps.map(app => {
                  const job = jobs.find(j => j.id === app.jobId);
                  const isBoosted = app.status === 'BOOSTED_SHORTLISTED';
                  const effectiveScore = app.finalScore || app.baseScore;

                  return (
                    <tr 
                      key={app.id} 
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setActiveAppDetails(app)}
                    >
                      {/* Candidate Name & Title */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shadow-xs shrink-0 ${
                            isBoosted 
                              ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-1 ring-amber-400/50' 
                              : app.status === 'SHORTLISTED'
                              ? 'bg-gradient-to-br from-emerald-500 to-teal-700 ring-1 ring-emerald-400/50'
                              : app.status === 'BORDERLINE' || app.status === 'BOOST_IN_PROGRESS'
                              ? 'bg-gradient-to-br from-orange-500 to-amber-700'
                              : 'bg-slate-800 text-slate-300'
                          }`}>
                            {getInitials(app.candidateName)}
                          </div>
                          <div>
                            <div className="font-bold text-white text-sm flex items-center gap-1.5 group-hover:text-orange-400 transition-colors">
                              {app.candidateName}
                              {isBoosted && (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[10px] bg-amber-950/70 text-amber-300 border border-amber-500/50 font-bold font-mono">
                                  <Sparkles className="h-2.5 w-2.5 text-amber-400" />
                                  Boost Certified
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {app.candidateTitle} • <span className="text-slate-300 font-medium">{app.yearsExperience} yrs exp</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Job Role */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-200">
                          {job?.title || 'Senior Software Engineer'}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          {job?.department || 'Engineering'}
                        </div>
                      </td>

                      {/* Base ATS Score */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-200 text-xs">{app.baseScore}%</span>
                          <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                            <div 
                              className={`h-full rounded-full ${
                                app.baseScore >= 75 ? 'bg-emerald-500' :
                                app.baseScore >= 60 ? 'bg-orange-500' : 'bg-rose-500'
                              }`} 
                              style={{ width: `${Math.min(100, app.baseScore)}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono">Keyword Match</span>
                      </td>

                      {/* Boost Delta */}
                      <td className="py-3.5 px-4">
                        {app.boostDelta ? (
                          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 font-mono font-bold text-xs">
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                            +{app.boostDelta}%
                          </div>
                        ) : (
                          <span className="text-slate-600 font-mono">—</span>
                        )}
                      </td>

                      {/* Final Composite Score */}
                      <td className="py-3.5 px-4">
                        <div className={`font-mono font-extrabold text-sm ${
                          effectiveScore >= 75 ? 'text-emerald-400' :
                          effectiveScore >= 60 ? 'text-orange-400' : 'text-rose-400'
                        }`}>
                          {effectiveScore}%
                        </div>
                        {app.boostDelta ? (
                          <span className="text-[10px] text-amber-400/90 font-mono font-bold block">
                            (Base {app.baseScore}% + {app.boostDelta}%)
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-500 font-mono">Unadjusted</span>
                        )}
                      </td>

                      {/* ATS Verdict */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide font-mono ${
                          app.status === 'SHORTLISTED'
                            ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-700/80'
                            : app.status === 'BOOSTED_SHORTLISTED'
                            ? 'bg-amber-950/60 text-amber-300 border border-amber-500/60 shadow-xs shadow-amber-950 font-extrabold'
                            : app.status === 'BORDERLINE' || app.status === 'BOOST_IN_PROGRESS'
                            ? 'bg-orange-950/60 text-orange-300 border border-orange-700/80'
                            : 'bg-rose-950/60 text-rose-300 border border-rose-700/80'
                        }`}>
                          {app.status === 'SHORTLISTED' && <CheckCircle2 className="h-3 w-3 text-emerald-400" />}
                          {app.status === 'BOOSTED_SHORTLISTED' && <Flame className="h-3 w-3 text-amber-400" />}
                          {(app.status === 'BORDERLINE' || app.status === 'BOOST_IN_PROGRESS') && <Clock className="h-3 w-3 text-orange-400" />}
                          {app.status === 'REJECTED' && <XCircle className="h-3 w-3 text-rose-400" />}
                          {app.status}
                        </span>
                      </td>

                      {/* Action Button - Exact requested title "View Application Details" */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveAppDetails(app);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-orange-600 hover:text-white text-slate-200 font-bold text-xs border border-slate-700 hover:border-orange-500 transition-all inline-flex items-center gap-1.5 shadow-xs"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          <span>View Application Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. CANDIDATE APPLICATION DETAILS MODAL (High-End Dark Enterprise Theme) */}
      {/* ========================================================================= */}
      {activeAppDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1527] border border-slate-700/80 rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] space-y-6 text-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3.5">
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-bold text-white text-base shadow-lg shrink-0 ${
                  activeAppDetails.status === 'BOOSTED_SHORTLISTED'
                    ? 'bg-gradient-to-br from-amber-500 to-orange-600 ring-2 ring-amber-400/50'
                    : activeAppDetails.status === 'SHORTLISTED'
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-700 ring-2 ring-emerald-400/50'
                    : 'bg-gradient-to-br from-slate-700 to-slate-800 ring-1 ring-slate-600'
                }`}>
                  {getInitials(activeAppDetails.candidateName)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white tracking-tight">
                      {activeAppDetails.candidateName}
                    </h3>
                    {activeAppDetails.status === 'BOOSTED_SHORTLISTED' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-950/80 text-amber-300 border border-amber-500/60 font-bold font-mono flex items-center gap-1">
                        <Flame className="h-3 w-3 text-amber-400" /> Boost Certified
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {activeAppDetails.candidateTitle} • {activeAppDetails.yearsExperience} Years Exp • {activeAppDetails.candidateEmail}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setActiveAppDetails(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
                title="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Score Decomposition Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Base ATS Score</span>
                <span className="font-extrabold text-white font-mono text-lg">{activeAppDetails.baseScore}%</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Keyword Match</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Micro-Quiz Boost</span>
                <span className="font-extrabold text-emerald-400 font-mono text-lg">
                  {activeAppDetails.boostDelta ? `+${activeAppDetails.boostDelta}%` : '0%'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Verified Merit</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Final Composite</span>
                <span className={`font-extrabold font-mono text-lg ${
                  (activeAppDetails.finalScore || activeAppDetails.baseScore) >= 75 ? 'text-emerald-400' :
                  (activeAppDetails.finalScore || activeAppDetails.baseScore) >= 60 ? 'text-orange-400' : 'text-rose-400'
                }`}>
                  {activeAppDetails.finalScore || activeAppDetails.baseScore}%
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Overall Cutoff: 75%</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#080d19] border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Final Decision</span>
                <span className={`font-bold font-mono text-xs block mt-1.5 ${
                  activeAppDetails.status === 'SHORTLISTED' ? 'text-emerald-400' :
                  activeAppDetails.status === 'BOOSTED_SHORTLISTED' ? 'text-amber-300' :
                  activeAppDetails.status === 'BORDERLINE' ? 'text-orange-400' : 'text-rose-400'
                }`}>
                  {activeAppDetails.status}
                </span>
              </div>
            </div>

            {/* Targeted Job Requisition Context */}
            <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-orange-950/60 border border-orange-500/40 text-orange-400 flex items-center justify-center">
                  <Briefcase className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase text-slate-400 block">Target Job Position</span>
                  <div className="text-sm font-bold text-white">
                    {jobs.find(j => j.id === activeAppDetails.jobId)?.title || 'Senior Software Engineer'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Department</span>
                <span className="text-xs font-semibold text-slate-300">
                  {jobs.find(j => j.id === activeAppDetails.jobId)?.department || 'Engineering'}
                </span>
              </div>
            </div>

            {/* Skills Radar / Pills Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              {/* Matched Skills */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Matched Core Skills
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/80">
                    {activeAppDetails.matchedSkills.length} Detected
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeAppDetails.matchedSkills.map(skill => (
                    <span 
                      key={skill} 
                      className="px-2.5 py-1 rounded-lg bg-emerald-950/50 text-emerald-300 text-xs font-medium border border-emerald-800/60"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills Quizzed */}
              <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5 font-mono">
                    <Zap className="h-3.5 w-3.5" /> Quizzed Missing Skills
                  </span>
                  <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/80">
                    {activeAppDetails.missingSkills.length} Evaluated
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {activeAppDetails.missingSkills.length > 0 ? (
                    activeAppDetails.missingSkills.map(skill => (
                      <span 
                        key={skill} 
                        className="px-2.5 py-1 rounded-lg bg-amber-950/50 text-amber-300 text-xs font-medium border border-amber-800/60 flex items-center gap-1"
                      >
                        <Sparkles className="h-3 w-3 text-amber-400" />
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">None missing (Full keyword profile match)</span>
                  )}
                </div>
              </div>

            </div>

            {/* Extracted Resume Text with Copy Option */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5 font-mono uppercase">
                  <FileText className="h-3.5 w-3.5 text-orange-500" />
                  Extracted Resume Content (Normalized Text)
                </label>
                <button
                  type="button"
                  onClick={() => handleCopyResume(activeAppDetails.resumeText)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition px-2 py-1 rounded-lg hover:bg-slate-800"
                >
                  {copiedResume ? (
                    <>
                      <CheckCheck className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-bold">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800 text-xs text-slate-300 font-mono whitespace-pre-wrap max-h-44 overflow-y-auto leading-relaxed selection:bg-orange-500 selection:text-white">
                {activeAppDetails.resumeText}
              </div>
            </div>

            {/* Borderline Salvage Interceptor Explanatory Banner */}
            {activeAppDetails.status === 'BOOSTED_SHORTLISTED' && (
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3">
                <Flame className="h-6 w-6 text-amber-400 shrink-0" />
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  <span className="font-bold text-white">Merit-Based Second Chance Applied: </span>
                  Candidate scored {activeAppDetails.baseScore}% (initially borderline &lt; 75%). The Kafka event interceptor generated a targeted micro-challenge testing {activeAppDetails.missingSkills.join(', ')}. The candidate verified competency and was elevated into the active shortlist with a final score of {activeAppDetails.finalScore}%.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-500">
                Application ID: {activeAppDetails.id}
              </span>
              <button
                type="button"
                onClick={() => setActiveAppDetails(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. ADD JOB MODAL (High-End Dark Enterprise Theme) */}
      {/* ========================================================================= */}
      {showAddJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#0d1527] border border-slate-700/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl overflow-y-auto max-h-[90vh] text-slate-100 space-y-5">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Plus className="h-5 w-5 text-orange-500" />
                  Define Technical Position & Borderline Policy
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Configure ATS weights, threshold cutoffs, and micro-challenge boost limits
                </p>
              </div>
              <button
                onClick={() => setShowAddJobModal(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={newDepartment}
                    onChange={e => setNewDepartment(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Required Technical Skills (Comma-separated)
                </label>
                <input
                  type="text"
                  required
                  value={newRequiredSkills}
                  onChange={e => setNewRequiredSkills(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 font-mono"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#080d19] border border-slate-800">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Shortlist Cutoff (&ge;)
                  </label>
                  <input
                    type="number"
                    min="50"
                    max="95"
                    required
                    value={newShortlistCutoff}
                    onChange={e => setNewShortlistCutoff(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d1527] border border-slate-700 text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Borderline Min (&ge;)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="80"
                    required
                    value={newBorderlineCutoff}
                    onChange={e => setNewBorderlineCutoff(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d1527] border border-slate-700 text-xs text-white font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Max Boost Delta (+)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="30"
                    required
                    value={newMaxBoost}
                    onChange={e => setNewMaxBoost(Number(e.target.value))}
                    className="w-full px-3 py-1.5 rounded-lg bg-[#0d1527] border border-slate-700 text-xs text-white font-mono font-bold"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddJobModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold shadow-md shadow-orange-600/30"
                >
                  Publish Role & Policy
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
