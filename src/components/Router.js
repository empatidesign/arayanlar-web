import React, { useState } from 'react';
import './Router.css';
import DashboardPage from '../pages/DashboardPage/DashboardPage';
import CategoriesPage from '../pages/CategoriesPage/CategoriesPage';
import BrandsPage from '../pages/BrandsPage/BrandsPage';
import ProductsPage from '../pages/ProductPage/ProductsPage';

const Router = () => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'brands':
        return <BrandsPage />;
      case 'products':
        return <ProductsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="app-container">
      <nav className="app-navigation">
        <div className="nav-brand">
          <h2>ArayanVar</h2>
          <span>Admin Panel</span>
        </div>
        
        <div className="nav-menu">
          <button 
            className={`nav-item ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span className="nav-text">Dashboard</span>
          </button>
          
          <button 
            className={`nav-item ${currentPage === 'categories' ? 'active' : ''}`}
            onClick={() => setCurrentPage('categories')}
          >
            <span className="nav-icon">📂</span>
            <span className="nav-text">Kategoriler</span>
          </button>
          
          <button 
            className={`nav-item ${currentPage === 'brands' ? 'active' : ''}`}
            onClick={() => setCurrentPage('brands')}
          >
            <span className="nav-icon">🏷️</span>
            <span className="nav-text">Markalar</span>
          </button>
          
          <button 
            className={`nav-item ${currentPage === 'products' ? 'active' : ''}`}
            onClick={() => setCurrentPage('products')}
          >
            <span className="nav-icon">📦</span>
            <span className="nav-text">Ürünler</span>
          </button>
        </div>
        
        <div className="nav-footer">
          <div className="user-info">
            <div className="user-avatar">👤</div>
            <div className="user-details">
              <span className="user-name">Admin</span>
              <span className="user-role">Yönetici</span>
            </div>
          </div>
        </div>
      </nav>
      
      <main className="app-main">
        {renderPage()}
      </main>
    </div>
  );
};

export default Router;