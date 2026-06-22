import axios from 'axios'

const api = axios.create({
  // ضع الرابط مباشرة هنا كـ string وتأكد من إضافة /api إذا كانت مساراتك تتطلبها
  baseURL: 'https://youssefwael.runasp.net' 
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Network error'
    return Promise.reject(new Error(message))
  }
)

export default api