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
              <span class="text-sm font-medium text-slate-700">Número do cliente</span>
              <input v-model="customer.number" @input="customer.number = formatCustomerNumber(customer.number)" type="text" placeholder="12345678" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-slate-700">CNPJ</span>
              <input v-model="customer.cnpj" @input="customer.cnpj = formatCNPJ(customer.cnpj)" type="text" placeholder="00.000.000/0000-00" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Nome</span>
              <input v-model="customer.name" type="text" placeholder="Nome do cliente" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Telefone</span>
              <input v-model="customer.phone" @input="customer.phone = formatPhone(customer.phone)" type="text" placeholder="(11) 99999-9999" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200" />
            </label>
          </div>

          <button @click.prevent="saveCustomer" class="rounded-2xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700">Salvar cliente</button>
          <p v-if="duplicateMessage" class="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{{ duplicateMessage }}</p>
        </form>
      </div>

      <div class="mx-auto max-w-3xl mt-6 rounded-3xl border border-orange-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-orange-900">Clientes cadastrados</h2>
            <p class="text-sm text-slate-500">Edite ou exclua clientes salvos.</p>
          </div>
          <span class="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-900">{{ customers.length }}</span>
        </div>

        <div v-if="customers.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
          Nenhum cliente cadastrado ainda.
        </div>

        <div v-else class="space-y-4">
          <article v-for="(savedCustomer, index) in customers" :key="savedCustomer.number" class="rounded-3xl border border-slate-200 bg-orange-50 p-4 shadow-sm sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="font-semibold text-orange-900">{{ savedCustomer.number }} — {{ savedCustomer.name }}</p>
              <p class="mt-1 text-sm text-slate-600">CNPJ: {{ savedCustomer.cnpj }}</p>
              <p class="mt-1 text-sm text-slate-600">Telefone: {{ savedCustomer.phone }}</p>
            </div>
            <div class="mt-4 flex gap-2 sm:mt-0">
              <button @click="editCustomer(savedCustomer)" class="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Editar</button>
              <button @click="deleteCustomer(index)" class="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Excluir</button>
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
import { useLocalStorage } from '../utils/localStorage.js'

const router = useRouter()
const { getCustomers, saveCustomers } = useLocalStorage()
const searchQuery = ref('')
const customers = reactive([])
const editingIndex = ref(null)
const duplicateMessage = ref('')

const searchResults = computed(() => {
  const term = searchQuery.value.trim().toLowerCase()
  if (!term) return []
  return customers.filter((c) => {
    return (
      c.number.toLowerCase().includes(term) ||
      c.cnpj.toLowerCase().includes(term) ||
      c.name.toLowerCase().includes(term)
    )
  })
})

onMounted(() => {
  Object.assign(customers, getCustomers())
})

const customer = reactive({ number: '', cnpj: '', name: '', phone: '' })

const formatCustomerNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return digits.replace(/(\d{2})(\d+)/, '$1.$2')
  return digits.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3')
}

const formatCNPJ = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 14)
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
}

const formatPhone = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
}

const saveCustomer = () => {
  duplicateMessage.value = ''

  if (!customer.number || !customer.name) return

  const cleanedNumber = customer.number.trim()
  const cleanedCNPJ = customer.cnpj.trim()

  const numberDuplicateIndex = customers.findIndex((c, index) => c.number === cleanedNumber && index !== editingIndex.value)
  if (numberDuplicateIndex >= 0) {
    duplicateMessage.value = `Já existe um cliente cadastrado para o número ${cleanedNumber}.`
    return
  }

  if (cleanedCNPJ) {
    const cnpjDuplicateIndex = customers.findIndex((c, index) => c.cnpj === cleanedCNPJ && index !== editingIndex.value)
    if (cnpjDuplicateIndex >= 0) {
      duplicateMessage.value = `Já existe um cliente cadastrado para o CNPJ ${cleanedCNPJ}.`
      return
    }
  }

  if (editingIndex.value !== null) {
    customers[editingIndex.value] = { ...customer }
  } else {
    customers.push({ ...customer })
  }

  saveCustomers(customers)
  Object.assign(customer, { number: '', cnpj: '', name: '', phone: '' })
  editingIndex.value = null
  searchQuery.value = ''
}

const editCustomer = (savedCustomer) => {
  editingIndex.value = customers.findIndex(c => c.number === savedCustomer.number)
  Object.assign(customer, { ...savedCustomer })
  duplicateMessage.value = ''
}

const deleteCustomer = (index) => {
  if (!confirm('Deseja excluir este cliente?')) return
  customers.splice(index, 1)
  saveCustomers(customers)
}

const logout = () => {
  router.push('/')
}
</script>
