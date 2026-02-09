import { Hono } from 'hono';
import chatRoutes from './chat.routes';
import agentsRoutes from './agents.routes';

const routes = new Hono();

routes.route('/chat', chatRoutes);
routes.route('/agents', agentsRoutes);

export default routes;