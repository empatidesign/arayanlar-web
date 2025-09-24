import React, { useState, useEffect } from 'react';
import './SliderManager.css';

const SliderManager = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSlide, setNewSlide] = useState({
    title: '',
    description: '',
    image: null,
    link: '',
    order: 1,
    active: true
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    loadSlides();
  }, []);

  const loadSlides = async () => {
    try {
      setLoading(true);
      // API çağrısı burada yapılacak
      // Şimdilik örnek veri
      const mockSlides = [
        {
          id: 1,
          title: 'Hoş Geldiniz',
          description: 'En iyi ürünleri keşfedin',
          image: '/api/placeholder/800/400',
          link: '/categories',
          order: 1,
          active: true
        },
        {
          id: 2,
          title: 'Yeni Ürünler',
          description: 'Son eklenen ürünleri inceleyin',
          image: '/api/placeholder/800/400',
          link: '/products',
          order: 2,
          active: true
        }
      ];
      setSlides(mockSlides);
    } catch (error) {
      console.error('Slider yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSlide({ ...newSlide, image: file });
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddSlide = async () => {
    if (!newSlide.title || !newSlide.image) {
      alert('Lütfen başlık ve görsel seçin');
      return;
    }

    try {
      // API çağrısı burada yapılacak
      const slideData = {
        ...newSlide,
        id: Date.now(),
        order: slides.length + 1
      };
      
      setSlides([...slides, slideData]);
      setShowAddModal(false);
      setNewSlide({
        title: '',
        description: '',
        image: null,
        link: '',
        order: 1,
        active: true
      });
      setImagePreview(null);
    } catch (error) {
      console.error('Slider eklenirken hata:', error);
    }
  };

  const handleDeleteSlide = async (slideId) => {
    if (window.confirm('Bu slider\'ı silmek istediğinizden emin misiniz?')) {
      try {
        // API çağrısı burada yapılacak
        setSlides(slides.filter(slide => slide.id !== slideId));
      } catch (error) {
        console.error('Slider silinirken hata:', error);
      }
    }
  };

  const handleToggleActive = async (slideId) => {
    try {
      // API çağrısı burada yapılacak
      setSlides(slides.map(slide => 
        slide.id === slideId 
          ? { ...slide, active: !slide.active }
          : slide
      ));
    } catch (error) {
      console.error('Slider durumu güncellenirken hata:', error);
    }
  };

  const moveSlide = (slideId, direction) => {
    const slideIndex = slides.findIndex(slide => slide.id === slideId);
    if (
      (direction === 'up' && slideIndex === 0) ||
      (direction === 'down' && slideIndex === slides.length - 1)
    ) {
      return;
    }

    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    
    [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]];
    
    // Sıra numaralarını güncelle
    newSlides.forEach((slide, index) => {
      slide.order = index + 1;
    });

    setSlides(newSlides);
  };

  if (loading) {
    return <div className="loading">Slider yükleniyor...</div>;
  }

  return (
    <div className="slider-manager">
      <div className="header">
        <div className="header-content">
          <h2>Slider Yönetimi</h2>
          <p className="header-subtitle">Ana sayfa slider görsellerini yönetin</p>
        </div>
        <div className="header-actions">
          <button 
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            Yeni Slider Ekle
          </button>
        </div>
      </div>

      <div className="slides-list">
        {slides.length === 0 ? (
          <div className="empty-state">
            <p>Henüz slider eklenmemiş</p>
            <button 
              className="btn btn-primary"
              onClick={() => setShowAddModal(true)}
            >
              İlk Slider'ı Ekle
            </button>
          </div>
        ) : (
          slides.map((slide, index) => (
            <div key={slide.id} className={`slide-card ${!slide.active ? 'inactive' : ''}`}>
              <div className="slide-image">
                <img src={slide.image} alt={slide.title} />
                <div className="slide-overlay">
                  <span className={`status-badge ${slide.active ? 'active' : 'inactive'}`}>
                    {slide.active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>
              </div>
              
              <div className="slide-content">
                <div className="slide-info">
                  <h3>{slide.title}</h3>
                  <p>{slide.description}</p>
                  {slide.link && (
                    <span className="slide-link">Bağlantı: {slide.link}</span>
                  )}
                  <span className="slide-order">Sıra: {slide.order}</span>
                </div>
                
                <div className="slide-actions">
                  <div className="order-controls">
                    <button 
                      className="btn btn-sm"
                      onClick={() => moveSlide(slide.id, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button 
                      className="btn btn-sm"
                      onClick={() => moveSlide(slide.id, 'down')}
                      disabled={index === slides.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                  
                  <button 
                    className={`btn btn-sm ${slide.active ? 'btn-warning' : 'btn-success'}`}
                    onClick={() => handleToggleActive(slide.id)}
                  >
                    {slide.active ? 'Pasif Yap' : 'Aktif Yap'}
                  </button>
                  
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDeleteSlide(slide.id)}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Yeni Slider Ekle</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddModal(false)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-body">
              <div className="form-group">
                <label>Başlık *</label>
                <input
                  type="text"
                  value={newSlide.title}
                  onChange={(e) => setNewSlide({...newSlide, title: e.target.value})}
                  placeholder="Slider başlığı"
                />
              </div>
              
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  value={newSlide.description}
                  onChange={(e) => setNewSlide({...newSlide, description: e.target.value})}
                  placeholder="Slider açıklaması"
                  rows="3"
                />
              </div>
              
              <div className="form-group">
                <label>Bağlantı</label>
                <input
                  type="text"
                  value={newSlide.link}
                  onChange={(e) => setNewSlide({...newSlide, link: e.target.value})}
                  placeholder="/categories, /products vb."
                />
              </div>
              
              <div className="form-group">
                <label>Görsel *</label>
                <div className="image-upload">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <div className="image-preview">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Önizleme" />
                    ) : (
                      <div className="image-preview-placeholder">
                        Görsel seçin (800x400 önerilen)
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={newSlide.active}
                    onChange={(e) => setNewSlide({...newSlide, active: e.target.checked})}
                  />
                  Aktif olarak ekle
                </label>
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
                onClick={handleAddSlide}
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

export default SliderManager;