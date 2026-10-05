import axios from 'axios'

const activeProfile = (import.meta.env.VITE_ACTIVE_PROFILE || (import.meta.env.PROD ? 'prod' : 'local')).toLowerCase()
const isProd = activeProfile === 'prod' || activeProfile === 'production'

export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (isProd ? import.meta.env.VITE_API_URL_PROD : import.meta.env.VITE_API_URL_LOCAL) || 
  'http://localhost:8000'

const api = axios.create({ baseURL: API_BASE_URL })

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
  get:              ()     => api.get('/settings/'),
  update:           (data) => api.put('/settings/', data),
  setupMT5:         (data) => api.post('/settings/mt5', data),
  testTelegram:     (data) => api.post('/settings/telegram/test', data),
  setupMetaApi:     (data) => api.post('/settings/metaapi', data),
  getMetaApiStatus: ()     => api.get('/settings/metaapi/status'),
}

export const chatAPI = {
  send: (message) => api.post('/chat/', { message }),
}

export const pairsAPI = {
  getAll: () => api.get('/pairs/'),
}

export default api
