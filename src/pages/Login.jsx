import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Login() {
  const { signIn } = useAuth()
  const navigate   = useNavigate()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { error } = await signIn(email, password)
    if (error) { setError(error.message); setLoading(false) }
    else navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-grid-pattern"
      style={{ background: '#0F1F2E' }}>
      {/* Background accent */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #E8A020, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-5"
          style={{ background: 'radial-gradient(circle, #1565C0, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Logo / title */}
        <div className="text-center mb-8">
          <div className="font-display text-5xl mb-1" style={{ color: '#E8A020', letterSpacing: '0.08em' }}>
            ТЕХНОПРО
          </div>
          <div className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(226,234,244,0.35)' }}>
            Contract Management System
          </div>
        </div>

        <form onSubmit={handleSubmit}
          className="rounded-2xl p-8 flex flex-col gap-4"
          style={{ background: 'rgba(26,58,92,0.4)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 4px 40px rgba(0,0,0,0.4)' }}>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(226,234,244,0.45)' }}>
              Email
            </label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2EAF4' }}
              onFocus={e => e.target.style.borderColor = '#E8A020'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              placeholder="name@company.ru" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-widest" style={{ color: 'rgba(226,234,244,0.45)' }}>
              Пароль
            </label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="rounded-lg px-4 py-2.5 text-sm outline-none transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2EAF4' }}
              onFocus={e => e.target.style.borderColor = '#E8A020'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              placeholder="••••••••" />
          </div>

          {error && (
            <div className="text-xs rounded-lg px-3 py-2" style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="mt-1 w-full py-3 rounded-xl font-semibold text-sm transition-all"
            style={{ background: loading ? 'rgba(232,160,32,0.4)' : '#E8A020', color: '#0F1F2E',
                     boxShadow: loading ? 'none' : '0 4px 20px rgba(232,160,32,0.25)' }}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  )
}
