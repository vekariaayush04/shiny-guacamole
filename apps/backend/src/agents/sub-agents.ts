import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { prisma } from '../db/prisma';
import { getSubAgentPrompt, type SubAgentType } from './sub-agent-prompts';
import { supportTools } from './tools/support.tools';
import { orderTools } from './tools/order.tools';
import { billingTools } from './tools/billing.tools';
import type { AgentType } from '../types';

export interface SubAgentResult {
  response: string;
  agentType: AgentType;
  toolCalls?: Array<{ name: string; arguments: Record<string, unknown> }>;
  toolResults?: Array<{ name: string; result: unknown }>;
}

export async function executeSubAgent(
  agentType: SubAgentType,
  userMessage: string,
  userId: string,
  conversationContext?: string
): Promise<SubAgentResult> {
  console.log(`[SubAgent] executeSubAgent: ${agentType}`, { userMessage, userId });
  const systemPrompt = getSubAgentPrompt(agentType);

  const contextInfo = conversationContext
    ? `\n\nPrevious conversation context:\n${conversationContext}`
    : '';

  try {
    console.log('[SubAgent] Fetching data directly...');

    // Fetch relevant data based on agent type
    let contextData = '';
    let agentTypeUpper = agentType.toUpperCase() as AgentType;

    switch (agentType) {
      case 'support':
        const profile = await supportTools.getUserProfile({ userId });
        const activity = await supportTools.getRecentActivity({ userId });
        contextData = `
User Profile: ${JSON.stringify(profile)}
Recent Activity: ${JSON.stringify(activity)}
`;
        break;
      case 'order':
        const orders = await orderTools.getUserOrders({ userId, limit: 10 });
        contextData = `
User Orders: ${JSON.stringify(orders)}
`;
        break;
      case 'billing':
        const billing = await billingTools.getBillingSummary({ userId });
        const invoices = await billingTools.getUserInvoices({ userId, limit: 5 });
        const refunds = await billingTools.getUserRefunds({ userId });
        contextData = `
Billing Summary: ${JSON.stringify(billing)}
Invoices: ${JSON.stringify(invoices)}
Refunds: ${JSON.stringify(refunds)}
`;
        break;
    }

    console.log('[SubAgent] Data fetched, generating response...');

    const prompt = `The user is asking: "${userMessage}"

${contextData}

${contextInfo}

Please provide a helpful response based on the data above. If you cannot find the information the user is asking about, acknowledge this and ask for clarification.`;

    const result = await generateText({
      model: 'openai/gpt-4o-mini',
      prompt,
      system: systemPrompt,
    });

    console.log('[SubAgent] Response generated');

    return {
      response: result.text,
      agentType: agentTypeUpper,
    };
  } catch (error) {
    console.error(`${agentType} agent error:`, error);
    return {
      response: `I apologize, but I encountered an issue while processing your request. Please try again or contact support if the problem persists.`,
      agentType: agentType.toUpperCase() as AgentType,
    };
  }
}
