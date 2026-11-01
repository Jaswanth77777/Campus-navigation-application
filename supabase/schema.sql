-- Joy University Smart Campus: run in Supabase SQL Editor.
create extension if not exists pgcrypto;
create table if not exists public.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 full_name text not null,
 email text not null unique,
 role text not null check (role in ('student','faculty','admin')),
 roll_no text unique,
 faculty_id text unique,
 dob_hash text not null,
 approved boolean not null default false,
 created_at timestamptz not null default now()
);
create table if not exists public.admissions (
 id uuid primary key default gen_random_uuid(),
 full_name text not null,
 email text not null,
 dob_hash text not null,
 admission_ref text not null,
 status text not null default 'pending' check(status in ('pending','approved','rejected')),
 created_at timestamptz not null default now()
);
create table if not exists public.login_history (
 id bigint generated always as identity primary key,
 user_id uuid not null references public.profiles(id) on delete cascade,
 role text not null,
 created_at timestamptz not null default now()
);
create table if not exists public.campus_locations (
 id bigint generated always as identity primary key,
 name text not null,
 description text,
 block_id text not null,
 qr_code text not null unique
);
alter table public.profiles enable row level security;
alter table public.admissions enable row level security;
alter table public.login_history enable row level security;
alter table public.campus_locations enable row level security;
create policy "users read own profile" on public.profiles for select to authenticated using (id=auth.uid());
create policy "admin reads profiles" on public.profiles for select to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "users add own login history" on public.login_history for insert to authenticated with check (user_id=auth.uid());
create policy "admins read login history" on public.login_history for select to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create policy "authenticated users read campus locations" on public.campus_locations for select to authenticated using (true);
-- No public read/insert policy for admissions or DOB hashes. Admissions writes happen only in the server function.
-- Provision profiles through a trusted admin process; never put the service-role key in browser code.
