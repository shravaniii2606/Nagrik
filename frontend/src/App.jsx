import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'

function App() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-semibold">Hackathon Project</h1>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
