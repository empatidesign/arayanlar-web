import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert } from "reactstrap";
import { useParams, useNavigate } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put } from "../../helpers/backend_helper";

const CategoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: null
  });
  const [currentImage, setCurrentImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Breadcrumb
  document.title = `${isEdit ? 'Kategori Düzenle' : 'Kategori Ekle'} | Arayanvar Admin`;

  useEffect(() => {
    if (isEdit) {
      fetchCategory();
    }
  }, [id, isEdit]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const data = await get(`/api/sections/${id}`);
      
      if (data) {
        setFormData({
          name: data.name || '',
          description: data.description || '',
          image: null
        });
        
        if (data.image) {
          setCurrentImage(data.image);
        }
      }
    } catch (error) {
      setError('Kategori bilgileri yüklenirken hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata mesajını temizle
    if (error) setError('');
  };

  const handleImageChange = (e) => {
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

      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Önizleme için URL oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      
      setError('');
    }
  };

  const removeImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setImagePreview(null);
    
    // File input'u temizle
    const fileInput = document.getElementById('image');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const removeCurrentImage = () => {
    setCurrentImage(null);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Lütfen kategori adını girin.');
      return false;
    }

    if (formData.name.trim().length < 2) {
      setError('Kategori adı en az 2 karakter olmalıdır.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    setError('');
    setSuccess('');

    try {
      const submitFormData = new FormData();
      submitFormData.append('name', formData.name.trim());
      submitFormData.append('description', formData.description.trim());
      
      if (formData.image) {
        submitFormData.append('image', formData.image);
      }

      // Mevcut resmi kaldırma durumu
      if (isEdit && currentImage === null) {
        submitFormData.append('removeImage', 'true');
      }

      let result;
      if (isEdit) {
        result = await put(`/api/admin/sections/${id}`, submitFormData);
      } else {
        result = await post('/api/admin/sections', submitFormData);
      }

      if (result.success) {
        setSuccess(`Kategori başarıyla ${isEdit ? 'güncellendi' : 'eklendi'}.`);
        
        // 2 saniye sonra listeye yönlendir
        setTimeout(() => {
          navigate('/admin/categories');
        }, 2000);
      } else {
        setError(result.message || 'İşlem sırasında hata oluştu.');
      }
    } catch (error) {
      setError('İşlem sırasında hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${process.env.REACT_APP_API_URL}${imagePath}`;
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
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs 
            title="Admin" 
            breadcrumbItem={isEdit ? 'Kategori Düzenle' : 'Kategori Ekle'} 
          />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title">
                      {isEdit ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
                    </h4>
                    <Button 
                      color="secondary" 
                      onClick={() => navigate('/admin/categories')}
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
                          <Label for="name">Kategori Adı *</Label>
                          <Input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Kategori adını girin"
                            required
                          />
                        </FormGroup>
                      </Col>
                      <Col md="6">
                        <FormGroup>
                          <Label for="description">Açıklama</Label>
                          <Input
                            type="text"
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Kategori açıklaması (opsiyonel)"
                          />
                        </FormGroup>
                      </Col>
                    </Row>

                    <Row>
                      <Col md="12">
                        <FormGroup>
                          <Label for="image">Kategori Resmi</Label>
                          <Input
                            type="file"
                            id="image"
                            name="image"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                          <small className="form-text text-muted">
                            Desteklenen formatlar: JPG, PNG, GIF
                          </small>
                        </FormGroup>

                        {/* Mevcut resim (düzenleme modunda) */}
                        {isEdit && currentImage && (
                          <div className="mb-3">
                            <Label>Mevcut Resim:</Label>
                            <div className="d-flex align-items-center">
                              <img
                                src={getImageUrl(currentImage)}
                                alt="Mevcut kategori resmi"
                                style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }}
                                className="img-thumbnail me-3"
                              />
                              <Button
                                color="outline-danger"
                                size="sm"
                                onClick={removeCurrentImage}
                              >
                                <i className="mdi mdi-delete me-1"></i>
                                Kaldır
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Yeni resim önizlemesi */}
                        {imagePreview && (
                          <div className="mb-3">
                            <Label>Yeni Resim Önizlemesi:</Label>
                            <div className="d-flex align-items-center">
                              <img
                                src={imagePreview}
                                alt="Yeni resim önizlemesi"
                                style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }}
                                className="img-thumbnail me-3"
                              />
                              <Button
                                color="outline-danger"
                                size="sm"
                                onClick={removeImage}
                              >
                                <i className="mdi mdi-delete me-1"></i>
                                Kaldır
                              </Button>
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                      <Button 
                        type="button" 
                        color="secondary" 
                        onClick={() => navigate('/admin/categories')}
                      >
                        İptal
                      </Button>
                      <Button 
                        type="submit" 
                        color="primary"
                        disabled={submitLoading}
                      >
                        {submitLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {isEdit ? 'Güncelleniyor...' : 'Ekleniyor...'}
                          </>
                        ) : (
                          <>
                            <i className="mdi mdi-check me-1"></i>
                            {isEdit ? 'Güncelle' : 'Ekle'}
                          </>
                        )}
                      </Button>
                    </div>
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

export default CategoryForm;