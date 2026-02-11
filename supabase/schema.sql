-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users Profile Table (extends Supabase Auth)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Emotions/Categories Enum
create type emotion_type as enum ('political_red', 'economic_blue', 'environmental_green', 'lifestyle_yellow', 'tragic_gray');

-- Articles Table
create table public.articles (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  content text not null,
  summary text,
  original_url text,
  image_url text,
  keywords text[], -- Array of keywords
  emotion emotion_type not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  published boolean default false
);

-- User Interactions Table
create table public.interactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  article_id uuid references public.articles(id),
  interaction_type text check (interaction_type in ('view', 'like', 'share', 'mood_pulse')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mood Logs (for tracking user emotional balance)
create table public.mood_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id),
  current_mood text,
  recommended_color text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.interactions enable row level security;
alter table public.mood_logs enable row level security;

-- Policies (Basic examples)
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);
create policy "Users can insert their own profile." on public.profiles for insert with check (auth.uid() = id);
create policy "Update own profile." on public.profiles for update using (auth.uid() = id);

create policy "Articles are viewable by everyone." on public.articles for select using (true);

create policy "Users can view their own interactions." on public.interactions for select using (auth.uid() = user_id);
create policy "Users can insert their own interactions." on public.interactions for insert with check (auth.uid() = user_id);
