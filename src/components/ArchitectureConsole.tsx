import React, { useState } from 'react';
import { 
  EurekaInstance, 
  GatewayRoute, 
  KafkaEvent, 
  JobPosting, 
  CandidateApplication, 
  MicroChallenge, 
  NotificationItem 
} from '../types';
import { 
  Layers, 
  Radio, 
  Route, 
  Activity, 
  Database, 
  Server, 
  Cpu, 
  Play, 
  CheckCircle2, 
  Code, 
  Send, 
  Check, 
  ShieldCheck
} from 'lucide-react';

interface ArchitectureConsoleProps {
  eurekaInstances: EurekaInstance[];
  gatewayRoutes: GatewayRoute[];
  kafkaEvents: KafkaEvent[];
  jobs: JobPosting[];
  applications: CandidateApplication[];
  challenges: Record<string, MicroChallenge>;
  notifications: NotificationItem[];
  onToggleEurekaInstance: (instanceId: string) => Promise<void>;
  onEmitKafkaEvent: (topic: KafkaEvent['topic'], key: string, payload: any, producer: string) => Promise<void>;
  onClearKafkaEvents: () => Promise<void>;
}

export const ArchitectureConsole: React.FC<ArchitectureConsoleProps> = ({
  eurekaInstances,
  gatewayRoutes,
  kafkaEvents,
  jobs,
  applications,
  challenges,
  notifications,
  onToggleEurekaInstance,
  onEmitKafkaEvent,
  onClearKafkaEvents
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'topology' | 'eureka' | 'gateway' | 'kafka' | 'databases'>('topology');
  const [selectedTopicFilter, setSelectedTopicFilter] = useState<string>('ALL');
  const [selectedNode, setSelectedNode] = useState<string | null>('gateway');

  // Manual Event Emission Form State
  const [customTopic, setCustomTopic] = useState<KafkaEvent['topic']>('borderline-challenge-requested');
  const [customKey, setCustomKey] = useState('app-manual-999');
  const [customPayload, setCustomPayload] = useState(
    JSON.stringify({ candidateName: 'Jordan Lee', baseScore: 68, missingSkills: ['System Design', 'Containerization'] }, null, 2)
  );

  const filteredKafkaEvents = kafkaEvents.filter(e => {
    return selectedTopicFilter === 'ALL' || e.topic === selectedTopicFilter;
  });

  const handleEmitManualEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(customPayload);
      await onEmitKafkaEvent(customTopic, customKey, parsed, 'Platform Testing Tool');
    } catch (err) {
      alert('Invalid JSON in payload');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Console Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5 tracking-tight">
            <Layers className="h-6 w-6 text-orange-600" />
            Platform Infrastructure & Service Health
          </h1>
          <p className="text-xs text-slate-500">
            Real-time status of connected platform services, network routing, event notifications, and secure data storage.
          </p>
        </div>

        {/* Sub-tab navigation */}
        <div className="flex items-center space-x-1 bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto overflow-x-auto max-w-full shadow-2xs">
          <button
            id="subtab-topology-btn"
            onClick={() => setActiveSubTab('topology')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeSubTab === 'topology'
                ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Overview
          </button>
          <button
            id="subtab-eureka-btn"
            onClick={() => setActiveSubTab('eureka')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeSubTab === 'eureka'
                ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Service Directory
          </button>
          <button
            id="subtab-gateway-btn"
            onClick={() => setActiveSubTab('gateway')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeSubTab === 'gateway'
                ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Network Routing
          </button>
          <button
            id="subtab-kafka-btn"
            onClick={() => setActiveSubTab('kafka')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
              activeSubTab === 'kafka'
                ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="h-3 w-3" />
            Event Stream ({kafkaEvents.length})
          </button>
          <button
            id="subtab-databases-btn"
            onClick={() => setActiveSubTab('databases')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              activeSubTab === 'databases'
                ? 'bg-white text-orange-600 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Data Storage
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SYSTEM OVERVIEW */}
      {/* ========================================================================= */}
      {activeSubTab === 'topology' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-orange-600" />
                  Live Platform Service Blueprint
                </h3>
                <p className="text-xs text-slate-500">Click any service block to review its role and responsibilities.</p>
              </div>
              <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl font-bold">
                ● 5 Active Connected Services
              </span>
            </div>

            {/* Topology Flow Graph */}
            <div className="py-4 overflow-x-auto">
              <div className="min-w-[700px] flex flex-col gap-5">
                
                {/* Level 1: Client & Gateway & Directory */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Client Actor */}
                  <div 
                    onClick={() => setSelectedNode('client')}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition ${
                      selectedNode === 'client' ? 'bg-orange-50/80 border-orange-500 ring-1 ring-orange-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">User Interface & Portal</div>
                    <div className="text-[10px] text-slate-500">Secure Web Interface</div>
                    <div className="text-[10px] text-orange-700 font-bold mt-1">Candidate & Recruiter Views</div>
                  </div>

                  {/* Central Gateway */}
                  <div 
                    onClick={() => setSelectedNode('gateway')}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition ${
                      selectedNode === 'gateway' ? 'bg-emerald-50/80 border-emerald-500 ring-1 ring-emerald-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-emerald-800">Central Network Router</div>
                    <div className="text-[10px] text-slate-500">Traffic Gate & Protection</div>
                    <div className="text-[10px] text-emerald-700 font-bold mt-1">Request Routing & Security</div>
                  </div>

                  {/* Service Directory */}
                  <div 
                    onClick={() => setSelectedNode('eureka')}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition ${
                      selectedNode === 'eureka' ? 'bg-amber-50/80 border-amber-500 ring-1 ring-amber-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-800">Platform Service Directory</div>
                    <div className="text-[10px] text-slate-500">Service Registration</div>
                    <div className="text-[10px] text-amber-700 font-bold mt-1">Real-Time Health Checks</div>
                  </div>
                </div>

                {/* Level 2: Downstream Core Services */}
                <div className="grid grid-cols-3 gap-4">
                  
                  {/* Auth Service */}
                  <div 
                    onClick={() => setSelectedNode('auth')}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition ${
                      selectedNode === 'auth' ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Authentication & Security</div>
                    <div className="text-[10px] text-slate-500">User Identity Store</div>
                    <div className="text-[10px] text-blue-700 font-bold mt-1">Logins & Role Access</div>
                  </div>

                  {/* Job & ATS Service */}
                  <div 
                    onClick={() => setSelectedNode('job-ats')}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition ${
                      selectedNode === 'job-ats' ? 'bg-orange-50/80 border-orange-500 ring-1 ring-orange-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Application Evaluation</div>
                    <div className="text-[10px] text-slate-500">Applicant Records Store</div>
                    <div className="text-[10px] text-orange-700 font-bold mt-1">Scoring & Evaluations</div>
                  </div>

                  {/* Challenge Boost Engine */}
                  <div 
                    onClick={() => setSelectedNode('challenge')}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition ${
                      selectedNode === 'challenge' ? 'bg-purple-50/80 border-purple-500 ring-1 ring-purple-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Skill Challenge Engine</div>
                    <div className="text-[10px] text-slate-500">Question & Quiz Store</div>
                    <div className="text-[10px] text-purple-700 font-bold mt-1">Skill Verification Quizzes</div>
                  </div>
                </div>

                {/* Level 3: Real-Time Event Hub */}
                <div 
                  onClick={() => setSelectedNode('kafka')}
                  className={`p-4 rounded-2xl border text-center cursor-pointer transition bg-orange-50/60 ${
                    selectedNode === 'kafka' ? 'border-orange-500 ring-1 ring-orange-500 shadow-xs' : 'border-orange-200 hover:border-orange-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-sm font-bold text-orange-800">
                    <Activity className="h-4 w-4 animate-pulse text-orange-600" />
                    Real-Time Message & Event Processing Hub
                  </div>
                  <div className="text-[11px] text-slate-700 mt-1 flex items-center justify-center gap-4 flex-wrap">
                    <span>Channel: <strong className="text-orange-700">borderline-challenge-requested</strong></span>
                    <span>Channel: <strong className="text-orange-700">challenge-completed</strong></span>
                    <span>Channel: <strong className="text-orange-700">candidate-notifications</strong></span>
                  </div>
                </div>

                {/* Level 4: Notification Consumer */}
                <div className="grid grid-cols-1 gap-4">
                  <div 
                    onClick={() => setSelectedNode('notification')}
                    className={`p-4 rounded-2xl border text-center cursor-pointer transition ${
                      selectedNode === 'notification' ? 'bg-orange-50/80 border-orange-500 ring-1 ring-orange-500 shadow-xs' : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-xs font-bold text-slate-900">Notification & Alert Service</div>
                    <div className="text-[10px] text-slate-500">Automated Communications</div>
                    <div className="text-[10px] text-slate-600 font-medium mt-1">Dispatches Time-Sensitive Assessment Links & Alerts</div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          {/* Node Inspector Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Code className="h-4 w-4 text-orange-600" />
              Service Functionality & Role Details
            </h3>

            {selectedNode === 'gateway' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-800 text-sm">Central Network Router</span>
                  <span className="text-slate-500 text-[11px]">Primary Request Router</span>
                </div>
                <p>
                  Acts as the single secure entry point for all frontend user traffic. Discovers backend services via the central directory and validates user session credentials before forwarding requests to protected endpoints.
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                  <div><strong>Key Responsibilities:</strong> Request routing, session verification, rate limiting, and unified error handling.</div>
                  <div><strong>Protected Paths:</strong> Candidate portal, recruiter dashboard, and challenge verification endpoints.</div>
                </div>
              </div>
            )}

            {selectedNode === 'eureka' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-800 text-sm">Platform Service Directory</span>
                  <span className="text-slate-500 text-[11px]">Active Registry</span>
                </div>
                <p>
                  Central dynamic registry where platform services register their health status and network availability. Ensures zero-downtime routing and automatic failover detection.
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                  <div><strong>Heartbeat Frequency:</strong> Every 30 seconds to maintain active status.</div>
                  <div><strong>Health Monitoring:</strong> Automated service failover and status tracking.</div>
                </div>
              </div>
            )}

            {selectedNode === 'job-ats' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Application Evaluation Service</span>
                  <span className="text-slate-500 text-[11px]">Candidate Review Engine</span>
                </div>
                <p>
                  Calculates base applicant scores and identifies candidates falling within the Borderline range (e.g. 60-74%). Automatically triggers dynamic verification challenges for candidate skill boosts.
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                  <div><strong>Scoring Criteria:</strong> Resume skills matching, experience level, and education verification.</div>
                  <div><strong>Event Trigger:</strong> Sends event when a candidate qualifies for a verification challenge.</div>
                </div>
              </div>
            )}

            {selectedNode === 'challenge' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-800 text-sm">Skill Challenge Engine</span>
                  <span className="text-slate-500 text-[11px]">Dynamic Verification Generator</span>
                </div>
                <p>
                  Receives qualification events, prepares customized missing-skill quizzes, evaluates candidate submissions in real-time, and calculates merit-based score improvements.
                </p>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-1">
                  <div><strong>Challenge Type:</strong> Time-sensitive, targeted multiple-choice technical assessments.</div>
                  <div><strong>Score Improvement:</strong> Up to +15 merit points directly added to applicant ranking.</div>
                </div>
              </div>
            )}

            {selectedNode === 'auth' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-800 text-sm">Authentication & Security Service</span>
                  <span className="text-slate-500 text-[11px]">Identity Management</span>
                </div>
                <p>
                  Protects candidate and recruiter accounts with secure session tokens, validating roles and access permissions across all views.
                </p>
              </div>
            )}

            {selectedNode === 'kafka' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-orange-800 text-sm">Real-Time Event Processing Hub</span>
                  <span className="text-slate-500 text-[11px]">Event Backbone</span>
                </div>
                <p>
                  High-throughput message broker that enables instant communication between candidate submissions, scoring algorithms, and notifications without delays.
                </p>
              </div>
            )}

            {selectedNode === 'notification' && (
              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">Notification Service</span>
                  <span className="text-slate-500 text-[11px]">Alerts Dispatcher</span>
                </div>
                <p>
                  Listens for qualification events and immediately sends time-sensitive challenge invitations and notifications to candidates.
                </p>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SERVICE DIRECTORY */}
      {/* ========================================================================= */}
      {activeSubTab === 'eureka' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Radio className="h-5 w-5 text-amber-600" />
                Platform Service Directory — Registered Components
              </h3>
              <p className="text-xs text-slate-500">Live health and availability tracking across all platform services</p>
            </div>
            <span className="text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200">
              Heartbeat Check: Every 30s
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Service Name</th>
                  <th className="py-3 px-4">Identifier</th>
                  <th className="py-3 px-4">Internal Address</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4">Last Check</th>
                  <th className="py-3 px-4">Service Details</th>
                  <th className="py-3 px-4 text-right">Service Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {eurekaInstances.map(inst => (
                  <tr key={inst.instanceId} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {inst.app.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-500">
                      {inst.instanceId}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">
                      {inst.ipAddr}:{inst.port}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        inst.status === 'UP'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                      }`}>
                        {inst.status === 'UP' ? '● Healthy' : '✖ Offline'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {new Date(inst.lastHeartbeat).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-500">
                      {Object.entries(inst.metadata).map(([k, v]) => `${k}: ${v}`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onToggleEurekaInstance(inst.instanceId)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                          inst.status === 'UP'
                            ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {inst.status === 'UP' ? 'Simulate Pause' : 'Restart Service'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NETWORK ROUTING */}
      {/* ========================================================================= */}
      {activeSubTab === 'gateway' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Route className="h-5 w-5 text-emerald-600" />
                Network Routing & Security Protection Rules
              </h3>
              <p className="text-xs text-slate-500">Directs requests to appropriate services while verifying security permissions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-slate-500 bg-slate-50 uppercase border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Route Name</th>
                  <th className="py-3 px-4">Target Destination</th>
                  <th className="py-3 px-4">Matching Rules</th>
                  <th className="py-3 px-4">Security Filters</th>
                  <th className="py-3 px-4">Requests Handled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {gatewayRoutes.map(route => (
                  <tr key={route.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {route.id}
                    </td>
                    <td className="py-3 px-4 text-emerald-700 font-bold">
                      {route.uri}
                    </td>
                    <td className="py-3 px-4">
                      {route.predicates.map(p => (
                        <span key={p} className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 text-[11px] mr-1">
                          {p}
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4">
                      {route.filters.map(f => (
                        <span key={f} className="inline-block px-2 py-0.5 rounded-md bg-orange-50 text-orange-800 border border-orange-200 text-[11px] mr-1 font-bold">
                          {f}
                        </span>
                      ))}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {route.matchCount} requests
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: REAL-TIME EVENT STREAM */}
      {/* ========================================================================= */}
      {activeSubTab === 'kafka' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-xs">
            
            {/* Event Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  Real-Time Platform Event Stream
                </h3>
                <p className="text-xs text-slate-500">Live message feed coordinating candidate evaluations and challenge updates</p>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={selectedTopicFilter}
                  onChange={e => setSelectedTopicFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                >
                  <option value="ALL">All Event Channels</option>
                  <option value="borderline-challenge-requested">Skill Challenge Requested</option>
                  <option value="challenge-completed">Challenge Completed</option>
                  <option value="candidate-notifications">Candidate Notifications</option>
                  <option value="job-applications">Job Applications</option>
                </select>

                <button
                  onClick={onClearKafkaEvents}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
                >
                  Clear Event Feed
                </button>
              </div>
            </div>

            {/* Event List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredKafkaEvents.length === 0 ? (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No events recorded yet. Submit a candidate application to see live events appear here!
                </div>
              ) : (
                filteredKafkaEvents.map(evt => (
                  <div 
                    key={evt.id} 
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2 hover:border-slate-300 transition"
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-800 border border-orange-200 font-bold">
                          {evt.topic}
                        </span>
                        <span className="text-slate-600">Channel {evt.partition}</span>
                        <span className="text-slate-500">Order: #{evt.offset}</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span>Origin: <strong className="text-slate-800">{evt.producer}</strong></span>
                        <span>{new Date(evt.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 text-emerald-300 overflow-x-auto text-[11px] whitespace-pre font-mono">
                      {JSON.stringify(evt.payload, null, 2)}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                      <span>Acknowledged By:</span>
                      {evt.consumerAcks.map(ack => (
                        <span key={ack} className="px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200 flex items-center gap-1 font-bold">
                          <Check className="h-3 w-3 text-emerald-600" /> {ack}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          {/* Emit Manual Message Form */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
              <Send className="h-4 w-4 text-orange-600" />
              Event Testing Tool — Emit Custom Test Event
            </h4>
            <form onSubmit={handleEmitManualEvent} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Target Event Channel</label>
                  <select
                    value={customTopic}
                    onChange={e => setCustomTopic(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  >
                    <option value="borderline-challenge-requested">borderline-challenge-requested</option>
                    <option value="challenge-completed">challenge-completed</option>
                    <option value="candidate-notifications">candidate-notifications</option>
                    <option value="job-applications">job-applications</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">Event Key (e.g. Candidate ID or App ID)</label>
                  <input
                    type="text"
                    value={customKey}
                    onChange={e => setCustomKey(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">Event Data (JSON format)</label>
                <textarea
                  rows={3}
                  value={customPayload}
                  onChange={e => setCustomPayload(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-300 font-mono text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-orange-600/20"
                >
                  <Play className="h-3.5 w-3.5" /> Publish Test Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: DATA STORAGE INSPECTOR */}
      {/* ========================================================================= */}
      {activeSubTab === 'databases' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Applications Data */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-emerald-600" /> Application & Evaluation Storage
              </span>
              <span className="text-[10px] text-slate-500">Service: Evaluation Engine</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <div>Records: <strong>Candidate Applications</strong> ({applications.length} submitted)</div>
              <div>Records: <strong>Job Postings</strong> ({jobs.length} active positions)</div>
              <div className="text-slate-500 text-[10px] pt-1">Stores candidate scores, qualifications, and recruitment statuses.</div>
            </div>
          </div>

          {/* Challenges Data */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-amber-600" /> Skill Verification Data Storage
              </span>
              <span className="text-[10px] text-slate-500">Service: Challenge Engine</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <div>Records: <strong>Verification Quizzes</strong> ({Object.keys(challenges).length} generated)</div>
              <div>Records: <strong>Completed Challenges</strong> ({(Object.values(challenges) as MicroChallenge[]).filter(c => c.status === 'COMPLETED').length} submissions)</div>
              <div className="text-slate-500 text-[10px] pt-1">Stores skill questions, test timer data, and score improvement results.</div>
            </div>
          </div>

          {/* User Accounts Data */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-blue-600" /> User Accounts & Access Records
              </span>
              <span className="text-[10px] text-slate-500">Service: Identity Management</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <div>Records: <strong>User Profiles</strong> (Candidates, Recruiters, Administrators)</div>
              <div>Records: <strong>Role Permissions</strong> (Access boundaries)</div>
              <div className="text-slate-500 text-[10px] pt-1">Maintains encrypted credentials and verified role permissions.</div>
            </div>
          </div>

          {/* Notification Data */}
          <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-orange-600" /> Notification & Communications History
              </span>
              <span className="text-[10px] text-slate-500">Service: Alert Service</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 space-y-1">
              <div>Records: <strong>Dispatched Assessment Invitations</strong> ({notifications.length} delivered)</div>
              <div>Delivery Channels: <strong>Email & In-App Alerts</strong></div>
              <div className="text-slate-500 text-[10px] pt-1">Tracks time-sensitive invitation links and candidate notifications.</div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
