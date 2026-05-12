import { createRouter, createWebHashHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import LancamentoView from './views/LancamentoView.vue'
import ItemCadastro from './views/ItemCadastro.vue'
import ClienteCadastro from './views/ClienteCadastro.vue'
import ConferenceView from './views/ConferenceView.vue'
import ItemListView from './views/ItemListView.vue'

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
    path: '/conference',
    name: 'Conference',
    component: ConferenceView
  }
]

const AUTH_KEY = 'serrao-auth'

const isAuthenticated = () => localStorage.getItem(AUTH_KEY) === 'true'

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    return isAuthenticated() ? next('/lancamento') : next()
  }

  if (!isAuthenticated()) {
    return next('/')
  }

  return next()
})

export const setAuthenticated = (value) => {
  localStorage.setItem(AUTH_KEY, value ? 'true' : 'false')
}

export default router