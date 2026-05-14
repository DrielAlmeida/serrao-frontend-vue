<template>
  <div class="min-h-screen bg-blue-50">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 p-4 sm:p-8">
        <div class="mx-auto max-w-3xl rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <h1 class="mb-6 text-2xl font-semibold text-blue-900">Cadastro de Usuários</h1>

          <form class="space-y-5">
            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Nome completo</span>
                <input
                  v-model="user.nome"
                  type="text"
                  placeholder="Nome do usuário"
                  class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Login</span>
                <input
                  v-model="user.login"
                  type="text"
                  placeholder="Nome de usuário"
                  class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Email</span>
                <input
                  v-model="user.email"
                  type="email"
                  placeholder="email@exemplo.com"
                  class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
              <label class="block">
                <span class="text-sm font-medium text-slate-700">Senha</span>
                <input
                  v-model="user.senha"
                  type="password"
                  placeholder="••••••••"
                  class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                />
              </label>
            </div>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
                <input
                  v-model="user.ativo"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span class="text-sm font-medium text-slate-700">Ativo</span>
              </label>
              <label class="flex items-center gap-3 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3">
                <input
                  v-model="user.is_admin"
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span class="text-sm font-medium text-slate-700">Administrador</span>
              </label>
            </div>

            <div class="flex gap-3">
              <button
                @click.prevent="saveUser"
                class="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                {{ editingIndex !== null ? 'Atualizar usuário' : 'Cadastrar usuário' }}
              </button>
              <button
                v-if="editingIndex !== null"
                @click.prevent="cancelEdit"
                class="rounded-2xl bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-400"
              >
                Cancelar
              </button>
            </div>

            <p v-if="duplicateMessage" class="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">
              {{ duplicateMessage }}
            </p>
            <p v-if="successMessage" class="mt-3 rounded-2xl bg-green-50 p-3 text-sm text-green-700">
              {{ successMessage }}
            </p>
          </form>
        </div>

        <div class="mx-auto max-w-3xl mt-6 rounded-3xl border border-blue-200 bg-white p-6 shadow-sm">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-semibold text-blue-900">Usuários cadastrados</h2>
              <p class="text-sm text-slate-500">Edite ou exclua usuários salvos.</p>
            </div>
            <span class="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-900">{{ users.length }}</span>
          </div>

          <div v-if="users.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
            Nenhum usuário cadastrado ainda.
          </div>

          <div v-else class="space-y-4">
            <article
              v-for="(savedUser, index) in users"
              :key="savedUser.login"
              class="rounded-3xl border border-slate-200 bg-blue-50 p-4 shadow-sm"
            >
              <div class="sm:flex sm:items-center sm:justify-between">
                <div class="flex-1">
                  <p class="font-semibold text-blue-900">{{ savedUser.nome }}</p>
                  <p class="mt-1 text-sm text-slate-600">Login: <span class="font-mono">{{ savedUser.login }}</span></p>
                  <p class="mt-1 text-sm text-slate-600">Email: {{ savedUser.email }}</p>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <span
                      v-if="savedUser.ativo"
                      class="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700"
                    >
                      ✓ Ativo
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                    >
                      ✕ Inativo
                    </span>
                    <span
                      v-if="savedUser.is_admin"
                      class="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700"
                    >
                      👑 Administrador
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700"
                    >
                      👤 Usuário
                    </span>
                  </div>
                </div>
                <div class="mt-4 flex gap-2 sm:mt-0 sm:flex-col">
                  <button
                    @click="editUser(index)"
                    class="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Editar
                  </button>
                  <button
                    @click="deleteUser(index)"
                    class="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import SideMenu from '../components/SideMenu.vue'
import { getClientes } from '../utils/api.js'

const users = reactive([])
const editingIndex = ref(null)
const duplicateMessage = ref('')
const successMessage = ref('')

const user = reactive({
  nome: '',
  login: '',
  email: '',
  senha: '',
  ativo: true,
  is_admin: false
})

// Carregar usuários da API ao montar o componente
onMounted(async () => {
  // TODO: Substituir por getUsuarios() da API quando estiver disponível
  // Por enquanto, carrega do localStorage para testes
  const savedUsers = localStorage.getItem('serrao-users')
  if (savedUsers) {
    const parsed = JSON.parse(savedUsers)
    users.splice(0, users.length, ...parsed)
  }
})

const saveUser = async () => {
  duplicateMessage.value = ''
  successMessage.value = ''

  // Validação básica
  if (!user.nome.trim()) {
    duplicateMessage.value = 'Nome é obrigatório.'
    return
  }

  if (!user.login.trim()) {
    duplicateMessage.value = 'Login é obrigatório.'
    return
  }

  if (!user.email.trim()) {
    duplicateMessage.value = 'Email é obrigatório.'
    return
  }

  if (!user.senha && editingIndex.value === null) {
    duplicateMessage.value = 'Senha é obrigatória para novo usuário.'
    return
  }

  // Validação de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(user.email)) {
    duplicateMessage.value = 'Email inválido.'
    return
  }

  // Verificar duplicação de login
  const loginDuplicateIndex = users.findIndex(
    (u, index) => u.login === user.login.trim() && index !== editingIndex.value
  )
  if (loginDuplicateIndex >= 0) {
    duplicateMessage.value = `Já existe um usuário cadastrado com o login "${user.login.trim()}".`
    return
  }

  // Verificar duplicação de email
  const emailDuplicateIndex = users.findIndex(
    (u, index) => u.email === user.email.trim() && index !== editingIndex.value
  )
  if (emailDuplicateIndex >= 0) {
    duplicateMessage.value = `Já existe um usuário cadastrado com o email "${user.email.trim()}".`
    return
  }

  try {
    // TODO: Integrar com API para salvar no backend
    // const response = await api.post('/hortifruti/usuarios', {...user})

    if (editingIndex.value !== null) {
      // Mantém a senha original se não foi alterada
      if (!user.senha) {
        user.senha = users[editingIndex.value].senha
      }
      users[editingIndex.value] = { ...user }
      successMessage.value = 'Usuário atualizado com sucesso!'
    } else {
      users.push({ ...user })
      successMessage.value = 'Usuário cadastrado com sucesso!'
    }

    // Salvar no localStorage para persistência local
    localStorage.setItem('serrao-users', JSON.stringify(users))

    // Limpar formulário
    Object.assign(user, {
      nome: '',
      login: '',
      email: '',
      senha: '',
      ativo: true,
      is_admin: false
    })
    editingIndex.value = null

    // Limpar mensagem de sucesso após 3 segundos
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } catch (error) {
    duplicateMessage.value = 'Erro ao salvar usuário: ' + error.message
  }
}

const editUser = (index) => {
  editingIndex.value = index
  const selectedUser = users[index]
  Object.assign(user, {
    nome: selectedUser.nome,
    login: selectedUser.login,
    email: selectedUser.email,
    senha: '', // Não preenche a senha por segurança
    ativo: selectedUser.ativo,
    is_admin: selectedUser.is_admin
  })
  duplicateMessage.value = ''
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingIndex.value = null
  Object.assign(user, {
    nome: '',
    login: '',
    email: '',
    senha: '',
    ativo: true,
    is_admin: false
  })
  duplicateMessage.value = ''
  successMessage.value = ''
}

const deleteUser = (index) => {
  const selectedUser = users[index]
  if (!confirm(`Deseja excluir o usuário "${selectedUser.nome}"?`)) return

  users.splice(index, 1)
  localStorage.setItem('serrao-users', JSON.stringify(users))

  if (editingIndex.value === index) {
    cancelEdit()
  }
}
</script>
