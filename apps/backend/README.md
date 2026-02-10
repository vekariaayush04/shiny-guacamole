# Multi-Agent Customer Service API

## Base Info
- **Framework**: Hono.js
- **Base URL**: `http://localhost:3000`
- **Base Path**: `/api/v1`

---

## Global Middleware
| Middleware | Purpose |
|------------|---------|
| `logger()` | Logs requests |
| `prettyJSON()` | Formats JSON responses |
| `cors()` | Enables CORS |

---

## Endpoints

### GET /health
Health check endpoint.

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2026-02-11T10:00:00.000Z"
}
```

---

## Chat Routes (`/api/v1/chat`)

### POST /api/v1/chat/messages
Send a message to the chat system. Message is routed to Support, Order, or Billing agent.

**Request Body:**
```json
{
  "conversationId": "string (optional)",
  "message": "string (required)",
  "userId": "string (required)"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "conversationId": "conv_xxx",
    "response": "Your order is being processed and will ship...",
    "routedTo": "order",
    "routingReason": "User asked about order status",
    "routingConfidence": 0.95,
    "timestamp": "2026-02-11T10:00:00.000Z"
  }
}
```

**Response (500):**
```json
{
  "success": false,
  "error": "Failed to process message"
}
```

---

### GET /api/v1/chat/conversations/:id
Get a specific conversation with all messages.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User's ID for authorization |

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Conversation ID |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "conv_xxx",
    "userId": "user_123",
    "title": "Where is my order?",
    "lastAgentType": "ORDER",
    "updatedAt": "2026-02-11T10:00:00.000Z",
    "createdAt": "2026-02-11T09:55:00.000Z",
    "messages": [
      {
        "id": "msg_xxx",
        "conversationId": "conv_xxx",
        "role": "USER",
        "content": "Where is my order?",
        "agentType": null,
        "toolCalls": null,
        "toolResults": null,
        "createdAt": "2026-02-11T09:55:00.000Z"
      },
      {
        "id": "msg_yyy",
        "conversationId": "conv_xxx",
        "role": "ASSISTANT",
        "content": "Your order is being processed...",
        "agentType": "ORDER",
        "toolCalls": [{"name": "getOrderDetails", "arguments": {...}}],
        "toolResults": [{"name": "getOrderDetails", "result": {...}}],
        "createdAt": "2026-02-11T10:00:00.000Z"
      }
    ]
  }
}
```

**Response (400):**
```json
{ "success": false, "error": "userId is required" }
```

**Response (404):**
```json
{ "success": false, "error": "Conversation not found" }
```

---

### GET /api/v1/chat/conversations
List all conversations for a user.

**Query Parameters:**
| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `userId` | string | Yes | - | User's ID |
| `limit` | number | No | 20 | Max conversations to return |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "conv_xxx",
      "title": "Where is my order?",
      "lastAgentType": "ORDER",
      "updatedAt": "2026-02-11T10:00:00.000Z",
      "createdAt": "2026-02-11T09:55:00.000Z",
      "_count": { "messages": 4 }
    },
    {
      "id": "conv_yyy",
      "title": "What is your return policy?",
      "lastAgentType": "SUPPORT",
      "updatedAt": "2026-02-10T14:30:00.000Z",
      "createdAt": "2026-02-10T14:25:00.000Z",
      "_count": { "messages": 2 }
    }
  ]
}
```

**Response (500):**
```json
{ "success": false, "error": "Failed to list conversations" }
```

---

### DELETE /api/v1/chat/conversations/:id
Delete a conversation.

**Query Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `userId` | string | Yes | User's ID |

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `id` | string | Conversation ID |

**Response (200):**
```json
{ "success": true, "data": { "success": true } }
```

**Response (400):**
```json
{ "success": false, "error": "userId is required" }
```

**Response (404):**
```json
{ "success": false, "error": "Conversation not found" }
```

---

## Agent Routes (`/api/v1/agents`)

### GET /api/v1/agents
List all available agents.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "type": "support",
      "name": "Support Agent",
      "description": "Handles general inquiries, FAQs, troubleshooting..."
    },
    {
      "type": "order",
      "name": "Order Agent",
      "description": "Handles order status, tracking, modifications..."
    },
    {
      "type": "billing",
      "name": "Billing Agent",
      "description": "Handles payment issues, refunds, invoices..."
    }
  ]
}
```

---

### GET /api/v1/agents/:type/capabilities
Get capabilities for a specific agent.

**Path Parameters:**
| Param | Type | Description |
|-------|------|-------------|
| `type` | string | Agent type: `support`, `order`, or `billing` |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "type": "order",
    "name": "Order Agent",
    "capabilities": [
      {
        "name": "Order Status",
        "description": "Check and provide order status information",
        "examples": ["Where is my order?", "What is my order status?"]
      },
      {
        "name": "Tracking",
        "description": "Provide tracking information and delivery updates",
        "examples": ["Track my order", "What is my tracking number?"]
      },
      {
        "name": "Order Modifications",
        "description": "Help modify orders (address, delivery date)",
        "examples": ["Change my shipping address", "Update delivery date"]
      },
      {
        "name": "Order Cancellations",
        "description": "Process order cancellations",
        "examples": ["Cancel my order", "I want to cancel"]
      }
    ]
  }
}
```

**Response (400):**
```json
{ "success": false, "error": "Invalid agent type. Valid types: support, order, billing" }
```

---

## Agent Types (Internal)

| Type | Description |
|------|-------------|
| `ROUTER` | Parent agent that routes queries to sub-agents |
| `SUPPORT` | Handles general support, FAQs, troubleshooting |
| `ORDER` | Handles order status, tracking, cancellations |
| `BILLING` | Handles payments, refunds, invoices |

---

## Message Roles

| Role | Description |
|------|-------------|
| `USER` | Message from the customer |
| `ASSISTANT` | Response from the agent |
| `SYSTEM` | System messages (rarely used) |

---

## Frontend Integration Examples

### Initialize Chat
```javascript
const response = await fetch('http://localhost:3000/api/v1/chat/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'Where is my order?',
    userId: 'user_123'
  })
});
const { success, data } = await response.json();
// data.conversationId should be stored for continuing the conversation
```

### Continue Conversation
```javascript
const response = await fetch('http://localhost:3000/api/v1/chat/messages', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversationId: storedConversationId,  // Include previous ID
    message: 'Can I cancel it?',
    userId: 'user_123'
  })
});
```

### Load Conversation History
```javascript
const response = await fetch(
  `http://localhost:3000/api/v1/chat/conversations/${conversationId}?userId=user_123`
);
const { success, data } = await response.json();
// data.messages contains the conversation
```

### List All Conversations
```javascript
const response = await fetch(
  'http://localhost:3000/api/v1/chat/conversations?userId=user_123&limit=10'
);
const { success, data } = await response.json();
// data is array of conversations
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for AI responses |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `PORT` | No | Server port (default: 3000) |

---

## Database Models

### Conversation
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `userId` | string | User ID |
| `title` | string | First message preview |
| `lastAgentType` | enum | Last agent that responded |
| `agentsUsed` | array | All agents used in conversation |
| `createdAt` | datetime | Creation timestamp |
| `updatedAt` | datetime | Last update timestamp |

### Message
| Field | Type | Description |
|-------|------|-------------|
| `id` | string | UUID |
| `conversationId` | string | Conversation reference |
| `role` | enum | USER, ASSISTANT, SYSTEM |
| `content` | string | Message content |
| `agentType` | enum | Which agent responded |
| `toolCalls` | json | Tools called by agent |
| `toolResults` | json | Results from tools |
| `createdAt` | datetime | Message timestamp |

---

## Response Flow

```
User Message
    ↓
Sanitize Input
    ↓
Router Agent (OpenAI)
    ↓
Determine: support | order | billing
    ↓
Sub-Agent (OpenAI + Tools)
    ↓
Store Messages in DB
    ↓
Return Response
```

---

## Installation & Running

```sh
bun install
bun run dev
```

Open http://localhost:3000
