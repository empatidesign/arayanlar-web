import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, post, put, del } from "../../helpers/backend_helper";

const CategoryList = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  
  // Yeni kategori ekleme modal state'leri
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Breadcrumb
  document.title = "Kategori Yönetimi | Arayanvar Admin";

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await get('/api/sections');
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      await del(`/api/sections/${selectedCategory.id}`);
      setCategories(prev => prev.filter(cat => cat.id !== selectedCategory.id));
      setDeleteModal(false);
      setSelectedCategory(null);
    } catch (error) {
      console.error('Kategori silinirken hata:', error);
      alert('Kategori silinirken hata oluştu. Bu kategoriye bağlı markalar veya ilanlar olabilir.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Dosya boyutu 5MB\'dan küçük olmalıdır.');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        alert('Sadece resim dosyaları yüklenebilir.');
        return;
      }

      setNewCategory(prev => ({
        ...prev,
        image: file
      }));

      // Önizleme için URL oluştur
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAddModal = () => {
    setNewCategory({
      name: '',
      description: '',
      image: null
    });
    setImagePreview(null);
    setAddModal(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      alert('Lütfen kategori adını girin.');
      return;
    }

    setAddLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('name', newCategory.name);
      formData.append('description', newCategory.description);
      if (newCategory.image) {
        formData.append('image', newCategory.image);
      }

      const result = await post('/api/sections', formData);
      if (result.success) {
        setCategories(prev => [...prev, result.section]);
        resetAddModal();
        fetchCategories(); // Listeyi yenile
      }
    } catch (error) {
      console.error('Kategori eklenirken hata:', error);
      alert('Kategori eklenirken hata oluştu.');
    } finally {
      setAddLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    return `${process.env.REACT_APP_API_URL}${imagePath}`;
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Admin" breadcrumbItem="Kategori Yönetimi" />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title">Kategori Listesi</h4>
                    <div className="d-flex gap-2">
                      <Button 
                        color="primary" 
                        onClick={() => setAddModal(true)}
                      >
                        <i className="mdi mdi-plus me-1"></i>
                        Yeni Kategori Ekle
                      </Button>
                      <Link to="/admin/categories/add" className="btn btn-outline-primary">
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
                            <th>Kategori Adı</th>
                            <th>Açıklama</th>
                            <th>Oluşturma Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {categories.length > 0 ? (
                            categories.map((category) => (
                              <tr key={category.id}>
                                <td>
                                  {category.image ? (
                                    <img
                                      src={getImageUrl(category.image)}
                                      alt={category.name}
                                      style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                      className="rounded"
                                    />
                                  ) : (
                                    <div 
                                      style={{ 
                                        width: '50px', 
                                        height: '50px', 
                                        backgroundColor: '#f8f9fa',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                      }}
                                      className="rounded"
                                    >
                                      <i className="mdi mdi-image text-muted"></i>
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <strong>{category.name}</strong>
                                </td>
                                <td>
                                  {category.description || '-'}
                                </td>
                                <td>
                                  {category.created_at ? new Date(category.created_at).toLocaleDateString('tr-TR') : '-'}
                                </td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Link
                                      to={`/admin/categories/edit/${category.id}`}
                                      className="btn btn-outline-secondary btn-sm"
                                    >
                                      <i className="mdi mdi-pencil"></i>
                                    </Link>
                                    <Button
                                      color="outline-danger"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedCategory(category);
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
                              <td colSpan="5" className="text-center">
                                Henüz kategori bulunmuyor.
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
              Kategori Sil
            </ModalHeader>
            <ModalBody>
              <p>Bu kategoriyi silmek istediğinizden emin misiniz?</p>
              {selectedCategory && (
                <div className="alert alert-warning">
                  <strong>{selectedCategory.name}</strong> kategorisi kalıcı olarak silinecektir.
                  <br />
                  <small className="text-muted">
                    Not: Bu kategoriye bağlı markalar veya ilanlar varsa silme işlemi başarısız olacaktır.
                  </small>
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

          {/* Yeni Kategori Ekleme Modal */}
          <Modal isOpen={addModal} toggle={resetAddModal} size="lg">
            <ModalHeader toggle={resetAddModal}>
              Yeni Kategori Ekle
            </ModalHeader>
            <ModalBody>
              <Form>
                <Row>
                  <Col md="6">
                    <FormGroup>
                      <Label for="name">Kategori Adı *</Label>
                      <Input
                        type="text"
                        id="name"
                        name="name"
                        value={newCategory.name}
                        onChange={handleInputChange}
                        placeholder="Kategori adını girin"
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
                        value={newCategory.description}
                        onChange={handleInputChange}
                        placeholder="Kategori açıklaması (opsiyonel)"
                      />
                    </FormGroup>
                  </Col>
                </Row>

                <FormGroup>
                  <Label for="image">Kategori Resmi</Label>
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
                onClick={handleAddCategory}
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

export default CategoryList;