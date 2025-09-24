import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import Categories from './Categories';
import BrandManager from './BrandManager';
import ProductManager from './ProductManager';
import SliderManager from './SliderManager';

const Dashboard = ({ onSectionSelect }) => {
  const [sections, setSections] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('slider');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'brands', 'products'

  const menuItems = [
    { id: 'slider', name: 'Slider', icon: '🖼️' },
    { id: 'categories', name: 'Kategori', icon: '📦' },
    { id: 'products', name: 'Ürün', icon: '📋' },
    { id: 'users', name: 'Kullanıcılar', icon: '👥' },
    { id: 'ads', name: 'İlanlar', icon: '📝' },
    { id: 'reports', name: 'Raporlar', icon: '📊' },
    { id: 'settings', name: 'Ayarlar', icon: '⚙️' }
  ];

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sections');
      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.sections)) {
          setSections(data.sections);
        } else {
          setSections([]);
        }
      }
    } catch (error) {
      console.error('Bölümler yüklenirken hata:', error);
      setSections([]);
    }
  };

  const handleAddSection = async () => {
    if (!newSection.name.trim()) return;

    try {
      const formData = new FormData();
      formData.append('name', newSection.name);
      if (newSection.image) {
        formData.append('image', newSection.image);
      }

      const response = await fetch('http://localhost:3001/api/sections', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const addedSection = await response.json();
        setSections([...sections, addedSection]);
        setNewSection({ name: '', image: null });
        setImagePreview(null);
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Bölüm eklenirken hata:', error);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSection({...newSection, image: file});
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSectionSelect = (section) => {
    setSelectedCategory(section);
    setCurrentView('brands');
  };

  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setCurrentView('products');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCategory(null);
    setSelectedBrand(null);
  };

  const handleBackToBrands = () => {
    setCurrentView('brands');
    setSelectedBrand(null);
  };

  // Ana render fonksiyonu
  if (currentView === 'brands' && selectedCategory) {
    return (
      <BrandManager 
        selectedCategory={selectedCategory}
        onBack={handleBackToDashboard}
        onBrandSelect={handleBrandSelect}
      />
    );
  }

  if (currentView === 'products' && selectedBrand) {
    return (
      <ProductManager 
        selectedBrand={selectedBrand}
        onBack={handleBackToBrands}
      />
    );
  }

  return (
    <div className="dashboard">
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${selectedMenu === item.id ? 'active' : ''}`}
              onClick={() => setSelectedMenu(item.id)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="main-content">
        <div className="content-header">
          <h1>{menuItems.find(item => item.id === selectedMenu)?.name}</h1>
        </div>

        {selectedMenu === 'slider' && (
          <SliderManager />
        )}

        {selectedMenu === 'categories' && (
          <Categories onSectionSelect={handleSectionSelect} />
        )}

        {selectedMenu === 'products' && (
          <div className="menu-content">
            <h3>Ürün Yönetimi</h3>
            <p>Ürün yönetimi sayfası burada geliştirilecek.</p>
          </div>
        )}

        {selectedMenu === 'users' && (
          <div className="menu-content">
            <h3>Kullanıcı Yönetimi</h3>
            <p>Kullanıcı yönetimi sayfası burada geliştirilecek.</p>
          </div>
        )}

        {selectedMenu === 'ads' && (
          <div className="menu-content">
            <h3>İlan Yönetimi</h3>
            <p>İlan yönetimi sayfası burada geliştirilecek.</p>
          </div>
        )}

        {selectedMenu === 'reports' && (
          <div className="menu-content">
            <h3>Raporlar</h3>
            <p>Raporlar sayfası burada geliştirilecek.</p>
          </div>
        )}

        {selectedMenu === 'settings' && (
          <div className="menu-content">
            <h3>Ayarlar</h3>
            <p>Ayarlar sayfası burada geliştirilecek.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;