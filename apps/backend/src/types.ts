import { z } from 'zod';

// ============== Input Schemas ==============
export const sendMessageSchema = z.object({
  conversationId: z.string().optional(),
  message: z.string().min(1, 'Message is required'),
  userId: z.string().min(1, 'User ID is required'),
});

export const conversationIdSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

export const userIdQuerySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
});

// ============== API Types ==============
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type ConversationIdParam = z.infer<typeof conversationIdSchema>;
export type UserIdQuery = z.infer<typeof userIdQuerySchema>;

// ============== Agent Types ==============
export type AgentType = 'ROUTER' | 'SUPPORT' | 'ORDER' | 'BILLING';

// Helper to convert lowercase to uppercase (for Prisma compatibility)
export function toPrismaAgentType(type: string): AgentType {
  const mapping: Record<string, AgentType> = {
    router: 'ROUTER',
    support: 'SUPPORT',
    order: 'ORDER',
    billing: 'BILLING',
  };
  return mapping[type] || 'SUPPORT';
}

export interface AgentCapability {
  name: string;
  description: string;
  examples: string[];
}

export interface AgentInfo {
  type: AgentType;
  name: string;
  description: string;
  capabilities: AgentCapability[];
}

// ============== Tool Types ==============
export interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
