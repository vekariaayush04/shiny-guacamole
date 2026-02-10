import { Hono } from 'hono';
import {
  getAllAgents,
  getAgentCapabilities,
  getAgentName,
  type SubAgentType,
} from '../agents/sub-agent-prompts';

const agentRoutes = new Hono();

const VALID_AGENT_TYPES: SubAgentType[] = ['support', 'order', 'billing'];

agentRoutes.get('/', async (c) => {
  try {
    const agents = getAllAgents();
    return c.json({
      success: true,
      data: agents,
    });
  } catch (error) {
    console.error('Get agents error:', error);
    return c.json({ success: false, error: 'Failed to get agents' }, 500);
  }
});

agentRoutes.get('/:type/capabilities', async (c) => {
  try {
    const type = c.req.param('type') as SubAgentType;

    if (!VALID_AGENT_TYPES.includes(type)) {
      return c.json(
        {
          success: false,
          error: `Invalid agent type. Valid types: ${VALID_AGENT_TYPES.join(', ')}`,
        },
        400
      );
    }

    const name = getAgentName(type);
    const capabilities = getAgentCapabilities(type);

    return c.json({
      success: true,
      data: {
        type,
        name,
        capabilities,
      },
    });
  } catch (error) {
    console.error('Get agent capabilities error:', error);
    return c.json({ success: false, error: 'Failed to get agent capabilities' }, 500);
  }
});

export type AgentRoutesType = typeof agentRoutes;
export default agentRoutes;
