const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Types for API responses
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

export interface AgentCapabilities {
  type: string;
  name: string;
  capabilities: Array<{
    name: string;
    description: string;
    examples: string[];
  }>;
}

export type MessageRole = 'USER' | 'ASSISTANT' | 'SYSTEM';

// API Client with typed methods
export const chatClient = {
  messages: {
    post: async (body: { message: string; conversationId?: string; userId: string }): Promise<Response> => {
      const res = await fetch(`${API_BASE}/chat/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return res;
    },
  },
  conversations: {
    get: async (params: { query: { userId: string } }): Promise<Response> => {
      const res = await fetch(`${API_BASE}/chat/conversations?userId=${params.query.userId}`);
      return res;
    },
    ':id': {
      get: async (params: { param: { id: string }; query: { userId: string } }): Promise<Response> => {
        const res = await fetch(`${API_BASE}/chat/conversations/${params.param.id}?userId=${params.query.userId}`);
        return res;
      },
      delete: async (params: { param: { id: string }; query: { userId: string } }): Promise<Response> => {
        const res = await fetch(`${API_BASE}/chat/conversations/${params.param.id}?userId=${params.query.userId}`, {
          method: 'DELETE',
        });
        return res;
      },
    },
  },
} as const;

export const agentClient = {
  index: {
    get: async (): Promise<Response> => {
      const res = await fetch(`${API_BASE}/agents`);
      return res;
    },
  },
  ':type': {
    capabilities: {
      get: async (params: { param: { type: string } }): Promise<Response> => {
        const res = await fetch(`${API_BASE}/agents/${params.param.type}/capabilities`);
        return res;
      },
    },
  },
} as const;
