const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODEL = process.env.CLAUDE_MODEL || 'claude-sonnet-4-6';

const OUTPUT_CONTRACT = `
Respond with ONLY a JSON object (no markdown fences, no commentary) of the form:
{
  "answer": "<your reply to K3, in your domain voice>",
  "suggested_action": "<a concrete next step or decision point for K3>",
  "urgency_level": "low" | "medium" | "high"
}
`;

/**
 * Shared call path for every domain agent. Each agent supplies its own
 * system prompt (identity + domain knowledge); this wraps that prompt with
 * the structured-output contract LYRA's router expects back.
 */
async function runAgent({ agentName, systemPrompt, query, history = [] }) {
  try {
    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: `${systemPrompt}\n${OUTPUT_CONTRACT}`,
      messages: [...history, { role: 'user', content: query }],
    });

    const raw = response.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    return parseAgentOutput(raw, agentName);
  } catch (err) {
    console.error(`[${agentName}] agent call failed:`, err.message);
    return {
      answer: `${agentName} is unavailable right now (${err.message}). I'll handle this directly until it's back.`,
      suggested_action: 'Retry once the underlying API call succeeds.',
      urgency_level: 'medium',
    };
  }
}

/**
 * Claude is instructed to return raw JSON, but defensively strips fences
 * and falls back to treating the whole reply as the answer if parsing fails.
 */
function parseAgentOutput(raw, agentName) {
  const cleaned = raw.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return {
      answer: parsed.answer ?? cleaned,
      suggested_action: parsed.suggested_action ?? 'None specified.',
      urgency_level: ['low', 'medium', 'high'].includes(parsed.urgency_level)
        ? parsed.urgency_level
        : 'low',
    };
  } catch (err) {
    console.error(`[${agentName}] failed to parse structured output:`, err.message);
    return {
      answer: cleaned,
      suggested_action: 'None specified.',
      urgency_level: 'low',
    };
  }
}

module.exports = { runAgent, MODEL };
