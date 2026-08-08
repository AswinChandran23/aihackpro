import React from 'react'
import { Link } from 'react-router-dom'

export default function Profile() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-3xl w-full p-8">
        <h1 className="text-3xl font-bold mb-4">Profile</h1>
        <p className="mb-6">Manage your teacher profile and settings.</p>
        <div className="space-x-4">
          <Link to="/Dashboard" className="text-indigo-600 hover:underline">Dashboard</Link>
          <Link to="/Ai-Assistant" className="text-indigo-600 hover:underline">AI Assistant</Link>
          <Link to="/" className="text-gray-600 hover:underline">Logout</Link>
        </div>
      </div>
    </div>
  )
}
