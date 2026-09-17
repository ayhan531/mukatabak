export function fmtMoney(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return '₺' + Number(n).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function fmtPct(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  const v = Number(n)
  return (v >= 0 ? '+' : '') + v.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%'
}

export function fmtNum(n, digits = 2) {
  if (n === null || n === undefined || Number.isNaN(n)) return '—'
  return Number(n).toLocaleString('tr-TR', { minimumFractionDigits: digits, maximumFractionDigits: digits })
}

export function relativeTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return ''
  const diffMin = Math.floor((Date.now() - d.getTime()) / 60000)
  if (diffMin < 1) return 'az önce'
  if (diffMin < 60) return `${diffMin} dakika önce`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH} saat önce`
  const diffD = Math.floor(diffH / 24)
  if (diffD < 7) return `${diffD} gün önce`
  return d.toLocaleDateString('tr-TR')
}
