# Product Requirements Document: Silicon Soap

## Executive Summary

**Silicon Soap** is an open-source AI multi-agent conversation platform where users can create and witness dynamic debates between AI agents with different personalities and models. The platform is available as both a free downloadable application and a hosted cloud version at [siliconsoap.com](https://siliconsoap.com).

**Open Source**: Free to download, run locally, and modify. No vendor lock-in.
**Cloud Version**: Hosted at siliconsoap.com with shared infrastructure.
**Technology**: React + TypeScript frontend, Supabase backend, OpenRouter AI integration.

**Current Status**: Production-ready with core multi-agent conversation features, credit system, and AI-powered conversation analysis.

---

## Architecture Overview

```mermaid
graph TD
    A[Silicon Soap Platform] --> B[Open Source Download]
    A --> C[Cloud Version siliconsoap.com]

    B --> D[Local Installation]
    B --> E[Self-Hosting]

    C --> F[Multi-Agent Chat]
    C --> G[Credit System]
    C --> H[Judge Bot Analyzer]

    D --> F
    E --> F

    F --> I[Supabase Backend]
    G --> I
    H --> I

    I --> J[PostgreSQL Database]
    I --> K[Edge Functions]
    I --> L[Realtime Subscriptions]
    I --> M[OpenRouter API]

    style C fill:#4CAF50
    style B fill:#2196F3
```

---

## Core Features

### Multi-Agent Conversations

**Agent Configuration**:
- **Count**: 2-3 agents per conversation
- **Models**: Each agent uses different AI models from OpenRouter catalog
- **Personas**: Database-driven personalities (Analytical, Creative, Strategic, Empathy)
- **Soap Opera Names**: Agents get dramatic soap opera names (e.g., "Blake Carrington", "Alexis Colby")

**Conversation Flow**:
- **Turn-Taking**: Structured rounds (Agent A → Agent B → Agent C, then follow-ups)
- **Real-Time Streaming**: Messages appear progressively via Supabase Realtime
- **Typing Indicators**: Per-agent indicators during generation
- **Round Separators**: Visual markers between conversation phases

**Scenarios**:
1. **General Problem**: Universal problem-solving and analysis
2. **Ethical Dilemma**: Ethical exploration and moral reasoning
3. **Future Trends**: Speculative discussion about future developments

### Credit System

**Guest Users** (No Account Required):
- **5 free credits** per session
- **Local storage** for chat history
- **Limited UI** (no sidebar, minimal features)
- **Credit deduction** happens upfront when starting battles

**Logged-In Users**:
- **10 total credits** (3 initial + 7 signup bonus)
- **Database storage** with real-time chat history
- **Full features** including Judge Bot analysis
- **Token-based billing** - credits deducted based on actual AI usage
- **Stripe integration** for purchasing additional credits (planned)

**Credit Usage**:
- **Guests**: 1 credit per battle start
- **Logged-in**: Credits deducted based on token consumption during conversation
- **Atomic operations** prevent race conditions and ensure accurate billing

### Judge Bot Analyzer

**Personality**: Dramatic soap opera queen who judges AI agents with full dramatic flair 🎭

**Features**:
- **Trigger**: Floating action button (bottom-right) when conversation completes
- **Analysis Style**: Uses actual agent names, creates dramatic soap opera narratives
- **Content**: Punchy verdict, trust issues, diva moments, final rose ceremony
- **Access**: Logged-in users only (guests see sign-in prompt)
- **Time Estimate**: Shows "⏱️ This usually takes 15-30 seconds" during analysis

**Sample Output**:
```
🎭 Blake Carrington played it risky, Alexis had hidden agendas, and Luke... well, Luke at least tried to look innocent.

## 🗡️ Backstabbing Alert
Blake undermined Alexis by questioning her "strategic vision" while secretly pursuing the same approach...

## 👑 Diva Moment
Alexis took up 60% of the conversation space with her dramatic flourishes and main character energy...
```

### Technical Architecture

**Frontend**: React 18 + TypeScript, Vite, Tailwind CSS, shadcn/ui
**Backend**: Supabase (PostgreSQL + Edge Functions + Realtime)
**AI Integration**: OpenRouter API with shared key infrastructure

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant EF as Edge Function
    participant OR as OpenRouter API
    participant DB as Database

    U->>FE: Submit prompt + start battle
    FE->>DB: Deduct credits (guests) or track tokens (logged-in)
    FE->>EF: Trigger conversation generation

    loop For each agent turn
        EF->>OR: Call with persona + model
        OR-->>EF: Stream response
        EF->>DB: Save message + deduct tokens (logged-in)
        DB->>FE: Real-time message broadcast
    end

    U->>FE: Click Judge Bot
    FE->>EF: Analyze conversation
    EF->>OR: Generate dramatic analysis
    EF-->>FE: Return soap opera verdict
```

### Database Schema

#### `agent_chats`
```sql
- id: uuid (PK)
- user_id: uuid (nullable for guests)
- title: text
- prompt: text
- scenario_id: text
- settings: jsonb (models, personas, rounds)
- created_at: timestamp
- updated_at: timestamp
```

#### `agent_chat_messages`
```sql
- id: uuid (PK)
- chat_id: uuid (FK)
- agent: text ("Agent A", "Agent B", "Agent C")
- persona: text (persona slug)
- model: text (OpenRouter model ID)
- message: text
- created_at: timestamp
```

#### `user_credits`
```sql
- id: uuid (PK)
- user_id: uuid (FK)
- credits_remaining: integer
- credits_used: integer
- created_at: timestamp
- updated_at: timestamp
```

#### `user_token_usage`
```sql
- id: uuid (PK)
- user_id: uuid (FK)
- chat_id: uuid (nullable)
- model_id: text
- prompt_tokens: integer
- completion_tokens: integer
- total_tokens: integer
- estimated_cost: decimal
- created_at: timestamp
```

#### `chat_analytics`
```sql
- id: uuid (PK)
- chat_id: uuid (nullable)
- user_id: uuid (nullable)
- session_id: text (for guest tracking)
- is_guest: boolean
- total_messages: integer
- total_tokens_used: integer
- estimated_cost: decimal
- generation_duration_ms: integer
- models_used: text[]
- num_agents: integer
- started_at: timestamp
- completed_at: timestamp (nullable)
```

### Edge Functions

#### `openrouter-chat`
- **Purpose**: Proxy all OpenRouter API calls with shared API key
- **Features**: Rate limit handling, cost tracking, streaming responses
- **Security**: Server-side API key management, no client exposure

#### `openrouter-models`
- **Purpose**: Fetch available models from OpenRouter catalog
- **Caching**: Models cached for performance

#### `create-credits-checkout`
- **Purpose**: Handle Stripe credit purchases
- **Status**: Planned

#### `log-battle-start`
- **Purpose**: Capture user IP addresses for analytics
- **Privacy**: Non-critical, fails silently

### Open Source & Self-Hosting

**Download & Run Locally**:
- Full source code available on GitHub
- Run with `npm install && npm run dev`
- Requires Supabase account for backend
- Uses shared OpenRouter API key (server-side)

**Cloud Version**:
- Hosted at siliconsoap.com
- Shared infrastructure with premium features
- Credit system with Stripe payments (planned)
- Enhanced analytics and monitoring

**Key Benefits**:
- **No Vendor Lock-in**: Run locally or migrate anytime
- **Privacy**: Local conversations stay on your machine
- **Customization**: Modify code for your needs
- **Learning**: Study AI agent orchestration patterns

---

## Success Metrics

### User Engagement
- **Battle Count**: Total conversations generated
- **User Growth**: Guest → logged-in conversion rate
- **Retention**: Returning users, chat history usage
- **Feature Adoption**: Judge Bot usage, custom scenarios

### Technical Metrics
- **API Usage**: OpenRouter token consumption tracking
- **Performance**: Conversation generation speed, streaming reliability
- **Analytics**: Battle completion rates, model preferences

### Business Metrics (Cloud Version)
- **Credit Sales**: Stripe revenue from credit purchases
- **User Acquisition**: Organic growth vs marketing
- **Platform Usage**: Daily/weekly active users

---

## Development Roadmap

### ✅ Completed

**Core Multi-Agent System**:
- [x] 2-3 agent conversations with different models/personas
- [x] Real-time streaming via Supabase Realtime
- [x] Soap opera agent naming system
- [x] Three conversation scenarios
- [x] Turn-taking conversation flow

**Credit & Billing System**:
- [x] Guest credits (5 free battles)
- [x] Logged-in token-based billing (10 credits)
- [x] Atomic credit operations
- [x] Stripe integration preparation

**Analysis & Entertainment**:
- [x] Judge Bot dramatic analyzer with soap opera theme
- [x] Real-time chat history with database storage
- [x] Conversation completion analytics
- [x] User participation modes

**Technical Infrastructure**:
- [x] OpenRouter API integration with shared keys
- [x] Supabase backend with edge functions
- [x] Open source codebase with local development
- [x] Comprehensive analytics tracking

### 🚧 In Progress

- [ ] **Agent Profile Marketplace**: User-created and premium personas
- [ ] **Conversation Branching**: Edit messages, regenerate from points
- [ ] **Export Features**: PDF, Markdown, JSON export
- [ ] **Advanced UI Modes**: Different conversation layouts

### 📋 Planned

- [ ] **Workflow Builder**: Node-based automation tool (separate project)
- [ ] **Research Assistant**: Document analysis with RAG (separate project)
- [ ] **Team Workspaces**: Multi-user collaboration features
- [ ] **Advanced Analytics**: Usage dashboards and insights
- [ ] **Mobile App**: React Native companion
- [ ] **API Access**: Programmatic battle creation

---

## Installation & Setup

### Local Development

```bash
# Clone repository
git clone https://github.com/yourusername/siliconsoap.git
cd siliconsoap

# Install dependencies
npm install

# Set up environment (Supabase project required)
# Copy .env.example to .env and fill in values

# Start development server
npm run dev
```

### Self-Hosting

1. **Supabase Setup**:
   - Create Supabase project
   - Run database migrations
   - Configure edge functions

2. **OpenRouter API**:
   - Get API key from OpenRouter
   - Configure in Supabase secrets

3. **Environment Variables**:
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

### Cloud Version

Visit [siliconsoap.com](https://siliconsoap.com) for the hosted version with premium features and credit purchasing.

---

## Appendix

### Key Files

**Core Application**:
- `src/pages/agents-meetup/` - Main application
- `src/repositories/` - Data access layer
- `src/services/` - Business logic
- `src/hooks/` - React hooks
- `supabase/functions/` - Edge functions

### Environment Variables

```bash
# Supabase (required)
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# OpenRouter (configured in Supabase edge functions)
# OPENROUTER_API_KEY=your_api_key
```

### Contributing

Silicon Soap is open source! Contributions welcome:
- Bug reports and feature requests
- Code improvements and optimizations
- Documentation updates
- Agent persona additions

---

**Last Updated**: 2025-12-30
**Version**: 2.0
**License**: MIT (Open Source)
**Status**: Production Ready

---

## Project 1: AI Agents Meetup

### Overview

AI Agents Meetup is a ChatGPT/Grok-style multi-agent conversation application where 2-3 AI agents with different models and personas discuss user-provided topics. The application emphasizes agentic conversation with structured turn-taking, real-time message streaming, and conversational analysis.

**Routes**: `/labs/agents-meetup/*`

### Core Features

#### 1. Multi-Agent Conversations

- **Agent Count**: 2-3 agents per conversation (configurable)
- **Model Selection**: Each agent uses a different AI model from OpenRouter's catalog
- **Unique Personas**: Each agent has a distinct personality and approach (fetched from database)
- **Turn-Taking Logic**: Structured conversation flow (Agent A → Agent B → Agent C, then follow-ups)
- **Real-Time Streaming**: Messages appear progressively as they're generated (Supabase Realtime)
- **Typing Indicators**: Per-agent typing indicators during generation

#### 2. Conversation Scenarios

Three core scenarios guide conversation structure:

1. **General Problem**: Universal problem-solving and analysis
2. **Ethical Dilemma**: Ethical exploration and moral reasoning
3. **Future Trends**: Speculative discussion about future developments

**Note**: "Text Analysis" scenario was removed to reduce decision fatigue and maintain focus.

#### 3. Database-Driven Agent Personas

Agent personas are centralized in the `agent_profiles` table, replacing hardcoded configurations:

**System Profiles** (always available):
- **Analytical Expert**: Data-driven, logical reasoning
- **Creative Thinker**: Imaginative, unconventional approaches
- **Strategic Planner**: Long-term thinking, strategic insights
- **Empathy Expert**: Human-centered, emotional intelligence

**Future**: Support for user-created custom profiles and premium marketplace profiles.

#### 4. User Authentication & Credit System

**Guest Users**:
- 3 free credits (3 chats)
- Session-only chat storage (localStorage)
- Cannot save, analyze, or access history
- Minimal UI (no sidebar navigation)

**Logged-In Users**:
- 10 total credits (3 initial + 7 signup bonus)
- Persistent database storage
- Full sidebar navigation (Profile, Agent Profiles, API Settings, Settings)
- Real-time chat history updates
- Access to Judge Bot conversation analyzer
- Can provide own OpenRouter API key (BYOK) when credits exhausted

**BYOK (Bring Your Own Key)**:
- Requires authentication (not available to guests)
- API keys stored securely server-side in database
- Enables unlimited conversations
- Positioned as upgrade path when credits exhausted

#### 5. Judge Bot Analyzer

- **Trigger**: Floating action button (Sparkles icon with pulse animation)
- **Personality**: Sports-commentator style analysis
- **Content**: Quick verdict, nerd stats (tokens, cost, charts), detailed analysis
- **Access**: Logged-in users only (guests see sign-in prompt)
- **Purpose**: Entertainment value + incentivizes user signup

#### 6. Swarm Builder (Planned - Next Release)

An interactive "Build Your Own Agent Swarm" feature in the Learn section that allows users to configure optimal agent team compositions.

**Core Functionality:**
- Choose from 8 specialized agent types (requires expanding from current 4 personas)
- Select 2-3 agents to form an optimal collaboration team
- Pick collaboration architecture (Debate, Sequential, Round-Robin)
- Preview swarm strengths and considerations
- Launch directly to `/new` with pre-configured agent setup

**Agent Types (Expansion Required):**
- **Existing personas**: Analytical Expert, Creative Thinker, Strategic Planner, Empathy Expert
- **New personas to create**: Critic, Synthesizer, Fact-Checker, Devil's Advocate

**Pedagogical Element:**
- Explains why 2-3 agents is the optimal "sweet spot" for demo swarms
- Shows how different agent combinations create unique dynamics
- Educates users about swarm architectures before they experiment

**Technical Requirements:**
- Create 4 new system personas in `agent_profiles` table
- Build `SwarmBuilderSection.tsx` interactive component
- Add URL query parameter support in `NewChatView.tsx` for swarm pre-configuration
- Integration path: Learn section → configured `/new` experience

**Use Cases Available:**
- Research Project
- Content Creation
- Code Review
- Problem Solving

### Technical Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant EF as Edge Function
    participant OR as OpenRouter API
    participant DB as Database
    participant RT as Realtime

    U->>FE: Submit prompt
    FE->>DB: Create chat record
    DB-->>FE: Return chatId
    FE->>U: Navigate to /chat/:id
    FE->>EF: Trigger conversation generation
    
    loop For each agent turn
        EF->>OR: Call with persona + model
        OR-->>EF: Stream response
        EF->>DB: Save message
        DB->>RT: Broadcast new message
        RT->>FE: Real-time update
        FE->>U: Display message + typing indicator
    end
    
    U->>FE: Click Judge Bot
    FE->>EF: Request analysis
    EF->>OR: Analyze conversation
    OR-->>EF: Return analysis
    EF-->>FE: Return results
    FE->>U: Display analysis
```

### Database Schema

#### `agent_chats`
```sql
- id: uuid (PK)
- user_id: uuid (nullable for guests)
- title: text
- prompt: text
- scenario_id: text
- settings: jsonb (agent configs, models, personas, rounds)
- created_at: timestamp
- updated_at: timestamp
```

#### `agent_chat_messages`
```sql
- id: uuid (PK)
- chat_id: uuid (FK → agent_chats)
- agent: text (agent identifier)
- persona: text (persona slug)
- model: text (OpenRouter model ID)
- message: text (response content)
- created_at: timestamp
```

#### `agent_profiles`
```sql
- id: uuid (PK)
- slug: text (unique, e.g., 'analytical-expert')
- name: text
- description: text (short description)
- instructions: text (full persona system prompt)
- icon_name: text (Lucide icon name)
- is_system: boolean (system vs user-created)
- is_premium: boolean (free vs paid)
- user_id: uuid (nullable, for custom profiles)
- created_at: timestamp
- updated_at: timestamp
```

#### `user_credits`
```sql
- id: uuid (PK)
- user_id: uuid (FK)
- credits_remaining: integer
- credits_used: integer
- created_at: timestamp
- updated_at: timestamp
```

**Realtime Enabled**: `agent_chats`, `agent_chat_messages`

### Edge Functions

#### `openrouter-chat`
- **Purpose**: Proxy requests to OpenRouter API with shared or user API keys
- **Input**: model, persona, messages, conversationHistory, userApiKey (optional)
- **Output**: Streamed or complete AI response
- **Features**: Rate limit handling (429), fallback logic, cost tracking

#### `openrouter-models`
- **Purpose**: Fetch available models from OpenRouter catalog
- **Output**: List of models with pricing, context limits, capabilities

### API Key Strategy

```mermaid
graph TD
    A[User Starts Chat] --> B{Has Credits?}
    B -->|Yes| C[Use Shared Key via Edge Function]
    B -->|No| D{Has Own API Key?}
    D -->|Yes| E[Use User's OpenRouter Key]
    D -->|No| F[Prompt: Login for Credits or BYOK]
    
    C --> G{Rate Limited 429?}
    G -->|Yes| H[Prompt: BYOK or Purchase Credits]
    G -->|No| I[Conversation Succeeds]
    
    E --> I
    F --> J{User Chooses}
    J -->|Login| K[Get +7 Credits]
    J -->|BYOK| L[Authenticate + Add Key]
    
    style C fill:#4CAF50
    style E fill:#2196F3
    style H fill:#FF9800
```

### UI/UX Design

#### Layout
- **Header**: Transparent minimal header (Grok-style)
- **Sidebar**: 
  - Logo and title at top
  - Chat history organized by date (Today, Yesterday, Previous 7 Days, etc.)
  - Real-time updates via Supabase subscriptions (logged-in) or custom events (guests)
  - Footer menu with Profile, Agent Profiles, API Settings, Settings (logged-in only)
  - Modern toggle buttons (PanelLeft/PanelLeftClose icons)
- **Main Area**: Full-height immersive chat interface

#### Landing Page (New Chat View)
- **Unified Input Card**:
  - Scenario pills at top (subtle bottom border)
  - Textarea in middle (no individual border)
  - Suggested topics at bottom (subtle top border)
  - All elements feel like one cohesive prompt composition unit
- **Conversation Settings**: Number of agents, rounds, response length (always visible)
- **Agent Configuration**: 3-agent grid with model + persona selectors (always visible)
- **Design Philosophy**: Balance Apple-style minimalism with transparency of multi-agent customization features

#### Chat View
- **Message Display**: Agent avatar, name, persona, message content
- **Round Separators**: Visual markers between conversation rounds
- **Typing Indicators**: Per-agent animated indicators during generation
- **Judge Bot Button**: Floating action button (bottom-right) when conversation complete

#### Analysis Drawer
- **Trigger**: Judge Bot floating button
- **Content**: Quick verdict, collapsible nerd stats, full analysis
- **Access Control**: Logged-in users only; guests see sign-in prompt

### Navigation Flow

```mermaid
graph LR
    A[Landing Page] -->|Submit Prompt| B[Create Chat Record]
    B -->|Immediate Navigate| C[/chat/:id]
    C -->|Load Chat View| D[Subscribe to Realtime]
    C -->|Load Chat View| E[Trigger Conversation Generation]
    E -->|Messages Stream| D
    D -->|Display Messages| F[Chat Interface]
    
    F -->|Click Sidebar Chat| G[/chat/:otherId]
    F -->|Click New Chat| A
    F -->|Click Profile| H[/profile]
    F -->|Click Agent Profiles| I[/agent-profiles]
    F -->|Click API Settings| J[/api-settings]
    F -->|Click Settings| K[/settings]
```

---

## Project 2: Agent Workflow Builder

### Overview

A visual workflow automation tool inspired by n8n, featuring drag-and-drop node-based logic, data flow visualization, and execution engine. Users build workflows by connecting specialized nodes (triggers, actions, logic, AI) on a canvas.

**Routes**: `/labs/workflow-builder`

### Planned Features

#### Node Categories

1. **Trigger Nodes**
   - Manual Trigger
   - Webhook
   - Schedule
   - Database Event

2. **Action Nodes**
   - HTTP Request (GET, POST, PUT, DELETE)
   - Database Operation (CRUD)
   - Send Email
   - File Operations

3. **Logic Nodes**
   - If/Else Conditional
   - Switch (multiple conditions)
   - Filter (array filtering)
   - Set (variable assignment)
   - Merge (combine data)

4. **Utility Nodes**
   - Code (JavaScript execution)
   - Transform (data mapping)
   - Delay
   - Error Handler

5. **AI Nodes**
   - AI Agent (conversational AI)
   - AI Model (completion)
   - AI Memory (context persistence)
   - Prompt Template

#### Core Features

- **Visual Designer**: ReactFlow-based canvas with zoom, pan, minimap
- **Drag & Drop**: Node palette → canvas
- **Visual Connections**: Connect node output → input handles
- **Node Configuration**: Tabbed interface for parameters, credentials, test data
- **Conditional Branching**: If/Switch nodes with multiple output paths
- **Execution**: Run workflows, visualize data flow, track execution state
- **Real-Time Visualization**: See data moving through nodes during execution
- **Credentials Manager**: Securely store API keys, tokens, connection strings
- **Save/Load/Export**: Persist workflows, share JSON definitions

### Technical Architecture

- **Canvas**: `@xyflow/react` (ReactFlow)
- **State Management**: React Context + useReducer
- **Node System**: Modular components, each node = dedicated React component
- **Execution Engine**: Topological sort → execute nodes in dependency order
- **Data Flow**: Pass output from node N as input to node N+1

---

## Project 3: AI Research Assistant (Planned)

### Overview

An intelligent research assistant that helps users gather, analyze, and synthesize information from multiple sources. Combines document analysis, web search, and AI summarization.

**Routes**: `/labs/research-assistant` (planned)

### Planned Features

- **Multi-Source Gathering**: Upload documents, scrape web pages, API integrations
- **Document Analysis**: PDF parsing, text extraction, OCR
- **AI Summarization**: Generate summaries, key points, insights
- **Citation Management**: Track sources, generate citations
- **Export**: Markdown, PDF, Word documents
- **RAG (Retrieval Augmented Generation)**: Vector embeddings, semantic search

---

## Shared Infrastructure

### Technology Stack

**Frontend**:
- React 18.3 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui components
- Radix UI primitives
- Lucide React (icons)
- React Query (server state)
- React Context (client state)
- React Router DOM (routing)

**Backend**:
- Supabase (via Lovable Cloud)
  - PostgreSQL database
  - Authentication (email/password, OAuth)
  - Edge Functions (Deno runtime)
  - Realtime subscriptions
- OpenRouter API (AI model access)

**Key Dependencies**:
- `@tanstack/react-query`: Server state, caching, mutations
- `@xyflow/react`: Workflow canvas (Project 2)
- `react-router-dom`: Client-side routing
- `@supabase/supabase-js`: Backend SDK
- `recharts`: Data visualization (analytics)

### Design System

- **Colors**: HSL semantic tokens defined in `index.css` and `tailwind.config.ts`
- **Components**: shadcn/ui (customizable Radix primitives)
- **Typography**: System font stack with display font accents
- **Theme**: Dark/light mode support via `next-themes`
- **Animations**: Tailwind CSS animations, framer-motion (future)

### Authentication Flow

```mermaid
graph TD
    A[User Visits App] --> B{Authenticated?}
    B -->|No| C[Guest Mode]
    B -->|Yes| D[Full Access]
    
    C --> E[Limited Features]
    C --> F[3 Free Credits]
    C --> G[Session-Only Storage]
    C --> H[Minimal UI]
    
    D --> I[All Features]
    D --> J[10 Credits]
    D --> K[Database Storage]
    D --> L[Full Navigation]
    
    E --> M{Action Requires Auth?}
    M -->|Yes| N[Show Sign-In Prompt]
    M -->|No| O[Continue]
    
    N --> P[User Signs Up/In]
    P --> D
```

---

## Success Metrics

### AI Agents Meetup

- **Engagement**: Number of multi-agent conversations generated
- **User Growth**: Guest → logged-in conversion rate
- **Monetization**: BYOK adoption rate, credit purchases (future)
- **Retention**: Returning users, chat history usage
- **Feature Adoption**: Analysis feature usage, custom agent profiles (future)

### Workflow Builder

- **Adoption**: Number of workflows created
- **Complexity**: Average nodes per workflow
- **Execution**: Successful workflow runs
- **Sharing**: Workflow templates shared

---

## Roadmap

### ✅ Completed (Agents Meetup)

- [x] Multi-agent conversation system
- [x] OpenRouter API integration with shared key
- [x] Real-time message streaming (Supabase Realtime)
- [x] Credit system (guest + logged-in)
- [x] Database-driven agent personas
- [x] Judge Bot conversation analyzer
- [x] Chat history with real-time updates
- [x] BYOK (Bring Your Own Key) with authentication requirement
- [x] Three core conversation scenarios
- [x] Grok-style UI with immersive chat experience

### 🚧 In Progress

- [ ] Workflow Builder (node system, canvas, execution engine)
- [ ] Custom agent profiles (user-created personas)
- [ ] Agent profile editing interface

### 📋 Planned

- [ ] **Swarm Builder** - Interactive agent team configuration tool with 8 specialized agent types, architecture selection, and direct launch to pre-configured conversations
- [ ] Agent Marketplace (premium profiles, user-created profiles)
- [ ] Stripe integration (credit purchases)
- [ ] AI Research Assistant (new project)
- [ ] Conversation branching (edit message, regenerate from point)
- [ ] Export conversations (PDF, Markdown, JSON)
- [ ] Random agent turn-taking mode (alternative to sequential A→B→C)
- [x] User Participation Mode (join multi-agent conversations as active participant)
- [ ] Workflow templates and sharing
- [ ] Team workspaces and collaboration
- [ ] Analytics dashboard

---

## Appendix

### Key Files

**Agents Meetup**:
- Routes: `src/pages/labs/projects/agents-meetup/index.tsx`
- Layout: `src/pages/labs/projects/agents-meetup/layout/`
- Views: `src/pages/labs/projects/agents-meetup/views/`
- Hooks: `src/pages/labs/projects/agents-meetup/hooks/`
- Types: `src/pages/labs/projects/agents-meetup/types.ts`
- Edge Function: `supabase/functions/openrouter-chat/index.ts`

**Workflow Builder**:
- Routes: `src/pages/labs/projects/workflow-builder/index.tsx`
- Components: `src/pages/labs/projects/workflow-builder/components/`
- Node Definitions: `src/pages/labs/projects/workflow-builder/constants/nodeDefinitions.ts`

**Shared**:
- Supabase Client: `src/integrations/supabase/client.ts`
- Database Types: `src/integrations/supabase/types.ts`
- OpenRouter Utils: `src/utils/openRouter/`

### Environment Variables

```bash
VITE_SUPABASE_URL=<auto-configured>
VITE_SUPABASE_PUBLISHABLE_KEY=<auto-configured>
VITE_SUPABASE_PROJECT_ID=<auto-configured>
```

**Note**: `.env` file is auto-generated and should never be edited manually.

---

**Last Updated**: 2025-12-29
**Version**: 1.0
**Status**: Living Document
