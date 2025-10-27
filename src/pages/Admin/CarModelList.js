import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Row, Col, Card, CardBody, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put, del } from "../../helpers/backend_helper";

const CarModelList = () => {
  const [models, setModels] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  
  // Yeni model ekleme modal state'leri
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newModel, setNewModel] = useState({
    name: '',
    brand_id: '',
    description: '',
    engine_size: '',
    model_year_start: '',
    model_year_end: '',
    image: null,
    colors: [],
    is_active: true
  });
  const [imagePreview, setImagePreview] = useState(null);
  
  // Düzenleme modal state'leri
  const [editModal, setEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editModel, setEditModel] = useState({
    id: '',
    name: '',
    brand_id: '',
    description: '',
    engine_size: '',
    model_year_start: '',
    model_year_end: '',
    image: null,
    colors: [],
    is_active: true
  });
  const [editImagePreview, setEditImagePreview] = useState(null);
  
  // Alert state'leri
  const [alert, setAlert] = useState({ show: false, message: '', color: 'success' });

  // Breadcrumb
  document.title = "Araba Modelleri Yönetimi | Arayanvar Admin";

  useEffect(() => {
    fetchModels();
    fetchBrands();
  }, []);

  const onModelDragEnd = async (result) => {
    if (!result.destination) return;
    const previous = models;
    const reordered = Array.from(models);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setModels(reordered);

    try {
      await put('/api/admin/car-models/order', {
        orders: reordered.map((m, idx) => ({ id: m.id, order_index: idx + 1 }))
      });
      showAlert('Model sıralaması güncellendi');
    } catch (error) {
      console.error('Model sıralaması güncellenirken hata:', error);
      if (error.response) {
        console.error('Backend hata yanıtı:', error.response.status, error.response.data);
      }
      showAlert('Model sıralaması güncellenemedi', 'danger');
      setModels(previous);
    }
  };

  const fetchModels = async () => {
    try {
      setLoading(true);
      const response = await get('/api/cars/models');
      console.log('Models API Response:', response); // Debug log
      
      // Backend'den gelen response yapısına göre data'yı al
      const modelsData = response.success ? response.data : response;
      setModels(Array.isArray(modelsData) ? modelsData : []);
    } catch (error) {
      console.error('Modeller yüklenirken hata:', error);
      setModels([]);
      showAlert('Modeller yüklenirken hata oluştu', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await get('/api/cars/brands');
      console.log('Brands API Response:', response); // Debug log
      
      // Backend'den gelen response yapısına göre data'yı al
      const brandsData = response.success ? response.data : response;
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error);
      setBrands([]);
    }
  };

  const showAlert = (message, color = 'success') => {
    setAlert({ show: true, message, color });
    setTimeout(() => setAlert({ show: false, message: '', color: 'success' }), 3000);
  };

  const handleToggleStatus = async (modelId, currentStatus) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/api/admin/car-models/${modelId}/toggle-status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
      });

      if (response.ok) {
        const result = await response.json();
        
        // Modelleri güncelle
        setModels(prev => prev.map(model => 
          model.id === modelId 
            ? { ...model, is_active: result.data.is_active }
            : model
        ));
        
        showAlert(result.message, 'success');
      } else {
        throw new Error('Durum güncellenemedi');
      }
    } catch (error) {
      console.error('Durum güncellenirken hata:', error);
      showAlert('Durum güncellenirken hata oluştu', 'danger');
    }
  };

  const handleDelete = async () => {
    if (!selectedModel) return;

    try {
      await del(`/api/admin/car-models/${selectedModel.id}`);
      setModels(prev => prev.filter(model => model.id !== selectedModel.id));
      setDeleteModal(false);
      setSelectedModel(null);
      showAlert('Model başarıyla silindi');
    } catch (error) {
      console.error('Model silinirken hata:', error);
      showAlert('Model silinirken hata oluştu', 'danger');
    }
  };

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditImagePreview(reader.result);
          setEditModel(prev => ({ ...prev, image: file }));
        } else {
          setImagePreview(reader.result);
          setNewModel(prev => ({ ...prev, image: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Renk yönetimi fonksiyonları
  const addColor = (isEdit = false) => {
    const newColor = {
      name: '',
      hex: '#000000',
      image: null,
      imagePreview: null
    };
    
    if (isEdit) {
      setEditModel(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
    } else {
      setNewModel(prev => ({
        ...prev,
        colors: [...prev.colors, newColor]
      }));
    }
  };

  const removeColor = (index, isEdit = false) => {
    if (isEdit) {
      setEditModel(prev => ({
        ...prev,
        colors: prev.colors.filter((_, i) => i !== index)
      }));
    } else {
      setNewModel(prev => ({
        ...prev,
        colors: prev.colors.filter((_, i) => i !== index)
      }));
    }
  };

  const updateColor = (index, field, value, isEdit = false) => {
    if (isEdit) {
      setEditModel(prev => ({
        ...prev,
        colors: prev.colors.map((color, i) => {
          if (i === index) {
            const updatedColor = { ...color, [field]: value };
            // Eğer imagePreview null yapılıyorsa, image ve originalImage'ı da temizle
            if (field === 'imagePreview' && value === null) {
              updatedColor.image = null;
              updatedColor.originalImage = null;
            }
            return updatedColor;
          }
          return color;
        })
      }));
    } else {
      setNewModel(prev => ({
        ...prev,
        colors: prev.colors.map((color, i) => 
          i === index ? { ...color, [field]: value } : color
        )
      }));
    }
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

  const handleAddModel = async () => {
    if (!newModel.name.trim()) {
      showAlert('Model adı gereklidir', 'danger');
      return;
    }
    if (!newModel.brand_id) {
      showAlert('Marka seçimi gereklidir', 'danger');
      return;
    }


    try {
      setAddLoading(true);
      const formData = new FormData();
      formData.append('name', newModel.name);
      formData.append('brand_id', newModel.brand_id);
      formData.append('description', newModel.description);
      formData.append('engine_size', newModel.engine_size);
      formData.append('model_year_start', newModel.model_year_start);
      if (newModel.model_year_end) {
        formData.append('model_year_end', newModel.model_year_end);
      }
      formData.append('is_active', newModel.is_active !== undefined ? newModel.is_active : true);
      
      // Add colors data
      if (newModel.colors && newModel.colors.length > 0) {
        // Process colors and upload color images
        const processedColors = [];
        
        for (let i = 0; i < newModel.colors.length; i++) {
          const color = newModel.colors[i];
          const processedColor = {
            name: color.name,
            hex: color.hex,
            image: null
          };
          
          // If color has an image, add it to formData
          if (color.image) {
            const colorImageKey = `color_image_${i}`;
            formData.append(colorImageKey, color.image);
            processedColor.image = colorImageKey; // Reference to the uploaded file
          }
          
          processedColors.push(processedColor);
        }
        
        formData.append('colors', JSON.stringify(processedColors));
      }
      
      if (newModel.image) {
        formData.append('image', newModel.image);
      }

      const response = await post('/api/admin/car-models', formData);
      
      // Backend'den dönen response yapısına göre data'yı al
      const newModelData = response.data;
      setModels(prev => [...prev, newModelData]);
      setAddModal(false);
      setNewModel({ name: '', brand_id: '', description: '', engine_size: '', model_year_start: '', model_year_end: '', image: null, colors: [], is_active: true });
      setImagePreview(null);
      showAlert('Model başarıyla eklendi');
    } catch (error) {
      console.error('Model eklenirken hata:', error);
      showAlert('Model eklenirken hata oluştu', 'danger');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditModel = async () => {
    if (!editModel.name.trim()) {
      showAlert('Model adı gereklidir', 'danger');
      return;
    }
    if (!editModel.brand_id) {
      showAlert('Marka seçimi gereklidir', 'danger');
      return;
    }


    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append('name', editModel.name);
      formData.append('brand_id', editModel.brand_id);
      formData.append('description', editModel.description);
      formData.append('engine_size', editModel.engine_size);
      formData.append('model_year_start', editModel.model_year_start);
      if (editModel.model_year_end) {
        formData.append('model_year_end', editModel.model_year_end);
      }
      formData.append('is_active', editModel.is_active !== undefined ? editModel.is_active : true);
      
      // Add colors data
      if (editModel.colors && editModel.colors.length > 0) {
        // Process colors and upload color images
        const processedColors = [];
        
        for (let i = 0; i < editModel.colors.length; i++) {
          const color = editModel.colors[i];
          const processedColor = {
            name: color.name,
            hex: color.hex,
            image_url: color.originalImage || null // Use originalImage (which contains image_url) for existing images
          };
          
          // If color has a new image file, add it to formData
          if (color.image && typeof color.image !== 'string') {
            const colorImageKey = `color_image_${i}`;
            formData.append(colorImageKey, color.image);
            processedColor.image_url = colorImageKey; // Reference to the uploaded file
          }
          
          processedColors.push(processedColor);
        }
        
        formData.append('colors', JSON.stringify(processedColors));
      }
      
      if (editModel.image) {
        formData.append('image', editModel.image);
      }

      const response = await put(`/api/admin/car-models/${editModel.id}`, formData);
      
      // Backend'den dönen response yapısına göre data'yı al
      const updatedModelData = response.data;
      setModels(prev => prev.map(model => model.id === editModel.id ? updatedModelData : model));
      setEditModal(false);
      setEditModel({ id: '', name: '', brand_id: '', description: '', engine_size: '', image: null, colors: [], is_active: true });
      setEditImagePreview(null);
      showAlert('Model başarıyla güncellendi');
    } catch (error) {
      console.error('Model güncellenirken hata:', error);
      showAlert('Model güncellenirken hata oluştu', 'danger');
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = (model) => {
    // Parse existing colors if they exist
    let existingColors = [];
    if (model.colors) {
      try {
        existingColors = typeof model.colors === 'string' 
          ? JSON.parse(model.colors) 
          : model.colors;
        
        // Add imagePreview property for existing colors
        existingColors = existingColors.map(color => ({
          ...color,
          imagePreview: color.image_url ? `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${color.image_url}` : null,
          originalImage: color.image_url // Mevcut resim yolunu sakla
        }));
      } catch (error) {
        console.error('Error parsing colors:', error);
        existingColors = [];
      }
    }

    setEditModel({
      id: model.id,
      name: model.name,
      brand_id: model.brand_id,
      description: model.description || '',
      engine_size: model.engine_size || '',
      model_year_start: model.model_year_start || '',
      model_year_end: model.model_year_end || '',
      image: null,
      colors: existingColors,
      is_active: model.is_active !== undefined ? model.is_active : true
    });
    setEditImagePreview(model.image_url ? `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${model.image_url}` : null);
    setEditModal(true);
  };

  const getBrandName = (brandId) => {
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.name : 'Bilinmeyen Marka';
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Admin" breadcrumbItem="Araba Modelleri" />
          
          {alert.show && (
            <Alert color={alert.color} className="mb-3" fade={false}>
              {alert.message}
            </Alert>
          )}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="card-title">Araba Modelleri</h4>
                    <Button 
                      color="primary" 
                      onClick={() => setAddModal(true)}
                    >
                      <i className="mdi mdi-plus me-1"></i>
                      Yeni Model Ekle
                    </Button>
                  </div>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Yükleniyor...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table className="table-nowrap mb-0">
                        <thead>
                          <tr>
                            <th></th>
                            <th>ID</th>
                            <th>Resim</th>
                            <th>Model Adı</th>
                            <th>Marka</th>
                            <th>Açıklama</th>
                            <th>Durum</th>
                            <th>Oluşturulma Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <DragDropContext onDragEnd={onModelDragEnd}>
                          <Droppable droppableId="car-models-droppable" direction="vertical">
                            {(provided) => (
                              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                {models.length > 0 ? (
                                  models.map((model, index) => (
                                    <Draggable key={model.id} draggableId={String(model.id)} index={index}>
                                      {(draggableProvided) => (
                                        <tr ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps}>
                                          <td className="text-muted" style={{ cursor: 'grab' }}>
                                            <i className="mdi mdi-drag"></i>
                                          </td>
                                          <td>{model.id}</td>
                                <td>
                                  {model.image_url ? (
                                    <img 
                                      src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${model.image_url}`} 
                                      alt={model.name}
                                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                    />
                                  ) : (
                                    <div 
                                      style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        backgroundColor: '#f8f9fa', 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        borderRadius: '4px'
                                      }}
                                    >
                                      <i className="mdi mdi-image text-muted"></i>
                                    </div>
                                  )}
                                </td>
                                <td>{model.name}</td>
                                <td>
                                  <Badge color="info" className="me-1">
                                    {getBrandName(model.brand_id)}
                                  </Badge>
                                </td>
                                <td>{model.description || '-'}</td>
                                <td>
                                  <Badge 
                                    color={model.is_active ? "success" : "danger"}
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => handleToggleStatus(model.id, model.is_active)}
                                    title="Durumu değiştirmek için tıklayın"
                                  >
                                    {model.is_active ? "Aktif" : "Pasif"}
                                  </Badge>
                                </td>
                                <td>{new Date(model.created_at).toLocaleDateString('tr-TR')}</td>
                                <td>
                                  <Button
                                    color="info"
                                    size="sm"
                                    className="me-2"
                                    onClick={() => openEditModal(model)}
                                  >
                                    <i className="mdi mdi-pencil"></i>
                                  </Button>
                                  <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedModel(model);
                                      setDeleteModal(true);
                                    }}
                                  >
                                    <i className="mdi mdi-delete"></i>
                                  </Button>
                                </td>
                                        </tr>
                                      )}
                                    </Draggable>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="9" className="text-center">
                                      Henüz model bulunmuyor
                                    </td>
                                  </tr>
                                )}
                                {provided.placeholder}
                              </tbody>
                            )}
                          </Droppable>
                        </DragDropContext>
                      </Table>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Yeni Model Ekleme Modal */}
          <Modal isOpen={addModal} toggle={() => setAddModal(!addModal)}>
            <ModalHeader toggle={() => setAddModal(!addModal)}>
              Yeni Model Ekle
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup>
                  <Label for="modelBrand">Marka *</Label>
                  <Input
                    type="select"
                    id="modelBrand"
                    value={newModel.brand_id}
                    onChange={(e) => setNewModel(prev => ({ ...prev, brand_id: e.target.value }))}
                  >
                    <option value="">Marka seçin</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
             
                <FormGroup>
                  <Label for="modelEngineSize">Motor Hacmi</Label>
                  <Input
                    type="text"
                    id="modelEngineSize"
                    value={newModel.engine_size}
                    onChange={(e) => setNewModel(prev => ({ ...prev, engine_size: e.target.value }))}
                    placeholder="Motor hacmini girin (örn: 1.6, 2.0)"
                  />
                  <small className="form-text text-muted">
                    Birden fazla motor hacmi için virgül ile ayırın (örn: 1.6, 2.0, 2.5)
                  </small>
                </FormGroup>
                
          {/*       <Row>
                  <Col md={12}>
                    <FormGroup>
                      <Label for="modelYearStart">Başlangıç Yılı</Label>
                      <Input
                        type="number"
                        id="modelYearStart"
                        value={newModel.model_year_start}
                        onChange={(e) => setNewModel(prev => ({ ...prev, model_year_start: e.target.value }))}
                        placeholder="Başlangıç yılını girin"
                        min="1900"
                        max="2030"
                      />
                    </FormGroup>
                  </Col>
                </Row> */}
                <FormGroup>
                  <Label for="modelName">Model Adı *</Label>
                  <Input
                    type="text"
                    id="modelName"
                    value={newModel.name}
                    onChange={(e) => setNewModel(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Model adını girin"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="modelDescription">Açıklama</Label>
                  <Input
                    type="textarea"
                    id="modelDescription"
                    value={newModel.description}
                    onChange={(e) => setNewModel(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Model açıklamasını girin"
                    rows="3"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="modelImage">Model Resmi</Label>
                  <Input
                    type="file"
                    id="modelImage"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, false)}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img 
                        src={imagePreview} 
                        alt="Önizleme"
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </div>
                  )}
                </FormGroup>
                
                <FormGroup>
                  <div className="form-check">
                    <Input
                      type="checkbox"
                      id="modelIsActive"
                      checked={newModel.is_active}
                      onChange={(e) => setNewModel(prev => ({ ...prev, is_active: e.target.checked }))}
                    />
                    <Label check for="modelIsActive">
                      Aktif
                    </Label>
                  </div>
                </FormGroup>

                {/* Renk Yönetimi */}
                <FormGroup>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label>Model Renkleri</Label>
                    <Button 
                      color="success" 
                      size="sm" 
                      onClick={() => addColor(false)}
                    >
                      <i className="mdi mdi-plus"></i> Renk Ekle
                    </Button>
                  </div>
                  
                  {newModel.colors.map((color, index) => (
                    <div key={index} className="border p-3 mb-2 rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Renk {index + 1}</h6>
                        <Button 
                          color="danger" 
                          size="sm" 
                          onClick={() => removeColor(index, false)}
                        >
                          <i className="mdi mdi-delete"></i>
                        </Button>
                      </div>
                      
                      <Row>
                        <Col md={4}>
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
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label>Renk Kodu *</Label>
                            <div className="d-flex align-items-center">
                              <Input
                                type="color"
                                value={color?.hex && color.hex.startsWith('#') ? color.hex : '#000000'}
                                onChange={(e) => updateColor(index, 'hex', e.target.value, false)}
                                style={{ width: '50px', height: '38px', marginRight: '10px' }}
                                title="Renk seçici"
                              />
                              <Input
                                type="text"
                                value={color.hex}
                                onChange={(e) => updateColor(index, 'hex', e.target.value, false)}
                                placeholder="Renk kodu (örn: #FF0000, kırmızı, rgb(255,0,0))"
                                title="Renk kodu - hex, rgb veya renk adı girebilirsiniz"
                              />
                            </div>
                          </FormGroup>
                        </Col>
                        <Col md={4}>
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
                                  onClick={() => updateColor(index, 'imagePreview', null, false)}
                                  title="Resmi kaldır"
                                >
                                  ×
                                </Button>
                              </div>
                            )}
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setAddModal(false)}>
                İptal
              </Button>
              <Button 
                color="primary" 
                onClick={handleAddModel}
                disabled={addLoading}
              >
                {addLoading ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </ModalFooter>
          </Modal>

          {/* Model Düzenleme Modal */}
          <Modal isOpen={editModal} toggle={() => setEditModal(!editModal)}>
            <ModalHeader toggle={() => setEditModal(!editModal)}>
              Model Düzenle
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup>
                  <Label for="editModelBrand">Marka *</Label>
                  <Input
                    type="select"
                    id="editModelBrand"
                    value={editModel.brand_id}
                    onChange={(e) => setEditModel(prev => ({ ...prev, brand_id: e.target.value }))}
                  >
                    <option value="">Marka seçin</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>
                        {brand.name}
                      </option>
                    ))}
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="editModelEngineSize">Motor Hacmi</Label>
                  <Input
                    type="text"
                    id="editModelEngineSize"
                    value={editModel.engine_size}
                    onChange={(e) => setEditModel(prev => ({ ...prev, engine_size: e.target.value }))}
                    placeholder="Motor hacmini girin (örn: 1.6, 2.0)"
                  />
                  <small className="form-text text-muted">
                    Birden fazla motor hacmi için virgül ile ayırın (örn: 1.6, 2.0, 2.5)
                  </small>
                </FormGroup>
                
                <Row>
             {/*      <Col md={6}>
                    <FormGroup>
                      <Label for="editModelYearStart">Başlangıç Yılı *</Label>
                      <Input
                        type="number"
                        id="editModelYearStart"
                        value={editModel.model_year_start}
                        onChange={(e) => setEditModel(prev => ({ ...prev, model_year_start: e.target.value }))}
                        placeholder="Başlangıç yılını girin"
                        min="1900"
                        max="2030"
                      />
                    </FormGroup>
                  </Col> */}
                  {/* <Col md={6}>
                    <FormGroup>
                      <Label for="editModelYearEnd">Bitiş Yılı</Label>
                      <Input
                        type="number"
                        id="editModelYearEnd"
                        value={editModel.model_year_end}
                        onChange={(e) => setEditModel(prev => ({ ...prev, model_year_end: e.target.value }))}
                        placeholder="Bitiş yılını girin (opsiyonel)"
                        min="1900"
                        max="2030"
                      />
                    </FormGroup>
                  </Col> */}
                </Row>
                <FormGroup>
                  <Label for="editModelName">Model Adı *</Label>
                  <Input
                    type="text"
                    id="editModelName"
                    value={editModel.name}
                    onChange={(e) => setEditModel(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Model adını girin"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="editModelDescription">Açıklama</Label>
                  <Input
                    type="textarea"
                    id="editModelDescription"
                    value={editModel.description}
                    onChange={(e) => setEditModel(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Model açıklamasını girin"
                    rows="3"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="editModelImage">Model Resmi</Label>
                  <Input
                    type="file"
                    id="editModelImage"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, true)}
                  />
                  {editImagePreview && (
                    <div className="mt-2">
                      <img 
                        src={editImagePreview} 
                        alt="Önizleme"
                        style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }}
                      />
                    </div>
                  )}
                </FormGroup>

                {/* Renk Yönetimi */}
                <FormGroup>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Label>Model Renkleri</Label>
                    <Button 
                      color="success" 
                      size="sm" 
                      onClick={() => addColor(true)}
                    >
                      <i className="mdi mdi-plus"></i> Renk Ekle
                    </Button>
                  </div>
                  
                  {editModel.colors.map((color, index) => (
                    <div key={index} className="border p-3 mb-2 rounded">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h6 className="mb-0">Renk {index + 1}</h6>
                        <Button 
                          color="danger" 
                          size="sm" 
                          onClick={() => removeColor(index, true)}
                        >
                          <i className="mdi mdi-delete"></i>
                        </Button>
                      </div>
                      
                      <Row>
                        <Col md={4}>
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
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label>Renk Kodu *</Label>
                            <div className="d-flex align-items-center">
                              <Input
                                type="color"
                                value={color?.hex && color.hex.startsWith('#') ? color.hex : '#000000'}
                                onChange={(e) => updateColor(index, 'hex', e.target.value, true)}
                                style={{ width: '50px', height: '38px', marginRight: '10px' }}
                                title="Renk seçici"
                              />
                              <Input
                                type="text"
                                value={color.hex}
                                onChange={(e) => updateColor(index, 'hex', e.target.value, true)}
                                placeholder="Renk kodu (örn: #FF0000, kırmızı, rgb(255,0,0))"
                                title="Renk kodu - hex, rgb veya renk adı girebilirsiniz"
                              />
                            </div>
                          </FormGroup>
                        </Col>
                        <Col md={4}>
                          <FormGroup>
                            <Label>Renk Resmi</Label>
                            <Input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleColorImageChange(e, index, true)}
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
                                  onClick={() => updateColor(index, 'imagePreview', null, true)}
                                  title="Resmi kaldır"
                                >
                                  ×
                                </Button>
                              </div>
                            )}
                          </FormGroup>
                        </Col>
                      </Row>
                    </div>
                  ))}
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setEditModal(false)}>
                İptal
              </Button>
              <Button 
                color="primary" 
                onClick={handleEditModel}
                disabled={editLoading}
              >
                {editLoading ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
            </ModalFooter>
          </Modal>

          {/* Silme Onay Modal */}
          <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)}>
            <ModalHeader toggle={() => setDeleteModal(!deleteModal)}>
              Model Sil
            </ModalHeader>
            <ModalBody>
              <p>
                <strong>{selectedModel?.name}</strong> modelini silmek istediğinizden emin misiniz?
                Bu işlem geri alınamaz.
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
    </React.Fragment>
  );
};

export default CarModelList;