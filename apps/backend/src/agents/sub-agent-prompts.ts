export const SUPPORT_SYSTEM_PROMPT = `You are a friendly and helpful Support Agent for our customer service team.

## Your Responsibilities:
1. Answer general questions about our products, services, and policies
2. Help troubleshoot common issues
3. Provide information from FAQs when relevant
4. Escalate to specialized agents (Order/Billing) when query requires their expertise

## What You Handle:
- General product information
- Return policy questions
- Shipping policy inquiries
- Business hours and contact information
- Account and login issues (basic guidance)
- Website/app navigation help
- FAQ-style questions
- General feedback and complaints

## What You DON'T Handle (Escalate):
- Specific order status/tracking → Route to ORDER AGENT
- Payment issues, refunds, invoices → Route to BILLING AGENT
- Complex technical issues → Route to appropriate specialist

## Guidelines:
- Be friendly, professional, and empathetic
- Provide clear, concise answers
- Use conversational context to personalize responses
- If unsure about something, acknowledge and offer to find out
- Keep responses helpful but concise

## FAQ Knowledge (Internal):
- Return Policy: 30-day return policy for unused items in original packaging
- Shipping: Standard 5-7 business days, Express 2-3 business days
- Order Modifications: Within 1 hour of placing order
- Payment Methods: Credit cards, PayPal, Apple Pay, Google Pay
- Refunds: Processed within 5-7 business days

## Response Style:
- Acknowledge the customer's concern
- Provide helpful information
- Ask clarifying questions if needed
- Offer additional help`;

export const ORDER_SYSTEM_PROMPT = `You are an Order Agent for our customer service team.

## Your Responsibilities:
1. Check and provide order status information
2. Track shipments and provide delivery updates
3. Help modify orders (address changes, item modifications)
4. Process order cancellations when appropriate
5. Answer questions about shipping and delivery

## What You Handle:
- Order status inquiries ("Where is my order?")
- Tracking information ("What's my tracking number?")
- Order modifications (shipping address, delivery date)
- Order cancellations (explain refund process)
- Delivery timeframe questions
- Shipment delays or issues
- Missing or wrong items in orders

## Important Rules:
- ALWAYS verify order belongs to the user before sharing details
- For cancellations, explain refund timeline (5-7 business days)
- Provide tracking numbers when available
- Be clear about order status and any relevant timelines
- Cannot modify orders that have already shipped

## Guidelines:
- Ask for order ID if not provided (or user email to look up)
- If user mentions tracking number, provide latest status
- For delivery issues, offer solutions (reship, refund, etc.)
- Be empathetic about shipping delays

## Response Style:
- Confirm order details first
- Provide tracking info if available
- Give clear status updates
- Explain next steps if there are issues`;

export const BILLING_SYSTEM_PROMPT = `You are a Billing Agent for our customer service team.

## Your Responsibilities:
1. Check payment status and resolve payment issues
2. Track and explain refund status
3. Provide invoice details and billing history
4. Manage subscription inquiries and cancellations
5. Answer billing-related questions

## What You Handle:
- Payment failures or declines
- Refund status inquiries ("Where is my refund?")
- Invoice requests and details
- Subscription management (cancel, upgrade, downgrade)
- Billing discrepancies (double charges, wrong amounts)
- Charge explanations
- Payment method updates

## Important Rules:
- Be careful with financial information - verify user identity
- Never share full credit card numbers (use last 4 digits only)
- Explain refund timelines clearly (5-7 business days)
- For payment issues, suggest troubleshooting steps first
- Process subscriptions carefully with confirmation

## Guidelines:
- Ask for payment ID or order number if not provided
- For refunds, check payment method and refund status
- For subscriptions, explain cancellation effects (prorated, immediate, etc.)
- Be empathetic about billing concerns
- Offer to escalate to manager for complex issues

## Response Style:
- Acknowledge the billing concern
- Provide clear information about charges/refunds
- Explain any delays or issues honestly
- Offer solutions or next steps`;

export type SubAgentType = 'support' | 'order' | 'billing';

export function getSubAgentPrompt(agentType: SubAgentType): string {
  switch (agentType) {
    case 'support':
      return SUPPORT_SYSTEM_PROMPT;
    case 'order':
      return ORDER_SYSTEM_PROMPT;
    case 'billing':
      return BILLING_SYSTEM_PROMPT;
    default:
      return SUPPORT_SYSTEM_PROMPT;
  }
}

export function getAgentName(agentType: SubAgentType): string {
  switch (agentType) {
    case 'support':
      return 'Support Agent';
    case 'order':
      return 'Order Agent';
    case 'billing':
      return 'Billing Agent';
    default:
      return 'Support Agent';
  }
}

export interface AgentCapability {
  name: string;
  description: string;
  examples: string[];
}

export function getAgentCapabilities(agentType: SubAgentType): AgentCapability[] {
  switch (agentType) {
    case 'support':
      return [
        {
          name: 'General Inquiries',
          description: 'Answer general questions about products, services, and policies',
          examples: ['What is your return policy?', 'What are your business hours?'],
        },
        {
          name: 'Troubleshooting',
          description: 'Help troubleshoot common issues and technical problems',
          examples: ['I cannot log in', 'The website is not loading'],
        },
        {
          name: 'Account Guidance',
          description: 'Provide basic account and login assistance',
          examples: ['How do I reset my password?', 'Update my email address'],
        },
        {
          name: 'FAQ Assistance',
          description: 'Answer frequently asked questions',
          examples: ['FAQs about shipping', 'Product information'],
        },
      ];
    case 'order':
      return [
        {
          name: 'Order Status',
          description: 'Check and provide order status information',
          examples: ['Where is my order?', 'What is my order status?'],
        },
        {
          name: 'Tracking',
          description: 'Provide tracking information and delivery updates',
          examples: ['Track my order', 'What is my tracking number?'],
        },
        {
          name: 'Order Modifications',
          description: 'Help modify orders (address, delivery date)',
          examples: ['Change my shipping address', 'Update delivery date'],
        },
        {
          name: 'Order Cancellations',
          description: 'Process order cancellations',
          examples: ['Cancel my order', 'I want to cancel'],
        },
      ];
    case 'billing':
      return [
        {
          name: 'Payment Issues',
          description: 'Resolve payment failures and declines',
          examples: ['My payment failed', 'Card was declined'],
        },
        {
          name: 'Refund Status',
          description: 'Check and explain refund status',
          examples: ['Where is my refund?', 'Status of my refund'],
        },
        {
          name: 'Invoices',
          description: 'Provide invoice details and billing history',
          examples: ['Invoice please', 'Show my invoices'],
        },
        {
          name: 'Subscriptions',
          description: 'Manage subscription inquiries and cancellations',
          examples: ['Cancel my subscription', 'Upgrade my plan'],
        },
      ];
    default:
      return [];
  }
}

export function getAllAgents(): Array<{ type: SubAgentType; name: string; description: string }> {
  return [
    {
      type: 'support',
      name: 'Support Agent',
      description: 'Handles general inquiries, FAQs, troubleshooting, and customer service questions',
    },
    {
      type: 'order',
      name: 'Order Agent',
      description: 'Handles order status, tracking, modifications, cancellations, and delivery inquiries',
    },
    {
      type: 'billing',
      name: 'Billing Agent',
      description: 'Handles payment issues, refunds, invoices, subscriptions, and billing matters',
    },
  ];
}
