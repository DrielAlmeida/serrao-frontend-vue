<template>
  <div>
    <div class="lg:hidden bg-white shadow-sm border-b border-slate-200">
      <div class="flex items-center justify-between px-4 py-4">
        <div class="flex items-center gap-3">
          <div class="logo-shell">
            <img :src="logoImage" alt="Logo Serrão Alimentos" class="logo-image" />
          </div>
          <div>
            <p class="text-base font-semibold text-emerald-900">Serrão</p>
            <p class="text-xs uppercase tracking-[0.3em] text-emerald-700">Painel</p>
          </div>
        </div>
        <button
          @click="toggleMenu"
          class="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          type="button"
          aria-label="Abrir menu"
        >
          ☰
        </button>
      </div>
    </div>

    <aside class="hidden lg:flex lg:flex-col lg:w-72 lg:shrink-0 lg:bg-white/95 lg:border-r lg:border-slate-200 lg:shadow-sm lg:transition-all lg:duration-300">
      <div class="flex items-center justify-between px-4 py-4">
        <div class="flex items-center gap-3">
          <div class="logo-shell">
            <img :src="logoImage" alt="Logo Serrão Alimentos" class="logo-image" />
          </div>
          <div>
            <p class="text-base font-semibold text-emerald-900">Serrão</p>
            <p class="text-xs uppercase tracking-[0.3em] text-emerald-700">Painel</p>
          </div>
        </div>
      </div>

      <nav class="mt-4 flex-1 space-y-2 px-2">
        <button
          v-for="item in menuItems"
          :key="item.path"
          type="button"
          @click="navigate(item.path)"
          class="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-900"
        >
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">{{ item.icon }}</span>
          <span>{{ item.label }}</span>
        </button>
      </nav>

      <div class="mt-auto px-4 py-4">
        <div class="mb-3 rounded-2xl bg-slate-50 p-3">
          <p class="text-xs font-medium text-slate-600 uppercase tracking-wide">Usuário</p>
          <p class="text-sm font-semibold text-slate-900">{{ userName }}</p>
          <p class="text-xs text-slate-500">{{ isAdmin ? 'Administrador' : 'Usuário comum' }}</p>
        </div>
        <button
          @click="handleLogout"
          class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">⏻</span>
          Sair
        </button>
      </div>
    </aside>

    <transition name="fade">
      <div
        v-if="menuOpen"
        class="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
        @click="closeMenu"
      >
        <aside
          class="absolute left-0 top-0 h-full w-72 bg-white p-4 shadow-xl"
          @click.stop
        >
          <div class="flex items-center justify-between pb-4 border-b border-slate-200">
            <div class="flex items-center gap-3">
              <div class="logo-shell logo-shell-sm">
                <img :src="logoImage" alt="Logo Serrão Alimentos" class="logo-image" />
              </div>
              <div>
              <p class="text-base font-semibold text-emerald-900">Serrão Alimentos</p>
              <p class="text-xs uppercase tracking-[0.3em] text-emerald-700">Menu</p>
              </div>
            </div>
            <button class="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100" @click="closeMenu" type="button">✕</button>
          </div>

          <nav class="mt-4 space-y-2">
            <button
              v-for="item in menuItems"
              :key="item.path"
              type="button"
              @click="navigate(item.path)"
              class="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-900"
            >
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-900">{{ item.icon }}</span>
              {{ item.label }}
            </button>
          </nav>

          <div class="mt-auto pt-4 border-t border-slate-200">
            <div class="mb-3 rounded-2xl bg-slate-50 p-3">
              <p class="text-xs font-medium text-slate-600 uppercase tracking-wide">Usuário</p>
              <p class="text-sm font-semibold text-slate-900">{{ userName }}</p>
              <p class="text-xs text-slate-500">{{ isAdmin ? 'Administrador' : 'Usuário comum' }}</p>
            </div>
            <button
              @click="handleLogout"
              class="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-rose-100 text-rose-700">⏻</span>
              Sair
            </button>
          </div>
        </aside>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import logoImage from '../img/logo.png'

const router = useRouter()
const menuOpen = ref(false)

const userName = computed(() => localStorage.getItem('user-name') || 'Usuário')
const isAdmin = computed(() => localStorage.getItem('serrao-is-admin') === 'true')

const menuItems = [
  { label: 'Lançamento', path: '/lancamento', icon: '🧾' },
  { label: 'Cadastrar Item', path: '/item-cadastro', icon: '📦' },
  { label: 'Lista de Itens', path: '/itens', icon: '📋' },
  { label: 'Cadastrar Cliente', path: '/cliente-cadastro', icon: '👤' },
  { label: 'Cadastrar Usuário', path: '/usuario-cadastro', icon: '👥' },
  { label: 'Conferência', path: '/conference', icon: '✅' },
]

const toggleMenu = () => {
  menuOpen.value = !menuOpen.value
}

const closeMenu = () => {
  menuOpen.value = false
}

const navigate = (path) => {
  closeMenu()
  router.push(path)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const handleLogout = () => {
  closeMenu()
  // Limpar localStorage
  localStorage.removeItem('token')
  localStorage.removeItem('serrao-auth')
  localStorage.removeItem('serrao-is-admin')
  localStorage.removeItem('user-name')
  localStorage.removeItem('serrao-linked-customer-id')
  localStorage.removeItem('serrao-linked-customer-code')
  localStorage.removeItem('serrao-linked-customer-name')
  localStorage.removeItem('serrao-users')
  // Redirecionar para login
  router.push('/')
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<style scoped>
.logo-shell {
  display: inline-flex;
  height: 2.75rem;
  width: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.95rem;
  border: 1px solid #a7f3d0;
  background: linear-gradient(150deg, #ecfdf5 0%, #fffbeb 100%);
  box-shadow: 0 7px 16px rgba(5, 150, 105, 0.14);
  overflow: hidden;
}

.logo-shell-sm {
  height: 2.35rem;
  width: 2.35rem;
}

.logo-image {
  width: 82%;
  height: auto;
  object-fit: contain;
}
</style>
