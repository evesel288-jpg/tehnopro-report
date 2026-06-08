import { useState, useMemo } from 'react'
import { useAuth }          from '../hooks/useAuth'
import { useContracts }     from '../hooks/useContracts'
import MetricCard           from '../components/MetricCard'
import ContractCard         from '../components/ContractCard'
import ContractModal        from '../components/ContractModal'
import { formatRub }        from '../lib/format'
import { STAGES }           from '../lib/constants'

export default function Dashboard() {
  const { user, signOut }   = useAuth()
  const { contracts, loading, error, createContract, updateContract, deleteContract, changeStage } = useContracts()

  const [search,      setSearch]      = useState('')
  const [filterStage, setFilterStage] = useState('')
  const [filterMgr,   setFilterMgr]   = useState('')
  const [selected,    setSelected]    = useState(null)   // contract or 'new'
  const [showNew,     setShowNew]     = useState(false)

  // Unique managers for filter
  const managers = useMemo(() => {
    const s = new Set(contracts.map(c => c.manager_name).filter(Boolean))
    return [...s].sort()
  }, [contracts])

  // Filtered list
  const filtered = useMemo(() => contracts.filter(c => {
    if (filterStage && c.stage_id !== Number(filterStage)) return false
    if (filterMgr   && c.manager_name !== filterMgr)       return false
    if (search) {
      const q = search.toLowerCase()
      return c.title.toLowerCase().includes(q) || c.client_name.toLowerCase().includes(q)
    }
    return true
  }), [contracts, filterStage, filterMgr, search])

  // Metrics
  const metrics = useMemo(() => {
    const active = contracts.filter(c => c.stage_id < 8).length
    const total  = contracts.reduce((s, c) => s + Number(c.amount), 0)
    const now    = new Date()
    const pendingPayments = contracts.filter(c => {
      if (!c.deadline) return false
      const d = new Date(c.deadline)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && c.payment_status !== 'paid'
    }).reduce((s, c) => s + Number(c.amount), 0)
    return { total: contracts.length, active, portfolio: total, pendingPayments }
  }, [contracts])

  const handleSave = async (form) => {
    if (selected && selected !== 'new') await updateContract(selected.id, form)
    else await createContract(form)
  }

  const inputStyle = {
    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#E2EAF4', borderRadius: '10px', padding: '8px 12px', fontSize: '13px', outline: 'none',
  }

  return (
    <div className="min-h-screen" style={{ background: '#0F1F2E', backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M40 0H0v40' stroke='rgba(255,255,255,0.025)' stroke-width='1' fill='none'/%3E%3C/svg%3E\")" }}>

      {/* Nav */}
      <nav className="sticky top-0 z-30 px-6 py-3 flex items-center justify-between"
        style={{ background: 'rgba(15,31,46,0.95)', backdropFilter: 'blur(10px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="font-display text-xl tracking-widest" style={{ color: '#E8A020' }}>
          ТЕХНОПРО <span className="text-sm font-body font-normal" style={{ color: 'rgba(226,234,244,0.35)', letterSpacing: '0.05em' }}>CRM</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-xs font-mono hidden sm:block" style={{ color: 'rgba(226,234,244,0.35)' }}>{user?.email}</span>
          <button onClick={() => { setSelected('new'); setShowNew(true) }}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{ background: '#E8A020', color: '#0F1F2E', boxShadow: '0 2px 12px rgba(232,160,32,0.2)' }}>
            + Контракт
          </button>
          <button onClick={signOut} className="text-xs px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'rgba(226,234,244,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
            Выйти
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <MetricCard label="Всего контрактов" value={metrics.total} sub="в базе" />
          <MetricCard label="Активных"         value={metrics.active} sub="в работе" accent="#42A5F5" />
          <MetricCard label="Портфель"         value={formatRub(metrics.portfolio)} sub="общая сумма" />
          <MetricCard label="Ожидается в этом месяце" value={formatRub(metrics.pendingPayments)} sub="не оплачено" accent="#EF4444" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Поиск по названию или заказчику..."
            style={{ ...inputStyle, flexGrow: 1, minWidth: '200px' }} />

          <select value={filterStage} onChange={e => setFilterStage(e.target.value)}
            style={{ ...inputStyle, minWidth: '160px' }}>
            <option value="">Все стадии</option>
            {STAGES.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>

          <select value={filterMgr} onChange={e => setFilterMgr(e.target.value)}
            style={{ ...inputStyle, minWidth: '160px' }}>
            <option value="">Все менеджеры</option>
            {managers.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl px-4 py-3 mb-4 text-sm"
            style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', border: '1px solid rgba(239,68,68,0.2)' }}>
            Ошибка: {error}
          </div>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl p-5 h-52 skeleton" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="font-display text-6xl mb-3" style={{ color: 'rgba(226,234,244,0.06)' }}>ПУСТО</div>
            <p className="text-sm" style={{ color: 'rgba(226,234,244,0.3)' }}>
              {contracts.length === 0 ? 'Нет контрактов. Создайте первый.' : 'Нет контрактов по выбранным фильтрам.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(c => (
              <ContractCard key={c.id} contract={c} onClick={() => setSelected(c)} />
            ))}
          </div>
        )}

        {/* Count */}
        {!loading && filtered.length > 0 && (
          <div className="text-center mt-6 text-xs font-mono" style={{ color: 'rgba(226,234,244,0.2)' }}>
            Показано {filtered.length} из {contracts.length}
          </div>
        )}
      </div>

      {/* Modal */}
      {selected && (
        <ContractModal
          contract={selected === 'new' ? null : selected}
          isNew={selected === 'new'}
          onClose={() => setSelected(null)}
          onSave={handleSave}
          onDelete={deleteContract}
          onStageChange={changeStage}
        />
      )}
    </div>
  )
}
