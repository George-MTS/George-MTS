-- LYRA memory layer schema.
-- Run this in the Supabase SQL editor (or via the Supabase CLI) for your project.

-- Every exchange LYRA has, including which agent answered and how urgent it was.
create table if not exists interactions (
  id bigint generated always as identity primary key,
  "timestamp" timestamptz not null default now(),
  user_message text not null,
  lyra_response text not null,
  agent_used text not null,
  urgency text not null default 'low' check (urgency in ('low', 'medium', 'high'))
);

create index if not exists interactions_timestamp_idx on interactions ("timestamp" desc);

-- K3's persistent context as simple key/value pairs (e.g. "current_priorities", "open_deals").
create table if not exists memory_core (
  id bigint generated always as identity primary key,
  key text not null unique,
  value jsonb not null,
  last_updated timestamptz not null default now()
);

-- Tasks LYRA or her sub-agents create on K3's behalf.
create table if not exists tasks (
  id bigint generated always as identity primary key,
  title text not null,
  domain text not null,
  due_date date,
  status text not null default 'open' check (status in ('open', 'in_progress', 'done', 'cancelled')),
  created_at timestamptz not null default now()
);

create index if not exists tasks_domain_idx on tasks (domain);
create index if not exists tasks_status_idx on tasks (status);

-- Time-sensitive flags raised by LYRA or her sub-agents.
create table if not exists alerts (
  id bigint generated always as identity primary key,
  domain text not null,
  message text not null,
  triggered_at timestamptz not null default now(),
  acknowledged boolean not null default false
);

create index if not exists alerts_acknowledged_idx on alerts (acknowledged);
