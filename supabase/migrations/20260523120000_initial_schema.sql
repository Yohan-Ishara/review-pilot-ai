create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  created_at timestamp with time zone default now()
);

create table if not exists public.business_locations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  address text,
  google_location_id text,
  created_at timestamp with time zone default now()
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  location_id uuid references public.business_locations(id) on delete cascade,
  google_review_id text,
  reviewer_name text,
  rating int check (rating between 1 and 5),
  comment text,
  review_date timestamp with time zone,
  ai_reply text,
  final_reply text,
  status text default 'new' check (status in ('new', 'draft', 'replied')),
  sentiment text,
  created_at timestamp with time zone default now()
);

create table if not exists public.reply_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  tone text,
  template text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;
alter table public.business_locations enable row level security;
alter table public.reviews enable row level security;
alter table public.reply_templates enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Users can delete own profile" on public.profiles;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  using (auth.uid() = id);

drop policy if exists "Users can read own locations" on public.business_locations;
drop policy if exists "Users can insert own locations" on public.business_locations;
drop policy if exists "Users can update own locations" on public.business_locations;
drop policy if exists "Users can delete own locations" on public.business_locations;

create policy "Users can read own locations"
  on public.business_locations for select
  using (auth.uid() = user_id);

create policy "Users can insert own locations"
  on public.business_locations for insert
  with check (auth.uid() = user_id);

create policy "Users can update own locations"
  on public.business_locations for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own locations"
  on public.business_locations for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own reviews" on public.reviews;
drop policy if exists "Users can insert own reviews" on public.reviews;
drop policy if exists "Users can update own reviews" on public.reviews;
drop policy if exists "Users can delete own reviews" on public.reviews;

create policy "Users can read own reviews"
  on public.reviews for select
  using (auth.uid() = user_id);

create policy "Users can insert own reviews"
  on public.reviews for insert
  with check (
    auth.uid() = user_id
    and (
      location_id is null
      or exists (
        select 1
        from public.business_locations
        where business_locations.id = reviews.location_id
          and business_locations.user_id = auth.uid()
      )
    )
  );

create policy "Users can update own reviews"
  on public.reviews for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and (
      location_id is null
      or exists (
        select 1
        from public.business_locations
        where business_locations.id = reviews.location_id
          and business_locations.user_id = auth.uid()
      )
    )
  );

create policy "Users can delete own reviews"
  on public.reviews for delete
  using (auth.uid() = user_id);

drop policy if exists "Users can read own templates" on public.reply_templates;
drop policy if exists "Users can insert own templates" on public.reply_templates;
drop policy if exists "Users can update own templates" on public.reply_templates;
drop policy if exists "Users can delete own templates" on public.reply_templates;

create policy "Users can read own templates"
  on public.reply_templates for select
  using (auth.uid() = user_id);

create policy "Users can insert own templates"
  on public.reply_templates for insert
  with check (auth.uid() = user_id);

create policy "Users can update own templates"
  on public.reply_templates for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own templates"
  on public.reply_templates for delete
  using (auth.uid() = user_id);

create index if not exists business_locations_user_id_idx on public.business_locations(user_id);
create index if not exists reviews_user_id_idx on public.reviews(user_id);
create index if not exists reviews_location_id_idx on public.reviews(location_id);
create index if not exists reply_templates_user_id_idx on public.reply_templates(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, company_name)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'company_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
