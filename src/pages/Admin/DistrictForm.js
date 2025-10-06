import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Form,
  FormGroup,
  Label,
  Input,
  Button,
  Alert
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { get, post, put } from '../../helpers/api_helper';

const DistrictForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    image: null
  });
  const [currentImage, setCurrentImage] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchDistrict();
    }
  }, [id, isEdit]);

  const fetchDistrict = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await get(`/api/districts/${id}`);

      if (response.success) {
        const district = response.data;
        setFormData({
          name: district.name || '',
          image: null
        });
        setCurrentImage(district.image || '');
      } else {
        setError(response.message || 'İlçe bilgileri yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('İlçe bilgileri yüklenirken hata:', error);
      setError('İlçe bilgileri yüklenirken hata oluştu');
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
      setSuccess('');

      const submitData = new FormData();
      submitData.append('name', formData.name);
      if (formData.image) {
        submitData.append('image', formData.image);
      }

      let response;
      if (isEdit) {
        response = await put(`/api/districts/${id}`, submitData);
      } else {
        response = await post('/api/districts', submitData);
      }

      if (response.success) {
        setSuccess(isEdit ? 'İlçe başarıyla güncellendi' : 'İlçe başarıyla eklendi');
        
        // Başarılı işlem sonrası 2 saniye bekleyip liste sayfasına yönlendir
        setTimeout(() => {
          navigate('/admin/districts');
        }, 2000);
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

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}${imagePath}`;
  };

  if (loading && isEdit) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Yükleniyor...</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs 
            title="Admin" 
            breadcrumbItem={isEdit ? 'İlçe Düzenle' : 'İlçe Ekle'} 
          />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title">
                      {isEdit ? 'İlçe Düzenle' : 'Yeni İlçe Ekle'}
                    </h4>
                    <Button 
                      color="secondary" 
                      onClick={() => navigate('/admin/districts')}
                    >
                      <i className="mdi mdi-arrow-left me-1"></i>
                      Geri Dön
                    </Button>
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

                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="name">İlçe Adı *</Label>
                          <Input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="İlçe adını giriniz"
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="image">İlçe Resmi</Label>
                          <Input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleInputChange}
                          />
                          <small className="form-text text-muted">
                            JPG, PNG veya GIF formatında resim yükleyebilirsiniz.
                          </small>
                        </FormGroup>
                      </Col>
                    </Row>

                    {/* Mevcut resmi göster */}
                    {isEdit && currentImage && (
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label>Mevcut Resim</Label>
                            <div>
                              <img
                                src={getImageUrl(currentImage)}
                                alt="Mevcut ilçe resmi"
                                className="img-thumbnail"
                                style={{ maxWidth: '200px', maxHeight: '200px' }}
                              />
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>
                    )}

                    <Row>
                      <Col xs="12">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            type="button"
                            color="secondary"
                            onClick={() => navigate('/admin/districts')}
                            disabled={loading}
                          >
                            İptal
                          </Button>
                          <Button
                            type="submit"
                            color="primary"
                            disabled={loading}
                          >
                            {loading ? (
                              <>
                                <i className="mdi mdi-loading mdi-spin me-1"></i>
                                {isEdit ? 'Güncelleniyor...' : 'Ekleniyor...'}
                              </>
                            ) : (
                              <>
                                <i className={`mdi ${isEdit ? 'mdi-check' : 'mdi-plus'} me-1`}></i>
                                {isEdit ? 'Güncelle' : 'Ekle'}
                              </>
                            )}
                          </Button>
                        </div>
                      </Col>
                    </Row>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default DistrictForm;