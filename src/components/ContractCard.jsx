import { formatRub, formatDate, deadlineStatus } from '../lib/format'
import { PAYMENT_STATUS } from '../lib/constants'

export default function ContractCard({ contract, onClick }) {
  const stage  = contract.stages
  const dlSt   = deadlineStatus(contract.deadline)
  const pay    = PAYMENT_STATUS[contract.payment_status] || PAYMENT_STATUS.unpaid

  const deadlineColor = dlSt === 'overdue' ? '#EF4444' : dlSt === 'soon' ? '#FCD34D' : 'rgba(226,234,244,0.45)'

  return (
    <div onClick={onClick}
      className="rounded-xl p-5 cursor-pointer card-hover animate-fade-in"
      style={{ background: 'rgba(26,58,92,0.45)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm leading-snug truncate" style={{ color: '#E2EAF4' }}>
            {contract.title}
          </div>
          <div className="text-xs mt-0.5 truncate" style={{ color: 'rgba(226,234,244,0.5)' }}>
            {contract.client_name}
          </div>
        </div>
        <span className="pay-badge shrink-0" style={{ background: pay.bg, color: pay.text }}>
          {pay.label}
        </span>
      </div>

      {/* Amount */}
      <div className="font-display text-2xl leading-none mb-3" style={{ color: '#E8A020', letterSpacing: '0.01em' }}>
        {formatRub(contract.amount)}
      </div>

      {/* Stage badge */}
      {stage && (
        <div className="stage-badge mb-3" style={{ background: `${stage.color}22`, color: stage.color, border: `1px solid ${stage.color}44` }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: stage.color }} />
          {stage.name}
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'rgba(226,234,244,0.4)' }}>
          <span>Прогресс</span>
          <span>{contract.progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.07)' }}>
          <div className="h-full rounded-full transition-all duration-500"
            style={{ width: `${contract.progress}%`, background: `linear-gradient(90deg, #1565C0, #E8A020)` }} />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs mt-2 pt-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ color: 'rgba(226,234,244,0.4)' }}>
          {contract.manager_name || 'Менеджер не указан'}
        </span>
        <span style={{ color: deadlineColor }}>
          {contract.deadline ? `до ${formatDate(contract.deadline)}` : 'Дедлайн не задан'}
          {dlSt === 'overdue' && ' ⚠'}
        </span>
      </div>
    </div>
  )
}
