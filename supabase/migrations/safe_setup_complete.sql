-- Enable UUID extension safely
create extension if not exists "uuid-ossp";

-- Create Enum safely
DO $$ BEGIN
    CREATE TYPE emotion_type AS ENUM ('political_red', 'economic_blue', 'environmental_green', 'lifestyle_yellow', 'tragic_gray');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add columns to profiles if they don't exist (from Phase 6)
alter table public.profiles add column if not exists subscription_status text default 'inactive';
alter table public.profiles add column if not exists subscription_plan text default 'free';
alter table public.profiles add column if not exists current_period_end timestamp with time zone;

-- 2. ARTICLES TABLE
create table if not exists public.articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  summary text,
  original_url text,
  image_url text,
  keywords text[],
  emotion emotion_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published boolean default false
);

-- 3. INTERACTIONS TABLE
create table if not exists public.interactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  article_id uuid references public.articles(id),
  interaction_type text check (interaction_type in ('view', 'like', 'share', 'mood_pulse')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add user_opinion column safely (Phase 8)
alter table public.interactions add column if not exists user_opinion text;
alter table public.interactions add column if not exists emotion_log text; -- Check if this exists from previous interactions

-- 4. MOOD LOGS TABLE
create table if not exists public.mood_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  current_mood text,
  recommended_color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. ORDERS TABLE (Phase 6)
create table if not exists public.orders (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid references public.profiles(id),
    order_id text not null,
    payment_key text,
    amount integer,
    status text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.interactions enable row level security;
alter table public.mood_logs enable row level security;
alter table public.orders enable row level security;

-- SAFE POLICIES (Drop first to avoid conflict, then Create)

-- Profiles
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Update own profile." on public.profiles;
create policy "Update own profile." on public.profiles for update using (auth.uid() = id);

-- Articles
drop policy if exists "Articles are viewable by everyone." on public.articles;
create policy "Articles are viewable by everyone." on public.articles for select using (true);

-- Interactions
drop policy if exists "Users can view their own interactions." on public.interactions;
create policy "Users can view their own interactions." on public.interactions for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own interactions." on public.interactions;
create policy "Users can insert their own interactions." on public.interactions for insert with check (auth.uid() = user_id);

-- Orders
drop policy if exists "Users can view their own orders." on public.orders;
create policy "Users can view their own orders." on public.orders for select using (auth.uid() = user_id);

drop policy if exists "Users can insert their own orders." on public.orders;
create policy "Users can insert their own orders." on public.orders for insert with check (auth.uid() = user_id);
