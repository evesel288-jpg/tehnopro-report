import { STAGES } from '../lib/constants'

export default function StageTrack({ currentStageId, onChangeStage, readonly }) {
  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex gap-1 min-w-max">
        {STAGES.map((s, i) => {
          const active  = s.id === currentStageId
          const done    = s.id < currentStageId
          return (
            <button key={s.id} disabled={readonly || active}
              onClick={() => !readonly && onChangeStage(s.id)}
              className="flex flex-col items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200"
              style={{
                background: active ? `${s.color}22` : done ? 'rgba(255,255,255,0.04)' : 'transparent',
                border: `1px solid ${active ? s.color + '66' : done ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)'}`,
                cursor: readonly || active ? 'default' : 'pointer',
                opacity: !done && !active ? 0.5 : 1,
              }}>
              {/* Step line */}
              <div className="flex items-center gap-0.5">
                <div className="w-4 h-0.5 rounded" style={{ background: done || active ? s.color : 'rgba(255,255,255,0.12)' }} />
                <div className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: active ? s.color : done ? s.color : 'rgba(255,255,255,0.15)',
                           boxShadow: active ? `0 0 8px ${s.color}` : 'none' }} />
                {i < STAGES.length - 1 && (
                  <div className="w-4 h-0.5 rounded" style={{ background: done ? s.color : 'rgba(255,255,255,0.12)' }} />
                )}
              </div>
              <span className="text-xs whitespace-nowrap font-medium"
                style={{ color: active ? s.color : done ? 'rgba(226,234,244,0.6)' : 'rgba(226,234,244,0.35)' }}>
                {s.name}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
