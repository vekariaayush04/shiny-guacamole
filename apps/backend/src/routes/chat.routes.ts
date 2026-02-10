import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { sendMessageSchema, userIdQuerySchema } from '../types';
import { chatService } from '../services/chat.service';

const chatRoutes = new Hono();

chatRoutes.post('/messages', zValidator('json', sendMessageSchema), async (c) => {
  try {
    const { message, conversationId, userId } = c.req.valid('json');
    const result = await chatService.processMessage({ message, conversationId, userId });

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return c.json({ success: false, error: 'Failed to process message' }, 500);
  }
});

chatRoutes.get('/conversations/:id', async (c) => {
  try {
    const conversationId = c.req.param('id');
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    const conversation = await chatService.getConversation(conversationId, userId);

    if (!conversation) {
      return c.json({ success: false, error: 'Conversation not found' }, 404);
    }

    return c.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    return c.json({ success: false, error: 'Failed to get conversation' }, 500);
  }
});

chatRoutes.get('/conversations', zValidator('query', userIdQuerySchema), async (c) => {
  try {
    const { userId } = c.req.valid('query');
    const limit = parseInt(c.req.query('limit') || '20');

    const conversations = await chatService.listConversations(userId, limit);

    return c.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error('List conversations error:', error);
    return c.json({ success: false, error: 'Failed to list conversations' }, 500);
  }
});

chatRoutes.delete('/conversations/:id', async (c) => {
  try {
    const conversationId = c.req.param('id');
    const userId = c.req.query('userId');

    if (!userId) {
      return c.json({ success: false, error: 'userId is required' }, 400);
    }

    const result = await chatService.deleteConversation(conversationId, userId);

    return c.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Delete conversation error:', error);
    if ((error as Error).message === 'Conversation not found') {
      return c.json({ success: false, error: 'Conversation not found' }, 404);
    }
    return c.json({ success: false, error: 'Failed to delete conversation' }, 500);
  }
});

export type AppType = typeof chatRoutes;
export default chatRoutes;
