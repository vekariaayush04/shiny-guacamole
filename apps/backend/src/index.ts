import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import routes from './routes';

const app = new Hono();

app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', cors());

app.route('/api/v1', routes);

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.notFound((c) => {
  return c.json({
    success: false,
    error: 'Route not found',
  }, 404);
});

const port = process.env.PORT || 3000;
console.log(`Server running on http://localhost:${port}`);

export default {
  port,
  fetch: app.fetch,
};