import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Link, useNavigate } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Table,
  Button,
  Alert,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormGroup,
  Label,
  Input,
  Form
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { get, post, put, del } from '../../helpers/api_helper';

const DistrictList = () => {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [deleteModal, setDeleteModal] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: null
  });

  useEffect(() => {
    fetchDistricts();
  }, []);

  const fetchDistricts = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await get('/api/districts');
      
      if (response.success) {
        setDistricts(response.data || []);
      } else {
        setError(response.message || 'İlçeler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('İlçeler yüklenirken hata:', error);
      setError('İlçeler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Liste içinde öğeleri yeniden sıralamak için yardımcı
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return result;
  };

  // Sürükle-bırak bittiğinde çağrılır
  const onDistrictDragEnd = async (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destIndex = result.destination.index;
    if (sourceIndex === destIndex) return;

    const prev = districts;
    const reordered = reorder(prev, sourceIndex, destIndex);
    setDistricts(reordered);

    const payload = {
      orders: reordered.map((d, idx) => ({ id: d.id, order_index: idx + 1 }))
    };

    try {
      const resp = await put('/api/districts/order', payload);
      if (resp?.success) {
        setSuccess('Sıralama başarıyla güncellendi');
      } else {
        setError(resp?.message || 'Sıralama güncellenirken hata oluştu');
        setDistricts(prev); // geri al
      }
    } catch (err) {
      console.error('İlçe sıralama güncelleme hatası:', err);
      setError('Sıralama güncellenirken bir hata oluştu');
      setDistricts(prev); // geri al
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      
      const submitData = new FormData();
      submitData.append('name', formData.name);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      let response;
      if (editModal && selectedDistrict) {
        response = await put(`/api/districts/${selectedDistrict.id}`, submitData);
      } else {
        response = await post('/api/districts', submitData);
      }

      if (response.success) {
        setSuccess(editModal ? 'İlçe başarıyla güncellendi' : 'İlçe başarıyla eklendi');
        setAddModal(false);
        setEditModal(false);
        setFormData({ name: '', image: null });
        setSelectedDistrict(null);
        fetchDistricts();
      } else {
        setError(response.message || 'İşlem sırasında hata oluştu');
      }
    } catch (error) {
      console.error('İşlem sırasında hata:', error);
      setError('İşlem sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDistrict) return;

    try {
      setLoading(true);
      setError('');

      const response = await del(`/api/districts/${selectedDistrict.id}`);

      if (response.success) {
        setSuccess('İlçe başarıyla silindi');
        setDeleteModal(false);
        setSelectedDistrict(null);
        fetchDistricts();
      } else {
        setError(response.message || 'İlçe silinirken hata oluştu');
      }
    } catch (error) {
      console.error('İlçe silinirken hata:', error);
      setError('İlçe silinirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (district) => {
    setSelectedDistrict(district);
    setFormData({
      name: district.name,
      image: null
    });
    setEditModal(true);
  };

  const openDeleteModal = (district) => {
    setSelectedDistrict(district);
    setDeleteModal(true);
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${process.env.REACT_APP_API_URL}${imagePath}`;
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Admin" breadcrumbItem="İlçe Yönetimi" />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title">İlçe Listesi</h4>
                    <div className="d-flex gap-2">
                      <Button 
                        color="primary" 
                        onClick={() => setAddModal(true)}
                      >
                        <i className="mdi mdi-plus me-1"></i>
                        Yeni İlçe Ekle
                      </Button>
                      <Link to="/admin/districts/add" className="btn btn-outline-primary">
                        <i className="mdi mdi-form-select me-1"></i>
                        Form Sayfası
                      </Link>
                    </div>
                  </div>

                  {error && (
                    <Alert color="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert color="success" className="mb-4">
                      {success}
                    </Alert>
                  )}

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Yükleniyor...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <DragDropContext onDragEnd={onDistrictDragEnd}>
                      <Table className="table table-centered table-nowrap mb-0">
                        <thead>
                          <tr>
                            <th style={{ width: '36px' }} title="Sürükleyip taşı">
                              <i className="mdi mdi-drag"></i>
                            </th>
                            <th>ID</th>
                            <th>Resim</th>
                            <th>İlçe Adı</th>
                            <th>Oluşturulma Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <Droppable droppableId="districts-droppable" direction="vertical">
                          {(provided) => (
                            <tbody ref={provided.innerRef} {...provided.droppableProps}>
                              {districts.length > 0 ? (
                                districts.map((district, index) => (
                                  <Draggable key={district.id} draggableId={`district-${district.id}`} index={index}>
                                    {(providedDraggable, snapshot) => (
                                      <tr
                                        ref={providedDraggable.innerRef}
                                        {...providedDraggable.draggableProps}
                                        style={{
                                          ...providedDraggable.draggableProps.style,
                                          background: snapshot.isDragging ? '#f8f9fa' : undefined
                                        }}
                                      >
                                        <td {...providedDraggable.dragHandleProps} className="text-muted">
                                          <i className="mdi mdi-drag"></i>
                                        </td>
                                        <td>{district.id}</td>
                                        <td>
                                          {district.image ? (
                                            <img
                                              src={getImageUrl(district.image)}
                                              alt={district.name}
                                              className="rounded"
                                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                            />
                                          ) : (
                                            <div 
                                              className="bg-light rounded d-flex align-items-center justify-content-center"
                                              style={{ width: '50px', height: '50px' }}
                                            >
                                              <i className="mdi mdi-image text-muted"></i>
                                            </div>
                                          )}
                                        </td>
                                        <td>{district.name}</td>
                                        <td>
                                          {district.created_at ? 
                                            new Date(district.created_at).toLocaleDateString('tr-TR') : 
                                            '-'
                                          }
                                        </td>
                                        <td>
                                          <div className="d-flex gap-2">
                                            <Button
                                              color="info"
                                              size="sm"
                                              onClick={() => openEditModal(district)}
                                            >
                                              <i className="mdi mdi-pencil"></i>
                                            </Button>
                                            <Button
                                              color="danger"
                                              size="sm"
                                              onClick={() => openDeleteModal(district)}
                                            >
                                              <i className="mdi mdi-delete"></i>
                                            </Button>
                                          </div>
                                        </td>
                                      </tr>
                                    )}
                                  </Draggable>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="6" className="text-center">
                                    Henüz ilçe bulunmuyor
                                  </td>
                                </tr>
                              )}
                              {provided.placeholder}
                            </tbody>
                          )}
                        </Droppable>
                      </Table>
                      </DragDropContext>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Ekleme Modal */}
          <Modal isOpen={addModal} toggle={() => setAddModal(false)}>
            <ModalHeader toggle={() => setAddModal(false)}>
              Yeni İlçe Ekle
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <ModalBody>
                <FormGroup>
                  <Label for="name">İlçe Adı</Label>
                  <Input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="image">İlçe Resmi</Label>
                  <Input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  onClick={() => setAddModal(false)}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Ekleniyor...' : 'Ekle'}
                </Button>
              </ModalFooter>
            </Form>
          </Modal>

          {/* Düzenleme Modal */}
          <Modal isOpen={editModal} toggle={() => setEditModal(false)}>
            <ModalHeader toggle={() => setEditModal(false)}>
              İlçe Düzenle
            </ModalHeader>
            <Form onSubmit={handleSubmit}>
              <ModalBody>
                <FormGroup>
                  <Label for="edit-name">İlçe Adı</Label>
                  <Input
                    type="text"
                    id="edit-name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </FormGroup>
                <FormGroup>
                  <Label for="edit-image">İlçe Resmi</Label>
                  <Input
                    type="file"
                    id="edit-image"
                    name="image"
                    accept="image/*"
                    onChange={handleInputChange}
                  />
                  {selectedDistrict?.image && (
                    <div className="mt-2">
                      <small className="text-muted">Mevcut resim:</small>
                      <img
                        src={getImageUrl(selectedDistrict.image)}
                        alt={selectedDistrict.name}
                        className="rounded ms-2"
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </FormGroup>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="secondary"
                  onClick={() => setEditModal(false)}
                  disabled={loading}
                >
                  İptal
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  disabled={loading}
                >
                  {loading ? 'Güncelleniyor...' : 'Güncelle'}
                </Button>
              </ModalFooter>
            </Form>
          </Modal>

          {/* Silme Modal */}
          <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
            <ModalHeader toggle={() => setDeleteModal(false)}>
              İlçeyi Sil
            </ModalHeader>
            <ModalBody>
              <p>Bu ilçeyi silmek istediğinizden emin misiniz?</p>
              {selectedDistrict && (
                <div className="alert alert-info">
                  <strong>{selectedDistrict.name}</strong>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="secondary"
                onClick={() => setDeleteModal(false)}
                disabled={loading}
              >
                İptal
              </Button>
              <Button
                color="danger"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? 'Siliniyor...' : 'Sil'}
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </React.Fragment>
  );
};

export default DistrictList;