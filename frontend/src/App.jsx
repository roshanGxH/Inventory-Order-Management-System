import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Products from './components/Products';
import Customers from './components/Customers';
import Orders from './components/Orders';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'success') => {
    setToast({ message, type });
    // Auto-clear after 4 seconds
    setTimeout(() => {
      setToast(prev => prev && prev.message === message ? null : prev);
    }, 4000);
  };

  return (
    <div>
      {/* Sidebar Layout */}
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {activeTab === 'dashboard' && (
          <Dashboard setActiveTab={setActiveTab} triggerToast={triggerToast} />
        )}
        {activeTab === 'products' && (
          <Products triggerToast={triggerToast} />
        )}
        {activeTab === 'customers' && (
          <Customers triggerToast={triggerToast} />
        )}
        {activeTab === 'orders' && (
          <Orders triggerToast={triggerToast} />
        )}
      </Layout>

      {/* Floating Toast Notification alerts */}
      {toast && (
        <div className="toast-container">
          <div className={`toast toast-${toast.type}`}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 
                toast.type === 'success' ? 'var(--success)' : 
                toast.type === 'error' ? 'var(--error)' : 'var(--warning)'
            }}></div>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              {toast.message}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
