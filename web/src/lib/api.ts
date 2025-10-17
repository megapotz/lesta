export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000/api'

export async function getJSON<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}

