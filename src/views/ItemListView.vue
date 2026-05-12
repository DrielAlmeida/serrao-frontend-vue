<template>
  <div class="min-h-screen bg-emerald-50">
    <div class="lg:flex">
      <SideMenu />
      <main class="flex-1 p-4 sm:p-8">

      <div class="mx-auto max-w-4xl space-y-6">
        <header class="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
          <h1 class="text-3xl font-semibold text-emerald-900">Itens Cadastrados</h1>
          <p class="mt-2 text-sm text-slate-600">Veja todos os itens registrados e gerencie edição e exclusão.</p>
        </header>

        <div v-if="items.length === 0" class="rounded-3xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-600">
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
import { useLocalStorage } from '../utils/localStorage.js'

const router = useRouter()
const { getItems, saveItems } = useLocalStorage()
const items = ref([])

onMounted(() => {
  items.value = getItems()
})

const editItem = (savedItem) => {
  sessionStorage.setItem('editItem', JSON.stringify(savedItem))
  router.push('/item-cadastro')
}

const deleteItem = (index) => {
  if (!confirm('Deseja excluir este item?')) return
  items.value.splice(index, 1)
  saveItems(items.value)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

const logout = () => {
  router.push('/')
}
</script>
