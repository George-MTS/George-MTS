# PawPrint — AI Pet Intelligence Platform

PawPrint is a web app where dog and cat owners upload a photo of their pet, fill in details (breed, age, name, traits), and receive an AI-powered breed analysis using Claude Vision. Every submission is saved to a Supabase database — building a labeled training dataset for future instant breed identification.

## What PawPrint Does

- **Phase 1 (Live):** Upload a pet photo + details → receive a full AI breed profile (temperament, care notes, traits, fun facts)
- **Phase 2 (Coming Soon):** Drop a photo with no manual input → instant breed ID powered by the dataset collected in Phase 1

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd pawprint
npm install
```

### 2. Fill in environment variables

Copy `.env.example` to `.env.local` and fill in all four values:

```bash
cp .env.example .env.local
```

```
NEXT_PUBLIC_SUPABASE_URL=        # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Your Supabase anon/public key
SUPABASE_SERVICE_ROLE_KEY=       # Your Supabase service role key (server-side only)
ANTHROPIC_API_KEY=               # Your Anthropic API key
```

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the contents of `supabase/schema.sql`
3. Go to **Storage** → **New Bucket** → name it `pet-photos` → set to **Public**
4. Copy your project URL and API keys into `.env.local`

## Deploy to Vercel

1. Push your code to GitHub
2. Import the repo at [vercel.com/new](https://vercel.com/new)
3. Add all four environment variables in the Vercel project settings
4. Deploy — Vercel auto-detects Next.js

## The Data Flywheel

```
Phase 1: Owners submit labeled photos
       ↓
We build a visual breed training dataset
       ↓
AI learns to identify breeds from images alone
       ↓
Phase 2: Instant ID — no forms needed
```

Every submission in Phase 1 directly improves the accuracy and speed of Phase 2 breed identification. The more pets submitted, the smarter the system gets.

## Tech Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS + inline styles
- **Database:** Supabase (Postgres)
- **AI:** Anthropic Claude (`claude-sonnet-4-20250514`) with vision
- **Image Storage:** Supabase Storage
- **Deployment:** Vercel
