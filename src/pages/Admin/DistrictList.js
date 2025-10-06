import React, { useState, useEffect } from 'react';
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
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePath}`;
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
                      <Table className="table table-centered table-nowrap mb-0">
                        <thead>
                          <tr>
                            <th>ID</th>
                            <th>Resim</th>
                            <th>İlçe Adı</th>
                            <th>Oluşturulma Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {districts.length > 0 ? (
                            districts.map((district) => (
                              <tr key={district.id}>
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
                            ))
                          ) : (
                            <tr>
                              <td colSpan="5" className="text-center">
                                Henüz ilçe bulunmuyor
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </Table>
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