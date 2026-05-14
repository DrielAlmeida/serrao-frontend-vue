<template>
  <div class="min-h-screen bg-slate-50">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 p-4 sm:p-8">

      <div class="mx-auto max-w-5xl space-y-6">
        <header class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 class="text-3xl font-semibold text-slate-900">Conferência de Liberação</h1>
          <p class="mt-2 text-sm text-slate-600">Lista agrupada por cliente com itens liberados e ação de finalizar.</p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="block text-sm font-medium text-slate-700">Pesquisar pedidos</label>
              <input
                v-model="searchTerm"
                @input="searchTerm = $event.target.value"
                type="text"
                placeholder="Nome do cliente, número do pedido ou código do cliente"
                class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700">Filtrar por status</label>
              <select
                v-model="statusFilter"
                class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              >
                <option value="todos">Todos</option>
                <option value="pendente">Pendente</option>
                <option value="processado">Processado</option>
              </select>
            </div>
          </div>
        </header>

        <section class="grid gap-6">
          <div v-if="loading" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
            Carregando pedidos...
          </div>

          <div v-else-if="releases.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
            Nenhum pedido lançado ainda.
          </div>

          <div v-for="group in groupedReleases" v-else :key="group.id" class="rounded-3xl border border-emerald-200 bg-white p-5 shadow-sm">
            <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 class="text-xl font-semibold text-emerald-900">{{ group.customerName }}</h2>
                <p class="text-sm text-slate-600">Número do cliente: {{ group.customerNumber }}</p>
                <p class="text-sm text-slate-600">Número do pedido: {{ group.id }}</p>
                <p class="text-sm text-slate-600">Data: {{ new Date(group.date).toLocaleString('pt-BR') }}</p>
                <p class="mt-2 inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-700"
                   :class="group.status === 'processado' ? 'border-emerald-300 bg-emerald-100' : group.status === 'enviado' ? 'border-amber-300 bg-amber-100' : 'border-slate-300 bg-slate-100'"
                >
                  {{ group.status === 'processado' ? 'Processado' : group.status === 'enviado' ? 'Enviado' : 'Pendente' }}
                </p>
              </div>
              <div class="flex flex-wrap gap-2">
                <button @click="editOrder(group)" class="inline-flex h-12 items-center justify-center rounded-2xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700">Editar</button>
                <button @click="deleteOrder(group.id)" class="inline-flex h-12 items-center justify-center rounded-2xl bg-red-600 px-4 text-sm font-semibold text-white hover:bg-red-700">Excluir</button>
                <button @click="printOrder(group)" class="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-700 px-4 text-sm font-semibold text-white hover:bg-slate-800">Imprimir / PDF</button>
                <button
                  @click="finalizeOrder(group)"
                  :disabled="group.status === 'processado'"
                  class="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500"
                >
                  {{ group.status === 'processado' ? 'Liberado' : 'Finalizar liberação' }}
                </button>
              </div>
            </div>

            <div class="mt-4 space-y-3 sm:grid sm:grid-cols-2 sm:gap-4">
              <article v-for="item in group.items" :key="item.code" class="rounded-3xl border border-slate-200 bg-emerald-50 p-4">
                <p class="font-semibold text-slate-900">{{ item.name }}</p>
                <p class="mt-1 text-sm text-slate-600">{{ item.quantity }} x {{ item.unit }} • {{ formatCurrency(item.price) }}</p>
                <p v-if="item.observation" class="mt-2 rounded-2xl bg-white/90 px-3 py-2 text-sm text-slate-700">Observação: {{ item.observation }}</p>
              </article>
            </div>
          </div>

          <div v-if="groupedReleases.length === 0 && searchTerm && !loading" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
            Nenhum pedido encontrado para "{{ searchTerm }}".
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
import { getPedidos, updatePedidoStatus } from '../utils/api.js'

const router = useRouter()
const releases = ref([])
const searchTerm = ref('')
const statusFilter = ref('todos')
const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const pedidos = await getPedidos()
    // Mapear dados da API para o formato esperado pelo frontend
    releases.value = pedidos.map(pedido => ({
      id: pedido.id || pedido.pedido_id,
      customerName: pedido.cliente?.nome || 'Cliente desconhecido',
      customerNumber: pedido.cliente?.codigo_cliente || '',
      date: pedido.data_criacao || new Date().toISOString(),
      status: (pedido.status || pedido.situacao || pedido.status_pedido || 'pendente').toString().toLowerCase(),
      items: pedido.itens?.map(item => ({
        code: item.codigo_produto,
        name: item.nome || 'Produto',
        quantity: item.quantidade,
        unit: item.unidade_medida || 'UN',
        price: item.preco_unitario || 0,
        observation: item.observacao || ''
      })) || []
    }))
    console.log('Pedidos carregados:', releases.value)
  } catch (error) {
    console.error('Erro ao carregar pedidos:', error)
  } finally {
    loading.value = false
  }
})

watch(searchTerm, (newVal) => {
  console.log('Search term changed:', newVal)
})

const groupedReleases = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  const status = statusFilter.value.toLowerCase()

  const filtered = releases.value.filter(order => {
    const matchesTerm = !term ||
      order.customerName.toLowerCase().includes(term) ||
      order.id.toLowerCase().includes(term) ||
      order.customerNumber.toLowerCase().includes(term)

    const matchesStatus = status === 'todos' || order.status === status
    return matchesTerm && matchesStatus
  })

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
    // TODO: Implementar exclusão na API quando disponível
  }
}

const printOrder = (order) => {
  const orderItemsHtml = order.items.map((item) => {
    const observation = item.observation ? item.observation : '-'
    const itemTotal = formatCurrency(item.price * item.quantity)
    return `
      <tr>
        <td class="border px-4 py-3">${item.code}</td>
        <td class="border px-4 py-3">${item.name}</td>
        <td class="border px-4 py-3 text-center">${item.quantity}</td>
        <td class="border px-4 py-3 text-center">${item.unit}</td>
        <td class="border px-4 py-3 text-right">${formatCurrency(item.price)}</td>
        <td class="border px-4 py-3">${observation}</td>
        <td class="border px-4 py-3 text-right">${itemTotal}</td>
      </tr>
    `
  }).join('')

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Pedido ${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; color: #1f2937; margin: 0; padding: 24px; }
          .page { max-width: 900px; margin: auto; }
          .header { border-bottom: 1px solid #d1d5db; margin-bottom: 24px; padding-bottom: 16px; }
          .title { font-size: 28px; font-weight: 700; margin: 0 0 8px; }
          .subtitle { color: #4b5563; margin: 0; }
          .section { margin-bottom: 24px; }
          .section-title { font-size: 16px; font-weight: 700; margin-bottom: 12px; }
          .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
          .box { padding: 16px; border: 1px solid #d1d5db; border-radius: 16px; background: #f8fafc; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; }
          th, td { border: 1px solid #d1d5db; padding: 12px; text-align: left; vertical-align: top; }
          th { background: #f1f5f9; font-weight: 700; }
          .text-right { text-align: right; }
          .total-row td { font-weight: 700; }
          .footer { margin-top: 32px; color: #4b5563; font-size: 13px; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <p class="title">Pedido ${order.id}</p>
            <p class="subtitle">Data: ${new Date(order.date).toLocaleString('pt-BR')}</p>
          </div>

          <div class="section grid">
            <div class="box">
              <p class="section-title">Cliente</p>
              <p><strong>Nome:</strong> ${order.customerName}</p>
              <p><strong>Número:</strong> ${order.customerNumber}</p>
            </div>
            <div class="box">
              <p class="section-title">Resumo</p>
              <p><strong>Total de itens:</strong> ${order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
              <p><strong>Valor total:</strong> ${formatCurrency(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</p>
            </div>
          </div>

          <div class="section">
            <p class="section-title">Itens do pedido</p>
            <table>
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Item</th>
                  <th>Qtde</th>
                  <th>Unid.</th>
                  <th>Preço unit.</th>
                  <th>Observação</th>
                  <th class="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                ${orderItemsHtml}
                <tr class="total-row">
                  <td colspan="6" class="text-right">Total geral</td>
                  <td class="text-right">${formatCurrency(order.items.reduce((sum, item) => sum + item.price * item.quantity, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="footer">
            <p>Pedido gerado a partir do sistema Bridge Serrao.</p>
          </div>
        </div>
      </body>
    </html>
  `

  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)
  const printWindow = window.open(url, '_blank')

  if (printWindow) {
    printWindow.focus()
    printWindow.onload = () => {
      printWindow.print()
      URL.revokeObjectURL(url)
    }
  } else {
    URL.revokeObjectURL(url)
    alert('Não foi possível abrir a nova janela para impressão. Verifique se o bloqueador de pop-ups está ativo.')
  }
}

const finalizeOrder = async (order) => {
  if (order.status === 'processado') {
    alert('Este pedido já foi processado.')
    return
  }

  if (!confirm('Deseja finalizar a liberação e marcar este pedido como processado?')) {
    return
  }

  const result = await updatePedidoStatus(order.id, 'processado')
  if (result.success) {
    order.status = 'processado'
    releases.value = releases.value.map(item => item.id === order.id ? { ...item, status: 'processado' } : item)
    alert('Pedido finalizado e marcado como processado com sucesso.')
  } else {
    alert(result.error || 'Não foi possível finalizar a liberação do pedido.')
  }
}

const logout = () => {
  router.push('/')
}
</script>
