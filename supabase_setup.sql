-- ==========================================
-- PRD MASTER SETUP - ImpactPlay Golf Charity
-- ==========================================

-- 0. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 1. Create Profiles Table (extends Auth Users)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  stripe_customer_id text,
  subscription_status text default 'none', -- none, active, lapsed, admin
  charity_name text,
  contribution_percentage integer default 10,
  winnings_total numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create policies (safe idempotent checks)
do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Public profiles are viewable by everyone.' and tablename = 'profiles') then
    create policy "Public profiles are viewable by everyone." on profiles for select using (true);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert their own profile.' and tablename = 'profiles') then
    create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can update own profile.' and tablename = 'profiles') then
    create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
  end if;
end $$;

-- 2. Create Scores Table (Latest 5 Logic supported by index)
create table if not exists public.scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  score integer not null check (score >= 0 and score <= 45),
  date_played date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.scores enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where policyname = 'Users can select own scores.' and tablename = 'scores') then
    create policy "Users can select own scores." on scores for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can insert own scores.' and tablename = 'scores') then
    create policy "Users can insert own scores." on scores for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where policyname = 'Users can delete own scores.' and tablename = 'scores') then
    create policy "Users can delete own scores." on scores for delete using (auth.uid() = user_id);
  end if;
end $$;

-- 3. Create Charities Directory (Section 08)
create table if not exists public.charities (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  description text,
  image_url text,
  total_raised numeric default 0,
  subscriber_count integer default 0,
  featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.charities enable row level security;
create policy "Charities are viewable by everyone." on charities for select using (true);

-- 4. Create Draw Results History (Section 06 & 07)
create table if not exists public.draws (
  id uuid default uuid_generate_v4() primary key,
  draw_date date not null default current_date,
  winning_numbers integer[] not null, -- Array of 5 numbers
  prize_pool numeric default 0,
  status text default 'simulated', -- simulated, published
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.draws enable row level security;
create policy "Draw history viewable by everyone." on draws for select using (true);

-- 5. Create Winnings & Payouts (Section 07 & 09)
create table if not exists public.winnings (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  draw_id uuid references public.draws on delete cascade,
  amount numeric not null,
  match_count integer not null, -- 3, 4, or 5
  status text default 'pending', -- pending, verified, paid
  proof_url text, -- Storage path to screenshot
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.winnings enable row level security;
create policy "Users can view own winnings." on winnings for select using (auth.uid() = user_id);
create policy "Users can upload proof for winnings." on winnings for update using (auth.uid() = user_id);

-- 6. Seed Initial Data (Charities)
insert into public.charities (name, description, image_url, total_raised, subscriber_count, featured)
values 
('Green Earth Initiative', 'Restoring local golf courses and natural habitats.', 'https://images.pexels.com/photos/1103970/pexels-photo-1103970.jpeg', 12500, 420, true),
('Youth Sports Fund', 'Providing golf equipment to underprivileged kids.', 'https://images.pexels.com/photos/1036623/pexels-photo-1036623.jpeg', 8400, 310, false),
('Clean Water Access', 'Supporting water preservation projects globally.', 'https://images.pexels.com/photos/416528/pexels-photo-416528.jpeg', 24100, 580, false)
on conflict do nothing;
