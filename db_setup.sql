-- NUCLEAR RESET SCRIPT --
-- Run this to completely fix the "128 dimensions" and "Table Missing" errors.

-- 1. Enable Vector Extension
create extension if not exists vector;

-- 2. Drop EVERYTHING related to our app (Clean Slate)
drop table if exists sightings cascade;
drop table if exists camera_nodes cascade;
drop function if exists match_faces cascade;

-- 3. Re-create 'sightings' for ArcFace (512 Dimensions)
create table sightings (
  id bigserial primary key,
  cam_id text,
  seen_at timestamp,
  face_vector vector(512)
);

-- 4. Re-create 'camera_nodes' for Real-Time Status & Map
create table camera_nodes (
    id text primary key,
    name text,
    lat float,
    lon float,
    last_heartbeat timestamp default now(),
    status text default 'offline'
);

-- 5. Re-create Search Function (ArcFace Compatible)
create or replace function match_faces (
  query_embedding vector(512),
  match_threshold float,
  match_count int
)
returns table (
  cam_id text,
  seen_at timestamp,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    sightings.cam_id,
    sightings.seen_at,
    1 - (sightings.face_vector <=> query_embedding) as similarity
  from sightings
  where 1 - (sightings.face_vector <=> query_embedding) > match_threshold
  order by sightings.face_vector <=> query_embedding
  limit match_count;
end;
$$;