import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL })

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login:    (data) => api.post('/auth/login', data),
}

export const signalsAPI = {
  scan:    ()         => api.get('/signals/scan'),
  history: ()         => api.get('/signals/history'),
  approve: (id)       => api.post(`/signals/${id}/approve`),
  reject:  (id)       => api.post(`/signals/${id}/reject`),
}

export const tradesAPI = {
  getAll: () => api.get('/trades/'),
}

export const performanceAPI = {
  get: () => api.get('/performance/'),
}

export const settingsAPI = {
  get:          ()     => api.get('/settings/'),
  update:       (data) => api.put('/settings/', data),
  setupMT5:     (data) => api.post('/settings/mt5', data),
  testTelegram: (data) => api.post('/settings/telegram/test', data),
}

export const chatAPI = {
  send: (message) => api.post('/chat/', { message }),
}

export const pairsAPI = {
  getAll: () => api.get('/pairs/'),
}

export default api
