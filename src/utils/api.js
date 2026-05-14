import axios from 'axios'

// Função utilitária para arredondar números decimais com precisão
export const roundNumber = (value, decimals = 2) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptor para adicionar token se necessário
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Método de login
export const login = async (credentials) => {
  try {
    const response = await api.post('/hortifruti/login', credentials)
    const { access_token, user } = response.data

    // Armazenar token e dados do usuário
    localStorage.setItem('token', access_token)
    localStorage.setItem('serrao-auth', 'true')
    localStorage.setItem('serrao-is-admin', user.is_admin ? 'true' : 'false')
    localStorage.setItem('user-name', user.nome)

    console.log('Login successful:', { user, is_admin: user.is_admin })

    return { success: true, user }
  } catch (error) {
    console.error('Erro no login:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao fazer login' }
  }
}

// Método para buscar clientes
export const getClientes = async () => {
  try {
    const response = await api.get('/hortifruti/clientes')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    return []
  }
}

// Método para criar cliente
export const createCliente = async (cliente) => {
  try {
    const payload = {
      codigo_cliente: cliente.codigo_cliente,
      nome: cliente.nome,
      telefone: cliente.telefone,
      observacao: cliente.observacao || null
    }
    const response = await api.post('/hortifruti/clientes', payload)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao criar cliente:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao criar cliente' }
  }
}

// Método para atualizar cliente
export const updateCliente = async (clienteId, cliente) => {
  try {
    const payload = {
      codigo_cliente: cliente.codigo_cliente,
      nome: cliente.nome,
      telefone: cliente.telefone,
      observacao: cliente.observacao || null
    }
    const response = await api.put(`/hortifruti/clientes/${clienteId}`, payload)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao atualizar cliente' }
  }
}

// Método para deletar cliente
export const deleteCliente = async (clienteId) => {
  try {
    const response = await api.delete(`/hortifruti/clientes/${clienteId}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao deletar cliente:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao deletar cliente' }
  }
}

// Método para buscar produtos
export const getProdutos = async () => {
  try {
    const response = await api.get('/hortifruti/produtos')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
    return []
  }
}

// Método para criar produto
export const createProduto = async (produto) => {
  try {
    const produtoFormatado = {
      codigo_produto: produto.code,
      nome: produto.name,
      unidade_medida: produto.unit,
      preco_unitario: produto.price,
      observacao: produto.notes || null
    }

    const response = await api.post('/hortifruti/produtos', produtoFormatado)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao criar produto:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao criar produto' }
  }
}

// Método para atualizar produto
export const updateProduto = async (produtoId, produto) => {
  try {
    const produtoFormatado = {
      codigo_produto: produto.code,
      nome: produto.name,
      unidade_medida: produto.unit,
      preco_unitario: produto.price,
      observacao: produto.notes || null
    }

    const response = await api.put(`/hortifruti/produtos/${produtoId}`, produtoFormatado)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao atualizar produto:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao atualizar produto' }
  }
}

// Método para deletar produto
export const deleteProduto = async (produtoId) => {
  try {
    const response = await api.delete(`/hortifruti/produtos/${produtoId}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao deletar produto:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao deletar produto' }
  }
}

// Método para enviar pedido
export const enviarPedido = async (pedido) => {
  try {
    // Formatar o pedido conforme esperado pela API
    const pedidoFormatado = {
      codigo_cliente: pedido.customerNumber,
      itens: pedido.items.map(item => ({
        codigo_produto: item.codigo_produto,
        quantidade: roundNumber(item.quantity, 2),
        observacao: item.observation || null
      })),
      valor_total: roundNumber(pedido.subtotal, 2)
    }

    const response = await api.post('/hortifruti/enviar-pedido', pedidoFormatado)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao enviar pedido:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao enviar pedido' }
  }
}

// Método para buscar pedidos
export const getPedidos = async () => {
  try {
    const response = await api.get('/hortifruti/pedidos')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    return []
  }
}

export const updatePedidoStatus = async (pedidoId, status) => {
  try {
    const payload = { status }
    const response = await api.put(`/hortifruti/pedidos/${pedidoId}/status`, payload)
    return { success: true, data: response.data }
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        const payload = { status }
        const response = await api.put(`/hortifruti/pedidos/${pedidoId}`, payload)
        return { success: true, data: response.data }
      } catch (secondaryError) {
        console.error('Erro ao atualizar status do pedido (fallback):', secondaryError)
      }
    }
    console.error('Erro ao atualizar status do pedido:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao atualizar status do pedido' }
  }
}

// Método para logout
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('serrao-auth')
  localStorage.removeItem('serrao-is-admin')
  localStorage.removeItem('user-name')
}

export default api