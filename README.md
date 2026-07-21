# Career Win

AI-powered interview preparation — no account required. Schedule a practice slot, choose an interviewer voice, complete a real-time voice interview, and get scored feedback with a transcript.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Guest browser cookie (no login)
- Supabase Postgres
- OpenAI Realtime API (WebRTC voice)
- Vercel AI SDK (`generateObject` for scoring)

## Setup

1. Copy env template and fill in keys:

```bash
cp .env.example .env.local
```

2. Supabase — this app uses **Group-Of-recruiters** (`jwgjsotzauhwkgobywdr`). The `interview_sessions` table should already exist. Set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (from Project Settings → API)

3. Add OpenAI (Realtime) and optionally AI Gateway for scoring:
   - `OPENAI_API_KEY`
   - `AI_GATEWAY_API_KEY` (optional)

4. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Product flow

1. Schedule date/time + interviewer gender + target role
2. Join from the dashboard (opens 5 minutes early)
3. Speak with the AI interviewer in real time
4. End session → score, feedback, and transcript saved
