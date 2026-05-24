create table if not exists public.google_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_account_email text,
  access_token_encrypted text,
  refresh_token_encrypted text,
  expires_at timestamp with time zone,
  scope text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

create table if not exists public.google_business_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  google_connection_id uuid references public.google_connections(id) on delete cascade,
  google_account_name text,
  google_account_id text,
  created_at timestamp with time zone default now()
);

create table if not exists public.google_oauth_states (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  state text not null unique,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default now()
);

alter table public.business_locations
  add column if not exists google_account_id text,
  add column if not exists google_location_id text,
  add column if not exists google_location_name text,
  add column if not exists google_connected boolean default false;

alter table public.google_connections enable row level security;
alter table public.google_business_accounts enable row level security;
alter table public.google_oauth_states enable row level security;

drop policy if exists "Users can read own google connections" on public.google_connections;
drop policy if exists "Users can insert own google connections" on public.google_connections;
drop policy if exists "Users can update own google connections" on public.google_connections;
drop policy if exists "Users can delete own google connections" on public.google_connections;

create policy "Users can read own google connections"
  on public.google_connections for select
  using (auth.uid() = user_id);

create policy "Users can insert own google connections"
  on public.google_connections for insert
  with check (auth.uid() = user_id);

create policy "Users can update own google connections"
  on public.google_connections for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own google connections"
  on public.google_connections for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own google business accounts" on public.google_business_accounts;
drop policy if exists "Users can insert own google business accounts" on public.google_business_accounts;
drop policy if exists "Users can update own google business accounts" on public.google_business_accounts;
drop policy if exists "Users can delete own google business accounts" on public.google_business_accounts;

create policy "Users can read own google business accounts"
  on public.google_business_accounts for select
  using (auth.uid() = user_id);

create policy "Users can insert own google business accounts"
  on public.google_business_accounts for insert
  with check (auth.uid() = user_id);

create policy "Users can update own google business accounts"
  on public.google_business_accounts for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own google business accounts"
  on public.google_business_accounts for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own google oauth states" on public.google_oauth_states;
drop policy if exists "Users can insert own google oauth states" on public.google_oauth_states;
drop policy if exists "Users can delete own google oauth states" on public.google_oauth_states;

create policy "Users can read own google oauth states"
  on public.google_oauth_states for select
  using (auth.uid() = user_id);

create policy "Users can insert own google oauth states"
  on public.google_oauth_states for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own google oauth states"
  on public.google_oauth_states for delete
  using (auth.uid() = user_id);

create index if not exists google_connections_user_id_idx on public.google_connections(user_id);
create unique index if not exists google_connections_user_id_unique_idx on public.google_connections(user_id);
create index if not exists google_business_accounts_user_id_idx on public.google_business_accounts(user_id);
create index if not exists google_business_accounts_connection_id_idx on public.google_business_accounts(google_connection_id);
create unique index if not exists google_business_accounts_user_account_unique_idx
  on public.google_business_accounts(user_id, google_account_id);
create index if not exists google_oauth_states_state_idx on public.google_oauth_states(state);
create index if not exists business_locations_google_location_id_idx on public.business_locations(google_location_id);
drop index if exists public.reviews_google_review_id_unique_idx;
create unique index if not exists reviews_user_google_review_id_unique_idx
  on public.reviews(user_id, google_review_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists google_connections_touch_updated_at on public.google_connections;
create trigger google_connections_touch_updated_at
  before update on public.google_connections
  for each row execute function public.touch_updated_at();
