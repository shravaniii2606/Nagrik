create extension if not exists pgcrypto;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  birth_date date,
  gender text check (gender is null or gender in ('Female', 'Male', 'Non-binary', 'Prefer not to say')),
  address text check (address is null or char_length(address) <= 240),
  city text check (city is null or char_length(city) <= 120),
  state text check (state is null or char_length(state) <= 120),
  pincode text check (pincode is null or pincode ~ '^[1-9][0-9]{5}$'),
  language_pref text not null default 'English' check (language_pref in ('English', 'Hindi', 'Marathi')),
  location text check (location is null or char_length(location) <= 160),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.users add column if not exists birth_date date;
alter table public.users add column if not exists gender text check (gender is null or gender in ('Female', 'Male', 'Non-binary', 'Prefer not to say'));
alter table public.users add column if not exists address text check (address is null or char_length(address) <= 240);
alter table public.users add column if not exists city text check (city is null or char_length(city) <= 120);
alter table public.users add column if not exists state text check (state is null or char_length(state) <= 120);
alter table public.users add column if not exists pincode text check (pincode is null or pincode ~ '^[1-9][0-9]{5}$');

alter table public.users enable row level security;

drop policy if exists "Users can read their own profile" on public.users;
create policy "Users can read their own profile"
on public.users
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "Users can create their own profile" on public.users;
create policy "Users can create their own profile"
on public.users
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
on public.users
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

create table if not exists public.complaints (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null check (char_length(trim(description)) between 10 and 1000),
  image_url text,
  category text not null check (category in ('pothole', 'garbage', 'water', 'electricity', 'other')),
  status text not null default 'submitted' check (status in ('submitted', 'in_review', 'resolved')),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.complaints enable row level security;

drop policy if exists "Users can read their own complaints" on public.complaints;
create policy "Users can read their own complaints"
on public.complaints
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can create their own complaints" on public.complaints;
create policy "Users can create their own complaints"
on public.complaints
for insert
to authenticated
with check (auth.uid() = user_id);

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

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'complaint-images',
  'complaint-images',
  false,
  5242880,
  array['image/jpeg', 'image/png']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png'];

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'document-uploads',
  'document-uploads',
  false,
  5242880,
  array['image/jpeg', 'image/png']
)
on conflict (id) do update
set public = false,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg', 'image/png'];

drop policy if exists "Users can read own complaint images" on storage.objects;
create policy "Users can read own complaint images"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'complaint-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload own complaint images" on storage.objects;
create policy "Users can upload own complaint images"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'complaint-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can read own checklist documents" on storage.objects;
create policy "Users can read own checklist documents"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'document-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users can upload own checklist documents" on storage.objects;
create policy "Users can upload own checklist documents"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'document-uploads'
  and (storage.foldername(name))[1] = auth.uid()::text
);
