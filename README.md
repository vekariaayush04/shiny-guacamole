# Multi-Agent Customer Service

A multi-agent AI customer service system built with Hono.js, React, and OpenAI. Features intelligent routing to specialized agents (Support, Order, Billing) based on customer queries.

## Quick Start

### Prerequisites

- [Bun](https://bun.sh/) >= 1.0
- PostgreSQL database
- OpenAI API key

### Setup

1. **Install dependencies**

```bash
cd apps/backend && bun install
cd ../frontend && bun install
```

2. **Configure environment**

Create `.env` files:

```bash
# apps/backend/.env
DATABASE_URL="postgresql://user:password@localhost:5432/customer_service"
OPENAI_API_KEY="your-openai-key"
```

```bash
# apps/frontend/.env
VITE_API_URL=http://localhost:3000/api/v1
```

3. **Setup database**

```bash
cd apps/backend
npx prisma migrate dev
npx prisma db seed
```

4. **Start servers**

```bash
# Terminal 1 - Backend (port 3000)
cd apps/backend && bun run dev

# Terminal 2 - Frontend (port 5173)
cd apps/frontend && bun run dev
```

5. **Open browser**

Navigate to `http://localhost:5173`

---

## Demo Users

The database includes 3 demo users. Use the dropdown in the top-right to switch between them:

| User ID | Name | Sample Data |
|---------|------|------------|
| `user_alice` | Alice Johnson | 1 order, billing history |
| `user_bob` | Bob Smith | No orders |
| `user_carol` | Carol Davis | 2 orders, invoices |

---

## Architecture

### Backend (`apps/backend`)

- **Hono.js** - Fast web framework with type-safe routing
- **Multi-Agent System** - Router + 3 specialized agents
- **OpenAI GPT-4o-mini** - AI-powered responses with tool calling
- **Prisma + PostgreSQL** - Database ORM

#### Agent Flow

```
User Message → Router Agent → [Routes to appropriate agent]
                                    ├── Support Agent → User profile, recent activity
                                    ├── Order Agent → Orders, shipments, returns
                                    └── Billing Agent → Invoices, refunds, payments
```

#### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/chat` | Send message, returns AI response |
| GET | `/api/v1/conversations` | List user's conversations |
| GET | `/api/v1/conversations/:id` | Get conversation with messages |
| DELETE | `/api/v1/conversations/:id` | Delete conversation |
| GET | `/api/v1/agents` | List available agents |

### Frontend (`apps/frontend`)

- **React 19** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Steve Jobs aesthetic** - Clean, minimal design

#### Components

- `ChatWindow` - Main chat interface with message bubbles
- `ConversationList` - Sidebar with conversation history
- `AgentPanel` - View agent information and statistics

---

## Testing the Application

### Example Queries

**Support Agent:**
- "What's my account status?"
- "What have I recently done?"
- "Help me with my account"

**Order Agent:**
- "What is my order_1?"
- "Show my recent orders"
- "Track my shipment"
- "I want to return an item"

**Billing Agent:**
- "Show my invoices"
- "What refunds do I have?"
- "Billing summary please"

### Testing Steps

1. Select a user from the dropdown (top-right)
2. Click "New conversation" (+ button) or select existing
3. Type a query above
4. Observe routing info showing which agent handled it
5. Check agent response for relevant data

---

## Scripts

### Backend

```bash
cd apps/backend
bun run dev       # Development with hot reload
bun run build     # TypeScript type checking
bun run start     # Production server
```

### Frontend

```bash
cd apps/frontend
bun run dev       # Start dev server
bun run build     # Build for production
bun run lint      # Run ESLint
bun run preview   # Preview production build
```

---

## Project Structure

```
shiny-guacamole/
├── apps/
│   ├── backend/
│   │   ├── src/
│   │   │   ├── agents/         # Agent implementations
│   │   │   │   ├── router.ts   # Routing logic
│   │   │   │   ├── sub-agents.ts
│   │   │   │   └── tools/      # Agent tools
│   │   │   ├── routes/         # API routes
│   │   │   ├── services/       # Business logic
│   │   │   ├── db/             # Prisma client
│   │   │   └── index.ts        # Entry point
│   │   └── prisma/
│   │       ├── schema.prisma    # Database schema
│   │       └── seed.ts          # Demo data
│   └── frontend/
│       ├── src/
│       │   ├── components/      # React components
│       │   ├── client.ts        # API client
│       │   └── App.tsx          # Main app
│       └── index.html
└── README.md
```

---

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Bun |
| Backend Framework | Hono.js |
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS |
| AI | OpenAI GPT-4o-mini |
| Database | PostgreSQL + Prisma |
| API Client | Native Fetch |
