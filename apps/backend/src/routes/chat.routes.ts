import { Hono } from 'hono';
import { chatController } from '../controllers/chat.controller';

const chatRoutes = new Hono();

chatRoutes.post('/messages', chatController.sendMessage)

chatRoutes.get('/conversations/:id', chatController.getConversationHistory)

chatRoutes.get('/conversations', chatController.listConversations)

chatRoutes.delete('/conversations/:id', chatController.deleteconversation)

//RPC type
export type AppType = typeof chatRoutes

export default chatRoutes;