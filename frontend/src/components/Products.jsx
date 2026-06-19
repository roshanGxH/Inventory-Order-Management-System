import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Search, Edit2, Trash2, X } from 'lucide-react';

export default function Products({ triggerToast }) {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Form states
  const [formData, setFormData] = useState({ name: '', sku: '', price: 0, quantity: 0 });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      triggerToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'price' ? (value === '' ? '' : parseFloat(value)) : name === 'quantity' ? (value === '' ? '' : parseInt(value)) : value
    });
  };

  const validateForm = () => {
    const errors = {};
    const priceVal = formData.price === '' ? 0 : parseFloat(formData.price);
    const qtyVal = formData.quantity === '' ? 0 : parseInt(formData.quantity);

    if (!formData.name.trim()) errors.name = 'Product name is required';
    if (!formData.sku.trim()) errors.sku = 'SKU is required';
    else if (formData.sku.length < 2) errors.sku = 'SKU must be at least 2 characters';
    if (isNaN(priceVal) || priceVal < 0) errors.price = 'Price cannot be negative';
    if (isNaN(qtyVal) || qtyVal < 0) errors.quantity = 'Stock quantity cannot be negative';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      price: formData.price === '' ? 0 : parseFloat(formData.price),
      quantity: formData.quantity === '' ? 0 : parseInt(formData.quantity)
    };

    try {
      const newProd = await api.createProduct(payload);
      triggerToast(`Product '${newProd.name}' created successfully`, 'success');
      setShowAddModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      price: product.price,
      quantity: product.quantity
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      ...formData,
      price: formData.price === '' ? 0 : parseFloat(formData.price),
      quantity: formData.quantity === '' ? 0 : parseInt(formData.quantity)
    };

    try {
      const updatedProd = await api.updateProduct(selectedProduct.id, payload);
      triggerToast(`Product '${updatedProd.name}' updated successfully`, 'success');
      setShowEditModal(false);
      resetForm();
      fetchProducts();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product '${name}'?`)) return;
    
    try {
      await api.deleteProduct(id);
      triggerToast(`Product '${name}' deleted successfully`, 'success');
      fetchProducts();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', sku: '', price: 0, quantity: 0 });
    setFormErrors({});
    setSelectedProduct(null);
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Product Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage your inventory items, pricing levels, and update stock counts.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }} 
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Product</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Filter by name or SKU..." 
          className="form-control" 
          style={{ border: 'none', background: 'transparent', flex: 1, padding: '4px 0' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px' }}>
          <div className="spinner"></div>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchTerm ? 'No products match your search criteria.' : 'Your inventory is currently empty. Get started by adding a product!'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock Level</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((prod) => (
                <tr key={prod.id}>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{prod.sku}</td>
                  <td>{prod.name}</td>
                  <td>₹{prod.price.toFixed(2)}</td>
                  <td>
                    <span className={`badge ${prod.quantity === 0 ? 'badge-error' : prod.quantity < 10 ? 'badge-warning' : 'badge-success'}`}>
                      {prod.quantity} units
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleEditClick(prod)} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px' }}
                        title="Edit Product"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(prod.id, prod.name)} 
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px' }}
                        title="Delete Product"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Register New Product</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Wireless Mouse"
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">SKU / Code (Unique identifier)</label>
                <input 
                  type="text" 
                  name="sku" 
                  className="form-control" 
                  value={formData.sku} 
                  onChange={handleInputChange} 
                  placeholder="e.g. MOUSE-WL-01"
                />
                {formErrors.sku && <span className="error-text">{formErrors.sku}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input 
                    type="number" 
                    name="price" 
                    step="0.01" 
                    className="form-control" 
                    value={formData.price} 
                    onChange={handleInputChange}
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity in Stock</label>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '2px', 
                    width: 'fit-content',
                    alignSelf: 'flex-start'
                  }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        const current = formData.quantity === '' ? 0 : parseInt(formData.quantity);
                        setFormData({ ...formData, quantity: Math.max(0, current - 1) });
                      }}
                      style={{ 
                        padding: '8px 16px', 
                        border: 'none', 
                        background: 'transparent', 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition)'
                      }}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      name="quantity" 
                      value={formData.quantity} 
                      onChange={handleInputChange}
                      style={{ 
                        textAlign: 'center', 
                        border: 'none', 
                        background: 'transparent', 
                        width: '70px', 
                        padding: '8px 0',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const current = formData.quantity === '' ? 0 : parseInt(formData.quantity);
                        setFormData({ ...formData, quantity: current + 1 });
                      }}
                      style={{ 
                        padding: '8px 16px', 
                        border: 'none', 
                        background: 'transparent', 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition)'
                      }}
                    >
                      +
                    </button>
                  </div>
                  {formErrors.quantity && <span className="error-text">{formErrors.quantity}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Modify Product Information</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleUpdateProduct}>
              <div className="form-group">
                <label className="form-label">Product Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleInputChange}
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">SKU / Code</label>
                <input 
                  type="text" 
                  name="sku" 
                  className="form-control" 
                  value={formData.sku} 
                  onChange={handleInputChange}
                />
                {formErrors.sku && <span className="error-text">{formErrors.sku}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Unit Price (₹)</label>
                  <input 
                    type="number" 
                    name="price" 
                    step="0.01" 
                    className="form-control" 
                    value={formData.price} 
                    onChange={handleInputChange}
                  />
                  {formErrors.price && <span className="error-text">{formErrors.price}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label">Quantity in Stock</label>
                  <div style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    background: 'var(--bg-surface)', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius-md)', 
                    padding: '2px', 
                    width: 'fit-content',
                    alignSelf: 'flex-start'
                  }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        const current = formData.quantity === '' ? 0 : parseInt(formData.quantity);
                        setFormData({ ...formData, quantity: Math.max(0, current - 1) });
                      }}
                      style={{ 
                        padding: '8px 16px', 
                        border: 'none', 
                        background: 'transparent', 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition)'
                      }}
                    >
                      -
                    </button>
                    <input 
                      type="number" 
                      name="quantity" 
                      value={formData.quantity} 
                      onChange={handleInputChange}
                      style={{ 
                        textAlign: 'center', 
                        border: 'none', 
                        background: 'transparent', 
                        width: '70px', 
                        padding: '8px 0',
                        fontWeight: 600,
                        fontSize: '1.05rem',
                        color: 'var(--text-primary)',
                        outline: 'none',
                        boxShadow: 'none'
                      }}
                    />
                    <button 
                      type="button" 
                      onClick={() => {
                        const current = formData.quantity === '' ? 0 : parseInt(formData.quantity);
                        setFormData({ ...formData, quantity: current + 1 });
                      }}
                      style={{ 
                        padding: '8px 16px', 
                        border: 'none', 
                        background: 'transparent', 
                        fontSize: '1.2rem', 
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        borderRadius: 'var(--radius-sm)',
                        transition: 'var(--transition)'
                      }}
                    >
                      +
                    </button>
                  </div>
                  {formErrors.quantity && <span className="error-text">{formErrors.quantity}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
