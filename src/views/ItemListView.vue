<template>
  <div class="min-h-screen bg-emerald-50">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 p-4 sm:p-8">

      <div class="mx-auto max-w-4xl space-y-6">
        <header class="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h1 class="text-3xl font-semibold text-emerald-900">Itens Cadastrados</h1>
          <p class="mt-2 text-sm text-slate-600">Veja todos os itens registrados e gerencie edição e exclusão.</p>
          <p v-if="successMessage" class="mt-3 rounded-2xl bg-green-50 p-3 text-sm text-green-700">{{ successMessage }}</p>
          <p v-if="errorMessage" class="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{{ errorMessage }}</p>
        </header>

        <div v-if="loading" class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
          Carregando itens...
        </div>

        <div v-else-if="items.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
          Nenhum item cadastrado ainda.
        </div>

        <div class="space-y-4">
          <article
            v-for="(savedItem, index) in items"
            :key="savedItem.code"
            class="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:flex sm:items-center sm:justify-between"
          >
            <div>
              <p class="font-semibold text-slate-900">{{ savedItem.code }} — {{ savedItem.name }}</p>
              <p class="mt-1 text-sm text-slate-600">Preço: {{ formatCurrency(savedItem.price) }} / {{ savedItem.unit }}</p>
              <p v-if="savedItem.notes" class="mt-2 text-sm text-slate-500">{{ savedItem.notes }}</p>
            </div>
            <div class="mt-4 flex flex-wrap gap-2 sm:mt-0">
              <button @click="editItem(savedItem)" class="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Editar</button>
              <button @click="deleteItem(index)" class="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Excluir</button>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div>
</div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideMenu from '../components/SideMenu.vue'
import { getProdutos, deleteProduto } from '../utils/api.js'

const router = useRouter()
const items = ref([])
const loading = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

onMounted(async () => {
  await loadProdutos()
})

const loadProdutos = async () => {
  loading.value = true
  const produtos = await getProdutos()
  items.value = produtos.map(p => ({
    id: p.id,
    code: p.codigo_produto,
    name: p.nome,
    price: p.preco_unitario,
    unit: p.unidade_medida,
    notes: p.observacao || ''
  }))
  loading.value = false
}

const editItem = (savedItem) => {
  // Navegar para a página de cadastro com o item para editar
  sessionStorage.setItem('editItem', JSON.stringify(savedItem))
  router.push('/item-cadastro')
}

const deleteItem = async (index) => {
  const selectedItem = items.value[index]
  if (!confirm(`Deseja excluir o produto "${selectedItem.name}"?`)) return

  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  const result = await deleteProduto(selectedItem.id)
  loading.value = false

  if (result.success) {
    await loadProdutos() // Recarregar lista
    successMessage.value = 'Produto deletado com sucesso!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } else {
    errorMessage.value = result.error
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
