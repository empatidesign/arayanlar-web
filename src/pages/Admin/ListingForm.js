import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, Badge } from 'reactstrap';
import { get, put } from '../../helpers/api_helper';

const ListingForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'TL',
    category_id: '',
    location_city: '',
    location_district: '',
    location_address: '',
    contact_phone: '',
    contact_email: '',
    status: 'pending',
    is_urgent: false,
    images: []
  });
  
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCategories();
    if (isEdit) {
      fetchListing();
    }
  }, [id, isEdit]);

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

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await get(`/api/listings/${id}`);
      
      if (response.success) {
        setListing(response.data);
      } else {
        setError(response.message || 'İlan yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('İlan yüklenirken hata:', error);
      setError('İlan yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setListing(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await put(`/api/listings/${id}`, listing);
      
      if (response.success) {
        setSuccess('İlan başarıyla güncellendi');
        setTimeout(() => {
          navigate('/admin/listings');
        }, 2000);
      } else {
        setError(response.message || 'İlan güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('İlan güncellenirken hata:', error);
      setError('İlan güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <Badge color="warning">Bekliyor</Badge>;
      case 'approved':
        return <Badge color="success">Onaylandı</Badge>;
      case 'rejected':
        return <Badge color="danger">Reddedildi</Badge>;
      default:
        return <Badge color="secondary">Bilinmiyor</Badge>;
    }
  };

  const formatPrice = (price, currency = 'TL') => {
    return new Intl.NumberFormat('tr-TR').format(price) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs="12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 font-size-18">
                {isEdit ? 'İlan Detayı' : 'Yeni İlan'}
              </h4>
              <div className="page-title-right">
                <Button color="secondary" onClick={() => navigate('/admin/listings')}>
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
              <Alert color="danger">{error}</Alert>
            </Col>
          </Row>
        )}

        {success && (
          <Row>
            <Col xs="12">
              <Alert color="success">{success}</Alert>
            </Col>
          </Row>
        )}

        <Row>
          <Col lg="8">
            <Card>
              <CardBody>
                <h5 className="card-title mb-4">İlan Bilgileri</h5>
                
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <Label>Başlık *</Label>
                        <Input
                          type="text"
                          name="title"
                          value={listing.title}
                          onChange={handleInputChange}
                          placeholder="İlan başlığı"
                          required
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <Label>Açıklama *</Label>
                        <Input
                          type="textarea"
                          name="description"
                          rows="4"
                          value={listing.description}
                          onChange={handleInputChange}
                          placeholder="İlan açıklaması"
                          required
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Kategori *</Label>
                        <Input
                          type="select"
                          name="category_id"
                          value={listing.category_id}
                          onChange={handleInputChange}
                          required
                          disabled={!isEdit}
                        >
                          <option value="">Kategori seçin</option>
                          {categories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label>Fiyat *</Label>
                        <Input
                          type="number"
                          name="price"
                          value={listing.price}
                          onChange={handleInputChange}
                          placeholder="0"
                          min="0"
                          step="0.01"
                          required
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup>
                        <Label>Para Birimi</Label>
                        <Input
                          type="select"
                          name="currency"
                          value={listing.currency}
                          onChange={handleInputChange}
                          disabled={!isEdit}
                        >
                          <option value="TL">TL</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="4">
                      <FormGroup>
                        <Label>Şehir *</Label>
                        <Input
                          type="text"
                          name="location_city"
                          value={listing.location_city}
                          onChange={handleInputChange}
                          placeholder="Şehir"
                          required
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label>İlçe</Label>
                        <Input
                          type="text"
                          name="location_district"
                          value={listing.location_district}
                          onChange={handleInputChange}
                          placeholder="İlçe"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label>Adres</Label>
                        <Input
                          type="text"
                          name="location_address"
                          value={listing.location_address}
                          onChange={handleInputChange}
                          placeholder="Adres"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Telefon</Label>
                        <Input
                          type="tel"
                          name="contact_phone"
                          value={listing.contact_phone}
                          onChange={handleInputChange}
                          placeholder="Telefon numarası"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>E-posta</Label>
                        <Input
                          type="email"
                          name="contact_email"
                          value={listing.contact_email}
                          onChange={handleInputChange}
                          placeholder="E-posta adresi"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Durum</Label>
                        <Input
                          type="select"
                          name="status"
                          value={listing.status}
                          onChange={handleInputChange}
                          disabled={!isEdit}
                        >
                          <option value="pending">Bekliyor</option>
                          <option value="approved">Onaylandı</option>
                          <option value="rejected">Reddedildi</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup className="d-flex align-items-center mt-4">
                        <Input
                          type="checkbox"
                          name="is_urgent"
                          checked={listing.is_urgent}
                          onChange={handleInputChange}
                          disabled={!isEdit}
                          className="me-2"
                        />
                        <Label className="mb-0">Acil İlan</Label>
                      </FormGroup>
                    </Col>
                  </Row>

                  {isEdit && (
                    <div className="text-end">
                      <Button type="submit" color="primary" disabled={loading}>
                        {loading ? 'Güncelleniyor...' : 'Güncelle'}
                      </Button>
                    </div>
                  )}
                </Form>
              </CardBody>
            </Card>
          </Col>

          <Col lg="4">
            {/* İlan Durumu */}
            <Card>
              <CardBody>
                <h5 className="card-title mb-3">İlan Durumu</h5>
                <div className="mb-3">
                  <strong>Durum: </strong>
                  {getStatusBadge(listing.status)}
                </div>
                {listing.created_at && (
                  <div className="mb-3">
                    <strong>Oluşturulma: </strong>
                    <span>{formatDate(listing.created_at)}</span>
                  </div>
                )}
                {listing.updated_at && (
                  <div className="mb-3">
                    <strong>Güncellenme: </strong>
                    <span>{formatDate(listing.updated_at)}</span>
                  </div>
                )}
                {listing.price && (
                  <div className="mb-3">
                    <strong>Fiyat: </strong>
                    <span className="text-success font-weight-bold">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                  </div>
                )}
                {listing.is_urgent && (
                  <div className="mb-3">
                    <Badge color="danger">
                      <i className="mdi mdi-fire me-1"></i>
                      Acil İlan
                    </Badge>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* İlan Resimleri */}
            {listing.images && listing.images.length > 0 && (
              <Card>
                <CardBody>
                  <h5 className="card-title mb-3">İlan Resimleri</h5>
                  <div className="row">
                    {listing.images.map((image, index) => (
                      <div key={index} className="col-6 mb-3">
                        <img
                          src={`${process.env.REACT_APP_API_URL}${image}`}
                          alt={`İlan resmi ${index + 1}`}
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '100px', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}

            {/* Kullanıcı Bilgileri */}
            {listing.user_name && (
              <Card>
                <CardBody>
                  <h5 className="card-title mb-3">İlan Sahibi</h5>
                  <div className="mb-2">
                    <strong>Ad: </strong>
                    <span>{listing.user_name}</span>
                  </div>
                  {listing.user_email && (
                    <div className="mb-2">
                      <strong>E-posta: </strong>
                      <span>{listing.user_email}</span>
                    </div>
                  )}
                  {listing.user_phone && (
                    <div className="mb-2">
                      <strong>Telefon: </strong>
                      <span>{listing.user_phone}</span>
                    </div>
                  )}
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default ListingForm;