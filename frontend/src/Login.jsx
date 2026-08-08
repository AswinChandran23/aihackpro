import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Login({ onNavigate = () => {} }) {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Login failed')
      }

      const storage = rememberMe ? localStorage : sessionStorage
      storage.setItem('authToken', data.token)
      storage.setItem('user', JSON.stringify(data))

      onNavigate('/home')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-6xl min-h-[650px] bg-white rounded-[28px] shadow-[0_25px_70px_rgba(30,41,59,0.12)] overflow-hidden grid lg:grid-cols-2">
        <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-700 p-12 text-white">
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10" />
          <div className="absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-white/5" />
          <div className="absolute top-1/2 right-10 h-20 w-20 rounded-full bg-cyan-400/10 blur-xl" />

          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm">
                <span className="text-xl">✦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">EduAssist AI</h1>
                <p className="text-xs text-indigo-200">AI Teacher&apos;s Assistant</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-indigo-100 backdrop-blur-sm mb-7">
              <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
              AI-powered teaching workspace
            </div>
            <h2 className="text-5xl font-bold leading-[1.08] tracking-tight">
              Plan less.
              <br />
              <span className="text-cyan-200">Teach more.</span>
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-indigo-100">
              Your intelligent teaching assistant for creating engaging lessons, smart assessments and meaningful classroom experiences.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">Welcome back 👋</h2>
              <p className="mt-3 text-sm sm:text-base text-gray-500">Sign in to continue to your teaching workspace.</p>
            </div>

            <form onSubmit={handleLogin}>
              <div className="mb-5">
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">Email</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="teacher@example.com"
                  required
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div className="mb-4">
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-semibold text-gray-700">Password</label>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 pl-11 pr-12 text-sm text-gray-900 placeholder:text-gray-400 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? '🙈' : '👁️'}
                  </button>
                </div>
              </div>

              <div className="flex items-center mb-7">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className={`flex h-4 w-4 items-center justify-center rounded border transition ${
                    rememberMe ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'
                  }`}
                >
                  {rememberMe && <span className="text-[10px] text-white">✓</span>}
                </button>
                <span onClick={() => setRememberMe(!rememberMe)} className="ml-2 cursor-pointer text-sm text-gray-600">
                  Remember me
                </span>
              </div>

              {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 transition-all duration-200 hover:bg-indigo-700 hover:shadow-xl hover:shadow-indigo-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? 'Signing in...' : 'Sign In'}
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-gray-500">
              New here?
              <button
                type="button"
                onClick={() => onNavigate('/signup')}
                className="ml-1 font-semibold text-indigo-600 hover:text-indigo-700 transition"
              >
                Create your teacher account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
