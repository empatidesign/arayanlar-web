import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardBody, CardTitle, Table, Button, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert } from 'reactstrap';
import { get, post, put, del } from '../../helpers/api_helper';

const WatchBrandList = () => {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: '', color: '' });
  const [formData, setFormData] = useState({
    name: '',
    logo: null
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      setLoading(true);
      const response = await get('/api/watches/brands');
      if (response.success) {
        setBrands(response.data);
      }
    } catch (error) {
      console.error('Saat markaları yüklenirken hata:', error);
      showAlert('Saat markaları yüklenirken hata oluştu', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, color) => {
    setAlert({ show: true, message, color });
    setTimeout(() => setAlert({ show: false, message: '', color: '' }), 3000);
  };

  const handleDelete = async () => {
    try {
      const response = await del(`/api/watches/brands/${selectedBrand.id}`);
      if (response.success) {
        showAlert('Saat markası başarıyla silindi', 'success');
        fetchBrands();
      } else {
        showAlert(response.message || 'Silme işlemi başarısız', 'danger');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      
      // Backend'den gelen hata mesajını göster
      let errorMessage = 'Silme işlemi sırasında hata oluştu';
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      }
      
      showAlert(errorMessage, 'danger');
    }
    setDeleteModal(false);
    setSelectedBrand(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      showAlert('Marka adı gerekli', 'danger');
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('country', formData.country);
      submitData.append('description', formData.description);
      if (formData.logo) {
        submitData.append('logo', formData.logo);
      }

      let response;
      if (editModal) {
        response = await put(`/api/watches/brands/${selectedBrand.id}`, submitData);
      } else {
        response = await post('/api/watches/brands', submitData);
      }

      if (response.success) {
        showAlert(
          editModal ? 'Saat markası başarıyla güncellendi' : 'Saat markası başarıyla eklendi',
          'success'
        );
        fetchBrands();
        resetForm();
      } else {
        showAlert(response.message || 'İşlem başarısız', 'danger');
      }
    } catch (error) {
      console.error('Form gönderme hatası:', error);
      showAlert('İşlem sırasında hata oluştu', 'danger');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: null
    });
    setAddModal(false);
    setEditModal(false);
    setSelectedBrand(null);
  };

  const openEditModal = (brand) => {
    setSelectedBrand(brand);
    setFormData({
      name: brand.name || '',
      logo: null
    });
    setEditModal(true);
  };

  const openDeleteModal = (brand) => {
    setSelectedBrand(brand);
    setDeleteModal(true);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, logo: file });
  };

  const onBrandDragEnd = async (result) => {
    if (!result.destination) return;
    const previous = brands;
    const reordered = Array.from(brands);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);

    const withOrder = reordered.map((b, idx) => ({ ...b, order_index: idx + 1 }));
    setBrands(withOrder);

    try {
      const orders = withOrder.map((b, idx) => ({ id: b.id, order_index: idx + 1 }));
      const resp = await put('/api/watches/brands/order', { orders });
      if (!resp || resp.success !== true) {
        setBrands(previous);
        showAlert(resp?.message || 'Sıralama kaydedilemedi', 'danger');
      } else {
        showAlert('Sıralama güncellendi', 'success');
      }
    } catch (error) {
      console.error('Saat markası sıralama hatası:', error);
      setBrands(previous);
      const msg = error?.response?.data?.message || 'Sıralama kaydedilirken hata oluştu';
      showAlert(msg, 'danger');
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
              <h4 className="mb-sm-0 font-size-18">Saat Markaları</h4>
              <div className="page-title-right">
                <Button color="primary" onClick={() => setAddModal(true)}>
                  <i className="fas fa-plus me-1"></i> Yeni Marka Ekle
                </Button>
              </div>
            </div>
          </div>
        </div>

        {alert.show && (
          <Alert color={alert.color} className="alert-dismissible fade show" fade timeout={3000}>
            {alert.message}
          </Alert>
        )}

        <div className="row">
          <div className="col-12">
            <Card>
              <CardBody>
                <CardTitle className="h4">Saat Markaları Listesi</CardTitle>
                <div className="table-responsive">
                  <Table className="table-nowrap mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: '40px' }}></th>
                        <th>Logo</th>
                        <th>Marka Adı</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <DragDropContext onDragEnd={onBrandDragEnd}>
                      <Droppable droppableId="watchBrands">
                        {(provided) => (
                          <tbody ref={provided.innerRef} {...provided.droppableProps}>
                            {brands.map((brand, index) => (
                              <Draggable key={brand.id} draggableId={`brand-${brand.id}`} index={index}>
                                {(providedRow) => (
                                  <tr ref={providedRow.innerRef} {...providedRow.draggableProps}>
                                    <td {...providedRow.dragHandleProps} className="text-muted" style={{ cursor: 'grab' }}>
                                      <i className="fas fa-grip-vertical"></i>
                                    </td>
                                    <td>
                                      {brand.image ? (
                                        <img
                                          src={`${process.env.REACT_APP_API_URL}${brand.image}`}
                                          alt={brand.name}
                                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                        />
                                      ) : (
                                        <div className="bg-light d-flex align-items-center justify-content-center" 
                                             style={{ width: '40px', height: '40px' }}>
                                          <i className="fas fa-image text-muted"></i>
                                        </div>
                                      )}
                                    </td>
                                    <td>{brand.name}</td>
                                    <td>
                                      <div className="d-flex gap-2">
                                        <Button
                                          color="info"
                                          size="sm"
                                          onClick={() => openEditModal(brand)}
                                        >
                                          <i className="fas fa-edit"></i>
                                        </Button>
                                        <Button
                                          color="danger"
                                          size="sm"
                                          onClick={() => openDeleteModal(brand)}
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
                  {brands.length === 0 && (
                    <div className="text-center py-4">
                      <p className="text-muted">Henüz saat markası bulunmuyor.</p>
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        </div>

        {/* Add Modal */}
        <Modal isOpen={addModal} toggle={() => setAddModal(!addModal)}>
          <ModalHeader toggle={() => setAddModal(!addModal)}>
            Yeni Saat Markası Ekle
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label for="name">Marka Adı *</Label>
                <Input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="logo">Logo</Label>
                <Input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                />
              </FormGroup>
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
        <Modal isOpen={editModal} toggle={() => setEditModal(!editModal)}>
          <ModalHeader toggle={() => setEditModal(!editModal)}>
            Saat Markası Düzenle
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <FormGroup>
                <Label for="edit-name">Marka Adı *</Label>
                <Input
                  type="text"
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </FormGroup>
              <FormGroup>
                <Label for="edit-logo">Logo</Label>
                <Input
                  type="file"
                  id="edit-logo"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                {selectedBrand?.image && (
                  <div className="mt-2">
                    <small className="text-muted">Mevcut logo:</small>
                    <br />
                    <img
                      src={`${process.env.REACT_APP_API_URL}${selectedBrand.image}`}
                      alt={selectedBrand.name}
                      style={{ width: '60px', height: '60px', objectFit: 'contain' }}
                    />
                  </div>
                )}
              </FormGroup>
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
            Saat Markası Sil
          </ModalHeader>
          <ModalBody>
            <p>
              <strong>{selectedBrand?.name}</strong> markasını silmek istediğinizden emin misiniz?
            </p>
            <p className="text-muted">
              Bu işlem geri alınamaz. Markaya ait modeller varsa silme işlemi başarısız olacaktır.
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

export default WatchBrandList;