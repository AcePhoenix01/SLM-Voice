import { create } from "zustand";
import type {
  Agent,
  VoiceConfig,
  TranscriberConfig,
  CallConfig,
  PostCallAnalysis,
  CallSuccessEvaluation,
  CallTrigger,
  UserInfo,
  UIState,
  NavItem,
} from "@/types/agent";

// ==========================================
// Store Interface
// ==========================================

interface AgentStore {
  // Agent State
  agent: Agent;
  initAgent: () => Promise<void>;
  updateAgent: (updates: Partial<Agent>) => void;
  markUnsaved: () => void;
  saveAgent: () => Promise<void>;
  publishAgent: () => void;

  // Voice Config
  voiceConfig: VoiceConfig;
  updateVoiceConfig: (updates: Partial<VoiceConfig>) => void;

  // Transcriber Config
  transcriberConfig: TranscriberConfig;
  updateTranscriberConfig: (updates: Partial<TranscriberConfig>) => void;

  // Call Config
  callConfig: CallConfig;
  updateCallConfig: (updates: Partial<CallConfig>) => void;

  // Post Call Analysis
  postCallAnalysis: PostCallAnalysis;
  updatePostCallAnalysis: (updates: Partial<PostCallAnalysis>) => void;

  // Call Success Evaluation
  callSuccessEval: CallSuccessEvaluation;
  updateCallSuccessEval: (updates: Partial<CallSuccessEvaluation>) => void;

  // Call Triggers
  callTriggers: CallTrigger[];
  addCallTrigger: (trigger: Omit<CallTrigger, "id">) => void;
  updateCallTrigger: (id: string, updates: Partial<CallTrigger>) => void;
  removeCallTrigger: (id: string) => void;

  // User Info
  userInfo: UserInfo;
  updateUserInfo: (updates: Partial<UserInfo>) => void;

  // UI State
  ui: UIState;
  toggleSidebar: () => void;
  setActiveNav: (item: NavItem) => void;
  toggleRightPanel: () => void;
  toggleTestChat: () => void;
  toggleTestCall: () => void;
}

// ==========================================
// Default Values
// ==========================================

const defaultAgent: Agent = {
  id: "agent-001",
  name: "My Voice Agent",
  status: "draft",
  systemPrompt: `You are a professional AI voice assistant. Your role is to help callers with their inquiries in a friendly, efficient, and knowledgeable manner.

## Guidelines
- Be conversational and natural
- Keep responses concise for voice delivery
- Ask clarifying questions when needed
- Handle one topic at a time
- Confirm important details before taking action`,
  firstMessage:
    "Hello! Thank you for calling. How can I help you today?",
  firstMessageMode: "auto",
  provider: "google",
  model: "gemini-2.5-flash",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  hasUnsavedChanges: false,
};

const defaultVoiceConfig: VoiceConfig = {
  provider: "elevenlabs",
  model: "eleven_turbo_v2",
  voice: "Rachel",
  backgroundSound: "none",
  inputMinimumCharacters: 2,
  punctuationBoundary: true,
  stability: 0.5,
};

const defaultTranscriberConfig: TranscriberConfig = {
  provider: "soniox",
  language: "en-US",
  streaming: true,
  autoDetect: false,
  noiseReduction: true,
  punctuation: true,
};

const defaultCallConfig: CallConfig = {
  timeoutSeconds: 30,
  maxRetries: 3,
  timeoutAction: "hangup",
};

const defaultPostCallAnalysis: PostCallAnalysis = {
  enabled: true,
  analysisTypes: ["sentiment", "summary"],
  customPrompt: "",
};

const defaultCallSuccessEval: CallSuccessEvaluation = {
  enabled: false,
  criteria: [
    { id: "1", label: "Issue resolved", enabled: true },
    { id: "2", label: "Caller satisfied", enabled: true },
    { id: "3", label: "No escalation needed", enabled: false },
  ],
  rubric: "",
};

const defaultUserInfo: UserInfo = {
  name: "Anirudh Sharma",
  company: "Antigravity",
  email: "anirudh@antigravity.ai",
};

const defaultUI: UIState = {
  sidebarCollapsed: false,
  activeNavItem: "dashboard",
  rightPanelOpen: true,
  testChatOpen: false,
  testCallOpen: false,
};

// ==========================================
// Zustand Store
// ==========================================

export const useAgentStore = create<AgentStore>((set) => ({
  // Agent
  agent: defaultAgent,
  initAgent: async () => {
    try {
      set((state) => ({ ui: { ...state.ui, isLoading: true } }));
      const response = await fetch("/api/agents");
      if (response.ok) {
        const agentsData = await response.json();
        // Since we are single-tenant, we just grab the first agent if it exists
        if (agentsData && agentsData.length > 0) {
          const data = agentsData[0];
          set({
            agent: data.agent || defaultAgent,
            voiceConfig: data.voiceConfig || defaultVoiceConfig,
            transcriberConfig: data.transcriberConfig || defaultTranscriberConfig,
            callConfig: data.callConfig || defaultCallConfig,
            postCallAnalysis: data.postCallAnalysis || defaultPostCallAnalysis,
            callSuccessEval: data.callSuccessEval || defaultCallSuccessEval,
            callTriggers: data.callTriggers || [],
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch agent:", error);
    } finally {
      set((state) => ({ ui: { ...state.ui, isLoading: false } }));
    }
  },
  updateAgent: (updates) =>
    set((state) => ({
      agent: { ...state.agent, ...updates, hasUnsavedChanges: true },
    })),
  markUnsaved: () =>
    set((state) => ({
      agent: { ...state.agent, hasUnsavedChanges: true },
    })),
  saveAgent: async () => {
    const currentState = useAgentStore.getState();
    const payload = {
      id: currentState.agent.id,
      agent: { ...currentState.agent, hasUnsavedChanges: false, updatedAt: new Date().toISOString() },
      voiceConfig: currentState.voiceConfig,
      transcriberConfig: currentState.transcriberConfig,
      callConfig: currentState.callConfig,
      postCallAnalysis: currentState.postCallAnalysis,
      callSuccessEval: currentState.callSuccessEval,
      callTriggers: currentState.callTriggers,
    };

    try {
      const response = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      
      if (response.ok) {
        set({ agent: payload.agent });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  },
  publishAgent: () =>
    set((state) => ({
      agent: {
        ...state.agent,
        status: "published",
        hasUnsavedChanges: false,
        updatedAt: new Date().toISOString(),
      },
    })),

  // Voice Config
  voiceConfig: defaultVoiceConfig,
  updateVoiceConfig: (updates) =>
    set((state) => {
      return {
        voiceConfig: { ...state.voiceConfig, ...updates },
        agent: { ...state.agent, hasUnsavedChanges: true },
      };
    }),

  // Transcriber Config
  transcriberConfig: defaultTranscriberConfig,
  updateTranscriberConfig: (updates) =>
    set((state) => ({
      transcriberConfig: { ...state.transcriberConfig, ...updates },
      agent: { ...state.agent, hasUnsavedChanges: true },
    })),

  // Call Config
  callConfig: defaultCallConfig,
  updateCallConfig: (updates) =>
    set((state) => ({
      callConfig: { ...state.callConfig, ...updates },
      agent: { ...state.agent, hasUnsavedChanges: true },
    })),

  // Post Call Analysis
  postCallAnalysis: defaultPostCallAnalysis,
  updatePostCallAnalysis: (updates) =>
    set((state) => ({
      postCallAnalysis: { ...state.postCallAnalysis, ...updates },
      agent: { ...state.agent, hasUnsavedChanges: true },
    })),

  // Call Success Evaluation
  callSuccessEval: defaultCallSuccessEval,
  updateCallSuccessEval: (updates) =>
    set((state) => ({
      callSuccessEval: { ...state.callSuccessEval, ...updates },
      agent: { ...state.agent, hasUnsavedChanges: true },
    })),

  // Call Triggers
  callTriggers: [],
  addCallTrigger: (trigger) =>
    set((state) => ({
      callTriggers: [
        ...state.callTriggers,
        { ...trigger, id: crypto.randomUUID() },
      ],
      agent: { ...state.agent, hasUnsavedChanges: true },
    })),
  updateCallTrigger: (id, updates) =>
    set((state) => ({
      callTriggers: state.callTriggers.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
      agent: { ...state.agent, hasUnsavedChanges: true },
    })),
  removeCallTrigger: (id) =>
    set((state) => ({
      callTriggers: state.callTriggers.filter((t) => t.id !== id),
      agent: { ...state.agent, hasUnsavedChanges: true },
    })),

  // User Info
  userInfo: defaultUserInfo,
  updateUserInfo: (updates) =>
    set((state) => ({
      userInfo: { ...state.userInfo, ...updates },
    })),

  // UI State
  ui: defaultUI,
  toggleSidebar: () =>
    set((state) => ({
      ui: { ...state.ui, sidebarCollapsed: !state.ui.sidebarCollapsed },
    })),
  setActiveNav: (item) =>
    set((state) => ({
      ui: { ...state.ui, activeNavItem: item },
    })),
  toggleRightPanel: () =>
    set((state) => ({
      ui: { ...state.ui, rightPanelOpen: !state.ui.rightPanelOpen },
    })),
  toggleTestChat: () =>
    set((state) => ({
      ui: { ...state.ui, testChatOpen: !state.ui.testChatOpen },
    })),
  toggleTestCall: () =>
    set((state) => ({
      ui: { ...state.ui, testCallOpen: !state.ui.testCallOpen },
    })),
}));
