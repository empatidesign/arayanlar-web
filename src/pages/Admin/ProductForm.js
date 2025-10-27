import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { get, post, put } from '../../helpers/api_helper';
import { useNavigate, useParams } from 'react-router-dom';

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    brand_id: '',
    category_id: '',
    model: '',
    description: '',
    colors: []
  });

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [currentImage, setCurrentImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Marka ekleme modalı için state'ler
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandImage, setNewBrandImage] = useState(null);

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchProduct();
    }
  }, [id, isEdit]);

  const fetchBrands = async (categoryId) => {
    try {
      if (!categoryId) {
        setBrands([]);
        return;
      }
      const response = await get(`/api/brands?category_id=${categoryId}`);
      if (response.success) {
        setBrands(response.data || []);
      }
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error);
      setBrands([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await get('/api/categories');
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await get(`/api/products/${id}`);
      
      if (response.success) {
        const product = response.product;
        let parsedColors = [];
        
        // Renk verilerini parse et
        if (product.colors && product.colors !== 'null' && product.colors !== '') {
          try {
            parsedColors = typeof product.colors === 'string' ? JSON.parse(product.colors) : product.colors;
            // Her renk için images array'ini kontrol et ve düzelt
            parsedColors = parsedColors.map(color => ({
              ...color,
              images: Array.isArray(color.images) ? color.images : []
            }));
          } catch (error) {
            console.error('Renk verileri parse edilirken hata:', error);
            parsedColors = [];
          }
        }
        
        setFormData({
          name: product.name || '',
          brand_id: product.brand_id || '',
          category_id: product.category_id || '',
          model: product.model || '',
          description: product.description || '',
          colors: parsedColors
        });
        
        // Edit modunda kategori varsa markaları getir
        if (product.category_id) {
          fetchBrands(product.category_id);
        }
        
        if (product.image) {
          setCurrentImage(`${process.env.REACT_APP_API_URL}${product.image}`);
        }
      } else {
        setError(response.message || 'Ürün yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürün yüklenirken hata:', error);
      setError('Ürün yüklenirken hata oluştu');
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

    // Kategori değiştiğinde markaları getir ve marka seçimini sıfırla
    if (name === 'category_id') {
      setFormData(prev => ({
        ...prev,
        brand_id: ''
      }));
      fetchBrands(value);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log('🖼️ Resim seçildi:', file);
    
    if (file) {
      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setError('Sadece resim dosyaları yüklenebilir.');
        return;
      }

      setSelectedFile(file);
      setError('');
      console.log('✅ Resim selectedFile state\'ine kaydedildi:', file.name);

      // Önizleme için URL oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
        console.log('🔍 Resim önizlemesi oluşturuldu');
      };
      reader.readAsDataURL(file);
    }
  };

  const addColor = () => {
    setFormData(prev => ({
      ...prev,
      colors: [...prev.colors, { name: '', hex: '#000000', images: [], imageFiles: [] }]
    }));
  };

  const removeColor = (index) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  const updateColor = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === index ? { ...color, [field]: value } : color
      )
    }));
  };

  const handleColorImagesChange = (colorIndex, files) => {
    const fileArray = Array.from(files);
    
    // Dosya boyutu ve tipi kontrolü
    for (let file of fileArray) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Sadece resim dosyaları yüklenebilir.');
        return;
      }
    }

    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => 
        i === colorIndex ? { 
          ...color, 
          imageFiles: [...(color.imageFiles || []), ...fileArray]
        } : color
      )
    }));
    setError('');
  };

  const removeColorImage = (colorIndex, imageIndex) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.map((color, i) => {
        if (i === colorIndex) {
          // Toplam resim sayısını hesapla
          const existingImagesCount = color.images ? color.images.length : 0;
          
          if (imageIndex < existingImagesCount) {
            // Mevcut resimlerden silme
            return {
              ...color,
              images: color.images.filter((_, imgI) => imgI !== imageIndex)
            };
          } else {
            // Yeni yüklenen resimlerden silme
            const newImageIndex = imageIndex - existingImagesCount;
            return {
              ...color,
              imageFiles: color.imageFiles ? color.imageFiles.filter((_, imgI) => imgI !== newImageIndex) : []
            };
          }
        }
        return color;
      })
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.model.trim()) {
      setError('Model gereklidir.');
      return;
    }

    if (!formData.brand_id) {
      setError('Marka seçimi gereklidir.');
      return;
    }

    if (!formData.category_id) {
      setError('Kategori seçimi gereklidir.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const formDataToSend = new FormData();
      // Marka ve model bilgisinden otomatik name oluştur
      const selectedBrand = brands.find(b => b.id == formData.brand_id);
      const productName = selectedBrand ? `${selectedBrand.name} ${formData.model}` : formData.model;
      
      formDataToSend.append('name', productName);
      formDataToSend.append('brand_id', formData.brand_id);
      formDataToSend.append('category_id', formData.category_id);
      formDataToSend.append('model', formData.model);
      formDataToSend.append('description', formData.description);
      
      // Renk bilgilerini hazırla (resim dosyaları hariç)
      const colorsData = formData.colors.map(color => ({
        name: color.name || '',
        hex: color.hex || '#000000',
        images: color.images ? color.images.filter(img => typeof img === 'string') : []
      }));
      
      if (colorsData.length > 0) {
        formDataToSend.append('colors', JSON.stringify(colorsData));
      }

      // Ana ürün resmi
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
        console.log('📤 Ana ürün resmi FormData\'ya eklendi:', selectedFile.name);
      } else {
        console.log('⚠️ selectedFile boş, ana ürün resmi eklenmedi');
      }

      // Renk resimlerini ekle
      formData.colors.forEach((color, colorIndex) => {
        if (color.imageFiles && color.imageFiles.length > 0) {
          color.imageFiles.forEach((file, fileIndex) => {
            formDataToSend.append(`colorImages_${colorIndex}_${fileIndex}`, file);
          });
          formDataToSend.append(`colorImageCount_${colorIndex}`, color.imageFiles.length);
          formDataToSend.append(`colorName_${colorIndex}`, color.name);
        }
      });

      let response;
      console.log('🚀 Form gönderiliyor...');
      console.log('📋 FormData içeriği:');
      for (let [key, value] of formDataToSend.entries()) {
        if (value instanceof File) {
          console.log(`  ${key}: ${value.name} (${value.size} bytes)`);
        } else {
          console.log(`  ${key}: ${value}`);
        }
      }
      
      if (isEdit) {
        response = await put(`/api/products/${id}`, formDataToSend);
      } else {
        response = await post('/api/products', formDataToSend);
      }

      console.log('📥 Server yanıtı:', response);

      if (response.success) {
        setSuccess(isEdit ? 'Ürün başarıyla güncellendi!' : 'Ürün başarıyla eklendi!');
        setTimeout(() => {
          navigate('/admin/products');
        }, 2000);
      } else {
        setError(response.message || 'İşlem sırasında hata oluştu');
      }
    } catch (error) {
      console.error('Form gönderilirken hata:', error);
      setError('İşlem sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Yeni marka ekleme fonksiyonu
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      setError('Marka adı gereklidir.');
      return;
    }

    if (!formData.category_id) {
      setError('Önce kategori seçmelisiniz.');
      return;
    }

    try {
      setLoading(true);
      
      const formDataToSend = new FormData();
      formDataToSend.append('name', newBrandName.trim());
      formDataToSend.append('category_id', formData.category_id);
      
      if (newBrandImage) {
        formDataToSend.append('image', newBrandImage);
      }

      const response = await post('/api/brands', formDataToSend);

      if (response.success) {
        setSuccess('Marka başarıyla eklendi!');
        setNewBrandName('');
        setNewBrandImage(null);
        setShowBrandModal(false);
        // Markaları yeniden getir
        fetchBrands(formData.category_id);
        // Yeni eklenen markayı seç
        setFormData(prev => ({
          ...prev,
          brand_id: response.data.id
        }));
      } else {
        setError(response.message || 'Marka eklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Marka eklenirken hata:', error);
      setError('Marka eklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (isEdit && loading) {
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
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs="12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 font-size-18">
                {isEdit ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
              </h4>
              <div className="page-title-right">
                <Button color="secondary" onClick={() => navigate('/admin/products')}>
                  <i className="mdi mdi-arrow-left me-1"></i>
                  Geri Dön
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {error && (
          <Row>
            <Col xs="12">
              <Alert color="danger" fade={false}>{error}</Alert>
            </Col>
          </Row>
        )}

        {success && (
          <Row>
            <Col xs="12">
              <Alert color="success" fade={false}>{success}</Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col xs="12">
            <Card>
              <CardBody>
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="8">
                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label for="category_id">Kategori *</Label>
                            <Input
                              type="select"
                              id="category_id"
                              name="category_id"
                              value={formData.category_id}
                              onChange={handleInputChange}
                              required
                            >
                              <option value="">Kategori Seçin</option>
                              {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                  {category.name}
                                </option>
                              ))}
                            </Input>
                          </FormGroup>
                        </Col>
                        <Col md="6">
                          <FormGroup>
                            <Label for="brand_id">Marka *</Label>
                            <div className="d-flex">
                              <Input
                                type="select"
                                id="brand_id"
                                name="brand_id"
                                value={formData.brand_id}
                                onChange={handleInputChange}
                                required
                                disabled={!formData.category_id}
                                className="me-2"
                              >
                                <option value="">
                                  {formData.category_id ? 'Marka Seçin' : 'Önce Kategori Seçin'}
                                </option>
                                {brands.map(brand => (
                                  <option key={brand.id} value={brand.id}>
                                    {brand.name}
                                  </option>
                                ))}
                              </Input>
                              <Button
                                type="button"
                                color="primary"
                                size="sm"
                                disabled={!formData.category_id}
                                onClick={() => setShowBrandModal(true)}
                                title="Yeni Marka Ekle"
                              >
                                <i className="mdi mdi-plus"></i>
                              </Button>
                            </div>
                          </FormGroup>
                        </Col>
                      </Row>

                      <Row>
                        <Col md="6">
                          <FormGroup>
                            <Label for="model">Model *</Label>
                            <Input
                              type="text"
                              id="model"
                              name="model"
                              value={formData.model}
                              onChange={handleInputChange}
                              placeholder="Ürün modelini girin"
                              required
                            />
                          </FormGroup>
                        </Col>
                        <Col md="6">
                        
                        </Col>
                      </Row>

                      <FormGroup>
                        <Label for="description">Açıklama</Label>
                        <Input
                          type="textarea"
                          id="description"
                          name="description"
                          rows="4"
                          value={formData.description}
                          onChange={handleInputChange}
                          placeholder="Ürün açıklamasını girin"
                        />
                      </FormGroup>

                      {/* Renkler */}
                      <FormGroup>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Label>Renkler</Label>
                          <Button type="button" color="success" size="sm" onClick={addColor}>
                            <i className="mdi mdi-plus me-1"></i>
                            Renk Ekle
                          </Button>
                        </div>
                        {formData.colors.map((color, index) => (
                          <Card key={index} className="mb-3">
                            <CardBody>
                              <div className="d-flex justify-content-between align-items-center mb-2">
                                <h6 className="mb-0">Renk {index + 1}</h6>
                                <Button
                                  type="button"
                                  color="danger"
                                  size="sm"
                                  onClick={() => removeColor(index)}
                                >
                                  <i className="mdi mdi-delete"></i>
                                  Sil
                                </Button>
                              </div>
                              
                              <Row>
                                <Col md={6}>
                                  <FormGroup>
                                    <Label>Renk Adı</Label>
                                    <Input
                                      type="text"
                                      placeholder="Renk adı"
                                      value={color.name}
                                      onChange={(e) => updateColor(index, 'name', e.target.value)}
                                    />
                                  </FormGroup>
                                </Col>
                                <Col md={6}>
                                  <FormGroup>
                                    <Label>Renk Kodu</Label>
                                    <Input
                                      type="color"
                                      value={color.hex}
                                      onChange={(e) => updateColor(index, 'hex', e.target.value)}
                                      style={{ width: '100%', height: '38px' }}
                                    />
                                  </FormGroup>
                                </Col>
                              </Row>

                              <FormGroup>
                                <Label>Renk Resimleri</Label>
                                <Input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => handleColorImagesChange(index, e.target.files)}
                                  className="mb-2"
                                />
                                <small className="text-muted">
                                  Birden fazla resim seçebilirsiniz. Her resim maksimum 5MB olmalıdır.
                                </small>
                              </FormGroup>

                              {/* Renk resimleri */}
                              {((color.images && color.images.length > 0) || (color.imageFiles && color.imageFiles.length > 0)) && (
                                <div>
                                  <Label>Renk Resimleri:</Label>
                                  <div className="d-flex flex-wrap gap-2">
                                    {/* Mevcut resimler */}
                                    {color.images && color.images.map((image, imgIndex) => (
                                      <div key={`existing-${imgIndex}`} className="position-relative">
                                        <img
                                          src={typeof image === 'string' ? 
                                            (image.startsWith('http') ? image : `${process.env.REACT_APP_API_URL}${image}`) : 
                                            URL.createObjectURL(image)
                                          }
                                          alt={`${color.name} ${imgIndex + 1}`}
                                          style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            objectFit: 'cover',
                                            borderRadius: '4px'
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          color="danger"
                                          size="sm"
                                          className="position-absolute"
                                          style={{ 
                                            top: '-5px', 
                                            right: '-5px',
                                            width: '20px',
                                            height: '20px',
                                            padding: '0',
                                            fontSize: '12px'
                                          }}
                                          onClick={() => removeColorImage(index, imgIndex)}
                                        >
                                          ×
                                        </Button>
                                      </div>
                                    ))}
                                    
                                    {/* Yeni yüklenen resimler */}
                                    {color.imageFiles && color.imageFiles.map((file, imgIndex) => (
                                      <div key={`new-${imgIndex}`} className="position-relative">
                                        <img
                                          src={URL.createObjectURL(file)}
                                          alt={`${color.name} ${imgIndex + 1}`}
                                          style={{ 
                                            width: '80px', 
                                            height: '80px', 
                                            objectFit: 'cover',
                                            borderRadius: '4px'
                                          }}
                                        />
                                        <Button
                                          type="button"
                                          color="danger"
                                          size="sm"
                                          className="position-absolute"
                                          style={{ 
                                            top: '-5px', 
                                            right: '-5px',
                                            width: '20px',
                                            height: '20px',
                                            padding: '0',
                                            fontSize: '12px'
                                          }}
                                          onClick={() => removeColorImage(index, (color.images ? color.images.length : 0) + imgIndex)}
                                        >
                                          ×
                                        </Button>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </CardBody>
                          </Card>
                        ))}
                      </FormGroup>
                    </Col>

                    <Col md="4">
                      <FormGroup>
                        <Label>Ürün Resmi</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                        <small className="text-muted">
                          Maksimum dosya boyutu: 5MB
                        </small>
                      </FormGroup>

                      {/* Resim Önizleme */}
                      {(imagePreview || currentImage) && (
                        <div className="mt-3">
                          <Label>Önizleme</Label>
                          <div className="border rounded p-2">
                            <img
                              src={imagePreview || currentImage}
                              alt="Ürün"
                              className="img-fluid rounded"
                              style={{ maxHeight: '200px', width: '100%', objectFit: 'cover' }}
                            />
                          </div>
                        </div>
                      )}
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2 mt-4">
                    <Button
                      type="button"
                      color="secondary"
                      onClick={() => navigate('/admin/products')}
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
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {isEdit ? 'Güncelleniyor...' : 'Ekleniyor...'}
                        </>
                      ) : (
                        isEdit ? 'Güncelle' : 'Ekle'
                      )}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Marka Ekleme Modalı */}
      <Modal isOpen={showBrandModal} toggle={() => setShowBrandModal(false)}>
        <ModalHeader toggle={() => setShowBrandModal(false)}>
          Yeni Marka Ekle
        </ModalHeader>
        <ModalBody>
          <FormGroup>
            <Label for="newBrandName">Marka Adı *</Label>
            <Input
              type="text"
              id="newBrandName"
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
              placeholder="Marka adını girin"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddBrand();
                }
              }}
            />
          </FormGroup>
          <FormGroup>
            <Label for="newBrandImage">Marka Resmi</Label>
            <Input
              type="file"
              id="newBrandImage"
              accept="image/*"
              onChange={(e) => setNewBrandImage(e.target.files[0])}
            />
            {newBrandImage && (
              <div className="mt-2">
                <small className="text-muted">Seçilen dosya: {newBrandImage.name}</small>
              </div>
            )}
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button
            color="secondary"
            onClick={() => {
              setShowBrandModal(false);
              setNewBrandName('');
              setNewBrandImage(null);
            }}
          >
            İptal
          </Button>
          <Button
            color="primary"
            onClick={handleAddBrand}
            disabled={loading || !newBrandName.trim()}
          >
            {loading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Ekleniyor...
              </>
            ) : (
              'Ekle'
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
};

export default ProductForm;