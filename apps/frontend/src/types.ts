export interface Conversation {
  id: string;
  userId: string;
  title: string;
  lastAgentType: string | null;
  updatedAt: string;
  createdAt: string;
  _count?: {
    messages: number;
  };
  messages?: Message[];
}

export interface Message {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  agentType: string | null;
  toolCalls: unknown;
  toolResults: unknown;
  createdAt: string;
}

export interface ChatResponse {
  success: boolean;
  data?: {
    conversationId: string;
    response: string;
    routedTo: string;
    routingReason: string;
    routingConfidence: number;
    timestamp: string;
  };
  error?: string;
}

export interface Agent {
  type: string;
  name: string;
  description: string;
}

export interface AgentCapability {
  name: string;
  description: string;
  examples: string[];
}

export interface AgentCapabilities {
  type: string;
  name: string;
  capabilities: AgentCapability[];
}

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

export const AGENT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  SUPPORT: { bg: '#f5f5f7', text: '#1d1d1f', border: '#e5e5e5' },
  ORDER: { bg: '#f5f5f7', text: '#1d1d1f', border: '#e5e5e5' },
  BILLING: { bg: '#f5f5f7', text: '#1d1d1f', border: '#e5e5e5' },
  ROUTER: { bg: '#f5f5f7', text: '#1d1d1f', border: '#e5e5e5' },
};

export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    });
  }
}
