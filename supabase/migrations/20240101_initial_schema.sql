-- Planets table
create table if not exists public.planets (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text not null,
  description text,
  diameter numeric not null,
  mass numeric not null,
  gravity numeric not null,
  distance_from_sun numeric not null,
  orbital_period numeric not null,
  rotation_period numeric not null,
  temperature numeric,
  atmosphere text,
  image_url text,
  texture_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.planets enable row level security;
create policy "Public read access to planets" on public.planets for select using (true);

-- Missions table
create table if not exists public.missions (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  agency text not null,
  target text not null,
  launch_date date,
  status text not null default 'active',
  description text,
  image_url text,
  source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.missions enable row level security;
create policy "Public read access to missions" on public.missions for select using (true);

-- Celestial events table
create table if not exists public.celestial_events (
  id uuid default gen_random_uuid() primary key,
  event_type text not null,
  title text not null,
  description text,
  event_date timestamp with time zone not null,
  visibility text,
  source_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.celestial_events enable row level security;
create policy "Public read access to celestial_events" on public.celestial_events for select using (true);

-- User favorites table
create table if not exists public.user_favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  object_type text not null,
  object_id uuid not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, object_type, object_id)
);
alter table public.user_favorites enable row level security;
create policy "Users manage own favorites" on public.user_favorites for all using (auth.uid() = user_id);

-- AI conversations table
create table if not exists public.ai_conversations (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  question text not null,
  answer text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.ai_conversations enable row level security;
create policy "Users manage own conversations" on public.ai_conversations for all using (auth.uid() = user_id);