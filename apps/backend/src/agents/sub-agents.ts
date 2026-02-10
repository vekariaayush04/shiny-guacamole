import { generateText } from 'ai';
import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { prisma } from '../db/prisma';
import { getSubAgentPrompt, getAgentName, type SubAgentType } from './sub-agent-prompts';
import { supportTools } from './tools/support.tools';
import { orderTools } from './tools/order.tools';
import { billingTools } from './tools/billing.tools';
import type { AgentType } from '../types';

const userLookupSchema = z.object({
  userId: z.string().optional(),
  email: z.string().optional(),
});

const getConversationHistorySchema = userLookupSchema.extend({
  limit: z.number().optional().default(10),
});

const getUserProfileSchema = userLookupSchema;

const getRecentActivitySchema = userLookupSchema;

const getProductInfoSchema = z.object({
  productName: z.string().optional(),
  sku: z.string().optional(),
});

const getOrderDetailsSchema = userLookupSchema.extend({
  orderId: z.string().optional(),
  orderNumber: z.string().optional(),
});

const getDeliveryStatusSchema = userLookupSchema.extend({
  orderId: z.string(),
});

const getUserOrdersSchema = userLookupSchema.extend({
  limit: z.number().optional().default(10),
});

const cancelOrderSchema = userLookupSchema.extend({
  orderId: z.string(),
  reason: z.string().optional(),
});

const getInvoiceDetailsSchema = userLookupSchema.extend({
  invoiceId: z.string().optional(),
  invoiceNumber: z.string().optional(),
});

const getUserInvoicesSchema = userLookupSchema.extend({
  status: z.string().optional(),
  limit: z.number().optional().default(10),
});

const getRefundStatusSchema = userLookupSchema.extend({
  refundId: z.string().optional(),
  refundNumber: z.string().optional(),
  orderId: z.string().optional(),
});

const getUserRefundsSchema = userLookupSchema.extend({
  status: z.string().optional(),
});

const getBillingSummarySchema = userLookupSchema;

async function resolveUserId(params: { userId?: string; email?: string }): Promise<string | null> {
  const { userId, email } = params;
  if (userId) return userId;
  if (email) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    return user?.id || null;
  }
  return null;
}

async function executeTool(
  agentType: SubAgentType,
  toolName: string,
  args: Record<string, any>
): Promise<{ success: boolean; result: any }> {
  console.log(`[SubAgent] executeTool: ${agentType}/${toolName}`, args);
  try {
    let userId: string | undefined = args.userId;
    if (!userId && args.email) {
      const resolved = await resolveUserId(args);
      userId = resolved || undefined;
    }

    let result;

    switch (agentType) {
      case 'support':
        switch (toolName) {
          case 'getConversationHistory':
            result = await supportTools.getConversationHistory({
              ...getConversationHistorySchema.parse(args),
              userId,
            });
            break;
          case 'getUserProfile':
            result = await supportTools.getUserProfile({ userId });
            break;
          case 'getRecentActivity':
            result = await supportTools.getRecentActivity({ userId });
            break;
          case 'getProductInfo':
            result = await supportTools.getProductInfo(getProductInfoSchema.parse(args));
            break;
          case 'getCompanyInfo':
            result = supportTools.getCompanyInfo();
            break;
          default:
            return { success: false, result: { error: 'Unknown tool' } };
        }
        break;

      case 'order':
        switch (toolName) {
          case 'getOrderDetails':
            result = await orderTools.getOrderDetails({
              ...getOrderDetailsSchema.parse(args),
              userId,
            });
            break;
          case 'getDeliveryStatus':
            result = await orderTools.getDeliveryStatus({
              ...getDeliveryStatusSchema.parse(args),
              userId,
            });
            break;
          case 'getUserOrders':
            result = await orderTools.getUserOrders({
              ...getUserOrdersSchema.parse(args),
              userId,
            });
            break;
          case 'cancelOrder':
            result = await orderTools.cancelOrder({
              ...cancelOrderSchema.parse(args),
              userId,
            });
            break;
          default:
            return { success: false, result: { error: 'Unknown tool' } };
        }
        break;

      case 'billing':
        switch (toolName) {
          case 'getInvoiceDetails':
            result = await billingTools.getInvoiceDetails({
              ...getInvoiceDetailsSchema.parse(args),
              userId,
            });
            break;
          case 'getUserInvoices':
            result = await billingTools.getUserInvoices({
              ...getUserInvoicesSchema.parse(args),
              userId,
            });
            break;
          case 'getRefundStatus':
            result = await billingTools.getRefundStatus({
              ...getRefundStatusSchema.parse(args),
              userId,
            });
            break;
          case 'getUserRefunds':
            result = await billingTools.getUserRefunds({
              ...getUserRefundsSchema.parse(args),
              userId,
            });
            break;
          case 'getBillingSummary':
            result = await billingTools.getBillingSummary({
              ...getBillingSummarySchema.parse(args),
              userId,
            });
            break;
          default:
            return { success: false, result: { error: 'Unknown tool' } };
        }
        break;

      default:
        return { success: false, result: { error: 'Unknown agent type' } };
    }

    return { success: true, result };
  } catch (error) {
    console.error(`Tool ${toolName} error:`, error);
    return { success: false, result: { error: 'Tool execution failed' } };
  }
}

interface ToolCallRaw {
  name: string;
  arguments: Record<string, any>;
}

function parseToolCallsFromText(text: string): ToolCallRaw[] {
  try {
    const toolCallMatch = text.match(/\[\s*\{[\s\S]*?\}\s*\]/);
    if (toolCallMatch) {
      const parsed = JSON.parse(toolCallMatch[0]);
      if (Array.isArray(parsed)) {
        return parsed.filter(
          (tc) => tc.name && tc.arguments
        ) as ToolCallRaw[];
      }
    }
    return [];
  } catch {
    return [];
  }
}

export interface SubAgentResult {
  response: string;
  agentType: AgentType;
  toolCalls?: ToolCallRaw[];
  toolResults?: Array<{ name: string; result: any }>;
}

export async function executeSubAgent(
  agentType: SubAgentType,
  userMessage: string,
  userId: string,
  conversationContext?: string
): Promise<SubAgentResult> {
  console.log(`[SubAgent] executeSubAgent: ${agentType}`, { userMessage, userId });
  const agentName = getAgentName(agentType);
  const systemPrompt = getSubAgentPrompt(agentType);

  const contextInfo = conversationContext
    ? `\n\nPrevious conversation context:\n${conversationContext}`
    : '';

  const prompt = `The user is asking: "${userMessage}"${contextInfo}

Provide a helpful response. If you need to get information, call tools.

User ID: ${userId}

If calling tools, return a JSON array like:
[{"name": "toolName", "arguments": {"param": "value"}}]

Then provide your response after the tool calls.`;

  try {
    console.log('[SubAgent] Calling OpenAI for tool decision...');
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      system: systemPrompt,
    });
    console.log('[SubAgent] OpenAI response length:', text.length);

    const toolCalls = parseToolCallsFromText(text);
    const toolResults: Array<{ name: string; result: any }> = [];

    if (toolCalls.length > 0) {
      for (const toolCall of toolCalls) {
        const execResult = await executeTool(
          agentType,
          toolCall.name,
          toolCall.arguments
        );
        toolResults.push({
          name: toolCall.name,
          result: execResult.result,
        });
      }
    }

    console.log('[SubAgent] Calling OpenAI for final response...');
    const { text: finalText } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `Based on the user's question and any tool results, provide a helpful response.

User Question: "${userMessage}"
Agent: ${agentName}
Tool Results: ${JSON.stringify(toolResults, null, 2)}

Provide a concise, helpful response incorporating the tool results.`,
      system: `${systemPrompt}

You have access to tool results. Incorporate them into your response naturally.`,
    });

    console.log('[SubAgent] Final response length:', finalText.length);

    return {
      response: finalText,
      agentType: agentType as AgentType,
      toolCalls,
      toolResults,
    };
  } catch (error) {
    console.error(`${agentType} agent error:`, error);
    return {
      response: `I apologize, but I encountered an issue while processing your request. Please try again or contact support if the problem persists.`,
      agentType: agentType as AgentType,
    };
  }
}
