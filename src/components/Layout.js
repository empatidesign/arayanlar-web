import React, { useState } from 'react';
import './Layout.css';

const Layout = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState('slider');

  const menuItems = [
    { id: 'slider', label: 'Slider', icon: '🖼️' },
    { id: 'categories', label: 'Kategori', icon: '📂' },
    { id: 'products', label: 'Ürün', icon: '📦' },
    { id: 'users', label: 'Kullanıcılar', icon: '👥' },
    { id: 'ads', label: 'İlanlar', icon: '📝' },
    { id: 'reports', label: 'Raporlar', icon: '📈' },
    { id: 'settings', label: 'Ayarlar', icon: '⚙️' }
  ];

  return (
    <div className="layout">
      <header className="layout-header">
        <div className="header-content">
          <h1 className="app-title">Arayanvar Admin</h1>
          <div className="header-actions">
            <button className="profile-btn">Admin</button>
          </div>
        </div>
      </header>
      
      <div className="layout-body">
        <main className="layout-main">
          <div className="main-content">
            {children}
          </div>
        </main>
        
        <aside className="sidebar">
          <nav className="sidebar-nav">
            {menuItems.map(item => (
              <button
                key={item.id}
                className={`sidebar-item ${activeMenu === item.id ? 'active' : ''}`}
                onClick={() => setActiveMenu(item.id)}
              >
                <span className="sidebar-icon">{item.icon}</span>
                <span className="sidebar-label">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>
      </div>
      
      <footer className="layout-footer">
        <div className="footer-content">
          <p>&copy; 2024 Arayanvar. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;