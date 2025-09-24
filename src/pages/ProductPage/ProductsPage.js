import React, { useState, useEffect } from 'react';
import './ProductsPage.css';

const ProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [currentView, setCurrentView] = useState('categories'); // 'categories', 'brands', 'products'
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand_id: '',
    model: '',
    description: '',
    colors: [],
    images: [],
    specifications: {}
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  // Kategori seçildiğinde markaları yükle ve görünümü değiştir
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setSelectedBrand(null);
    setProducts([]);
    setCurrentView('brands');
    fetchBrands(category.id);
  };

  // Marka seçildiğinde ürünleri yükle ve görünümü değiştir
  const handleBrandSelect = (brand) => {
    setSelectedBrand(brand);
    setCurrentView('products');
    fetchProducts(brand.id);
  };

  // Geri gitme fonksiyonları
  const goBackToCategories = () => {
    setCurrentView('categories');
    setSelectedCategory(null);
    setSelectedBrand(null);
    setBrands([]);
    setProducts([]);
  };

  const goBackToBrands = () => {
    setCurrentView('brands');
    setSelectedBrand(null);
    setProducts([]);
  };

  const fetchProducts = async (brandId) => {
    if (!brandId) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products?brand_id=${brandId}`);
      if (response.ok) {
        const data = await response.json();
        // API'den gelen veriyi kontrol et ve array olduğundan emin ol
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          setProducts([]);
        }
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      setProducts([]);
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

  const fetchBrands = async (categoryId) => {
    if (!categoryId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/brands?category_id=${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setBrands(data.brands || data);
      }
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) {
      return; // Eğer zaten bir işlem devam ediyorsa, yeni işlem başlatma
    }
    
    if (!selectedBrand) {
      alert('Lütfen önce bir marka seçin!');
      return;
    }
    
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('brand_id', selectedBrand.id);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('colors', JSON.stringify(formData.colors));
      formDataToSend.append('specifications', JSON.stringify(formData.specifications));
      
      // Çoklu resim yükleme
      formData.images.forEach((image, index) => {
        if (image instanceof File) {
          formDataToSend.append(`images`, image);
        }
      });

      const url = editingProduct 
        ? `${process.env.REACT_APP_API_BASE_URL}/api/products/${editingProduct.id}`
        : `${process.env.REACT_APP_API_BASE_URL}/api/products`;
      
      const method = editingProduct ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        body: formDataToSend
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Ürün başarıyla kaydedildi:', result);
        await fetchProducts(selectedBrand.id);
        resetForm();
        setShowAddForm(false);
        alert(editingProduct ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!');
      } else {
        const errorData = await response.json();
        console.error('API Hatası:', errorData);
        alert(errorData.message || 'Ürün kaydedilirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürün kaydedilirken hata:', error);
      alert('Ürün kaydedilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand_id: product.brand_id || '',
      model: product.model || '',
      description: product.description || '',
      colors: product.colors || [],
      images: product.images || [],
      specifications: product.specifications || {}
    });
    setShowAddForm(true);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/products/${productId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          await fetchProducts(selectedBrand.id);
        }
      } catch (error) {
        console.error('Ürün silinirken hata:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      brand_id: '',
      model: '',
      description: '',
      colors: [],
      images: [],
      specifications: {}
    });
    setEditingProduct(null);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({ 
      ...prev, 
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addColor = () => {
    const colorName = prompt('Renk adını girin:');
    
    if (colorName) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, { name: colorName, images: [] }]
      }));
    }
  };

  const [bulkImages, setBulkImages] = useState([]);
  const [showColorNaming, setShowColorNaming] = useState(false);

  const handleBulkImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Progress başlat
    setUploadProgress(prev => ({ ...prev, bulk: { uploading: true, progress: 0, total: files.length } }));
    
    try {
      // Toplu resimleri backend'e yükle
      const formData = new FormData();
      files.forEach(file => {
        formData.append('colorImages', file);
      });
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/color-images/upload`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Progress tamamlandı
        setUploadProgress(prev => ({ ...prev, bulk: { uploading: false, progress: files.length, total: files.length } }));
        
        // Yüklenen resimleri bulk images'a ekle
        setBulkImages(result.images.map(imagePath => ({ 
          path: imagePath, 
          name: '', 
          assigned: false 
        })));
        
        setShowColorNaming(true);
        
        // Progress'i temizle
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, bulk: null }));
        }, 2000);
      } else {
        setUploadProgress(prev => ({ ...prev, bulk: null }));
        alert('Resimler yüklenirken hata oluştu: ' + result.message);
      }
    } catch (error) {
      setUploadProgress(prev => ({ ...prev, bulk: null }));
      console.error('Resim yükleme hatası:', error);
      alert('Resimler yüklenirken hata oluştu');
    }
  };

  const updateImageColorName = (imageIndex, colorName) => {
    setBulkImages(prev => prev.map((img, index) => 
      index === imageIndex ? { ...img, name: colorName } : img
    ));
  };

  const assignColorsToProduct = () => {
    // Renk isimlerine göre grupla
    const colorGroups = {};
    bulkImages.forEach(img => {
      if (img.name.trim()) {
        if (!colorGroups[img.name]) {
          colorGroups[img.name] = [];
        }
        colorGroups[img.name].push(img.path);
      }
    });

    // FormData'ya renkleri ekle
    const newColors = Object.keys(colorGroups).map(colorName => ({
      name: colorName,
      images: colorGroups[colorName]
    }));

    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, ...newColors]
    }));

    // Bulk images'ı temizle
    setBulkImages([]);
    setShowColorNaming(false);
  };

  const [uploadProgress, setUploadProgress] = useState({});

  const handleColorImageChange = async (colorIndex, e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
    // Progress başlat
    setUploadProgress(prev => ({ ...prev, [colorIndex]: { uploading: true, progress: 0, total: files.length } }));
    
    try {
      // Renk resimlerini backend'e yükle
      const formData = new FormData();
      files.forEach(file => {
        formData.append('colorImages', file);
      });
      
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/api/color-images/upload`, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Progress tamamlandı
        setUploadProgress(prev => ({ ...prev, [colorIndex]: { uploading: false, progress: files.length, total: files.length } }));
        
        // Yüklenen resim yollarını state'e ekle
        setFormData(prev => ({
          ...prev,
          colors: prev.colors.map((color, index) => 
            index === colorIndex 
              ? { ...color, images: [...(color.images || []), ...result.images] }
              : color
          )
        }));
        
        // Progress'i temizle
        setTimeout(() => {
          setUploadProgress(prev => ({ ...prev, [colorIndex]: null }));
        }, 2000);
      } else {
        setUploadProgress(prev => ({ ...prev, [colorIndex]: null }));
        alert('Resimler yüklenirken hata oluştu: ' + result.message);
      }
    } catch (error) {
      setUploadProgress(prev => ({ ...prev, [colorIndex]: null }));
      console.error('Resim yükleme hatası:', error);
      alert('Resimler yüklenirken hata oluştu');
    }
  };

  const removeColorImage = (colorIndex, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, index) => 
        index === colorIndex 
          ? { ...color, images: color.images.filter((_, i) => i !== imageIndex) }
          : color
      )
    }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const [imagePreviewModal, setImagePreviewModal] = useState({ show: false, image: null, colorName: '' });

  const openImagePreview = (image, colorName) => {
    setImagePreviewModal({ show: true, image, colorName });
  };

  const closeImagePreview = () => {
    setImagePreviewModal({ show: false, image: null, colorName: '' });
  };

  const [dragStates, setDragStates] = useState({});

  const handleDragOver = (e, colorIndex) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [colorIndex]: true }));
  };

  const handleDragLeave = (e, colorIndex) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [colorIndex]: false }));
  };

  const handleDrop = async (e, colorIndex) => {
    e.preventDefault();
    setDragStates(prev => ({ ...prev, [colorIndex]: false }));
    
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    
    if (files.length === 0) {
      alert('Lütfen sadece resim dosyalarını sürükleyin');
      return;
    }
    
    // Aynı handleColorImageChange fonksiyonunu kullan
    const fakeEvent = { target: { files } };
    await handleColorImageChange(colorIndex, fakeEvent);
  };

  const [newSpec, setNewSpec] = useState({ key: '', value: '' });
  const [showSpecForm, setShowSpecForm] = useState(false);

  const addSpecification = () => {
    if (newSpec.key && newSpec.value) {
      setFormData(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          [newSpec.key]: newSpec.value
        }
      }));
      setNewSpec({ key: '', value: '' });
      setShowSpecForm(false);
    }
  };

  const cancelSpecification = () => {
    setNewSpec({ key: '', value: '' });
    setShowSpecForm(false);
  };

  const removeSpecification = (key) => {
    setFormData(prev => {
      const newSpecs = { ...prev.specifications };
      delete newSpecs[key];
      return {
        ...prev,
        specifications: newSpecs
      };
    });
  };

  const filteredProducts = Array.isArray(products) ? products : [];

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Kategori Yok';
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Marka Yok';
  };

  // Kategori kartları render fonksiyonu
  const renderCategoryCard = (category) => (
    <div 
      key={category.id} 
      className="selection-card"
      onClick={() => handleCategorySelect(category)}
    >
      <div className="card-content">
        {category.image ? (
          <img 
            src={`${process.env.REACT_APP_API_BASE_URL}${category.image}`} 
            alt={category.name}
            className="card-image"
          />
        ) : (
          <div className="card-placeholder">📂</div>
        )}
        <h3 className="card-title">{category.name}</h3>
      </div>
    </div>
  );

  // Marka kartları render fonksiyonu
  const renderBrandCard = (brand) => (
    <div 
      key={brand.id} 
      className="selection-card"
      onClick={() => handleBrandSelect(brand)}
    >
      <div className="card-content">
        {brand.image ? (
          <img 
            src={`${process.env.REACT_APP_API_BASE_URL}${brand.image}`} 
            alt={brand.name}
            className="card-image"
          />
        ) : (
          <div className="card-placeholder">🏷️</div>
        )}
        <h3 className="card-title">{brand.name}</h3>
      </div>
    </div>
  );

  const ProductCard = ({ product }) => (
    <div className="product-card">
      <div className="product-image">
        {product.image ? (
          <img 
            src={`${process.env.REACT_APP_API_BASE_URL}${product.image}`} 
            alt={product.name}
            onError={(e) => {
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjdGQUZDIi8+CjxwYXRoIGQ9Ik0xMDAgNzBDOTQuNDc3MiA3MCA5MCA3NC40NzcyIDkwIDgwVjEyMEM5MCA5NC40NzcyIDk0LjQ3NzIgOTAgMTAwIDkwSDEyMEMxMjUuNTIzIDkwIDEzMCA5NC40NzcyIDEzMCAxMDBWMTIwQzEzMCAxMjUuNTIzIDEyNS41MjMgMTMwIDEyMCAxMzBIMTAwQzk0LjQ3NzIgMTMwIDkwIDEyNS41MjMgOTAgMTIwVjgwWiIgZmlsbD0iI0NCRDVFMCIvPgo8L3N2Zz4K';
            }}
          />
        ) : (
          <div className="product-placeholder">
            <span>📦</span>
          </div>
        )}
      </div>
      
      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        {product.model && (
          <div className="product-model">Model: {product.model}</div>
        )}
        
        {product.description && (
          <p className="product-description">{product.description}</p>
        )}
        
        <div className="product-actions">
          <button 
            className="edit-btn"
            onClick={() => handleEdit(product)}
          >
            ✏️ Düzenle
          </button>
          <button 
            className="delete-btn"
            onClick={() => handleDelete(product.id)}
          >
            🗑️ Sil
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="products-page">
      <div className="products-header">
        <div className="header-content">
          <h1>Ürünler</h1>
          <p>Ürün envanterini yönetin</p>
        </div>
        
        <div className="header-actions">
          {/* Geri dönüş butonları */}
          {currentView === 'brands' && (
            <button 
              className="back-btn"
              onClick={goBackToCategories}
            >
              ← Kategorilere Dön
            </button>
          )}
          
          {currentView === 'products' && (
            <button 
              className="back-btn"
              onClick={goBackToBrands}
            >
              ← Markalara Dön
            </button>
          )}
          
          {currentView === 'products' && (
            <button 
              className="add-product-btn"
              onClick={() => {
                resetForm();
                setShowAddForm(true);
              }}
            >
              <span>➕</span>
              Yeni Ürün
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="modal-overlay">
          <div className="product-form-modal">
            <div className="modal-header">
              <h2>{editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}</h2>
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
            
            <form onSubmit={handleSubmit} className="product-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Ürün Adı *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    required
                    placeholder="Ürün adını girin"
                  />
                </div>
                
                <div className="form-group">
                  <label>Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    placeholder="Model adını girin"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Açıklama</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Ürün açıklaması (opsiyonel)"
                  rows="3"
                />
              </div>

              {/* Renk Seçenekleri */}
              <div className="form-group">
                <label>Renk Seçenekleri</label>
                
                {/* Toplu Resim Yükleme */}
                <div className="bulk-upload-section">
                  <input 
                    type="file" 
                    id="bulk-color-images"
                    multiple
                    accept="image/*"
                    onChange={handleBulkImageUpload}
                    style={{ display: 'none' }}
                  />
                  <label 
                    htmlFor="bulk-color-images"
                    className="bulk-upload-btn"
                  >
                    📷 Toplu Resim Yükle (Önce tüm renk resimlerini seçin)
                  </label>
                  
                  {/* Bulk Upload Progress Bar */}
                  {uploadProgress.bulk?.uploading && (
                    <div className="upload-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ width: `${(uploadProgress.bulk.progress / uploadProgress.bulk.total) * 100}%` }}
                        ></div>
                      </div>
                      <span className="progress-text">
                        {uploadProgress.bulk.progress} / {uploadProgress.bulk.total} resim yükleniyor...
                      </span>
                    </div>
                  )}
                </div>

                {/* Renk İsimlendirme Bölümü */}
                {showColorNaming && bulkImages.length > 0 && (
                  <div className="color-naming-section">
                    <h4>Yüklenen Resimlere Renk İsmi Verin:</h4>
                    <div className="bulk-images-grid">
                      {bulkImages.map((image, index) => (
                        <div key={index} className="bulk-image-item">
                          <img 
                            src={`${process.env.REACT_APP_API_BASE_URL}${image.path}`}
                            alt={`Resim ${index + 1}`}
                            className="bulk-image-preview"
                          />
                          <input
                            type="text"
                            placeholder="Renk ismi girin"
                            value={image.name}
                            onChange={(e) => updateImageColorName(index, e.target.value)}
                            className="color-name-input"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="bulk-actions">
                      <button 
                        type="button" 
                        className="assign-colors-btn"
                        onClick={assignColorsToProduct}
                      >
                        Renkleri Ürüne Ekle
                      </button>
                      <button 
                        type="button" 
                        className="cancel-bulk-btn"
                        onClick={() => {
                          setBulkImages([]);
                          setShowColorNaming(false);
                        }}
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                )}

                <div className="colors-container">
                  {/* Mevcut Renkler */}
                  {formData.colors.length > 0 && (
                    <div className="existing-colors-section">
                      <h4>Eklenen Renkler:</h4>
                      <div className="colors-list">
                        {formData.colors.map((color, colorIndex) => (
                          <div key={colorIndex} className="color-item-extended">
                            <div className="color-header">
                              <span className="color-name">{color.name}</span>
                              <button 
                                type="button" 
                                className="remove-color-btn"
                                onClick={() => removeColor(colorIndex)}
                              >
                                ✕
                              </button>
                            </div>
                            <div className="color-images-grid">
                              {color.images && color.images.map((image, imageIndex) => (
                                <div key={imageIndex} className="color-image-preview">
                                  <img 
                                    src={typeof image === 'string' ? `${process.env.REACT_APP_API_BASE_URL}${image}` : URL.createObjectURL(image)}
                                    alt={`${color.name} - ${imageIndex + 1}`}
                                    className="color-preview-img"
                                    onClick={() => openImagePreview(image, color.name)}
                                  />
                                  <button 
                                    type="button" 
                                    className="remove-image-btn"
                                    onClick={() => removeColorImage(colorIndex, imageIndex)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tek Tek Renk Ekleme (Eski Yöntem) */}
                  {!showColorNaming && bulkImages.length === 0 && (
                    <div className="individual-color-section">
                      <h4>Tek Tek Renk Ekle:</h4>
                      <button 
                        type="button" 
                        className="add-color-btn"
                        onClick={addColor}
                      >
                        + Yeni Renk Ekle
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Ürün Özellikleri */}
              <div className="form-group">
                <label>Ürün Özellikleri</label>
                <div className="specifications-container">
                  <div className="specifications-list">
                    {Object.entries(formData.specifications).map(([key, value]) => (
                      <div key={key} className="specification-item">
                        <span className="spec-key">{key}:</span>
                        <span className="spec-value">{value}</span>
                        <button 
                          type="button" 
                          className="remove-spec-btn"
                          onClick={() => removeSpecification(key)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  {showSpecForm ? (
                    <div className="spec-form">
                      <div className="spec-inputs">
                        <input
                          type="text"
                          placeholder="Özellik adı (örn: Boyut, Ağırlık)"
                          value={newSpec.key}
                          onChange={(e) => setNewSpec(prev => ({ ...prev, key: e.target.value }))}
                          className="spec-key-input"
                        />
                        <input
                          type="text"
                          placeholder="Özellik değeri"
                          value={newSpec.value}
                          onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))}
                          className="spec-value-input"
                        />
                      </div>
                      <div className="spec-buttons">
                        <button 
                          type="button" 
                          className="save-spec-btn"
                          onClick={addSpecification}
                        >
                          Kaydet
                        </button>
                        <button 
                          type="button" 
                          className="cancel-spec-btn"
                          onClick={cancelSpecification}
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      type="button" 
                      className="add-spec-btn"
                      onClick={() => setShowSpecForm(true)}
                    >
                      + Özellik Ekle
                    </button>
                  )}
                </div>
              </div>
              
              {/* Çoklu Resim Yükleme */}
              <div className="form-group">
                <label>Ürün Resimleri</label>
                <div className="images-container">
                  <div className="images-preview">
                    {formData.images.map((image, index) => (
                      <div key={index} className="image-preview-item">
                        <img 
                          src={image instanceof File ? URL.createObjectURL(image) : image} 
                          alt={`Ürün resmi ${index + 1}`}
                          className="preview-image"
                        />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeImage(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="file-input"
                  />
                </div>
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
                  {loading ? 'Kaydediliyor...' : (editingProduct ? 'Güncelle' : 'Kaydet')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="products-content">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Yükleniyor...</p>
          </div>
        ) : currentView === 'categories' ? (
          <div className="selection-container">
            <h2>Kategori Seçin</h2>
            {categories.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📂</div>
                <h3>Henüz kategori bulunmuyor</h3>
                <p>Önce kategoriler sayfasından kategori ekleyin</p>
              </div>
            ) : (
              <div className="selection-grid">
                {categories.map(category => renderCategoryCard(category))}
              </div>
            )}
          </div>
        ) : currentView === 'brands' ? (
          <div className="selection-container">
            <h2>Marka Seçin</h2>
            {brands.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🏷️</div>
                <h3>Bu kategoride henüz marka bulunmuyor</h3>
                <p>Önce markalar sayfasından bu kategoriye marka ekleyin</p>
              </div>
            ) : (
              <div className="selection-grid">
                {brands.map(brand => renderBrandCard(brand))}
              </div>
            )}
          </div>
        ) : (
          <div className="products-container">
            <h2>{selectedBrand?.name} Ürünleri</h2>
            {filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📦</div>
                <h3>Bu markada henüz ürün bulunmuyor</h3>
                <p>İlk ürününüzü eklemek için "Yeni Ürün" butonuna tıklayın</p>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Resim Önizleme Modal */}
      {imagePreviewModal.show && (
        <div className="image-preview-modal" onClick={closeImagePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{imagePreviewModal.colorName} - Renk Resmi</h3>
              <button className="close-btn" onClick={closeImagePreview}>✕</button>
            </div>
            <div className="modal-body">
              <img 
                src={typeof imagePreviewModal.image === 'string' 
                  ? `${process.env.REACT_APP_API_BASE_URL}${imagePreviewModal.image}` 
                  : URL.createObjectURL(imagePreviewModal.image)
                }
                alt={imagePreviewModal.colorName}
                className="preview-image"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;