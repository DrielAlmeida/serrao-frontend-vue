<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 text-slate-900">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">

        <header class="mb-6 rounded-3xl border border-emerald-200 bg-white/90 p-6 shadow-sm">
        <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p class="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-700">Bridge</p>
            <h1 class="text-3xl font-semibold text-emerald-900">Lançamento de Pedido</h1>
            <p class="mt-2 max-w-2xl text-sm text-slate-600">
              Selecione o cliente, adicione itens por código ou nome e confirme o carrinho antes de enviar.
            </p>
          </div>
          <div class="rounded-3xl bg-emerald-50 p-4 text-slate-700 shadow-sm">
            <p class="text-sm uppercase tracking-[0.18em] text-emerald-700">Resumo atual</p>
            <p class="mt-2 text-xl font-semibold text-emerald-900">Itens: {{ cartItems.length }}</p>
            <p class="text-sm text-slate-600">Subtotal: {{ formatCurrency(cartSubtotal) }}</p>
          </div>
        </div>
      </header>

      <div class="grid gap-6 lg:grid-cols-[1.8fr_1fr]">
        <div class="space-y-6">
          <section class="rounded-3xl border border-emerald-200 bg-white/95 p-5 shadow-sm">
            <h2 class="mb-4 text-xl font-semibold text-emerald-900">Buscar cliente</h2>
            <div class="grid gap-4 sm:grid-cols-[1.8fr_auto]">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Número ou nome do cliente</label>
                <input
                  v-model="customerSearch"
                  @input="onCustomerSearchInput"
                  @keydown.enter.prevent="searchCustomer"
                  ref="customerNumberInput"
                  type="text"
                  placeholder="12.345.678 ou Nome do cliente"
                  class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
                <ul v-if="openCustomerSuggestions && filteredCustomers.length" class="mt-2 max-h-72 overflow-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
                  <li
                    v-for="customer in filteredCustomers"
                    :key="customer.id"
                    @mousedown.prevent="selectCustomer(customer)"
                    class="cursor-pointer border-b border-slate-200 px-4 py-3 transition hover:bg-emerald-50"
                  >
                    <p class="font-semibold text-slate-900">{{ customer.nome }}</p>
                    <p class="text-sm text-slate-500">{{ customer.codigo_cliente }}</p>
                  </li>
                </ul>
              </div>
              <button
                @click="searchCustomer"
                class="inline-flex h-12 items-center justify-center rounded-2xl bg-emerald-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-300"
              >
                Pesquisar
              </button>
            </div>

            <div class="mt-4 space-y-2">
              <p v-if="customerName" class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                Cliente encontrado: <span class="font-semibold">{{ customerName }}</span>
              </p>
              <p v-else class="rounded-2xl bg-orange-50 px-4 py-3 text-sm text-orange-900">
                Use o número do cliente para buscar. Digite e pressione Enter ou clique em Pesquisar.
              </p>
            </div>
          </section>

          <section class="rounded-3xl border border-orange-200 bg-white/95 p-5 shadow-sm">
            <h2 class="mb-4 text-xl font-semibold text-orange-900">Buscar item</h2>
            <div class="space-y-4">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Código ou nome do item</label>
                <input
                  v-model="itemSearchText"
                  @input="openSuggestions = true"
                  @keydown.enter.prevent="selectFirstSuggestion"
                  ref="itemCodeInput"
                  type="text"
                  placeholder="Ex: 001 ou Cenoura"
                  class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                />
              </div>

              <ul v-if="openSuggestions && filteredItems.length" class="max-h-72 overflow-auto rounded-3xl border border-slate-200 bg-white shadow-sm sm:max-h-56">
                <li
                  v-for="item in filteredItems"
                  :key="item.id"
                  @click="selectItem(item)"
                  class="cursor-pointer border-b border-slate-200 px-4 py-3 transition hover:bg-emerald-50"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="font-semibold text-slate-900">{{ item.codigo_produto }} — {{ item.nome }}</p>
                      <p class="text-sm text-slate-500">R$ {{ formatCurrency(item.preco_unitario) }} / unidade</p>
                    </div>
                    <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">Selecionar</span>
                  </div>
                </li>
              </ul>

              <div v-if="selectedItem" class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-sm text-slate-500">Item selecionado</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">{{ selectedItem.codigo_produto }} — {{ selectedItem.nome }}</p>
                <p class="text-sm text-slate-600">Preço: {{ formatCurrency(selectedItem.preco_unitario) }} / unidade</p>
              </div>

              <div v-if="selectedItem" class="grid gap-4 sm:grid-cols-[1.2fr_auto]">
                <label class="block">
                  <span class="mb-2 block text-sm font-medium text-slate-700">Quantidade</span>
                  <div class="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      @click="decreaseQuantity"
                      class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 text-xl font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      -
                    </button>
                    <input
                      v-model.number="quantity"
                      @keydown.enter.prevent="handleQuantityEnter"
                      ref="quantityInput"
                      type="number"
                      min="0.1"
                      step="0.1"
                      class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                    />
                    <button
                      type="button"
                      @click="increaseQuantity"
                      class="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 text-xl font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      +
                    </button>
                  </div>
                </label>

                <label class="block">
                  <span class="mb-2 block text-sm font-medium text-slate-700">Observação</span>
                  <textarea
                    v-model="observation"
                    ref="observationInput"
                    rows="3"
                    placeholder="Anote observações do cliente para este item"
                    class="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                </label>

                <button
                  @click="addItemToCart"
                  :disabled="!canAddItem"
                  class="inline-flex h-12 items-center justify-center rounded-2xl bg-orange-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-orange-300"
                >
                  Adicionar à lista
                </button>
              </div>
            </div>
          </section>

          <section class="rounded-3xl border border-emerald-200 bg-white/95 p-5 shadow-sm">
            <div class="flex items-center justify-between gap-4">
              <div>
                <h2 class="text-xl font-semibold text-emerald-900">Itens adicionados</h2>
                <p class="text-sm text-slate-500">O carrinho é atualizado em tempo real.</p>
              </div>
              <button
                @click="clearCart"
                :disabled="cartItems.length === 0"
                class="rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Limpar lista
              </button>
            </div>

            <div class="mt-4 space-y-4">
              <article
                v-for="(item, index) in cartItems"
                :key="item.id"
                class="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:flex sm:items-center sm:justify-between"
              >
                <div>
                  <p class="font-semibold text-slate-900">{{ item.codigo_produto }} — {{ item.nome }}</p>
                  <p class="mt-1 text-sm text-slate-600">{{ item.quantity }} x {{ formatCurrency(item.preco_unitario) }} / unidade</p>
                  <p v-if="item.observation" class="mt-2 rounded-2xl bg-white/90 px-3 py-2 text-sm text-slate-700">Observação: {{ item.observation }}</p>
                </div>
                <div class="mt-4 flex items-center gap-3 sm:mt-0">
                  <p class="text-lg font-semibold text-emerald-900">{{ formatCurrency(item.preco_unitario * item.quantity) }}</p>
                  <button
                    @click="removeItem(index)"
                    class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
                  >
                    Remover
                  </button>
                </div>
              </article>

              <div v-if="cartItems.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
                Nenhum item adicionado ainda. Selecione um produto e adicione o primeiro item.
              </div>
            </div>

            <div class="mt-6 rounded-3xl bg-emerald-50 p-5 shadow-inner sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-slate-600">Subtotal do pedido</p>
                <p class="mt-1 text-3xl font-semibold text-emerald-900">{{ formatCurrency(cartSubtotal) }}</p>
              </div>
              <button
                @click="finalizeOrder"
                :disabled="cartItems.length === 0 || !customerName || loading"
                class="mt-4 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-700 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:mt-0 sm:w-auto"
              >
                {{ loading ? 'Enviando...' : 'Finalizar lançamento' }}
              </button>
            </div>
          </section>
        </div>

        <aside class="hidden lg:block">
          <div class="sticky top-6 space-y-4 rounded-3xl border border-emerald-200 bg-emerald-50/95 p-6 shadow-sm">
            <h2 class="text-xl font-semibold text-emerald-900">Resumo do pedido</h2>
            <div class="space-y-3 text-sm text-slate-700">
              <p><strong>Cliente:</strong> {{ customerName || 'Nenhum cliente' }}</p>
              <p><strong>Itens no carrinho:</strong> {{ cartItems.length }}</p>
              <p><strong>Quantidade total:</strong> {{ totalQuantity }}</p>
              <p><strong>Subtotal:</strong> {{ formatCurrency(cartSubtotal) }}</p>
            </div>
            <div class="rounded-3xl bg-white p-4 shadow-sm">
              <p class="text-sm uppercase tracking-[0.2em] text-emerald-700">Dica</p>
              <p class="mt-2 text-sm text-slate-600">No desktop, use Tab para navegar do código ao campo quantidade e pressione Enter para adicionar rapidamente.</p>
            </div>
          </div>
        </aside>
      </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideMenu from '../components/SideMenu.vue'
import { getClientes, getProdutos, enviarPedido, roundNumber } from '../utils/api.js'

const router = useRouter()

const customerSearch = ref('')
const customerName = ref('')
const selectedCustomerNumber = ref('')
const openCustomerSuggestions = ref(false)
const itemSearchText = ref('')
const quantity = ref(1.0) // Permitir decimais
const observation = ref('')
const cartItems = ref([])
const selectedItem = ref(null)

const customerNumberInput = ref(null)
const itemCodeInput = ref(null)
const quantityInput = ref(null)
const observationInput = ref(null)

const customers = ref([])
const items = ref([])
const loading = ref(false)

const editingOrderId = ref(null)

onMounted(async () => {
  loading.value = true
  try {
    customers.value = await getClientes()
    items.value = await getProdutos()
  } catch (error) {
    console.error('Erro ao carregar dados:', error)
    alert('Erro ao carregar dados. Verifique sua conexão.')
  } finally {
    loading.value = false
  }

  // Verificar se há pedido para editar
  const editOrderData = sessionStorage.getItem('editOrder')
  if (editOrderData) {
    const order = JSON.parse(editOrderData)
    customerSearch.value = order.customerNumber
    customerName.value = order.customerName
    // Arredondar todas as quantidades ao carregar
    cartItems.value = order.items.map(item => ({
      ...item,
      quantity: roundNumber(item.quantity, 2)
    }))
    editingOrderId.value = order.id
    sessionStorage.removeItem('editOrder')
  }
})

const formatCustomerNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return digits.replace(/(\d{2})(\d+)/, '$1.$2')
  return digits.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3')
}

const filteredItems = computed(() => {
  const term = itemSearchText.value.trim().toLowerCase()
  if (!term) return []
  return items.value.filter((item) => {
    return (
      item.codigo_produto.toLowerCase().includes(term) ||
      item.nome.toLowerCase().includes(term)
    )
  })
})

const filteredCustomers = computed(() => {
  const term = customerSearch.value.trim().toLowerCase()
  if (!term) return []

  const digitTerm = term.replace(/\D/g, '')
  return customers.value.filter((customer) => {
    const normalizedNumber = customer.codigo_cliente.replace(/\D/g, '')
    const matchesNumber = digitTerm.length > 0 && normalizedNumber.includes(digitTerm)
    const matchesName = customer.nome.toLowerCase().includes(term)
    return matchesNumber || matchesName
  })
})

const onCustomerSearchInput = () => {
  const value = customerSearch.value
  openCustomerSuggestions.value = true
  customerName.value = ''
  selectedCustomerNumber.value = ''

  if (/[A-Za-zÀ-ÿ]/.test(value)) {
    return
  }
  customerSearch.value = formatCustomerNumber(value)
}

const searchCustomer = () => {
  const clean = customerSearch.value.trim()
  const term = clean.toLowerCase()
  const found = customers.value.find((customer) => {
    return (
      customer.codigo_cliente === clean ||
      customer.nome.toLowerCase().includes(term)
    )
  })

  if (found) {
    customerName.value = found.nome
    selectedCustomerNumber.value = found.codigo_cliente
  } else {
    customerName.value = ''
    selectedCustomerNumber.value = ''
  }

  openCustomerSuggestions.value = false
}

const selectCustomer = (customer) => {
  customerSearch.value = customer.nome
  customerName.value = customer.nome
  selectedCustomerNumber.value = customer.codigo_cliente
  openCustomerSuggestions.value = false
  nextTick(() => itemCodeInput.value?.focus())
}

const selectItem = (item) => {
  selectedItem.value = reactive({ ...item })
  itemSearchText.value = `${item.codigo_produto} - ${item.nome}`
  openSuggestions.value = false
  quantity.value = 1.0
  observation.value = ''
  nextTick(() => quantityInput.value?.focus())
}

const selectFirstSuggestion = () => {
  if (filteredItems.value.length === 1) {
    selectItem(filteredItems.value[0])
  }
}

const addItemToCart = () => {
  if (!selectedItem.value || quantity.value < 0.1) return

  const note = observation.value.trim()
  const roundedQty = roundNumber(quantity.value, 2)
  const existing = cartItems.value.find((item) => item.codigo_produto === selectedItem.value.codigo_produto && item.observation === note)
  if (existing) {
    existing.quantity = roundNumber(existing.quantity + roundedQty, 2)
  } else {
    cartItems.value.push({ ...selectedItem.value, quantity: roundedQty, observation: note })
  }

  selectedItem.value = null
  itemSearchText.value = ''
  quantity.value = 1.0
  observation.value = ''
  openSuggestions.value = false
  nextTick(() => itemCodeInput.value?.focus())
}

const removeItem = (index) => {
  cartItems.value.splice(index, 1)
}

const clearCart = () => {
  cartItems.value = []
}

const finalizeOrder = async () => {
  if (!customerName.value || cartItems.value.length === 0) return

  loading.value = true

  const result = await enviarPedido({
    customerNumber: selectedCustomerNumber.value,
    customerName: customerName.value,
    items: cartItems.value,
    subtotal: cartSubtotal.value
  })

  loading.value = false

  if (result.success) {
    alert(`Pedido enviado com sucesso! ID: ${result.data.pedido_id}`)
    clearCart()
    customerSearch.value = ''
    customerName.value = ''
    selectedCustomerNumber.value = ''
  } else {
    alert(`Erro ao enviar pedido: ${result.error}`)
  }
}

const increaseQuantity = () => {
  quantity.value = roundNumber(Math.max(0.1, quantity.value + 0.1), 2)
}

const decreaseQuantity = () => {
  quantity.value = roundNumber(Math.max(0.1, quantity.value - 0.1), 2)
}

const handleQuantityEnter = () => {
  if (canAddItem.value) addItemToCart()
}

const cartSubtotal = computed(() => {
  const total = cartItems.value.reduce((sum, item) => sum + item.preco_unitario * item.quantity, 0)
  return roundNumber(total, 2)
})

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const canAddItem = computed(() => {
  return selectedItem.value !== null && quantity.value >= 0.1
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const logout = () => {
  router.push('/')
}
</script>
