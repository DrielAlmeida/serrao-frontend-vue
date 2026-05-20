import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

const parseTokenPayload = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null
    }

    const parts = token.split('.')
    if (parts.length < 2) {
      return null
    }

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    return JSON.parse(atob(padded))
  } catch (_error) {
    return null
  }
}

const isTokenExpired = (token) => {
  const payload = parseTokenPayload(token)
  const exp = payload?.exp

  if (!exp) {
    return false
  }

  const nowInSeconds = Math.floor(Date.now() / 1000)
  return nowInSeconds >= Number(exp)
}

const clearSession = () => {
  const keysToClear = [
    'token',
    'serrao-auth',
    'serrao-is-admin',
    'user-name',
    'serrao-user-id',
    'usuario_id_logado',
    'id_usuario',
    'user_id',
    'serrao-linked-customer-id',
    'serrao-linked-customer-code',
    'serrao-linked-customer-name'
  ]

  keysToClear.forEach((key) => localStorage.removeItem(key))
}

// Verificar autenticação no carregamento da página
const isAuthenticated = () => {
  const authFlag = localStorage.getItem('serrao-auth') === 'true'
  const token = localStorage.getItem('token')
  return authFlag && !!token && !isTokenExpired(token)
}

if (!isAuthenticated() && window.location.hash !== '#/') {
  console.log('Página recarregada sem sessão válida, redirecionando para login')
  clearSession()
  window.location.hash = '#/'
}

// Função de debug para verificar status de autenticação
window.debugAuth = () => {
  console.log('=== DEBUG AUTH STATUS ===')
  console.log('serrao-auth:', localStorage.getItem('serrao-auth'))
  console.log('serrao-is-admin:', localStorage.getItem('serrao-is-admin'))
  console.log('user-name:', localStorage.getItem('user-name'))
  console.log('token:', localStorage.getItem('token') ? 'Presente' : 'Ausente')
  console.log('isAuthenticated():', isAuthenticated())
  console.log('isAdmin():', localStorage.getItem('serrao-is-admin') === 'true')
  console.log('========================')
}
