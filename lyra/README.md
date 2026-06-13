# LYRA — Layered Yield & Resource Administrator

LYRA is K3's personal AI chief of staff. She lives on Telegram (text and
voice), is powered by the Claude API, routes questions to domain-specific
sub-agents (HAVI, KYAWOL, SDG, NEXUS, GEORGE), and keeps a running memory of
every exchange in Supabase.

## Prerequisites

- Node.js 18 or later
- A Telegram bot token from [@BotFather](https://t.me/BotFather)
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)
- (Optional, for voice notes) An [OpenAI API key](https://platform.openai.com) for Whisper transcription

## Setup

1. **Install dependencies**

   ```bash
   cd lyra
   npm install
   ```

2. **Create your Telegram bot**

   - Message [@BotFather](https://t.me/BotFather) on Telegram.
   - Run `/newbot` and follow the prompts.
   - Copy the bot token it gives you.

3. **Set up Supabase**

   - Create a new project at [supabase.com](https://supabase.com).
   - Open the SQL editor and run `supabase/migrations/001_init_schema.sql`.
     This creates the `interactions`, `memory_core`, `tasks`, and `alerts` tables.
   - Copy your project URL and `anon` key from Project Settings → API.

4. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Fill in:

   | Variable | Description |
   | --- | --- |
   | `TELEGRAM_BOT_TOKEN` | From BotFather |
   | `ANTHROPIC_API_KEY` | From the Anthropic console |
   | `CLAUDE_MODEL` | Optional, defaults to `claude-sonnet-4-6` |
   | `SUPABASE_URL` | Your Supabase project URL |
   | `SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `OPENAI_API_KEY` | Optional, enables Whisper transcription for voice notes |
   | `ELEVENLABS_API_KEY` | Phase 2 — leave blank for now |
   | `PORT` | Defaults to `3000` |

## Running locally

```bash
npm start
```

LYRA will:

- Start polling Telegram for new messages.
- Start a tiny Express server (for health checks) on `PORT`.

Message your bot on Telegram with text or a voice note. LYRA will route the
message to the right sub-agent (or answer directly), log the exchange to
Supabase, and reply.

### Routing logic

| Trigger keywords | Agent | Domain |
| --- | --- | --- |
| farm, harvest, avocado, mango, crop, soil, Machakos, Makueni | **HAVI** | Havi Investments farm ops |
| buyer, shipment, Dubai, freight, GACC, export, invoice, Kibsons, NRTC | **KYAWOL** | Kyawol Trading export corridor |
| Konza, lick block, CARE, carbon, JCM, SDG, cattle, methane | **SDG** | AgCotech / Konza carbon credits |
| MTS, Syntra, AgentHQ, pipeline, proposal, client, Msaidizi, JTL | **NEXUS** | MTS + Syntra BD |
| job, GAA, KenTrade, NSE, KPLC, calendar, task, personal | **GEORGE** | Personal OS |
| (none of the above) | **LYRA** | Handles directly with full context |

## Deploying to Railway

1. Push this repo to GitHub (if not already there).
2. In Railway, create a new project from the repo and set the root directory to `lyra/`.
3. Add all variables from `.env.example` as Railway environment variables.
4. Railway will run `npm install` then `npm start` automatically.
5. Once deployed, LYRA starts polling Telegram immediately — no webhook setup needed.

## Phase 2 roadmap

- **Voice replies via ElevenLabs**: once `ELEVENLABS_API_KEY` is set, LYRA will
  synthesize her text replies as voice notes and send them back over Telegram
  in addition to (or instead of) text.
- **Proactive alerts**: surface unacknowledged rows from the `alerts` table
  as push messages rather than waiting for K3 to ask.
- **Task management commands**: let K3 create/update rows in `tasks` directly
  from chat (e.g. "remind me to call Calvin Friday").
