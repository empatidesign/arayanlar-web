import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put, del } from "../../helpers/backend_helper";

const SliderList = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  
  // Yeni slider ekleme modal state'leri
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newSlider, setNewSlider] = useState({
    title: '',
    category: '',
    order_index: 1,
    is_active: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Breadcrumb
  document.title = "Slider Yönetimi | Arayanvar Admin";

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const data = await get('/api/sliders');
      console.log('API Response:', data);
      setSliders(data.data || []);
    } catch (error) {
      console.error('Slider listesi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };



  const handleDelete = async () => {
    if (!selectedSlider) return;

    try {
      await del(`/api/sliders/${selectedSlider.id}`);
      setSliders(sliders.filter(slider => slider.id !== selectedSlider.id));
      setDeleteModal(false);
      setSelectedSlider(null);
    } catch (error) {
      console.error('Slider silinirken hata:', error);
    }
  };

  const toggleStatus = async (slider) => {
    try {
      await put(`/api/sliders/${slider.id}`, {
        title: slider.title,
        category: slider.category,
        order_index: slider.order_index,
        is_active: !slider.is_active
      });

      setSliders(sliders.map(s => 
        s.id === slider.id ? { ...s, is_active: !s.is_active } : s
      ));
    } catch (error) {
      console.error('Slider durumu güncellenirken hata:', error);
    }
  };

  const updateOrder = async (sliderId, newOrder) => {
    try {
      await put('/api/sliders/order', {
        orders: [{ id: sliderId, order_index: newOrder }]
      });

      fetchSliders(); // Listeyi yenile
    } catch (error) {
      console.error('Slider sırası güncellenirken hata:', error);
    }
  };

  // Yeni slider ekleme fonksiyonları
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSlider(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSlider(prev => ({ ...prev, image: file }));
      
      // Resim önizlemesi oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAddModal = () => {
    setNewSlider({
      title: '',
      category: '',
      order_index: 1,
      is_active: true,
      image: null
    });
    setImagePreview(null);
    setAddModal(false);
  };

  const handleAddSlider = async () => {
    if (!newSlider.title || !newSlider.category || !newSlider.image) {
      alert('Lütfen tüm alanları doldurun ve bir resim seçin.');
      return;
    }

    setAddLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', newSlider.title);
      formData.append('category', newSlider.category);
      formData.append('order_index', newSlider.order_index);
      formData.append('is_active', newSlider.is_active);
      formData.append('image', newSlider.image);

      const result = await post('/api/sliders', formData);
      setSliders(prev => [...prev, result.data]);
      resetAddModal();
      fetchSliders(); // Listeyi yenile
    } catch (error) {
      console.error('Slider eklenirken hata:', error);
      alert('Slider eklenirken hata oluştu.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Admin" breadcrumbItem="Slider Yönetimi" />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title">Slider Listesi</h4>
                    <div className="d-flex gap-2">
                      <Button 
                        color="primary" 
                        onClick={() => setAddModal(true)}
                      >
                        <i className="mdi mdi-plus me-1"></i>
                        Yeni Slider Ekle
                      </Button>
                      <Link to="/admin/slider/add" className="btn btn-outline-primary">
                        <i className="mdi mdi-form-select me-1"></i>
                        Form Sayfası
                      </Link>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Yükleniyor...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table className="table table-centered table-nowrap mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Resim</th>
                            <th>Başlık</th>
                            <th>Kategori</th>
                            <th>Sıra</th>
                            <th>Durum</th>
                            <th>Oluşturma Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sliders.length > 0 ? (
                            sliders.map((slider) => (
                              <tr key={slider.id}>
                                <td>
                                  {slider.image_url ? (
                                    <img
                                      src={`${process.env.REACT_APP_API_URL}${slider.image_url}`}
                                      alt={slider.title}
                                      className="img-thumbnail"
                                      style={{ width: '80px', height: '50px', objectFit: 'cover' }}
                                      onError={(e) => {
                                        console.log('Resim yüklenemedi:', slider.image_url);
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA4MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyMEwzNSAzMEw0NSAyMEw1NSAzMEgyNVYyMFoiIGZpbGw9IiNEREREREQiLz4KPHN2Zz4K';
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="img-thumbnail d-flex align-items-center justify-content-center"
                                      style={{ width: '80px', height: '50px', backgroundColor: '#f5f5f5' }}
                                    >
                                      <i className="mdi mdi-image text-muted"></i>
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <h5 className="font-size-14 mb-1">
                                    {slider.title}
                                  </h5>
                                  <p className="text-muted mb-0">{slider.category}</p>
                                </td>
                                <td>{slider.category}</td>
                                <td>
                                  <Input
                                    type="number"
                                    value={slider.order_index}
                                    onChange={(e) => updateOrder(slider.id, parseInt(e.target.value))}
                                    style={{ width: '70px' }}
                                    min="1"
                                  />
                                </td>
                                <td>
                                  <Badge
                                    color={slider.is_active ? "success" : "danger"}
                                    className="cursor-pointer"
                                    onClick={() => toggleStatus(slider)}
                                  >
                                    {slider.is_active ? "Aktif" : "Pasif"}
                                  </Badge>
                                </td>
                                <td>
                                  {new Date(slider.created_at).toLocaleDateString('tr-TR')}
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Link
                                      to={`/admin/slider/edit/${slider.id}`}
                                      className="btn btn-outline-secondary btn-sm"
                                    >
                                      <i className="mdi mdi-pencil"></i>
                                    </Link>
                                    <Button
                                      color="outline-danger"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedSlider(slider);
                                        setDeleteModal(true);
                                      }}
                                    >
                                      <i className="mdi mdi-delete"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="7" className="text-center">
                                Henüz slider bulunmuyor.
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

          {/* Silme Modal */}
          <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
            <ModalHeader toggle={() => setDeleteModal(false)}>
              Slider Sil
            </ModalHeader>
            <ModalBody>
              <p>Bu slider'ı silmek istediğinizden emin misiniz?</p>
              {selectedSlider && (
                <div className="alert alert-warning">
                  <strong>{selectedSlider.title}</strong> slider'ı kalıcı olarak silinecektir.
                </div>
              )}
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

          {/* Yeni Slider Ekleme Modal */}
          <Modal isOpen={addModal} toggle={resetAddModal} size="lg">
            <ModalHeader toggle={resetAddModal}>
              Yeni Slider Ekle
            </ModalHeader>
            <ModalBody>
              <Form>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="title">Başlık *</Label>
                      <Input
                        type="text"
                        id="title"
                        name="title"
                        value={newSlider.title}
                        onChange={handleInputChange}
                        placeholder="Slider başlığını girin"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup>
                      <Label for="category">Kategori *</Label>
                      <Input
                        type="select"
                        id="category"
                        name="category"
                        value={newSlider.category}
                        onChange={handleInputChange}
                      >
                        <option value="">Kategori seçin</option>
                        <option value="VASİTA">VASİTA</option>
                        <option value="EMLAK">EMLAK</option>
                        <option value="İKİNCİ EL">İKİNCİ EL</option>
                        <option value="İŞ İLANLARI">İŞ İLANLARI</option>
                        <option value="HİZMETLER">HİZMETLER</option>
                        <option value="GENEL">GENEL</option>
                      </Input>
                    </FormGroup>
                  </Col>
                </Row>
                
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="order_index">Sıra</Label>
                      <Input
                        type="number"
                        id="order_index"
                        name="order_index"
                        value={newSlider.order_index}
                        onChange={handleInputChange}
                        min="1"
                      />
                    </FormGroup>
                  </Col>
                  <Col md="6">
                    <FormGroup check className="mt-4">
                      <Input
                        type="checkbox"
                        id="is_active"
                        name="is_active"
                        checked={newSlider.is_active}
                        onChange={handleInputChange}
                      />
                      <Label check for="is_active">
                        Aktif
                      </Label>
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="image">Resim *</Label>
                  <Input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  {imagePreview && (
                    <div className="mt-3">
                      <img
                        src={imagePreview}
                        alt="Önizleme"
                        style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }}
                        className="img-thumbnail"
                      />
                    </div>
                  )}
                </FormGroup>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={resetAddModal}>
                İptal
              </Button>
              <Button 
                color="primary" 
                onClick={handleAddSlider}
                disabled={addLoading}
              >
                {addLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Ekleniyor...
                  </>
                ) : (
                  'Ekle'
                )}
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </React.Fragment>
  );
};

export default SliderList;