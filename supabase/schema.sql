create extension if not exists "pgcrypto";

create table if not exists public.managers (
  id uuid primary key default gen_random_uuid(),
  manager_name text not null unique,
  manager_email text,
  department text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  employee_name text not null,
  employee_email text unique,
  employee_external_id text,
  department text,
  manager_id uuid references public.managers(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists employees_external_id_key
  on public.employees(employee_external_id)
  where employee_external_id is not null;

create table if not exists public.trainual_completions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  completion_percentage numeric(5,2) not null,
  total_modules integer,
  completed_modules integer,
  remaining_modules integer,
  snapshot_date timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.imports (
  id uuid primary key default gen_random_uuid(),
  source_name text not null,
  import_type text not null,
  imported_at timestamptz not null default now(),
  row_count integer not null default 0,
  status text not null,
  notes text
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'viewer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns text
language sql
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

drop trigger if exists managers_updated_at on public.managers;
create trigger managers_updated_at before update on public.managers for each row execute function public.handle_updated_at();

drop trigger if exists employees_updated_at on public.employees;
create trigger employees_updated_at before update on public.employees for each row execute function public.handle_updated_at();

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles for each row execute function public.handle_updated_at();

alter table public.managers enable row level security;
alter table public.employees enable row level security;
alter table public.trainual_completions enable row level security;
alter table public.imports enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "Authenticated users can read managers" on public.managers;
drop policy if exists "Admins can manage managers" on public.managers;
drop policy if exists "Authenticated users can read employees" on public.employees;
drop policy if exists "Admins can manage employees" on public.employees;
drop policy if exists "Authenticated users can read completions" on public.trainual_completions;
drop policy if exists "Admins can manage completions" on public.trainual_completions;
drop policy if exists "Authenticated users can read imports" on public.imports;
drop policy if exists "Admins can manage imports" on public.imports;
drop policy if exists "Users can read their own profile" on public.profiles;
drop policy if exists "Admins can manage profiles" on public.profiles;

create policy "Authenticated users can read managers" on public.managers for select to authenticated using (true);
create policy "Admins can manage managers" on public.managers for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "Authenticated users can read employees" on public.employees for select to authenticated using (true);
create policy "Admins can manage employees" on public.employees for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "Authenticated users can read completions" on public.trainual_completions for select to authenticated using (true);
create policy "Admins can manage completions" on public.trainual_completions for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "Authenticated users can read imports" on public.imports for select to authenticated using (true);
create policy "Admins can manage imports" on public.imports for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');

create policy "Users can read their own profile" on public.profiles for select to authenticated using (auth.uid() = id);
create policy "Admins can manage profiles" on public.profiles for all to authenticated using (public.current_user_role() = 'admin') with check (public.current_user_role() = 'admin');
