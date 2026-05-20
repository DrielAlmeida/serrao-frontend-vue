import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import LancamentoView from './views/LancamentoView.vue'
import ItemCadastro from './views/ItemCadastro.vue'
import ClienteCadastro from './views/ClienteCadastro.vue'
import ConferenceView from './views/ConferenceView.vue'
import ItemListView from './views/ItemListView.vue'
import UserCadastro from './views/UserCadastro.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/lancamento',
    name: 'Lancamento',
    component: LancamentoView
  },
  {
    path: '/item-cadastro',
    name: 'ItemCadastro',
    component: ItemCadastro
  },
  {
    path: '/itens',
    name: 'ItemList',
    component: ItemListView
  },
  {
    path: '/cliente-cadastro',
    name: 'ClienteCadastro',
    component: ClienteCadastro
  },
  {
    path: '/usuario-cadastro',
    name: 'UserCadastro',
    component: UserCadastro
  },
  {
    path: '/conference',
    name: 'Conference',
    component: ConferenceView
  }
]

const AUTH_KEY = 'serrao-auth'
const ADMIN_KEY = 'serrao-is-admin'
const TOKEN_KEY = 'token'

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

const isAuthenticated = () => {
  const authFlag = localStorage.getItem(AUTH_KEY) === 'true'
  const token = localStorage.getItem(TOKEN_KEY)
  return authFlag && !!token && !isTokenExpired(token)
}

const isAdmin = () => localStorage.getItem(ADMIN_KEY) === 'true'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authenticated = isAuthenticated()
  console.log('Router guard:', { to: to.path, from: from.path, isAuthenticated: authenticated, isAdmin: isAdmin() })

  if (!authenticated) {
    clearSession()
  }

  // Se tentar acessar login e já está autenticado, redireciona para lancamento
  if (to.path === '/') {
    if (authenticated) {
      console.log('Already authenticated, redirecting to lancamento')
      return next('/lancamento')
    }
    return next()
  }

  // Se não está autenticado, redireciona para login
  if (!authenticated) {
    console.log('User not authenticated, redirecting to login')
    return next('/')
  }

  // Rotas que requerem admin
  const adminRoutes = ['/item-cadastro', '/itens', '/cliente-cadastro', '/usuario-cadastro']
  if (adminRoutes.includes(to.path) && !isAdmin()) {
    console.log('User not admin, redirecting to lancamento. Admin status:', isAdmin())
    alert('Acesso negado: Esta funcionalidade requer permissões de administrador.')
    return next('/lancamento')
  }

  return next()
})

export const setAuthenticated = (value, isAdminValue = false) => {
  localStorage.setItem(AUTH_KEY, value ? 'true' : 'false')
  localStorage.setItem(ADMIN_KEY, isAdminValue ? 'true' : 'false')
}

export default router