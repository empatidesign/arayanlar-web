import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  Alert,
  Table,
  Badge,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';

const ListingLimits = () => {
  const [currentLimit, setCurrentLimit] = useState(50);
  const [newLimit, setNewLimit] = useState(50);
  const [userCounts, setUserCounts] = useState([]);
  const [schedulerStatus, setSchedulerStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [resetModal, setResetModal] = useState(false);
  const [resetUserId, setResetUserId] = useState(null);

  // API Base URL
  const API_BASE = process.env.REACT_APP_API_URL;

  // Auth token'ı localStorage'dan al
  const getAuthToken = () => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const user = JSON.parse(authUser);
      // Backend response yapısına göre token'ı data.token'dan al
      return user.data?.token || user.token || user.accessToken;
    }
    return null;
  };

  // API çağrıları için headers
  const getHeaders = () => ({
    'Authorization': `Bearer ${getAuthToken()}`,
    'Content-Type': 'application/json'
  });

  // Alert göster
  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  // Mevcut limiti getir
  const fetchCurrentLimit = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/listing-limits/admin/limit`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentLimit(data.daily_limit);
        setNewLimit(data.daily_limit);
      }
    } catch (error) {
      console.error('Limit getirme hatası:', error);
    }
  };

  // Kullanıcı sayaçlarını getir
  const fetchUserCounts = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/listing-limits/admin/users-count`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserCounts(data.users || []);
      }
    } catch (error) {
      console.error('Kullanıcı sayaçları getirme hatası:', error);
    }
  };

  // Scheduler durumunu getir
  const fetchSchedulerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/listing-limits/admin/scheduler-status`, {
        headers: getHeaders()
      });
      
      if (response.ok) {
        const data = await response.json();
        setSchedulerStatus(data);
      }
    } catch (error) {
      console.error('Scheduler durumu getirme hatası:', error);
    }
  };

  // Limiti güncelle
  const updateLimit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/listing-limits/admin/limit`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ daily_limit: parseInt(newLimit) })
      });

      if (response.ok) {
        setCurrentLimit(newLimit);
        showAlert('İlan limiti başarıyla güncellendi!', 'success');
      } else {
        showAlert('Limit güncellenirken hata oluştu!', 'danger');
      }
    } catch (error) {
      console.error('Limit güncelleme hatası:', error);
      showAlert('Limit güncellenirken hata oluştu!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Tüm sayaçları sıfırla
  const resetAllCounts = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/listing-limits/admin/reset-counts`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.ok) {
        showAlert('Tüm kullanıcı sayaçları sıfırlandı!', 'success');
        fetchUserCounts(); // Listeyi yenile
      } else {
        showAlert('Sayaçlar sıfırlanırken hata oluştu!', 'danger');
      }
    } catch (error) {
      console.error('Sayaç sıfırlama hatası:', error);
      showAlert('Sayaçlar sıfırlanırken hata oluştu!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Belirli kullanıcının sayacını sıfırla
  const resetUserCount = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/listing-limits/admin/reset-user/${resetUserId}`, {
        method: 'POST',
        headers: getHeaders()
      });

      if (response.ok) {
        showAlert('Kullanıcı sayacı sıfırlandı!', 'success');
        fetchUserCounts(); // Listeyi yenile
        setResetModal(false);
        setResetUserId(null);
      } else {
        showAlert('Sayaç sıfırlanırken hata oluştu!', 'danger');
      }
    } catch (error) {
      console.error('Kullanıcı sayacı sıfırlama hatası:', error);
      showAlert('Sayaç sıfırlanırken hata oluştu!', 'danger');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde verileri getir
  useEffect(() => {
    fetchCurrentLimit();
    fetchUserCounts();
    fetchSchedulerStatus();
  }, []);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Admin" breadcrumbItem="İlan Limitleri" />

          {alert.show && (
            <Alert color={alert.type} className="mb-4">
              {alert.message}
            </Alert>
          )}

          <Row>
            {/* Limit Ayarları */}
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Günlük İlan Limiti</CardTitle>
                  
                  <div className="mb-3">
                    <h5>Mevcut Limit: <Badge color="primary">{currentLimit} ilan/gün</Badge></h5>
                  </div>

                  <Form onSubmit={updateLimit}>
                    <FormGroup>
                      <Label htmlFor="newLimit">Yeni Limit</Label>
                      <Input
                        type="number"
                        id="newLimit"
                        value={newLimit || ''}
                        onChange={(e) => setNewLimit(parseInt(e.target.value) || 0)}
                        min="1"
                        max="1000"
                        required
                      />
                    </FormGroup>
                    <Button 
                      type="submit" 
                      color="primary" 
                      disabled={loading || newLimit == currentLimit}
                    >
                      {loading ? 'Güncelleniyor...' : 'Limiti Güncelle'}
                    </Button>
                  </Form>
                </CardBody>
              </Card>
            </Col>

            {/* Sistem Durumu */}
            <Col lg={6}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Sistem Durumu</CardTitle>
                  
                  {schedulerStatus && (
                    <div>
                      <p><strong>Scheduler Durumu:</strong> 
                        <Badge color={schedulerStatus.running ? 'success' : 'danger'} className="ms-2">
                          {schedulerStatus.running ? 'Çalışıyor' : 'Durduruldu'}
                        </Badge>
                      </p>
                      <p><strong>Son Sıfırlama:</strong> {schedulerStatus.lastReset || 'Henüz sıfırlanmadı'}</p>
                      <p><strong>Sonraki Sıfırlama:</strong> {schedulerStatus.nextReset || 'Bilinmiyor'}</p>
                    </div>
                  )}

                  <div className="mt-3">
                    <Button 
                      color="warning" 
                      onClick={resetAllCounts}
                      disabled={loading}
                    >
                      {loading ? 'Sıfırlanıyor...' : 'Tüm Sayaçları Sıfırla'}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Kullanıcı İstatistikleri */}
          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">Kullanıcı İlan İstatistikleri</CardTitle>
                  
                  {userCounts.length > 0 ? (
                    <Table responsive>
                      <thead>
                        <tr>
                          <th>Kullanıcı ID</th>
                          <th>Bugünkü İlan Sayısı</th>
                          <th>Limit Durumu</th>
                          <th>Son Güncelleme</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userCounts.map((user, index) => (
                          <tr key={index}>
                            <td>{user.user_id}</td>
                            <td>
                              <Badge color={user.count >= currentLimit ? 'danger' : 'success'}>
                                {user.count}
                              </Badge>
                            </td>
                            <td>
                              {user.count >= currentLimit ? (
                                <Badge color="danger">Limit Aşıldı</Badge>
                              ) : (
                                <Badge color="success">Normal</Badge>
                              )}
                            </td>
                            <td>{new Date(user.updated_at).toLocaleString('tr-TR')}</td>
                            <td>
                              <Button
                                color="outline-warning"
                                size="sm"
                                onClick={() => {
                                  setResetUserId(user.user_id);
                                  setResetModal(true);
                                }}
                              >
                                Sıfırla
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center py-4">
                      <p>Henüz ilan veren kullanıcı bulunmuyor.</p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Kullanıcı Sayacı Sıfırlama Modal */}
          <Modal isOpen={resetModal} toggle={() => setResetModal(false)}>
            <ModalHeader toggle={() => setResetModal(false)}>
              Kullanıcı Sayacını Sıfırla
            </ModalHeader>
            <ModalBody>
              <p>Kullanıcı ID: <strong>{resetUserId}</strong> için günlük ilan sayacını sıfırlamak istediğinizden emin misiniz?</p>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setResetModal(false)}>
                İptal
              </Button>
              <Button color="warning" onClick={resetUserCount} disabled={loading}>
                {loading ? 'Sıfırlanıyor...' : 'Sıfırla'}
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ListingLimits;