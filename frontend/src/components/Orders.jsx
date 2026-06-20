import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../api';
import { Plus, Eye, Trash2, X, PlusCircle, MinusCircle, FileText } from 'lucide-react';

export default function Orders({ triggerToast }) {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // New Order Form state
  const [customerId, setCustomerId] = useState('');
  const [stagedItems, setStagedItems] = useState([]); // [{ product_id, name, price, stock, quantity }]
  
  // Current Item Selection state
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [orderData, prodData, custData] = await Promise.all([
        api.getOrders(),
        api.getProducts(),
        api.getCustomers()
      ]);
      setOrders(orderData);
      setProducts(prodData);
      setCustomers(custData);
    } catch (err) {
      triggerToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    try {
      const orderData = await api.getOrders();
      const prodData = await api.getProducts();
      setOrders(orderData);
      setProducts(prodData);
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Staging logic
  const handleAddItem = () => {
    if (!selectedProductId) return;
    
    const product = products.find(p => p.id === parseInt(selectedProductId));
    if (!product) return;

    const qtyToAdd = itemQuantity === '' ? 1 : parseInt(itemQuantity);

    if (qtyToAdd <= 0) {
      triggerToast('Quantity must be greater than zero', 'warning');
      return;
    }

    // Check stock limit (staged quantity + qtyToAdd vs available stock)
    const existingStaged = stagedItems.find(item => item.product_id === product.id);
    const currentStagedQty = existingStaged ? existingStaged.quantity : 0;
    const totalQtyRequested = currentStagedQty + qtyToAdd;

    if (totalQtyRequested > product.quantity) {
      triggerToast(`Insufficient stock! Available: ${product.quantity}, Staged: ${currentStagedQty}, Requested: ${qtyToAdd}`, 'warning');
      return;
    }

    if (existingStaged) {
      // Update quantity
      setStagedItems(stagedItems.map(item => 
        item.product_id === product.id 
          ? { ...item, quantity: totalQtyRequested }
          : item
      ));
    } else {
      // Add new
      setStagedItems([...stagedItems, {
        product_id: product.id,
        name: product.name,
        price: product.price,
        stock: product.quantity,
        quantity: itemQuantity
      }]);
    }

    // Reset current selectors
    setSelectedProductId('');
    setItemQuantity(1);
  };

  const handleRemoveItem = (index) => {
    setStagedItems(stagedItems.filter((_, i) => i !== index));
  };

  // Submit order
  const handleCreateOrder = async (e) => {
    e.preventDefault();
    
    if (!customerId) {
      triggerToast('Please select a customer', 'warning');
      return;
    }
    if (stagedItems.length === 0) {
      triggerToast('Please add at least one product to the order', 'warning');
      return;
    }

    const payload = {
      customer_id: parseInt(customerId),
      items: stagedItems.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity
      }))
    };

    try {
      const newOrder = await api.createOrder(payload);
      triggerToast(`Order #${newOrder.id} placed successfully`, 'success');
      setShowAddModal(false);
      resetOrderForm();
      refreshData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  // Delete/Cancel Order
  const handleDeleteOrder = async (id) => {
    if (!window.confirm(`Are you sure you want to cancel order #${id}? Cancelling this order will restore the product stock counts.`)) return;

    try {
      await api.deleteOrder(id);
      triggerToast(`Order #${id} cancelled. Stock restored.`, 'success');
      refreshData();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const detailedOrder = await api.getOrderById(orderId);
      setSelectedOrder(detailedOrder);
      setShowDetailsModal(true);
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const resetOrderForm = () => {
    setCustomerId('');
    setStagedItems([]);
    setSelectedProductId('');
    setItemQuantity(1);
  };

  // Dynamic order total calculation for client preview
  const runningTotal = stagedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  // Find currently selected product stock detail
  const currentProduct = products.find(p => p.id === parseInt(selectedProductId));

  return (
    <div>
      {/* Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Order Records</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Log client purchases, track financials, and cancel/refund transaction details.</p>
        </div>
        <button 
          onClick={() => { resetOrderForm(); setShowAddModal(true); }} 
          className="btn btn-primary"
          disabled={customers.length === 0 || products.length === 0}
          title={customers.length === 0 || products.length === 0 ? "Ensure products and customers are created before placing orders" : ""}
        >
          <Plus size={18} />
          <span>New Order</span>
        </button>
      </div>

      {/* Main Table */}
      {loading ? (
        <div className="flex-center" style={{ minHeight: '200px' }}>
          <div className="spinner"></div>
        </div>
      ) : orders.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            No orders registered in the system yet.
          </p>
          {(customers.length === 0 || products.length === 0) && (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '8px' }}>
              Note: You must have at least one product and one customer registered to place orders.
            </p>
          )}
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Purchased Items</th>
                <th>Total Bill</th>
                <th>Status</th>
                <th>Order Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((ord) => (
                <tr key={ord.id}>
                  <td style={{ fontWeight: 600 }}>#{ord.id}</td>
                  <td>
                    {ord.customer ? (
                      <div>
                        <div style={{ fontWeight: 500 }}>{ord.customer.name}</div>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ord.customer.email}</span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--error)' }}>Deleted Customer</span>
                    )}
                  </td>
                  <td>
                    {ord.items.reduce((acc, item) => acc + item.quantity, 0)} units ({ord.items.length} unique)
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                    ₹{ord.total_amount.toFixed(2)}
                  </td>
                  <td>
                    <span className={`badge ${
                      ord.status === 'Delivered' ? 'badge-success' :
                      ord.status === 'Cancelled' ? 'badge-error' : 'badge-warning'
                    }`}>
                      {ord.status}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    {new Date(ord.created_at).toLocaleString()}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <button 
                        onClick={() => handleViewDetails(ord.id)} 
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '6px' }}
                        title="View Receipt"
                      >
                        <Eye size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(ord.id)} 
                        className="btn btn-danger btn-sm"
                        style={{ padding: '6px' }}
                        title="Cancel Order"
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

      {/* New Order placement modal */}
      {showAddModal && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Checkout Customer Order</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateOrder}>
              {/* Select Customer */}
              <div className="form-group">
                <label className="form-label">Customer Reference</label>
                <select 
                  className="form-control" 
                  value={customerId} 
                  onChange={(e) => setCustomerId(e.target.value)}
                >
                  <option value="">-- Select Customer --</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                  ))}
                </select>
              </div>

              {/* Add items panel */}
              <div className="card" style={{ padding: '16px', marginBottom: '20px', backgroundColor: 'var(--bg-surface)' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Staging Order Items</h4>
                
                <div className="staging-grid">
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Select Product</label>
                    <select 
                      className="form-control" 
                      value={selectedProductId} 
                      onChange={(e) => setSelectedProductId(e.target.value)}
                    >
                      <option value="">-- Choose Product --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (₹{p.price.toFixed(2)})</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Quantity</label>
                    <div style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      background: 'var(--bg-surface)', 
                      border: '1px solid var(--border-color)', 
                      borderRadius: 'var(--radius-md)', 
                      padding: '2px', 
                      width: 'fit-content'
                    }}>
                      <button 
                        type="button" 
                        onClick={() => {
                          const current = itemQuantity === '' ? 1 : parseInt(itemQuantity);
                          setItemQuantity(Math.max(1, current - 1));
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
                        value={itemQuantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          setItemQuantity(val === '' ? '' : parseInt(val) || 1);
                        }}
                        style={{ 
                          textAlign: 'center', 
                          border: 'none', 
                          background: 'transparent', 
                          width: '50px', 
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
                          const current = itemQuantity === '' ? 1 : parseInt(itemQuantity);
                          setItemQuantity(current + 1);
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
                  </div>

                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleAddItem}
                    disabled={!selectedProductId}
                    style={{ height: '48px', minWidth: '120px' }}
                  >
                    Add
                  </button>
                </div>

                {currentProduct && (
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: currentProduct.quantity < 10 ? 'var(--warning)' : 'var(--text-muted)' }}>
                    Stock Available: <strong>{currentProduct.quantity} units</strong> 
                    {stagedItems.find(item => item.product_id === currentProduct.id) && (
                      <span> (Staged: {stagedItems.find(item => item.product_id === currentProduct.id).quantity})</span>
                    )}
                  </div>
                )}
              </div>

              {/* Staged Items List */}
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '8px' }}>Staged Line Items</h4>
                {stagedItems.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'center', padding: '16px', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                    No products added to invoice.
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                    {stagedItems.map((item, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-sm)'
                      }}>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.name}</div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {item.quantity} x ₹{item.price.toFixed(2)} = ₹{(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <button 
                          type="button" 
                          className="btn btn-danger btn-sm" 
                          onClick={() => handleRemoveItem(idx)}
                          style={{ padding: '4px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Summary and Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '20px' }}>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Amount (approx):</span>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                    ₹{runningTotal.toFixed(2)}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={stagedItems.length === 0}>
                    Place Order
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Details Receipt Modal */}
      {showDetailsModal && selectedOrder && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={20} style={{ color: 'var(--primary)' }} />
                Order Invoice Details
              </h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}><X size={18} /></button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', uppercase: 'true' }}>Order Reference</span>
                  <div style={{ fontWeight: 600 }}>Invoice #{selectedOrder.id}</div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{new Date(selectedOrder.created_at).toLocaleString()}</span>
                  <div style={{ marginTop: '12px' }}>
                    <label className="form-label" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Status</label>
                    <select
                      className="form-control"
                      value={selectedOrder.status}
                      onChange={async (e) => {
                        const newStatus = e.target.value;
                        try {
                          const updated = await api.updateOrderStatus(selectedOrder.id, newStatus);
                          setSelectedOrder(updated);
                          triggerToast(`Order status updated to ${newStatus}`, 'success');
                          refreshData();
                        } catch (err) {
                          triggerToast(err.message, 'error');
                        }
                      }}
                      style={{ padding: '6px 12px', fontSize: '0.85rem', marginTop: '4px', width: '130px', height: '34px' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', uppercase: 'true' }}>Customer Bill To</span>
                  {selectedOrder.customer ? (
                    <div>
                      <div style={{ fontWeight: 600 }}>{selectedOrder.customer.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrder.customer.email}</div>
                      {selectedOrder.customer.phone && <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedOrder.customer.phone}</div>}
                    </div>
                  ) : (
                    <div style={{ color: 'var(--error)', fontWeight: 600 }}>Deleted Customer Account</div>
                  )}
                </div>
              </div>

              {/* Items Breakdown */}
              <div style={{ marginTop: '8px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>Purchased Items</h4>
                <div className="table-container" style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <table className="custom-table" style={{ fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: 'rgba(255,255,255,0.01)' }}>
                        <th style={{ padding: '10px 16px' }}>Product SKU</th>
                        <th style={{ padding: '10px 16px' }}>Name</th>
                        <th style={{ padding: '10px 16px' }}>Qty</th>
                        <th style={{ padding: '10px 16px' }}>Unit Price</th>
                        <th style={{ padding: '10px 16px', textAlign: 'right' }}>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item) => (
                        <tr key={item.id}>
                          <td style={{ padding: '10px 16px', color: 'var(--primary)', fontWeight: 500 }}>
                            {item.product ? item.product.sku : 'DELETED-SKU'}
                          </td>
                          <td style={{ padding: '10px 16px' }}>
                            {item.product ? item.product.name : 'Unknown Product'}
                          </td>
                          <td style={{ padding: '10px 16px' }}>{item.quantity}</td>
                          <td style={{ padding: '10px 16px' }}>₹{item.price.toFixed(2)}</td>
                          <td style={{ padding: '10px 16px', textAlign: 'right', fontWeight: 600 }}>
                            ₹{(item.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Calculation */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-color)', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Invoice Total:</span>
                  <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--success)' }}>
                    ₹{selectedOrder.total_amount.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDetailsModal(false)}>
                  Close Invoice
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
