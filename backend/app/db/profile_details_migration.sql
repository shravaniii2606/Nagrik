alter table public.users add column if not exists birth_date date;
alter table public.users add column if not exists gender text;
alter table public.users add column if not exists address text;
alter table public.users add column if not exists city text;
alter table public.users add column if not exists state text;
alter table public.users add column if not exists pincode text;

alter table public.users
  drop constraint if exists users_gender_check,
  add constraint users_gender_check
    check (gender is null or gender in ('Female', 'Male', 'Non-binary', 'Prefer not to say'));

alter table public.users
  drop constraint if exists users_address_check,
  add constraint users_address_check
    check (address is null or char_length(address) <= 240);

alter table public.users
  drop constraint if exists users_city_check,
  add constraint users_city_check
    check (city is null or char_length(city) <= 120);

alter table public.users
  drop constraint if exists users_state_check,
  add constraint users_state_check
    check (state is null or char_length(state) <= 120);

alter table public.users
  drop constraint if exists users_pincode_check,
  add constraint users_pincode_check
    check (pincode is null or pincode ~ '^[1-9][0-9]{5}$');
