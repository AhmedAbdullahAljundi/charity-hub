/**
 * API Client Example
 * 
 * This file shows how to create an Axios instance for backend API calls.
 * Ready to use with your backend when configured.
 */

import axios from 'axios'
import { useAuthStore } from '@/lib/stores/authStore'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000')

// Create Axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptor to include auth token
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Handle response errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ============ Auth APIs ============

export const authAPI = {
  login: (email: string, password: string) =>
    apiClient.post('/auth/login', { email, password }),

  logout: () => apiClient.post('/auth/logout'),
}

// ============ Households APIs ============

export const householdsAPI = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/households', { params }),

  get: (id: string) => apiClient.get(`/households/${id}`),

  create: (data: any) => apiClient.post('/households', data),

  update: (id: string, data: any) =>
    apiClient.put(`/households/${id}`, data),

  delete: (id: string) => apiClient.delete(`/households/${id}`),

  publish: (id: string) => apiClient.post(`/households/${id}/publish`),
}

// ============ Income APIs ============

export const incomeAPI = {
  list: (householdId: string) =>
    apiClient.get(`/households/${householdId}/income`),

  create: (householdId: string, data: any) =>
    apiClient.post(`/households/${householdId}/income`, data),

  verify: (householdId: string, incomeId: string) =>
    apiClient.patch(`/households/${householdId}/income/${incomeId}/verify`),

  delete: (householdId: string, incomeId: string) =>
    apiClient.delete(`/households/${householdId}/income/${incomeId}`),
}

// ============ Users APIs (ADMIN only) ============

export const usersAPI = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    apiClient.get('/users', { params }),

  get: (id: string) => apiClient.get(`/users/${id}`),

  create: (data: any) => apiClient.post('/users', data),

  update: (id: string, data: any) => apiClient.put(`/users/${id}`, data),

  delete: (id: string) => apiClient.delete(`/users/${id}`),

  changeRole: (id: string, role: string) =>
    apiClient.patch(`/users/${id}/role`, { role }),

  resetPassword: (id: string) =>
    apiClient.post(`/users/${id}/reset-password`),
}

// ============ Scoring APIs ============

export const scoringAPI = {
  calculate: (householdId: string) =>
    apiClient.post(`/households/${householdId}/score/calculate`),

  get: (householdId: string) =>
    apiClient.get(`/households/${householdId}/score`),

  simulate: (householdId: string, data: any) =>
    apiClient.post(`/households/${householdId}/score/simulate`, data),

  decide: (householdId: string, data: any) =>
    apiClient.post(`/households/${householdId}/score/decide`, data),
}

// ============ Analytics APIs ============

export const analyticsAPI = {
  summary: () => apiClient.get('/analytics/summary'),

  households: () => apiClient.get('/analytics/households'),

  distribution: () => apiClient.get('/analytics/distribution'),
}

export default apiClient
