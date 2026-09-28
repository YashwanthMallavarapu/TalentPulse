/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  JobPosting, 
  CandidateApplication, 
  MicroChallenge, 
  KafkaEvent, 
  EurekaInstance, 
  GatewayRoute, 
  NotificationItem,
  AuthUser,
  JwtTokenPayload,
  UserRole,
  ServiceCallTelemetry
} from './types';
import { Header } from './components/Header';
import { CandidatePortal } from './components/CandidatePortal';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { ArchitectureConsole } from './components/ArchitectureConsole';
import { DeveloperChecklist } from './components/DeveloperChecklist';
import { ModelPerformanceMonitoring } from './components/ModelPerformanceMonitoring';
import { ServiceCallHUD } from './components/ServiceCallHUD';
import { JwtAuthModal } from './components/JwtAuthModal';
import { UserProfile } from './components/UserProfile';
import { AccessDeniedPanel } from './components/AccessDeniedPanel';
import { LoginPage } from './components/LoginPage';
import { Sparkles, Terminal, Activity, Zap, RefreshCw, Key } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'candidate' | 'recruiter' | 'monitoring' | 'architecture' | 'checklist'>('candidate');
  
  // Real-time Microservice Telemetry Log State
  const [telemetryLogs, setTelemetryLogs] = useState<ServiceCallTelemetry[]>([]);

  const recordServiceCall = (
    serviceName: string,
    servicePort: number,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    endpoint: string,
    statusCode: number,
    summary: string,
    kafkaEventEmitted?: string
  ) => {
    const newLog: ServiceCallTelemetry = {
      id: `call-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toLocaleTimeString(),
      serviceName,
      servicePort,
      method,
      endpoint,
      statusCode,
      durationMs: Math.floor(Math.random() * 38) + 12,
      summary,
      kafkaEventEmitted
    };
    setTelemetryLogs(prev => [...prev.slice(-30), newLog]);
  };
  
  // Authentication & JWT State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [jwtToken, setJwtToken] = useState<string | null>(null);
  const [jwtPayload, setJwtPayload] = useState<JwtTokenPayload | null>(null);
  const [showJwtModal, setShowJwtModal] = useState<boolean>(false);
  const [showUserProfileModal, setShowUserProfileModal] = useState<boolean>(false);

  // Microservices State
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applications, setApplications] = useState<CandidateApplication[]>([]);
  const [eurekaInstances, setEurekaInstances] = useState<EurekaInstance[]>([]);
  const [gatewayRoutes, setGatewayRoutes] = useState<GatewayRoute[]>([]);
  const [kafkaEvents, setKafkaEvents] = useState<KafkaEvent[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [challenges, setChallenges] = useState<Record<string, MicroChallenge>>({});
  
  // Active Challenge Modal State
  const [activeChallenge, setActiveChallenge] = useState<MicroChallenge | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [liveEventBanner, setLiveEventBanner] = useState<string | null>(null);

  // Helper for resilient JSON fetching that never crashes on HTML or network errors
  const safeFetchJson = async <T,>(url: string, fallback: T): Promise<T> => {
    try {
      const res = await fetch(url);
      if (!res.ok) return fallback;
      const contentType = res.headers.get('content-type');
      if (contentType && !contentType.includes('application/json')) {
        return fallback;
      }
      const data = await res.json();
      return (data !== null && data !== undefined) ? data : fallback;
    } catch {
      return fallback;
    }
  };

  // Initial Auth Login (Signs token and redirects to appropriate panel)
  const authenticateRole = async (role: UserRole, customDetails?: { email: string; name: string; title?: string }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          email: customDetails?.email,
          name: customDetails?.name
        })
      });
      if (res.ok) {
        const data = await res.json();
        if ((data.token || data.accessToken) && data.user) {
          const token = data.token || data.accessToken;
          setJwtToken(token);
          setCurrentUser(data.user);
          setJwtPayload(data.payload);
          
          // Direct to corresponding panel based on role
          if (data.user.role === 'CANDIDATE') setActiveTab('candidate');
          else if (data.user.role === 'RECRUITER') setActiveTab('recruiter');
          else if (data.user.role === 'ADMIN') setActiveTab('monitoring');
          else if (data.user.role === 'ARCHITECT') setActiveTab('architecture');
          else if (data.user.role === 'DEVOPS') setActiveTab('checklist');
          else setActiveTab('candidate');

          recordServiceCall(
            'AUTH-SERVICE',
            8081,
            'POST',
            '/api/auth/login',
            200,
            `User signed in: ${data.user.name} (${data.user.role})`
          );

          setLiveEventBanner(`Signed in as ${data.user.name} (${data.user.role === 'CANDIDATE' ? 'Job Candidate' : data.user.role === 'RECRUITER' ? 'Recruiter' : data.user.role})`);
          setTimeout(() => setLiveEventBanner(null), 4000);
        }
      }
    } catch (err) {
      console.error('Error during authentication:', err);
    }
  };

  // Register New User Handler
  const handleRegisterUser = async (name: string, email: string, role: UserRole, title?: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role, title })
      });
      if (res.ok) {
        const data = await res.json();
        if ((data.token || data.accessToken) && data.user) {
          const token = data.token || data.accessToken;
          setJwtToken(token);
          setCurrentUser(data.user);
          setJwtPayload(data.payload);

          // Direct user to appropriate panel
          if (role === 'CANDIDATE') setActiveTab('candidate');
          else if (role === 'RECRUITER') setActiveTab('recruiter');
          else if (role === 'ADMIN') setActiveTab('recruiter');
          else if (role === 'ARCHITECT') setActiveTab('architecture');
          else if (role === 'DEVOPS') setActiveTab('checklist');
          else setActiveTab('candidate');

          recordServiceCall(
            'AUTH-SERVICE',
            8081,
            'POST',
            '/api/auth/register',
            200,
            `Registered account for ${data.user.name} (Role: ${data.user.role})`
          );

          setLiveEventBanner(`Account created! Signed in as ${data.user.name} (${data.user.role === 'CANDIDATE' ? 'Job Candidate' : data.user.role === 'RECRUITER' ? 'Recruiter' : data.user.role})`);
          setTimeout(() => setLiveEventBanner(null), 4000);
        }
      }
    } catch (err) {
      console.error('Error during user registration:', err);
    }
  };

  // Logout Handler
  const handleLogout = () => {
    setJwtToken(null);
    setCurrentUser(null);
    setJwtPayload(null);
    localStorage.removeItem('tp_auth_role');
    setLiveEventBanner('You have been signed out successfully.');
    setTimeout(() => setLiveEventBanner(null), 4000);
  };

  // User Profile Update Handler (Re-mints JWT with updated claims)
  const handleUpdateProfile = async (updatedData: {
    name: string;
    email: string;
    title: string;
    department?: string;
    phone?: string;
    bio?: string;
    location?: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
        },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to update user profile');
      }
      const data = await res.json();
      if (data.user && (data.token || data.accessToken)) {
        const token = data.token || data.accessToken;
        setCurrentUser(data.user);
        setJwtToken(token);
        setJwtPayload(data.payload);

        recordServiceCall(
          'AUTH-SERVICE',
          8081,
          'PUT',
          '/api/auth/profile',
          200,
          `Updated profile details and session token for ${data.user.name}`
        );

        setLiveEventBanner(`Profile updated successfully for ${data.user.name}`);
        setTimeout(() => setLiveEventBanner(null), 4000);
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Error updating user profile:', err);
      throw err;
    }
  };

  // Load all initial data from simulated Spring Boot REST APIs
  const refreshAllState = async () => {
    try {
      const [jobsRes, appsRes, eurekaRes, gatewayRes, kafkaRes, notifRes] = await Promise.all([
        safeFetchJson<JobPosting[]>('/api/jobs', []),
        safeFetchJson<CandidateApplication[]>('/api/applications', []),
        safeFetchJson<{ applications: EurekaInstance[] }>('/api/eureka/apps', { applications: [] }),
        safeFetchJson<{ routes: GatewayRoute[] }>('/api/gateway/routes', { routes: [] }),
        safeFetchJson<KafkaEvent[]>('/api/kafka/events', []),
        safeFetchJson<NotificationItem[]>('/api/notifications', [])
      ]);

      if (Array.isArray(jobsRes) && jobsRes.length > 0) setJobs(jobsRes);
      if (Array.isArray(appsRes) && appsRes.length > 0) setApplications(appsRes);
      if (eurekaRes?.applications && eurekaRes.applications.length > 0) setEurekaInstances(eurekaRes.applications);
      if (gatewayRes?.routes && gatewayRes.routes.length > 0) setGatewayRoutes(gatewayRes.routes);
      if (Array.isArray(kafkaRes) && kafkaRes.length > 0) setKafkaEvents(kafkaRes);
      if (Array.isArray(notifRes) && notifRes.length > 0) setNotifications(notifRes);
    } catch (err) {
      console.warn('Notice while fetching microservices state:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAllState();
    
    // Periodic poll for heartbeats and live events
    const interval = setInterval(refreshAllState, 8000);
    return () => clearInterval(interval);
  }, []);

    // Application submission handler (Triggers ATS Scoring & Borderline Interceptor)
  const handleApply = async (jobId: string, candidateData: {
    candidateName: string;
    candidateEmail: string;
    candidateTitle: string;
    resumeText: string;
    yearsExperience: number;
  }) => {
    const res = await fetch(`/api/jobs/${jobId}/apply`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
      },
      body: JSON.stringify(candidateData)
    });
    const data = await res.json();
    
    // Refresh state
    await refreshAllState();

    recordServiceCall(
      'JOB-ATS-SERVICE',
      8082,
      'POST',
      `/api/jobs/${jobId}/apply`,
      200,
      `ATS scored ${candidateData.candidateName}: ${data.application?.score || 68}% (${data.application?.status || 'BORDERLINE'})`,
      data.application?.status === 'BORDERLINE' ? 'borderline-challenge-requested' : 'job-applications'
    );

    // Trigger live event notification banner
    setLiveEventBanner(
      `Application submitted: ${data.application.candidateName} for ${data.application.jobTitle}`
    );
    setTimeout(() => setLiveEventBanner(null), 5000);

    return data;
  };

  // Challenge Start Handler
  const handleStartChallenge = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}/start`, { 
        method: 'POST',
        headers: { 'Authorization': jwtToken ? `Bearer ${jwtToken}` : '' }
      });
      const data = await res.json();
      setActiveChallenge(data);
      setChallenges(prev => ({ ...prev, [challengeId]: data }));

      recordServiceCall(
        'CHALLENGE-SERVICE',
        8083,
        'POST',
        `/api/challenges/${challengeId}/start`,
        200,
        `Started 5-minute timed micro-challenge for candidate application`
      );
    } catch (err) {
      console.error('Error starting challenge:', err);
    }
  };

  // Open Challenge by ID (e.g. from magic link notification)
  const handleOpenChallengeById = async (challengeId: string) => {
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        headers: { 'Authorization': jwtToken ? `Bearer ${jwtToken}` : '' }
      });
      const data = await res.json();
      setActiveChallenge(data);
      setActiveTab('candidate');

      recordServiceCall(
        'CHALLENGE-SERVICE',
        8083,
        'GET',
        `/api/challenges/${challengeId}`,
        200,
        `Fetched micro-challenge session payload via Gateway route`
      );
    } catch (err) {
      console.error('Error opening challenge:', err);
    }
  };

  // Challenge Submit Handler (Calculates score delta boost)
  const handleSubmitChallenge = async (challengeId: string, answers: Record<string, number>) => {
    const res = await fetch(`/api/challenges/${challengeId}/submit`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
      },
      body: JSON.stringify({ answers })
    });
    const data = await res.json();

    // Update state
    if (data.challenge) {
      setActiveChallenge(data.challenge);
      setChallenges(prev => ({ ...prev, [challengeId]: data.challenge }));
    }
    await refreshAllState();

    recordServiceCall(
      'CHALLENGE-SERVICE',
      8083,
      'POST',
      `/api/challenges/${challengeId}/submit`,
      200,
      `Challenge graded! Applied borderline delta boost: +${data.challenge?.scoreBoostDelta || 14}%`,
      'challenge-completed'
    );

    setLiveEventBanner(
      `Verification quiz completed! Candidate score boosted by +${data.challenge?.scoreBoostDelta || 14}%`
    );
    setTimeout(() => setLiveEventBanner(null), 6000);

    return data;
  };

  // Toggle Eureka Instance Status
  const handleToggleEurekaInstance = async (instanceId: string) => {
    await fetch('/api/eureka/toggle-status', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
      },
      body: JSON.stringify({ instanceId })
    });
    await refreshAllState();

    recordServiceCall(
      'EUREKA-SERVER',
      8761,
      'POST',
      '/api/eureka/toggle-status',
      200,
      `Toggled heartbeat registration status for instance: ${instanceId}`
    );
  };

  // Manual Kafka Emit
  const handleEmitKafkaEvent = async (
    topic: KafkaEvent['topic'],
    key: string,
    payload: any,
    producer: string
  ) => {
    await fetch('/api/kafka/emit', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
      },
      body: JSON.stringify({ topic, key, payload, producer })
    });
    await refreshAllState();

    recordServiceCall(
      'KAFKA-BROKER',
      9092,
      'POST',
      '/api/kafka/emit',
      200,
      `Dispatched message to topic [${topic}] with key [${key}]`,
      topic
    );

    setLiveEventBanner(`Kafka Event: ${topic} manually published by ${producer}`);
    setTimeout(() => setLiveEventBanner(null), 4000);
  };

  // Clear Kafka Events
  const handleClearKafkaEvents = async () => {
    await fetch('/api/kafka/clear', { 
      method: 'POST',
      headers: { 'Authorization': jwtToken ? `Bearer ${jwtToken}` : '' }
    });
    await refreshAllState();

    recordServiceCall(
      'KAFKA-BROKER',
      9092,
      'POST',
      '/api/kafka/clear',
      200,
      `Flushed simulated Kafka topic log segments`
    );
  };

  // Developer Test Runner
  const handleRunTest = async (taskId: string) => {
    const res = await fetch('/api/dev/run-test', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
      },
      body: JSON.stringify({ taskId })
    });
    const result = await res.json();

    recordServiceCall(
      'TEST-RUNNER',
      8080,
      'POST',
      '/api/dev/run-test',
      200,
      `Executed integration verification test: ${taskId}`
    );

    return result;
  };

  // Add New Job
  const handleAddNewJob = async (jobData: Partial<JobPosting>) => {
    await fetch('/api/jobs', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': jwtToken ? `Bearer ${jwtToken}` : ''
      },
      body: JSON.stringify(jobData)
    });
    await refreshAllState();

    recordServiceCall(
      'JOB-ATS-SERVICE',
      8082,
      'POST',
      '/api/jobs',
      201,
      `Published new requisition: ${jobData.title || 'Software Engineer'}`
    );
  };

  // Reset Demo
  const handleResetDemo = async () => {
    await fetch('/api/admin/reset-demo', { 
      method: 'POST',
      headers: { 'Authorization': jwtToken ? `Bearer ${jwtToken}` : '' }
    });
    await refreshAllState();
    setActiveChallenge(null);
    setLiveEventBanner('Demo environment re-initialized to default seed state.');
    setTimeout(() => setLiveEventBanner(null), 4000);
  };

  // Role Access Checks
  const userRole = currentUser?.role || 'CANDIDATE';
  
  const canAccessCandidate = userRole === 'CANDIDATE' || userRole === 'ADMIN';
  const canAccessRecruiter = userRole === 'RECRUITER' || userRole === 'ADMIN';
  const canAccessMonitoring = ['ADMIN', 'RECRUITER', 'ARCHITECT', 'DEVOPS'].includes(userRole);
  const canAccessArchitecture = ['ARCHITECT', 'DEVOPS', 'ADMIN'].includes(userRole);
  const canAccessChecklist = ['DEVOPS', 'ARCHITECT', 'ADMIN'].includes(userRole);

  // Keep active dashboard synchronized with role permissions
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === 'CANDIDATE' && activeTab !== 'candidate') {
        setActiveTab('candidate');
      } else if (currentUser.role === 'RECRUITER' && activeTab !== 'recruiter' && activeTab !== 'monitoring') {
        setActiveTab('recruiter');
      } else if (currentUser.role === 'ARCHITECT' && activeTab !== 'architecture' && activeTab !== 'monitoring' && activeTab !== 'checklist') {
        setActiveTab('architecture');
      } else if (currentUser.role === 'DEVOPS' && activeTab !== 'checklist' && activeTab !== 'architecture') {
        setActiveTab('checklist');
      }
    }
  }, [currentUser?.role]);

  // 1. If not authenticated, display ONLY the Enterprise Login & SSO Gateway
  if (!currentUser || !jwtToken) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
        
        {/* Floating Notification Toast if any */}
        {liveEventBanner && (
          <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d1527] border border-orange-500/50 shadow-2xl text-xs text-slate-100">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping"></span>
              <Activity className="h-4 w-4 text-orange-500" />
              <span className="font-semibold">{liveEventBanner}</span>
            </div>
          </div>
        )}

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <LoginPage
            currentUser={currentUser}
            jwtToken={jwtToken}
            onLogin={async (role, customDetails) => {
              await authenticateRole(role, customDetails);
            }}
            onRegister={handleRegisterUser}
          />
        </main>

        <footer className="mt-auto border-t border-slate-800/80 bg-[#070b14] py-4 text-center text-xs text-slate-400">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>TalentPulse • Automated Candidate Evaluation & Skill Verification</span>
            <span>Secure Cloud Platform • Real-Time Processing • Privacy Compliant</span>
          </div>
        </footer>
      </div>
    );
  }

  // 2. Once authenticated, display the COMPLETE APPLICATION
  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-orange-500 selection:text-white">
      
      {/* Top Navigation Bar with User Profile, Notifications & Health */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        eurekaInstances={eurekaInstances}
        currentUser={currentUser}
        jwtToken={jwtToken}
        onOpenJwtModal={() => setShowJwtModal(true)}
        onOpenUserProfile={() => setShowUserProfileModal(true)}
        onQuickRoleSwitch={role => authenticateRole(role)}
        onOpenChallengeById={handleOpenChallengeById}
        onResetDemo={handleResetDemo}
        onLogout={handleLogout}
      />

      {/* Floating Notification Toast */}
      {liveEventBanner && (
        <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0d1527] border border-orange-500/50 shadow-2xl text-xs text-slate-100">
            <span className="h-2.5 w-2.5 rounded-full bg-orange-500 animate-ping"></span>
            <Activity className="h-4 w-4 text-orange-500" />
            <span className="font-semibold">{liveEventBanner}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <RefreshCw className="h-8 w-8 text-orange-500 animate-spin mx-auto" />
            <p className="text-sm text-slate-400">Connecting to platform services...</p>
          </div>
        ) : (
          <>
            {activeTab === 'candidate' && (
              canAccessCandidate ? (
                <CandidatePortal
                  jobs={jobs}
                  applications={applications}
                  activeChallenge={activeChallenge}
                  onApply={handleApply}
                  onStartChallenge={handleStartChallenge}
                  onSubmitChallenge={handleSubmitChallenge}
                  onSelectChallenge={setActiveChallenge}
                  onCloseChallengeModal={() => setActiveChallenge(null)}
                  onRecordTelemetry={recordServiceCall}
                />
              ) : (
                <AccessDeniedPanel
                  panelName="Job Candidate Portal"
                  requiredRoles={['CANDIDATE', 'ADMIN']}
                  currentUser={currentUser}
                  onOpenJwtModal={() => setShowJwtModal(true)}
                  onQuickSwitch={role => authenticateRole(role)}
                />
              )
            )}

            {activeTab === 'recruiter' && (
              canAccessRecruiter ? (
                <RecruiterDashboard
                  jobs={jobs}
                  applications={applications}
                  challenges={challenges}
                  onAddNewJob={handleAddNewJob}
                  onSelectCandidate={() => {}}
                />
              ) : (
                <AccessDeniedPanel
                  panelName="Recruiter ATS & Borderline Score Boost Console"
                  requiredRoles={['RECRUITER', 'ADMIN']}
                  currentUser={currentUser}
                  onOpenJwtModal={() => setShowJwtModal(true)}
                  onQuickSwitch={role => authenticateRole(role)}
                />
              )
            )}

            {activeTab === 'monitoring' && (
              canAccessMonitoring ? (
                <ModelPerformanceMonitoring onRecordTelemetry={recordServiceCall} />
              ) : (
                <AccessDeniedPanel
                  panelName="Model Performance & Bias Telemetry Console"
                  requiredRoles={['ADMIN', 'RECRUITER', 'ARCHITECT']}
                  currentUser={currentUser}
                  onOpenJwtModal={() => setShowJwtModal(true)}
                  onQuickSwitch={role => authenticateRole(role)}
                />
              )
            )}

            {activeTab === 'architecture' && (
              canAccessArchitecture ? (
                <ArchitectureConsole
                  eurekaInstances={eurekaInstances}
                  gatewayRoutes={gatewayRoutes}
                  kafkaEvents={kafkaEvents}
                  jobs={jobs}
                  applications={applications}
                  challenges={challenges}
                  notifications={notifications}
                  onToggleEurekaInstance={handleToggleEurekaInstance}
                  onEmitKafkaEvent={handleEmitKafkaEvent}
                  onClearKafkaEvents={handleClearKafkaEvents}
                />
              ) : (
                <AccessDeniedPanel
                  panelName="Service-Oriented Architecture & Event Streaming Console"
                  requiredRoles={['ARCHITECT', 'DEVOPS', 'ADMIN']}
                  currentUser={currentUser}
                  onOpenJwtModal={() => setShowJwtModal(true)}
                  onQuickSwitch={role => authenticateRole(role)}
                />
              )
            )}

            {activeTab === 'checklist' && (
              canAccessChecklist ? (
                <DeveloperChecklist
                  onRunTest={handleRunTest}
                />
              ) : (
                <AccessDeniedPanel
                  panelName="Developer Checklist & Automated API Test Suite"
                  requiredRoles={['DEVOPS', 'ARCHITECT', 'ADMIN']}
                  currentUser={currentUser}
                  onOpenJwtModal={() => setShowJwtModal(true)}
                  onQuickSwitch={role => authenticateRole(role)}
                />
              )
            )}
          </>
        )}

      </main>

      {/* Live Microservice Dispatch HUD */}
      {/* User Profile & Account Details Modal */}
      <UserProfile
        isOpen={showUserProfileModal}
        onClose={() => setShowUserProfileModal(false)}
        currentUser={currentUser}
        jwtToken={jwtToken}
        jwtPayload={jwtPayload}
        onUpdateProfile={handleUpdateProfile}
        onOpenJwtInspector={() => {
          setShowUserProfileModal(false);
          setShowJwtModal(true);
        }}
      />

      {/* Account Security & Permissions Modal */}
      <JwtAuthModal
        isOpen={showJwtModal}
        onClose={() => setShowJwtModal(false)}
        currentUser={currentUser}
        jwtToken={jwtToken}
        jwtPayload={jwtPayload}
        onLoginAsRole={role => authenticateRole(role)}
        onCustomLogin={(email, role, name) => authenticateRole(role, { email, name })}
      />

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 bg-[#070b14] py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>TalentPulse • Automated Candidate Evaluation & Skill Verification</span>
          <span>Secure Cloud Platform • Real-Time Processing • Privacy Compliant</span>
        </div>
      </footer>

    </div>
  );
}
