const BASE = '/api'

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    method: opts.method || 'GET',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    credentials: 'include',
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  })
  let data = null
  try { data = await res.json() } catch { /* no body */ }
  if (!res.ok) {
    const err = new Error((data && data.error) || `İstek başarısız (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export const api = {
  me: () => request('/me'),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  register: (body) => request('/auth/register', { method: 'POST', body }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  stocks: () => request('/stocks'),
  stock: (symbol) => request(`/stocks/${symbol}`),
  stockHistory: (symbol) => request(`/stocks/${symbol}/history`),
  portfolio: () => request('/portfolio'),
  orders: () => request('/orders'),
  trade: (body) => request('/trade', { method: 'POST', body }),

  marketIndices: () => request('/market/indices'),
  marketStatus: () => request('/market/status'),

  watchlist: () => request('/watchlist'),
  watchlistAdd: (symbol) => request('/watchlist', { method: 'POST', body: { symbol } }),
  watchlistRemove: (symbol) => request(`/watchlist/${symbol}`, { method: 'DELETE' }),

  news: () => request('/news'),

  walletTransactions: () => request('/wallet/transactions'),
  walletDeposit: (amount) => request('/wallet/deposit', { method: 'POST', body: { amount } }),
  walletWithdraw: (amount) => request('/wallet/withdraw', { method: 'POST', body: { amount } }),

  updateProfile: (body) => request('/me', { method: 'PATCH', body }),
  changePassword: (body) => request('/me/password', { method: 'POST', body }),
  updateNotifications: (body) => request('/me/notifications', { method: 'PATCH', body }),

  blogList: () => request('/blog'),
  blogPost: (slug) => request(`/blog/${slug}`),
  faq: () => request('/faq'),

  adminStats: () => request('/admin/stats'),
  adminUsers: () => request('/admin/users'),
  adminUserUpdate: (id, body) => request(`/admin/users/${id}`, { method: 'PATCH', body }),
  adminBlogSave: (body) => request('/admin/blog', { method: 'POST', body }),
  adminBlogDelete: (id) => request(`/admin/blog/${id}`, { method: 'DELETE' }),
  adminFaqSave: (body) => request('/admin/faq', { method: 'POST', body }),
  adminFaqDelete: (id) => request(`/admin/faq/${id}`, { method: 'DELETE' }),
}
