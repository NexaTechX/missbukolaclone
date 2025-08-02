// AI Agent Types
export interface BukolaPersona {
  tone: 'executive' | 'authoritative' | 'decisive';
  style: 'professional' | 'strategic' | 'operational';
  decisionMaking: 'immediate' | 'analytical' | 'directive';
}

// Request Mode Types
export interface TaskRequest {
  to_email: string;
  subject: string;
  message: string;
  from: string;
  requested_by: string;
}

export interface WebhookResponse {
  success: boolean;
  taskId?: string;
  message: string;
  error?: string;
}

// RAG System Types
export interface DocumentChunk {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: 'policy' | 'procedure' | 'guideline' | 'memo' | 'report' | 'web_search';
    department?: string;
    date_created: string;
    relevance_score?: number;
  };
  embedding?: number[];
}

export interface RAGContext {
  query: string;
  relevantChunks: DocumentChunk[];
  maxTokens: number;
  threshold: number;
}

// Database Types (Supabase)
export interface ConversationLog {
  id: string;
  user_id: string;
  user_message: string;
  ai_response: string;
  request_mode_enabled: boolean;
  task_generated?: any; // Changed to any to handle both old and new formats
  webhook_sent: boolean;
  webhook_response?: WebhookResponse;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  employee_name: string;
  department: string;
  role: string;
  session_start: string;
  session_end?: string;
  total_interactions: number;
}

export interface DocumentStore {
  id: string;
  title: string;
  content: string;
  type: 'policy' | 'procedure' | 'guideline' | 'memo' | 'report';
  department?: string;
  author: string;
  date_created: string;
  last_updated: string;
  is_active: boolean;
  access_level: 'public' | 'management' | 'executive';
}

// AI Response Types
export interface AIResponse {
  message: string;
  confidence: number;
  sources: DocumentChunk[];
  executiveDecision?: {
    isDecision: boolean;
    actionRequired: boolean;
    urgency: 'low' | 'medium' | 'high' | 'immediate';
  };
  requestMode?: {
    enabled: boolean;
    taskGenerated?: TaskRequest;
    needsRecipientEmail?: {
      assignee: string;
      taskDescription: string;
      originalMessage: string;
    };
  };
}

// UI State Types
export interface AppState {
  requestMode: boolean;
  isLoading: boolean;
  currentUser: {
    id: string;
    name: string;
    department: string;
    role: string;
  } | null;
  conversation: Array<{
    id: string;
    type: 'user' | 'ai';
    message: string;
    timestamp: string;
    taskGenerated?: any; // Changed to any to handle both old and new formats
  }>;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Configuration Types
export interface AppConfig {
  supabase: {
    url: string;
    anonKey: string;
  };
  openai: {
    model: string;
    maxTokens: number;
    temperature: number;
  };
  webhook: {
    makeUrl: string;
    timeout: number;
  };
  rag: {
    chunkSize: number;
    overlap: number;
    maxRelevantChunks: number;
    similarityThreshold: number;
  };
}