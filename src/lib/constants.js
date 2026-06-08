export const STAGES = [
  { id: 1, name: 'Запрос КП',             color: '#9E9E9E' },
  { id: 2, name: 'КП отправлено',         color: '#42A5F5' },
  { id: 3, name: 'Переговоры',            color: '#FFA726' },
  { id: 4, name: 'Договор подписан',      color: '#1565C0' },
  { id: 5, name: 'Аванс получен',         color: '#66BB6A' },
  { id: 6, name: 'Производство/поставка', color: '#FF7043' },
  { id: 7, name: 'КС подписан',           color: '#2E7D32' },
  { id: 8, name: 'Финальная оплата',      color: '#1B5E20' },
]

export const PAYMENT_STATUS = {
  unpaid:   { label: 'Не оплачен', bg: 'rgba(239,68,68,0.15)',   text: '#EF4444' },
  advance:  { label: 'Аванс',      bg: 'rgba(59,130,246,0.15)',  text: '#60A5FA' },
  partial:  { label: 'Частично',   bg: 'rgba(245,158,11,0.15)',  text: '#FCD34D' },
  paid:     { label: 'Оплачен',    bg: 'rgba(34,197,94,0.15)',   text: '#4ADE80' },
}

export const PAYMENT_TYPES = {
  advance:      'Аванс',
  intermediate: 'Промежуточный',
  final:        'Финальный',
}
