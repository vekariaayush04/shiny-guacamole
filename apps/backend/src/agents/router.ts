import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import type { AgentType } from '../types';
import { SubAgentType } from './sub-agent-prompts';

export const ROUTER_SYSTEM_PROMPT = `You are a smart Customer Support Router Agent. Your job is to analyze incoming customer queries and delegate them to the most appropriate specialized sub-agent.

## Your Available Sub-Agents:

### 1. SUPPORT AGENT
Handles: General support inquiries, FAQs, troubleshooting, and general customer service questions.
Examples:
- "What is your return policy?"
- "I can't log into my account"
- "Your website isn't loading"
- "General product questions"
- "Business hours, contact info"

### 2. ORDER AGENT
Handles: Order status, tracking, modifications, cancellations, shipping, and delivery inquiries.
Examples:
- "Where is my order?" / "Track my order"
- "What is my order status?"
- "I want to cancel my order"
- "Change my shipping address"
- "When will my package arrive?"
- "What's my tracking number?"

### 3. BILLING AGENT
Handles: Payment issues, refunds, invoices, subscriptions, charges, and all billing matters.
Examples:
- "Where is my refund?"
- "I was charged twice"
- "Payment failed"
- "Invoice please"
- "Subscription cancellation"
- "Refund status"

## Classification Rules:

### Route to ORDER AGENT when:
- User mentions order, order ID, order number
- User asks about tracking, shipment, delivery
- User wants to cancel/modify an order
- Keywords: order, orders, tracking, shipped, delivery, cancel order, modify order

### Route to BILLING AGENT when:
- User mentions payment, charge, refund, invoice
- User says they were charged incorrectly
- User asks about subscription
- Keywords: payment, charge, refund, invoice, billing, subscription, money

### Route to SUPPORT AGENT when:
- General questions about policies, hours, contact
- Technical issues with website/app
- Product questions not related to specific order
- FAQ-style questions
- Anything not clearly ORDER or BILLING related

### Fallback:
- Unclear or ambiguous queries
- Greetings or small talk
- Default to SUPPORT AGENT when unsure

## Output Format:

Return a JSON object with:
- intent: "support" | "order" | "billing"
- confidence: 0.0 to 1.0 (how confident you are in this classification)
- reasoning: Brief explanation of why you chose this agent
- delegateTo: "support" | "order" | "billing" (the agent to route to)`;

interface RouterResponse {
  intent: 'support' | 'order' | 'billing';
  confidence: number;
  reasoning: string;
  delegateTo: 'support' | 'order' | 'billing';
}

export interface RouterResult {
  agentType: SubAgentType;
  reasoning: string;
  confidence: number;
}

function parseJsonFromText(text: string): RouterResponse | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as RouterResponse;
    }
    return null;
  } catch {
    return null;
  }
}

export async function analyzeAndRoute(
  message: string,
  conversationHistory?: string
): Promise<RouterResult> {
  console.log('[Router] analyzeAndRoute:', { message, contextLength: conversationHistory?.length });
  const contextInfo = conversationHistory
    ? `\n\nRecent conversation context:\n${conversationHistory}`
    : '';

  const prompt = `Analyze this customer query and determine which agent should handle it:

Customer Query: "${message}"${contextInfo}

Return the classification in JSON format.`;

  try {
    console.log('[Router] Calling OpenAI...');
    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt,
      system: ROUTER_SYSTEM_PROMPT,
    });
    console.log('[Router] OpenAI response length:', text.length);

    const parsed = parseJsonFromText(text);

    if (parsed && ['support', 'order', 'billing'].includes(parsed.intent)) {
      return {
        agentType: parsed.intent,
        reasoning: parsed.reasoning,
        confidence: parsed.confidence,
      };
    }

    const lowerText = text.toLowerCase();
    if (lowerText.includes('order') || lowerText.includes('tracking')) {
      return {
        agentType: 'order',
        reasoning: 'Fallback: Text contained order/tracking keywords',
        confidence: 0.6,
      };
    }
    if (lowerText.includes('billing') || lowerText.includes('refund') || lowerText.includes('payment')) {
      return {
        agentType: 'billing',
        reasoning: 'Fallback: Text contained billing/refund keywords',
        confidence: 0.6,
      };
    }

    return {
      agentType: 'support',
      reasoning: 'Fallback: Could not parse response, defaulting to Support Agent',
      confidence: 0.5,
    };
  } catch (error) {
    console.error('Router agent error:', error);
    return {
      agentType: 'support',
      reasoning: 'Fallback: Error in routing, defaulting to Support Agent',
      confidence: 0.5,
    };
  }
}
