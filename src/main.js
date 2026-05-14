import { createApp } from 'vue'
import App from './App.vue'
import router from './router.js'
import './style.css'

const app = createApp(App)
app.use(router)
app.mount('#app')

// Verificar autenticação no carregamento da página
const isAuthenticated = () => localStorage.getItem('serrao-auth') === 'true'
if (!isAuthenticated() && window.location.hash !== '#/') {
  console.log('Página recarregada sem autenticação, redirecionando para login')
  localStorage.removeItem('token')
  localStorage.removeItem('serrao-auth')
  localStorage.removeItem('serrao-is-admin')
  localStorage.removeItem('user-name')
  window.location.hash = '#/'
}

// Função de debug para verificar status de autenticação
window.debugAuth = () => {
  console.log('=== DEBUG AUTH STATUS ===')
  console.log('serrao-auth:', localStorage.getItem('serrao-auth'))
  console.log('serrao-is-admin:', localStorage.getItem('serrao-is-admin'))
  console.log('user-name:', localStorage.getItem('user-name'))
  console.log('token:', localStorage.getItem('token') ? 'Presente' : 'Ausente')
  console.log('isAuthenticated():', localStorage.getItem('serrao-auth') === 'true')
  console.log('isAdmin():', localStorage.getItem('serrao-is-admin') === 'true')
  console.log('========================')
}
