const fs = require('fs');
const os = require('os');
const path = require('path');
const axios = require('axios');
const OpenAI = require('openai');
const lyra = require('./lyra');

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

/**
 * Download a Telegram voice note and transcribe it with OpenAI's Whisper
 * API. Returns null (and lets the caller fall back gracefully) if no
 * OpenAI key is configured or transcription fails.
 */
async function transcribeVoice(bot, fileId) {
  if (!openai) {
    console.warn('[telegram] OPENAI_API_KEY not set — cannot transcribe voice notes.');
    return null;
  }

  const fileUrl = await bot.getFileLink(fileId);
  const tmpPath = path.join(os.tmpdir(), `lyra-voice-${Date.now()}.ogg`);

  try {
    const response = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    fs.writeFileSync(tmpPath, response.data);

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpPath),
      model: 'whisper-1',
    });

    return transcription.text;
  } catch (err) {
    console.error('[telegram] voice transcription failed:', err.message);
    return null;
  } finally {
    fs.unlink(tmpPath, () => {});
  }
}

async function startBot() {
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN is not set.');
  }

  // node-telegram-bot-api ships as an ESM-only package, so it must be
  // loaded with a dynamic import from this otherwise-CommonJS codebase.
  const { default: TelegramBot } = await import('node-telegram-bot-api');
  const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

  bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    try {
      let text = msg.text;

      if (!text && msg.voice) {
        bot.sendChatAction(chatId, 'typing');
        text = await transcribeVoice(bot, msg.voice.file_id);

        if (!text) {
          await bot.sendMessage(
            chatId,
            "I couldn't transcribe that voice note, K3. Send it as text or check the OPENAI_API_KEY config."
          );
          return;
        }
      }

      if (!text) {
        await bot.sendMessage(chatId, "I can only work with text or voice notes right now, K3.");
        return;
      }

      bot.sendChatAction(chatId, 'typing');
      const reply = await lyra.processMessage(text);
      await bot.sendMessage(chatId, reply);
    } catch (err) {
      console.error('[telegram] failed to handle message:', err.message);
      try {
        await bot.sendMessage(chatId, `Something went wrong on my end (${err.message}). Try again, K3.`);
      } catch (sendErr) {
        console.error('[telegram] failed to notify K3 of error:', sendErr.message);
      }
    }
  });

  bot.on('polling_error', (err) => {
    console.error('[telegram] polling error:', err.message);
  });

  console.log('[telegram] LYRA is online and listening.');
  return bot;
}

module.exports = { startBot };
