import React, { useState } from 'react';
import { PreProcessingResult, JobPosting } from '../types';
import { 
  FileSearch, 
  CheckCircle2, 
  Cpu, 
  ArrowRight, 
  Sparkles, 
  Zap, 
  Database, 
  FileText, 
  RefreshCw,
  Layers,
  ShieldCheck,
  Binary,
  Timer,
  UploadCloud,
  FileUp,
  FileCheck,
  Paperclip
} from 'lucide-react';

interface CandidatePreProcessingPipelineProps {
  selectedJob: JobPosting;
  onApplyWithPreProcessedData: (data: {
    candidateName: string;
    candidateEmail: string;
    candidateTitle: string;
    resumeText: string;
    yearsExperience: number;
    preProcessing: PreProcessingResult;
  }) => Promise<any>;
  onRecordTelemetry?: (serviceName: string, port: number, method: 'GET' | 'POST', endpoint: string, status: number, summary: string) => void;
}

const CHBMIT_PRESETS = [
  {
    id: 'chbmit-04',
    name: 'Devon Vance',
    email: 'devon.vance@talentpulse.io',
    title: 'Software Engineer',
    source: 'Sample Applicant #04',
    yearsExp: 4,
    description: 'Borderline Profile (68% Base Score) - Solid foundational experience, qualifies for 5-minute skill challenge boost!',
    rawText: `Devon Vance
Title: Software Engineer
Email: devon.vance@talentpulse.io
Experience: 4 years building enterprise applications and databases.
Technical Skills: Java, REST APIs, Databases, Docker, Git, Automated Testing.
Education: B.S. in Computer Science.
Summary: Experienced software developer looking to expand into distributed systems and high-scale architecture.`
  },
  {
    id: 'chbmit-01',
    name: 'Dr. Aris Vance',
    email: 'aris.vance@talentpulse.io',
    title: 'Senior Systems Architect',
    source: 'Sample Applicant #01',
    yearsExp: 7,
    description: 'Direct Shortlist Profile (86% Base Score) - Meets all target qualifications and advanced architectural criteria.',
    rawText: `Dr. Aris Vance
Title: Senior Systems Architect
Email: aris.vance@talentpulse.io
Experience: 7 years engineering high-throughput services and distributed pipelines.
Technical Skills: Java, Cloud Architecture, Databases, Microservices, Security, High Availability, CI/CD.
Education: Ph.D. in Distributed Computing.
Summary: Architected high-performance banking platforms with reliable caching and resilient processing services.`
  },
  {
    id: 'chbmit-12',
    name: 'Toby Clark',
    email: 'toby.clark@talentpulse.io',
    title: 'Junior Web Assistant',
    source: 'Sample Applicant #12',
    yearsExp: 1,
    description: 'Direct Rejection Profile (42% Base Score) - Early stage background, below minimum qualifications threshold.',
    rawText: `Toby Clark
Title: Junior Web Assistant
Email: toby.clark@talentpulse.io
Experience: 1 year writing basic frontend markup and small personal scripts.
Technical Skills: HTML5, CSS3, JavaScript, Markdown, Git basics.
Education: High School Diploma + Web Design Certificate.
Summary: Enthusiastic learner seeking entry-level technical assistant or junior frontend opportunities.`
  }
];

export const CandidatePreProcessingPipeline: React.FC<CandidatePreProcessingPipelineProps> = ({
  selectedJob,
  onApplyWithPreProcessedData,
  onRecordTelemetry
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>('chbmit-04');
  const [customText, setCustomText] = useState<string>(CHBMIT_PRESETS[0].rawText);
  const [candidateName, setCandidateName] = useState<string>(CHBMIT_PRESETS[0].name);
  const [candidateEmail, setCandidateEmail] = useState<string>(CHBMIT_PRESETS[0].email);
  const [candidateTitle, setCandidateTitle] = useState<string>(CHBMIT_PRESETS[0].title);
  const [yearsExperience, setYearsExperience] = useState<number>(CHBMIT_PRESETS[0].yearsExp);
  const [datasetSource, setDatasetSource] = useState<string>(CHBMIT_PRESETS[0].source);

  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isApplying, setIsApplying] = useState<boolean>(false);
  const [processedResult, setProcessedResult] = useState<PreProcessingResult | null>(null);
  const [activePhaseStep, setActivePhaseStep] = useState<number>(0);

  // Resume File Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string>('Devon_Vance_Resume.pdf');
  const [uploadedFileSize, setUploadedFileSize] = useState<string>('142 KB');
  const [isParsingFile, setIsParsingFile] = useState<boolean>(false);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  const handleProcessUploadedFile = async (file: File) => {
    if (!file) return;
    setIsParsingFile(true);
    setUploadedFileName(file.name);
    setUploadedFileSize(`${Math.round(file.size / 1024)} KB`);

    if (file.name.toLowerCase().endsWith('.txt') || file.type === 'text/plain') {
      try {
        const text = await file.text();
        setCustomText(text);
        setProcessedResult(null);
      } catch (err) {
        console.error('Failed to read text file:', err);
      } finally {
        setIsParsingFile(false);
      }
      return;
    }

    // PDF parse via API
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const res = await fetch('/api/resumes/parse', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileBase64: base64,
            fileName: file.name
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.extractedText) {
            setCustomText(data.extractedText);
            setProcessedResult(null);
            if (data.detectedEmail) setCandidateEmail(data.detectedEmail);
            if (data.detectedExperience) setYearsExperience(data.detectedExperience);
          }
        }
      } catch (err) {
        console.error('Error parsing PDF in pipeline:', err);
      } finally {
        setIsParsingFile(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (presetId: string) => {
    const preset = CHBMIT_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setCandidateName(preset.name);
    setCandidateEmail(preset.email);
    setCandidateTitle(preset.title);
    setYearsExperience(preset.yearsExp);
    setDatasetSource(preset.source);
    setCustomText(preset.rawText);
    setProcessedResult(null);
    setActivePhaseStep(0);
  };

  const handleRunPreProcessing = async () => {
    setIsProcessing(true);
    setActivePhaseStep(1);
    const startTime = Date.now();

    try {
      // Step-by-step animation simulation
      await new Promise(r => setTimeout(r, 300));
      setActivePhaseStep(2);
      await new Promise(r => setTimeout(r, 300));
      setActivePhaseStep(3);

      const res = await fetch('/api/preprocessing/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: customText,
          datasetSource,
          candidateName
        })
      });

      if (!res.ok) {
        throw new Error('Failed to run pre-processing service');
      }

      const data: PreProcessingResult = await res.json();
      setProcessedResult(data);

      if (onRecordTelemetry) {
        onRecordTelemetry(
          'PREPROCESSING-SERVICE',
          8086,
          'POST',
          '/api/preprocessing/ingest',
          200,
          `Ingested ${data.datasetSource} (${data.phase1Ocr.textLength} chars) -> Extracted ${data.phase3FeatureExtraction.extractedSkills.length} skills in ${data.totalLatencyMs}ms`
        );
      }
    } catch (err: any) {
      console.error('Pre-processing failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUploadToAts = async () => {
    if (!processedResult) return;
    setIsApplying(true);
    try {
      await onApplyWithPreProcessedData({
        candidateName,
        candidateEmail,
        candidateTitle,
        resumeText: customText,
        yearsExperience,
        preProcessing: processedResult
      });
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-150">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shadow-2xs">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-slate-900">
                Pre-Processing Pipeline (CHBMIT Dataset & Resume Ingestion)
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-mono">
                Port :8086
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Corresponds directly to Phase-1 (OCR), Phase-2 (Cleansing), and Phase-3 (Feature Extraction) before ATS scoring
            </p>
          </div>
        </div>

        <button
          onClick={handleRunPreProcessing}
          disabled={isProcessing}
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm shadow-orange-600/20 flex items-center gap-1.5 transition shrink-0"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              Running 3-Phase Pipeline...
            </>
          ) : (
            <>
              <Zap className="h-3.5 w-3.5" />
              Execute Pre-Processing Pipeline
            </>
          )}
        </button>
      </div>

      {/* Preset Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Database className="h-3.5 w-3.5 text-orange-600" />
            Select Candidate Profile from CHBMIT Dataset Benchmark:
          </span>
          <span className="text-[11px] text-slate-400 font-mono">3 standard test personas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {CHBMIT_PRESETS.map(preset => {
            const isSelected = selectedPresetId === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset.id)}
                className={`p-3.5 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-orange-50/70 border-orange-500 ring-1 ring-orange-500/20 shadow-2xs'
                    : 'bg-slate-50/60 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{preset.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                    preset.id === 'chbmit-01'
                      ? 'bg-emerald-100 text-emerald-800'
                      : preset.id === 'chbmit-04'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {preset.id === 'chbmit-01' ? '>75% Direct' : preset.id === 'chbmit-04' ? '60-74% Borderline' : '<60% Reject'}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 font-mono mb-1">{preset.title} • {preset.yearsExp} yrs exp</div>
                <div className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">{preset.description}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Resume File Upload & Preview */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-orange-600" />
            Candidate Resume Document <span className="text-orange-600 text-[11px] font-semibold">(PDF preferred)</span>
          </label>
          <span className="text-[11px] text-slate-500 font-mono">
            {uploadedFileName} ({uploadedFileSize})
          </span>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleProcessUploadedFile(e.dataTransfer.files[0]);
            }
          }}
          className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            isDragOver
              ? 'border-orange-500 bg-orange-50'
              : 'border-slate-200 bg-slate-50/70 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 border border-orange-200">
              <FileCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 font-mono">{uploadedFileName}</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Ready for Pre-Processing
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {isParsingFile ? 'Extracting document text...' : `Extracted ${customText.length} characters of profile data`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <label
              htmlFor="pipeline-file-input"
              className="px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:border-orange-400 text-slate-700 text-[11px] font-bold cursor-pointer flex items-center gap-1.5 transition shadow-2xs"
            >
              <FileUp className="h-3.5 w-3.5 text-orange-600" />
              Upload PDF
            </label>
            <input
              type="file"
              id="pipeline-file-input"
              accept=".pdf,.docx,.txt"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleProcessUploadedFile(e.target.files[0]);
                }
              }}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Visual 3-Phase Stepper */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Phase 1: Ingestion & OCR */}
        <div className={`p-4 rounded-2xl border transition-all ${
          processedResult
            ? 'bg-emerald-50/50 border-emerald-200'
            : activePhaseStep >= 1
            ? 'bg-orange-50/50 border-orange-300 animate-pulse'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FileSearch className="h-3.5 w-3.5 text-orange-600" />
              Phase-1: Document Scanning
            </span>
            {processedResult && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          </div>
          
          {processedResult ? (
            <div className="space-y-1 text-xs">
              <div className="text-slate-900 font-bold">Scanning Accuracy: {processedResult.phase1Ocr.ocrConfidence}%</div>
              <div className="text-slate-500 text-[11px]">Extracted: {processedResult.phase1Ocr.textLength} characters read</div>
              <div className="text-[10px] text-emerald-700 pt-1">Time: {processedResult.phase1Ocr.latencyMs}ms</div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Accurately reads and extracts textual information from the candidate profile.
            </p>
          )}
        </div>

        {/* Phase 2: Profile Data Cleansing */}
        <div className={`p-4 rounded-2xl border transition-all ${
          processedResult
            ? 'bg-emerald-50/50 border-emerald-200'
            : activePhaseStep >= 2
            ? 'bg-orange-50/50 border-orange-300 animate-pulse'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              Phase-2: Privacy & Formatting
            </span>
            {processedResult && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          </div>

          {processedResult ? (
            <div className="space-y-1 text-xs">
              <div className="text-slate-900 font-bold">Formatted: {processedResult.phase2Cleansing.normalizedTokens} words processed</div>
              <div className="text-slate-500 text-[11px]">Removed formatting noise and symbols</div>
              <div className="text-[10px] text-emerald-700 pt-1">Privacy Protected: Yes • Time: {processedResult.phase2Cleansing.latencyMs}ms</div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Cleans formatting symbols, organizes work sections, and secures personal details.
            </p>
          )}
        </div>

        {/* Phase 3: Feature Extraction */}
        <div className={`p-4 rounded-2xl border transition-all ${
          processedResult
            ? 'bg-emerald-50/50 border-emerald-200'
            : activePhaseStep >= 3
            ? 'bg-orange-50/50 border-orange-300 animate-pulse'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-purple-600" />
              Phase-3: Skills & Experience Matching
            </span>
            {processedResult && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
          </div>

          {processedResult ? (
            <div className="space-y-1.5 text-xs">
              <div className="text-slate-900 font-bold">
                {processedResult.phase3FeatureExtraction.extractedSkills.length} Skills Recognized:
              </div>
              <div className="flex flex-wrap gap-1 max-h-14 overflow-y-auto">
                {processedResult.phase3FeatureExtraction.extractedSkills.map(sk => (
                  <span key={sk} className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                    {sk}
                  </span>
                ))}
              </div>
              <div className="text-[10px] text-emerald-700 pt-1">
                Experience: {processedResult.phase3FeatureExtraction.experienceYears} yrs • Time: {processedResult.phase3FeatureExtraction.latencyMs}ms
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Identifies core qualifications, competencies, and verified years of experience.
            </p>
          )}
        </div>

      </div>

      {/* Next Step Action */}
      {processedResult && (
        <div className="p-4 rounded-2xl bg-orange-50/80 border border-orange-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div>
            <div className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Pre-Processing Complete! Total Analysis Time: {processedResult.totalLatencyMs}ms
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Your resume data has been structured and is ready for candidate evaluation.
            </p>
          </div>

          <button
            onClick={handleUploadToAts}
            disabled={isApplying}
            className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-sm shadow-orange-600/20 flex items-center gap-2 transition shrink-0"
          >
            {isApplying ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                Evaluating Candidate Profile...
              </>
            ) : (
              <>
                Submit Application & Begin Evaluation
                <ArrowRight className="h-3.5 w-3.5" />
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
};
