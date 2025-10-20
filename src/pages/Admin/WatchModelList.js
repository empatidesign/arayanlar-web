import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchModels();
    fetchBrands();
  }, []);

  const fetchModels = async () => {
    try {
      setLoading(true);
      console.log('Fetching models...');
      const response = await get('/api/watches/models');
      console.log('Models response:', response);
      
      if (response.success) {
        console.log('Models data:', response.models);
        setModels(response.models || []);
      } else {
        console.error('Response not successful:', response);
        setModels([]);
      }
    } catch (error) {
      console.error('Saat modelleri yüklenirken hata:', error);
      showAlert('Saat modelleri yüklenirken hata oluştu', 'danger');
      setModels([]); // Hata durumunda boş array set et
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await get('/api/watches/brands');
      if (response.success) {
        setBrands(response.data);
      }
    } catch (error) {
      console.error('Saat markaları yüklenirken hata:', error);
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
      console.error('Silme hatası:', error);
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
      imagePreview: null
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
      console.error('Durum güncelleme hatası:', error);
      showAlert('Durum güncelleme sırasında hata oluştu', 'danger');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('Form submit başladı, editModal:', editModal);
    console.log('FormData:', formData);
    console.log('SelectedModel:', selectedModel);
    
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
            image: color.image && typeof color.image === 'string' ? color.image : null // Keep existing image path
          };
          
          // If color has a new image file, add it to formData
          if (color.image && typeof color.image !== 'string') {
            const colorImageKey = `color_image_${i}`;
            submitData.append(colorImageKey, color.image);
            processedColor.image = colorImageKey; // Reference to the uploaded file
          }
          
          processedColors.push(processedColor);
        }
        
        submitData.append('colors', JSON.stringify(processedColors));
      }

      // Ek görselleri kaldır - artık kullanmıyoruz

      let response;
      if (editModal) {
        console.log('PUT isteği gönderiliyor, URL:', `/api/watches/models/${selectedModel.id}`);
        response = await put(`/api/watches/models/${selectedModel.id}`, submitData);
      } else {
        console.log('POST isteği gönderiliyor');
        response = await post('/api/watches/models', submitData);
      }

      console.log('API Response:', response);

      if (response.success) {
        showAlert(
          editModal ? 'Saat modeli başarıyla güncellendi' : 'Saat modeli başarıyla eklendi',
          'success'
        );
        console.log('Başarılı, fetchModels çağrılıyor...');
        fetchModels();
        resetForm();
      } else {
        console.error('API response başarısız:', response);
        showAlert(response.message || 'İşlem başarısız', 'danger');
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      showAlert('İşlem sırasında hata oluştu', 'danger');
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
    console.log('Model data:', model); // Debug için
    console.log('Model images:', model.images); // Images debug
    console.log('Model colors:', model.colors); // Colors debug
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
      console.log('Processed images:', parsedImages);
    } catch (e) {
      console.error('Images parse error:', e);
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
        originalImage: color.image || (color.images && color.images.length > 0 ? color.images[0] : null) // Mevcut resim yolunu sakla
      }));
      
      console.log('Processed colors:', parsedColors);
    } catch (e) {
      console.error('Colors parse error:', e);
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
      console.error('Specifications parse error:', e);
      parsedSpecifications = model.specifications || '';
    }
    
    console.log('Final formData images:', parsedImages);
      console.log('Final formData colors:', parsedColors);
      console.log('Colors with images:', parsedColors.map(c => ({ name: c.name, image: c.image, originalImage: c.originalImage })));
    
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
                <div className="table-responsive">
                  <Table className="table-nowrap mb-0">
                    <thead>
                      <tr>
                        <th>Görsel</th>
                        <th>Model Adı</th>
                        <th>Marka</th>
                        <th>Model Kodu</th>
                        <th>Özellikler</th>
                        <th>Durum</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {models.map((model) => (
                        <tr key={model.id}>
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
                      ))}
                    </tbody>
                  </Table>
                  {models.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">Henüz saat modeli bulunmuyor.</p>
                    </div>
                  )}
                </div>
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
                        <div className="col-md-4">
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
                        <div className="col-md-4">
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
                                placeholder="Renk kodu (örn: #FF0000, kırmızı, rgb(255,0,0))"
                                title="Renk kodu - hex, rgb veya renk adı girebilirsiniz"
                              />
                            </div>
                          </FormGroup>
                        </div>
                        <div className="col-md-4">
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
                        <div className="col-md-4">
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
                        <div className="col-md-4">
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
                                placeholder="Renk kodu (örn: #FF0000, kırmızı, rgb(255,0,0))"
                                title="Renk kodu - hex, rgb veya renk adı girebilirsiniz"
                              />
                            </div>
                          </FormGroup>
                        </div>
                        <div className="col-md-4">
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
                                    console.log('Image load error:', color.originalImage);
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