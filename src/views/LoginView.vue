<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-100 via-white to-orange-100 flex items-center justify-center p-4">
    <div class="w-full max-w-md rounded-[2rem] border border-emerald-200 bg-white/95 p-8 shadow-xl">
      <h1 class="mb-6 text-center text-3xl font-bold text-emerald-900">Bridge Login</h1>
      <div class="space-y-5">
        <label class="block text-sm font-medium text-slate-700">Usuário</label>
        <input v-model="username" type="text" placeholder="Digite seu usuário" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />

        <label class="block text-sm font-medium text-slate-700">Senha</label>
        <input v-model="password" type="password" placeholder="Senha" class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />

        <button @click="handleLogin" class="w-full rounded-2xl bg-emerald-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800">Entrar</button>
        <p v-if="error" class="mt-4 text-sm font-medium text-red-600">{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { setAuthenticated } from '../router.js'

const router = useRouter()
const username = ref('')
const password = ref('')
const error = ref('')

const handleLogin = () => {
  const validUsername = 'serrao'
  const validPassword = '123456'

  if (username.value === validUsername && password.value === validPassword) {
    setAuthenticated(true)
    error.value = ''
    router.push('/lancamento')
    return
  }

  setAuthenticated(false)
  error.value = 'Usuário ou senha inválidos. Tente novamente.'
}
</script>
