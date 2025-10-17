import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import './App.css'
import Campaigns from './pages/Campaigns'
import { useEffect, useState } from 'react'
import { getJSON } from './lib/api'

function Nav() {
  return (
    <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ddd' }}>
      <Link to="/">Dashboard</Link>
      <Link to="/campaigns">Campaigns</Link>
      <Link to="/bloggers">Bloggers</Link>
      <Link to="/counterparties">Counterparties</Link>
      <Link to="/placements">Placements</Link>
      <Link to="/users">Users</Link>
    </nav>
  )
}

type DashboardData = {
  spend: number
  publications: number
  cpv: number
  er: number
  active_campaigns: { id: number; name: string; time_pct: number; budget_pct: number; color: string }[]
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  useEffect(() => {
    getJSON<DashboardData>('/dashboard')
      .then(setData)
      .catch(e => setError(String(e)))
  }, [])
  return (
    <div style={{ padding: 16 }}>
      <h2>Dashboard</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {!data ? (
        <div>Loading…</div>
      ) : (
        <>
          <div style={{ display: 'flex', gap: 16 }}>
            {([
              ['spend', data.spend],
              ['publications', data.publications],
              ['cpv', data.cpv.toFixed(4)],
              ['er', data.er.toFixed(2)],
            ] as [string, string | number][]).map(([k, v]) => (
              <div key={k} style={{ border: '1px solid #eee', padding: 12 }}>
                <div style={{ fontSize: 12, color: '#666' }}>{k}</div>
                <div style={{ fontWeight: 600 }}>{String(v)}</div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24 }}>
            <h3>Active campaigns</h3>
            {data.active_campaigns.length === 0 ? (
              <div style={{ color: '#666' }}>No active campaigns</div>
            ) : (
              data.active_campaigns.map(c => (
                <div key={c.id} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 14, marginBottom: 4 }}>{c.name}</div>
                  <div style={{ height: 10, background: '#eee', position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${Math.round(c.time_pct * 100)}%`,
                        background: '#bbb',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${Math.round(c.budget_pct * 100)}%`,
                        background: c.color === 'yellow' ? '#f7c948' : '#34a853',
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <div style={{ padding: 16 }}>
      <h2>{title}</h2>
      <p>Mock data view. API wiring next.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Nav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/campaigns" element={<Campaigns />} />
        <Route path="/bloggers" element={<Placeholder title="Bloggers" />} />
        <Route path="/counterparties" element={<Placeholder title="Counterparties" />} />
        <Route path="/placements" element={<Placeholder title="Placements" />} />
        <Route path="/users" element={<Placeholder title="Users" />} />
      </Routes>
    </BrowserRouter>
  )
}
