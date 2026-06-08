export const formatRub = (n) =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(n ?? 0)

export const formatDate = (d) => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export const deadlineStatus = (deadline) => {
  if (!deadline) return null
  const now   = new Date(); now.setHours(0,0,0,0)
  const dlDate = new Date(deadline)
  const diff  = Math.floor((dlDate - now) / 86400000)
  if (diff < 0)  return 'overdue'
  if (diff <= 7) return 'soon'
  return 'ok'
}
