export const useLocalStorage = () => {
  const generateOrderId = () => {
    const lastId = localStorage.getItem('lastOrderId') || 0
    const newId = parseInt(lastId) + 1
    localStorage.setItem('lastOrderId', newId.toString())
    return newId.toString().padStart(6, '0') // Formatar com 6 dígitos, ex: 000001
  }

  const getItems = () => {
    const items = localStorage.getItem('items')
    return items ? JSON.parse(items) : []
  }

  const saveItems = (items) => {
    localStorage.setItem('items', JSON.stringify(items))
  }

  const getCustomers = () => {
    const customers = localStorage.getItem('customers')
    return customers ? JSON.parse(customers) : []
  }

  const saveCustomers = (customers) => {
    localStorage.setItem('customers', JSON.stringify(customers))
  }

  const getOrders = () => {
    const orders = localStorage.getItem('orders')
    return orders ? JSON.parse(orders) : []
  }

  const saveOrders = (orders) => {
    localStorage.setItem('orders', JSON.stringify(orders))
  }

  return {
    generateOrderId,
    getItems,
    saveItems,
    getCustomers,
    saveCustomers,
    getOrders,
    saveOrders
  }
}