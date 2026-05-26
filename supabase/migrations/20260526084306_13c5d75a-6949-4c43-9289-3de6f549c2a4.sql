
-- =========================================================
-- Helper: updated_at trigger
-- =========================================================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =========================================================
-- Profiles
-- =========================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  date_of_birth date,
  emergency_contact_name text,
  emergency_contact_phone text,
  allergies text,
  conditions text,
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can delete own profile"
  on public.profiles for delete
  to authenticated
  using (auth.uid() = id);

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.handle_updated_at();

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- =========================================================
-- Enums
-- =========================================================
create type public.reminder_kind as enum (
  'medication', 'water', 'movement', 'rest', 'nourish', 'checkin', 'appointment'
);

create type public.reminder_repeat as enum (
  'none', 'daily', 'weekdays', 'weekly'
);

-- =========================================================
-- Medicines
-- =========================================================
create table public.medicines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  dosage text,
  instructions text,
  color text,
  expires_on date,
  prescription_image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index medicines_user_id_idx on public.medicines(user_id);

alter table public.medicines enable row level security;

create policy "Users manage own medicines select"
  on public.medicines for select
  to authenticated using (auth.uid() = user_id);
create policy "Users manage own medicines insert"
  on public.medicines for insert
  to authenticated with check (auth.uid() = user_id);
create policy "Users manage own medicines update"
  on public.medicines for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own medicines delete"
  on public.medicines for delete
  to authenticated using (auth.uid() = user_id);

create trigger medicines_updated_at
before update on public.medicines
for each row execute function public.handle_updated_at();

-- =========================================================
-- Reminders
-- =========================================================
create table public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  detail text,
  kind public.reminder_kind not null default 'checkin',
  time_of_day time not null default '09:00',
  date_of_event date,                         -- for one-off (appointments)
  repeat public.reminder_repeat not null default 'daily',
  medicine_id uuid references public.medicines(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reminders_user_id_idx on public.reminders(user_id);

alter table public.reminders enable row level security;

create policy "Users manage own reminders select"
  on public.reminders for select
  to authenticated using (auth.uid() = user_id);
create policy "Users manage own reminders insert"
  on public.reminders for insert
  to authenticated with check (auth.uid() = user_id);
create policy "Users manage own reminders update"
  on public.reminders for update
  to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users manage own reminders delete"
  on public.reminders for delete
  to authenticated using (auth.uid() = user_id);

create trigger reminders_updated_at
before update on public.reminders
for each row execute function public.handle_updated_at();

-- =========================================================
-- Reminder logs (completions)
-- =========================================================
create table public.reminder_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_id uuid not null references public.reminders(id) on delete cascade,
  done_on date not null default (current_date),
  done_at timestamptz not null default now(),
  unique (reminder_id, done_on)
);

create index reminder_logs_user_day_idx on public.reminder_logs(user_id, done_on);

alter table public.reminder_logs enable row level security;

create policy "Users manage own logs select"
  on public.reminder_logs for select
  to authenticated using (auth.uid() = user_id);
create policy "Users manage own logs insert"
  on public.reminder_logs for insert
  to authenticated with check (auth.uid() = user_id);
create policy "Users manage own logs delete"
  on public.reminder_logs for delete
  to authenticated using (auth.uid() = user_id);
