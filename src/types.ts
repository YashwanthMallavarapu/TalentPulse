export type UserRole = 'CANDIDATE' | 'RECRUITER' | 'ARCHITECT' | 'DEVOPS' | 'ADMIN';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  title: string;
  permissions: string[];
  department?: string;
  phone?: string;
  bio?: string;
  location?: string;
}

export interface JwtTokenPayload {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iss: string;
  iat: number;
  exp: number;
  department?: string;
  title?: string;
  phone?: string;
  bio?: string;
  location?: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  payload: JwtTokenPayload | null;
  isAuthenticated: boolean;
}

export interface JobPosting {
  id: string;
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Contract' | 'Remote';
  experienceLevel: 'Junior' | 'Mid-Level' | 'Senior' | 'Lead';
  salary: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  minExperienceYears: number;
  shortlistThreshold: number; // e.g. 75
  borderlineThreshold: number; // e.g. 60
  maxBoostDelta: number; // e.g. 15
  createdAt: string;
}

export type ApplicationStatus =
  | 'APPLIED'
  | 'SHORTLISTED'
  | 'BORDERLINE'
  | 'REJECTED'
  | 'BOOST_IN_PROGRESS'
  | 'BOOSTED_SHORTLISTED';

export interface CandidateApplication {
  id: string;
  jobId: string;
  candidateName: string;
  candidateEmail: string;
  candidateTitle: string;
  resumeText: string;
  yearsExperience: number;
  detectedSkills: string[];
  matchedSkills: string[];
  missingSkills: string[];
  baseScore: number; // 0 - 100
  status: ApplicationStatus;
  challengeId?: string;
  boostDelta?: number; // e.g. +14%
  finalScore?: number; // baseScore + boostDelta
  appliedAt: string;
  boostCompletedAt?: string;
  scoreBreakdown: {
    skillMatchScore: number;
    experienceScore: number;
    preferredSkillBonus: number;
  };
}

export interface ChallengeQuestion {
  id: string;
  skill: string;
  question: string;
  type: 'mcq' | 'code_snippet';
  codeContext?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

export interface MicroChallenge {
  id: string;
  applicationId: string;
  jobId: string;
  candidateName: string;
  targetSkills: string[];
  questions: ChallengeQuestion[];
  timeLimitMinutes: number;
  status: 'PENDING' | 'STARTED' | 'COMPLETED' | 'EXPIRED';
  score?: number;
  scorePercentage?: number;
  scoreBoostDelta?: number;
  submittedAnswers?: Record<string, number>;
  startedAt?: string;
  completedAt?: string;
}

export interface KafkaEvent {
  id: string;
  topic: 'job-applications' | 'borderline-challenge-requested' | 'challenge-completed' | 'candidate-notifications';
  key: string;
  payload: any;
  timestamp: string;
  offset: number;
  partition: number;
  producer: string;
  consumerAcks: string[];
}

export interface EurekaInstance {
  app: string;
  instanceId: string;
  ipAddr: string;
  port: number;
  status: 'UP' | 'DOWN' | 'OUT_OF_SERVICE';
  lastHeartbeat: string;
  metadata: Record<string, string>;
}

export interface GatewayRoute {
  id: string;
  uri: string;
  predicates: string[];
  filters: string[];
  order: number;
  description: string;
  matchCount: number;
}

export interface NotificationItem {
  id: string;
  recipient: string;
  recipientName: string;
  type: 'EMAIL' | 'MAGIC_LINK' | 'SLACK_ALERT';
  subject: string;
  body: string;
  actionLink?: string;
  challengeId?: string;
  timestamp: string;
  read: boolean;
}

export interface DevTaskItem {
  id: string;
  category: 'Foundation & Infrastructure' | 'Core Application Logic & REST APIs' | 'Event-Driven Messaging (Kafka)' | 'Testing & CI/CD';
  title: string;
  description: string;
  completed: boolean;
  springAnnotation?: string;
  codeSnippet: string;
  testEndpoint?: {
    method: 'GET' | 'POST';
    path: string;
    payload?: any;
  };
}

export interface PreProcessingResult {
  candidateName: string;
  datasetSource: string; // e.g., 'CHBMIT Dataset / Profile #04' or 'Uploaded PDF'
  phase1Ocr: {
    textLength: number;
    ocrConfidence: number;
    rawSnippet: string;
    latencyMs: number;
  };
  phase2Cleansing: {
    normalizedTokens: number;
    noiseTokensRemoved: number;
    piiSanitized: boolean;
    latencyMs: number;
  };
  phase3FeatureExtraction: {
    extractedSkills: string[];
    experienceYears: number;
    educationLevel: string;
    latencyMs: number;
  };
  totalLatencyMs: number;
  completedAt: string;
}

export interface ScoreDistributionBucket {
  range: string;
  min: number;
  max: number;
  count: number;
  percentage: number;
  tier: 'REJECT' | 'BORDERLINE' | 'SHORTLIST';
}

export interface ModelPerformanceMetrics {
  totalEvaluated: number;
  directShortlistCount: number;
  borderlineCount: number;
  directRejectCount: number;
  boostedShortlistCount: number;
  salvageRate: number; // % of borderline that got boosted to shortlist
  scoreDistribution: ScoreDistributionBucket[];
  biasAssessment: {
    demographicParityRatio: number;
    disparateImpactRatio: number;
    experienceBiasMetric: string;
    biasStatus: 'OPTIMAL' | 'ACCEPTABLE' | 'NEEDS_CALIBRATION';
    falseNegativeMitigationRate: number; // e.g. 78.4%
    cohortAnalysis: {
      cohort: string;
      applicants: number;
      avgScore: number;
      shortlistRate: number;
      boostParticipation: number;
    }[];
  };
  systemLatency: {
    serviceName: string;
    port: number;
    endpoint: string;
    avgLatencyMs: number;
    p95LatencyMs: number;
    p99LatencyMs: number;
    status: 'HEALTHY' | 'SLIGHT_DELAY' | 'DEGRADED';
  }[];
}

export interface ServiceCallTelemetry {
  id: string;
  timestamp: string;
  serviceName: string;
  servicePort: number;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  statusCode: number;
  durationMs: number;
  kafkaEventEmitted?: string;
  summary: string;
}
