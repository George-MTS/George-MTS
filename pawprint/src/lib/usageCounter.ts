import { readFileSync, writeFileSync, existsSync } from 'fs';

const COUNTER_FILE = '/tmp/pawprint-usage.json';
const DAILY_LIMIT = 50;

interface UsageData {
  date: string;
  count: number;
}

function today(): string {
  return new Date().toISOString().split('T')[0];
}

function read(): UsageData {
  if (!existsSync(COUNTER_FILE)) return { date: today(), count: 0 };
  try {
    return JSON.parse(readFileSync(COUNTER_FILE, 'utf-8')) as UsageData;
  } catch {
    return { date: today(), count: 0 };
  }
}

function write(data: UsageData): void {
  writeFileSync(COUNTER_FILE, JSON.stringify(data), 'utf-8');
}

export function checkAndIncrement(): { allowed: boolean; count: number; limit: number } {
  const t = today();
  const data = read();
  if (data.date !== t) { data.date = t; data.count = 0; }
  if (data.count >= DAILY_LIMIT) return { allowed: false, count: data.count, limit: DAILY_LIMIT };
  data.count++;
  write(data);
  return { allowed: true, count: data.count, limit: DAILY_LIMIT };
}

export function getUsage(): { date: string; count: number; limit: number } {
  const t = today();
  const data = read();
  if (data.date !== t) return { date: t, count: 0, limit: DAILY_LIMIT };
  return { ...data, limit: DAILY_LIMIT };
}
