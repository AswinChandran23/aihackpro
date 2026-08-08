create extension if not exists vector;
create extension if not exists pgcrypto;

create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  teacher_id text not null,
  title text not null,
  source_name text,
  document_type text not null default 'text',
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.document_chunks (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  chunk_index integer not null,
  content text not null,
  embedding vector(768) not null,
  created_at timestamptz not null default now()
);

create index if not exists documents_teacher_id_idx on public.documents (teacher_id, created_at desc);
create index if not exists document_chunks_document_id_idx on public.document_chunks (document_id, chunk_index);
create index if not exists document_chunks_embedding_hnsw_idx
  on public.document_chunks
  using hnsw (embedding vector_cosine_ops);

create or replace function public.match_document_chunks(
  query_embedding vector(768),
  match_teacher_id text,
  match_document_id uuid default null,
  match_count int default 6
)
returns table (
  id uuid,
  document_id uuid,
  document_title text,
  source_name text,
  chunk_index int,
  content text,
  similarity float
)
language sql
stable
as $$
  select
    c.id,
    c.document_id,
    d.title as document_title,
    d.source_name,
    c.chunk_index,
    c.content,
    1 - (c.embedding <=> query_embedding) as similarity
  from public.document_chunks c
  join public.documents d on d.id = c.document_id
  where d.teacher_id = match_teacher_id
    and (match_document_id is null or c.document_id = match_document_id)
  order by c.embedding <=> query_embedding asc
  limit match_count;
$$;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.documents to anon, authenticated;
grant select, insert, update, delete on public.document_chunks to anon, authenticated;
grant execute on function public.match_document_chunks(vector, text, uuid, int) to anon, authenticated;
