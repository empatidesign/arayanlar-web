import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Badge,
  UncontrolledTooltip
} from 'reactstrap';
import toastr from "toastr";
import "toastr/build/toastr.min.css";
import { get, post, put, del } from '../../helpers/backend_helper';

const VersionManagement = () => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editingVersion, setEditingVersion] = useState(null);
  const [formData, setFormData] = useState({
    current_version_ios: '',
    minimum_version_ios: '',
    current_version_android: '',
    minimum_version_android: '',
    force_update: true,
    update_message: '',
    download_url_android: 'https://play.google.com/store/apps/details?id=com.arayanvar.app',
    download_url_ios: 'https://apps.apple.com/tr/app/arayanvar/id6736842069',
    is_active: true
  });

  useEffect(() => {
    fetchVersions();
  }, []);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const data = await get('/api/admin/versions');
      
      if (data.success) {
        setVersions(data.data);
      } else {
        toastr.error('Versiyonlar yüklenirken hata oluştu');
      }
    } catch (error) {
      toastr.error('Sunucu hatası');
    } finally {
      setLoading(false);
    }
  };

  const toggleModal = () => {
    setModal(!modal);
    if (!modal) {
      setEditingVersion(null);
      setFormData({
        current_version_ios: '',
        minimum_version_ios: '',
        current_version_android: '',
        minimum_version_android: '',
        force_update: true,
        update_message: '',
        download_url_android: 'https://play.google.com/store/apps/details?id=com.arayanvar.app',
        download_url_ios: 'https://apps.apple.com/tr/app/arayanvar/id6736842069',
        is_active: true
      });
    }
  };

  const handleEdit = (version) => {
    setEditingVersion(version);
    setFormData({
      current_version_ios: version.current_version_ios || '',
      minimum_version_ios: version.minimum_version_ios || '',
      current_version_android: version.current_version_android || '',
      minimum_version_android: version.minimum_version_android || '',
      force_update: version.force_update,
      update_message: version.update_message || '',
      download_url_android: version.download_url_android || '',
      download_url_ios: version.download_url_ios || '',
      is_active: version.is_active
    });
    setModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.current_version_ios || !formData.minimum_version_ios || 
        !formData.current_version_android || !formData.minimum_version_android) {
      toastr.error('iOS ve Android için geçerli versiyon ve minimum versiyon gerekli');
      return;
    }

    try {
      let data;
      
      if (editingVersion) {
        data = await put(`/api/admin/versions/${editingVersion.id}`, formData);
      } else {
        data = await post('/api/admin/versions', formData);
      }
      
      if (data.success) {
        toastr.success(data.message);
        toggleModal();
        fetchVersions();
      } else {
        toastr.error(data.message);
      }
    } catch (error) {
      toastr.error('Sunucu hatası');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bu versiyonu silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const data = await del(`/api/admin/versions/${id}`);
      
      if (data.success) {
        toastr.success(data.message);
        fetchVersions();
      } else {
        toastr.error(data.message);
      }
    } catch (error) {
      toastr.error('Sunucu hatası');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col lg={12}>
            <Card>
              <CardBody>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <CardTitle className="h4">Versiyon Yönetimi</CardTitle>
                  <Button color="primary" onClick={toggleModal}>
                    <i className="mdi mdi-plus me-1"></i>
                    Yeni Versiyon Ekle
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
                          <th>ID</th>
                          <th>iOS Versiyon</th>
                          <th>Android Versiyon</th>
                          <th>Zorunlu Güncelleme</th>
                          <th>Durum</th>
                          <th>Oluşturma Tarihi</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {versions.map((version) => (
                          <tr key={version.id}>
                            <td>{version.id}</td>
                            <td>
                              <div>
                                <strong>Güncel:</strong> {version.current_version_ios}<br/>
                                <small className="text-muted">Min: {version.minimum_version_ios}</small>
                              </div>
                            </td>
                            <td>
                              <div>
                                <strong>Güncel:</strong> {version.current_version_android}<br/>
                                <small className="text-muted">Min: {version.minimum_version_android}</small>
                              </div>
                            </td>
                            <td>
                              <Badge 
                                color={version.force_update ? 'danger' : 'success'}
                                className="font-size-12"
                              >
                                {version.force_update ? 'Zorunlu' : 'İsteğe Bağlı'}
                              </Badge>
                            </td>
                            <td>
                              <Badge 
                                color={version.is_active ? 'success' : 'secondary'}
                                className="font-size-12"
                              >
                                {version.is_active ? 'Aktif' : 'Pasif'}
                              </Badge>
                            </td>
                            <td>{formatDate(version.created_at)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  color="info"
                                  size="sm"
                                  onClick={() => handleEdit(version)}
                                  id={`edit-${version.id}`}
                                >
                                  <i className="mdi mdi-pencil"></i>
                                </Button>
                                <UncontrolledTooltip 
                                  placement="top" 
                                  target={`edit-${version.id}`}
                                >
                                  Düzenle
                                </UncontrolledTooltip>

                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => handleDelete(version.id)}
                                  id={`delete-${version.id}`}
                                >
                                  <i className="mdi mdi-delete"></i>
                                </Button>
                                <UncontrolledTooltip 
                                  placement="top" 
                                  target={`delete-${version.id}`}
                                >
                                  Sil
                                </UncontrolledTooltip>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Modal */}
        <Modal isOpen={modal} toggle={toggleModal} size="lg">
          <ModalHeader toggle={toggleModal}>
            {editingVersion ? 'Versiyon Düzenle' : 'Yeni Versiyon Ekle'}
          </ModalHeader>
          <Form onSubmit={handleSubmit}>
            <ModalBody>
              <Alert color="info" className="mb-3">
                <i className="mdi mdi-information me-2"></i>
                iOS ve Android için farklı versiyon numaraları belirleyebilirsiniz.
              </Alert>
              
              <h6 className="mb-3">iOS Versiyonları</h6>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="current_version_ios">iOS Geçerli Versiyon *</Label>
                    <Input
                      type="text"
                      name="current_version_ios"
                      id="current_version_ios"
                      placeholder="Örn: 1.0.1"
                      value={formData.current_version_ios}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="minimum_version_ios">iOS Minimum Versiyon *</Label>
                    <Input
                      type="text"
                      name="minimum_version_ios"
                      id="minimum_version_ios"
                      placeholder="Örn: 1.0.0"
                      value={formData.minimum_version_ios}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <hr className="my-3" />

              <h6 className="mb-3">Android Versiyonları</h6>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="current_version_android">Android Geçerli Versiyon *</Label>
                    <Input
                      type="text"
                      name="current_version_android"
                      id="current_version_android"
                      placeholder="Örn: 1.0.1"
                      value={formData.current_version_android}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="minimum_version_android">Android Minimum Versiyon *</Label>
                    <Input
                      type="text"
                      name="minimum_version_android"
                      id="minimum_version_android"
                      placeholder="Örn: 1.0.0"
                      value={formData.minimum_version_android}
                      onChange={handleInputChange}
                      required
                    />
                  </FormGroup>
                </Col>
              </Row>

              <hr className="my-3" />

              <h6 className="mb-3">İndirme Linkleri</h6>
              <Row>
                <Col md={6}>
                  <FormGroup>
                    <Label for="download_url_android">Android İndirme URL'si</Label>
                    <Input
                      type="url"
                      name="download_url_android"
                      id="download_url_android"
                      placeholder="https://play.google.com/store/apps/..."
                      value={formData.download_url_android}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup>
                    <Label for="download_url_ios">iOS İndirme URL'si</Label>
                    <Input
                      type="url"
                      name="download_url_ios"
                      id="download_url_ios"
                      placeholder="https://apps.apple.com/app/..."
                      value={formData.download_url_ios}
                      onChange={handleInputChange}
                    />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label for="update_message">Güncelleme Mesajı</Label>
                <Input
                  type="textarea"
                  name="update_message"
                  id="update_message"
                  placeholder="Kullanıcılara gösterilecek güncelleme mesajı..."
                  value={formData.update_message}
                  onChange={handleInputChange}
                  rows="3"
                />
              </FormGroup>

              <hr className="my-3" />

              <Row>
                <Col md={6}>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="force_update"
                        checked={formData.force_update}
                        onChange={handleInputChange}
                      />
                      Zorunlu Güncelleme
                    </Label>
                  </FormGroup>
                </Col>
                <Col md={6}>
                  <FormGroup check>
                    <Label check>
                      <Input
                        type="checkbox"
                        name="is_active"
                        checked={formData.is_active}
                        onChange={handleInputChange}
                      />
                      Aktif Versiyon
                    </Label>
                  </FormGroup>
                </Col>
              </Row>

              {formData.is_active && (
                <Alert color="warning" className="mt-3">
                  <i className="mdi mdi-alert-circle-outline me-2"></i>
                  Bu versiyonu aktif yaparsanız, diğer tüm versiyonlar otomatik olarak pasif hale gelecektir.
                </Alert>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={toggleModal}>
                İptal
              </Button>
              <Button color="primary" type="submit">
                {editingVersion ? 'Güncelle' : 'Oluştur'}
              </Button>
            </ModalFooter>
          </Form>
        </Modal>
      </Container>
    </div>
  );
};

export default VersionManagement;