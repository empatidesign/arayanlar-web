import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Alert,
  Badge,
  Spinner
} from 'reactstrap';
import { getUserListingLimit } from '../../helpers/backend_helper';
import LimitWarning from '../../components/LimitWarning';

const CreateListing = () => {
  const navigate = useNavigate();
  
  const [listing, setListing] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'TL',
    category_id: '',
    location_city: '',
    location_district: '',
    contact_phone: '',
    contact_email: ''
  });

  const [limitInfo, setLimitInfo] = useState(null);
  const [limitLoading, setLimitLoading] = useState(true);
  const [limitError, setLimitError] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchLimitInfo();
  }, []);

  const fetchLimitInfo = async () => {
    try {
      setLimitLoading(true);
      const response = await getUserListingLimit();
      setLimitInfo(response);
      setLimitError('');
    } catch (error) {
      console.error('Limit bilgisi alınamadı:', error);
      setLimitError('Limit bilgisi yüklenemedi');
    } finally {
      setLimitLoading(false);
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
    
    // Limit kontrolü
    if (limitInfo && limitInfo.current_count >= limitInfo.daily_limit) {
      setError('Günlük ilan verme limitinizi aştınız. Yarın tekrar deneyebilirsiniz.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Burada API çağrısı yapılacak
      console.log('İlan veriliyor:', listing);
      
      // Simüle edilmiş başarı
      setTimeout(() => {
        setSuccess('İlanınız başarıyla oluşturuldu ve onay için gönderildi.');
        setListing({
          title: '',
          description: '',
          price: '',
          currency: 'TL',
          category_id: '',
          location_city: '',
          location_district: '',
          contact_phone: '',
          contact_email: ''
        });
        // Limit bilgisini yenile
        fetchLimitInfo();
        setLoading(false);
      }, 2000);
      
    } catch (error) {
      console.error('İlan oluşturma hatası:', error);
      setError('İlan oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
      setLoading(false);
    }
  };

  const getLimitStatus = () => {
    if (!limitInfo) return { color: 'secondary', text: 'Bilinmiyor' };
    
    const remaining = limitInfo.daily_limit - limitInfo.current_count;
    const percentage = (limitInfo.current_count / limitInfo.daily_limit) * 100;
    
    if (percentage >= 100) {
      return { color: 'danger', text: 'Limit Aşıldı' };
    } else if (percentage >= 80) {
      return { color: 'warning', text: 'Dikkat' };
    } else {
      return { color: 'success', text: 'Normal' };
    }
  };

  const canCreateListing = limitInfo && limitInfo.current_count < limitInfo.daily_limit;

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs="12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 font-size-18">Yeni İlan Ver</h4>
              <div className="page-title-right">
                <Button color="secondary" onClick={() => navigate('/dashboard')}>
                  <i className="mdi mdi-arrow-left me-1"></i>
                  Dashboard'a Dön
                </Button>
              </div>
            </div>
          </Col>
        </Row>

        {/* Limit Uyarısı */}
        <Row>
          <Col lg={12}>
            <LimitWarning showInline={true} />
          </Col>
        </Row>

        {/* Limit Bilgisi */}
        <Row>
          <Col xs="12">
            <Card className="mb-4">
              <CardBody>
                <h5 className="card-title mb-3">
                  <i className="mdi mdi-chart-line me-2"></i>
                  İlan Verme Durumunuz
                </h5>
                
                {limitLoading ? (
                  <div className="text-center">
                    <Spinner size="sm" className="me-2" />
                    Limit bilgisi yükleniyor...
                  </div>
                ) : limitError ? (
                  <Alert color="warning" className="mb-0" fade timeout={3000}>
                    <i className="mdi mdi-alert-circle me-2"></i>
                    {limitError}
                    <Button 
                      color="link" 
                      size="sm" 
                      onClick={fetchLimitInfo}
                      className="ms-2 p-0"
                    >
                      Tekrar Dene
                    </Button>
                  </Alert>
                ) : limitInfo ? (
                  <Row className="align-items-center">
                    <Col md="8">
                      <div className="d-flex align-items-center">
                        <div className="me-4">
                          <h6 className="mb-1">Bugün Verilen İlan</h6>
                          <h4 className="mb-0">
                            {limitInfo.current_count} / {limitInfo.daily_limit}
                          </h4>
                        </div>
                        <div className="me-4">
                          <h6 className="mb-1">Kalan Hak</h6>
                          <h4 className="mb-0 text-primary">
                            {Math.max(0, limitInfo.daily_limit - limitInfo.current_count)}
                          </h4>
                        </div>
                        <div>
                          <h6 className="mb-1">Durum</h6>
                          <Badge color={getLimitStatus().color} className="font-size-12">
                            {getLimitStatus().text}
                          </Badge>
                        </div>
                      </div>
                    </Col>
                    <Col md="4" className="text-end">
                      <div className="progress" style={{ height: '8px' }}>
                        <div 
                          className={`progress-bar bg-${getLimitStatus().color}`}
                          style={{ 
                            width: `${Math.min(100, (limitInfo.current_count / limitInfo.daily_limit) * 100)}%` 
                          }}
                        ></div>
                      </div>
                      <small className="text-muted mt-1 d-block">
                        %{Math.round((limitInfo.current_count / limitInfo.daily_limit) * 100)} kullanıldı
                      </small>
                    </Col>
                  </Row>
                ) : null}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Limit Aşıldı Uyarısı */}
        {!canCreateListing && limitInfo && (
          <Row>
            <Col xs="12">
              <Alert color="danger">
                <i className="mdi mdi-alert-circle me-2"></i>
                <strong>Günlük limit aşıldı!</strong> 
                Bugün {limitInfo.daily_limit} ilan verme hakkınızı kullandınız. 
                Yeni ilan verebilmek için yarın tekrar deneyin.
              </Alert>
            </Col>
          </Row>
        )}

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

        {/* İlan Formu */}
        <Row>
          <Col lg="8">
            <Card>
              <CardBody>
                <h5 className="card-title mb-4">İlan Bilgileri</h5>
                
                <Form onSubmit={handleSubmit}>
                  <Row>
                    <Col md="12">
                      <FormGroup>
                        <Label>İlan Başlığı *</Label>
                        <Input
                          type="text"
                          name="title"
                          value={listing.title}
                          onChange={handleInputChange}
                          placeholder="İlan başlığınızı girin"
                          required
                          disabled={!canCreateListing || loading}
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
                          placeholder="İlanınızın detaylı açıklamasını yazın"
                          required
                          disabled={!canCreateListing || loading}
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
                          placeholder="0"
                          min="0"
                          step="0.01"
                          required
                          disabled={!canCreateListing || loading}
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
                          disabled={!canCreateListing || loading}
                        >
                          <option value="TL">TL</option>
                          <option value="USD">USD</option>
                          <option value="EUR">EUR</option>
                        </Input>
                      </FormGroup>
                    </Col>
                  </Row>

                  <Row>
                    <Col md="6">
                      <FormGroup>
                        <Label>Şehir *</Label>
                        <Input
                          type="text"
                          name="location_city"
                          value={listing.location_city}
                          onChange={handleInputChange}
                          placeholder="Şehir"
                          required
                          disabled={!canCreateListing || loading}
                        />
                      </FormGroup>
                    </Col>
                    <Col md="6">
                      <FormGroup>
                        <Label>İlçe</Label>
                        <Input
                          type="text"
                          name="location_district"
                          value={listing.location_district}
                          onChange={handleInputChange}
                          placeholder="İlçe"
                          disabled={!canCreateListing || loading}
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
                          disabled={!canCreateListing || loading}
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
                          disabled={!canCreateListing || loading}
                        />
                      </FormGroup>
                    </Col>
                  </Row>

                  <div className="text-end">
                    <Button 
                      type="submit" 
                      color="primary" 
                      disabled={!canCreateListing || loading}
                      size="lg"
                    >
                      {loading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          İlan Veriliyor...
                        </>
                      ) : (
                        <>
                          <i className="mdi mdi-plus me-2"></i>
                          İlan Ver
                        </>
                      )}
                    </Button>
                  </div>
                </Form>
              </CardBody>
            </Card>
          </Col>

          <Col lg="4">
            {/* Yardım Kartı */}
            <Card>
              <CardBody>
                <h5 className="card-title mb-3">
                  <i className="mdi mdi-help-circle me-2"></i>
                  İlan Verme İpuçları
                </h5>
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="mdi mdi-check-circle text-success me-2"></i>
                    Açık ve net bir başlık kullanın
                  </li>
                  <li className="mb-2">
                    <i className="mdi mdi-check-circle text-success me-2"></i>
                    Detaylı açıklama yazın
                  </li>
                  <li className="mb-2">
                    <i className="mdi mdi-check-circle text-success me-2"></i>
                    Gerçek fiyat belirtin
                  </li>
                  <li className="mb-2">
                    <i className="mdi mdi-check-circle text-success me-2"></i>
                    İletişim bilgilerinizi ekleyin
                  </li>
                  <li className="mb-0">
                    <i className="mdi mdi-information text-info me-2"></i>
                    İlanınız onaylandıktan sonra yayınlanacak
                  </li>
                </ul>
              </CardBody>
            </Card>

            {/* Limit Bilgi Kartı */}
            {limitInfo && (
              <Card>
                <CardBody>
                  <h5 className="card-title mb-3">
                    <i className="mdi mdi-information me-2"></i>
                    Limit Bilgileri
                  </h5>
                  <div className="mb-2">
                    <strong>Günlük Limit:</strong> {limitInfo.daily_limit} ilan
                  </div>
                  <div className="mb-2">
                    <strong>Kullanılan:</strong> {limitInfo.current_count} ilan
                  </div>
                  <div className="mb-2">
                    <strong>Kalan:</strong> {Math.max(0, limitInfo.daily_limit - limitInfo.current_count)} ilan
                  </div>
                  <hr />
                  <small className="text-muted">
                    Limitler her gün saat 00:00'da sıfırlanır.
                  </small>
                </CardBody>
              </Card>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CreateListing;