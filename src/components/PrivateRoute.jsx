import { Navigate } from 'react-router-dom'
import { useAuth }   from '../hooks/useAuth'

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0F1F2E' }}>
      <div className="flex gap-2">
        {[0,1,2].map(i => (
          <div key={i} className="w-2 h-2 rounded-full bg-amber-400"
            style={{ animation: `bounce 0.8s ease ${i * 0.15}s infinite alternate` }} />
        ))}
      </div>
      <style>{`@keyframes bounce { to { transform: translateY(-8px); opacity: 0.4; } }`}</style>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}
