<template>
  <div class="relative min-h-screen overflow-hidden bg-gradient-to-br from-emerald-100 via-amber-50 to-orange-100 p-4 sm:p-6">
    <div class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.28),transparent_45%),radial-gradient(circle_at_80%_25%,rgba(74,222,128,0.27),transparent_43%),radial-gradient(circle_at_50%_80%,rgba(249,115,22,0.22),transparent_40%)]"></div>

    <transition name="intro-fade">
      <section
        v-if="showIntro"
        class="intro-screen absolute inset-0 z-20 flex items-center justify-center px-6"
      >
        <div class="intro-card w-full max-w-3xl rounded-[2.2rem] border border-emerald-200/80 bg-white/90 p-8 text-center shadow-[0_20px_55px_rgba(6,95,70,0.28)] backdrop-blur-sm sm:p-12">
          <img
            :src="logoImage"
            alt="Logo Serrão Alimentos"
            class="intro-logo mx-auto mb-5 h-24 w-auto sm:h-28"
          />
          <p class="intro-kicker mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">Serrão Alimentos</p>
          <h1 class="intro-title text-4xl leading-tight text-emerald-950 sm:text-5xl">Bem-vindo</h1>
          <p class="mt-4 text-base text-slate-700 sm:text-lg">Qualidade em frutas e operação inteligente para o seu time.</p>
          <div class="mt-7 flex justify-center gap-4 text-3xl sm:text-4xl">
            <span class="float-1">🍎</span>
            <span class="float-2">🍊</span>
            <span class="float-3">🍇</span>
          </div>
        </div>
      </section>
    </transition>

    <main class="relative z-10 flex min-h-[calc(100vh-2rem)] items-center justify-center">
      <div
        :class="showIntro ? 'opacity-0 scale-95' : 'opacity-100 scale-100'"
        class="w-full max-w-md rounded-[2rem] border border-emerald-200 bg-white/95 p-8 shadow-xl transition-all duration-500"
      >
        <div class="mb-4 flex justify-center">
          <img
            :src="logoImage"
            alt="Logo Serrão Alimentos"
            class="login-logo h-16 w-auto"
          />
        </div>
        <h2 class="mb-1 text-center text-3xl font-bold text-emerald-900">Serrão Alimentos</h2>
        <p class="mb-6 text-center text-sm text-slate-600">Acesso ao sistema de pedidos e conferência</p>

        <div class="space-y-5">
          <label class="block text-sm font-medium text-slate-700">Usuário</label>
          <input v-model="username" type="text" placeholder="Digite seu usuário" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />

          <label class="block text-sm font-medium text-slate-700">Senha</label>
          <input v-model="password" type="password" placeholder="Senha" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />

          <button @click="handleLogin" :disabled="loading" class="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-500">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
          <p v-if="error" class="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{{ error }}</p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { login, getPedidos } from '../utils/api.js'
import logoImage from '../img/logo.png'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const showIntro = ref(true)

let introTimer = null

onMounted(() => {
  introTimer = setTimeout(() => {
    showIntro.value = false
  }, 2600)
})

onBeforeUnmount(() => {
  if (introTimer) {
    clearTimeout(introTimer)
  }
})

const handleLogin = async () => {
  if (!username.value || !password.value) {
    error.value = 'Por favor, preencha usuário e senha.'
    return
  }

  loading.value = true
  error.value = ''

  const result = await login({
    login: username.value,
    senha: password.value
  })

  loading.value = false

  if (result.success) {
    // Busca os dados da conferência para o dia anterior
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const formattedDate = yesterday.toISOString().split('T')[0]

    try {
      await getPedidos(formattedDate, formattedDate)
    } catch (fetchError) {
      console.error('Erro ao buscar dados da conferência:', fetchError)
    }

    router.push('/lancamento')
  } else {
    error.value = result.error
  }
}
</script>

<style scoped>
.intro-screen {
  background: linear-gradient(130deg, rgba(236, 253, 245, 0.9) 0%, rgba(255, 247, 237, 0.92) 60%, rgba(254, 215, 170, 0.94) 100%);
}

.intro-title {
  font-family: "Palatino Linotype", "Book Antiqua", serif;
}

.intro-logo {
  filter: drop-shadow(0 8px 18px rgba(5, 150, 105, 0.18));
  animation: logo-pop 0.7s ease both;
}

.login-logo {
  filter: drop-shadow(0 5px 12px rgba(5, 150, 105, 0.14));
}

.intro-kicker {
  font-family: "Trebuchet MS", "Segoe UI", sans-serif;
}

.intro-fade-enter-active,
.intro-fade-leave-active {
  transition: opacity 0.55s ease;
}

.intro-fade-enter-from,
.intro-fade-leave-to {
  opacity: 0;
}

.float-1,
.float-2,
.float-3 {
  display: inline-flex;
  animation: fruit-float 2.8s ease-in-out infinite;
}

.float-2 {
  animation-delay: 0.2s;
}

.float-3 {
  animation-delay: 0.4s;
}

@keyframes fruit-float {
  0%,
  100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-6px);
  }
}

@keyframes logo-pop {
  0% {
    transform: scale(0.88);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
