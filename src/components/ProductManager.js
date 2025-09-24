import React, { useState, useEffect } from 'react';
import './ProductManager.css';

const ProductManager = ({ selectedBrand, onBack }) => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ 
    name: '', 
    model: '', 
    description: '', 
    image: null 
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if (selectedBrand) {
      fetchProducts();
    }
  }, [selectedBrand]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/products?brand_id=${selectedBrand.id}`);
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Ürünler getirilirken hata:', error);
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.name.trim()) {
      alert('Ürün adı gerekli!');
      return;
    }

    const formData = new FormData();
    formData.append('name', newProduct.name);
    formData.append('brand_id', selectedBrand.id);
    formData.append('model', newProduct.model);
    formData.append('description', newProduct.description);
    if (newProduct.image) {
      formData.append('image', newProduct.image);
    }

    try {
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setProducts([...products, data.product]);
        setNewProduct({ name: '', model: '', description: '', image: null });
        setImagePreview(null);
        setShowAddForm(false);
        alert('Ürün başarıyla eklendi!');
      } else {
        alert(data.message || 'Ürün eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürün eklenirken hata:', error);
      alert('Ürün eklenirken hata oluştu');
    }
  };

  const handleUpdateProduct = async () => {
    if (!editingProduct.name.trim()) {
      alert('Ürün adı gerekli!');
      return;
    }

    const formData = new FormData();
    formData.append('name', editingProduct.name);
    formData.append('brand_id', selectedBrand.id);
    formData.append('model', editingProduct.model);
    formData.append('description', editingProduct.description);
    if (editingProduct.image && typeof editingProduct.image !== 'string') {
      formData.append('image', editingProduct.image);
    }

    try {
      const response = await fetch(`http://localhost:3000/api/products/${editingProduct.id}`, {
        method: 'PUT',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setProducts(products.map(product => 
          product.id === editingProduct.id ? data.product : product
        ));
        setEditingProduct(null);
        setImagePreview(null);
        alert('Ürün başarıyla güncellendi!');
      } else {
        alert(data.message || 'Ürün güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürün güncellenirken hata:', error);
      alert('Ürün güncellenirken hata oluştu');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Bu ürünü silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/products/${productId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      if (data.success) {
        setProducts(products.filter(product => product.id !== productId));
        alert('Ürün başarıyla silindi!');
      } else {
        alert(data.message || 'Ürün silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürün silinirken hata:', error);
      alert('Ürün silinirken hata oluştu');
    }
  };

  const handleImageChange = (e, isEditing = false) => {
    const file = e.target.files[0];
    if (file) {
      if (isEditing) {
        setEditingProduct({ ...editingProduct, image: file });
      } else {
        setNewProduct({ ...newProduct, image: file });
      }
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const startEdit = (product) => {
    setEditingProduct({ ...product });
    if (product.image) {
      const imageUrl = product.image.startsWith('http') ? product.image : `http://localhost:3000${product.image}`;
      setImagePreview(imageUrl);
    }
  };

  const cancelEdit = () => {
    setEditingProduct(null);
    setImagePreview(null);
  };

  return (
    <div className="product-manager">
      <div className="product-header">
        <button onClick={onBack} className="back-button">← Geri</button>
        <h2>{selectedBrand?.name} - Ürün Yönetimi</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="add-product-button"
        >
          {showAddForm ? 'İptal' : 'Ürün Ekle'}
        </button>
      </div>

      {showAddForm && (
        <div className="add-product-form">
          <h3>Yeni Ürün Ekle</h3>
          <div className="form-row">
            <div className="form-group">
              <label>Ürün Adı:</label>
              <input
                type="text"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                placeholder="Ürün adını girin"
              />
            </div>

            <div className="form-group">
              <label>Model:</label>
              <input
                type="text"
                value={newProduct.model}
                onChange={(e) => setNewProduct({ ...newProduct, model: e.target.value })}
                placeholder="Model bilgisini girin"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Açıklama:</label>
            <textarea
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              placeholder="Ürün açıklamasını girin"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Ürün Resmi:</label>
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
            <button onClick={handleAddProduct} className="save-button">Ekle</button>
            <button onClick={() => {
              setShowAddForm(false);
              setNewProduct({ name: '', model: '', description: '', image: null });
              setImagePreview(null);
            }} className="cancel-button">İptal</button>
          </div>
        </div>
      )}

      <div className="products-grid">
        {products.map(product => (
          <div key={product.id} className="product-card">
            {editingProduct && editingProduct.id === product.id ? (
              <div className="edit-product-form">
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                      placeholder="Ürün adını girin"
                    />
                  </div>

                  <div className="form-group">
                    <input
                      type="text"
                      value={editingProduct.model || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, model: e.target.value })}
                      placeholder="Model bilgisini girin"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <textarea
                    value={editingProduct.description || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Ürün açıklamasını girin"
                    rows="3"
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
                  <button onClick={handleUpdateProduct} className="save-button">Kaydet</button>
                  <button onClick={cancelEdit} className="cancel-button">İptal</button>
                </div>
              </div>
            ) : (
              <>
                {product.image && (
                  <img 
                    src={product.image.startsWith('http') ? product.image : `http://localhost:3000${product.image}`} 
                    alt={product.name}
                    className="product-image"
                  />
                )}
                <div className="product-info">
                  <h3>{product.name}</h3>
                  {product.model && <p className="product-model">Model: {product.model}</p>}
                  {product.description && <p className="product-description">{product.description}</p>}
                </div>
                <div className="product-actions">
                  <button onClick={() => startEdit(product)} className="edit-button">Düzenle</button>
                  <button onClick={() => handleDeleteProduct(product.id)} className="delete-button">Sil</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {products.length === 0 && (
        <div className="no-products">
          <p>Bu markada henüz ürün bulunmuyor.</p>
        </div>
      )}
    </div>
  );
};

export default ProductManager;