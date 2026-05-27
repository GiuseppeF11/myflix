-- MyFlix – Album nei Preferiti
-- Esegui questo script nel SQL Editor del progetto Supabase.

-- ── Tabella album ──────────────────────────────────────────────────────────
create table if not exists public.albums (
  id         bigint generated always as identity primary key,
  user_id    uuid   not null references auth.users (id) on delete cascade,
  name       text   not null,
  created_at timestamptz default now(),
  unique (user_id, name)
);

alter table public.albums enable row level security;

create policy "albums - select" on public.albums for select using (auth.uid() = user_id);
create policy "albums - insert" on public.albums for insert with check (auth.uid() = user_id);
create policy "albums - update" on public.albums for update using (auth.uid() = user_id);
create policy "albums - delete" on public.albums for delete using (auth.uid() = user_id);

-- ── Tabella album_items ────────────────────────────────────────────────────
create table if not exists public.album_items (
  id         bigint generated always as identity primary key,
  album_id   bigint not null references public.albums (id) on delete cascade,
  user_id    uuid   not null references auth.users (id) on delete cascade,
  tmdb_id    bigint not null,
  media_type text   not null check (media_type in ('movie', 'tv')),
  position   integer default 0,
  unique (album_id, tmdb_id, media_type)
);

alter table public.album_items enable row level security;

create policy "album_items - select" on public.album_items for select using (auth.uid() = user_id);
create policy "album_items - insert" on public.album_items for insert with check (auth.uid() = user_id);
create policy "album_items - update" on public.album_items for update using (auth.uid() = user_id);
create policy "album_items - delete" on public.album_items for delete using (auth.uid() = user_id);
