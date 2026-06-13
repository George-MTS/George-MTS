const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

/**
 * Persist a single exchange so LYRA can recall it later and K3 can audit
 * what was said, by whom (which agent), and how urgent it was.
 */
async function logInteraction({ userMessage, lyraResponse, agentUsed, urgency }) {
  try {
    const { error } = await supabase.from('interactions').insert({
      user_message: userMessage,
      lyra_response: lyraResponse,
      agent_used: agentUsed,
      urgency,
    });
    if (error) throw error;
  } catch (err) {
    console.error('[memory] failed to log interaction:', err.message);
  }
}

/**
 * Pull the last `limit` exchanges, oldest first, formatted as Claude
 * message turns so they can be dropped straight into a conversation.
 */
async function getRecentHistory(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('interactions')
      .select('user_message, lyra_response, timestamp')
      .order('timestamp', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || [])
      .reverse()
      .flatMap((row) => [
        { role: 'user', content: row.user_message },
        { role: 'assistant', content: row.lyra_response },
      ]);
  } catch (err) {
    console.error('[memory] failed to load history:', err.message);
    return [];
  }
}

/**
 * memory_core holds durable facts about K3 and his businesses (a running
 * key/value store) so LYRA does not need to re-derive context every time.
 */
async function getMemoryCore(key) {
  try {
    const { data, error } = await supabase
      .from('memory_core')
      .select('value')
      .eq('key', key)
      .maybeSingle();

    if (error) throw error;
    return data ? data.value : null;
  } catch (err) {
    console.error('[memory] failed to read memory_core:', err.message);
    return null;
  }
}

async function setMemoryCore(key, value) {
  try {
    const { error } = await supabase
      .from('memory_core')
      .upsert({ key, value, last_updated: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
  } catch (err) {
    console.error('[memory] failed to write memory_core:', err.message);
  }
}

/**
 * Fetch every memory_core row as a single object, used to inject K3's
 * persistent context into LYRA's system prompt.
 */
async function getAllMemoryCore() {
  try {
    const { data, error } = await supabase.from('memory_core').select('key, value');
    if (error) throw error;
    return Object.fromEntries((data || []).map((row) => [row.key, row.value]));
  } catch (err) {
    console.error('[memory] failed to read memory_core table:', err.message);
    return {};
  }
}

async function createTask({ title, domain, dueDate = null, status = 'open' }) {
  try {
    const { error } = await supabase.from('tasks').insert({
      title,
      domain,
      due_date: dueDate,
      status,
    });
    if (error) throw error;
  } catch (err) {
    console.error('[memory] failed to create task:', err.message);
  }
}

async function createAlert({ domain, message }) {
  try {
    const { error } = await supabase.from('alerts').insert({
      domain,
      message,
    });
    if (error) throw error;
  } catch (err) {
    console.error('[memory] failed to create alert:', err.message);
  }
}

module.exports = {
  logInteraction,
  getRecentHistory,
  getMemoryCore,
  setMemoryCore,
  getAllMemoryCore,
  createTask,
  createAlert,
};
