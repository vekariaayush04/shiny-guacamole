import { prisma } from '../db/prisma';
import { sanitizeMessage } from '../utils/sanitizer';
import { analyzeAndRoute, type RouterResult } from '../agents/router';
import { executeSubAgent, type SubAgentResult } from '../agents/sub-agents';
import { SendMessageInput, toPrismaAgentType } from '../types';

interface ChatResult {
  conversationId: string;
  response: string;
  routedTo: string;
  routingReason: string;
  routingConfidence: number;
  timestamp: Date;
}

class ChatService {
  async processMessage(input: SendMessageInput): Promise<ChatResult> {
    const { message, conversationId: providedConversationId, userId } = input;

    console.log('[ChatService] Input:', { message, providedConversationId, userId });

    const sanitized = sanitizeMessage(message);
    console.log('[ChatService] Sanitized:', sanitized);
    if (!sanitized.isValid) {
      throw new Error('Invalid message content');
    }

    let conversation;
    console.log('[ChatService] Looking for conversation:', providedConversationId);

    if (providedConversationId) {
      conversation = await prisma.conversation.findUnique({
        where: { id: providedConversationId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
      console.log('[ChatService] Found conversation:', conversation?.id);

      if (!conversation || conversation.userId !== userId) {
        console.log('[ChatService] Conversation not found or access denied');
        throw new Error('Conversation not found or access denied');
      }
    } else {
      console.log('[ChatService] Creating new conversation for user:', userId);
      conversation = await prisma.conversation.create({
        data: {
          userId,
          title: sanitized.content.slice(0, 100),
        },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 10,
          },
        },
      });
      console.log('[ChatService] Created conversation:', conversation.id);
    }

    console.log('[ChatService] Storing user message for conversation:', conversation.id);
    const userMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'USER',
        content: sanitized.content,
      },
    });
    console.log('[ChatService] User message created:', userMessage.id);

    const conversationContext = conversation.messages
      .filter((m) => m.role !== 'SYSTEM')
      .reverse()
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');
    console.log('[ChatService] Context length:', conversationContext.length);

    console.log('[ChatService] Routing message...');
    const routingResult: RouterResult = await analyzeAndRoute(
      sanitized.content,
      conversationContext
    );

    console.log(`[Router] Routed to: ${routingResult.agentType} (confidence: ${routingResult.confidence})`);
    console.log(`[Router] Reason: ${routingResult.reasoning}`);

    console.log('[ChatService] Executing sub-agent:', routingResult.agentType);
    const subAgentResult: SubAgentResult = await executeSubAgent(
      routingResult.agentType,
      sanitized.content,
      userId,
      conversationContext
    );
    console.log('[ChatService] Sub-agent response length:', subAgentResult.response.length);
    console.log('[ChatService] Tool calls:', subAgentResult.toolCalls?.length || 0);

    console.log('[ChatService] Storing assistant message...');
    const agentTypePrisma = toPrismaAgentType(subAgentResult.agentType);
    console.log('[ChatService] Converting agent type:', subAgentResult.agentType, '->', agentTypePrisma);

    const assistantMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'ASSISTANT',
        content: subAgentResult.response,
        agentType: agentTypePrisma,
        toolCalls: subAgentResult.toolCalls as any,
        toolResults: subAgentResult.toolResults as any,
      },
    });
    console.log('[ChatService] Assistant message created:', assistantMessage.id);

    console.log('[ChatService] Updating conversation metadata...');
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastAgentType: agentTypePrisma,
        agentsUsed: {
          push: agentTypePrisma,
        },
        updatedAt: new Date(),
      },
    });
    console.log('[ChatService] Conversation updated');

    return {
      conversationId: conversation.id,
      response: subAgentResult.response,
      routedTo: routingResult.agentType,
      routingReason: routingResult.reasoning,
      routingConfidence: routingResult.confidence,
      timestamp: new Date(),
    };
  }

  async getConversation(conversationId: string, userId: string) {
    console.log('[ChatService] getConversation:', conversationId, userId);
    return prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
  }

  async listConversations(userId: string, limit = 20) {
    console.log('[ChatService] listConversations:', userId);
    return prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        title: true,
        lastAgentType: true,
        updatedAt: true,
        createdAt: true,
        _count: {
          select: { messages: true },
        },
      },
    });
  }

  async deleteConversation(conversationId: string, userId: string) {
    console.log('[ChatService] deleteConversation:', conversationId, userId);
    const conversation = await prisma.conversation.findFirst({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new Error('Conversation not found');
    }

    await prisma.conversation.delete({
      where: { id: conversationId },
    });

    return { success: true };
  }
}

export const chatService = new ChatService();
