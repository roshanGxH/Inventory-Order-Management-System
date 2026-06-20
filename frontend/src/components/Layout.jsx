import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ShoppingBag, 
  Menu, 
  X,
  Database,
  ChevronLeft
} from 'lucide-react';

export default function Layout({ children, activeTab, setActiveTab }) {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth > 768);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Products', icon: Package, id: 'products' },
    { name: 'Customers', icon: Users, id: 'customers' },
    { name: 'Orders', icon: ShoppingBag, id: 'orders' }
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth <= 768) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className={`layout-container ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Mobile/Desktop Menu Toggle Button */}
      <button 
        className="menu-btn" 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle Navigation Menu"
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar Nav */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', gap: '12px' }}>
          <div className="nav-logo" style={{ fontSize: '1.05rem', lineHeight: '1.3', margin: 0 }}>
            <Database size={22} style={{ strokeWidth: 2.5, flexShrink: 0 }} />
            <span>Inventory & Order Management System</span>
          </div>
          <button 
            type="button"
            className="sidebar-collapse-btn" 
            onClick={() => setSidebarOpen(false)}
            title="Collapse Sidebar"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
        <nav style={{ flex: 1 }}>
          <ul className="nav-links">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                    style={{ width: '100%', background: 'none', border: 'none', textAlign: 'left', font: 'inherit' }}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </aside>

      {/* Main Panel Content Area */}
      <main className="main-content">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
