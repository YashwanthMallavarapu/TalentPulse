import React, { useState } from 'react';
import { 
  Shield, 
  Key, 
  UserCheck, 
  Lock, 
  Check, 
  RefreshCw, 
  Clock, 
  Fingerprint,
  Layers,
  Users,
  Award,
  Cpu,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { AuthUser, JwtTokenPayload, UserRole } from '../types';

interface JwtAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  jwtToken: string | null;
  jwtPayload: JwtTokenPayload | null;
  onLoginAsRole: (role: UserRole) => Promise<void>;
  onCustomLogin: (email: string, role: UserRole, name: string) => Promise<void>;
}

export const JwtAuthModal: React.FC<JwtAuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  jwtPayload,
  onLoginAsRole,
  onCustomLogin
}) => {
  const [activeTab, setActiveTab] = useState<'inspector' | 'switcher' | 'custom'>('inspector');
  const [customName, setCustomName] = useState('Alex Mercer');
  const [customEmail, setCustomEmail] = useState('alex.mercer@talentpulse.io');
  const [customRole, setCustomRole] = useState<UserRole>('ARCHITECT');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  if (!isOpen) return null;

  const handleRoleSelect = async (role: UserRole) => {
    setIsLoggingIn(true);
    try {
      await onLoginAsRole(role);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await onCustomLogin(customEmail, customRole, customName);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const rolesList: {
    role: UserRole;
    name: string;
    title: string;
    description: string;
    accessiblePanels: string[];
    color: string;
    icon: any;
  }[] = [
    {
      role: 'CANDIDATE',
      name: 'Devon Vance',
      title: 'Software Engineer',
      description: 'Job applicant with access to candidate dashboard, submitted applications, and verification challenges.',
      accessiblePanels: ['Candidate Portal & Challenges'],
      color: 'border-blue-200 bg-blue-50/50 hover:bg-blue-50 text-blue-900',
      icon: Users
    },
    {
      role: 'RECRUITER',
      name: 'Sarah Chen',
      title: 'Senior Technical Talent Partner',
      description: 'Recruiter access to candidate scoring, application reviews, and score adjustment evaluations.',
      accessiblePanels: ['Candidate Portal', 'Recruiter ATS'],
      color: 'border-orange-200 bg-orange-50/50 hover:bg-orange-50 text-orange-900',
      icon: Award
    },
    {
      role: 'ADMIN',
      name: 'Elena Rostova',
      title: 'Platform Director & Administrator',
      description: 'Full administrative governance across candidate analytics, fairness metrics, system reliability, and verification.',
      accessiblePanels: ['All Platform Panels'],
      color: 'border-purple-200 bg-purple-50/50 hover:bg-purple-50 text-purple-900',
      icon: Shield
    },
    {
      role: 'ARCHITECT',
      name: 'Alex Mercer',
      title: 'Principal Systems Architect',
      description: 'System health oversight, server connectivity inspection, and real-time processing performance.',
      accessiblePanels: ['Candidate Portal', 'Recruiter ATS', 'System Infrastructure'],
      color: 'border-amber-200 bg-amber-50/50 hover:bg-amber-50 text-amber-900',
      icon: Layers
    },
    {
      role: 'DEVOPS',
      name: 'Jordan Rivera',
      title: 'Platform Operations Lead',
      description: 'System reliability monitoring, platform diagnostics, and health test verification.',
      accessiblePanels: ['System Health & Tests', 'System Infrastructure'],
      color: 'border-emerald-200 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-900',
      icon: Cpu
    }
  ];

  const getRoleFriendlyName = (role?: UserRole) => {
    switch (role) {
      case 'CANDIDATE': return 'Job Candidate';
      case 'RECRUITER': return 'Technical Recruiter';
      case 'ADMIN': return 'Platform Administrator';
      case 'ARCHITECT': return 'Systems Architect';
      case 'DEVOPS': return 'Platform Operations';
      default: return 'User';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-600 shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Account Security & Permissions
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Secure & Encrypted
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Manage your active role and verified access permissions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition text-sm font-bold"
          >
            ✕
          </button>
        </div>

        {/* Subtabs */}
        <div className="px-6 pt-3 bg-white border-b border-slate-200 flex gap-2">
          <button
            onClick={() => setActiveTab('inspector')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'inspector'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            Active Permissions & Security
          </button>
          <button
            onClick={() => setActiveTab('switcher')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'switcher'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="h-3.5 w-3.5" />
            Switch Account Role
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'custom'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Lock className="h-3.5 w-3.5" />
            Custom Profile Sign In
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/40">
          
          {/* TAB 1: PERMISSIONS & SECURITY */}
          {activeTab === 'inspector' && (
            <div className="space-y-4">
              
              {/* Authenticated Identity Pill */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-orange-400 to-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                    {currentUser?.name.charAt(0) || 'U'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{currentUser?.name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800 border border-orange-200">
                        {getRoleFriendlyName(currentUser?.role)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{currentUser?.title} • {currentUser?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure Active Session
                  </span>
                </div>
              </div>

              {/* Security Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                {/* Account Summary */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Fingerprint className="h-4 w-4 text-orange-600" />
                    Account Identity
                  </div>
                  <div className="space-y-2 text-xs text-slate-600 pt-1">
                    <div className="flex justify-between pb-1 border-b border-slate-100">
                      <span className="text-slate-500">Account ID:</span>
                      <span className="font-semibold text-slate-800">{currentUser?.id || 'usr-candidate-991'}</span>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-slate-100">
                      <span className="text-slate-500">Access Role:</span>
                      <span className="font-semibold text-slate-800">{getRoleFriendlyName(currentUser?.role)}</span>
                    </div>
                    <div className="flex justify-between pb-1 border-b border-slate-100">
                      <span className="text-slate-500">Connection:</span>
                      <span className="text-emerald-700 font-semibold">Encrypted & Verified</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Session Status:</span>
                      <span className="text-emerald-700 font-semibold">Active</span>
                    </div>
                  </div>
                </div>

                {/* Granted Permissions */}
                <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Granted Access Rights
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {currentUser?.permissions && currentUser.permissions.length > 0 ? (
                      currentUser.permissions.map(p => (
                        <span key={p} className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {p.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase())}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">Standard user permissions</span>
                    )}
                  </div>
                </div>

              </div>

              {/* Privacy & Security Policy */}
              <div className="p-4 rounded-xl bg-orange-50/70 border border-orange-200 text-orange-900 text-xs flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold">Role-Based Access Enforcement:</span>
                  <p className="text-[11px] text-orange-800">
                    Each account is strictly restricted to authorized features according to their role. Candidates can only access their own profile and challenges, while recruiters can view applicant scores and evaluation metrics.
                  </p>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: PERSONA SWITCHER */}
          {activeTab === 'switcher' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-600">
                Switch role to preview the application from different user perspectives:
              </p>

              <div className="grid grid-cols-1 gap-2.5">
                {rolesList.map(r => {
                  const Icon = r.icon;
                  const isCurrent = currentUser?.role === r.role;

                  return (
                    <div
                      key={r.role}
                      onClick={() => handleRoleSelect(r.role)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        isCurrent
                          ? 'border-orange-500 bg-orange-50/80 ring-1 ring-orange-500 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className={`p-2.5 rounded-xl border ${r.color} shrink-0`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="text-sm font-bold text-slate-900">{r.name}</h4>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {getRoleFriendlyName(r.role)}
                              </span>
                              {isCurrent && (
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                  <Check className="h-3 w-3" /> Active Session
                                </span>
                              )}
                            </div>
                            <div className="text-xs font-semibold text-slate-600 mt-0.5">{r.title}</div>
                            <p className="text-xs text-slate-500 mt-1">{r.description}</p>
                            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Authorized Views:</span>
                              {r.accessiblePanels.map(p => (
                                <span key={p} className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <button
                          disabled={isLoggingIn}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition ${
                            isCurrent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                        >
                          {isCurrent ? 'Current' : 'Select'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM PROFILE */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              <p className="text-xs text-slate-600">
                Sign in with custom identity information:
              </p>

              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={customName}
                    onChange={e => setCustomName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={e => setCustomEmail(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Role</label>
                  <select
                    value={customRole}
                    onChange={e => setCustomRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="CANDIDATE">Job Candidate (Applicant Access)</option>
                    <option value="RECRUITER">Technical Recruiter (ATS & Scoring)</option>
                    <option value="ADMIN">Platform Administrator (Full Access)</option>
                    <option value="ARCHITECT">Systems Architect (Infrastructure & Health)</option>
                    <option value="DEVOPS">Platform Operations (Diagnostics & Testing)</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="px-5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs shadow-orange-600/20"
                >
                  {isLoggingIn ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Lock className="h-3.5 w-3.5" />}
                  Sign In with Profile
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>TalentPulse Platform • Secure Session Management</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
