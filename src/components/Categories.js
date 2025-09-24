import React, { useState, useEffect } from 'react';
import './Categories.css';

const Categories = ({ onSectionSelect }) => {
  const [sections, setSections] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSection, setNewSection] = useState({ name: '', image: null });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/sections');
      const data = await response.json();
      setSections(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      setSections([]);
    }
  };

  const handleAddSection = async () => {
    if (!newSection.name.trim()) {
      alert('Kategori adı gerekli!');
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', newSection.name);
      if (newSection.image) {
        formData.append('image', newSection.image);
      }

      const response = await fetch('http://localhost:3001/api/sections', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewSection({ name: '', image: null });
        setImagePreview(null);
        setShowAddForm(false);
        fetchSections();
      } else {
        alert('Kategori eklenirken hata oluştu!');
      }
    } catch (error) {
      console.error('Kategori ekleme hatası:', error);
      alert('Kategori eklenirken hata oluştu!');
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

  return (
    <div className="categories-section">
      <div className="section-header">
        <h2>Kategoriler</h2>
        <button 
          className="add-button"
          onClick={() => setShowAddForm(true)}
        >
          + Kategori Ekle
        </button>
      </div>

      {showAddForm && (
        <div className="add-form">
          <h3>Yeni Kategori Ekle</h3>
          <input
            type="text"
            placeholder="Kategori adı"
            value={newSection.name}
            onChange={(e) => setNewSection({...newSection, name: e.target.value})}
          />
          
          <div className="image-upload-section">
            <label htmlFor="image-upload" className="image-upload-label">
              Resim Seç
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="image-upload-input"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Önizleme" className="preview-image" />
              </div>
            )}
          </div>

          <div className="form-buttons">
            <button onClick={handleAddSection}>Ekle</button>
            <button onClick={() => {
              setShowAddForm(false);
              setNewSection({ name: '', image: null });
              setImagePreview(null);
            }}>İptal</button>
          </div>
        </div>
      )}

      <div className="sections-grid">
        {Array.isArray(sections) && sections.map(section => (
          <div key={section.id} className="section-card" onClick={() => onSectionSelect(section)}>
            <img 
              src={section.image?.startsWith('http') ? section.image : `http://localhost:3001${section.image}`} 
              alt={section.name} 
            />
            <h3>{section.name}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Categories;