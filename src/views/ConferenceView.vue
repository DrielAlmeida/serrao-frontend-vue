<template>
  <div class="min-h-screen bg-slate-50">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 p-4 sm:p-8">

      <div class="mx-auto max-w-5xl space-y-6">
        <header class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h1 class="text-3xl font-semibold text-slate-900">Conferência de Liberação</h1>
          <p class="mt-2 text-sm text-slate-600">Lista agrupada por cliente com itens liberados e ação de finalizar.</p>
          <div class="grid gap-4 sm:grid-cols-4">
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
            <div v-if="showFilterFields">
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
            <div v-if="showFilterFields">
              <label class="block text-sm font-medium text-slate-700">Data início</label>
              <input
                v-model="startDateFilter"
                type="date"
                class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div v-if="showFilterFields">
              <label class="block text-sm font-medium text-slate-700">Data fim</label>
              <input
                v-model="endDateFilter"
                type="date"
                class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
          </div>
          <div class="mt-4 flex items-center justify-between gap-3">
            <button
              @click="showFilterFields = !showFilterFields"
              class="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              {{ showFilterFields ? 'Encolher filtros' : 'Expandir filtros' }}
            </button>
            <button
              @click="fetchReleases"
              class="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-800 px-5 text-sm font-semibold text-white hover:bg-slate-900"
            >
              Aplicar período
            </button>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import SideMenu from '../components/SideMenu.vue'
import { getClientes, getPedidosByRange, getProdutos, updatePedidoStatus, deletePedido } from '../utils/api'

const router = useRouter()
const searchTerm = ref('')
const statusFilter = ref('todos')
const startDateFilter = ref('')
const endDateFilter = ref('')
const showFilterFields = ref(true)
const releases = ref([])
const customers = ref([])
const products = ref([])
const loading = ref(false)

const getDefaultYesterday = () => {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

const getTodayDate = () => {
  return new Date().toISOString().split('T')[0]
}

const findCustomer = (order) => {
  const customerCode = String(order.customerNumber || order.codigo_cliente || order.codigo_cliente_externo || order.cliente?.codigo_cliente || '')
  const customerId = order.cliente_id ?? order.cliente?.id

  return customers.value.find((customer) => {
    if (customerCode && String(customer.codigo_cliente) === customerCode) {
      return true
    }

    if (customerId !== undefined && customerId !== null && customer.id === customerId) {
      return true
    }

    return false
  })
}

const findProduct = (item) => {
  const productCode = String(item.codigo_produto || item.codigo_produto_externo || item.code || item.produto?.codigo_produto || '')
  return products.value.find((product) => String(product.codigo_produto) === productCode)
}

const normalizeOrder = (order) => {
  const rawItems = order.itens || order.items || []
  const customer = findCustomer(order)
  return {
    id: String(order.id ?? order.numero_pedido ?? ''),
    cliente_id: order.cliente_id ?? order.cliente?.id ?? customer?.id ?? null,
    customerId: order.customerId ?? order.cliente_id ?? order.cliente?.id ?? customer?.id ?? null,
    customerName: order.customerName || order.nome_cliente || order.cliente?.nome || customer?.nome || 'Cliente não informado',
    customerNumber: String(order.customerNumber || order.codigo_cliente || order.codigo_cliente_externo || order.cliente?.codigo_cliente || customer?.codigo_cliente || '-'),
    date: order.date || order.data_pedido || new Date().toISOString(),
    status: order.status || 'pendente',
    items: rawItems.map((item) => {
      const product = findProduct(item)
      return {
      codigo_produto: item.codigo_produto || item.codigo_produto_externo || item.code || item.produto?.codigo_produto || product?.codigo_produto || '',
      code: item.code || item.codigo_produto || item.codigo_produto_externo || item.produto?.codigo_produto || product?.codigo_produto || '',
      nome: item.nome || item.name || item.produto?.nome || product?.nome || 'Item sem nome',
      name: item.name || item.nome || item.produto?.nome || product?.nome || 'Item sem nome',
      quantity: Number(item.quantity || item.quantidade || 0),
      unidade_medida: item.unidade_medida || item.unit || item.produto?.unidade_medida || product?.unidade_medida || 'UN',
      unit: item.unit || item.unidade_medida || item.produto?.unidade_medida || product?.unidade_medida || 'UN',
      preco_unitario: Number(item.preco_unitario || item.preco_unitario_no_ato || item.price || item.produto?.preco_unitario || product?.preco_unitario || 0),
      price: Number(item.price || item.preco_unitario || item.preco_unitario_no_ato || item.produto?.preco_unitario || product?.preco_unitario || 0),
      observation: item.observation || item.observacao || ''
    }
    })
  }
}

const loadReferenceData = async () => {
  const [clientes, produtos] = await Promise.all([getClientes(), getProdutos()])
  customers.value = Array.isArray(clientes) ? clientes : []
  products.value = Array.isArray(produtos) ? produtos : []
}

const fetchReleases = async () => {
  loading.value = true
  try {
    const startDate = startDateFilter.value || getDefaultYesterday()
    const endDate = endDateFilter.value || getTodayDate()
    const normalizedStart = startDate <= endDate ? startDate : endDate
    const normalizedEnd = startDate <= endDate ? endDate : startDate

    const data = await getPedidosByRange(normalizedStart, normalizedEnd)
    releases.value = Array.isArray(data) ? data.map(normalizeOrder) : []
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    releases.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadReferenceData()
  await fetchReleases()
})

const groupedReleases = computed(() => {
  const term = searchTerm.value.toLowerCase().trim()
  const status = statusFilter.value.toLowerCase()

  return releases.value.filter((order) => {
    const orderId = String(order.id || '').toLowerCase()
    const customerName = String(order.customerName || '').toLowerCase()
    const customerNumber = String(order.customerNumber || '').toLowerCase()

    const matchesTerm = !term ||
      customerName.includes(term) ||
      orderId.includes(term) ||
      customerNumber.includes(term)

    const matchesStatus = status === 'todos' || order.status === status
    return matchesTerm && matchesStatus
  })
})
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const editOrder = (order) => {
  // Salvar o pedido em sessionStorage para carregar na tela de lançamento
  sessionStorage.setItem('editOrder', JSON.stringify(order))
  router.push('/lancamento')
}

const deleteOrder = async (orderId) => {
  if (!confirm(`Deseja excluir o pedido ${orderId}?`)) {
    return
  }

  const result = await deletePedido(orderId)
  if (!result.success) {
    alert(`Erro ao excluir pedido: ${result.error}`)
    return
  }

  releases.value = releases.value.filter(order => String(order.id) !== String(orderId))
  alert(`Pedido ${orderId} excluído com sucesso!`)
}

const escapeHtml = (value) => {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const normalizePrintableItem = (item) => {
  const product = findProduct(item)
  return {
    code: item.code || item.codigo_produto || item.codigo_produto_externo || item.produto?.codigo_produto || product?.codigo_produto || '-',
    name: item.name || item.nome || item.produto?.nome || product?.nome || '-',
    quantity: Number(item.quantity || item.quantidade || 0),
    unit: item.unit || item.unidade_medida || item.produto?.unidade_medida || product?.unidade_medida || '-',
    price: Number(item.price || item.preco_unitario || item.preco_unitario_no_ato || item.produto?.preco_unitario || product?.preco_unitario || 0),
    observation: item.observation || item.observacao || ''
  }
}

const printOrder = (order) => {
  const printableItems = (order.items || order.itens || []).map(normalizePrintableItem)

  const orderItemsHtml = printableItems.map((item) => {
    const observation = item.observation ? escapeHtml(item.observation) : '-'
    const itemTotal = formatCurrency(item.price * item.quantity)
    return `
      <tr>
        <td class="border px-4 py-3">${escapeHtml(item.code)}</td>
        <td class="border px-4 py-3">${escapeHtml(item.name)}</td>
        <td class="border px-4 py-3 text-center">${item.quantity}</td>
        <td class="border px-4 py-3 text-center">${escapeHtml(item.unit)}</td>
        <td class="border px-4 py-3 text-right">${formatCurrency(item.price)}</td>
        <td class="border px-4 py-3">${observation}</td>
        <td class="border px-4 py-3 text-right">${itemTotal}</td>
      </tr>
    `
  }).join('')

  const totalItems = printableItems.reduce((sum, item) => sum + item.quantity, 0)
  const totalAmount = printableItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const formattedDate = order.date ? new Date(order.date).toLocaleString('pt-BR') : '-'

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
            <p class="title">Pedido ${escapeHtml(order.id)}</p>
            <p class="subtitle">Data: ${escapeHtml(formattedDate)}</p>
          </div>

          <div class="section grid">
            <div class="box">
              <p class="section-title">Cliente</p>
              <p><strong>Nome:</strong> ${escapeHtml(order.customerName)}</p>
              <p><strong>Número:</strong> ${escapeHtml(order.customerNumber)}</p>
            </div>
            <div class="box">
              <p class="section-title">Resumo</p>
              <p><strong>Total de itens:</strong> ${totalItems}</p>
              <p><strong>Valor total:</strong> ${formatCurrency(totalAmount)}</p>
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
                  <td class="text-right">${formatCurrency(totalAmount)}</td>
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

  const printWindow = window.open('', '_blank', 'width=1024,height=768')

  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    printWindow.onload = () => {
      printWindow.print()
    }
  } else {
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
