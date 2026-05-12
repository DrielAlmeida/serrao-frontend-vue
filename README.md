# Bridge - Sistema de Gerenciamento de Pedidos

Sistema front-end para controle de pedidos de frutas e vegetais desenvolvido com **Vue 3** (Composition API) e **Tailwind CSS**.

## Características

- ✅ Fully responsive (Mobile-First)
- ✅ Interface modular e limpa
- ✅ Busca de clientes por número (com máscara)
- ✅ Busca de items por código ou nome
- ✅ Carrinho com cálculo de subtotal em tempo real
- ✅ Navegação por teclado (Tab + Enter)
- ✅ Paleta de cores: Verde (#2E7D32) + Laranja (#EF6C00)

## Estrutura do Projeto

```
src/
├── views/
│   ├── LoginView.vue          # Tela de login
│   ├── LaunchView.vue         # Lançamento de pedidos (main)
│   ├── LancamentoView.vue     # Alias em português
│   ├── ItemCadastro.vue       # Cadastro de itens
│   ├── ClienteCadastro.vue    # Cadastro de clientes
│   └── ConferenceView.vue     # Conferência de liberação
├── App.vue
├── main.js
└── style.css
```

## Instalação

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento (http://localhost:3000)
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## Dependências

- **Vue 3.3+** - Framework reativo
- **Tailwind CSS 3.3+** - Utility-first CSS
- **Vite 4.4+** - Build tool
- **PostCSS & Autoprefixer** - CSS processing

## Componentes

### LaunchView.vue
Componente principal com três seções:
1. **Buscar Cliente** - Campo com máscara de número do cliente
2. **Buscar Item** - Input com sugestões dinâmicas + campo de quantidade
3. **Carrinho** - Lista de itens com remover/limpar + subtotal

### LoginView.vue
Tela centralizada com campos de usuário e senha.

### ItemCadastro.vue
Formulário para criar/editar itens (código, nome, preço, unidade, notas).

### ClienteCadastro.vue
Formulário para criar/editar clientes (número, CNPJ com máscara, nome, telefone).

### ConferenceView.vue
Lista agrupada por cliente mostrando itens e botão de finalização.

## Recursos de UX

### Mobile
- Cards empilhados verticalmente
- Botões maiores e com espaçamento
- Máximo de 1 coluna em telas pequenas

### Desktop
- Layout em grid 2 colunas
- Painel de resumo lateral (sticky)
- Navegação otimizada com Tab/Enter

### Formatação
- **Customer Number**: `XX.XXX.XXX` (automático ao digitar)
- **CNPJ**: `XX.XXX.XXX/XXXX-XX` (automático)
- **Moeda**: Formatação BRL via `Intl.NumberFormat`

## Uso de Estado Reactivo

```js
// ref() - valores escalares
const customerName = ref('')
const quantity = ref(1)

// ref() - arrays
const cartItems = ref([])

// reactive() - objetos
const selectedItem = reactive({ code: '', name: '', price: 0, unit: 'KG' })

// computed() - valores derivados
const cartSubtotal = computed(() => {
  return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
})
```

## Paleta de Cores

| Cor | Código | Uso |
|-----|--------|-----|
| Verde | #2E7D32 | Botões principais, headings |
| Laranja | #EF6C00 | Ações secundárias, destaques |
| Slate | #64748b | Texto, inputs |

## License

MIT
