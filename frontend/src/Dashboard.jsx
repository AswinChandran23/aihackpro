export default function Dashboard({ onNavigate = () => {} }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">Teacher Dashboard</h1>
            <p className="text-sm text-slate-500">Overview of your teaching workspace</p>
          </div>
          <nav className="flex gap-3">
            <button onClick={() => onNavigate('/home')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-100">Home</button>
            <button onClick={() => onNavigate('/signup')} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-100">Signup</button>
            <button onClick={() => onNavigate('/ai-assistant')} className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">AI Assistant</button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="grid gap-6 md:grid-cols-3">
          <Card title="Classes" value="12" />
          <Card title="Assignments" value="34" />
          <Card title="Students" value="248" />
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold">Recent activity</h2>
          <p className="mt-2 text-sm text-slate-500">Connect this page to your actual teacher data later.</p>
        </div>
      </main>
    </div>
  )
}

function Card({ title, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="mt-3 text-3xl font-bold">{value}</p>
    </div>
  )
}
