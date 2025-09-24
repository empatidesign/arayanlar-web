import React, { useState, useEffect } from 'react';
import './BrandsPage.css';

const BrandsPage = () => {
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    image: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchBrands = async (categoryId) => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands?category_id=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands || []);
      }
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/sections`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    fetchBrands(category.id);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setBrands([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCategory) {
      alert('Lütfen önce bir kategori seçin!');
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('category_id', selectedCategory.id);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingBrand 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/brands/${editingBrand.id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/brands`;
      
      const method = editingBrand ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        await fetchBrands(selectedCategory.id);
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Marka kaydedilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      category_id: brand.category_id,
      image: null
    });
    setShowAddForm(true);
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands/${brandId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchBrands(selectedCategory.id);
      }
    } catch (error) {
      console.error('Marka silinirken hata:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category_id: '',
      image: null
    });
    setEditingBrand(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file }));
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Kategori Yok';
  };

  const CategoryCard = ({ category }) => (
    <div className="category-card" onClick={() => handleCategorySelect(category)}>
      <div className="category-icon">
        <span>📂</span>
      </div>
      <div className="category-content">
        <h3 className="category-name">{category.name}</h3>
        <p className="category-description">Bu kategorideki markaları görüntüle</p>
      </div>
      <div className="category-arrow">
        <span>→</span>
      </div>
    </div>
  );

  const BrandCard = ({ brand }) => (
    <div className="brand-card">
      <div className="brand-logo">
        {brand.image ? (
          <img 
            src={`${process.env.REACT_APP_API_BASE_URL}${brand.image}`} 
            alt={brand.name}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik01MCAzNUM0Ni42ODYzIDM1IDQ0IDM3LjY4NjMgNDQgNDFWNTlDNDQgNjIuMzEzNyA0Ni42ODYzIDY1IDUwIDY1SDU5QzYyLjMxMzcgNjUgNjUgNjIuMzEzNyA2NSA1OVY0MUM2NSAzNy42ODYzIDYyLjMxMzcgMzUgNTkgMzVINTBaIiBmaWxsPSIjQ0JENUUwIi8+Cjwvc3ZnPgo=';
            }}
          />
        ) : (
          <div className="brand-placeholder">
            <span>🏷️</span>
          </div>
        )}
      </div>
      
      <div className="brand-content">
        <h3 className="brand-name">{brand.name}</h3>
        <p className="brand-category">{getCategoryName(brand.category_id)}</p>
        
        <div className="brand-actions">
          <button 
            className="edit-btn"
            onClick={() => handleEdit(brand)}
          >
            ✏️ Düzenle
          </button>
          <button 
            className="delete-btn"
            onClick={() => handleDelete(brand.id)}
          >
            🗑️ Sil
          </button>
          <button 
            className="products-btn"
            onClick={() => window.location.href = `/products?brand_id=${brand.id}`}
          >
            📦 Ürünler
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="brands-page">
      <div className="brands-header">
        <div className="header-content">
          <h1>{selectedCategory ? `${selectedCategory.name} - Markalar` : 'Kategoriler'}</h1>
          <p>{selectedCategory ? 'Bu kategorideki markaları yönetin' : 'Marka yönetimi için bir kategori seçin'}</p>
        </div>
        
        <div className="header-actions">
          {selectedCategory && (
            <>
              <button 
                className="back-btn"
                onClick={handleBackToCategories}
              >
                ← Kategorilere Dön
              </button>
              
              <button 
                className="add-brand-btn"
                onClick={() => {
                  resetForm();
                  setShowAddForm(true);
                }}
              >
                <span>➕</span>
                Yeni Marka
              </button>
            </>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="brand-form-modal">
            <div className="modal-header">
              <h2>{editingBrand ? 'Marka Düzenle' : 'Yeni Marka Ekle'}</h2>
              <button 
                className="close-btn"
                onClick={() => {
                  setShowAddForm(false);
                  resetForm();
                }}
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="brand-form">
              <div className="form-group">
                <label>Marka Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Marka adını girin"
                />
              </div>
              
              <div className="form-group">
                <label>Marka Resmi</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input"
                />
              </div>
              
              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => {
                    setShowAddForm(false);
                    resetForm();
                  }}
                >
                  İptal
                </button>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={loading}
                >
                  {loading ? 'Kaydediliyor...' : (editingBrand ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="brands-content">
        {!selectedCategory ? (
          // Kategori seçim ekranı
          <div className="categories-grid">
            {categories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          // Markalar ekranı
          <>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Markalar yükleniyor...</p>
              </div>
            ) : brands.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏷️</div>
                <h3>Bu kategoride henüz marka bulunmuyor</h3>
                <p>İlk markanızı eklemek için "Yeni Marka" butonuna tıklayın</p>
              </div>
            ) : (
              <div className="brands-grid">
                {brands.map(brand => (
                  <BrandCard key={brand.id} brand={brand} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BrandsPage;