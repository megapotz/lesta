import { useEffect, useState } from 'react'
import { getJSON } from '../lib/api'

type Campaign = {
  id: number;
  name: string;
  product?: string;
  budget?: number;
  status?: string;
}

export default function Campaigns() {
  const [rows, setRows] = useState<Campaign[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getJSON<Campaign[]>('/campaigns')
      .then(setRows)
      .catch(e => setError(String(e)))
  }, [])

  return (
    <div style={{ padding: 16 }}>
      <h2>Campaigns</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Name</th>
            <th>Product</th>
            <th>Budget</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td style={{ textAlign: 'center' }}>{r.product || ''}</td>
              <td style={{ textAlign: 'right' }}>{r.budget ?? ''}</td>
              <td style={{ textAlign: 'center' }}>{r.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

