import React, { useEffect, useState } from 'react';
import { api } from '../api';
import { 
  Package, 
  Users, 
  ShoppingBag, 
  AlertTriangle, 
  PlusCircle, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';

export default function Dashboard({ setActiveTab, triggerToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      triggerToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '300px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card text-center" style={{ padding: '40px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Could not load dashboard statistics. Check backend connection.</p>
        <button onClick={fetchStats} className="btn btn-secondary" style={{ marginTop: '16px' }}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>Dashboard Overview</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Real-time inventory summaries, order metrics, and critical stock notifications.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-info">
            <h3>Total Products</h3>
            <p>{stats.total_products}</p>
          </div>
          <div className="stat-icon" style={{ color: '#6366f1' }}>
            <Package size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Total Customers</h3>
            <p>{stats.total_customers}</p>
          </div>
          <div className="stat-icon" style={{ color: '#8b5cf6' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Total Orders</h3>
            <p>{stats.total_orders}</p>
          </div>
          <div className="stat-icon" style={{ color: '#10b981' }}>
            <ShoppingBag size={24} />
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-info">
            <h3>Low Stock Alert</h3>
            <p style={{ color: stats.low_stock_count > 0 ? 'var(--error)' : 'var(--text-primary)' }}>
              {stats.low_stock_count}
            </p>
          </div>
          <div className="stat-icon" style={{ 
            color: stats.low_stock_count > 0 ? 'var(--error)' : 'var(--warning)',
            backgroundColor: stats.low_stock_count > 0 ? 'var(--error-light)' : 'var(--bg-surface)'
          }}>
            <AlertTriangle size={24} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' }}>
        {/* Low Stock Product Details */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={20} className={stats.low_stock_count > 0 ? 'error-text' : 'warning-text'} style={{ color: stats.low_stock_count > 0 ? 'var(--error)' : 'var(--warning)' }} />
              Low Stock Alert List
            </h2>
            <span className={`badge ${stats.low_stock_count > 0 ? 'badge-error' : 'badge-success'}`}>
              {stats.low_stock_count > 0 ? 'Attention Needed' : 'Inventory OK'}
            </span>
          </div>

          {stats.low_stock_products.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              All product stock levels are healthy! (10+ items)
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto' }}>
              {stats.low_stock_products.map((prod) => (
                <div key={prod.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between', 
                  padding: '14px', 
                  borderRadius: 'var(--radius-md)', 
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-color)'
                }}>
                  <div>
                    <h4 style={{ fontWeight: 600, fontSize: '0.95rem' }}>{prod.name}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>SKU: {prod.sku} &bull; ₹{prod.price.toFixed(2)}</span>
                  </div>
                  <span className={`badge ${prod.quantity === 0 ? 'badge-error' : 'badge-warning'}`}>
                    {prod.quantity} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Operations Panel */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} style={{ color: 'var(--primary)' }} />
              Quick Operations
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <button 
              onClick={() => setActiveTab('products')} 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '16px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <PlusCircle size={18} style={{ color: 'var(--primary)' }} />
                Manage & Add Products
              </span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => setActiveTab('customers')} 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '16px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Users size={18} style={{ color: 'var(--accent)' }} />
                Register New Customers
              </span>
              <ArrowRight size={16} />
            </button>

            <button 
              onClick={() => setActiveTab('orders')} 
              className="btn btn-secondary" 
              style={{ justifyContent: 'space-between', padding: '16px' }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <ShoppingBag size={18} style={{ color: 'var(--success)' }} />
                Create Customer Orders
              </span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
