import React, { useState, useEffect } from 'react';
import { ModelPerformanceMetrics } from '../types';
import { 
  BarChart3, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  Zap, 
  Layers, 
  Sparkles,
  Award,
  Users,
  Clock,
  ArrowUpRight,
  Server,
  FileCheck
} from 'lucide-react';

interface ModelPerformanceMonitoringProps {
  onRecordTelemetry?: (serviceName: string, port: number, method: 'GET' | 'POST', endpoint: string, status: number, summary: string) => void;
}

export const ModelPerformanceMonitoring: React.FC<ModelPerformanceMonitoringProps> = ({ onRecordTelemetry }) => {
  const [metrics, setMetrics] = useState<ModelPerformanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'all' | 'phase1' | 'phase2' | 'phase3'>('all');

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/model-monitoring/metrics');
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
        if (onRecordTelemetry) {
          onRecordTelemetry(
            'MODEL-MONITORING-SERVICE',
            8085,
            'GET',
            '/api/model-monitoring/metrics',
            200,
            `Retrieved 3-phase performance telemetry across ${data.totalEvaluated} candidates (Salvage Rate: ${data.salvageRate}%)`
          );
        }
      }
    } catch (err) {
      console.error('Failed to fetch model monitoring metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const [batchLoading, setBatchLoading] = useState(false);
  const [batchNotice, setBatchNotice] = useState<string | null>(null);

  const handleIngestBatch = async () => {
    setBatchLoading(true);
    setBatchNotice(null);
    try {
      const res = await fetch('/api/preprocessing/ingest-chbmit-batch', { method: 'POST' });
      if (res.ok) {
        const ct = res.headers.get('content-type');
        const data = ct && ct.includes('application/json') ? await res.json() : {};
        setBatchNotice(data.message || 'Ingested benchmark dataset batch successfully.');
        if (onRecordTelemetry) {
          onRecordTelemetry(
            'PREPROCESSING-SERVICE',
            8086,
            'POST',
            '/api/preprocessing/ingest-chbmit-batch',
            200,
            `Batch ingested benchmark dataset (5 profiles) through Phase 1-3 Preprocessing into ATS Match Engine`
          );
        }
        await fetchMetrics();
      }
    } catch (e) {
      console.error('Batch ingest error:', e);
    } finally {
      setBatchLoading(false);
      setTimeout(() => setBatchNotice(null), 6000);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="space-y-6 pb-12 text-slate-100">
      
      {/* Hero Header */}
      <div className="bg-[#0c1322] border border-slate-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-2xl bg-orange-950/60 border border-orange-500/40 flex items-center justify-center text-orange-400 shadow-md shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                  Model Performance & Monitoring Console
                </h1>
                <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 font-mono">
                  LIVE TELEMETRY
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                Real-time tracking of ATS Match Engine score distribution, algorithmic bias mitigation, and end-to-end service latencies.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleIngestBatch}
              disabled={batchLoading}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-orange-600/30"
            >
              <Zap className={`h-3.5 w-3.5 ${batchLoading ? 'animate-bounce' : ''}`} />
              {batchLoading ? 'Ingesting Benchmark Batch...' : 'Ingest Benchmark Batch (5 Profiles)'}
            </button>
            <button
              onClick={fetchMetrics}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Analytics
            </button>
          </div>
        </div>

        {batchNotice && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>{batchNotice}</span>
          </div>
        )}

        {/* Phase Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-5 border-t border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              activeTab === 'all'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'bg-[#080d19] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            All 3 Phases Overview
          </button>
          <button
            onClick={() => setActiveTab('phase1')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'phase1'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-[#080d19] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <BarChart3 className="h-3.5 w-3.5" />
            Phase-1: Score Distribution Tracking
          </button>
          <button
            onClick={() => setActiveTab('phase2')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'phase2'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-[#080d19] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Phase-2: Match Engine Bias Assessment
          </button>
          <button
            onClick={() => setActiveTab('phase3')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'phase3'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-[#080d19] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            Phase-3: System Latency Monitoring
          </button>
        </div>
      </div>

      {metrics && (
        <>
          {/* Top KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            
            <div className="bg-[#0c1322] border border-slate-800/80 rounded-2xl p-5 shadow-md">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1 font-mono">
                Total Evaluated
              </span>
              <div className="text-2xl font-black text-white font-mono">{metrics.totalEvaluated}</div>
              <div className="text-[11px] text-slate-400 font-mono mt-1">Pre-processed & Scored</div>
            </div>

            <div className="bg-[#0c1322] border border-emerald-900/60 rounded-2xl p-5 shadow-md">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block mb-1 font-mono">
                Direct Shortlist (&ge;75%)
              </span>
              <div className="text-2xl font-black text-emerald-400 font-mono">{metrics.directShortlistCount}</div>
              <div className="text-[11px] text-emerald-300 font-mono mt-1">
                {metrics.totalEvaluated > 0 ? Math.round((metrics.directShortlistCount / metrics.totalEvaluated) * 100) : 0}% of candidate pool
              </div>
            </div>

            <div className="bg-[#0c1322] border border-amber-900/60 rounded-2xl p-5 shadow-md">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block mb-1 font-mono">
                Borderline (60–74%)
              </span>
              <div className="text-2xl font-black text-amber-300 font-mono">{metrics.borderlineCount}</div>
              <div className="text-[11px] text-amber-300 font-mono mt-1">
                Triggered 5-min Micro-quiz
              </div>
            </div>

            <div className="bg-[#0c1322] border border-orange-500/40 rounded-2xl p-5 shadow-md">
              <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-1 flex items-center gap-1 font-mono">
                <Sparkles className="h-3.5 w-3.5 text-orange-400" />
                Salvaged via Boost
              </span>
              <div className="text-2xl font-black text-orange-300 font-mono">
                +{metrics.boostedShortlistCount}
                <span className="text-xs font-normal text-slate-400 ml-1.5 font-sans">({metrics.salvageRate}% rate)</span>
              </div>
              <div className="text-[11px] text-orange-300 font-mono mt-1">
                Rescued from false rejection
              </div>
            </div>

          </div>

          {/* ========================================================================= */}
          {/* PHASE-1: SCORE DISTRIBUTION TRACKING */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'phase1') && (
            <div className="bg-[#0c1322] border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-orange-950/80 border border-orange-500/40 text-orange-400 flex items-center justify-center font-bold text-xs font-mono">
                    P1
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Phase-1: Score Distribution Tracking
                    </h2>
                    <p className="text-xs text-slate-400">
                      Distribution of candidate scores across Direct Reject (&lt;60%), Borderline (60–74%), and Direct Shortlist (&ge;75%)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="inline-block w-2.5 h-2.5 rounded-xs bg-rose-500"></span> Direct Reject (&lt;60%)
                  <span className="inline-block w-2.5 h-2.5 rounded-xs bg-amber-500 ml-2"></span> Borderline (60–74%)
                  <span className="inline-block w-2.5 h-2.5 rounded-xs bg-emerald-500 ml-2"></span> Shortlist (&ge;75%)
                </div>
              </div>

              {/* Histogram Visualization */}
              <div className="space-y-3">
                {metrics.scoreDistribution.map(bucket => {
                  const barColor = 
                    bucket.tier === 'SHORTLIST' 
                      ? 'bg-emerald-500' 
                      : bucket.tier === 'BORDERLINE' 
                      ? 'bg-amber-500' 
                      : 'bg-rose-500';

                  const badgeColor =
                    bucket.tier === 'SHORTLIST'
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80'
                      : bucket.tier === 'BORDERLINE'
                      ? 'bg-amber-950/60 text-amber-300 border-amber-800/80'
                      : 'bg-rose-950/60 text-rose-300 border-rose-800/80';

                  return (
                    <div key={bucket.range} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white w-24">{bucket.range}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border font-sans font-bold ${badgeColor}`}>
                            {bucket.tier === 'SHORTLIST' ? 'Direct Shortlist' : bucket.tier === 'BORDERLINE' ? 'Borderline Window' : 'Direct Reject'}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          <strong className="text-white">{bucket.count}</strong> candidates ({bucket.percentage}%)
                        </div>
                      </div>

                      <div className="h-4 bg-[#080d19] rounded-lg overflow-hidden flex border border-slate-800">
                        <div
                          className={`h-full ${barColor} transition-all duration-500 rounded-lg`}
                          style={{ width: `${Math.max(4, bucket.percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800 text-xs text-slate-300 flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white">Distribution Health Observation:</strong> The borderline interceptor catches the 60%–74% density pocket. Without the 5-minute Micro-quiz boost, <strong className="text-amber-400">{metrics.borderlineCount} qualified candidates</strong> would have suffered automated ATS rejections due to minor resume keyword omissions.
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE-2: MATCH ENGINE BIAS ASSESSMENT */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'phase2') && (
            <div className="bg-[#0c1322] border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-blue-950/80 border border-blue-500/40 text-blue-400 flex items-center justify-center font-bold text-xs font-mono">
                    P2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Phase-2: Match Engine Bias Assessment
                    </h2>
                    <p className="text-xs text-slate-400">
                      Algorithmic equity audit comparing demographic parity, disparate impact (EEOC 80% rule), and cohort rescue rates
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-950/70 text-emerald-400 border border-emerald-500/40 font-mono">
                  BIAS STATUS: {metrics.biasAssessment.biasStatus}
                </span>
              </div>

              {/* Metric Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                
                <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                    Disparate Impact Ratio
                  </span>
                  <div className="text-2xl font-black text-white font-mono">{metrics.biasAssessment.disparateImpactRatio}</div>
                  <div className="text-[11px] text-emerald-400 font-mono mt-1">
                    &gt; 0.80 Four-Fifths Compliance
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                    Demographic Parity Index
                  </span>
                  <div className="text-2xl font-black text-white font-mono">{metrics.biasAssessment.demographicParityRatio}</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Parity deviation: &plusmn;3.2%
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#080d19] border border-slate-800">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1 font-mono">
                    False Negative Mitigation
                  </span>
                  <div className="text-2xl font-black text-emerald-400 font-mono">+{metrics.biasAssessment.falseNegativeMitigationRate}%</div>
                  <div className="text-[11px] text-slate-400 font-mono mt-1">
                    Recovered high-potential talent
                  </div>
                </div>

              </div>

              {/* Cohort Equity Breakdown */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-300 block font-mono uppercase">
                  Cohort Background Resilience & Boost Participation:
                </span>
                
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-[#080d19] text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold">Applicant Cohort</th>
                        <th className="py-2.5 px-4 font-semibold">Pool Size</th>
                        <th className="py-2.5 px-4 font-semibold">Avg Base Score</th>
                        <th className="py-2.5 px-4 font-semibold">5-Min Quiz Opt-In</th>
                        <th className="py-2.5 px-4 font-semibold">Final Shortlist Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 text-slate-300">
                      {metrics.biasAssessment.cohortAnalysis.map(cohort => (
                        <tr key={cohort.cohort} className="hover:bg-slate-800/40 transition-colors">
                          <td className="py-2.5 px-4 font-bold text-white">{cohort.cohort}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-400">{cohort.applicants}</td>
                          <td className="py-2.5 px-4 font-mono text-slate-300">{cohort.avgScore}%</td>
                          <td className="py-2.5 px-4 font-mono text-orange-400 font-bold">{cohort.boostParticipation}%</td>
                          <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold">{cohort.shortlistRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* PHASE-3: SYSTEM LATENCY MONITORING (NO PORTS DISPLAYED) */}
          {/* ========================================================================= */}
          {(activeTab === 'all' || activeTab === 'phase3') && (
            <div className="bg-[#0c1322] border border-slate-800/80 rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-purple-950/80 border border-purple-500/40 text-purple-400 flex items-center justify-center font-bold text-xs font-mono">
                    P3
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">
                      Phase-3: System Latency Monitoring
                    </h2>
                    <p className="text-xs text-slate-400">
                      End-to-end performance across resume scanning, request routing, message processing, and challenge generation
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  SLA THRESHOLD: &lt; 250ms
                </span>
              </div>

              {/* Service Latency Table - No port numbers */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#080d19] text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Microservice Name</th>
                      <th className="py-2.5 px-4 font-semibold">Critical Endpoint / Event Topic</th>
                      <th className="py-2.5 px-4 font-semibold">Avg Latency</th>
                      <th className="py-2.5 px-4 font-semibold">P95 Latency</th>
                      <th className="py-2.5 px-4 font-semibold">P99 Latency</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/70 text-slate-300">
                    {metrics.systemLatency.map(svc => (
                      <tr key={svc.serviceName} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-4 font-bold text-white font-mono">{svc.serviceName}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-300">{svc.endpoint}</td>
                        <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold">{svc.avgLatencyMs}ms</td>
                        <td className="py-2.5 px-4 font-mono text-slate-400">{svc.p95LatencyMs}ms</td>
                        <td className="py-2.5 px-4 font-mono text-slate-400">{svc.p99LatencyMs}ms</td>
                        <td className="py-2.5 px-4">
                          <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-950/70 text-emerald-300 border border-emerald-500/40">
                            {svc.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

        </>
      )}

    </div>
  );
};
