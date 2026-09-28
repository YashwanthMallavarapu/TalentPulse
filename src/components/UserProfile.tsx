import React, { useState, useEffect } from 'react';
import {
  User,
  Mail,
  Briefcase,
  Building,
  Phone,
  MapPin,
  FileText,
  Key,
  Shield,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  Lock,
  Edit3,
  Save,
  X,
  ExternalLink,
  Sparkles,
  AlertCircle,
  BadgeCheck,
  RefreshCw
} from 'lucide-react';
import { AuthUser, JwtTokenPayload, UserRole } from '../types';

interface UserProfileProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  jwtToken: string | null;
  jwtPayload: JwtTokenPayload | null;
  onUpdateProfile: (updatedData: {
    name: string;
    email: string;
    title: string;
    department?: string;
    phone?: string;
    bio?: string;
    location?: string;
  }) => Promise<boolean>;
  onOpenJwtInspector?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
  isOpen,
  onClose,
  currentUser,
  jwtToken,
  jwtPayload,
  onUpdateProfile,
  onOpenJwtInspector
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'jwt'>('profile');
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedSub, setCopiedSub] = useState(false);

  // Sync state when modal opens or user/jwtPayload updates
  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || jwtPayload?.name || '');
      setEmail(currentUser.email || jwtPayload?.email || '');
      setTitle(currentUser.title || jwtPayload?.title || '');
      setDepartment(currentUser.department || jwtPayload?.department || 'Engineering');
      setPhone(currentUser.phone || jwtPayload?.phone || '+1 (555) 234-8901');
      setBio(
        currentUser.bio ||
        jwtPayload?.bio ||
        `Active ${currentUser.role === 'CANDIDATE' ? 'candidate' : currentUser.role.toLowerCase()} on TalentPulse platform.`
      );
      setLocation(currentUser.location || jwtPayload?.location || 'San Francisco, CA (Remote)');
      setValidationError(null);
      setSaveSuccess(false);
    }
  }, [currentUser, jwtPayload, isOpen]);

  if (!isOpen) return null;

  // Role styling helper
  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'ADMIN':
        return { bg: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Administrator' };
      case 'ARCHITECT':
        return { bg: 'bg-indigo-100 text-indigo-800 border-indigo-200', label: 'System Architect' };
      case 'DEVOPS':
        return { bg: 'bg-cyan-100 text-cyan-800 border-cyan-200', label: 'Platform Engineer' };
      case 'RECRUITER':
        return { bg: 'bg-amber-100 text-amber-800 border-amber-200', label: 'Technical Recruiter' };
      case 'CANDIDATE':
      default:
        return { bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', label: 'Job Candidate' };
    }
  };

  const roleBadge = getRoleBadge(currentUser?.role || jwtPayload?.role);

  // Copy helper
  const handleCopy = (text: string, type: 'token' | 'sub') => {
    navigator.clipboard.writeText(text);
    if (type === 'token') {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    } else {
      setCopiedSub(true);
      setTimeout(() => setCopiedSub(false), 2000);
    }
  };

  // Form submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!name.trim()) {
      setValidationError('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setValidationError('A valid email address is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onUpdateProfile({
        name: name.trim(),
        email: email.trim(),
        title: title.trim(),
        department: department.trim(),
        phone: phone.trim(),
        bio: bio.trim(),
        location: location.trim()
      });

      if (success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3500);
      }
    } catch (err: any) {
      setValidationError(err.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate JWT expiry countdown
  const expTimestamp = jwtPayload?.exp ? jwtPayload.exp * 1000 : null;
  const iatTimestamp = jwtPayload?.iat ? jwtPayload.iat * 1000 : null;
  const isExpired = expTimestamp ? Date.now() > expTimestamp : false;
  const remainingHours = expTimestamp ? Math.max(0, Math.round((expTimestamp - Date.now()) / (1000 * 60 * 60))) : 24;

  const initials = (name || currentUser?.name || 'U')
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div
      id="user-profile-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="user-profile-modal"
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden my-auto animate-scale-in"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold tracking-tight text-white">User Profile & Account</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Verified Account
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Manage your personal details and view your account access
              </p>
            </div>
          </div>
          <button
            id="user-profile-close-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            aria-label="Close user profile"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Identity Overview Banner */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white font-black text-xl flex items-center justify-center shadow-md shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-900">{name || currentUser?.name || 'User'}</h4>
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${roleBadge.bg}`}>
                  {roleBadge.label}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {title || currentUser?.title || 'Team Member'}
              </p>
              <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span>{email || currentUser?.email}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Session
                </span>
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">Account Security</span>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Shield className="h-3.5 w-3.5 text-emerald-600" />
              <span>Encrypted & Verified</span>
            </div>
            <span className="text-[11px] text-slate-500">
              Session valid (~{remainingHours}h)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-white px-6">
          <button
            id="user-profile-tab-details"
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition -mb-[1px] ${
              activeTab === 'profile'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Personal Information</span>
          </button>
          <button
            id="user-profile-tab-jwt"
            type="button"
            onClick={() => setActiveTab('jwt')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-bold border-b-2 transition -mb-[1px] ${
              activeTab === 'jwt'
                ? 'border-orange-600 text-orange-600'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Key className="h-3.5 w-3.5" />
            <span>Permissions & Access</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
              {jwtPayload?.permissions?.length || 0}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[62vh] overflow-y-auto">
          {/* Success Banner */}
          {saveSuccess && (
            <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between text-xs animate-fade-in shadow-2xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold">Profile Updated Successfully!</span>
                  <p className="text-[11px] text-emerald-700">
                    Your personal information and account details have been saved.
                  </p>
                </div>
              </div>
              <BadgeCheck className="h-5 w-5 text-emerald-600" />
            </div>
          )}

          {/* Validation Error Banner */}
          {validationError && (
            <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 flex items-center gap-2.5 text-xs animate-fade-in shadow-2xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {activeTab === 'profile' ? (
            /* TAB 1: EDIT PERSONAL INFORMATION */
            <form id="user-profile-edit-form" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Full Name */}
                <div>
                  <label htmlFor="user-profile-name" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="user-profile-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Alex Mercer"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Your full name displayed on your profile and applications.
                  </p>
                </div>

                {/* Email Address */}
                <div>
                  <label htmlFor="user-profile-email" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="user-profile-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. alex.mercer@talentpulse.io"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Primary contact email for account updates and notifications.
                  </p>
                </div>

                {/* Job Title / Role Designation */}
                <div>
                  <label htmlFor="user-profile-title" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-slate-400" />
                    Professional Title
                  </label>
                  <input
                    id="user-profile-title"
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Senior Distributed Systems Engineer"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                  />
                </div>

                {/* Department */}
                <div>
                  <label htmlFor="user-profile-department" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-slate-400" />
                    Department / Team
                  </label>
                  <input
                    id="user-profile-department"
                    type="text"
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    placeholder="e.g. Platform Engineering"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="user-profile-phone" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5 text-slate-400" />
                    Phone Number
                  </label>
                  <input
                    id="user-profile-phone"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="e.g. +1 (555) 234-8901"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                  />
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="user-profile-location" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    Location
                  </label>
                  <input
                    id="user-profile-location"
                    type="text"
                    value={location}
                    onChange={e => setLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA (Remote)"
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition font-medium"
                  />
                </div>

              </div>

              {/* Bio / Summary */}
              <div>
                <label htmlFor="user-profile-bio" className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5 text-slate-400" />
                  About Me / Bio
                </label>
                <textarea
                  id="user-profile-bio"
                  rows={3}
                  value={bio}
                  onChange={e => setBio(e.target.value)}
                  placeholder="Share a brief overview of your background, experience, or skills..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition resize-none font-sans"
                />
              </div>

              {/* Form Action Controls */}
              <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-600" />
                  <span>Changes apply immediately across your active session</span>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    id="user-profile-save-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 sm:flex-none px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-3.5 w-3.5" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* TAB 2: ACCESS & PERMISSIONS */
            <div className="space-y-4">
              
              {/* Account Security Information Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                {/* Account ID */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Account ID
                  </span>
                  <div className="flex items-center justify-between gap-2 text-slate-800 font-bold">
                    <span className="truncate">{jwtPayload?.sub || 'anonymous-user'}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(jwtPayload?.sub || '', 'sub')}
                      className="p-1 rounded text-slate-400 hover:text-slate-700"
                      title="Copy Account ID"
                    >
                      {copiedSub ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Authentication Service */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Authentication Service
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>{jwtPayload?.iss || 'TalentPulse Auth Service'}</span>
                  </div>
                </div>

                {/* Session Started */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Signed In At
                  </span>
                  <div className="text-slate-800">
                    <span className="font-bold">
                      {iatTimestamp ? new Date(iatTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      {iatTimestamp ? new Date(iatTimestamp).toLocaleDateString() : ''}
                    </span>
                  </div>
                </div>

                {/* Session Expiration */}
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                    Session Valid Until
                  </span>
                  <div className="text-slate-800">
                    <span className="font-bold">
                      {expTimestamp ? new Date(expTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'In ~24 hours'}
                    </span>
                    <span className={`text-[11px] block font-semibold ${isExpired ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isExpired ? 'Session Expired' : `Active (approx. ${remainingHours}h remaining)`}
                    </span>
                  </div>
                </div>

              </div>

              {/* Assigned Authorities & Permissions */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Key className="h-3.5 w-3.5 text-orange-600" />
                    Account Permissions & Access Rights
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {jwtPayload?.permissions?.length || 0} active permissions
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {jwtPayload?.permissions && jwtPayload.permissions.length > 0 ? (
                    jwtPayload.permissions.map(perm => (
                      <span
                        key={perm}
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-medium shadow-2xs"
                      >
                        {perm.replace(/_/g, ' ')}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500 italic">Standard member permissions active.</span>
                  )}
                </div>
              </div>

              {/* Session Security & Protection Details */}
              <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs">
                <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
                  <span className="text-slate-300 font-bold flex items-center gap-1.5">
                    <Lock className="h-3.5 w-3.5 text-orange-400" />
                    Security & Session Protection
                  </span>
                  {onOpenJwtInspector && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenJwtInspector();
                      }}
                      className="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <span>View Permissions</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                  Your session is actively protected with enterprise-grade encryption. Access permissions are strictly managed based on your verified role.
                </p>
              </div>

            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>TalentPulse Identity & Access Management</span>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold underline"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
