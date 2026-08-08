import supabase from '../config/supabase.js';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL || 'nomic-embed-text';
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-70b-versatile';

function chunkText(text, size = 1200, overlap = 150) {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const chunks = [];
  let start = 0;

  while (start < normalized.length) {
    const end = Math.min(start + size, normalized.length);
    chunks.push(normalized.slice(start, end).trim());
    if (end >= normalized.length) break;
    start = Math.max(end - overlap, start + 1);
  }

  return chunks.filter(Boolean);
}

async function embedText(text) {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/embeddings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_EMBED_MODEL,
      prompt: text,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Embedding request failed: ${message}`);
  }

  const data = await response.json();
  if (!Array.isArray(data.embedding)) {
    throw new Error('Embedding response did not include an embedding vector');
  }

  return data.embedding;
}

async function askGroq({ systemPrompt, userPrompt }) {
  if (!GROQ_API_KEY) {
    throw new Error('Missing GROQ_API_KEY in backend/.env');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Groq request failed: ${message}`);
  }

  const data = await response.json();
  return data?.choices?.[0]?.message?.content?.trim() || '';
}

async function storeChunks({ documentId, chunks }) {
  const rows = [];

  for (let i = 0; i < chunks.length; i += 1) {
    const content = chunks[i];
    const embedding = await embedText(content);
    rows.push({
      document_id: documentId,
      chunk_index: i,
      content,
      embedding,
    });
  }

  if (!rows.length) return [];

  const { data, error } = await supabase.from('document_chunks').insert(rows).select('id, chunk_index');
  if (error) throw error;
  return data || [];
}

export const listDocuments = async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const { data, error } = await supabase
      .from('documents')
      .select('id, title, source_name, document_type, created_at')
      .eq('teacher_id', teacherId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return res.json({ documents: data || [] });
  } catch (error) {
    console.error('List documents error:', error);
    return res.status(500).json({ message: 'Failed to load documents' });
  }
};

export const ingestDocument = async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const { title, content, sourceName, documentType = 'text' } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: 'title and content are required' });
    }

    const chunks = chunkText(content);
    if (!chunks.length) {
      return res.status(400).json({ message: 'Document content is empty' });
    }

    const { data: document, error: documentError } = await supabase
      .from('documents')
      .insert({
        teacher_id: teacherId,
        title,
        source_name: sourceName || title,
        document_type: documentType,
        content,
      })
      .select('id, title, source_name, document_type, created_at')
      .single();

    if (documentError) throw documentError;

    const chunkRows = await storeChunks({ documentId: document.id, chunks });

    return res.status(201).json({
      message: 'Document saved',
      document,
      chunkCount: chunkRows.length,
    });
  } catch (error) {
    console.error('Ingest document error:', error);
    return res.status(500).json({ message: 'Failed to save document', error: error.message });
  }
};

export const askDocumentQuestion = async (req, res) => {
  try {
    const teacherId = req.teacher.id;
    const { question, documentId } = req.body;

    if (!question) {
      return res.status(400).json({ message: 'question is required' });
    }

    const queryEmbedding = await embedText(question);

    const { data: matches, error: matchError } = await supabase.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_teacher_id: teacherId,
      match_document_id: documentId || null,
      match_count: 6,
    });

    if (matchError) throw matchError;

    const context = (matches || [])
      .map((chunk) => `Source: ${chunk.document_title}${chunk.source_name ? ` (${chunk.source_name})` : ''}\n${chunk.content}`)
      .join('\n\n');

    const answer = await askGroq({
      systemPrompt:
        'You are a helpful teacher assistant. Use the provided document context first. If the answer is not in the context, say you do not know. Keep responses concise and practical.',
      userPrompt: `Context:\n${context || '(no document context found)'}\n\nQuestion:\n${question}`,
    });

    return res.json({
      answer,
      citations: (matches || []).map((chunk) => ({
        documentId: chunk.document_id,
        documentTitle: chunk.document_title,
        chunkId: chunk.id,
        chunkIndex: chunk.chunk_index,
      })),
    });
  } catch (error) {
    console.error('RAG question error:', error);
    return res.status(500).json({ message: 'Failed to answer question', error: error.message });
  }
};
