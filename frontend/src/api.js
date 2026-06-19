const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.detail || response.statusText || 'An error occurred';
    throw new Error(errorMessage);
  }
  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  getStats: () => 
    fetch(`${API_BASE_URL}/dashboard/stats`).then(handleResponse),

  getProducts: () => 
    fetch(`${API_BASE_URL}/products`).then(handleResponse),
  
  getProductById: (id) => 
    fetch(`${API_BASE_URL}/products/${id}`).then(handleResponse),
  
  createProduct: (product) => 
    fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }).then(handleResponse),
  
  updateProduct: (id, product) => 
    fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product)
    }).then(handleResponse),
  
  deleteProduct: (id) => 
    fetch(`${API_BASE_URL}/products/${id}`, {
      method: 'DELETE'
    }).then(handleResponse),

  getCustomers: () => 
    fetch(`${API_BASE_URL}/customers`).then(handleResponse),
  
  getCustomerById: (id) => 
    fetch(`${API_BASE_URL}/customers/${id}`).then(handleResponse),
  
  createCustomer: (customer) => 
    fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customer)
    }).then(handleResponse),
  
  deleteCustomer: (id) => 
    fetch(`${API_BASE_URL}/customers/${id}`, {
      method: 'DELETE'
    }).then(handleResponse),

  getOrders: () => 
    fetch(`${API_BASE_URL}/orders`).then(handleResponse),
  
  getOrderById: (id) => 
    fetch(`${API_BASE_URL}/orders/${id}`).then(handleResponse),
  
  createOrder: (order) => 
    fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    }).then(handleResponse),

  updateOrderStatus: (id, status) => 
    fetch(`${API_BASE_URL}/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    }).then(handleResponse),
  
  deleteOrder: (id) => 
    fetch(`${API_BASE_URL}/orders/${id}`, {
      method: 'DELETE'
    }).then(handleResponse)
};
