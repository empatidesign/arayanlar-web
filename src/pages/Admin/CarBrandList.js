import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { Row, Col, Card, CardBody, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put, del } from "../../helpers/backend_helper";

const CarBrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  
  // Yeni marka ekleme modal state'leri
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newBrand, setNewBrand] = useState({
    name: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  
  // Düzenleme modal state'leri
  const [editModal, setEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editBrand, setEditBrand] = useState({
    id: '',
    name: '',
    description: '',
    image: null
  });
  const [editImagePreview, setEditImagePreview] = useState(null);
  
  // Alert state'leri
  const [alert, setAlert] = useState({ show: false, message: '', color: 'success' });

  // Breadcrumb
  document.title = "Araba Markaları Yönetimi | Arayanvar Admin";

  useEffect(() => {
    fetchBrands();
  }, []);

  const onDragEnd = async (result) => {
    if (!result.destination) return;
    const previous = brands;
    const reordered = Array.from(brands);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    setBrands(reordered);

    try {
      await put('/api/admin/car-brands/order', {
        orders: reordered.map((b, idx) => ({ id: b.id, order_index: idx + 1 }))
      });
      showAlert('Marka sıralaması güncellendi');
    } catch (error) {
      console.error('Marka sıralaması güncellenirken hata:', error);
      if (error.response) {
        console.error('Backend hata yanıtı:', error.response.status, error.response.data);
      }
      showAlert('Marka sıralaması güncellenemedi', 'danger');
      setBrands(previous);
    }
  };

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await get('/api/cars/brands');
      console.log('API Response:', response); // Debug log
      
      // Backend'den gelen response yapısına göre data'yı al
      const brandsData = response.success ? response.data : response;
      setBrands(Array.isArray(brandsData) ? brandsData : []);
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error);
      setBrands([]);
      showAlert('Markalar yüklenirken hata oluştu', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, color = 'success') => {
    setAlert({ show: true, message, color });
    setTimeout(() => setAlert({ show: false, message: '', color: 'success' }), 3000);
  };

  const handleDelete = async () => {
    if (!selectedBrand) return;

    // Eğer markaya ait modeller varsa uyarı göster
    if (selectedBrand.model_count > 0) {
      showAlert(`Bu markaya ait ${selectedBrand.model_count} model bulunmaktadır. Önce modelleri silmeniz gerekiyor.`, 'warning');
      setDeleteModal(false);
      setSelectedBrand(null);
      return;
    }

    try {
      await del(`/api/admin/car-brands/${selectedBrand.id}`);
      setBrands(prev => prev.filter(brand => brand.id !== selectedBrand.id));
      setDeleteModal(false);
      setSelectedBrand(null);
      showAlert('Marka başarıyla silindi');
    } catch (error) {
      console.error('Marka silinirken hata:', error);
      
      // Backend'den gelen hata mesajını göster
      let errorMessage = 'Marka silinirken hata oluştu';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      showAlert(errorMessage, 'danger');
    }
  };

  const handleImageChange = (e, isEdit = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (isEdit) {
          setEditImagePreview(reader.result);
          setEditBrand(prev => ({ ...prev, image: file }));
        } else {
          setImagePreview(reader.result);
          setNewBrand(prev => ({ ...prev, image: file }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddBrand = async () => {
    if (!newBrand.name.trim()) {
      showAlert('Marka adı gereklidir', 'danger');
      return;
    }

    try {
      setAddLoading(true);
      const formData = new FormData();
      formData.append('name', newBrand.name);
      formData.append('description', newBrand.description);
      if (newBrand.image) {
        formData.append('logo', newBrand.image);
      }

      const response = await post('/api/admin/car-brands', formData);
      setBrands(prev => [...prev, response.data]);
      setAddModal(false);
      setNewBrand({ name: '', description: '', image: null });
      setImagePreview(null);
      showAlert('Marka başarıyla eklendi');
    } catch (error) {
      console.error('Marka eklenirken hata:', error);
      showAlert('Marka eklenirken hata oluştu', 'danger');
    } finally {
      setAddLoading(false);
    }
  };

  const handleEditBrand = async () => {
    if (!editBrand.name.trim()) {
      showAlert('Marka adı gereklidir', 'danger');
      return;
    }

    try {
      setEditLoading(true);
      const formData = new FormData();
      formData.append('name', editBrand.name);
      formData.append('description', editBrand.description);
      if (editBrand.image) {
        formData.append('logo', editBrand.image);
      }

      const response = await put(`/api/admin/car-brands/${editBrand.id}`, formData);
      setBrands(prev => prev.map(brand => brand.id === editBrand.id ? response.data : brand));
      setEditModal(false);
      setEditBrand({ id: '', name: '', description: '', image: null });
      setEditImagePreview(null);
      showAlert('Marka başarıyla güncellendi');
    } catch (error) {
      console.error('Marka güncellenirken hata:', error);
      showAlert('Marka güncellenirken hata oluştu', 'danger');
    } finally {
      setEditLoading(false);
    }
  };

  const openEditModal = (brand) => {
    setEditBrand({
      id: brand.id,
      name: brand.name,
      description: brand.description || '',
      image: null
    });
    setEditImagePreview(brand.image_url);
    setEditModal(true);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Admin" breadcrumbItem="Araba Markaları" />
          
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
                    <h4 className="card-title">Araba Markaları</h4>
                    <Button 
                      color="primary" 
                      onClick={() => setAddModal(true)}
                    >
                      <i className="mdi mdi-plus me-1"></i>
                      Yeni Marka Ekle
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
                            <th style={{ width: '40px' }}>Taşı</th>
                            <th>ID</th>
                            <th>Resim</th>
                            <th>Marka Adı</th>
                            <th>Model Sayısı</th>
                            <th>Açıklama</th>
                            <th>Oluşturulma Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <DragDropContext onDragEnd={onDragEnd}>
                          <Droppable droppableId="car-brands-droppable" direction="vertical">
                            {(provided) => (
                              <tbody ref={provided.innerRef} {...provided.droppableProps}>
                                {brands.length > 0 ? (
                                  brands.map((brand, index) => (
                                    <Draggable key={brand.id} draggableId={String(brand.id)} index={index}>
                                      {(draggableProvided) => (
                                        <tr ref={draggableProvided.innerRef} {...draggableProvided.draggableProps} {...draggableProvided.dragHandleProps}>
                                          <td className="text-muted" style={{ cursor: 'grab' }}>
                                            <i className="mdi mdi-drag"></i>
                                          </td>
                                          <td>{brand.id}</td>
                                          <td>
                                            {brand.logo_url ? (
                                              <img 
                                                src={`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}${brand.logo_url}`} 
                                                alt={brand.name}
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
                                          <td>{brand.name}</td>
                                          <td>
                                            <Badge 
                                              color={brand.model_count > 0 ? "success" : "secondary"}
                                              className="me-1"
                                            >
                                              {brand.model_count || 0} model
                                            </Badge>
                                          </td>
                                          <td>{brand.description || '-'}</td>
                                          <td>{new Date(brand.created_at).toLocaleDateString('tr-TR')}</td>
                                          <td>
                                            <Button
                                              color="info"
                                              size="sm"
                                              className="me-2"
                                              onClick={() => openEditModal(brand)}
                                            >
                                              <i className="mdi mdi-pencil"></i>
                                            </Button>
                                            <Button
                                              color="danger"
                                              size="sm"
                                              onClick={() => {
                                                setSelectedBrand(brand);
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
                                    <td colSpan="8" className="text-center">
                                      Henüz marka bulunmuyor
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

          {/* Yeni Marka Ekleme Modal */}
          <Modal isOpen={addModal} toggle={() => setAddModal(!addModal)}>
            <ModalHeader toggle={() => setAddModal(!addModal)}>
              Yeni Marka Ekle
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup>
                  <Label for="brandName">Marka Adı *</Label>
                  <Input
                    type="text"
                    id="brandName"
                    value={newBrand.name}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Marka adını girin"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="brandDescription">Açıklama</Label>
                  <Input
                    type="textarea"
                    id="brandDescription"
                    value={newBrand.description}
                    onChange={(e) => setNewBrand(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Marka açıklamasını girin"
                    rows="3"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="brandImage">Marka Resmi</Label>
                  <Input
                    type="file"
                    id="brandImage"
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
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setAddModal(false)}>
                İptal
              </Button>
              <Button 
                color="primary" 
                onClick={handleAddBrand}
                disabled={addLoading}
              >
                {addLoading ? 'Ekleniyor...' : 'Ekle'}
              </Button>
            </ModalFooter>
          </Modal>

          {/* Marka Düzenleme Modal */}
          <Modal isOpen={editModal} toggle={() => setEditModal(!editModal)}>
            <ModalHeader toggle={() => setEditModal(!editModal)}>
              Marka Düzenle
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup>
                  <Label for="editBrandName">Marka Adı *</Label>
                  <Input
                    type="text"
                    id="editBrandName"
                    value={editBrand.name}
                    onChange={(e) => setEditBrand(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Marka adını girin"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="editBrandDescription">Açıklama</Label>
                  <Input
                    type="textarea"
                    id="editBrandDescription"
                    value={editBrand.description}
                    onChange={(e) => setEditBrand(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Marka açıklamasını girin"
                    rows="3"
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="editBrandImage">Marka Resmi</Label>
                  <Input
                    type="file"
                    id="editBrandImage"
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
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setEditModal(false)}>
                İptal
              </Button>
              <Button 
                color="primary" 
                onClick={handleEditBrand}
                disabled={editLoading}
              >
                {editLoading ? 'Güncelleniyor...' : 'Güncelle'}
              </Button>
            </ModalFooter>
          </Modal>

          {/* Silme Onay Modal */}
          <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)}>
            <ModalHeader toggle={() => setDeleteModal(!deleteModal)}>
              Marka Sil
            </ModalHeader>
            <ModalBody>
              <p>
                <strong>{selectedBrand?.name}</strong> markasını silmek istediğinizden emin misiniz?
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

export default CarBrandList;