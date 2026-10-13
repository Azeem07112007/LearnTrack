import { supabase } from './supabase'

export const API_BASE = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8000'

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  const headers = new Headers(options.headers || {})
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`

  const res = await fetch(fullUrl, {
    ...options,
    headers,
  })

  return res
}
