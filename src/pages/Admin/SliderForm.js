import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put } from "../../helpers/backend_helper";

const SliderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    category: 'VASİTA',
    order_index: 1,
    is_active: true
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Breadcrumb
  document.title = `${isEdit ? 'Slider Düzenle' : 'Slider Ekle'} | Arayanvar Admin`;

  const categories = [
    'VASİTA',
    'EMLAK',
    'İKİNCİ EL',
    'İŞ İLANLARI',
    'HİZMETLER',
    'GENEL'
  ];

  useEffect(() => {
    if (isEdit) {
      fetchSlider();
    }
  }, [id, isEdit]);

  const getAuthToken = () => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const user = JSON.parse(authUser);
      return user.token || user.accessToken;
    }
    return null;
  };

  const fetchSlider = async () => {
    try {
      const data = await get(`/api/sliders/${id}`);
      setFormData({
        title: data.data.title,
        category: data.data.category,
        order_index: data.data.order_index,
        is_active: data.data.is_active
      });
      setCurrentImage(data.data.image_url);
    } catch (error) {
      console.error('Slider yüklenirken hata:', error);
      setError('Slider bilgileri yüklenirken hata oluştu.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setError('Sadece resim dosyaları yüklenebilir.');
        return;
      }

      setSelectedFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('order_index', formData.order_index);
      formDataToSend.append('is_active', formData.is_active);

      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      let data;
      if (isEdit) {
        data = await put(`/api/sliders/${id}`, formDataToSend);
      } else {
        data = await post('/api/sliders', formDataToSend);
      }

      setSuccess(isEdit ? 'Slider başarıyla güncellendi!' : 'Slider başarıyla eklendi!');
      setTimeout(() => {
        navigate('/admin/sliders');
      }, 2000);
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      setError('İşlem sırasında hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs 
            title="Admin" 
            breadcrumbItem={isEdit ? "Slider Düzenle" : "Slider Ekle"} 
          />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">
                    {isEdit ? 'Slider Düzenle' : 'Yeni Slider Ekle'}
                  </h4>

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
                          <Label for="title">Başlık *</Label>
                          <Input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            placeholder="Slider başlığını girin"
                            required
                          />
                        </FormGroup>
                      </Col>

                      <Col md="3">
                        <FormGroup>
                          <Label for="category">Kategori *</Label>
                          <Input
                            type="select"
                            id="category"
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            required
                          >
                            {categories.map(category => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </Input>
                        </FormGroup>
                      </Col>

                      <Col md="3">
                        <FormGroup>
                          <Label for="order_index">Sıra *</Label>
                          <Input
                            type="number"
                            id="order_index"
                            name="order_index"
                            value={formData.order_index}
                            onChange={handleInputChange}
                            min="1"
                            required
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="6">
                        <FormGroup>
                          <Label for="image">Resim {!isEdit && '*'}</Label>
                          <Input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleFileChange}
                            required={!isEdit}
                          />
                          <small className="text-muted">
                            Maksimum dosya boyutu: 5MB. Desteklenen formatlar: JPG, PNG, GIF
                          </small>
                        </FormGroup>

                        {currentImage && (
                          <div className="mt-3">
                            <Label>Mevcut Resim:</Label>
                            <div>
                              <img
                                src={`${process.env.REACT_APP_API_URL}${currentImage}`}
                                alt="Mevcut slider"
                                className="img-thumbnail"
                                style={{ maxWidth: '300px', maxHeight: '200px' }}
                                onError={(e) => {
                                  console.log('Mevcut resim yüklenemedi:', currentImage);
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'block';
                                }}
                              />
                              <div 
                                className="img-thumbnail d-flex align-items-center justify-content-center"
                                style={{ 
                                  maxWidth: '300px', 
                                  maxHeight: '200px', 
                                  backgroundColor: '#f5f5f5',
                                  display: 'none'
                                }}
                              >
                                <div className="text-center">
                                  <i className="mdi mdi-image text-muted" style={{ fontSize: '2rem' }}></i>
                                  <p className="text-muted mt-2">Resim yüklenemedi</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {selectedFile && (
                          <div className="mt-3">
                            <Label>Yeni Resim Önizleme:</Label>
                            <div>
                              <img
                                src={URL.createObjectURL(selectedFile)}
                                alt="Yeni slider"
                                className="img-thumbnail"
                                style={{ maxWidth: '300px', maxHeight: '200px' }}
                              />
                            </div>
                          </div>
                        )}
                      </Col>

                      <Col md="6">
                        <FormGroup check className="mb-3">
                          <Input
                            type="checkbox"
                            id="is_active"
                            name="is_active"
                            checked={formData.is_active}
                            onChange={handleInputChange}
                          />
                          <Label check for="is_active">
                            Aktif
                          </Label>
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col xs="12">
                        <div className="d-flex justify-content-end gap-2">
                          <Button
                            type="button"
                            color="secondary"
                            onClick={() => navigate('/admin/sliders')}
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
                              isEdit ? 'Güncelle' : 'Ekle'
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
        </div>
      </div>
    </React.Fragment>
  );
};

export default SliderForm;
