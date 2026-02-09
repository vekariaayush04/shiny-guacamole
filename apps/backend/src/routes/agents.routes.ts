import { Hono } from 'hono';
import { agentController } from '../controllers/agent.controller';

const agentRoutes = new Hono();

agentRoutes.get('/agents', agentController.listAgents)

agentRoutes.get('/agents/:type/capabilities', agentController.getAgentCapabilities)


export default agentRoutes;