-- Zoa Supabase schema
-- Apply in Supabase SQL editor or as a migration.

create extension if not exists "pgcrypto";
create extension if not exists postgis;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create or replace function public.set_location_geog()
returns trigger
language plpgsql
as $$
begin
    if new.latitude is not null and new.longitude is not null then
    new.geog := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
    else
    new.geog := null;
    end if;
    return new;
end;
$$;

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique,
    display_name text,
    avatar_url text,
    bio text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.species (
    id uuid primary key default gen_random_uuid(),
    common_name text not null,
    scientific_name text not null unique,
    category text not null default 'unknown' check (category in ('fauna', 'flora', 'unknown')),
    description text,
    confidence_score numeric(4,3) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
    created_by uuid references auth.users(id) on delete set null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.locations (
    id uuid primary key default gen_random_uuid(),
    label text not null,
    latitude double precision,
    longitude double precision,
    geog geography(point, 4326),
    created_at timestamptz not null default now()
);

create table if not exists public.publications (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    user_email text,
    display_name text,
    species_id uuid not null references public.species(id) on delete restrict,
    location_id uuid references public.locations(id) on delete set null,
    location_label text,
    latitude double precision,
    longitude double precision,
    common_name text not null,
    scientific_name text not null,
    description text,
    confidence_score numeric(4,3) check (confidence_score is null or (confidence_score >= 0 and confidence_score <= 1)),
    category text not null default 'unknown' check (category in ('fauna', 'flora', 'unknown')),
    media_type text not null check (media_type in ('photo', 'video', 'audio')),
    storage_path text not null,
    media_url text not null,
    is_public boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.publication_media (
    id uuid primary key default gen_random_uuid(),
    publication_id uuid not null references public.publications(id) on delete cascade,
    media_type text not null check (media_type in ('photo', 'video', 'audio')),
    storage_path text not null,
    media_url text not null,
    mime_type text,
    created_at timestamptz not null default now()
);

create index if not exists idx_species_common_name on public.species using btree (common_name);
create index if not exists idx_species_scientific_name on public.species using btree (scientific_name);
create index if not exists idx_locations_geog on public.locations using gist (geog);
create index if not exists idx_publications_user_created_at on public.publications using btree (user_id, created_at desc);
create index if not exists idx_publications_species_created_at on public.publications using btree (species_id, created_at desc);
create index if not exists idx_publications_location_id on public.publications using btree (location_id);
create index if not exists idx_publications_public_created_at on public.publications using btree (created_at desc) where is_public = true;
create index if not exists idx_publication_media_publication_id on public.publication_media using btree (publication_id);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_species_updated_at on public.species;
create trigger trg_species_updated_at
before update on public.species
for each row execute function public.set_updated_at();

drop trigger if exists trg_publications_updated_at on public.publications;
create trigger trg_publications_updated_at
before update on public.publications
for each row execute function public.set_updated_at();

drop trigger if exists trg_locations_set_geog on public.locations;
create trigger trg_locations_set_geog
before insert or update on public.locations
for each row execute function public.set_location_geog();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    resolved_display_name text;
begin
    resolved_display_name := coalesce(
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'username',
    split_part(new.email, '@', 1)
    );

    insert into public.profiles (id, email, display_name, avatar_url, created_at, updated_at)
    values (
    new.id,
    new.email,
    resolved_display_name,
    new.raw_user_meta_data->>'avatar_url',
    now(),
    now()
    )
    on conflict (id) do update
    set email = excluded.email,
        display_name = coalesce(excluded.display_name, public.profiles.display_name),
        avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
        updated_at = now();

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace view public.map_publications as
select
    p.id,
    p.user_id,
    p.user_email,
    p.display_name,
    p.species_id,
    p.location_id,
    coalesce(l.label, p.location_label) as location_label,
    coalesce(l.latitude, p.latitude) as latitude,
    coalesce(l.longitude, p.longitude) as longitude,
    p.common_name,
    p.scientific_name,
    p.description,
    p.category,
    p.media_type,
    p.media_url,
    p.storage_path,
    p.is_public,
    p.created_at,
    p.updated_at
from public.publications p
left join public.locations l on l.id = p.location_id
where p.is_public = true;

create or replace view public.user_stats as
select
    p.user_id,
    count(*)::bigint as records_total,
    count(*) filter (where p.media_type = 'photo')::bigint as photos_total,
    count(*) filter (where p.media_type = 'audio')::bigint as audios_total,
    count(*) filter (where p.media_type = 'video')::bigint as videos_total,
    count(distinct p.species_id)::bigint as species_total,
    count(distinct p.location_id)::bigint as locations_total
from public.publications p
group by p.user_id;

-- Materialized views to speed up read-heavy aggregates and map queries
-- These provide fast, indexable access for feed and user stats queries.
create materialized view if not exists public.map_publications_mat as
select * from public.map_publications with no data;

create materialized view if not exists public.user_stats_mat as
select * from public.user_stats with no data;

-- Indexes for materialized views (required for CONCURRENTLY refresh)
create unique index if not exists idx_map_pub_id on public.map_publications_mat (id);
create index if not exists idx_map_pub_created_at on public.map_publications_mat using btree (created_at desc);
create unique index if not exists idx_user_stats_user_id on public.user_stats_mat (user_id);

-- Helper function to refresh materialized views. Use with care in production
-- (CONCURRENTLY requires the unique indexes above).
create or replace function public.refresh_materialized_views()
returns void
language plpgsql
as $$
begin
    -- Refresh concurrently to avoid exclusive locks when possible
    refresh materialized view concurrently public.map_publications_mat;
    refresh materialized view concurrently public.user_stats_mat;
end;
$$;

alter table public.profiles enable row level security;
alter table public.species enable row level security;
alter table public.locations enable row level security;
alter table public.publications enable row level security;
alter table public.publication_media enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "species_select_authenticated" on public.species;
create policy "species_select_authenticated"
on public.species
for select
using (true);

drop policy if exists "locations_select_public" on public.locations;
create policy "locations_select_public"
on public.locations
for select
using (true);

drop policy if exists "publications_select_public_or_owner" on public.publications;
create policy "publications_select_public_or_owner"
on public.publications
for select
using (is_public = true or auth.uid() = user_id);

drop policy if exists "publications_insert_owner" on public.publications;
create policy "publications_insert_owner"
on public.publications
for insert
with check (auth.uid() = user_id);

drop policy if exists "publications_update_owner" on public.publications;
create policy "publications_update_owner"
on public.publications
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "publications_delete_owner" on public.publications;
create policy "publications_delete_owner"
on public.publications
for delete
using (auth.uid() = user_id);

drop policy if exists "publication_media_select_public_or_owner" on public.publication_media;
create policy "publication_media_select_public_or_owner"
on public.publication_media
for select
using (
    exists (
    select 1
    from public.publications p
    where p.id = publication_id
        and (p.is_public = true or auth.uid() = p.user_id)
    )
);

drop policy if exists "publication_media_insert_owner" on public.publication_media;
create policy "publication_media_insert_owner"
on public.publication_media
for insert
with check (
    exists (
    select 1
    from public.publications p
    where p.id = publication_id
        and auth.uid() = p.user_id
    )
);
