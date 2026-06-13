require('dotenv').config();

const express = require('express');
const { startBot } = require('./telegram');

const REQUIRED_ENV_VARS = ['TELEGRAM_BOT_TOKEN', 'ANTHROPIC_API_KEY', 'SUPABASE_URL', 'SUPABASE_ANON_KEY'];

function checkEnv() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Copy .env.example to .env and fill in the values before starting LYRA.');
    process.exit(1);
  }
}

async function main() {
  checkEnv();
  await startBot();

  // Minimal HTTP server so platforms like Railway have a port to health-check.
  const app = express();
  const port = process.env.PORT || 3000;

  app.get('/', (req, res) => {
    res.json({ status: 'online', service: 'LYRA' });
  });

  app.listen(port, () => {
    console.log(`[index] health check server listening on port ${port}`);
  });
}

main();
