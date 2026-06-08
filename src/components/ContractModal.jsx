import { useState, useEffect } from 'react'
import { supabase }             from '../lib/supabase'
import { useAuth }              from '../hooks/useAuth'
import StageTrack               from './StageTrack'
import { formatRub, formatDate } from '../lib/format'
import { PAYMENT_STATUS, PAYMENT_TYPES, STAGES } from '../lib/constants'

const Input = ({ label, ...props }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(226,234,244,0.45)' }}>{label}</span>
    <input className="rounded-lg px-3 py-2 text-sm outline-none transition-all"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
               color: '#E2EAF4', width: '100%' }}
      onFocus={e => e.target.style.borderColor = '#E8A020'}
      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      {...props} />
  </label>
)

const Textarea = ({ label, ...props }) => (
  <label className="flex flex-col gap-1">
    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(226,234,244,0.45)' }}>{label}</span>
    <textarea rows={3} className="rounded-lg px-3 py-2 text-sm outline-none transition-all resize-none"
      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2EAF4' }}
      onFocus={e => e.target.style.borderColor = '#E8A020'}
      onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
      {...props} />
  </label>
)

export default function ContractModal({ contract, onClose, onSave, onDelete, onStageChange, isNew }) {
  const { user } = useAuth()
  const [tab,     setTab]     = useState('info')
  const [form,    setForm]    = useState(contract || {
    title:'', client_name:'', manager_name:'', amount:0, stage_id:1,
    deadline:'', payment_status:'unpaid', progress:0, contract_number:'', contract_date:'', comment:'',
  })
  const [saving,   setSaving]   = useState(false)
  const [payments, setPayments] = useState([])
  const [history,  setHistory]  = useState([])
  const [newPay,   setNewPay]   = useState({ amount:'', type:'advance', date: new Date().toISOString().slice(0,10), comment:'' })
  const [stageComment, setStageComment] = useState('')
  const [showStagePick, setShowStagePick] = useState(false)
  const [pendingStage,  setPendingStage]  = useState(null)

  useEffect(() => {
    if (!isNew && contract?.id) {
      supabase.from('payments').select('*').eq('contract_id', contract.id).order('date', { ascending: false })
        .then(({ data }) => data && setPayments(data))
      supabase.from('stage_history').select('*').eq('contract_id', contract.id).order('changed_at', { ascending: false })
        .then(({ data }) => data && setHistory(data))
    }
  }, [contract?.id, isNew])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const handleSave = async () => {
    setSaving(true)
    await onSave(form)
    setSaving(false)
    onClose()
  }

  const handleStageClick = (stageId) => {
    setPendingStage(stageId)
    setShowStagePick(true)
  }

  const confirmStageChange = async () => {
    await onStageChange(contract.id, pendingStage, user?.id, user?.email, stageComment)
    setForm(p => ({ ...p, stage_id: pendingStage }))
    const { data } = await supabase.from('stage_history').select('*').eq('contract_id', contract.id).order('changed_at', { ascending: false })
    if (data) setHistory(data)
    setShowStagePick(false)
    setStageComment('')
  }

  const addPayment = async () => {
    if (!newPay.amount) return
    const { data, error } = await supabase.from('payments').insert([{ ...newPay, contract_id: contract.id }]).select().single()
    if (!error) {
      setPayments(p => [data, ...p])
      setNewPay({ amount:'', type:'advance', date: new Date().toISOString().slice(0,10), comment:'' })
    }
  }

  const pay = PAYMENT_STATUS[form.payment_status] || PAYMENT_STATUS.unpaid

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden animate-slide-up"
        style={{ background: '#0F1F2E', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 80px rgba(0,0,0,0.7)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(26,58,92,0.4)' }}>
          <div>
            <h2 className="font-display text-xl" style={{ color: '#E8A020', letterSpacing: '0.05em' }}>
              {isNew ? 'НОВЫЙ КОНТРАКТ' : form.title || 'КОНТРАКТ'}
            </h2>
            {!isNew && form.contract_number && (
              <div className="text-xs font-mono mt-0.5" style={{ color: 'rgba(226,234,244,0.4)' }}>
                № {form.contract_number}
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!isNew && onDelete && (
              <button onClick={() => { if (confirm('Удалить контракт?')) { onDelete(contract.id); onClose() } }}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ color: '#EF4444', border: '1px solid rgba(239,68,68,0.3)' }}>
                Удалить
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(226,234,244,0.6)' }}>✕</button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-6 pt-4">
          {[['info','Детали'], ['stage','Стадии'], ['payments','Платежи'], ...(!isNew ? [['history','История']] : [])].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="text-sm px-4 py-2 font-medium transition-all border-b-2"
              style={{
                color: tab === id ? '#E8A020' : 'rgba(226,234,244,0.45)',
                borderColor: tab === id ? '#E8A020' : 'transparent',
              }}>{label}</button>
          ))}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {tab === 'info' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Название контракта" value={form.title} onChange={e => set('title', e.target.value)} className="sm:col-span-2" />
              <Input label="Заказчик"         value={form.client_name}    onChange={e => set('client_name', e.target.value)} />
              <Input label="Менеджер"         value={form.manager_name}   onChange={e => set('manager_name', e.target.value)} />
              <Input label="Сумма (руб)"      value={form.amount}          onChange={e => set('amount', e.target.value)} type="number" />
              <Input label="Дедлайн"          value={form.deadline || ''} onChange={e => set('deadline', e.target.value)} type="date" />
              <Input label="Номер договора"   value={form.contract_number || ''} onChange={e => set('contract_number', e.target.value)} />
              <Input label="Дата договора"    value={form.contract_date || ''} onChange={e => set('contract_date', e.target.value)} type="date" />

              {/* Progress */}
              <label className="flex flex-col gap-1 sm:col-span-2">
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(226,234,244,0.45)' }}>
                  Прогресс — {form.progress}%
                </span>
                <input type="range" min={0} max={100} value={form.progress}
                  onChange={e => set('progress', Number(e.target.value))}
                  className="w-full accent-amber-400" />
              </label>

              {/* Payment status */}
              <label className="flex flex-col gap-1">
                <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(226,234,244,0.45)' }}>Статус оплаты</span>
                <select value={form.payment_status} onChange={e => set('payment_status', e.target.value)}
                  className="rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2EAF4' }}>
                  <option value="unpaid">Не оплачен</option>
                  <option value="advance">Аванс</option>
                  <option value="partial">Частично</option>
                  <option value="paid">Оплачен</option>
                </select>
              </label>

              <div /> {/* spacer */}

              <Textarea label="Комментарий" value={form.comment || ''} onChange={e => set('comment', e.target.value)}
                style={{ gridColumn: 'span 2', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2EAF4' }} />
            </div>
          )}

          {tab === 'stage' && (
            <div>
              <p className="text-sm mb-4" style={{ color: 'rgba(226,234,244,0.5)' }}>
                Кликните на стадию для изменения. Будет сохранена запись в истории.
              </p>
              <StageTrack
                currentStageId={form.stage_id}
                onChangeStage={isNew ? (id) => set('stage_id', id) : handleStageClick}
              />

              {/* Stage change confirm dialog */}
              {showStagePick && (
                <div className="mt-4 rounded-xl p-4" style={{ background: 'rgba(232,160,32,0.08)', border: '1px solid rgba(232,160,32,0.25)' }}>
                  <p className="text-sm mb-3" style={{ color: '#E8A020' }}>Комментарий к смене стадии (необязательно)</p>
                  <textarea value={stageComment} onChange={e => setStageComment(e.target.value)}
                    rows={2} placeholder="Причина изменения..."
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none resize-none mb-3"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2EAF4' }} />
                  <div className="flex gap-2">
                    <button onClick={confirmStageChange}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: '#E8A020', color: '#0F1F2E' }}>Подтвердить</button>
                    <button onClick={() => setShowStagePick(false)}
                      className="px-4 py-2 rounded-lg text-sm"
                      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(226,234,244,0.7)' }}>Отмена</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === 'payments' && (
            <div>
              {/* Add payment */}
              <div className="rounded-xl p-4 mb-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs font-mono uppercase tracking-wider mb-3" style={{ color: 'rgba(226,234,244,0.4)' }}>Добавить платёж</p>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Input label="Сумма" value={newPay.amount} onChange={e => setNewPay(p => ({...p, amount: e.target.value}))} type="number" />
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-mono uppercase tracking-wider" style={{ color: 'rgba(226,234,244,0.45)' }}>Тип</span>
                    <select value={newPay.type} onChange={e => setNewPay(p => ({...p, type: e.target.value}))}
                      className="rounded-lg px-3 py-2 text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#E2EAF4' }}>
                      <option value="advance">Аванс</option>
                      <option value="intermediate">Промежуточный</option>
                      <option value="final">Финальный</option>
                    </select>
                  </label>
                  <Input label="Дата" value={newPay.date} onChange={e => setNewPay(p => ({...p, date: e.target.value}))} type="date" />
                  <Input label="Комментарий" value={newPay.comment} onChange={e => setNewPay(p => ({...p, comment: e.target.value}))} />
                </div>
                {!isNew && (
                  <button onClick={addPayment}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    style={{ background: '#E8A020', color: '#0F1F2E' }}>Добавить</button>
                )}
              </div>

              {/* Payment list */}
              <div className="flex flex-col gap-2">
                {payments.length === 0 && (
                  <p className="text-sm text-center py-6" style={{ color: 'rgba(226,234,244,0.3)' }}>Платежей пока нет</p>
                )}
                {payments.map(p => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <span className="text-sm font-semibold" style={{ color: '#E8A020' }}>{formatRub(p.amount)}</span>
                      <span className="text-xs ml-2 px-2 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(226,234,244,0.6)' }}>
                        {PAYMENT_TYPES[p.type]}
                      </span>
                      {p.comment && <div className="text-xs mt-0.5" style={{ color: 'rgba(226,234,244,0.4)' }}>{p.comment}</div>}
                    </div>
                    <div className="text-xs font-mono" style={{ color: 'rgba(226,234,244,0.4)' }}>{formatDate(p.date)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'history' && (
            <div className="flex flex-col gap-2">
              {history.length === 0 && (
                <p className="text-sm text-center py-6" style={{ color: 'rgba(226,234,244,0.3)' }}>История пуста</p>
              )}
              {history.map((h, i) => {
                const stageInfo = STAGES.find(s => s.id === h.stage_id)
                const color = stageInfo?.color || '#9E9E9E'
                const name  = stageInfo?.name  || `Стадия ${h.stage_id}`
                return (
                  <div key={h.id} className="flex gap-3 rounded-lg px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: color }} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium" style={{ color }}>{name}</span>
                        <span className="text-xs font-mono" style={{ color: 'rgba(226,234,244,0.35)' }}>
                          {new Date(h.changed_at).toLocaleString('ru-RU', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                        </span>
                      </div>
                      {h.user_email && <div className="text-xs mt-0.5" style={{ color: 'rgba(226,234,244,0.4)' }}>{h.user_email}</div>}
                      {h.comment && <div className="text-xs mt-1 italic" style={{ color: 'rgba(226,234,244,0.5)' }}>{h.comment}</div>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.07)', background: 'rgba(26,58,92,0.3)' }}>
          <div className="text-xs font-mono" style={{ color: 'rgba(226,234,244,0.3)' }}>
            {!isNew && contract?.created_at && `Создан: ${formatDate(contract.created_at)}`}
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm transition-colors"
              style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(226,234,244,0.7)' }}>Закрыть</button>
            <button onClick={handleSave} disabled={saving}
              className="px-5 py-2 rounded-lg text-sm font-semibold transition-all"
              style={{ background: saving ? 'rgba(232,160,32,0.4)' : '#E8A020', color: '#0F1F2E' }}>
              {saving ? 'Сохранение...' : isNew ? 'Создать' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
