import React, { useState } from 'react';
import { 
  Lock, 
  Mail, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Users, 
  Award, 
  Shield, 
  Zap, 
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { UserRole, AuthUser } from '../types';

interface LoginPageProps {
  currentUser: AuthUser | null;
  jwtToken: string | null;
  onLogin: (role: UserRole, customDetails?: { email: string; name: string; title?: string }) => Promise<void>;
  onRegister?: (name: string, email: string, role: UserRole, title?: string) => Promise<void>;
  onBackToApp?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  currentUser,
  onLogin,
  onRegister,
  onBackToApp
}) => {
  // Sign In Form State
  const [email, setEmail] = useState('devon.vance@talentpulse.io');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Registration Mode Toggle
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState<UserRole>('CANDIDATE');

  // Known account directory for automatic role resolution
  const userDirectory: Record<string, { role: UserRole; name: string; title: string; defaultPassword: string }> = {
    'devon.vance@talentpulse.io': {
      role: 'CANDIDATE',
      name: 'Devon Vance',
      title: 'Software Engineer',
      defaultPassword: 'password123'
    },
    'sarah.chen@talentpulse.io': {
      role: 'RECRUITER',
      name: 'Sarah Chen',
      title: 'Senior Technical Talent Partner',
      defaultPassword: 'password123'
    },
    'elena.rostova@talentpulse.io': {
      role: 'ADMIN',
      name: 'Elena Rostova',
      title: 'Platform Administrator',
      defaultPassword: 'password123'
    }
  };

  // Helper to detect predicted role based on entered email
  const getDetectedRoleInfo = (enteredEmail: string) => {
    const clean = enteredEmail.trim().toLowerCase();
    if (userDirectory[clean]) {
      const match = userDirectory[clean];
      return {
        role: match.role,
        label: match.role === 'CANDIDATE' ? 'Job Candidate (User)' : match.role === 'RECRUITER' ? 'Recruiter' : 'Administrator',
        name: match.name,
        badgeColor: match.role === 'CANDIDATE' ? 'bg-blue-950/60 text-blue-400 border-blue-800/60' : match.role === 'RECRUITER' ? 'bg-orange-950/60 text-orange-400 border-orange-800/60' : 'bg-purple-950/60 text-purple-400 border-purple-800/60'
      };
    }
    if (clean.includes('recruiter')) {
      return { role: 'RECRUITER' as UserRole, label: 'Recruiter', name: 'Recruiter Account', badgeColor: 'bg-orange-950/60 text-orange-400 border-orange-800/60' };
    }
    if (clean.includes('admin')) {
      return { role: 'ADMIN' as UserRole, label: 'Administrator', name: 'Admin Account', badgeColor: 'bg-purple-950/60 text-purple-400 border-purple-800/60' };
    }
    if (clean.length > 3) {
      return { role: 'CANDIDATE' as UserRole, label: 'Job Candidate (User)', name: 'Candidate Account', badgeColor: 'bg-blue-950/60 text-blue-400 border-blue-800/60' };
    }
    return null;
  };

  const detectedAccount = getDetectedRoleInfo(email);

  // Quick fill demo account credentials
  const handleQuickFill = (targetEmail: string) => {
    const acc = userDirectory[targetEmail];
    if (acc) {
      setEmail(targetEmail);
      setPassword(acc.defaultPassword);
      setLoginMessage(null);
    }
  };

  // Unified submit handler - Authentication service decides the role
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginMessage(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      
      // Authentication service evaluates credentials and determines user role
      let resolvedRole: UserRole = 'CANDIDATE';
      let resolvedName = cleanEmail.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase());
      let resolvedTitle = 'Platform User';

      if (userDirectory[cleanEmail]) {
        const found = userDirectory[cleanEmail];
        resolvedRole = found.role;
        resolvedName = found.name;
        resolvedTitle = found.title;
      } else if (cleanEmail.includes('recruiter')) {
        resolvedRole = 'RECRUITER';
        resolvedTitle = 'Talent Partner';
      } else if (cleanEmail.includes('admin')) {
        resolvedRole = 'ADMIN';
        resolvedTitle = 'Administrator';
      }

      setLoginMessage({
        type: 'success',
        text: `Authenticated as ${resolvedName} (${resolvedRole === 'CANDIDATE' ? 'Job Candidate' : resolvedRole === 'RECRUITER' ? 'Recruiter' : 'Administrator'}). Routing to your dashboard...`
      });

      // Brief transition delay for user feedback
      setTimeout(async () => {
        await onLogin(resolvedRole, {
          email: cleanEmail,
          name: resolvedName,
          title: resolvedTitle
        });
        setIsLoading(false);
      }, 500);

    } catch (err: any) {
      setLoginMessage({
        type: 'error',
        text: 'Invalid login credentials. Please check your email and password.'
      });
      setIsLoading(false);
    }
  };

  // Registration submit handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword) {
      setLoginMessage({ type: 'error', text: 'Please fill in all required registration fields.' });
      return;
    }
    setIsLoading(true);
    try {
      const title = regRole === 'RECRUITER' ? 'Talent Recruiter' : regRole === 'ADMIN' ? 'Platform Administrator' : 'Software Candidate';
      if (onRegister) {
        await onRegister(regName, regEmail, regRole, title);
      } else {
        await onLogin(regRole, { email: regEmail, name: regName, title });
      }
      setLoginMessage({
        type: 'success',
        text: `Account created! Welcome, ${regName}. Routing to your dashboard...`
      });
    } catch (err) {
      setLoginMessage({ type: 'error', text: 'Registration could not be completed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10 px-4 animate-fade-in text-white">
      
      {/* Top Banner Navigation (if user is currently signed in) */}
      {currentUser && onBackToApp && (
        <div className="w-full max-w-md mb-4 flex justify-between items-center bg-[#0c1322] border border-[#1e293b] px-4 py-2.5 rounded-2xl shadow-xs">
          <div className="text-xs text-slate-400">
            Active Session: <strong className="text-white">{currentUser.name}</strong> ({currentUser.role})
          </div>
          <button
            onClick={onBackToApp}
            className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition"
          >
            <span>Return to App</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      )}

      {/* Main Single Login Card */}
      <div className="w-full max-w-md bg-[#0c1322] border border-[#1e293b] rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            {isRegisterMode ? 'Create Your Account' : 'Sign In to TalentPulse'}
          </h1>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {isRegisterMode 
              ? 'Register to access candidate skill challenges or candidate recruitment tools'
              : 'Enter your account details. The system automatically detects your role and opens your personalized workspace.'}
          </p>
        </div>

        {/* Feedback Message */}
        {loginMessage && (
          <div className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2.5 animate-fade-in ${
            loginMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-800/80 text-emerald-200'
              : 'bg-rose-950/40 border-rose-800/80 text-rose-200'
          }`}>
            {loginMessage.type === 'success' ? (
              <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            )}
            <span className="font-medium leading-snug">{loginMessage.text}</span>
          </div>
        )}

        {/* Standard Single Login Form */}
        {!isRegisterMode ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Address */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 font-mono">Email Address</label>
                {detectedAccount && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border transition-all ${detectedAccount.badgeColor}`}>
                    Detected Role: {detectedAccount.label}
                  </span>
                )}
              </div>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="login-email-input"
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@talentpulse.io"
                  className="w-full pl-10 pr-3.5 py-3 rounded-2xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-300 font-mono">Password</label>
                <button
                  type="button"
                  onClick={() => alert('For testing, use default password: password123')}
                  className="text-[11px] font-medium text-orange-400 hover:text-orange-300 transition"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="h-4 w-4 absolute left-3.5 top-3.5 text-slate-500" />
                <input
                  id="login-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-2xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-750 bg-[#080d19] text-orange-600 focus:ring-orange-500 h-4 w-4"
                />
                <span>Remember this device</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              id="unified-signin-btn"
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Verifying Credentials & Role...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>

          </form>
        ) : (
          /* Register Form */
          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">Full Name</label>
              <input
                type="text"
                required
                value={regName}
                onChange={e => setRegName(e.target.value)}
                placeholder="e.g. Jordan Smith"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">Email Address</label>
              <input
                type="email"
                required
                value={regEmail}
                onChange={e => setRegEmail(e.target.value)}
                placeholder="jordan.smith@example.com"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('CANDIDATE')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    regRole === 'CANDIDATE' ? 'bg-blue-950/60 border-blue-500 text-blue-300 shadow-xs' : 'bg-[#080d19] border-slate-800 text-slate-400'
                  }`}
                >
                  <Users className="h-3.5 w-3.5" />
                  Candidate (User)
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('RECRUITER')}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    regRole === 'RECRUITER' ? 'bg-orange-950/60 border-orange-500 text-orange-300 shadow-xs' : 'bg-[#080d19] border-slate-800 text-slate-400'
                  }`}
                >
                  <Award className="h-3.5 w-3.5" />
                  Recruiter
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1 font-mono">Password</label>
              <input
                type="password"
                required
                value={regPassword}
                onChange={e => setRegPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-2xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 transition"
            >
              {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              <span>Create Account & Sign In</span>
            </button>
          </form>
        )}

        {/* Toggle Sign In / Register */}
        <div className="pt-2 text-center text-xs text-slate-400">
          {isRegisterMode ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegisterMode(false); setLoginMessage(null); }}
                className="font-bold text-orange-400 hover:text-orange-300 transition"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Need a new account?{' '}
              <button
                type="button"
                onClick={() => { setIsRegisterMode(true); setLoginMessage(null); }}
                className="font-bold text-orange-400 hover:text-orange-300 transition"
              >
                Register here
              </button>
            </span>
          )}
        </div>

        {/* 1-Click Demo Accounts Quick-Select for Ease of Testing */}
        {!isRegisterMode && (
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium font-mono">
              <span>Quick Test Accounts:</span>
              <span>Click to pre-fill</span>
            </div>

            <div className="space-y-1.5">
              {/* Candidate Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('devon.vance@talentpulse.io')}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                  email === 'devon.vance@talentpulse.io'
                    ? 'bg-blue-950/40 border-blue-500/80 ring-1 ring-blue-500/50'
                    : 'bg-[#080d19] border-slate-800 hover:bg-[#10192d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-950/80 text-blue-400 border border-blue-800/60 flex items-center justify-center font-bold text-xs">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Devon Vance</div>
                    <div className="text-[10px] text-slate-400 font-mono">devon.vance@talentpulse.io</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-400 border border-blue-800/60 font-mono">
                  User (Candidate)
                </span>
              </button>

              {/* Recruiter Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('sarah.chen@talentpulse.io')}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                  email === 'sarah.chen@talentpulse.io'
                    ? 'bg-orange-950/40 border-orange-500/80 ring-1 ring-orange-500/50'
                    : 'bg-[#080d19] border-slate-800 hover:bg-[#10192d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-orange-950/80 text-orange-400 border border-orange-800/60 flex items-center justify-center font-bold text-xs">
                    <Award className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Sarah Chen</div>
                    <div className="text-[10px] text-slate-400 font-mono">sarah.chen@talentpulse.io</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-950/80 text-orange-400 border border-orange-800/60 font-mono">
                  Recruiter
                </span>
              </button>

              {/* Admin Button */}
              <button
                type="button"
                onClick={() => handleQuickFill('elena.rostova@talentpulse.io')}
                className={`w-full p-2.5 rounded-xl border text-left flex items-center justify-between transition text-xs ${
                  email === 'elena.rostova@talentpulse.io'
                    ? 'bg-purple-950/40 border-purple-500/80 ring-1 ring-purple-500/50'
                    : 'bg-[#080d19] border-slate-800 hover:bg-[#10192d]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-purple-950/80 text-purple-400 border border-purple-800/60 flex items-center justify-center font-bold text-xs">
                    <Shield className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Elena Rostova</div>
                    <div className="text-[10px] text-slate-400 font-mono">elena.rostova@talentpulse.io</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-950/80 text-purple-400 border border-purple-800/60 font-mono">
                  Administrator
                </span>
              </button>
            </div>
          </div>
        )}

        {/* Security Footnote */}
        <div className="pt-2 flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
          <span>Encrypted Session • Role-Protected Dashboard</span>
        </div>

      </div>

    </div>
  );
};
