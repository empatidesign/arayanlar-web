import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Alert,
  Badge,
  UncontrolledTooltip,
  Spinner
} from 'reactstrap';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Common/Breadcrumb';

const TransactionsManagement = () => {
  // State yönetimi
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTransactions, setTotalTransactions] = useState(0);
  const [limit] = useState(10);
  
  // Search ve filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  
  // Modal state
  const [statusModal, setStatusModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  
  // Stats state
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    completed: 0,
    cancelled: 0,
    refunded: 0
  });

  // API base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Token'ı localStorage'dan al
  const getAuthToken = () => {
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      const user = JSON.parse(authUser);
      // Backend response yapısına göre token'ı data.token'dan al
      return user.data?.token || user.token || user.accessToken;
    }
    return null;
  };

  // API headers
  const getHeaders = () => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Yetkilendirme token\'ı bulunamadı');
    }
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // İşlemleri getir
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
        ...(dateFilter && { date: dateFilter })
      });

      console.log('API çağrısı yapılıyor:', `${API_BASE_URL}/api/admin/transactions?${queryParams}`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/transactions?${queryParams}`, {
        headers: getHeaders()
      });

      console.log('API yanıtı:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('API hatası:', errorData);
        throw new Error(`İşlemler getirilemedi: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('API verisi:', data);
      
      // API'den gelen veri yapısına göre güncelle
      if (data.success && data.data) {
        setTransactions(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalTransactions(data.pagination?.total || 0);
      } else {
        setTransactions([]);
        setTotalPages(1);
        setTotalTransactions(0);
      }
    } catch (err) {
      console.error('Fetch hatası:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // İstatistikleri getir
  const fetchStats = async () => {
    try {
      console.log('Stats API çağrısı yapılıyor:', `${API_BASE_URL}/api/admin/transactions/stats`);
      
      const response = await fetch(`${API_BASE_URL}/api/admin/transactions/stats`, {
        headers: getHeaders()
      });

      console.log('Stats API yanıtı:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Stats API hatası:', errorData);
        throw new Error('İstatistikler getirilemedi');
      }

      const data = await response.json();
      console.log('Stats API verisi:', data);
      setStats(data);
    } catch (err) {
      console.error('İstatistik hatası:', err);
    }
  };

  // İşlem durumunu güncelle
  const updateTransactionStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/transactions/${selectedTransaction.id}/status`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ status: newStatus })
      });

      if (!response.ok) {
        throw new Error('İşlem durumu güncellenemedi');
      }

      setSuccess('İşlem durumu başarıyla güncellendi');
      setStatusModal(false);
      fetchTransactions();
      fetchStats();
    } catch (err) {
      setError(err.message);
    }
  };

  // Component mount
  useEffect(() => {
    fetchTransactions();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter, typeFilter, dateFilter]);

  // Status badge rengi
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'pending': return 'warning';
      case 'cancelled': return 'danger';
      case 'refunded': return 'info';
      default: return 'secondary';
    }
  };

  // Status metni
  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Tamamlandı';
      case 'pending': return 'Beklemede';
      case 'cancelled': return 'İptal Edildi';
      case 'refunded': return 'İade Edildi';
      default: return status;
    }
  };

  // Type metni
  const getTypeText = (type) => {
    switch (type) {
      case 'housing': return 'Konut';
      case 'car': return 'Araç';
      case 'watch': return 'Saat';
      default: return type;
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Fiyat formatla
  const formatPrice = (price) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(price);
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Admin" breadcrumbItem="İşlem Yönetimi" />
          
          {/* Alerts */}
          {error && (
            <Alert color="danger" toggle={() => setError('')}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert color="success" toggle={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          {/* İstatistikler */}
          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">İşlem İstatistikleri</CardTitle>
                  <Row>
                    <Col md={2}>
                      <div className="text-center">
                        <h4 className="text-primary">{stats.total}</h4>
                        <p className="text-muted mb-0">Toplam İşlem</p>
                      </div>
                    </Col>
                    <Col md={2}>
                      <div className="text-center">
                        <h4 className="text-warning">{stats.pending}</h4>
                        <p className="text-muted mb-0">Beklemede</p>
                      </div>
                    </Col>
                    <Col md={2}>
                      <div className="text-center">
                        <h4 className="text-success">{stats.completed}</h4>
                        <p className="text-muted mb-0">Tamamlandı</p>
                      </div>
                    </Col>
                    <Col md={2}>
                      <div className="text-center">
                        <h4 className="text-danger">{stats.cancelled}</h4>
                        <p className="text-muted mb-0">İptal Edildi</p>
                      </div>
                    </Col>
                    <Col md={2}>
                      <div className="text-center">
                        <h4 className="text-info">{stats.refunded}</h4>
                        <p className="text-muted mb-0">İade Edildi</p>
                      </div>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Filtreler */}
          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <Row>
                    <Col md={3}>
                      <FormGroup>
                        <Label>Arama</Label>
                        <Input
                          type="text"
                          placeholder="İşlem ID, kullanıcı adı..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <Label>Durum</Label>
                        <Input
                          type="select"
                          value={statusFilter}
                          onChange={(e) => setStatusFilter(e.target.value)}
                        >
                          <option value="">Tümü</option>
                          <option value="pending">Beklemede</option>
                          <option value="completed">Tamamlandı</option>
                          <option value="cancelled">İptal Edildi</option>
                          <option value="refunded">İade Edildi</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <Label>Tür</Label>
                        <Input
                          type="select"
                          value={typeFilter}
                          onChange={(e) => setTypeFilter(e.target.value)}
                        >
                          <option value="">Tümü</option>
                          <option value="housing">Konut</option>
                          <option value="car">Araç</option>
                          <option value="watch">Saat</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <Label>Tarih</Label>
                        <Input
                          type="date"
                          value={dateFilter}
                          onChange={(e) => setDateFilter(e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label>&nbsp;</Label>
                        <div>
                          <Button
                            color="secondary"
                            onClick={() => {
                              setSearchTerm('');
                              setStatusFilter('');
                              setTypeFilter('');
                              setDateFilter('');
                            }}
                          >
                            Filtreleri Temizle
                          </Button>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* İşlemler Tablosu */}
          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <CardTitle className="mb-4">
                    İşlemler ({totalTransactions} toplam)
                  </CardTitle>
                  
                  {loading ? (
                    <div className="text-center">
                      <Spinner color="primary" />
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <Table className="table-nowrap mb-0">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Kullanıcı</th>
                              <th>İlan</th>
                              <th>Tür</th>
                              <th>Tutar</th>
                              <th>Durum</th>
                              <th>Tarih</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((transaction) => (
                              <tr key={transaction.id}>
                                <td>#{transaction.id}</td>
                                <td>
                                  <div>
                                    <strong>{transaction.user_name}</strong>
                                    <br />
                                    <small className="text-muted">{transaction.user_email}</small>
                                  </div>
                                </td>
                                <td>
                                  <div>
                                    <strong>{transaction.listing_title}</strong>
                                    <br />
                                    <small className="text-muted">ID: {transaction.listing_id}</small>
                                  </div>
                                </td>
                                <td>
                                  <Badge color="info" pill>
                                    {getTypeText(transaction.listing_type)}
                                  </Badge>
                                </td>
                                <td>
                                  <strong>{formatPrice(transaction.amount)}</strong>
                                </td>
                                <td>
                                  <Badge color={getStatusBadgeColor(transaction.status)} pill>
                                    {getStatusText(transaction.status)}
                                  </Badge>
                                </td>
                                <td>{formatDate(transaction.created_at)}</td>
                                <td>
                                  <div className="d-flex gap-2">
                                    <Button
                                      color="info"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTransaction(transaction);
                                        setDetailModal(true);
                                      }}
                                    >
                                      <i className="mdi mdi-eye"></i>
                                    </Button>
                                    <Button
                                      color="warning"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedTransaction(transaction);
                                        setNewStatus(transaction.status);
                                        setStatusModal(true);
                                      }}
                                    >
                                      <i className="mdi mdi-pencil"></i>
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <Row className="mt-4">
                          <Col>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                Sayfa {currentPage} / {totalPages}
                              </div>
                              <div>
                                <Button
                                  color="primary"
                                  size="sm"
                                  disabled={currentPage === 1}
                                  onClick={() => setCurrentPage(currentPage - 1)}
                                  className="me-2"
                                >
                                  Önceki
                                </Button>
                                <Button
                                  color="primary"
                                  size="sm"
                                  disabled={currentPage === totalPages}
                                  onClick={() => setCurrentPage(currentPage + 1)}
                                >
                                  Sonraki
                                </Button>
                              </div>
                            </div>
                          </Col>
                        </Row>
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Durum Güncelleme Modal */}
      <Modal isOpen={statusModal} toggle={() => setStatusModal(false)}>
        <ModalHeader toggle={() => setStatusModal(false)}>
          İşlem Durumunu Güncelle
        </ModalHeader>
        <ModalBody>
          {selectedTransaction && (
            <Form>
              <FormGroup>
                <Label>İşlem ID</Label>
                <Input type="text" value={`#${selectedTransaction.id}`} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Mevcut Durum</Label>
                <Input type="text" value={getStatusText(selectedTransaction.status)} disabled />
              </FormGroup>
              <FormGroup>
                <Label>Yeni Durum</Label>
                <Input
                  type="select"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                >
                  <option value="pending">Beklemede</option>
                  <option value="completed">Tamamlandı</option>
                  <option value="cancelled">İptal Edildi</option>
                  <option value="refunded">İade Edildi</option>
                </Input>
              </FormGroup>
            </Form>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setStatusModal(false)}>
            İptal
          </Button>
          <Button color="primary" onClick={updateTransactionStatus}>
            Güncelle
          </Button>
        </ModalFooter>
      </Modal>

      {/* Detay Modal */}
      <Modal isOpen={detailModal} toggle={() => setDetailModal(false)} size="lg">
        <ModalHeader toggle={() => setDetailModal(false)}>
          İşlem Detayları
        </ModalHeader>
        <ModalBody>
          {selectedTransaction && (
            <Row>
              <Col md={6}>
                <h6>İşlem Bilgileri</h6>
                <p><strong>ID:</strong> #{selectedTransaction.id}</p>
                <p><strong>Durum:</strong> 
                  <Badge color={getStatusBadgeColor(selectedTransaction.status)} className="ms-2">
                    {getStatusText(selectedTransaction.status)}
                  </Badge>
                </p>
                <p><strong>Tutar:</strong> {formatPrice(selectedTransaction.amount)}</p>
                <p><strong>Tarih:</strong> {formatDate(selectedTransaction.created_at)}</p>
              </Col>
              <Col md={6}>
                <h6>Kullanıcı Bilgileri</h6>
                <p><strong>Ad:</strong> {selectedTransaction.user_name}</p>
                <p><strong>E-posta:</strong> {selectedTransaction.user_email}</p>
                <p><strong>Telefon:</strong> {selectedTransaction.user_phone || 'Belirtilmemiş'}</p>
              </Col>
              <Col md={12}>
                <hr />
                <h6>İlan Bilgileri</h6>
                <p><strong>Başlık:</strong> {selectedTransaction.listing_title}</p>
                <p><strong>ID:</strong> {selectedTransaction.listing_id}</p>
                <p><strong>Tür:</strong> 
                  <Badge color="info" className="ms-2">
                    {getTypeText(selectedTransaction.listing_type)}
                  </Badge>
                </p>
              </Col>
            </Row>
          )}
        </ModalBody>
        <ModalFooter>
          <Button color="secondary" onClick={() => setDetailModal(false)}>
            Kapat
          </Button>
        </ModalFooter>
      </Modal>
    </React.Fragment>
  );
};

export default TransactionsManagement;