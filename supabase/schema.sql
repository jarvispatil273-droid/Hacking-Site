-- ============================================================================
-- AEGIS — Supabase / PostgreSQL schema (production, idempotent, RLS-secured)
-- ============================================================================
create extension if not exists pg_trgm;

create table if not exists public.sources (
  id text primary key, name text not null, url text not null,
  feed_url text not null, category text, enabled boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.articles (
  id text primary key, slug text not null unique,
  source_id text references public.sources(id) on delete set null,
  source_name text not null, source_url text not null, title text not null,
  url text not null, canonical_url text not null unique, author text,
  published_at timestamptz not null, fetched_at timestamptz not null default now(),
  excerpt text not null default '', summary text not null default '',
  summary_is_ai boolean not null default false, category text not null default 'Threats',
  tags text[] not null default '{}', image_url text, read_minutes integer not null default 1,
  content_hash text not null unique, search_vector tsvector,
  created_at timestamptz not null default now()
);
create index if not exists articles_published_idx on public.articles (published_at desc);
create index if not exists articles_category_published_idx on public.articles (category, published_at desc);
create index if not exists articles_source_idx on public.articles (source_id);
create index if not exists articles_search_idx on public.articles using gin (search_vector);
create index if not exists articles_tags_idx on public.articles using gin (tags);
create index if not exists articles_title_trgm_idx on public.articles using gin (title gin_trgm_ops);

create or replace function public.articles_tsv_update()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.title,'')),   'A') ||
    setweight(to_tsvector('english', coalesce(new.summary,'')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(new.tags,' '),'')), 'C');
  return new;
end; $$;
drop trigger if exists articles_tsv_trigger on public.articles;
create trigger articles_tsv_trigger before insert or update of title, summary, tags
  on public.articles for each row execute function public.articles_tsv_update();

create table if not exists public.cves (
  id text primary key, description text not null default '', cvss_score numeric(4,1),
  severity text not null default 'NONE', cvss_vector text, published timestamptz,
  last_modified timestamptz, cwe text[] not null default '{}',
  refs jsonb not null default '[]'::jsonb, cached_at timestamptz not null default now()
);
create index if not exists cves_published_idx on public.cves (published desc);
create index if not exists cves_severity_idx on public.cves (severity);
create index if not exists cves_desc_trgm_idx on public.cves using gin (description gin_trgm_ops);
create index if not exists cves_id_trgm_idx on public.cves using gin (id gin_trgm_ops);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text, avatar_url text, subscribed_categories text[] not null default '{}',
  created_at timestamptz not null default now()
);
create table if not exists public.bookmarks (
  user_id uuid not null references auth.users(id) on delete cascade,
  article_id text not null references public.articles(id) on delete cascade,
  created_at timestamptz not null default now(), primary key (user_id, article_id)
);
create index if not exists bookmarks_article_idx on public.bookmarks (article_id);
create index if not exists bookmarks_user_idx on public.bookmarks (user_id, created_at desc);

create table if not exists public.newsletter_subscriptions (
  email text primary key, categories text[] not null default '{}',
  confirmed boolean not null default false, created_at timestamptz not null default now()
);
create table if not exists public.notifications (
  id text primary key, user_id uuid not null references auth.users(id) on delete cascade,
  type text not null, title text not null, body text not null, href text,
  read boolean not null default false, created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.cves enable row level security;
alter table public.profiles enable row level security;
alter table public.bookmarks enable row level security;
alter table public.newsletter_subscriptions enable row level security;
alter table public.notifications enable row level security;

drop policy if exists "sources_public_read" on public.sources;
create policy "sources_public_read" on public.sources for select using (true);
drop policy if exists "articles_public_read" on public.articles;
create policy "articles_public_read" on public.articles for select using (true);
drop policy if exists "cves_public_read" on public.cves;
create policy "cves_public_read" on public.cves for select using (true);

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "bookmarks_select_own" on public.bookmarks;
create policy "bookmarks_select_own" on public.bookmarks for select using (auth.uid() = user_id);
drop policy if exists "bookmarks_insert_own" on public.bookmarks;
create policy "bookmarks_insert_own" on public.bookmarks for insert with check (auth.uid() = user_id);
drop policy if exists "bookmarks_delete_own" on public.bookmarks;
create policy "bookmarks_delete_own" on public.bookmarks for delete using (auth.uid() = user_id);

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "newsletter_insert_public" on public.newsletter_subscriptions;
create policy "newsletter_insert_public" on public.newsletter_subscriptions for insert with check (true);
