import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Table, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Alert } from 'reactstrap';
import { get, del } from '../../helpers/api_helper';
import { Link } from 'react-router-dom';

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Modal states
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    brand_id: '',
    category_id: '',
    page: 1
  });

  useEffect(() => {
    fetchProducts();
    fetchBrands();
    fetchCategories();
  }, [filters]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError('');
      
      let endpoint = '/api/products';
      const params = new URLSearchParams();
      
      if (filters.brand_id) {
        params.append('brand_id', filters.brand_id);
      }
      if (filters.category_id) {
        params.append('category_id', filters.category_id);
      }
      params.append('page', filters.page);
      params.append('limit', pagination.limit);
      
      if (params.toString()) {
        endpoint += '?' + params.toString();
      }
      
      const response = await get(endpoint);
      
      if (response.success) {
        setProducts(response.products || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'Ürünler yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürünler yüklenirken hata:', error);
      setError('Ürünler yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await get('/api/brands');
      if (response.success) {
        setBrands(response.data || []);
      }
    } catch (error) {
      console.error('Markalar yüklenirken hata:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await get('/api/sections');
      if (response.success) {
        setCategories(response.data || []);
      }
    } catch (error) {
      console.error('Kategoriler yüklenirken hata:', error);
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await del(`/api/products/${selectedProduct.id}`);
      
      if (response.success) {
        setSuccess('Ürün başarıyla silindi');
        setDeleteModal(false);
        setSelectedProduct(null);
        fetchProducts();
      } else {
        setError(response.message || 'Ürün silinirken hata oluştu');
      }
    } catch (error) {
      console.error('Ürün silinirken hata:', error);
      setError('Ürün silinirken hata oluştu');
    }
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    for (let i = 1; i <= pagination.pages; i++) {
      pages.push(
        <Button
          key={i}
          color={pagination.page === i ? "primary" : "secondary"}
          size="sm"
          className="me-1"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }

    return (
      <div className="d-flex justify-content-center mt-3">
        <Button
          color="secondary"
          size="sm"
          className="me-1"
          disabled={pagination.page === 1}
          onClick={() => handlePageChange(pagination.page - 1)}
        >
          Önceki
        </Button>
        {pages}
        <Button
          color="secondary"
          size="sm"
          className="ms-1"
          disabled={pagination.page === pagination.pages}
          onClick={() => handlePageChange(pagination.page + 1)}
        >
          Sonraki
        </Button>
      </div>
    );
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs="12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 font-size-18">Ürün Yönetimi</h4>
              <div className="page-title-right">
                <Link to="/admin/products/add" className="btn btn-primary">
                  <i className="mdi mdi-plus me-1"></i>
                  Yeni Ürün Ekle
                </Link>
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
                {/* Filtreler */}
                <Row className="mb-3">
                  <Col md="4">
                    <FormGroup>
                      <Label>Marka</Label>
                      <Input
                        type="select"
                        value={filters.brand_id}
                        onChange={(e) => setFilters({...filters, brand_id: e.target.value, page: 1})}
                      >
                        <option value="">Tüm Markalar</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>
                            {brand.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="4">
                    <FormGroup>
                      <Label>Kategori</Label>
                      <Input
                        type="select"
                        value={filters.category_id}
                        onChange={(e) => setFilters({...filters, category_id: e.target.value, page: 1})}
                      >
                        <option value="">Tüm Kategoriler</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="4" className="d-flex align-items-end">
                    <Button
                      color="secondary"
                      onClick={() => setFilters({ brand_id: '', category_id: '', page: 1 })}
                    >
                      Filtreleri Temizle
                    </Button>
                  </Col>
                </Row>

                {/* Ürün Tablosu */}
                <div className="table-responsive">
                  <Table className="table-nowrap table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Resim</th>
                        <th>Ürün Adı</th>
                        <th>Marka</th>
                        <th>Kategori</th>
                        <th>Model</th>
                        <th>Tarih</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="7" className="text-center">Yükleniyor...</td>
                        </tr>
                      ) : products.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center">Ürün bulunamadı</td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id}>
                            <td>
                              {product.image ? (
                                <img
                                  src={`${process.env.REACT_APP_API_URL}${product.image}`}
                                  alt={product.name}
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
                            <td>
                              <div>
                                <h6 className="mb-0">{product.name}</h6>
                                {product.description && (
                                  <small className="text-muted">
                                    {product.description.length > 50 
                                      ? product.description.substring(0, 50) + '...'
                                      : product.description
                                    }
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>{product.brand_name || '-'}</td>
                            <td>{product.category_name || '-'}</td>
                            <td>{product.model || '-'}</td>
                            <td>
                              {new Date(product.created_at).toLocaleDateString('tr-TR')}
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Link
                                  to={`/admin/products/edit/${product.id}`}
                                  className="btn btn-sm btn-outline-primary"
                                >
                                  <i className="mdi mdi-pencil"></i>
                                </Link>
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedProduct(product);
                                    setDeleteModal(true);
                                  }}
                                >
                                  <i className="mdi mdi-delete"></i>
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {renderPagination()}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Silme Modal */}
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
          <ModalHeader toggle={() => setDeleteModal(false)}>
            Ürünü Sil
          </ModalHeader>
          <ModalBody>
            <p>Bu ürünü silmek istediğinizden emin misiniz?</p>
            {selectedProduct && (
              <div className="alert alert-warning">
                <strong>{selectedProduct.name}</strong>
                <br />
                <small>Bu işlem geri alınamaz.</small>
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
      </Container>
    </div>
  );
};

export default ProductList;