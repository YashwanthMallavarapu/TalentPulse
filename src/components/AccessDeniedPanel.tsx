import React from 'react';
import { ShieldAlert, UserCheck, Key, ArrowRight, ShieldCheck, LogOut } from 'lucide-react';
import { AuthUser, UserRole } from '../types';

interface AccessDeniedPanelProps {
  requiredRoles: UserRole[];
  panelName: string;
  currentUser: AuthUser | null;
  onOpenJwtModal: () => void;
  onQuickSwitch: (role: UserRole) => Promise<void>;
}

export const AccessDeniedPanel: React.FC<AccessDeniedPanelProps> = ({
  requiredRoles,
  panelName,
  currentUser,
  onOpenJwtModal,
  onQuickSwitch
}) => {
  const getRoleDisplayName = (role?: string) => {
    switch (role) {
      case 'CANDIDATE': return 'Job Candidate (User)';
      case 'RECRUITER': return 'Technical Recruiter';
      case 'ADMIN': return 'Administrator';
      case 'ARCHITECT': return 'Systems Architect';
      case 'DEVOPS': return 'DevOps & Platform';
      default: return role || 'Guest';
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-lg text-center space-y-6">
        
        {/* Lock Icon */}
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
          <ShieldAlert className="h-8 w-8 text-amber-600 animate-pulse" />
        </div>

        {/* Heading */}
        <div className="space-y-2 max-w-lg mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 inline-block">
            Access Restricted by Role
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            {panelName}
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            You are currently signed in as <strong className="text-slate-800">{currentUser?.name || currentUser?.email}</strong> with the role <strong className="text-orange-600 font-semibold">{getRoleDisplayName(currentUser?.role)}</strong>. This dashboard is reserved for:
          </p>
        </div>

        {/* Required Roles Box */}
        <div className="inline-flex flex-wrap items-center justify-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto">
          {requiredRoles.map(r => (
            <span key={r} className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold shadow-2xs">
              {getRoleDisplayName(r)}
            </span>
          ))}
        </div>

        {/* Quick Switch Buttons */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-semibold text-slate-600">
            Sign in as an authorized role to access this dashboard:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {requiredRoles.map(r => (
              <button
                key={r}
                onClick={() => onQuickSwitch(r)}
                className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm shadow-orange-600/20 flex items-center gap-1.5 transition"
              >
                <UserCheck className="h-4 w-4" />
                Switch to {getRoleDisplayName(r)}
              </button>
            ))}

            <button
              onClick={onOpenJwtModal}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition"
            >
              <Key className="h-4 w-4 text-slate-600" />
              View Account Permissions
            </button>
          </div>
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-slate-400">
          Role-based access is securely enforced for all dashboard views.
        </p>

      </div>
    </div>
  );
};
