import React, { useState } from 'react';
import { 
  Cpu, 
  Layers, 
  Terminal, 
  Users, 
  CheckSquare, 
  Bell, 
  Zap, 
  Server, 
  Radio, 
  RefreshCw, 
  ExternalLink,
  ShieldCheck, 
  Award, 
  Key, 
  Shield, 
  UserCheck, 
  ChevronDown,
  LogIn,
  LogOut,
  Sparkles,
  User,
  Edit3,
  Activity
} from 'lucide-react';
import { NotificationItem, EurekaInstance, AuthUser, UserRole } from '../types';

interface HeaderProps {
  activeTab: 'candidate' | 'recruiter' | 'monitoring' | 'architecture' | 'checklist';
  setActiveTab: (tab: 'candidate' | 'recruiter' | 'monitoring' | 'architecture' | 'checklist') => void;
  notifications: NotificationItem[];
  eurekaInstances: EurekaInstance[];
  currentUser: AuthUser | null;
  jwtToken: string | null;
  onOpenJwtModal: () => void;
  onOpenUserProfile?: () => void;
  onQuickRoleSwitch: (role: UserRole) => Promise<void>;
  onOpenChallengeById: (challengeId: string) => void;
  onResetDemo: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  notifications,
  eurekaInstances,
  currentUser,
  jwtToken,
  onOpenJwtModal,
  onOpenUserProfile,
  onQuickRoleSwitch,
  onOpenChallengeById,
  onResetDemo,
  onLogout
}) => {
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  
  const unreadCount = notifications.filter(n => !n.read).length;
  const upInstancesCount = eurekaInstances.filter(i => i.status === 'UP').length;
  const totalInstances = eurekaInstances.length;

  const roleColors: Record<UserRole, { bg: string; text: string; border: string; badge: string }> = {
    CANDIDATE: { bg: 'bg-blue-950/40', text: 'text-blue-400', border: 'border-blue-800/60', badge: 'bg-blue-600' },
    RECRUITER: { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-800/60', badge: 'bg-orange-600' },
    ARCHITECT: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/60', badge: 'bg-amber-600' },
    DEVOPS: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/60', badge: 'bg-emerald-600' },
    ADMIN: { bg: 'bg-purple-950/40', text: 'text-purple-400', border: 'border-purple-800/60', badge: 'bg-purple-600' },
  };

  const currentRoleStyle = currentUser?.role ? roleColors[currentUser.role] : roleColors.RECRUITER;

  return (
    <header className="bg-[#0a0f1d] border-b border-slate-800/80 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab('candidate')}
            className="flex items-center space-x-3 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shadow-lg shadow-orange-600/30 ring-1 ring-orange-500/40 group-hover:scale-105 transition">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                  TalentPulse
                  <span className="text-[10px] px-2 py-0.5 rounded-md font-bold font-mono bg-orange-950/50 text-orange-400 border border-orange-500/40">
                    SOA Micro-ATS
                  </span>
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                Borderline Boost Engine & Ingestion Pipeline
              </p>
            </div>
          </div>

          {/* Role-Based Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#0d1527] p-1 rounded-xl border border-slate-800/80">
            {/* Candidate Portal Tab - Accessible to Candidate and Admin */}
            {(currentUser?.role === 'CANDIDATE' || currentUser?.role === 'ADMIN') && (
              <button
                id="nav-candidate-tab"
                onClick={() => setActiveTab('candidate')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'candidate'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Users className="h-3.5 w-3.5" />
                Candidate Portal
              </button>
            )}

            {/* Recruiter ATS Tab - Accessible to Recruiter and Admin */}
            {(currentUser?.role === 'RECRUITER' || currentUser?.role === 'ADMIN') && (
              <button
                id="nav-recruiter-tab"
                onClick={() => setActiveTab('recruiter')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'recruiter'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                Recruiter ATS
              </button>
            )}

            {/* Model Monitoring Tab - Accessible to Recruiter, Architect, DevOps, Admin */}
            {(currentUser?.role === 'RECRUITER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'ARCHITECT' || currentUser?.role === 'DEVOPS') && (
              <button
                id="nav-monitoring-tab"
                onClick={() => setActiveTab('monitoring')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'monitoring'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                Model Monitoring
              </button>
            )}

            {/* System Infrastructure Tab - Accessible to Architect, DevOps, Admin */}
            {(currentUser?.role === 'ARCHITECT' || currentUser?.role === 'DEVOPS' || currentUser?.role === 'ADMIN') && (
              <button
                id="nav-architecture-tab"
                onClick={() => setActiveTab('architecture')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'architecture'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <Layers className="h-3.5 w-3.5" />
                System Infrastructure
              </button>
            )}

            {/* System Verification Tab - Accessible to DevOps, Architect, Admin */}
            {(currentUser?.role === 'DEVOPS' || currentUser?.role === 'ARCHITECT' || currentUser?.role === 'ADMIN') && (
              <button
                id="nav-checklist-tab"
                onClick={() => setActiveTab('checklist')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'checklist'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                <CheckSquare className="h-3.5 w-3.5" />
                System Health & Tests
              </button>
            )}
          </nav>

          {/* Right Controls: JWT User Chip + Eureka Health + Notifications + Sign Out + Reset */}
          <div className="flex items-center space-x-2">
            
            {/* JWT Authenticated User Pill & Dropdown */}
            <div className="relative">
              <button
                id="header-jwt-auth-btn"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition shadow-2xs ${currentRoleStyle.bg} ${currentRoleStyle.border} ${currentRoleStyle.text} hover:brightness-110`}
                title="Account & Profile Settings"
              >
                <div className={`h-5 w-5 rounded-md ${currentRoleStyle.badge} text-white flex items-center justify-center text-[10px] font-bold`}>
                  <User className="h-3 w-3" />
                </div>
                <div className="text-left leading-tight hidden sm:block">
                  <span className="font-bold text-white text-[11px] block truncate max-w-[110px]">
                    {currentUser?.name || 'Guest User'}
                  </span>
                  <span className="text-[10px] font-bold block opacity-90">
                    {currentUser?.role === 'ADMIN' ? 'Administrator' :
                     currentUser?.role === 'RECRUITER' ? 'Recruiter' :
                     currentUser?.role === 'ARCHITECT' ? 'Architect' :
                     currentUser?.role === 'DEVOPS' ? 'DevOps' : 'Candidate'}
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </button>

              {/* Profile / Account Dropdown Menu */}
              {showRoleDropdown && (
                <div className="absolute right-0 mt-2 w-72 bg-[#0d1527] border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-fade-in space-y-2">
                  <div 
                    onClick={() => {
                      if (onOpenUserProfile) {
                        onOpenUserProfile();
                        setShowRoleDropdown(false);
                      }
                    }}
                    className={`p-2.5 rounded-xl bg-[#080d19] border border-slate-800 transition ${onOpenUserProfile ? 'cursor-pointer hover:border-orange-500/50 group' : ''}`}
                    title={onOpenUserProfile ? "Click to view and edit profile" : undefined}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-xs text-white group-hover:text-orange-400 flex items-center gap-1.5">
                        {currentUser?.name || 'User'}
                        {onOpenUserProfile && <Edit3 className="h-3 w-3 text-slate-400 group-hover:text-orange-400" />}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#131e34] text-slate-200 border border-slate-700">
                        {currentUser?.role === 'ADMIN' ? 'Admin' :
                         currentUser?.role === 'RECRUITER' ? 'Recruiter' :
                         currentUser?.role === 'ARCHITECT' ? 'Architect' :
                         currentUser?.role === 'DEVOPS' ? 'DevOps' : 'Candidate'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{currentUser?.email || 'Active Account'}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{currentUser?.title}</p>
                  </div>

                  <div className="space-y-1">
                    {onOpenUserProfile && (
                      <button
                        id="header-open-user-profile-menu-btn"
                        onClick={() => {
                          onOpenUserProfile();
                          setShowRoleDropdown(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-300 hover:bg-[#131e35] hover:text-orange-400 flex items-center justify-between transition border border-transparent hover:border-orange-500/30"
                      >
                        <div className="flex items-center gap-2">
                          <User className="h-3.5 w-3.5 text-orange-400" />
                          <span>View & Edit Profile</span>
                        </div>
                        <span className="text-[10px] font-bold text-orange-400 bg-orange-950/60 border border-orange-500/40 px-1.5 py-0.5 rounded">
                          Profile
                        </span>
                      </button>
                    )}

                    <button
                      id="header-inspect-jwt-claims-btn"
                      onClick={() => {
                        onOpenJwtModal();
                        setShowRoleDropdown(false);
                      }}
                      className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-slate-300 hover:bg-[#131e35] flex items-center gap-2 transition"
                    >
                      <Key className="h-3.5 w-3.5 text-slate-400" />
                      <span>Security & Permissions</span>
                    </button>

                    {/* Role Display & Admin-Only Switcher */}
                    {currentUser?.role === 'ADMIN' ? (
                      <div className="pt-2 border-t border-slate-800">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 mb-1">
                          Admin Emulate Role:
                        </span>
                        <div className="grid grid-cols-2 gap-1">
                          {(['CANDIDATE', 'RECRUITER', 'ADMIN', 'ARCHITECT', 'DEVOPS'] as UserRole[]).map(r => (
                            <button
                              key={r}
                              onClick={() => {
                                onQuickRoleSwitch(r);
                                setShowRoleDropdown(false);
                              }}
                              className={`px-2 py-1.5 rounded-lg text-[10px] font-bold text-left transition border ${
                                currentUser?.role === r 
                                  ? 'bg-orange-950/60 text-orange-400 border-orange-500/50' 
                                  : 'bg-[#080d19] text-slate-300 border-slate-800 hover:bg-slate-800'
                              }`}
                            >
                              {r}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 border-t border-slate-800 px-3 py-1">
                        <p className="text-[11px] text-slate-400">
                          Active Role: <span className="font-semibold text-slate-200">{currentUser?.role === 'CANDIDATE' ? 'Job Candidate (User)' : currentUser?.role === 'RECRUITER' ? 'Recruiter' : currentUser?.role}</span>
                        </p>
                      </div>
                    )}

                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setShowRoleDropdown(false);
                        }}
                        className="w-full px-3 py-2 rounded-xl text-left text-xs font-bold text-rose-400 hover:bg-rose-950/30 flex items-center gap-2 transition border-t border-slate-800 pt-2 mt-1"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out / Switch Account</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Direct User Profile Button */}
            {onOpenUserProfile && (
              <button
                id="header-user-profile-quick-btn"
                onClick={onOpenUserProfile}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0d1527] hover:bg-[#131e35] text-slate-300 hover:text-orange-400 border border-slate-800 hover:border-orange-500/40 text-xs font-bold transition shadow-2xs"
                title="View & Edit User Profile"
              >
                <User className="h-3.5 w-3.5 text-orange-400" />
                <span className="hidden xl:inline">My Profile</span>
              </button>
            )}

            {/* Direct Sign Out Button */}
            {onLogout && (
              <button
                id="header-logout-direct-btn"
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0d1527] hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-900/60 text-xs font-bold transition shadow-2xs"
                title="Sign out and return to login page"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            )}

            {/* System Health Pill (Admin only) */}
            {(currentUser?.role === 'ADMIN' || currentUser?.role === 'ARCHITECT' || currentUser?.role === 'DEVOPS') && (
              <div 
                onClick={() => setActiveTab('architecture')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0d1527] border border-slate-800 text-xs shadow-2xs transition cursor-pointer hover:bg-[#131e35]"
                title="Overall platform system status"
              >
                <Radio className={`h-3.5 w-3.5 ${upInstancesCount === totalInstances ? 'text-emerald-400' : 'text-amber-400'}`} />
                <span className="text-slate-400 text-[11px]">System:</span>
                <span className={`font-bold text-[11px] ${upInstancesCount === totalInstances ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {upInstancesCount === totalInstances ? 'All Online' : `${upInstancesCount}/${totalInstances} Active`}
                </span>
              </div>
            )}

            {/* Notifications Bell */}
            <div className="relative">
              <button
                id="header-notification-btn"
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 rounded-xl bg-[#0d1527] hover:bg-[#131e35] text-slate-300 border border-slate-800 transition shadow-2xs"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-orange-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Popover */}
              {showNotifDropdown && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0d1527] border border-slate-800 rounded-2xl shadow-2xl z-50 p-3 animate-fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-white">
                      <Radio className="h-3.5 w-3.5 text-orange-500" />
                      Activity & Alerts
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {notifications.length} updates
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-4">No notifications dispatched yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          className={`p-2.5 rounded-xl border text-xs transition ${
                            n.read 
                              ? 'bg-[#080d19] border-slate-800 text-slate-400' 
                              : 'bg-orange-950/30 border-orange-500/40 text-slate-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-orange-400">{n.recipientName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-300 leading-snug mb-2">{n.body}</p>
                          {n.challengeId && (
                            <button
                              onClick={() => {
                                onOpenChallengeById(n.challengeId!);
                                setShowNotifDropdown(false);
                              }}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-400 hover:text-orange-300 underline"
                            >
                              Open Micro-Challenge <ExternalLink className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Reset Button */}
            <button
              id="header-reset-btn"
              onClick={onResetDemo}
              className="p-2 rounded-xl bg-[#0d1527] hover:bg-[#131e35] text-slate-400 hover:text-white border border-slate-800 transition shadow-2xs"
              title="Reset Demo Data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Tabs - Role Filtered */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800 overflow-x-auto gap-1">
          {(currentUser?.role === 'CANDIDATE' || currentUser?.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('candidate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'candidate' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 bg-[#0d1527] border border-slate-800'
              }`}
            >
              Candidate
            </button>
          )}

          {(currentUser?.role === 'RECRUITER' || currentUser?.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('recruiter')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'recruiter' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 bg-[#0d1527] border border-slate-800'
              }`}
            >
              Recruiter ATS
            </button>
          )}

          {(currentUser?.role === 'RECRUITER' || currentUser?.role === 'ADMIN' || currentUser?.role === 'ARCHITECT' || currentUser?.role === 'DEVOPS') && (
            <button
              onClick={() => setActiveTab('monitoring')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'monitoring' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 bg-[#0d1527] border border-slate-800'
              }`}
            >
              Monitoring
            </button>
          )}

          {(currentUser?.role === 'ARCHITECT' || currentUser?.role === 'DEVOPS' || currentUser?.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'architecture' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 bg-[#0d1527] border border-slate-800'
              }`}
            >
              Infrastructure
            </button>
          )}

          {(currentUser?.role === 'DEVOPS' || currentUser?.role === 'ARCHITECT' || currentUser?.role === 'ADMIN') && (
            <button
              onClick={() => setActiveTab('checklist')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                activeTab === 'checklist' ? 'bg-orange-600 text-white shadow-xs' : 'text-slate-400 bg-[#0d1527] border border-slate-800'
              }`}
            >
              System Health
            </button>
          )}

          {onOpenUserProfile && (
            <button
              id="header-mobile-user-profile-btn"
              onClick={onOpenUserProfile}
              className="px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap text-slate-300 bg-[#0d1527] hover:bg-[#131e35] border border-slate-800 flex items-center gap-1 shrink-0"
            >
              <User className="h-3 w-3 text-orange-400" />
              Profile
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
