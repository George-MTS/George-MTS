const Anthropic = require('@anthropic-ai/sdk');
const memory = require('./memory');
const havi = require('./agents/havi');
const kyawol = require('./agents/kyawol');
const sdg = require('./agents/sdg');
const nexus = require('./agents/nexus');
const george = require('./agents/george');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

const SYSTEM_PROMPT = `You are LYRA — Layered Yield & Resource Administrator.
You are the personal AI chief of staff for K3 (George Kamau Kyalo), a Nairobi-based entrepreneur running multiple businesses across technology and agricultural export.

IDENTITY:
- You are female. Your tone is composed, direct, and intelligent.
- You always address the user as K3. Never George, never Sir.
- You never use filler phrases. No "Great question!", no "Certainly!", no "Of course!".
- You lead with the answer. Context follows only if it matters.
- You end every response with a clear next action or decision point.

DOMAIN KNOWLEDGE:
- MTS (Magezi Tech Solutions): Co-founded with Calvin Magezi (CTO). Products: Inn-Keeper (Sarova Hotels), Praxis, Msaidizi (live at faiba-poc.vercel.app), AgentHQ. Active deal: Msaidizi commercial proposal for Jamii Telecom (JTL/Faiba), KES 4-6M upfront + retainer target.
- Syntra AI Infrastructure: AgentHQ flagship product — local-first multi-agent orchestration. K3 is Head of BD.
- Havi Investments (Kenya): Family agri-export business. Avocados, mangoes, cashews. Kenya to UAE corridor. Sourcing: Machakos and Makueni. Active: avocado oil processing (SIMEC Phase 1, ~$11,540 FOB Qingdao).
- Kyawol Trading LLC (Dubai): Fresh produce export entity. Verified buyers: NRTC, Green Roots (Shoaib Qureshi), Al Bakrawe, Kibsons, Unifrutti. HIGH RISK — do not engage Fresh Leaf.
- SDG AgCotech (Konza): Lick blocks reducing cattle methane. JV with AgCoTech Global Australia. CARE International financing (7.4/10 score). JCM and carbon LOA tracks running parallel.

KEY PEOPLE:
- Calvin Magezi: CTO/co-founder MTS. All technical architecture decisions defer to him.
- PS John Kipchumba Tanui: PS ICT & Digital Economy. Personal relationship via K3's father. Contact via WhatsApp only.
- K3's Father: Senior advisory role on major strategic and financial decisions.
- Evan Wang: SIMEC contact for avocado oil processing equipment.
- Shoaib Qureshi: Green Roots — verified Dubai buyer.

ROUTING LOGIC:
- Farm/harvest/input costs → HAVI agent
- Export/buyers/freight/GACC → KYAWOL agent
- Konza/carbon credits/CARE/JCM → SDG agent
- BD pipeline/proposals/MTS/Syntra → NEXUS agent
- Job search/NSE/calendar/personal → GEORGE agent

You are LYRA. K3 built you. Act accordingly.`;

// Keyword sets used by routeQuery() to decide which sub-agent owns a message.
// Order matters only in that the first matching domain wins.
const ROUTES = [
  {
    agent: havi,
    keywords: ['farm', 'harvest', 'avocado', 'mango', 'crop', 'soil', 'machakos', 'makueni'],
  },
  {
    agent: kyawol,
    keywords: ['buyer', 'shipment', 'dubai', 'freight', 'gacc', 'export', 'invoice', 'kibsons', 'nrtc'],
  },
  {
    agent: sdg,
    keywords: ['konza', 'lick block', 'care', 'carbon', 'jcm', 'sdg', 'cattle', 'methane'],
  },
  {
    agent: nexus,
    keywords: ['mts', 'syntra', 'agenthq', 'pipeline', 'proposal', 'client', 'msaidizi', 'jtl'],
  },
  {
    agent: george,
    keywords: ['job', 'gaa', 'kentrade', 'nse', 'kplc', 'calendar', 'task', 'personal'],
  },
];

/**
 * Decide which sub-agent should handle this message based on keyword
 * matches against the user's text. Returns null if LYRA should answer
 * directly (the "Default → LYRA handles directly" branch).
 */
function routeQuery(text) {
  const lower = text.toLowerCase();
  for (const route of ROUTES) {
    if (route.keywords.some((keyword) => lower.includes(keyword))) {
      return route.agent;
    }
  }
  return null;
}

/**
 * Have LYRA answer directly using her full system prompt and persistent
 * memory_core context. Used for the default routing branch and as a
 * fallback if a sub-agent call fails entirely.
 */
async function answerDirectly(userMessage, history) {
  const memoryCore = await memory.getAllMemoryCore();
  const memoryContext = Object.keys(memoryCore).length
    ? `\n\nPERSISTENT CONTEXT ABOUT K3:\n${JSON.stringify(memoryCore, null, 2)}`
    : '';

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: `${SYSTEM_PROMPT}${memoryContext}`,
    messages: [...history, { role: 'user', content: userMessage }],
  });

  return response.content
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('')
    .trim();
}

/**
 * Format a structured agent response ({answer, suggested_action,
 * urgency_level}) into the single text reply LYRA sends back over Telegram.
 */
function formatAgentReply(agentName, result) {
  const urgencyTag = result.urgency_level === 'high' ? ' [URGENT]' : '';
  return `[${agentName}]${urgencyTag} ${result.answer}\n\nNext: ${result.suggested_action}`;
}

/**
 * Main entry point: route the message, get a reply, log the exchange to
 * Supabase, and return the text LYRA should send back to K3.
 */
async function processMessage(userMessage) {
  const history = await memory.getRecentHistory();
  const agent = routeQuery(userMessage);

  let replyText;
  let agentUsed;
  let urgency = 'low';

  if (agent) {
    const result = await agent.handle(userMessage, history);
    replyText = formatAgentReply(agent.name, result);
    agentUsed = agent.name;
    urgency = result.urgency_level;
  } else {
    try {
      replyText = await answerDirectly(userMessage, history);
    } catch (err) {
      console.error('[lyra] direct response failed:', err.message);
      replyText = `I hit an error reaching Claude (${err.message}). Try again in a moment, K3.`;
      urgency = 'medium';
    }
    agentUsed = 'LYRA';
  }

  await memory.logInteraction({
    userMessage,
    lyraResponse: replyText,
    agentUsed,
    urgency,
  });

  return replyText;
}

module.exports = { processMessage, routeQuery, SYSTEM_PROMPT };
