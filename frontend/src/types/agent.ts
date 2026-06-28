// Types for the Voice AI Builder application

// ==========================================
// Agent Types
// ==========================================

export type AgentStatus = "draft" | "published" | "archived";
export type FirstMessageMode = "auto" | "manual" | "disabled";
export type AIProvider = "google" | "mistral" | "openrouter" | "custom";

export interface Agent {
  id: string;
  name: string;
  status: AgentStatus;
  systemPrompt: string;
  firstMessage: string;
  firstMessageMode: FirstMessageMode;
  provider: AIProvider;
  model: string;
  createdAt: string;
  updatedAt: string;
  hasUnsavedChanges: boolean;
}

// ==========================================
// Voice Configuration
// ==========================================

export type VoiceProvider = "elevenlabs" | "browser";
export type BackgroundSound = "none";

export interface VoiceConfig {
  provider: VoiceProvider;
  model: string;
  voice: string;
  backgroundSound: BackgroundSound;
  inputMinimumCharacters: number;
  punctuationBoundary: boolean;
  stability: number;
}

// ==========================================
// Transcriber Configuration
// ==========================================

export type TranscriberProvider = "soniox" | "browser";

export interface TranscriberConfig {
  provider: TranscriberProvider;
  language: string;
  streaming: boolean;
  autoDetect: boolean;
  noiseReduction: boolean;
  punctuation: boolean;
}

// ==========================================
// Call Configuration
// ==========================================

export type TimeoutAction = "hangup" | "transfer" | "voicemail" | "retry";

export interface CallConfig {
  timeoutSeconds: number;
  maxRetries: number;
  timeoutAction: TimeoutAction;
}

// ==========================================
// Post Call Analysis
// ==========================================

export type AnalysisType = "sentiment" | "summary" | "intent" | "custom";

export interface PostCallAnalysis {
  enabled: boolean;
  analysisTypes: AnalysisType[];
  customPrompt: string;
}

// ==========================================
// Call Success Evaluation
// ==========================================

export interface SuccessCriterion {
  id: string;
  label: string;
  enabled: boolean;
}

export interface CallSuccessEvaluation {
  enabled: boolean;
  criteria: SuccessCriterion[];
  rubric: string;
}

// ==========================================
// Call Triggers
// ==========================================

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface CallTrigger {
  id: string;
  event: string;
  webhookUrl: string;
  method: HttpMethod;
}

// ==========================================
// User Info
// ==========================================

export interface UserInfo {
  name: string;
  company: string;
  email: string;
}

// ==========================================
// UI State
// ==========================================

export type NavItem = "dashboard" | "agents" | "knowledge" | "analytics" | "settings";

export interface UIState {
  sidebarCollapsed: boolean;
  activeNavItem: NavItem;
  rightPanelOpen: boolean;
  testChatOpen: boolean;
  testCallOpen: boolean;
  isLoading?: boolean;
}

// ==========================================
// Dashboard Stats
// ==========================================

export interface DashboardStats {
  totalAgents: number;
  activeCalls: number;
  successRate: number;
  avgDuration: string;
}

export interface RecentActivity {
  id: string;
  action: string;
  agent: string;
  timestamp: string;
  type: "created" | "published" | "edited" | "called";
}
