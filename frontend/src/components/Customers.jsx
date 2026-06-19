import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { Plus, Search, Trash2, X } from 'lucide-react';

export default function Customers({ triggerToast }) {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal & Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      triggerToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Please enter a valid email address';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const newCust = await api.createCustomer(formData);
      triggerToast(`Customer '${newCust.name}' added successfully`, 'success');
      setShowAddModal(false);
      resetForm();
      fetchCustomers();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer '${name}'? All active orders for this customer will also be deleted.`)) return;

    try {
      await api.deleteCustomer(id);
      triggerToast(`Customer '${name}' deleted successfully`, 'success');
      fetchCustomers();
    } catch (err) {
      triggerToast(err.message, 'error');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '' });
    setFormErrors({});
  };

  const filteredCustomers = customers.filter(cust => 
    cust.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cust.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      {/* Title & Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Customer Directory</h1>
          <p style={{ color: 'var(--text-secondary)' }}>View client details, contact information, and register new customer accounts.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowAddModal(true); }} 
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="card" style={{ padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Search size={20} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search customers by name or email..." 
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
      ) : filteredCustomers.length === 0 ? (
        <div className="card text-center" style={{ padding: '48px 24px' }}>
          <p style={{ color: 'var(--text-secondary)' }}>
            {searchTerm ? 'No customers match your search criteria.' : 'No customers registered yet. Start by adding a customer!'}
          </p>
        </div>
      ) : (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Phone Number</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((cust) => (
                <tr key={cust.id}>
                  <td style={{ color: 'var(--text-muted)' }}>#{cust.id}</td>
                  <td style={{ fontWeight: 600 }}>{cust.name}</td>
                  <td>{cust.email}</td>
                  <td>{cust.phone || <em style={{ color: 'var(--text-muted)' }}>Not provided</em>}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleDeleteCustomer(cust.id, cust.name)} 
                      className="btn btn-danger btn-sm"
                      style={{ padding: '6px' }}
                      title="Delete Customer"
                    >
                      <Trash2 size={14} />
                    </button>
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
              <h3 className="modal-title">Register New Customer</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateCustomer}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  name="name" 
                  className="form-control" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Full Name"
                />
                {formErrors.name && <span className="error-text">{formErrors.name}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Unique)</label>
                <input 
                  type="email" 
                  name="email" 
                  className="form-control" 
                  value={formData.email} 
                  onChange={handleInputChange} 
                  placeholder="e.g. name@example.com"
                />
                {formErrors.email && <span className="error-text">{formErrors.email}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (Optional)</label>
                <input 
                  type="tel" 
                  name="phone" 
                  className="form-control" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  placeholder="e.g. +91 98765 43210"
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Customer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
