import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Input,
  Label,
  Form,
  FormGroup,
  Alert,
  Spinner
} from 'reactstrap';
import Breadcrumbs from '../components/Common/Breadcrumb';
import { get, post } from '../helpers/api_helper';

const BroadcastNotifications = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    usersWithNotifications: 0,
    notificationsLast24h: 0
  });
  const [formData, setFormData] = useState({
    title: '',
    body: ''
  });
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await get('/api/broadcast/stats');
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.body) {
      setError('Başlık ve mesaj gereklidir');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await post('/api/broadcast/send-to-all', {
        title: formData.title,
        body: formData.body,
        data: {
          type: 'broadcast'
        }
      });

      if (response.success) {
        setSuccess(response.message);
        setFormData({ title: '', body: '' });
        fetchStats();
      } else {
        setError(response.message || 'Bildirim gönderilemedi');
      }
    } catch (error) {
      setError('Bildirim gönderilirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Yönetim" breadcrumbItem="Toplu Bildirim" />

          {/* İstatistikler */}
          <Row>
            <Col md={4}>
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-truncate font-size-14 mb-2">Toplam Kullanıcı</p>
                      <h4 className="mb-0">{stats.totalUsers}</h4>
                    </div>
                    <div className="text-primary">
                      <i className="ri-user-line font-size-24"></i>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-truncate font-size-14 mb-2">Bildirim Alacak</p>
                      <h4 className="mb-0 text-success">{stats.usersWithNotifications}</h4>
                    </div>
                    <div className="text-success">
                      <i className="ri-notification-line font-size-24"></i>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>

            <Col md={4}>
              <Card>
                <CardBody>
                  <div className="d-flex">
                    <div className="flex-1 overflow-hidden">
                      <p className="text-truncate font-size-14 mb-2">Son 24 Saat</p>
                      <h4 className="mb-0">{stats.notificationsLast24h}</h4>
                    </div>
                    <div className="text-info">
                      <i className="ri-send-plane-line font-size-24"></i>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Bildirim Formu */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">
                    <i className="ri-notification-3-line me-2"></i>
                    Yeni Bildirim Oluştur
                  </CardTitle>

                  {success && <Alert color="success">{success}</Alert>}
                  {error && <Alert color="danger">{error}</Alert>}

                  <Form onSubmit={handleSubmit}>
                    <FormGroup>
                      <Label for="title">Bildirim Başlığı *</Label>
                      <Input
                        type="text"
                        id="title"
                        placeholder="Örn: Yeni Özellik Duyurusu"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        maxLength={100}
                        required
                      />
                      <small className="text-muted">
                        {formData.title.length}/100 karakter
                      </small>
                    </FormGroup>

                    <FormGroup>
                      <Label for="body">Bildirim Mesajı *</Label>
                      <Input
                        type="textarea"
                        id="body"
                        rows="4"
                        placeholder="Bildirim mesajınızı buraya yazın..."
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        maxLength={500}
                        required
                      />
                      <small className="text-muted">
                        {formData.body.length}/500 karakter
                      </small>
                    </FormGroup>

                    <div className="d-flex gap-2">
                      <Button
                        type="submit"
                        color="primary"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner size="sm" className="me-2" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <i className="ri-send-plane-line me-2"></i>
                            {stats.usersWithNotifications} Kullanıcıya Gönder
                          </>
                        )}
                      </Button>
                      <Button
                        type="button"
                        color="secondary"
                        onClick={() => setFormData({ title: '', body: '' })}
                      >
                        Temizle
                      </Button>
                    </div>
                  </Form>

                  <Alert color="info" className="mt-4">
                    <h5 className="alert-heading">💡 Bilgi:</h5>
                    <ul className="mb-0">
                      <li>Bildirim sadece aktif FCM token'ı olan kullanıcılara gönderilir</li>
                      <li>Başlık en fazla 100, mesaj en fazla 500 karakter olabilir</li>
                      <li>Bildirimler anında gönderilir ve geri alınamaz</li>
                      <li>Kullanıcılar bildirimi uygulama içinde görecektir</li>
                    </ul>
                  </Alert>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default BroadcastNotifications;
