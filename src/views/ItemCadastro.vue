<template>
  <div class="min-h-screen bg-emerald-50">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 p-4 sm:p-8">

      <div class="mx-auto max-w-3xl rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
        <h1 class="mb-6 text-2xl font-semibold text-emerald-900">Cadastro de Item</h1>
        <form class="space-y-5">
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Código</span>
              <input v-model="item.code" type="text" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Nome</span>
              <input v-model="item.name" type="text" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
            </label>
          </div>

          <div class="grid gap-4 sm:grid-cols-3">
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Valor</span>
              <input v-model.number="item.price" type="number" min="0" step="0.01" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" />
            </label>
            <label class="block">
              <span class="text-sm font-medium text-slate-700">Unidade</span>
              <select v-model="item.unit" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200">
                <option value="KG">KG</option>
                <option value="UN">UN</option>
                <option value="CX">CX</option>
                <option value="MÇ">MÇ</option>
              </select>
            </label>
          </div>

          <label class="block">
            <span class="text-sm font-medium text-slate-700">Notas</span>
            <textarea v-model="item.notes" rows="4" class="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200" placeholder="Observações ou instruções adicionais"></textarea>
          </label>

          <button @click.prevent="saveItem" :disabled="loading" class="rounded-2xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:bg-emerald-500 disabled:cursor-not-allowed">
            {{ loading ? 'Salvando...' : (editingIndex !== null ? 'Atualizar item' : 'Salvar item') }}
          </button>
          <p v-if="duplicateMessage" class="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{{ duplicateMessage }}</p>
          <p v-if="successMessage" class="mt-3 rounded-2xl bg-green-50 p-3 text-sm text-green-700">{{ successMessage }}</p>
        </form>
      </div>

      <div class="mx-auto max-w-3xl mt-6 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-xl font-semibold text-emerald-900">Itens cadastrados</h2>
            <p class="text-sm text-slate-500">Edite ou exclua qualquer item registrado.</p>
          </div>
          <span class="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">{{ items.length }}</span>
        </div>

        <div v-if="loading" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
          Carregando produtos...
        </div>

        <div v-else-if="items.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center text-sm text-slate-500">
          Nenhum item cadastrado ainda.
        </div>

        <div v-else class="space-y-4">
          <article v-for="(savedItem, index) in items" :key="savedItem.code" class="rounded-3xl border border-slate-200 bg-emerald-50 p-4 shadow-sm sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="font-semibold text-slate-900">{{ savedItem.code }} — {{ savedItem.name }}</p>
              <p class="mt-1 text-sm text-slate-600">{{ formatCurrency(savedItem.price) }} / {{ savedItem.unit }}</p>
              <p v-if="savedItem.notes" class="mt-1 text-sm text-slate-500">{{ savedItem.notes }}</p>
            </div>
            <div class="mt-4 flex gap-2 sm:mt-0">
              <button @click="editItem(savedItem)" class="rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Editar</button>
              <button @click="deleteItem(index)" class="rounded-2xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700">Excluir</button>
            </div>
          </article>
        </div>
      </div>
    </main>
  </div></div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SideMenu from '../components/SideMenu.vue'
import { getProdutos, createProduto, updateProduto, deleteProduto } from '../utils/api.js'

const router = useRouter()
const items = reactive([])
const editingIndex = ref(null)
const duplicateMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

onMounted(async () => {
  await loadProdutos()

  // Verificar se há um item para editar vindo da lista
  const editItemData = sessionStorage.getItem('editItem')
  if (editItemData) {
    const itemToEdit = JSON.parse(editItemData)
    Object.assign(item, itemToEdit)
    editingIndex.value = items.findIndex(i => i.id === itemToEdit.id)
    sessionStorage.removeItem('editItem')
  }
})

const item = reactive({ code: '', name: '', price: 0, unit: 'KG', notes: '' })

const loadProdutos = async () => {
  loading.value = true
  const produtos = await getProdutos()
  items.splice(0, items.length, ...produtos.map(p => ({
    id: p.id,
    code: p.codigo_produto,
    name: p.nome,
    price: p.preco_unitario,
    unit: p.unidade_medida,
    notes: p.observacao || ''
  })))
  loading.value = false
}

const saveItem = async () => {
  duplicateMessage.value = ''
  successMessage.value = ''
  loading.value = true

  // Validação básica
  if (!item.code.trim()) {
    duplicateMessage.value = 'Código é obrigatório.'
    loading.value = false
    return
  }

  if (!item.name.trim()) {
    duplicateMessage.value = 'Nome é obrigatório.'
    loading.value = false
    return
  }

  if (item.price <= 0) {
    duplicateMessage.value = 'Preço deve ser maior que zero.'
    loading.value = false
    return
  }

  try {
    let result
    if (editingIndex.value !== null) {
      // Atualizar produto existente
      const produtoId = items[editingIndex.value].id
      result = await updateProduto(produtoId, item)
      if (result.success) {
        successMessage.value = 'Produto atualizado com sucesso!'
        await loadProdutos() // Recarregar lista
      } else {
        duplicateMessage.value = result.error
      }
    } else {
      // Criar novo produto
      result = await createProduto(item)
      if (result.success) {
        successMessage.value = 'Produto cadastrado com sucesso!'
        await loadProdutos() // Recarregar lista
      } else {
        duplicateMessage.value = result.error
      }
    }

    if (result.success) {
      // Limpar formulário
      Object.assign(item, { code: '', name: '', price: 0, unit: 'KG', notes: '' })
      editingIndex.value = null

      // Limpar mensagem de sucesso após 3 segundos
      setTimeout(() => {
        successMessage.value = ''
      }, 3000)
    }
  } catch (error) {
    duplicateMessage.value = 'Erro inesperado: ' + error.message
  }

  loading.value = false
}

const editItem = (savedItem) => {
  editingIndex.value = items.findIndex(i => i.id === savedItem.id)
  Object.assign(item, { ...savedItem })
  duplicateMessage.value = ''
  successMessage.value = ''
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteItem = async (index) => {
  const selectedItem = items[index]
  if (!confirm(`Deseja excluir o produto "${selectedItem.name}"?`)) return

  loading.value = true
  const result = await deleteProduto(selectedItem.id)
  loading.value = false

  if (result.success) {
    await loadProdutos() // Recarregar lista
    successMessage.value = 'Produto deletado com sucesso!'
    setTimeout(() => {
      successMessage.value = ''
    }, 3000)
  } else {
    duplicateMessage.value = result.error
  }
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
</script>
