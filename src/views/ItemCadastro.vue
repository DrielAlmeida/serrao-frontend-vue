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
            {{ loading ? 'Salvando...' : (editingItemId ? 'Atualizar item' : 'Salvar item') }}
          </button>
          <p v-if="duplicateMessage" class="mt-3 rounded-2xl bg-rose-50 p-3 text-sm text-rose-700">{{ duplicateMessage }}</p>
          <p v-if="successMessage" class="mt-3 rounded-2xl bg-green-50 p-3 text-sm text-green-700">{{ successMessage }}</p>
        </form>
      </div>
    </main>
  </div></div>
</template>

<script setup>
import { reactive, ref, onMounted } from 'vue'
import SideMenu from '../components/SideMenu.vue'
import { createProduto, updateProduto } from '../utils/api.js'

const editingItemId = ref(null)
const duplicateMessage = ref('')
const successMessage = ref('')
const loading = ref(false)

onMounted(async () => {
  // Verificar se há um item para editar vindo da lista
  const editItemData = sessionStorage.getItem('editItem')
  if (editItemData) {
    const itemToEdit = JSON.parse(editItemData)
    Object.assign(item, itemToEdit)
    editingItemId.value = itemToEdit.id
    sessionStorage.removeItem('editItem')
  }
})

const item = reactive({ code: '', name: '', price: 0, unit: 'KG', notes: '' })

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
    if (editingItemId.value) {
      // Atualizar produto existente
      result = await updateProduto(editingItemId.value, item)
      if (result.success) {
        successMessage.value = 'Produto atualizado com sucesso!'
      } else {
        duplicateMessage.value = result.error
      }
    } else {
      // Criar novo produto
      result = await createProduto(item)
      if (result.success) {
        successMessage.value = 'Produto cadastrado com sucesso!'
      } else {
        duplicateMessage.value = result.error
      }
    }

    if (result.success) {
      // Limpar formulário
      Object.assign(item, { code: '', name: '', price: 0, unit: 'KG', notes: '' })
      editingItemId.value = null

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
</script>
