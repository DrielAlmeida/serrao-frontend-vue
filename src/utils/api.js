import axios from 'axios'

// Função utilitária para arredondar números decimais com precisão
export const roundNumber = (value, decimals = 2) => {
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

const getUserIdFromToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      return null
    }

    const parts = token.split('.')
    if (parts.length < 2) {
      return null
    }

    const base64Url = parts[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const paddedBase64 = base64 + '='.repeat((4 - (base64.length % 4)) % 4)
    const payload = JSON.parse(atob(paddedBase64))

    const rawId = payload.user_id ?? payload.usuario_id ?? payload.uid ?? payload.id ?? payload.sub ?? null
    if (rawId === null || rawId === undefined || rawId === '') {
      return null
    }

    const numericId = Number(rawId)
    return Number.isNaN(numericId) ? null : numericId
  } catch (_error) {
    return null
  }
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
    const response = await api.post('/hortifruti/login', {
      login: credentials.login,
      senha: credentials.senha
    })

    const { access_token, user } = response.data

    if (access_token) {
      localStorage.setItem('token', access_token)
    } else {
      localStorage.removeItem('token')
    }

    localStorage.setItem('serrao-auth', 'true')
    localStorage.setItem('serrao-is-admin', user?.is_admin ? 'true' : 'false')
    localStorage.setItem('user-name', user?.nome || credentials.login)

    if (user?.id != null) {
      const userId = String(user.id)
      localStorage.setItem('serrao-user-id', userId)
      localStorage.setItem('usuario_id_logado', userId)
      localStorage.setItem('id_usuario', userId)
      localStorage.setItem('user_id', userId)
    } else {
      localStorage.removeItem('serrao-user-id')
      localStorage.removeItem('usuario_id_logado')
      localStorage.removeItem('id_usuario')
      localStorage.removeItem('user_id')
    }

    if (user?.cliente_id != null) {
      localStorage.setItem('serrao-linked-customer-id', String(user.cliente_id))
    } else {
      localStorage.removeItem('serrao-linked-customer-id')
    }

    if (user?.codigo_empresa) {
      localStorage.setItem('serrao-linked-customer-code', String(user.codigo_empresa))
    } else {
      localStorage.removeItem('serrao-linked-customer-code')
    }

    if (user?.nome_empresa) {
      localStorage.setItem('serrao-linked-customer-name', user.nome_empresa)
    } else {
      localStorage.removeItem('serrao-linked-customer-name')
    }

    console.log('Login successful:', { user, is_admin: user?.is_admin, user_id: user?.id })

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
    const isAdmin = localStorage.getItem('serrao-is-admin') === 'true'
    const token = localStorage.getItem('token')
    const userIdFromStorage = localStorage.getItem('serrao-user-id')
    const legacyUserId =
      localStorage.getItem('user-id') ||
      localStorage.getItem('usuario-id') ||
      localStorage.getItem('user_id') ||
      localStorage.getItem('usuario_id') ||
      localStorage.getItem('usuario_id_logado') ||
      localStorage.getItem('id_usuario')
    const userIdFromToken = getUserIdFromToken(token)
    const linkedCustomerIdFromStorage = localStorage.getItem('serrao-linked-customer-id')
    const linkedCustomerCodeFromStorage = localStorage.getItem('serrao-linked-customer-code')

    const usuarioIdLogado = pedido.userId ?? pedido.usuario_id_logado ?? userIdFromStorage ?? legacyUserId ?? userIdFromToken
    if (!usuarioIdLogado) {
      return { success: false, error: 'Usuário logado não identificado para envio do pedido.' }
    }

    if (!userIdFromStorage && userIdFromToken) {
      localStorage.setItem('serrao-user-id', String(userIdFromToken))
    }

    let clienteId = pedido.customerId ?? null
    let codigoCliente = pedido.customerNumber ?? null

    if (isAdmin) {
      if (clienteId === null || clienteId === undefined || clienteId === '') {
        return { success: false, error: 'Admin deve informar o cliente para enviar o pedido.' }
      }
    } else {
      if (!linkedCustomerIdFromStorage) {
        return { success: false, error: 'Usuário sem cliente vinculado para envio do pedido.' }
      }

      clienteId = Number(linkedCustomerIdFromStorage)
      codigoCliente = linkedCustomerCodeFromStorage || codigoCliente
    }

    // Formatar o pedido conforme esperado pela API
    const pedidoFormatado = {
      cliente_id: Number(clienteId),
      codigo_cliente: codigoCliente,
      itens: pedido.items.map(item => ({
        codigo_produto: item.codigo_produto,
        quantidade: roundNumber(item.quantity, 2),
        observacao: item.observation || null
      })),
      valor_total: roundNumber(pedido.subtotal, 2)
    }

    if (!pedidoFormatado.codigo_cliente) {
      return { success: false, error: 'codigo_cliente não identificado para envio do pedido.' }
    }

    const endpoint = `/hortifruti/enviar-pedido?usuario_id_logado=${encodeURIComponent(String(usuarioIdLogado))}`
    const response = await api.post(endpoint, pedidoFormatado)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao enviar pedido:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao enviar pedido' }
  }
}

// Método para editar pedido
export const updatePedido = async (pedidoId, pedido) => {
  try {
    const pedidoFormatado = {
      codigo_cliente: pedido.customerNumber,
      itens: pedido.items.map(item => ({
        codigo_produto: item.codigo_produto,
        quantidade: roundNumber(item.quantity, 2),
        observacao: item.observation || null
      })),
      valor_total: roundNumber(pedido.subtotal, 2)
    }

    const response = await api.put(`/hortifruti/pedidos/${pedidoId}`, pedidoFormatado)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao atualizar pedido:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao atualizar pedido' }
  }
}

// Método para deletar pedido
export const deletePedido = async (pedidoId) => {
  try {
    const response = await api.delete(`/hortifruti/pedidos/${pedidoId}`)
    return { success: true, data: response.data }
  } catch (error) {
    if (error.response?.status === 404) {
      try {
        // Fallback para a rota informada no backend em alguns cenários.
        const response = await api.delete(`/hortifruti/produtos/${pedidoId}`)
        return { success: true, data: response.data }
      } catch (secondaryError) {
        console.error('Erro ao deletar pedido (fallback):', secondaryError)
      }
    }

    console.error('Erro ao deletar pedido:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao deletar pedido' }
  }
}

// Método para buscar pedidos por intervalo opcional
export const getPedidos = async (dataInicio, dataFim) => {
  try {
    const params = {}
    if (dataInicio) {
      params.data_inicio = dataInicio
    }
    if (dataFim) {
      params.data_fim = dataFim
    }

    const userId = localStorage.getItem('serrao-user-id')
    const isAdmin = localStorage.getItem('serrao-is-admin') === 'true'

    if (userId) params.usuario_id_solicitante = userId
    params.is_admin = isAdmin

    const response = await api.get('/hortifruti/pedidos', { params })
    return response.data
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
    throw error
  }
}

export const getPedidosByRange = async (startDate, endDate) => {
  const normalizedStart = startDate && endDate && startDate > endDate ? endDate : startDate
  const normalizedEnd = startDate && endDate && startDate > endDate ? startDate : endDate
  return getPedidos(normalizedStart, normalizedEnd)
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

// Método para buscar usuários
export const getUsuarios = async () => {
  try {
    const response = await api.get('/hortifruti/usuarios/cadastro')
    return response.data
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return []
  }
}

// Método para criar usuário
export const createUsuario = async (usuario) => {
  try {
    const payload = {
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      senha: usuario.senha,
      cliente_id: usuario.cliente_id,
      ativo: usuario.ativo,
      is_admin: usuario.is_admin
    }
    const response = await api.post('/hortifruti/usuarios/cadastro', payload)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao criar usuário' }
  }
}

// Método para atualizar usuário
export const updateUsuario = async (usuarioId, usuario) => {
  try {
    const payload = {
      nome: usuario.nome,
      login: usuario.login,
      email: usuario.email,
      cliente_id: usuario.cliente_id,
      ativo: usuario.ativo,
      is_admin: usuario.is_admin
    }
    if (usuario.senha) {
      payload.senha = usuario.senha
    }
    const response = await api.put(`/hortifruti/usuarios/cadastro/${usuarioId}`, payload)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao atualizar usuário' }
  }
}

// Método para deletar usuário
export const deleteUsuario = async (usuarioId) => {
  try {
    const response = await api.delete(`/hortifruti/usuarios/cadastro/${usuarioId}`)
    return { success: true, data: response.data }
  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return { success: false, error: error.response?.data?.detail || 'Erro ao deletar usuário' }
  }
}

// Método para logout
export const logout = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('serrao-auth')
  localStorage.removeItem('serrao-is-admin')
  localStorage.removeItem('serrao-user-id')
  localStorage.removeItem('usuario_id_logado')
  localStorage.removeItem('id_usuario')
  localStorage.removeItem('user_id')
  localStorage.removeItem('user-name')
  localStorage.removeItem('serrao-linked-customer-id')
  localStorage.removeItem('serrao-linked-customer-code')
  localStorage.removeItem('serrao-linked-customer-name')
}

export default api