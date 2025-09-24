import React, { useState, useEffect } from 'react';
import './BrandManager.css';

const BrandManager = ({ selectedCategory, onBack, onBrandSelect }) => {
  const [brands, setBrands] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBrand, setNewBrand] = useState({ name: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingBrand, setEditingBrand] = useState(null);

  useEffect(() => {
    if (selectedCategory) {
      fetchBrands();
    }
  }, [selectedCategory]);

  const fetchBrands = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/brands?category_id=${selectedCategory.id}`);
      const data = await response.json();
      if (data.success) {
        setBrands(data.brands);
      }
    } catch (error) {
      console.error('Markalar getirilirken hata:', error);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrand.name.trim()) {
      alert('Marka adı gerekli!');
      return;
    }

    const formData = new FormData();
    formData.append('name', newBrand.name);
    formData.append('category_id', selectedCategory.id);
    if (newBrand.image) {
      formData.append('image', newBrand.image);
    }

    try {
      const response = await fetch('http://localhost:3000/api/brands', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setBrands([...brands, data.brand]);
        setNewBrand({ name: '', image: null });
        setImagePreview(null);
        setShowAddForm(false);
        alert('Marka başarıyla eklendi!');
      } else {
        alert(data.message || 'Marka eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Marka eklenirken hata:', error);
      alert('Marka eklenirken hata oluştu');
    }
  };

  const handleUpdateBrand = async () => {
    if (!editingBrand.name.trim()) {
      alert('Marka adı gerekli!');
      return;
    }

    const formData = new FormData();
    formData.append('name', editingBrand.name);
    formData.append('category_id', selectedCategory.id);
    if (editingBrand.image && typeof editingBrand.image !== 'string') {
      formData.append('image', editingBrand.image);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/brands/${editingBrand.id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setBrands(brands.map(brand => 
          brand.id === editingBrand.id ? data.brand : brand
        ));
        setEditingBrand(null);
        setImagePreview(null);
        alert('Marka başarıyla güncellendi!');
      } else {
        alert(data.message || 'Marka güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Marka güncellenirken hata:', error);
      alert('Marka güncellenirken hata oluştu');
    }
  };

  const handleDeleteBrand = async (brandId) => {
    if (!window.confirm('Bu markayı silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/brands/${brandId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setBrands(brands.filter(brand => brand.id !== brandId));
        alert('Marka başarıyla silindi!');
      } else {
        alert(data.message || 'Marka silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Marka silinirken hata:', error);
      alert('Marka silinirken hata oluştu');
    }
  };

  const handleImageChange = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEditing) {
        setEditingBrand({ ...editingBrand, image: file });
      } else {
        setNewBrand({ ...newBrand, image: file });
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (brand) => {
    setEditingBrand({ ...brand });
    if (brand.image) {
      const imageUrl = brand.image.startsWith('http') ? brand.image : `http://localhost:3000${brand.image}`;
      setImagePreview(imageUrl);
    }
  };

  const cancelEdit = () => {
    setEditingBrand(null);
    setImagePreview(null);
  };

  return (
    <div className="brand-manager">
      <div className="brand-header">
        <button onClick={onBack} className="back-button">← Geri</button>
        <h2>{selectedCategory?.name} - Marka Yönetimi</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-brand-button"
        >
          {showAddForm ? 'İptal' : 'Marka Ekle'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-brand-form">
          <h3>Yeni Marka Ekle</h3>
          <div className="form-group">
            <label>Marka Adı:</label>
            <input
              type="text"
              value={newBrand.name}
              onChange={(e) => setNewBrand({ ...newBrand, name: e.target.value })}
              placeholder="Marka adını girin"
            />
          </div>

          <div className="form-group">
            <label>Marka Resmi:</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageChange(e, false)}
              className="image-upload-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Önizleme" className="preview-image" />
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button onClick={handleAddBrand} className="save-button">Ekle</button>
            <button onClick={() => {
              setShowAddForm(false);
              setNewBrand({ name: '', image: null });
              setImagePreview(null);
            }} className="cancel-button">İptal</button>
          </div>
        </div>
      )}

      <div className="brands-grid">
        {brands.map(brand => (
          <div key={brand.id} className="brand-card">
            {editingBrand && editingBrand.id === brand.id ? (
              <div className="edit-brand-form">
                <div className="form-group">
                  <input
                    type="text"
                    value={editingBrand.name}
                    onChange={(e) => setEditingBrand({ ...editingBrand, name: e.target.value })}
                    placeholder="Marka adını girin"
                  />
                </div>

                <div className="form-group">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                    className="image-upload-input"
                  />
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Önizleme" className="preview-image" />
                    </div>
                  )}
                </div>

                <div className="form-buttons">
                  <button onClick={handleUpdateBrand} className="save-button">Kaydet</button>
                  <button onClick={cancelEdit} className="cancel-button">İptal</button>
                </div>
              </div>
            ) : (
              <>
                {brand.image && (
                  <img 
                    src={brand.image.startsWith('http') ? brand.image : `http://localhost:3000${brand.image}`} 
                    alt={brand.name}
                    className="brand-image"
                  />
                )}
                <h3>{brand.name}</h3>
                <div className="brand-actions">
                  <button onClick={() => onBrandSelect && onBrandSelect(brand)} className="manage-button">Ürünleri Yönet</button>
                  <button onClick={() => startEdit(brand)} className="edit-button">Düzenle</button>
                  <button onClick={() => handleDeleteBrand(brand.id)} className="delete-button">Sil</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {brands.length === 0 && (
        <div className="no-brands">
          <p>Bu kategoride henüz marka bulunmuyor.</p>
        </div>
      )}
    </div>
  );
};

export default BrandManager;