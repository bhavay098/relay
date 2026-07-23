# Relay

Relay is an AI-powered productivity workspace that connects Gmail and Google
Calendar into one focused inbox-and-schedule assistant. It combines a live
view of your recent mail and upcoming events with a chat-based agent that can
draft emails, create or update calendar events, and carry out those actions
on your behalf — after you review and approve them.

## Features

- **Unified dashboard** — a "Brief" view with live previews of your inbox
  and calendar, plus quick actions and connection status for each service.
- **Gmail integration** — list, read, and send email, with a two-pane
  desktop inbox and a mobile-friendly reading view.
- **Google Calendar integration** — a week-view calendar with event
  creation, editing, deletion, and RSVP responses.
- **AI chat agent** — ask Relay to summarize your inbox, draft a reply, or
  move a meeting. The agent proposes an action (an email draft or a
  calendar change) and waits for your explicit confirmation before sending
  anything or touching your calendar.
- **Conversation history** — chats are saved, renameable, and can be
  revisited from a sidebar, similar to a typical AI chat product.
- **Multi-tenant OAuth** — each signed-in user gets their own isolated
  Gmail/Calendar connection, provisioned automatically on sign-up.

## Tech stack

| Layer              | Choice                                                           |
| ------------------ | ---------------------------------------------------------------- |
| Framework          | [Next.js 16](https://nextjs.org) (App Router), React 19          |
| Styling            | Tailwind CSS v4                                                  |
| Auth               | [Clerk](https://clerk.com)                                       |
| Database           | PostgreSQL + [Drizzle ORM](https://orm.drizzle.team)             |
| OAuth / connectors | [Corsair](https://corsair.dev) (Gmail + Google Calendar plugins) |
| AI                 | OpenAI                                                           |

## Project structure

```
src/
├── app/
│   ├── (app)/                 # authenticated app shell
│   │   ├── dashboard/          # the "Brief" home page
│   │   ├── emails/             # Gmail inbox UI
│   │   ├── calendar/           # week-view calendar UI
│   │   ├── ai-chat/            # chat agent UI
│   │   └── components/         # shared app-shell components (sidebar, topbar)
│   ├── api/                    # route handlers
│   │   ├── ai/                  # chat + streaming + tool-call handling
│   │   ├── auth/[plugin]/       # OAuth connect/callback for Gmail & Calendar
│   │   ├── gmail/, calendar/    # CRUD + refresh endpoints
│   │   ├── conversations/       # chat history CRUD
│   │   ├── webhooks/clerk/      # Clerk signup webhook (auto-provisions a tenant)
│   │   └── webhook/              # Google push-notification receiver (Gmail & Calendar)
│   ├── components/             # shared components (landing page, auth, theme)
│   └── page.jsx                 # marketing / landing page
├── server/
│   ├── corsair.js               # Corsair client + plugin configuration
│   ├── db/                      # Drizzle schema and client
│   ├── services/                # chat, Gmail, and user service logic
│   └── getAuthUserId.js          # shared Clerk auth helper for API routes
└── globals.css                   # design tokens and shared styles
```

Most pages follow the same pattern: a slim `page.jsx` that owns state and
data-fetching, a local `components/` folder for page-specific UI, and a
local `lib/` folder for pure helper functions.

## Getting started

### 1. Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io)
- Docker (for local Postgres), or your own Postgres instance
- A [Clerk](https://clerk.com) application
- Google Cloud OAuth credentials with the Gmail API and Google Calendar API
  enabled (two separate OAuth client IDs, one per product)
- An [OpenAI](https://platform.openai.com) API key

### 2. Install dependencies

```bash
pnpm install
```

### 3. Start Postgres

```bash
docker compose up -d
```

This starts a local Postgres 17 instance on `localhost:5432` (see
`docker-compose.yml` for credentials). Point `DATABASE_URL` at it, or use
your own Postgres instance instead.

### 4. Configure environment variables

Copy `.env.example` to `.env` and fill in your secrets

### 5. Run database migrations

```bash
pnpm db:migrate
```

### 6. Start the dev server

```bash
pnpm dev
```

## Available scripts

| Command            | Description                                          |
| ------------------ | ---------------------------------------------------- |
| `pnpm dev`         | Start the Next.js dev server                         |
| `pnpm build`       | Production build                                     |
| `pnpm start`       | Run the production build                             |
| `pnpm lint`        | Run ESLint                                           |
| `pnpm db:generate` | Generate a new Drizzle migration from schema changes |
| `pnpm db:migrate`  | Apply migrations to the database                     |
| `pnpm studio`      | Open Drizzle Studio to browse the database           |

## How the pieces fit together

- **Auth**: Clerk handles sign-up/sign-in. A Clerk webhook
  (`api/webhooks/clerk`) automatically provisions a Corsair tenant for each
  new user.

- **OAuth connectors**: Corsair manages the Gmail and Google Calendar OAuth
  flows and stores encrypted tokens per tenant. `api/auth/[plugin]/connect`
  kicks off the flow; `api/auth/[plugin]/callback` completes it.

- **Data caching**: Gmail and Calendar data is synced into local Postgres
  tables via `refresh` endpoints, so the inbox and calendar pages read from
  a fast local cache rather than calling Google's APIs on every page load.
  
- **AI agent**: `api/ai` streams responses from OpenAI over Server-Sent
  Events. When the agent decides to send an email or change a calendar
  event, it returns a structured draft instead of acting immediately — the
  UI shows this as a review card, and the action only executes once the
  user clicks confirm.
