-- ============================================================================
-- AEGIS — Supabase schema
-- Run in the Supabase SQL editor (or `supabase db push`). Column names match
-- lib/repo/supabase.ts. Public content is world-readable; user data is guarded
-- by RLS. Writes to content tables happen via the service-role key (server-only
-- ingestion), which bypasses RLS.
-- ============================================================================

-- ---- Sources -------------------------------------------------------------
create table if not exists public.sources (
  id         text primary key,
  name       text not null,
  url        text not null,
  feed_url   text not null,
  category   text,
  enabled    boolean not null default true
);

-- ---- Articles ------------------------------------------------------------
create table if not exists public.articles (
  id             text primary key,
  slug           text unique not null,
  source_id      text references public.sources(id) on delete set null,
  source_name    text not null,
  source_url     text not null,
  title          text not null,
  url            text not null,
  canonical_url  text unique not null,
  author         text,
  published_at   timestamptz not null,
  fetched_at     timestamptz not null default now(),
  excerpt        text not null,
  summary        text not null,
  summary_is_ai  boolean not null default false,
  category       text not null,
  tags           text[] not null default '{}',
  image_url      text,
  read_minutes   int not null default 1,
  content_hash   text unique not null,
  -- Full-text search vector over title + summary + tags.
  fts            tsvector generated always as (
                   to_tsvector('english',
                     coalesce(title,'') || ' ' ||
                     coalesce(summary,'') || ' ' ||
                     coalesce(array_to_string(tags, ' '), ''))
                 ) stored
);

create index if not exists articles_published_idx on public.articles (published_at desc);
create index if not exists articles_category_idx  on public.articles (category);
create index if not exists articles_source_idx    on public.articles (source_id);
create index if not exists articles_fts_idx        on public.articles using gin (fts);

-- ---- CVEs (cache over NVD) ----------------------------------------------
create table if not exists public.cves (
  id            text primary key,
  description   text not null,
  cvss_score    numeric,
  severity      text not null default 'NONE',
  cvss_vector   text,
  published     timestamptz,
  last_modified timestamptz,
  cwe           text[] not null default '{}',
  references    jsonb not null default '[]',
  cached_at     timestamptz not null default now()
);

create index if not exists cves_published_idx on public.cves (published desc);

-- ---- Profiles ------------------------------------------------------------
create table if not exists public.profiles (
  id                     uuid primary key references auth.users(id) on delete cascade,
  username               text,
  avatar_url             text,
  subscribed_categories  text[] not null default '{}',
  created_at             timestamptz not null default now()
);

-- ---- Bookmarks -----------------------------------------------------------
create table if not exists public.bookmarks (
  user_id    uuid not null references auth.users(id) on delete cascade,
  article_id text not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, article_id)
);

-- ---- Newsletter ----------------------------------------------------------
create table if not exists public.newsletter_subscriptions (
  email       text primary key,
  categories  text[] not null default '{}',
  confirmed   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---- Notifications -------------------------------------------------------
create table if not exists public.notifications (
  id         text primary key,
  user_id    uuid not null references auth.users(id) on delete cascade,
  type       text not null,
  title      text not null,
  body       text not null,
  href       text,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.sources                  enable row level security;
alter table public.articles                 enable row level security;
alter table public.cves                     enable row level security;
alter table public.profiles                 enable row level security;
alter table public.bookmarks                enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.notifications            enable row level security;

-- Public read for content tables.
create policy "public read sources"  on public.sources  for select using (true);
create policy "public read articles" on public.articles for select using (true);
create policy "public read cves"     on public.cves     for select using (true);

-- Profiles: a user manages only their own row.
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile upsert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Bookmarks: scoped to the owner.
create policy "own bookmarks select" on public.bookmarks for select using (auth.uid() = user_id);
create policy "own bookmarks insert" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "own bookmarks delete" on public.bookmarks for delete using (auth.uid() = user_id);

-- Notifications: readable/updatable by the owner (inserts come from service role).
create policy "own notifications select" on public.notifications for select using (auth.uid() = user_id);
create policy "own notifications update" on public.notifications for update using (auth.uid() = user_id);

-- Newsletter: anyone may subscribe (insert); no public select (service role reads).
create policy "anyone subscribe" on public.newsletter_subscriptions for insert with check (true);

-- Note: the service-role key used by the ingestion pipeline bypasses RLS, so no
-- write policies are needed on content tables.
