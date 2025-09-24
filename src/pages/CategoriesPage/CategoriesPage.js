import React, { useState, useEffect } from 'react';
import './CategoriesPage.css';

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    image: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/sections`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const url = editingCategory 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/sections/${editingCategory.id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/sections`;
      
      const method = editingCategory ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        await fetchCategories();
        resetForm();
        setShowAddForm(false);
      }
    } catch (error) {
      console.error('Kategori kaydedilirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      image: null
    });
    setShowAddForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Bu kategoriyi silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/sections/${categoryId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchCategories();
        }
      } catch (error) {
        console.error('Kategori silinirken hata:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      image: null
    });
    setEditingCategory(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData(prev => ({ ...prev, image: file }));
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const CategoryCard = ({ category }) => (
    <div className="category-card">
      <div className="category-image">
        {category.image ? (
          <img 
            src={`${process.env.REACT_APP_API_BASE_URL}${category.image}`} 
            alt={category.name}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTQuNDc3MiA3MCA5MCA3NC40NzcyIDkwIDgwVjEyMEM5MCA5NC40NzcyIDk0LjQ3NzIgOTAgMTAwIDkwSDEyMEMxMjUuNTIzIDkwIDEzMCA5NC40NzcyIDEzMCAxMDBWMTIwQzEzMCAxMjUuNTIzIDEyNS41MjMgMTMwIDEyMCAxMzBIMTAwQzk0LjQ3NzIgMTMwIDkwIDEyNS41MjMgOTAgMTIwVjgwWiIgZmlsbD0iI0NCRDVFMCIvPgo8L3N2Zz4K';
            }}
          />
        ) : (
          <div className="category-placeholder">
            <span>📂</span>
          </div>
        )}
        <div className={`category-status ${category.is_active ? 'active' : 'inactive'}`}>
          {category.is_active ? 'Aktif' : 'Pasif'}
        </div>
      </div>
      
      <div className="category-content">
        <h3 className="category-name">{category.name}</h3>
        {category.description && (
          <p className="category-description">{category.description}</p>
        )}
        
        <div className="category-actions">
          <button 
            className="edit-btn"
            onClick={() => handleEdit(category)}
          >
            ✏️ Düzenle
          </button>
          <button 
            className="delete-btn"
            onClick={() => handleDelete(category.id)}
          >
            🗑️ Sil
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="categories-page">
      <div className="categories-header">
        <div className="header-content">
          <h1>Kategoriler</h1>
          <p>Ürün kategorilerini yönetin</p>
        </div>
        
        <div className="header-actions">
          <div className="search-box">
            <input
              type="text"
              placeholder="Kategori ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
          
          <button 
            className="add-category-btn"
            onClick={() => {
              resetForm();
              setShowAddForm(true);
            }}
          >
            <span>➕</span>
            Yeni Kategori
          </button>
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="category-form-modal">
            <div className="modal-header">
              <h2>{editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}</h2>
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
            
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Kategori Adı *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  placeholder="Kategori adını girin"
                />
              </div>
              
              <div className="form-group">
                <label>Kategori Resmi</label>
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
                  {loading ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="categories-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Kategoriler yükleniyor...</p>
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📂</div>
            <h3>Henüz kategori bulunmuyor</h3>
            <p>İlk kategorinizi eklemek için "Yeni Kategori" butonuna tıklayın</p>
          </div>
        ) : (
          <div className="categories-grid">
            {filteredCategories.map(category => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoriesPage;