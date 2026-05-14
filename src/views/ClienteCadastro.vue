<template>
  <div class="min-h-screen bg-orange-50">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 p-4 sm:p-8">

      <div class="mx-auto max-w-3xl rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
        <h1 class="mb-6 text-2xl font-semibold text-orange-900">Cadastro de Cliente</h1>

        <div class="mb-6 rounded-3xl border border-orange-100 bg-orange-50 p-4 shadow-sm">
          <label class="block text-sm font-medium text-slate-700">Pesquisar cliente cadastrado</label>
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Nome, número ou CNPJ"
            class="mt-2 w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
          />
          <div v-if="searchQuery" class="mt-4 space-y-2">
            <p v-if="searchResults.length === 0" class="text-sm text-slate-500">Nenhum cliente encontrado para "{{ searchQuery }}".</p>
            <div v-else class="space-y-2">
              <p class="text-sm font-semibold text-orange-900">{{ searchResults.length }} resultado(s) encontrado(s)</p>
              <ul class="space-y-2">
                <li v-for="result in searchResults" :key="result.number" class="rounded-2xl border border-orange-200 bg-white px-4 py-3 text-sm text-slate-700">
                  <p class="font-semibold">{{ result.name }}</p>
                  <p>Número: {{ result.number }}</p>
                  <p>CNPJ: {{ result.cnpj || '—' }}</p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <form class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Código do cliente</span>
              <input v-model="customer.codigo_cliente" type="text" placeholder="CLI0001" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Nome</span>
              <input v-model="customer.nome" type="text" placeholder="Nome do cliente" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Telefone</span>
              <input v-model="customer.telefone" @input="customer.telefone = formatPhone(customer.telefone)" type="text" placeholder="(27) 99988-7766" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Observação</span>
              <textarea v-model="customer.observacao" rows="4" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" placeholder="Observações ou detalhes do cliente"></textarea>
            </label>
          </div>

          <div class="flex flex-wrap gap-3">
            <button @click.prevent="saveCustomer" :disabled="loading" class="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:bg-orange-500 disabled:cursor-not-allowed">
              {{ loading ? 'Salvando...' : (editingId !== null ? 'Atualizar cliente' : 'Salvar cliente') }}
            </button>
            <button v-if="editingId !== null" @click.prevent="cancelEdit" class="rounded-2xl bg-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-400">Cancelar</button>
          </div>

          <p v-if="duplicateMessage" class="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{{ duplicateMessage }}</p>
          <p v-if="successMessage" class="mt-3 rounded-2xl bg-green-50 p-3 text-sm text-green-700">{{ successMessage }}</p>
        </form>
      </div>

      <div class="mx-auto max-w-3xl mt-6 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-orange-900">Clientes cadastrados</h2>
            <p class="text-sm text-slate-500">Edite ou exclua clientes salvos.</p>
          </div>
          <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900">{{ clients.length }}</span>
        </div>

        <div v-if="loading" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
          Carregando clientes...
        </div>

        <div v-else-if="clients.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
          Nenhum cliente cadastrado ainda.
        </div>

        <div v-else class="space-y-4">
          <article v-for="savedCustomer in clients" :key="savedCustomer.id" class="rounded-3xl border border-orange-200 bg-orange-50 p-4 shadow-sm sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="font-semibold text-orange-900">{{ savedCustomer.codigo_cliente }} — {{ savedCustomer.nome }}</p>
              <p class="mt-1 text-sm text-slate-600">Telefone: {{ savedCustomer.telefone }}</p>
              <p v-if="savedCustomer.observacao" class="mt-1 text-sm text-slate-500">{{ savedCustomer.observacao }}</p>
            </div>
            <div class="mt-4 flex gap-2 sm:mt-0">
              <button @click="editCustomer(savedCustomer)" class="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Editar</button>
              <button @click="deleteCustomer(savedCustomer.id)" class="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Excluir</button>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div></div>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideMenu from '../components/SideMenu.vue'
import { getClientes, createCliente, updateCliente, deleteCliente } from '../utils/api.js'

const router = useRouter()
const searchQuery = ref('')
const clients = reactive([])
const editingId = ref(null)
const duplicateMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

const searchResults = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  if (!term) return []
  return clients.filter((c) => {
    return (
      c.codigo_cliente.toLowerCase().includes(term) ||
      c.nome.toLowerCase().includes(term) ||
      c.telefone.toLowerCase().includes(term)
    )
  })
})

const loadClientes = async () => {
  loading.value = true
  const data = await getClientes()
  clients.splice(0, clients.length, ...data)
  loading.value = false
}

onMounted(async () => {
  await loadClientes()
})

const customer = reactive({ codigo_cliente: '', nome: '', telefone: '', observacao: '' })

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

const saveCustomer = async () => {
  duplicateMessage.value = ''
  successMessage.value = ''

  if (!customer.codigo_cliente.trim()) {
    duplicateMessage.value = 'Código do cliente é obrigatório.'
    return
  }

  if (!customer.nome.trim()) {
    duplicateMessage.value = 'Nome é obrigatório.'
    return
  }

  if (!customer.telefone.trim()) {
    duplicateMessage.value = 'Telefone é obrigatório.'
    return
  }

  const cleanedCode = customer.codigo_cliente.trim()
  const cleanedPhone = customer.telefone.trim()
  const duplicateIndex = clients.findIndex((c) => c.codigo_cliente === cleanedCode && c.id !== editingId.value)
  if (duplicateIndex >= 0) {
    duplicateMessage.value = `Já existe um cliente cadastrado com o código ${cleanedCode}.`
    return
  }

  loading.value = true
  try {
    let result
    if (editingId.value !== null) {
      result = await updateCliente(editingId.value, customer)
      if (result.success) {
        successMessage.value = 'Cliente atualizado com sucesso!'
      } else {
        duplicateMessage.value = result.error
      }
    } else {
      result = await createCliente(customer)
      if (result.success) {
        successMessage.value = 'Cliente cadastrado com sucesso!'
      } else {
        duplicateMessage.value = result.error
      }
    }

    if (result.success) {
      await loadClientes()
      Object.assign(customer, { codigo_cliente: '', nome: '', telefone: '', observacao: '' })
      editingId.value = null
      searchQuery.value = ''
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    duplicateMessage.value = 'Erro inesperado: ' + error.message
  }
  loading.value = false
}

const editCustomer = (savedCustomer) => {
  editingId.value = savedCustomer.id
  Object.assign(customer, {
    codigo_cliente: savedCustomer.codigo_cliente || '',
    nome: savedCustomer.nome || '',
    telefone: savedCustomer.telefone || '',
    observacao: savedCustomer.observacao || ''
  })
  duplicateMessage.value = ''
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const cancelEdit = () => {
  editingId.value = null
  Object.assign(customer, { codigo_cliente: '', nome: '', telefone: '', observacao: '' })
  duplicateMessage.value = ''
  successMessage.value = ''
}

const deleteCustomer = async (id) => {
  if (!confirm('Deseja excluir este cliente?')) return
  loading.value = true
  const result = await deleteCliente(id)
  loading.value = false

  if (result.success) {
    await loadClientes()
    successMessage.value = 'Cliente excluído com sucesso!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } else {
    duplicateMessage.value = result.error
  }
}

const logout = () => {
  router.push('/')
}
</script>
