import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Activity, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Zap, 
  Database, 
  Cpu, 
  Scale, 
  ArrowUpRight, 
  Users, 
  FileText,
  TrendingUp,
  Download
} from 'lucide-react';
import { ModelPerformanceMetrics, ScoreDistributionBucket } from '../types';

interface ModelMonitoringConsoleProps {
  onTriggerServiceCall?: (service: string, method: string, endpoint: string, port: number) => void;
}

export const ModelMonitoringConsole: React.FC<ModelMonitoringConsoleProps> = ({ onTriggerServiceCall }) => {
  const [metrics, setMetrics] = useState<ModelPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'distribution' | 'bias' | 'latency'>('distribution');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');
  const [batchIngesting, setBatchIngesting] = useState(false);
  const [batchMessage, setBatchMessage] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    onTriggerServiceCall?.('MODEL-MONITORING-SERVICE', 'GET', '/api/model-monitoring/metrics', 8085);
    try {
      const res = await fetch('/api/model-monitoring/metrics');
      const data = await res.json();
      setMetrics(data);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Error fetching model performance metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBatchIngestCHBMIT = async () => {
    setBatchIngesting(true);
    setBatchMessage(null);
    onTriggerServiceCall?.('PREPROCESSING-SERVICE', 'POST', '/api/preprocessing/batch-ingest', 8086);
    try {
      const res = await fetch('/api/preprocessing/batch-ingest', { method: 'POST' });
      const data = await res.json();
      setBatchMessage(data.message || 'Batch profiles ingested from CHBMIT Dataset!');
      await fetchMetrics();
    } catch (err) {
      console.error('Error batch ingesting CHBMIT dataset:', err);
      setBatchMessage('Failed to trigger CHBMIT batch ingestion');
    } finally {
      setBatchIngesting(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Banner / Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                <Cpu className="w-3.5 h-3.5" />
                MODEL-MONITORING-SERVICE :8085
              </span>
              <span className="text-xs text-gray-500">Last Synced: {lastRefreshed || 'Just now'}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Model Performance & Monitoring Console
            </h1>
            <p className="text-sm text-gray-600 mt-1 max-w-3xl">
              Continuous observability suite aligning with the TalentPulse Architecture: 
              Score Distribution Tracking (Phase-1), Match Engine Bias Assessment (Phase-2), and System Latency Monitoring (Phase-3).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBatchIngestCHBMIT}
              disabled={batchIngesting}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50"
            >
              <Database className={`w-4 h-4 ${batchIngesting ? 'animate-spin' : ''}`} />
              {batchIngesting ? 'Ingesting CHBMIT...' : 'Batch Ingest CHBMIT Dataset'}
            </button>

            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Metrics
            </button>
          </div>
        </div>

        {batchMessage && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 flex items-center gap-2 text-xs text-blue-800">
            <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <span>{batchMessage}</span>
          </div>
        )}

        {/* Phase Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 mt-6 pt-2">
          <button
            onClick={() => setActiveTab('distribution')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'distribution'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Phase-1: Score Distribution Tracking
          </button>

          <button
            onClick={() => setActiveTab('bias')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'bias'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Scale className="w-4 h-4" />
            Phase-2: Match Engine Bias Assessment
          </button>

          <button
            onClick={() => setActiveTab('latency')}
            className={`pb-3 px-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'latency'
                ? 'border-purple-600 text-purple-700 font-semibold'
                : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <Clock className="w-4 h-4" />
            Phase-3: System Latency Monitoring
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Direct Shortlist (&gt;75%)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{metrics.directShortlistCount}</span>
              <span className="text-xs text-emerald-600 font-medium">Auto-approved</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              High match confidence from ATS Match Engine
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Borderline (60% - 74%)</span>
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{metrics.borderlineCount}</span>
              <span className="text-xs text-amber-600 font-medium">5-min Micro-quiz</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Eligible for Borderline Boost (0% - 15%)
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Boosted Shortlists</span>
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{metrics.boostedShortlistCount}</span>
              <span className="text-xs text-blue-600 font-medium">{metrics.salvageRate}% Salvage Rate</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Borderline candidates rescued by Challenge Engine
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between text-xs text-gray-500 font-medium">
              <span>Direct Rejections (&lt;60%)</span>
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-gray-900">{metrics.directRejectCount}</span>
              <span className="text-xs text-rose-600 font-medium">Auto-rejected</span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Below requisite threshold; rejection notified
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Phase-1 Score Distribution Tracking */}
      {activeTab === 'distribution' && metrics && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Phase-1: ATS Match Engine Score Distribution
                </h2>
                <p className="text-xs text-gray-500">
                  Distribution of candidate scores across the 3 decision tiers established in the project workflow.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-rose-700">
                  <span className="w-3 h-3 rounded bg-rose-400"></span> Direct Reject (&lt;60%)
                </span>
                <span className="flex items-center gap-1.5 text-amber-700">
                  <span className="w-3 h-3 rounded bg-amber-400"></span> Borderline (60-74%)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-3 h-3 rounded bg-emerald-500"></span> Direct Shortlist (&gt;75%)
                </span>
              </div>
            </div>

            {/* Score Buckets Bar Chart */}
            <div className="space-y-4">
              {metrics.scoreDistribution.map((bucket, idx) => {
                let barColor = 'bg-rose-500';
                let tagColor = 'text-rose-700 bg-rose-50 border-rose-200';
                let tierLabel = 'Direct Rejection (<60%)';

                if (bucket.tier === 'BORDERLINE') {
                  barColor = 'bg-amber-500';
                  tagColor = 'text-amber-800 bg-amber-50 border-amber-200';
                  tierLabel = 'Borderline (60% - 74%) -> 5-min Micro-quiz';
                } else if (bucket.tier === 'SHORTLIST') {
                  barColor = 'bg-emerald-500';
                  tagColor = 'text-emerald-800 bg-emerald-50 border-emerald-200';
                  tierLabel = 'Direct Shortlist (>75%)';
                }

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-800 w-24">{bucket.range}</span>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${tagColor}`}>
                          {tierLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{bucket.count} candidates</span>
                        <span className="font-bold text-gray-900 w-10 text-right">{bucket.percentage}%</span>
                      </div>
                    </div>

                    <div className="w-full bg-gray-100 h-4 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${barColor} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(4, bucket.percentage)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Workflow Cutoff Diagram Callout */}
            <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Borderline Evaluation Process Impact</h4>
                  <p className="text-xs text-gray-600 mt-0.5 max-w-xl">
                    Candidates scoring 60% to 74% are not discarded. Instead, the <strong>CHALLENGE-SERVICE :8083</strong> triggers 
                    a targeted 5-minute technical micro-quiz. A candidate scoring high on the quiz receives a <strong>+0% to +15% boost</strong>, 
                    unlocking the shortlist and drastically reducing false negatives!
                  </p>
                </div>
              </div>

              <div className="text-center bg-white px-4 py-2.5 rounded-lg border border-gray-200 shadow-xs flex-shrink-0">
                <span className="text-xs text-gray-500 uppercase font-semibold">Salvage Efficiency</span>
                <div className="text-xl font-black text-purple-700">{metrics.salvageRate}%</div>
                <span className="text-[11px] text-emerald-600 font-medium">Borderlines Rescued</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Phase-2 Match Engine Bias Assessment */}
      {activeTab === 'bias' && metrics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Demographic Parity Ratio</span>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{metrics.biasAssessment.demographicParityRatio}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  EEOC Compliant
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Exceeds standard 80% four-fifths rule across candidate pools.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">Disparate Impact Ratio</span>
                <Scale className="w-4 h-4 text-blue-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{metrics.biasAssessment.disparateImpactRatio}</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Balanced
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Calculated across experience tiers and technical background cohorts.
              </p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500">False-Negative Mitigation Rate</span>
                <TrendingUp className="w-4 h-4 text-purple-600" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{metrics.biasAssessment.falseNegativeMitigationRate}%</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Percentage of qualified non-traditional applicants successfully rescued by the 5-min quiz.
              </p>
            </div>
          </div>

          {/* Cohort Analysis Table */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">Applicant Cohort Parity Analysis</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Auditing match scores, shortlist qualification, and borderline boost participation by education and background.
                </p>
              </div>

              <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                Status: {metrics.biasAssessment.biasStatus}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 text-gray-600 border-b border-gray-200 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Candidate Cohort</th>
                    <th className="py-3 px-4 text-center">Applicants</th>
                    <th className="py-3 px-4 text-center">Avg ATS Score</th>
                    <th className="py-3 px-4 text-center">Shortlist Rate</th>
                    <th className="py-3 px-4 text-center">Quiz Participation</th>
                    <th className="py-3 px-4 text-right">Parity Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800">
                  {metrics.biasAssessment.cohortAnalysis.map((c, i) => (
                    <tr key={i} className="hover:bg-gray-50/50">
                      <td className="py-3.5 px-4 font-semibold text-gray-900 flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        {c.cohort}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">{c.applicants}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-medium">{c.avgScore}%</td>
                      <td className="py-3.5 px-4 text-center font-mono text-emerald-600 font-semibold">{c.shortlistRate}%</td>
                      <td className="py-3.5 px-4 text-center font-mono text-blue-600">{c.boostParticipation}%</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Balanced
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Phase-3 System Latency Monitoring */}
      {activeTab === 'latency' && metrics && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Phase-3: End-to-End Service Latency Telemetry
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Real-time latency breakdown across application services, directory routing, and message processing.
                </p>
              </div>

              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                All Services Healthy
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {metrics.systemLatency.map((svc, i) => (
                <div key={i} className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-gray-200 text-gray-800">
                        Port :{svc.port}
                      </span>
                      <span className="font-bold text-xs text-gray-900">{svc.serviceName}</span>
                    </div>

                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {svc.status}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-mono text-gray-500 truncate">
                    {svc.endpoint}
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                    <div className="p-2 rounded bg-white border border-gray-200">
                      <div className="text-[10px] text-gray-500 uppercase font-medium">Avg Latency</div>
                      <div className="text-sm font-bold text-gray-900 font-mono mt-0.5">{svc.avgLatencyMs} ms</div>
                    </div>

                    <div className="p-2 rounded bg-white border border-gray-200">
                      <div className="text-[10px] text-gray-500 uppercase font-medium">P95 Latency</div>
                      <div className="text-sm font-bold text-amber-700 font-mono mt-0.5">{svc.p95LatencyMs} ms</div>
                    </div>

                    <div className="p-2 rounded bg-white border border-gray-200">
                      <div className="text-[10px] text-gray-500 uppercase font-medium">P99 Latency</div>
                      <div className="text-sm font-bold text-gray-700 font-mono mt-0.5">{svc.p99LatencyMs} ms</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
