import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, CardBody, Form, FormGroup, Label, Input, Button, Alert, Badge, Table } from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { get, put } from '../../helpers/api_helper';

const HousingListingsForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'TL',
    province: '',
    district: '',
    neighborhood: '',
    property_type: '',
    room_count: '',
    gross_area: '',
    max_area: '',
    net_area: '',
    floor_number: '',
    total_floors: '',
    building_age: '',
    is_in_site: false,
    site_name: '',
    heating_type: '',
    has_balcony: false,
    is_furnished: false,
    has_parking: false,
    has_elevator: false,
    has_security: false,
    has_pool: false,
    has_gym: false,
    has_garden: false,
    facade_direction: '',
    bathroom_count: '',
    monthly_dues: '',
    deed_status: '',
    is_loan_suitable: false,
    is_exchange_suitable: false,
    status: 'pending',
    is_urgent: false,
    images: [],
    user_name: '',
    user_email: '',
    user_phone: '',
    created_at: '',
    updated_at: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEdit) {
      fetchListing();
    }
  }, [id, isEdit]);

  const fetchListing = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await get(`/api/housing/listings/${id}`);
      
      if (response.success) {
        setListing(response.data);
      } else {
        setError(response.message || 'Konut ilanı yüklenirken hata oluştu');
      }
    } catch (error) {
      console.error('Konut ilanı yüklenirken hata:', error);
      setError('Konut ilanı yüklenirken hata oluştu');
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
      
      const response = await put(`/api/housing/listings/${id}`, listing);
      
      if (response.success) {
        setSuccess('Konut ilanı başarıyla güncellendi');
        setTimeout(() => {
          navigate('/admin/housing-listings');
        }, 2000);
      } else {
        setError(response.message || 'Konut ilanı güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Konut ilanı güncellenirken hata:', error);
      setError('Konut ilanı güncellenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price, currency = 'TL') => {
    if (!price) return 'Belirtilmemiş';
    return new Intl.NumberFormat('tr-TR').format(price) + ' ' + currency;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Belirtilmemiş';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'approved':
        return <Badge color="success">Onaylandı</Badge>;
      case 'rejected':
        return <Badge color="danger">Reddedildi</Badge>;
      case 'pending':
        return <Badge color="warning">Bekliyor</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL}${imagePath}`;
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
        <Breadcrumbs title="Konut İlanı" breadcrumbItem={isEdit ? 'İlan Detayı' : 'Yeni İlan'} />

        <Row>
          <Col xs="12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 font-size-18">
                {isEdit ? 'Konut İlanı Detayı' : 'Yeni Konut İlanı'}
              </h4>
              <div className="page-title-right">
                <Button color="secondary" onClick={() => navigate('/admin/housing-listings')}>
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
                <h5 className="card-title mb-4">Konut İlan Bilgileri</h5>
                
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
                        <Label>Fiyat *</Label>
                        <Input
                          type="number"
                          name="price"
                          value={listing.price}
                          onChange={handleInputChange}
                          placeholder="Fiyat"
                          required
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
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
                        <Label>İl *</Label>
                        <Input
                          type="text"
                          name="province"
                          value={listing.province}
                          onChange={handleInputChange}
                          placeholder="İl"
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
                          name="district"
                          value={listing.district}
                          onChange={handleInputChange}
                          placeholder="İlçe"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="4">
                      <FormGroup>
                        <Label>Mahalle</Label>
                        <Input
                          type="text"
                          name="neighborhood"
                          value={listing.neighborhood}
                          onChange={handleInputChange}
                          placeholder="Mahalle"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Konut Tipi</Label>
                        <Input
                          type="select"
                          name="property_type"
                          value={listing.property_type}
                          onChange={handleInputChange}
                          disabled={!isEdit}
                        >
                          <option value="">Seçiniz</option>
                          <option value="Daire">Daire</option>
                          <option value="Villa">Villa</option>
                          <option value="Müstakil Ev">Müstakil Ev</option>
                          <option value="Dubleks">Dubleks</option>
                          <option value="Tripleks">Tripleks</option>
                          <option value="Residence">Residence</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Oda Sayısı</Label>
                        <Input
                          type="select"
                          name="room_count"
                          value={listing.room_count}
                          onChange={handleInputChange}
                          disabled={!isEdit}
                        >
                          <option value="">Seçiniz</option>
                          <option value="1+0">1+0</option>
                          <option value="1+1">1+1</option>
                          <option value="2+1">2+1</option>
                          <option value="3+1">3+1</option>
                          <option value="4+1">4+1</option>
                          <option value="5+1">5+1</option>
                          <option value="6+1">6+1</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Min m²</Label>
                        <Input
                          type="number"
                          name="gross_area"
                          value={listing.gross_area}
                          onChange={handleInputChange}
                          placeholder="Min m²"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={6}>
                      <FormGroup>
                        <Label>Max m²</Label>
                        <Input
                          type="number"
                          name="max_area"
                          value={listing.max_area}
                          onChange={handleInputChange}
                          placeholder="Max m²"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Net m²</Label>
                        <Input
                          type="number"
                          name="net_area"
                          value={listing.net_area}
                          onChange={handleInputChange}
                          placeholder="Net m²"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Bulunduğu Kat</Label>
                        <Input
                          type="number"
                          name="floor_number"
                          value={listing.floor_number}
                          onChange={handleInputChange}
                          placeholder="Bulunduğu kat"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Toplam Kat</Label>
                        <Input
                          type="number"
                          name="total_floors"
                          value={listing.total_floors}
                          onChange={handleInputChange}
                          placeholder="Toplam kat sayısı"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Bina Yaşı</Label>
                        <Input
                          type="text"
                          name="building_age"
                          value={listing.building_age}
                          onChange={handleInputChange}
                          placeholder="Bina yaşı"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Isıtma Tipi</Label>
                        <Input
                          type="select"
                          name="heating_type"
                          value={listing.heating_type}
                          onChange={handleInputChange}
                          disabled={!isEdit}
                        >
                          <option value="">Seçiniz</option>
                          <option value="Kombi">Kombi</option>
                          <option value="Merkezi">Merkezi</option>
                          <option value="Klima">Klima</option>
                          <option value="Soba">Soba</option>
                          <option value="Yerden Isıtma">Yerden Isıtma</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Banyo Sayısı</Label>
                        <Input
                          type="number"
                          name="bathroom_count"
                          value={listing.bathroom_count}
                          onChange={handleInputChange}
                          placeholder="Banyo sayısı"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Aylık Aidat (TL)</Label>
                        <Input
                          type="number"
                          name="monthly_dues"
                          value={listing.monthly_dues}
                          onChange={handleInputChange}
                          placeholder="Aylık aidat"
                          disabled={!isEdit}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Tapu Durumu</Label>
                        <Input
                          type="select"
                          name="deed_status"
                          value={listing.deed_status}
                          onChange={handleInputChange}
                          disabled={!isEdit}
                        >
                          <option value="">Seçiniz</option>
                          <option value="Kat Mülkiyeti">Kat Mülkiyeti</option>
                          <option value="Kat İrtifakı">Kat İrtifakı</option>
                          <option value="Arsa">Arsa</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>Cephe Yönü</Label>
                        <Input
                          type="select"
                          name="facade_direction"
                          value={listing.facade_direction}
                          onChange={handleInputChange}
                          disabled={!isEdit}
                        >
                          <option value="">Seçiniz</option>
                          <option value="Kuzey">Kuzey</option>
                          <option value="Güney">Güney</option>
                          <option value="Doğu">Doğu</option>
                          <option value="Batı">Batı</option>
                          <option value="Kuzey-Doğu">Kuzey-Doğu</option>
                          <option value="Kuzey-Batı">Kuzey-Batı</option>
                          <option value="Güney-Doğu">Güney-Doğu</option>
                          <option value="Güney-Batı">Güney-Batı</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  {/* Site Bilgileri */}
                  <Row>
                    <Col md="6">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="is_in_site"
                            checked={listing.is_in_site}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Site İçinde
                        </Label>
                      </FormGroup>
                    </Col>
                    {listing.is_in_site && (
                      <Col md="6">
                        <FormGroup>
                          <Label>Site Adı</Label>
                          <Input
                            type="text"
                            name="site_name"
                            value={listing.site_name}
                            onChange={handleInputChange}
                            placeholder="Site adı"
                            disabled={!isEdit}
                          />
                        </FormGroup>
                      </Col>
                    )}
                  </Row>

                  {/* Özellikler */}
                  <Row>
                    <Col md="12">
                      <h6 className="mb-3">Özellikler</h6>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="has_balcony"
                            checked={listing.has_balcony}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Balkon
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="is_furnished"
                            checked={listing.is_furnished}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Eşyalı
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="has_parking"
                            checked={listing.has_parking}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Otopark
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="has_elevator"
                            checked={listing.has_elevator}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Asansör
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="has_security"
                            checked={listing.has_security}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Güvenlik
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="has_pool"
                            checked={listing.has_pool}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Havuz
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="has_gym"
                            checked={listing.has_gym}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Spor Salonu
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="has_garden"
                            checked={listing.has_garden}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Bahçe
                        </Label>
                      </FormGroup>
                    </Col>
                  </Row>
                  <Row>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="is_loan_suitable"
                            checked={listing.is_loan_suitable}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Krediye Uygun
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="is_exchange_suitable"
                            checked={listing.is_exchange_suitable}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Takasa Uygun
                        </Label>
                      </FormGroup>
                    </Col>
                    <Col md="3">
                      <FormGroup check>
                        <Label check>
                          <Input
                            type="checkbox"
                            name="is_urgent"
                            checked={listing.is_urgent}
                            onChange={handleInputChange}
                            disabled={!isEdit}
                          />
                          Acil İlan
                        </Label>
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
                  </Row>

                  {isEdit && (
                    <div className="text-end">
                      <Button type="button" color="secondary" className="me-2" onClick={() => navigate('/admin/housing-listings')}>
                        İptal
                      </Button>
                      <Button type="submit" color="primary" disabled={loading}>
                        {loading ? 'Güncelleniyor...' : 'Güncelle'}
                      </Button>
                    </div>
                  )}
                </Form>
              </CardBody>
            </Card>

            {/* İlan Resimleri */}
            {listing.images && listing.images.length > 0 && (
              <Card>
                <CardBody>
                  <h5 className="card-title mb-3">İlan Resimleri</h5>
                  <div className="row">
                    {listing.images.map((image, index) => (
                      <div key={index} className="col-6 col-md-4 col-lg-3 mb-3">
                        <img
                          src={getImageUrl(image)}
                          alt={`İlan resmi ${index + 1}`}
                          className="img-fluid rounded"
                          style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                        />
                      </div>
                    ))}
                  </div>
                </CardBody>
              </Card>
            )}
          </Col>

          <Col lg="4">
            {/* İlan Özeti */}
            <Card>
              <CardBody>
                <h5 className="card-title mb-3">İlan Özeti</h5>
                
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

            {/* Konut Özellikleri Özeti */}
            <Card>
              <CardBody>
                <h5 className="card-title mb-3">Konut Özellikleri</h5>
                <Table size="sm">
                  <tbody>
                    {listing.property_type && (
                      <tr>
                        <td><strong>Konut Tipi:</strong></td>
                        <td>{listing.property_type}</td>
                      </tr>
                    )}
                    {listing.room_count && (
                      <tr>
                        <td><strong>Oda Sayısı:</strong></td>
                        <td>{listing.room_count}</td>
                      </tr>
                    )}
                    {listing.gross_area && (
                      <tr>
                        <td><strong>M² Aralığı:</strong></td>
                        <td>{listing.gross_area}{listing.max_area ? ` - ${listing.max_area}` : ''} m²</td>
                      </tr>
                    )}
                    {listing.net_area && (
                      <tr>
                        <td><strong>Net m²:</strong></td>
                        <td>{listing.net_area}</td>
                      </tr>
                    )}
                    {listing.floor_number && (
                      <tr>
                        <td><strong>Kat:</strong></td>
                        <td>{listing.floor_number}/{listing.total_floors || '?'}</td>
                      </tr>
                    )}
                    {listing.building_age && (
                      <tr>
                        <td><strong>Bina Yaşı:</strong></td>
                        <td>{listing.building_age}</td>
                      </tr>
                    )}
                    {listing.heating_type && (
                      <tr>
                        <td><strong>Isıtma:</strong></td>
                        <td>{listing.heating_type}</td>
                      </tr>
                    )}
                    {listing.bathroom_count && (
                      <tr>
                        <td><strong>Banyo:</strong></td>
                        <td>{listing.bathroom_count}</td>
                      </tr>
                    )}
                    {listing.monthly_dues && (
                      <tr>
                        <td><strong>Aidat:</strong></td>
                        <td>{formatPrice(listing.monthly_dues)}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HousingListingsForm;