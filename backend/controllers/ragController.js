// controllers/ragController.js
// RAG engine — retrieval, context building, generation, and the connector
// function that turns an agent config into an Express route handler.
//
// Uses your existing Supabase client (config/supabase.js) for storage,
// a local embedding model (no API key needed) for vector search, and
// Groq for LLM generation.
//
// Requires: npm install groq-sdk @xenova/transformers
//
// One-time setup in the Supabase SQL editor (enables pgvector + adds a
// similarity-search function this file calls via RPC):
//
//   create extension if not exists vector;
//
//   create table if not exists documents (
//     id uuid primary key default gen_random_uuid(),
//     course_id text not null,
//     faculty_id text,
//     document_type text not null,
//     title text,
//     term text,
//     access_level text default 'faculty_only',
//     status text default 'pending',
//     uploaded_at timestamptz default now()
//   );
//
//   create table if not exists chunks (
//     id uuid primary key default gen_random_uuid(),
//     document_id uuid references documents(id) on delete cascade,
//     text text not null,
//     embedding vector(384), -- matches all-MiniLM-L6-v2
//     topic text,
//     page_or_slide text,
//     content_hash text
//   );
//
//   create table if not exists retrieval_logs (
//     id uuid primary key default gen_random_uuid(),
//     agent text,
//     query text,
//     chunk_ids_returned text[],
//     created_at timestamptz default now()
//   );
//
//   create or replace function match_chunks (
//     query_embedding vector(384),
//     match_course_id text,
//     match_document_types text[],
//     match_faculty_id text,
//     match_count int
//   )
//   returns table (
//     id uuid, text text, page_or_slide text,
//     document_title text, document_type text, distance float
//   )
//   language sql stable
//   as $$
//     select c.id, c.text, c.page_or_slide,
//            d.title as document_title, d.document_type,
//            c.embedding <=> query_embedding as distance
//     from chunks c
//     join documents d on d.id = c.document_id
//     where d.course_id = match_course_id
//       and (match_document_types is null or d.document_type = any(match_document_types))
//       and (match_faculty_id is null or d.faculty_id = match_faculty_id)
//     order by distance asc
//     limit match_count;
//   $$;

const Groq = require('groq-sdk');
const { pipeline } = require('@xenova/transformers');
const supabase = require('../config/supabase');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const CHAT_MODEL = 'llama-3.3-70b-versatile';

// Local embedding model — loads once, reused for every call.
let embedderPromise;
function getEmbedder() {
  if (!embedderPromise) {
    embedderPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }
  return embedderPromise;
}

// ---------------------------------------------------------------------------
// Embedding
// ---------------------------------------------------------------------------

async function getEmbedding(text) {
  const embedder = await getEmbedder();
  const output = await embedder(text, { pooling: 'mean', normalize: true });
  return Array.from(output.data); // 384-dim vector
}

// ---------------------------------------------------------------------------
// Retrieval (calls the match_chunks SQL function via Supabase RPC)
// ---------------------------------------------------------------------------

async function retrieveContext({ queryText, courseId, documentTypes, facultyId, topK = 6 }) {
  const embedding = await getEmbedding(queryText);

  const { data, error } = await supabase.rpc('match_chunks', {
    query_embedding: embedding,
    match_course_id: courseId,
    match_document_types: documentTypes && documentTypes.length ? documentTypes : null,
    match_faculty_id: facultyId || null,
    match_count: topK,
  });

  if (error) throw error;
  return data || [];
}

// ---------------------------------------------------------------------------
// Context construction
// ---------------------------------------------------------------------------

function buildContextBlock(chunks) {
  return chunks
    .map((c) => `[Source: ${c.document_title}${c.page_or_slide ? ', ' + c.page_or_slide : ''}]\n${c.text}`)
    .join('\n\n');
}

// ---------------------------------------------------------------------------
// Generation (Groq)
// ---------------------------------------------------------------------------

async function generateWithContext({ systemPrompt, userQuery, contextBlock }) {
  const completion = await groq.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Context:\n${contextBlock}\n\nQuestion:\n${userQuery}` },
    ],
  });
  return completion.choices[0].message.content;
}

// ---------------------------------------------------------------------------
// The connector: turns an agent config into an Express route handler
// ---------------------------------------------------------------------------

function connectAgentToRAG({ agentName, documentTypes, topK = 6, systemPrompt, useRAG = true }) {
  return async function agentHandler(req, res) {
    try {
      const { query: userQuery, courseId, facultyId } = req.body;

      if (!userQuery || !courseId) {
        return res.status(400).json({ error: 'query and courseId are required' });
      }

      let contextBlock = '';
      let citations = [];

      if (useRAG) {
        const chunks = await retrieveContext({ queryText: userQuery, courseId, documentTypes, facultyId, topK });
        contextBlock = buildContextBlock(chunks);
        citations = chunks.map((c) => ({ document: c.document_title, page: c.page_or_slide, chunk_id: c.id }));

        await supabase.from('retrieval_logs').insert({
          agent: agentName,
          query: userQuery,
          chunk_ids_returned: chunks.map((c) => c.id),
        });
      }

      const answer = await generateWithContext({
        systemPrompt,
        userQuery,
        contextBlock: contextBlock || '(no retrieved context — answer from general knowledge)',
      });

      return res.json({ agent: agentName, answer, citations });
    } catch (err) {
      console.error(`[${agentName}] agent error:`, err);
      return res.status(500).json({ error: 'Agent request failed', details: err.message });
    }
  };
}

module.exports = {
  getEmbedding,
  retrieveContext,
  buildContextBlock,
  generateWithContext,
  connectAgentToRAG,
};
