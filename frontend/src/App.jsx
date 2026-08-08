// import { useEffect, useState } from 'react'
// import './App.css'
// import Login from './Login'
// import Signup from './Signup'
// import Dashboard from './Dashboard'
// import AIAssistant from './AIAssistant'

// function App() {
//   const [path, setPath] = useState(
//     window.location.pathname === '/' ? '/home' : window.location.pathname,
//   )

//   useEffect(() => {
//     const onPopState = () => setPath(window.location.pathname)
//     window.addEventListener('popstate', onPopState)
//     return () => window.removeEventListener('popstate', onPopState)
//   }, [])

//   useEffect(() => {
//     if (window.location.pathname === '/') {
//       window.history.replaceState({}, '', '/home')
//       setPath('/home')
//     }
//   }, [])

//   const navigate = (to) => {
//     if (to === window.location.pathname) return
//     window.history.pushState({}, '', to)
//     setPath(to)
//   }

//   if (path === '/signup') {
//     return <Signup onNavigate={navigate} />
//   }

//   if (path === '/ai-assistant') {
//     return <AIAssistant onNavigate={navigate} />
//   }

//   if (path === '/home' || path === '/dashboard') {
//     return <Dashboard onNavigate={navigate} />
//   }

//   return <Login onNavigate={navigate} />
// }

// export default App
import { useEffect, useState } from 'react'
import './App.css'
import Login from './Login'
import Signup from './Signup'
import Home from './home/Home'
import AIAssistant from './AIAssistant'

function App() {
  const [path, setPath] = useState(
    window.location.pathname === '/' ? '/home' : window.location.pathname,
  )

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)

    window.addEventListener('popstate', onPopState)

    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (window.location.pathname === '/') {
      window.history.replaceState({}, '', '/home')
      setPath('/home')
    }
  }, [])

  const navigate = (to) => {
    if (to === window.location.pathname) return

    window.history.pushState({}, '', to)
    setPath(to)
  }

  if (path === '/signup') {
    return <Signup onNavigate={navigate} />
  }

  if (path === '/ai-assistant') {
    return <AIAssistant onNavigate={navigate} />
  }

  if (path === '/home' || path === '/dashboard') {
    return <Home onNavigate={navigate} />
  }

  return <Login onNavigate={navigate} />
}

export default App