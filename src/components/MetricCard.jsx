export default function MetricCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-xl p-5 card-hover cursor-default"
      style={{ background: 'rgba(26,58,92,0.5)', border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 4px 24px rgba(0,0,0,0.3)' }}>
      <div className="text-xs font-mono uppercase tracking-widest mb-2"
        style={{ color: 'rgba(226,234,244,0.45)' }}>{label}</div>
      <div className="font-display text-3xl leading-none mb-1"
        style={{ color: accent || '#E8A020', letterSpacing: '0.01em' }}>{value}</div>
      {sub && <div className="text-xs mt-1" style={{ color: 'rgba(226,234,244,0.4)' }}>{sub}</div>}
    </div>
  )
}
