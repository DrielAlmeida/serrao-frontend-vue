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

const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === 'true'
const isAdmin = () => localStorage.getItem(ADMIN_KEY) === 'true'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  console.log('Router guard:', { to: to.path, from: from.path, isAuthenticated: isAuthenticated(), isAdmin: isAdmin() })

  // Se tentar acessar login e já está autenticado, redireciona para lancamento
  if (to.path === '/') {
    if (isAuthenticated()) {
      console.log('Already authenticated, redirecting to lancamento')
      return next('/lancamento')
    }
    return next()
  }

  // Se não está autenticado, redireciona para login
  if (!isAuthenticated()) {
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