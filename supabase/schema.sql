-- MyFlix - schema preferiti per-utente con Row Level Security.
-- Esegui questo script nel SQL Editor del progetto Supabase.

create table if not exists public.favorites (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  tmdb_id bigint not null,
  media_type text not null check (media_type in ('movie', 'tv')),
  title text,
  poster_path text,
  overview text,
  created_at timestamptz default now(),
  unique (user_id, tmdb_id, media_type)
);

alter table public.favorites enable row level security;

-- Ogni utente vede e modifica solo i propri preferiti.
create policy "own favorites - select"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "own favorites - insert"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "own favorites - delete"
  on public.favorites for delete
  using (auth.uid() = user_id);
