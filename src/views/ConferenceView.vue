<template>
  <div class="min-h-screen bg-slate-50">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 p-4 sm:p-8">

      <div class="mx-auto max-w-5xl space-y-6">
        <header class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 class="text-3xl font-semibold text-slate-900">Conferência de Liberação</h1>
          <p class="mt-2 text-sm text-slate-600">Lista agrupada por cliente com itens liberados e ação de finalizar.</p>
          <div class="mt-4">
            <label class="block text-sm font-medium text-slate-700">Pesquisar pedidos</label>
            <input
              v-model="searchTerm"
              @input="searchTerm = $event.target.value"
              type="text"
              placeholder="Nome do cliente, número do pedido ou código do cliente"
              class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </header>

        <section class="grid gap-6">
          <div v-for="group in groupedReleases" :key="group.id" class="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-xl font-semibold text-emerald-900">{{ group.customerName }}</h2>
                <p class="text-sm text-slate-600">Número do cliente: {{ group.customerNumber }}</p>
                <p class="text-sm text-slate-600">Número do pedido: {{ group.id }}</p>
                <p class="text-sm text-slate-600">Data: {{ new Date(group.date).toLocaleString('pt-BR') }}</p>
              </div>
              <div class="flex gap-2">
                <button @click="editOrder(group)" class="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Editar</button>
                <button @click="deleteOrder(group.id)" class="inline-flex h-12 items-center justify-center rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">Excluir</button>
                <button class="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700">Finalizar liberação</button>
              </div>
            </div>

            <div class="mt-4 space-y-3 sm:grid sm:grid-cols-2 sm:gap-4">
              <article v-for="item in group.items" :key="item.code" class="rounded-3xl border border-slate-200 bg-emerald-50 p-4">
                <p class="font-semibold text-slate-900">{{ item.name }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ item.quantity }} x {{ item.unit }} • {{ formatCurrency(item.price) }}</p>
              </article>
            </div>
          </div>

          <div v-if="groupedReleases.length === 0 && searchTerm" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
            Nenhum pedido encontrado para "{{ searchTerm }}".
          </div>

          <div v-if="releases.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
            Nenhum pedido lançado ainda.
          </div>
        </section>
      </div>
    </main>
  </div></div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import SideMenu from '../components/SideMenu.vue'
import { useLocalStorage } from '../utils/localStorage.js'

const router = useRouter()
const { getOrders, saveOrders } = useLocalStorage()
const releases = ref([])
const searchTerm = ref('')

onMounted(() => {
  releases.value = getOrders()
  console.log('Loaded orders:', releases.value)
})

watch(searchTerm, (newVal) => {
  console.log('Search term changed:', newVal)
})

const groupedReleases = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  console.log('Search term:', term, 'Releases:', releases.value.length)
  if (!term) return releases.value

  const filtered = releases.value.filter(order =>
    order.customerName.toLowerCase().includes(term) ||
    order.id.toLowerCase().includes(term) ||
    order.customerNumber.toLowerCase().includes(term)
  )
  console.log('Filtered results:', filtered.length)
  return filtered
})
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const editOrder = (order) => {
  // Salvar o pedido em sessionStorage para carregar na tela de lançamento
  sessionStorage.setItem('editOrder', JSON.stringify(order))
  router.push('/lancamento')
}

const deleteOrder = (orderId) => {
  if (confirm('Tem certeza que deseja excluir este lançamento?')) {
    releases.value = releases.value.filter(order => order.id !== orderId)
    saveOrders(releases.value)
  }
}

const logout = () => {
  router.push('/')
}
</script>
