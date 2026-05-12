<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-orange-50 text-slate-900">
    <div class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
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
        <main class="space-y-6">
          <section class="rounded-3xl border border-emerald-200 bg-white/95 p-5 shadow-sm">
            <h2 class="mb-4 text-xl font-semibold text-emerald-900">Buscar cliente</h2>
            <div class="grid gap-4 sm:grid-cols-[1.8fr_auto]">
              <div>
                <label class="mb-2 block text-sm font-medium text-slate-700">Número do cliente</label>
                <input
                  v-model="customerSearch"
                  @input="customerSearch = formatCustomerNumber(customerSearch)"
                  @keydown.enter.prevent="searchCustomer"
                  ref="customerNumberInput"
                  type="text"
                  placeholder="12.345.678"
                  maxlength="11"
                  class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
                />
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
                  :key="item.code"
                  @click="selectItem(item)"
                  class="cursor-pointer border-b border-slate-200 px-4 py-3 transition hover:bg-emerald-50"
                >
                  <div class="flex items-center justify-between gap-4">
                    <div>
                      <p class="font-semibold text-slate-900">{{ item.code }} — {{ item.name }}</p>
                      <p class="text-sm text-slate-500">{{ item.unit }} • {{ formatCurrency(item.price) }} / unidade</p>
                    </div>
                    <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">Selecionar</span>
                  </div>
                </li>
              </ul>

              <div v-if="selectedItem" class="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                <p class="text-sm text-slate-500">Item selecionado</p>
                <p class="mt-2 text-lg font-semibold text-slate-900">{{ selectedItem.code }} — {{ selectedItem.name }}</p>
                <p class="text-sm text-slate-600">Preço: {{ formatCurrency(selectedItem.price) }} / {{ selectedItem.unit }}</p>
              </div>

              <div v-if="selectedItem" class="grid gap-4 sm:grid-cols-[1fr_auto]">
                <label class="block">
                  <span class="mb-2 block text-sm font-medium text-slate-700">Quantidade</span>
                  <input
                    v-model.number="quantity"
                    @keydown.enter.prevent="handleQuantityEnter"
                    ref="quantityInput"
                    type="number"
                    min="1"
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
                :key="item.code"
                class="rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:flex sm:items-center sm:justify-between"
              >
                <div>
                  <p class="font-semibold text-slate-900">{{ item.code }} — {{ item.name }}</p>
                  <p class="mt-1 text-sm text-slate-600">{{ item.quantity }} x {{ formatCurrency(item.price) }} / {{ item.unit }}</p>
                </div>
                <div class="mt-4 flex items-center gap-3 sm:mt-0">
                  <p class="text-lg font-semibold text-emerald-900">{{ formatCurrency(item.price * item.quantity) }}</p>
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
                :disabled="cartItems.length === 0 || !customerName"
                class="mt-4 inline-flex h-14 w-full items-center justify-center rounded-2xl bg-emerald-700 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-emerald-300 sm:mt-0 sm:w-auto"
              >
                Finalizar lançamento
              </button>
            </div>
          </section>
        </main>

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
    </div>
  </div>
</template>

<script setup>
import { computed, nextTick, ref, reactive } from 'vue'

const customerSearch = ref('')
const customerName = ref('')
const openSuggestions = ref(false)
const itemSearchText = ref('')
const quantity = ref(1)
const cartItems = ref([])
const selectedItem = ref(null)

const customerNumberInput = ref(null)
const itemCodeInput = ref(null)
const quantityInput = ref(null)

const mockCustomers = [
  { number: '12.345.678', name: 'Hortifruti Serrão' },
  { number: '98.765.432', name: 'Feira Verde Ltda' },
  { number: '11.223.344', name: 'Mercado do Vale' },
]

const mockItems = [
  { code: '001', name: 'Maçã', price: 4.5, unit: 'KG' },
  { code: '002', name: 'Banana', price: 3.2, unit: 'KG' },
  { code: '003', name: 'Alface', price: 2.1, unit: 'UN' },
  { code: '004', name: 'Cenoura', price: 5.3, unit: 'KG' },
  { code: '005', name: 'Tomate', price: 6.9, unit: 'KG' },
]

const formatCustomerNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 5) return digits.replace(/(\d{2})(\d+)/, '$1.$2')
  return digits.replace(/(\d{2})(\d{3})(\d{0,3})/, '$1.$2.$3')
}

const filteredItems = computed(() => {
  const term = itemSearchText.value.trim().toLowerCase()
  if (!term) return []
  return mockItems.filter((item) => {
    return item.code.toLowerCase().includes(term) || item.name.toLowerCase().includes(term)
  })
})

const searchCustomer = () => {
  const clean = customerSearch.value.trim()
  const found = mockCustomers.find((customer) => customer.number === clean)
  customerName.value = found ? found.name : ''
}

const selectItem = (item) => {
  selectedItem.value = reactive({ ...item })
  itemSearchText.value = `${item.code} - ${item.name}`
  openSuggestions.value = false
  quantity.value = 1
  nextTick(() => quantityInput.value?.focus())
}

const selectFirstSuggestion = () => {
  if (filteredItems.value.length === 1) {
    selectItem(filteredItems.value[0])
  }
}

const addItemToCart = () => {
  if (!selectedItem.value || quantity.value < 1) return

  const existing = cartItems.value.find((item) => item.code === selectedItem.value.code)
  if (existing) {
    existing.quantity += quantity.value
  } else {
    cartItems.value.push({ ...selectedItem.value, quantity: quantity.value })
  }

  selectedItem.value = null
  itemSearchText.value = ''
  quantity.value = 1
  openSuggestions.value = false
  nextTick(() => itemCodeInput.value?.focus())
}

const removeItem = (index) => {
  cartItems.value.splice(index, 1)
}

const clearCart = () => {
  cartItems.value = []
}

const finalizeOrder = () => {
  if (!customerName.value || cartItems.value.length === 0) return
  alert(`Pedido finalizado para ${customerName.value} com ${cartItems.value.length} itens. Total: ${formatCurrency(cartSubtotal.value)}`)
  clearCart()
}

const handleQuantityEnter = () => {
  if (canAddItem.value) addItemToCart()
}

const cartSubtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})

const totalQuantity = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
})

const canAddItem = computed(() => {
  return selectedItem.value !== null && quantity.value >= 1
})

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
