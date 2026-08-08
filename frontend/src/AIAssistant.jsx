import { useEffect, useMemo, useRef, useState } from 'react'

const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`

function readAuth() {
  const storage = localStorage.getItem('authToken') ? localStorage : sessionStorage
  const token = storage.getItem('authToken')
  const userRaw = storage.getItem('user')
  const user = userRaw ? JSON.parse(userRaw) : null
  return { token, user }
}

export default function AIAssistant({ onNavigate = () => {} }) {
  const auth = useMemo(() => readAuth(), [])
  const [activePanel, setActivePanel] = useState('chat')
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Upload a document, then ask me questions about it.',
      citations: [],
    },
  ])
  const [question, setQuestion] = useState('')
  const [documents, setDocuments] = useState([])
  const [selectedDocumentId, setSelectedDocumentId] = useState('')
  const [documentTitle, setDocumentTitle] = useState('')
  const [documentText, setDocumentText] = useState('')
  const [selectedFileName, setSelectedFileName] = useState('')
  const [loadingChat, setLoadingChat] = useState(false)
  const [loadingDocs, setLoadingDocs] = useState(false)
  const [savingDoc, setSavingDoc] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (auth.token) {
      loadDocuments()
    }
  }, [auth.token])

  async function loadDocuments() {
    if (!auth.token) return
    setLoadingDocs(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/rag/documents`, {
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to load documents')
      }

      setDocuments(data.documents || [])
      if (!selectedDocumentId && data.documents?.length) {
        setSelectedDocumentId(data.documents[0].id)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoadingDocs(false)
    }
  }

  async function handleFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    const text = await file.text()
    setSelectedFileName(file.name)
    setDocumentTitle(file.name.replace(/\.[^.]+$/, ''))
    setDocumentText(text)
  }

  async function handleSaveDocument(event) {
    event.preventDefault()
    if (!auth.token) return
    if (!documentTitle.trim() || !documentText.trim()) {
      setError('Document title and content are required')
      return
    }

    setSavingDoc(true)
    setError('')
    setNotice('')

    try {
      const response = await fetch(`${API_BASE_URL}/rag/documents`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          title: documentTitle.trim(),
          content: documentText,
          sourceName: selectedFileName || documentTitle.trim(),
          documentType: 'text',
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to save document')
      }

      setNotice(`Saved "${data.document.title}" with ${data.chunkCount} chunks`)
      setDocumentTitle('')
      setDocumentText('')
      setSelectedFileName('')
      await loadDocuments()
      setActivePanel('chat')
      setSelectedDocumentId(data.document.id)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingDoc(false)
    }
  }

  async function handleAsk(event) {
    event.preventDefault()
    if (!auth.token || !question.trim()) return

    const userMessage = {
      id: `${Date.now()}-user`,
      role: 'user',
      content: question.trim(),
      citations: [],
    }

    const assistantMessageId = `${Date.now()}-assistant`

    setMessages((prev) => [
      ...prev,
      userMessage,
      {
        id: assistantMessageId,
        role: 'assistant',
        content: 'Thinking...',
        citations: [],
      },
    ])
    setQuestion('')
    setLoadingChat(true)
    setError('')

    try {
      const response = await fetch(`${API_BASE_URL}/rag/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          question: userMessage.content,
          documentId: selectedDocumentId || null,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || 'Failed to answer the question')
      }

      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: data.answer || 'No answer returned',
                citations: data.citations || [],
              }
            : message,
        ),
      )
    } catch (err) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === assistantMessageId
            ? {
                ...message,
                content: err.message,
                citations: [],
              }
            : message,
        ),
      )
      setError(err.message)
    } finally {
      setLoadingChat(false)
    }
  }

  const userName = auth.user?.name || 'Teacher'

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="w-72 border-r border-slate-800 bg-slate-900 px-5 py-6">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-indigo-300">EduAssist AI</p>
            <h1 className="mt-2 text-2xl font-bold">AI Workspace</h1>
            <p className="mt-2 text-sm text-slate-400">{userName}</p>
          </div>

          <nav className="space-y-2">
            <MenuButton active={activePanel === 'chat'} onClick={() => setActivePanel('chat')} label="Chat" />
            <MenuButton active={activePanel === 'documents'} onClick={() => setActivePanel('documents')} label="Documents" />
            <MenuButton active={false} onClick={() => onNavigate('/home')} label="Dashboard" />
            <MenuButton active={false} onClick={() => onNavigate('/signup')} label="Create account" />
            <MenuButton
              active={false}
              onClick={() => {
                localStorage.removeItem('authToken')
                localStorage.removeItem('user')
                sessionStorage.removeItem('authToken')
                sessionStorage.removeItem('user')
                onNavigate('/')
              }}
              label="Sign out"
            />
          </nav>

          <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-950 p-4 text-sm text-slate-400">
            <p className="font-medium text-slate-200">Selected scope</p>
            <p className="mt-2">{selectedDocumentId ? 'One document' : 'All documents'}</p>
          </div>
        </aside>

        <main className="flex flex-1 flex-col">
          <header className="border-b border-slate-800 bg-slate-900/80 px-8 py-4 backdrop-blur">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">
                  {activePanel === 'chat' ? 'Chat with your documents' : 'Manage documents'}
                </h2>
                <p className="text-sm text-slate-400">
                  Ask questions or add new reference material for retrieval.
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedDocumentId('')
                  setNotice('Chat will use all documents')
                  setActivePanel('chat')
                }}
                className="rounded-xl border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                Use all documents
              </button>
            </div>
          </header>

          <section className="flex flex-1 overflow-hidden">
            <div className="flex flex-1 flex-col">
              {activePanel === 'chat' ? (
                <>
                  <div className="flex-1 space-y-4 overflow-y-auto px-8 py-6">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`max-w-3xl rounded-2xl px-5 py-4 ${
                          message.role === 'user'
                            ? 'ml-auto bg-indigo-600 text-white'
                            : 'border border-slate-800 bg-slate-900 text-slate-100'
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-sm leading-6">{message.content}</p>
                        {message.citations?.length ? (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {message.citations.map((citation) => (
                              <span
                                key={citation.chunkId}
                                className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-300"
                              >
                                {citation.documentTitle} #{citation.chunkIndex + 1}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    ))}
                    <div ref={endRef} />
                  </div>

                  <form onSubmit={handleAsk} className="border-t border-slate-800 bg-slate-900 px-8 py-5">
                    <div className="mb-3 flex flex-wrap items-center gap-3">
                      <label className="text-sm text-slate-400">Chat scope</label>
                      <select
                        value={selectedDocumentId}
                        onChange={(event) => setSelectedDocumentId(event.target.value)}
                        className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-sm text-slate-100 outline-none"
                      >
                        <option value="">All documents</option>
                        {documents.map((document) => (
                          <option key={document.id} value={document.id}>
                            {document.title}
                          </option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-500">
                        {loadingDocs ? 'Loading docs...' : `${documents.length} documents`}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <textarea
                        value={question}
                        onChange={(event) => setQuestion(event.target.value)}
                        rows={3}
                        placeholder="Ask about a lesson plan, a PDF, class notes, or any uploaded text..."
                        className="flex-1 rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                      />
                      <button
                        disabled={loadingChat}
                        className="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70"
                      >
                        {loadingChat ? 'Sending...' : 'Ask'}
                      </button>
                    </div>
                  </form>
                </>
              ) : (
                <div className="flex-1 overflow-y-auto px-8 py-6">
                  <form onSubmit={handleSaveDocument} className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                      <h3 className="text-lg font-semibold">Upload document text</h3>
                      <p className="mt-2 text-sm text-slate-400">
                        Paste text or upload a text file, then store it in the vector database.
                      </p>

                      <div className="mt-5 space-y-4">
                        <input
                          value={documentTitle}
                          onChange={(event) => setDocumentTitle(event.target.value)}
                          placeholder="Document title"
                          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />
                        <input
                          type="file"
                          accept=".txt,.md,.csv,.json,.log"
                          onChange={handleFileChange}
                          className="w-full text-sm text-slate-400 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-white"
                        />
                        <textarea
                          value={documentText}
                          onChange={(event) => setDocumentText(event.target.value)}
                          rows={14}
                          placeholder="Paste the document text here..."
                          className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm outline-none focus:border-indigo-500"
                        />
                        <button
                          disabled={savingDoc}
                          className="rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {savingDoc ? 'Saving...' : 'Save and embed'}
                        </button>
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6">
                      <h3 className="text-lg font-semibold">Stored documents</h3>
                      <p className="mt-2 text-sm text-slate-400">Use a document as chat scope or keep all documents enabled.</p>
                      <div className="mt-5 space-y-3">
                        {documents.length ? (
                          documents.map((document) => (
                            <button
                              type="button"
                              key={document.id}
                              onClick={() => {
                                setSelectedDocumentId(document.id)
                                setActivePanel('chat')
                              }}
                              className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                                selectedDocumentId === document.id
                                  ? 'border-indigo-500 bg-indigo-500/10'
                                  : 'border-slate-700 bg-slate-950 hover:bg-slate-800'
                              }`}
                            >
                              <p className="font-medium">{document.title}</p>
                              <p className="text-xs text-slate-500">{document.source_name || 'Uploaded text'}</p>
                            </button>
                          ))
                        ) : (
                          <p className="text-sm text-slate-500">No documents saved yet.</p>
                        )}
                      </div>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </section>

          {(error || notice) && (
            <div className="border-t border-slate-800 px-8 py-3 text-sm">
              {error ? <span className="text-red-400">{error}</span> : <span className="text-emerald-400">{notice}</span>}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

function MenuButton({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
        active ? 'bg-indigo-600 text-white' : 'bg-slate-950 text-slate-300 hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  )
}
