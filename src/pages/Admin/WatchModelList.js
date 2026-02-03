import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardBody, CardTitle, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, Badge } from 'reactstrap';
import { get, post, put, del, patch } from '../../helpers/api_helper';

const WatchModelList = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', color: '' });
  const [formData, setFormData] = useState({
    brand_id: '',
    name: '',
    model: '',
    specifications: '',
    description: '',
    image: null,
    images: [],
    colors: []
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalModels, setTotalModels] = useState(0);
  const [limit] = useState(20);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSearch, setActiveSearch] = useState(''); // Aktif arama terimi

  useEffect(() => {
    fetchBrands();
  }, []);

  useEffect(() => {
    fetchModels();
  }, [currentPage, activeSearch]);

  const fetchModels = async () => {
    try {
      setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: limit
      });
      
      // Aktif arama terimini kullan
      if (activeSearch && activeSearch.trim()) {
        queryParams.append('search', activeSearch.trim());
      }
      
      const response = await get(`/api/watches/models?${queryParams}`);
      
      if (response.success) {
        setModels(response.models || []);
        
        // Pagination bilgilerini set et
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || 1);
          setTotalModels(response.pagination.total || 0);
        }
      } else {
        setModels([]);
      }
    } catch (error) {
      showAlert('Saat modelleri yüklenirken hata oluştu', 'danger');
      setModels([]); // Hata durumunda boş array set et
    } finally {
      setLoading(false);
    }
  };

  // Sayfa değişikliklerini handle et
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  
  // Search değişikliklerini handle et
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Arama butonuna tıklandığında
  const handleSearch = () => {
    setActiveSearch(searchTerm);
    setCurrentPage(1);
  };
  
  // Enter tuşuna basıldığında arama yap
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };
  
  // Search temizle
  const handleClearSearch = () => {
    setSearchTerm('');
    setActiveSearch('');
    setCurrentPage(1);
  };

  // Pagination render
  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          color={currentPage === i ? "primary" : "light"}
          size="sm"
          className="me-1"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return (
      <div className="d-flex justify-content-center align-items-center mt-3">
        <div className="me-3">
          <small className="text-muted">
            Toplam {totalModels} model, Sayfa {currentPage} / {totalPages}
          </small>
        </div>
        <div>
          {currentPage > 1 && (
            <Button
              color="light"
              size="sm"
              className="me-1"
              onClick={() => handlePageChange(currentPage - 1)}
            >
              Önceki
            </Button>
          )}
          {pages}
          {currentPage < totalPages && (
            <Button
              color="light"
              size="sm"
              className="ms-1"
              onClick={() => handlePageChange(currentPage + 1)}
            >
              Sonraki
            </Button>
          )}
        </div>
      </div>
    );
  };

  const fetchBrands = async () => {
    try {
      const response = await get('/api/watches/brands');
      if (response.success) {
        setBrands(response.data);
      }
    } catch (error) {
    }
  };

  const showAlert = (message, color) => {
    setAlert({ show: true, message, color });
    setTimeout(() => setAlert({ show: false, message: '', color: '' }), 3000);
  };

  const handleDelete = async () => {
    try {
      const response = await del(`/api/watches/models/${selectedModel.id}`);
      if (response.success) {
        showAlert('Saat modeli başarıyla silindi', 'success');
        fetchModels();
      } else {
        showAlert(response.message || 'Silme işlemi başarısız', 'danger');
      }
    } catch (error) {
      showAlert('Silme işlemi sırasında hata oluştu', 'danger');
    }
    setDeleteModal(false);
    setSelectedModel(null);
  };

  const handleAddColor = (isEdit = false) => {
    const newColor = {
      name: '',
      hex: '#000000',
      image: null,
      imagePreview: null,
      gender: 'unisex' // Default olarak unisex
    };
    
    if (isEdit) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
    }
  };

  const handleRemoveColor = (index, isEdit = false) => {
    const updatedColors = formData.colors.filter((_, i) => i !== index);
    setFormData({ ...formData, colors: updatedColors });
    showAlert('Renk kaldırıldı', 'info');
  };

  const updateColor = (index, field, value, isEdit = false) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => {
        if (i === index) {
          const updatedColor = { ...color, [field]: value };
          // Eğer imagePreview null yapılıyorsa, image'ı da temizle
          if (field === 'imagePreview' && value === null) {
            updatedColor.image = null;
          }
          return updatedColor;
        }
        return color;
      })
    }));
  };

  const handleColorImageChange = (e, index, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateColor(index, 'image', file, isEdit);
        updateColor(index, 'imagePreview', reader.result, isEdit);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditImagePreview(reader.result);
          setFormData(prev => ({ ...prev, image: file }));
        } else {
          setImagePreview(reader.result);
          setFormData(prev => ({ ...prev, image: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleStatus = async (modelId) => {
    try {
      const response = await patch(`/api/watches/models/${modelId}/toggle-status`);
      if (response.success) {
        showAlert('Model durumu güncellendi', 'success');
        fetchModels();
      } else {
        showAlert(response.message || 'Durum güncelleme başarısız', 'danger');
      }
    } catch (error) {
      showAlert('Durum güncelleme sırasında hata oluştu', 'danger');
    }
  };

  const onModelDragEnd = async (result) => {
    if (!result.destination) return;
    const previous = models;
    const reordered = Array.from(models);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const withOrder = reordered.map((m, idx) => ({ ...m, order_index: idx + 1 }));
    setModels(withOrder);

    try {
      const orders = withOrder.map((m, idx) => ({ id: m.id, order_index: idx + 1 }));
      const resp = await put('/api/watches/models/order', { orders });
      if (!resp || resp.success !== true) {
        setModels(previous);
        showAlert(resp?.message || 'Sıralama kaydedilemedi', 'danger');
      } else {
        showAlert('Sıralama güncellendi', 'success');
      }
    } catch (error) {
      setModels(previous);
      const msg = error?.response?.data?.message || 'Sıralama kaydedilirken hata oluştu';
      showAlert(msg, 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    

    
    if (!formData.brand_id || !formData.name.trim()) {
      showAlert('Marka ve model adı gerekli', 'danger');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('brand_id', formData.brand_id);
      submitData.append('name', formData.name);
      submitData.append('model', formData.model);
      submitData.append('specifications', formData.specifications);
      submitData.append('description', formData.description);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      // Renk verilerini ekle
      if (formData.colors && formData.colors.length > 0) {
        
        // Process colors and upload color images
        const processedColors = [];
        
        for (let i = 0; i < formData.colors.length; i++) {
          const color = formData.colors[i];
          
          const processedColor = {
            name: color.name,
            hex: color.hex,
            gender: color.gender || 'unisex', // Gender alanını ekle
            image: null // Başlangıçta null
          };
          
          // Eğer mevcut bir resim yolu varsa (string), onu koru
          if (color.image && typeof color.image === 'string') {
            processedColor.image = color.image;
          }
          // Eğer yeni bir dosya yüklendiyse (File object)
          else if (color.image && typeof color.image !== 'string') {
            const colorImageKey = `color_image_${i}`;
            submitData.append(colorImageKey, color.image);
            processedColor.image = colorImageKey; // Backend'de bu key ile dosya bulunacak
          }
          
          processedColors.push(processedColor);
        }
        
        submitData.append('colors', JSON.stringify(processedColors));
      }

      // Ek görselleri kaldır - artık kullanmıyoruz

      let response;
      if (editModal) {
        response = await put(`/api/watches/models/${selectedModel.id}`, submitData);
      } else {
        response = await post('/api/watches/models', submitData);
      }


      if (response.success) {
        showAlert(
          editModal ? 'Saat modeli başarıyla güncellendi' : 'Saat modeli başarıyla eklendi',
          'success'
        );
        fetchModels();
        resetForm();
      } else {
        showAlert(response.message || 'İşlem başarısız', 'danger');
      }
    } catch (error) {
      // Backend'den gelen hata mesajını göster
      const errorMessage = error.response?.data?.message || error.message || 'İşlem sırasında hata oluştu';
      showAlert(errorMessage, 'danger');
    }
  };

  const resetForm = () => {
    setFormData({
      brand_id: '',
      name: '',
      model: '',
      specifications: '',
      description: '',
      image: null,
      images: [],
      colors: []
    });
    setImagePreview(null);
    setEditImagePreview(null);
    setAddModal(false);
    setEditModal(false);
    setSelectedModel(null);
  };

  const openEditModal = (model) => {

    setSelectedModel(model);
    
    // Verileri işle
    let parsedImages = [];
    let parsedColors = [];
    let parsedSpecifications = '';
    
    // Images işle - veritabanından string olarak geliyor
    try {
      if (model.images) {
        if (Array.isArray(model.images)) {
          // Zaten array ise direkt kullan
          parsedImages = model.images;
        } else if (typeof model.images === 'string') {
          const trimmedImages = model.images.trim();
          if (trimmedImages !== '' && trimmedImages !== 'null' && trimmedImages !== '[]') {
            // String ise parse et
            parsedImages = JSON.parse(model.images);
          }
        }
      }
    } catch (e) {
      parsedImages = [];
    }
    
    // Colors işle - veritabanından string olarak geliyor
    try {
      if (model.colors) {
        if (Array.isArray(model.colors)) {
          // Zaten array ise direkt kullan
          parsedColors = model.colors;
        } else if (typeof model.colors === 'string') {
          const trimmedColors = model.colors.trim();
          if (trimmedColors !== '' && trimmedColors !== 'null' && trimmedColors !== '[]') {
            // String ise parse et
            parsedColors = JSON.parse(model.colors);
          }
        }
      }
      
      // Add originalImage property for existing colors
      parsedColors = parsedColors.map(color => ({
        ...color,
        imagePreview: null, // Yeni yüklenen resimler için
        originalImage: color.image || (color.images && color.images.length > 0 ? color.images[0] : null), // Mevcut resim yolunu sakla
        gender: color.gender || 'unisex' // Eğer gender yoksa default unisex
      }));
      
    } catch (e) {
      parsedColors = [];
    }
    
    // Specifications parse et
    try {
      if (model.specifications) {
        if (typeof model.specifications === 'string') {
          // Eğer JSON string ise parse et, değilse direkt kullan
          if (model.specifications.startsWith('{') || model.specifications.startsWith('[')) {
            const parsed = JSON.parse(model.specifications);
            parsedSpecifications = typeof parsed === 'object' ? JSON.stringify(parsed, null, 2) : parsed;
          } else {
            parsedSpecifications = model.specifications;
          }
        } else {
          parsedSpecifications = JSON.stringify(model.specifications, null, 2);
        }
      }
    } catch (e) {
      parsedSpecifications = model.specifications || '';
    }
    
    setFormData({
      brand_id: model.brand_id || '',
      name: model.name || '',
      model: model.model || '',
      specifications: parsedSpecifications,
      description: model.description || '',
      image: null,
      images: parsedImages,
      colors: parsedColors
    });
    setImagePreview(null);
    setEditImagePreview(model.image ? `${process.env.REACT_APP_API_URL}${model.image}` : null);
    setEditModal(true);
  };

  const openDeleteModal = (model) => {
    setSelectedModel(model);
    setDeleteModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 font-size-18">Saat Modelleri</h4>
              <div className="page-title-right">
                <Button color="primary" onClick={() => setAddModal(true)}>
                  <i className="fas fa-plus me-1"></i> Yeni Model Ekle
                </Button>
              </div>
            </div>
          </div>
        </div>

        {alert.show && (
          <Alert color={alert.color} className="alert-dismissible fade show">
            {alert.message}
          </Alert>
        )}

        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <CardTitle className="h4">Saat Modelleri Listesi</CardTitle>
                
                {/* Search Bar */}
                <div className="mb-3">
                  <div className="row">
                    <div className="col-md-6">
                      <div className="input-group">
                        <Input
                          type="text"
                          placeholder="Model adı, marka, model kodu veya açıklamaya göre ara..."
                          value={searchTerm}
                          onChange={handleSearchChange}
                          onKeyPress={handleSearchKeyPress}
                        />
                        {searchTerm && (
                          <Button
                            color="secondary"
                            onClick={handleClearSearch}
                            title="Aramayı temizle"
                          >
                            <i className="fas fa-times"></i>
                          </Button>
                        )}
                        <Button 
                          color="primary" 
                          onClick={handleSearch}
                          title="Ara"
                        >
                          <i className="fas fa-search"></i>
                        </Button>
                      </div>
                      {activeSearch && (
                        <small className="text-muted">
                          "{activeSearch}" için {totalModels} sonuç bulundu
                        </small>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="table-responsive">
                  <Table className="table-nowrap mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Görsel</th>
                        <th>Model Adı</th>
                        <th>Marka</th>
                        <th>Model Kodu</th>
                        <th>Özellikler</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <DragDropContext onDragEnd={onModelDragEnd}>
                      <Droppable droppableId="watchModels">
                        {(provided) => (
                          <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {models.map((model, index) => (
                              <Draggable key={model.id} draggableId={`model-${model.id}`} index={index}>
                                {(providedRow) => (
                                  <tr ref={providedRow.innerRef} {...providedRow.draggableProps}>
                                    <td {...providedRow.dragHandleProps} className="text-muted" style={{ cursor: 'grab' }}>
                                      <i className="fas fa-grip-vertical"></i>
                                    </td>
                                    <td>
                                      {model.image ? (
                                        <img
                                          src={`${process.env.REACT_APP_API_URL}${model.image}`}
                                          alt={model.name}
                                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                        />
                                      ) : (
                                        <div className="bg-light d-flex align-items-center justify-content-center" 
                                             style={{ width: '50px', height: '50px' }}>
                                          <i className="fas fa-image text-muted"></i>
                                        </div>
                                      )}
                                    </td>
                                    <td>
                                      <div>
                                        <h6 className="mb-1">{model.name}</h6>
                                        {model.description && (
                                          <small className="text-muted">
                                            {model.description.length > 50 
                                              ? model.description.substring(0, 50) + '...' 
                                              : model.description}
                                          </small>
                                        )}
                                      </div>
                                    </td>
                                    <td>{model.brand_name || '-'}</td>
                                    <td>{model.model || '-'}</td>
                                    <td>
                                      {model.specifications && typeof model.specifications === 'string' && model.specifications.trim() ? (
                                        <small className="text-muted">
                                          {model.specifications.length > 30 
                                            ? model.specifications.substring(0, 30) + '...' 
                                            : model.specifications}
                                        </small>
                                      ) : '-'}
                                    </td>
                                    <td>
                                      <Badge 
                                        color={model.is_active ? "success" : "danger"}
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleToggleStatus(model.id)}
                                        title="Durumu değiştirmek için tıklayın"
                                      >
                                        {model.is_active ? "Aktif" : "Pasif"}
                                      </Badge>
                                    </td>
                                    <td>
                                      <div className="d-flex gap-2">
                                        <Button
                                          color="info"
                                          size="sm"
                                          onClick={() => openEditModal(model)}
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                          color="danger"
                                          size="sm"
                                          onClick={() => openDeleteModal(model)}
                                        >
                                          <i className="fas fa-trash"></i>
                                        </Button>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </tbody>
                        )}
                      </Droppable>
                    </DragDropContext>
                  </Table>
                </div>
                {models.length === 0 && (
                  <div className="text-center py-4">
                    <p className="text-muted">Henüz saat modeli bulunmuyor.</p>
                  </div>
                )}
                
                {/* Pagination */}
                {renderPagination()}
                </CardBody>
              </Card>
          </div>
        </div>

        {/* Add Modal */}
        <Modal isOpen={addModal} toggle={() => setAddModal(!addModal)} size="lg">
          <ModalHeader toggle={() => setAddModal(!addModal)}>
            Yeni Saat Modeli Ekle
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="brand_id">Marka *</Label>
                    <Input
                      type="select"
                      id="brand_id"
                      value={formData.brand_id}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      required
                    >
                      <option value="">Marka Seçin</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="name">Model Adı *</Label>
                    <Input
                      type="text"
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </FormGroup>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="model">Model Kodu</Label>
                    <Input
                      type="text"
                      id="model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="image">Görsel</Label>
                    <Input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </FormGroup>
                </div>
              </div>

              <FormGroup>
                <Label for="description">Açıklama</Label>
                <Input
                  type="textarea"
                  id="description"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>
              
              {/* Renk Yönetimi */}
              <FormGroup>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Label>Model Renkleri</Label>
                  <Button 
                    color="success" 
                    size="sm" 
                    onClick={() => handleAddColor(false)}
                  >
                    <i className="mdi mdi-plus"></i> Renk Ekle
                  </Button>
                </div>
                
                {formData.colors.map((color, index) => (
                  <Card key={index} className="mb-2">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Renk {index + 1}</h6>
                        <Button 
                          color="danger" 
                          size="sm" 
                          onClick={() => handleRemoveColor(index, false)}
                        >
                          <i className="mdi mdi-delete"></i>
                        </Button>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-3">
                          <FormGroup>
                            <Label>Renk Adı *</Label>
                            <Input
                              type="text"
                              value={color.name}
                              onChange={(e) => updateColor(index, 'name', e.target.value, false)}
                              placeholder="Örn: Beyaz, Siyah, Kırmızı"
                              required
                            />
                          </FormGroup>
                        </div>
                        <div className="col-md-3">
                          <FormGroup>
                            <Label>Cinsiyet *</Label>
                            <Input
                              type="select"
                              value={color.gender || 'unisex'}
                              onChange={(e) => updateColor(index, 'gender', e.target.value, false)}
                              required
                            >
                              <option value="male">Erkek</option>
                              <option value="female">Kadın</option>
                              <option value="unisex">Unisex</option>
                            </Input>
                          </FormGroup>
                        </div>
                        <div className="col-md-3">
                          <FormGroup>
                            <Label>Renk Kodu *</Label>
                            <div className="d-flex align-items-center">
                              <Input
                                type="color"
                                value={color.hex && color.hex.startsWith('#') ? color.hex : '#000000'}
                                onChange={(e) => updateColor(index, 'hex', e.target.value, false)}
                                style={{ width: '50px', height: '38px', marginRight: '10px' }}
                                title="Renk seçici"
                              />
                              <Input
                                type="text"
                                value={color.hex || ''}
                                onChange={(e) => updateColor(index, 'hex', e.target.value, false)}
                                placeholder="#FF0000"
                                title="Renk kodu"
                              />
                            </div>
                          </FormGroup>
                        </div>
                        <div className="col-md-3">
                          <FormGroup>
                            <Label>Renk Resmi</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleColorImageChange(e, index, false)}
                              title="Renk için resim seçin"
                            />
                            {color.imagePreview && (
                              <div className="mt-2 position-relative">
                                <img 
                                  src={color.imagePreview} 
                                  alt={`${color.name} renk önizleme`}
                                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                />
                                <Button
                                  color="danger"
                                  size="sm"
                                  className="position-absolute"
                                  style={{ top: '-5px', right: '-5px', width: '20px', height: '20px', padding: '0', fontSize: '12px' }}
                                  onClick={() => {
                                    updateColor(index, 'imagePreview', null, false);
                                    updateColor(index, 'image', null, false);
                                  }}
                                  title="Resmi kaldır"
                                >
                                  ×
                                </Button>
                              </div>
                            )}
                          </FormGroup>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </FormGroup>
              
              {imagePreview && (
                <FormGroup>
                  <Label>Görsel Önizleme</Label>
                  <div>
                    <img
                      src={imagePreview}
                      alt="Önizleme"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                </FormGroup>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setAddModal(false)}>
                İptal
              </Button>
              <Button color="primary" type="submit">
                Ekle
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={editModal} toggle={() => setEditModal(!editModal)} size="lg">
          <ModalHeader toggle={() => setEditModal(!editModal)}>
            Saat Modeli Düzenle
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="edit-brand_id">Marka *</Label>
                    <Input
                      type="select"
                      id="edit-brand_id"
                      value={formData.brand_id}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      required
                    >
                      <option value="">Marka Seçin</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </Input>
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="edit-name">Model Adı *</Label>
                    <Input
                      type="text"
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </FormGroup>
                </div>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="edit-model">Model Kodu</Label>
                    <Input
                      type="text"
                      id="edit-model"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </FormGroup>
                </div>
                <div className="col-md-6">
                  <FormGroup>
                    <Label for="edit-image">Görsel</Label>
                    <Input
                      type="file"
                      id="edit-image"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                  </FormGroup>
                </div>
              </div>

              <FormGroup>
                <Label for="edit-description">Açıklama</Label>
                <Input
                  type="textarea"
                  id="edit-description"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </FormGroup>
             
              
              {/* Renk Yönetimi */}
              <FormGroup>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Label>Model Renkleri</Label>
                  <Button 
                    color="success" 
                    size="sm" 
                    onClick={() => handleAddColor(true)}
                  >
                    <i className="mdi mdi-plus"></i> Renk Ekle
                  </Button>
                </div>
                
                {formData.colors.map((color, index) => (
                  <Card key={index} className="mb-2">
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Renk {index + 1}</h6>
                        <Button 
                          color="danger" 
                          size="sm" 
                          onClick={() => handleRemoveColor(index, true)}
                        >
                          <i className="mdi mdi-delete"></i>
                        </Button>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-3">
                          <FormGroup>
                            <Label>Renk Adı *</Label>
                            <Input
                              type="text"
                              value={color.name}
                              onChange={(e) => updateColor(index, 'name', e.target.value, true)}
                              placeholder="Örn: Beyaz, Siyah, Kırmızı"
                              required
                            />
                          </FormGroup>
                        </div>
                        <div className="col-md-3">
                          <FormGroup>
                            <Label>Cinsiyet *</Label>
                            <Input
                              type="select"
                              value={color.gender || 'unisex'}
                              onChange={(e) => updateColor(index, 'gender', e.target.value, true)}
                              required
                            >
                              <option value="male">Erkek</option>
                              <option value="female">Kadın</option>
                              <option value="unisex">Unisex</option>
                            </Input>
                          </FormGroup>
                        </div>
                        <div className="col-md-3">
                          <FormGroup>
                            <Label>Renk Kodu *</Label>
                            <div className="d-flex align-items-center">
                              <Input
                                type="color"
                                value={color.hex && color.hex.startsWith('#') ? color.hex : '#000000'}
                                onChange={(e) => updateColor(index, 'hex', e.target.value, true)}
                                style={{ width: '50px', height: '38px', marginRight: '10px' }}
                                title="Renk seçici"
                              />
                              <Input
                                type="text"
                                value={color.hex || ''}
                                onChange={(e) => updateColor(index, 'hex', e.target.value, true)}
                                placeholder="#FF0000"
                                title="Renk kodu"
                              />
                            </div>
                          </FormGroup>
                        </div>
                        <div className="col-md-3">
                          <FormGroup>
                            <Label>Renk Resmi</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleColorImageChange(e, index, true)}
                              title="Renk için resim seçin"
                            />
                            {(color.imagePreview || color.originalImage) && (
                              <div className="mt-2 position-relative">
                                <img 
                                  src={color.imagePreview || `${process.env.REACT_APP_API_URL}${color.originalImage}`} 
                                  alt={`${color.name} renk önizleme`}
                                  style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <Button
                                  color="danger"
                                  size="sm"
                                  className="position-absolute"
                                  style={{ top: '-5px', right: '-5px', width: '20px', height: '20px', padding: '0', fontSize: '12px' }}
                                  onClick={() => {
                                    updateColor(index, 'imagePreview', null, true);
                                    updateColor(index, 'originalImage', null, true);
                                  }}
                                  title="Resmi kaldır"
                                >
                                  ×
                                </Button>
                              </div>
                            )}
                          </FormGroup>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </FormGroup>

              {/* Mevcut Ek Görseller */}
              {formData.images && formData.images.length > 0 ? (
                <FormGroup>
                  <Label>Mevcut Ek Görseller</Label>
                  <div className="d-flex flex-wrap gap-2">
                    {formData.images.map((image, index) => (
                      <img
                        key={index}
                        src={`${process.env.REACT_APP_API_URL}${image}`}
                        alt={`Ek görsel ${index + 1}`}
                        style={{ width: '80px', height: '80px', objectFit: 'cover' }}
                        className="rounded"
                      />
                    ))}
                  </div>
                </FormGroup>
              ) : (
                <FormGroup>
                  <Label>Ek Görseller</Label>
                  <div className="text-muted">
                    <small>Bu model için henüz ek görsel eklenmemiş.</small>
                  </div>
                </FormGroup>
              )}
              

              {selectedModel?.image && !imagePreview && (
                <FormGroup>
                  <Label>Mevcut Görsel</Label>
                  <div>
                    <img
                      src={`${process.env.REACT_APP_API_URL}${selectedModel.image}`}
                      alt={selectedModel.name}
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                </FormGroup>
              )}
              {imagePreview && (
                <FormGroup>
                  <Label>Yeni Görsel Önizleme</Label>
                  <div>
                    <img
                      src={imagePreview}
                      alt="Önizleme"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                  </div>
                </FormGroup>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setEditModal(false)}>
                İptal
              </Button>
              <Button color="primary" type="submit">
                Güncelle
              </Button>
            </ModalFooter>
          </Form>
        </Modal>

        {/* Delete Modal */}
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)}>
          <ModalHeader toggle={() => setDeleteModal(!deleteModal)}>
            Saat Modeli Sil
          </ModalHeader>
          <ModalBody>
            <p>
              <strong>{selectedModel?.name}</strong> modelini silmek istediğinizden emin misiniz?
            </p>
            <p className="text-muted">
              Bu işlem geri alınamaz. Modele ait ilanlar varsa silme işlemi başarısız olacaktır.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setDeleteModal(false)}>
              İptal
            </Button>
            <Button color="danger" onClick={handleDelete}>
              Sil
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </div>
  );
};

export default WatchModelList;