# Antigravity Internal Voice AI Builder

An internal, single-tenant workspace for designing, configuring, and testing Voice AI Agents using high-efficiency Small Language Models (SLMs).

## Features

- **Rich Prompt Editor**: Custom markdown editor with syntax highlighting, undo/redo history, and inline formatting.
- **Visual Configuration**: Real-time configuration of Voice settings, Transcriber settings, Call Timeouts, and Webhook Triggers.
- **SLM Integration**: Direct access to top open-weights SLMs via OpenRouter, eliminating the need to manage multiple API keys.
- **Local Persistence**: Agent configurations are saved locally via the backend to a simple JSON database.
- **Modern UI**: Built with a sleek dark-mode first design using Tailwind CSS v4, shadcn/ui, and Framer Motion.

## Supported SLMs

The builder currently supports the following efficient models via OpenRouter:
- **Phi-4** (`microsoft/phi-4`)
- **Gemma 2 9B** (`google/gemma-2-9b-it`)
- **Mistral 7B** (`mistralai/mistral-7b-instruct:free`)
- **Llama 3 8B** (`meta-llama/llama-3-8b-instruct:free`)

---

## Getting Started

This repository contains both the `frontend` (Next.js) and `backend` (Node.js/Express). You will need to run both concurrently.

### 1. Start the Backend

The backend proxies API requests to OpenRouter and persists your agent data.

```bash
cd backend
npm install
```

Configure your environment variables in `backend/.env`:
```env
PORT=3001
OPENROUTER_API_KEY="your_openrouter_api_key_here"
```

Start the backend development server:
```bash
npm run dev
```
*Runs on `http://localhost:3001`*

### 2. Start the Frontend

The frontend is the visual builder interface.

```bash
# Open a new terminal window
cd frontend
npm install
```

Start the frontend development server:
```bash
# Note: Ensure you are using a compatible Node.js version (v22+)
npm run dev
```
*Runs on `http://localhost:3000`*

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- React 19
- Tailwind CSS v4
- shadcn/ui
- Zustand (Global State)
- Framer Motion

### Backend
- Node.js
- Express
- TypeScript
- OpenAI Node SDK (for OpenRouter compatibility)
