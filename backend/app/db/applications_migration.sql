create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  service_name text not null check (char_length(trim(service_name)) between 1 and 120),
  status text not null default 'in_progress' check (status in ('in_progress', 'under_process', 'resolved')),
  documents jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

drop trigger if exists set_applications_updated_at on public.applications;
create trigger set_applications_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

alter table public.applications enable row level security;

drop policy if exists "Users can read their own applications" on public.applications;
create policy "Users can read their own applications"
on public.applications
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own applications" on public.applications;
create policy "Users can create their own applications"
on public.applications
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own applications" on public.applications;
create policy "Users can update their own applications"
on public.applications
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
