import React, { useState, useEffect } from 'react';
import './RegionManager.css';

const RegionManager = () => {
  const [regions, setRegions] = useState({ AVRUPA: [], ASYA: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('AVRUPA');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCity, setNewCity] = useState({
    name: '',
    color: '#4A90E2',
    image: ''
  });

  useEffect(() => {
    loadRegions();
  }, []);

  const loadRegions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/regions');
      if (response.ok) {
        const data = await response.json();
        setRegions(data);
      } else {
        alert('Bölgeler yüklenirken hata oluştu');
      }
    } catch (error) {
      alert('Bağlantı hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const saveRegions = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/regions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(regions)
      });

      if (response.ok) {
        alert('Bölgeler başarıyla güncellendi!');
      } else {
        alert('Güncelleme sırasında hata oluştu');
      }
    } catch (error) {
      alert('Bağlantı hatası: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addCity = async () => {
    if (!newCity.name.trim()) {
      alert('Şehir adı gerekli!');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/regions/${activeTab}/cities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCity)
      });

      if (response.ok) {
        const data = await response.json();
        setRegions(data.data);
        setNewCity({ name: '', color: '#4A90E2', image: '' });
        setShowAddModal(false);
        alert('Şehir başarıyla eklendi!');
      } else {
        alert('Şehir eklenirken hata oluştu');
      }
    } catch (error) {
      alert('Bağlantı hatası: ' + error.message);
    }
  };

  const removeCity = async (cityId) => {
    if (!window.confirm('Bu şehri silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/regions/${activeTab}/cities/${cityId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        const data = await response.json();
        setRegions(data.data);
        alert('Şehir başarıyla silindi!');
      } else {
        alert('Şehir silinirken hata oluştu');
      }
    } catch (error) {
      alert('Bağlantı hatası: ' + error.message);
    }
  };

  const updateCityColor = (cityId, newColor) => {
    setRegions(prev => ({
      ...prev,
      [activeTab]: prev[activeTab].map(city =>
        city.id === cityId ? { ...city, color: newColor } : city
      )
    }));
  };

  const colors = [
    '#4A90E2', '#5CB85C', '#F0AD4E', '#D9534F', '#5BC0DE',
    '#9B59B6', '#E67E22', '#2ECC71', '#34495E', '#16A085',
    '#8E44AD', '#E74C3C', '#3498DB', '#F39C12', '#27AE60',
    '#1ABC9C', '#E67E22', '#9B59B6'
  ];

  return (
    <div className="region-manager">
      <div className="header">
        <h2>Bölge Yönetimi</h2>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
            disabled={loading}
          >
            Şehir Ekle
          </button>
          <button 
            className="btn btn-success"
            onClick={saveRegions}
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Değişiklikleri Kaydet'}
          </button>
        </div>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'AVRUPA' ? 'active' : ''}`}
          onClick={() => setActiveTab('AVRUPA')}
        >
          AVRUPA ({regions.AVRUPA?.length || 0})
        </button>
        <button 
          className={`tab ${activeTab === 'ASYA' ? 'active' : ''}`}
          onClick={() => setActiveTab('ASYA')}
        >
          ASYA ({regions.ASYA?.length || 0})
        </button>
      </div>

      <div className="cities-grid">
        {regions[activeTab]?.map(city => (
          <div key={city.id} className="city-card">
            <div 
              className="city-preview"
              style={{ backgroundColor: city.color }}
            >
              <span className="city-name">{city.name}</span>
            </div>
            <div className="city-controls">
              <input
                type="color"
                value={city.color}
                onChange={(e) => updateCityColor(city.id, e.target.value)}
                className="color-picker"
              />
              <button
                className="btn btn-danger btn-sm"
                onClick={() => removeCity(city.id)}
              >
                Sil
              </button>
            </div>
          </div>
        )) || []}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>{activeTab} Bölgesine Şehir Ekle</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Şehir Adı:</label>
                <input
                  type="text"
                  value={newCity.name}
                  onChange={(e) => setNewCity({...newCity, name: e.target.value})}
                  placeholder="Şehir adını girin"
                />
              </div>
              <div className="form-group">
                <label>Renk:</label>
                <div className="color-options">
                  {colors.map(color => (
                    <button
                      key={color}
                      className={`color-option ${newCity.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewCity({...newCity, color})}
                    />
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Görsel URL (opsiyonel):</label>
                <input
                  type="text"
                  value={newCity.image}
                  onChange={(e) => setNewCity({...newCity, image: e.target.value})}
                  placeholder="Görsel URL'si"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowAddModal(false)}
              >
                İptal
              </button>
              <button 
                className="btn btn-primary"
                onClick={addCity}
              >
                Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegionManager;