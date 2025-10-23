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

const ReportsList = () => {
  // State yönetimi
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [limit] = useState(10);
  
  // Search ve filter state
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Modal state
  const [detailModal, setDetailModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [loadingChat, setLoadingChat] = useState(false);
  
  // Görsel önizleme modal state
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [imagePreviewCaption, setImagePreviewCaption] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    status: '',
    admin_notes: '',
    validity: '',
    action_taken: '',
    invalid_reason: ''
  });

  // API çağrıları için base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Chat resimleri için URL oluşturucu (admin erişimi)
  const buildChatImageUrl = (message) => {
    if (!message) return null;
    const authUser = localStorage.getItem('authUser');
    if (!authUser) return null;
    const user = JSON.parse(authUser);
    const token = user.data?.token || user.token || user.accessToken;
    if (!token) return null;
    const rawToken = token.startsWith('Bearer ') ? token.split(' ')[1] : token;

    // Öncelik: token tabanlı erişim (by-token)
    if (message.image_token && typeof message.image_token === 'string') {
      const t = encodeURIComponent(message.image_token);
      return `${API_BASE_URL}/api/chat/image/by-token?t=${t}&token=${rawToken}`;
    }

    // Geriye dönük: filename tabanlı erişim
    const messagePath = typeof message === 'string' ? message : message.message;
    if (!messagePath || typeof messagePath !== 'string') return null;
    const parts = messagePath.split('/');
    if (parts.length < 2 || parts[0] !== 'chat') return null;
    const filename = parts[1];
    return `${API_BASE_URL}/api/chat/image/${filename}?token=${rawToken}`;
  };

  // Görsel önizleme aç/kapat
  const openImagePreview = (message) => {
    const url = buildChatImageUrl(message);
    if (!url) return;
    setImagePreviewUrl(url);
    setImagePreviewCaption(message.caption || '');
    setImagePreviewOpen(true);
  };

  const closeImagePreview = () => {
    setImagePreviewOpen(false);
    setImagePreviewUrl(null);
    setImagePreviewCaption('');
  };

  // Şikayetleri getir
  const fetchReports = async () => {
    try {
      setLoading(true);
      
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(statusFilter && { status: statusFilter }),
        ...(categoryFilter && { category: categoryFilter })
      });

      const apiUrl = `${API_BASE_URL}/api/admin/reports?${queryParams}`;

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText || 'Şikayetler getirilemedi'}`);
      }

      const data = await response.json();
      
      setReports(data.data?.reports || []);
      setTotalPages(data.data?.pagination?.total_pages || 1);
      setTotalReports(data.data?.pagination?.total_items || 0);
      setError('');
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  // Şikayet durumunu güncelle
  const updateReportStatus = async () => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/reports/${selectedReport.id}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şikayet güncellenemedi');
      }

      setSuccess('Şikayet başarıyla güncellendi');
      setUpdateModal(false);
      
      // Listeyi yenile
      await fetchReports();
      
      // Eğer detay modalı açıksa, güncellenmiş şikayet bilgilerini al
      if (detailModal && selectedReport) {
        try {
          const updatedReportResponse = await fetch(`${API_BASE_URL}/api/admin/reports/${selectedReport.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (updatedReportResponse.ok) {
            const updatedReportData = await updatedReportResponse.json();
            setSelectedReport(updatedReportData.data);
          }
        } catch (error) {
          console.error('Güncellenmiş şikayet bilgileri alınamadı:', error);
        }
      }
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Güncelleme sırasında hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Şikayet sil
  const deleteReport = async () => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/reports/${selectedReport.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Şikayet silinemedi');
      }

      setSuccess('Şikayet başarıyla silindi');
      setDeleteModal(false);
      fetchReports();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Silme sırasında hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Şikayet detayını açma ve chat mesajlarını yükleme
  const openDetailModal = async (report) => {
    setSelectedReport(report);
    setDetailModal(true);
    
    // Chat mesajlarını backend'den çek
    if (report.reporter_user_id && report.reported_user_id) {
      setLoadingChat(true);
      try {
        const authUser = localStorage.getItem('authUser');
        if (!authUser) {
          console.error('Token bulunamadı');
          setChatMessages([]);
          return;
        }
        
        const user = JSON.parse(authUser);
        const token = user.data?.token || user.token || user.accessToken;
        
        if (!token) {
          console.error('Token bulunamadı');
          setChatMessages([]);
          return;
        }
        
        const response = await fetch(`${API_BASE_URL}/api/admin/reports/${report.id}/chat-messages`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setChatMessages(data.data || []);
        } else {
          const errorText = await response.text();
          console.error('Chat mesajları yüklenemedi:', response.status, errorText);
          setChatMessages([]);
        }
      } catch (error) {
        console.error('Chat mesajları yüklenirken hata:', error);
        setChatMessages([]);
      } finally {
        setLoadingChat(false);
      }
    }
  };

  // Update modal aç
  const openUpdateModal = (report) => {
    setSelectedReport(report);
    setFormData({
      status: report.status || '',
      admin_notes: report.admin_notes || '',
      validity: report.validity || '',
      action_taken: report.action_taken || '',
      invalid_reason: report.invalid_reason || ''
    });
    setUpdateModal(true);
  };

  // Delete modal aç
  const openDeleteModal = (report) => {
    setSelectedReport(report);
    setDeleteModal(true);
  };

  // Form input değişikliklerini handle et
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Filter değişikliklerini handle et
  const handleFilter = () => {
    setCurrentPage(1);
    fetchReports();
  };

  // Sayfa değişikliklerini handle et
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Durum badge rengi
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'reviewed': return 'info';
      case 'resolved': return 'success';
      case 'dismissed': return 'secondary';
      default: return 'light';
    }
  };

  // Kategori çevirisi
  const getCategoryText = (category) => {
    const categoryMap = {
      'spam': 'Spam/Reklam',
      'inappropriate_content': 'Uygunsuz İçerik',
      'harassment': 'Taciz/Zorbalık',
      'fake_profile': 'Sahte Profil',
      'fraud': 'Dolandırıcılık',
      'other': 'Diğer'
    };
    return categoryMap[category] || category;
  };

  // Durum çevirisi
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Beklemede',
      'reviewed': 'İncelendi',
      'resolved': 'Çözüldü',
      'dismissed': 'Reddedildi'
    };
    return statusMap[status] || status;
  };

  // Component mount olduğunda şikayetleri getir
  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  // Pagination render
  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <Button
          key={i}
          color={currentPage === i ? "primary" : "light"}
          size="sm"
          className="me-1"
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Button>
      );
    }
    return pages;
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Admin" breadcrumbItem="Şikayet Yönetimi" />
          
          {error && <Alert color="danger">{error}</Alert>}
          {success && <Alert color="success">{success}</Alert>}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4">Şikayet Yönetimi</CardTitle>
                  
                  {/* Filtreler */}
                  <Row className="mb-3">
                    <Col md={3}>
                      <Label>Durum Filtresi</Label>
                      <Input
                        type="select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        <option value="pending">Beklemede</option>
                        <option value="reviewed">İncelendi</option>
                        <option value="resolved">Çözüldü</option>
                        <option value="dismissed">Reddedildi</option>
                      </Input>
                    </Col>
                    <Col md={3}>
                      <Label>Kategori Filtresi</Label>
                      <Input
                        type="select"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="">Tümü</option>
                        <option value="spam">Spam/Reklam</option>
                        <option value="inappropriate_content">Uygunsuz İçerik</option>
                        <option value="harassment">Taciz/Zorbalık</option>
                        <option value="fake_profile">Sahte Profil</option>
                        <option value="fraud">Dolandırıcılık</option>
                        <option value="other">Diğer</option>
                      </Input>
                    </Col>
                    <Col md={2}>
                      <Label>&nbsp;</Label>
                      <div>
                        <Button color="primary" onClick={handleFilter}>
                          Filtrele
                        </Button>
                      </div>
                    </Col>
                  </Row>

                  {/* Tablo */}
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
                              <th>Şikayet Eden</th>
                              <th>Şikayet Edilen</th>
                              <th>Kategori</th>
                              <th>Durum</th>
                              <th>Tarih</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reports.map((report) => (
                              <tr key={report.id}>
                                <td>{report.id}</td>
                                <td>
                                  {report.reporter_name || 'Bilinmiyor'}
                                  <br />
                                  <small className="text-muted">ID: {report.reporter_user_id}</small>
                                </td>
                                <td>
                                  {report.reported_name || 'Bilinmiyor'}
                                  <br />
                                  <small className="text-muted">ID: {report.reported_user_id}</small>
                                </td>
                                <td>{getCategoryText(report.category)}</td>
                                <td>
                                  <Badge color={getStatusBadgeColor(report.status)}>
                                    {getStatusText(report.status)}
                                  </Badge>
                                </td>
                                <td>
                                  {new Date(report.created_at).toLocaleDateString('tr-TR')}
                                  <br />
                                  <small className="text-muted">
                                    {new Date(report.created_at).toLocaleTimeString('tr-TR')}
                                  </small>
                                </td>
                                <td>
                                  <Button
                                    color="info"
                                    size="sm"
                                    className="me-1"
                                    onClick={() => openDetailModal(report)}
                                    id={`detail-${report.id}`}
                                  >
                                    <i className="mdi mdi-eye"></i>
                                  </Button>
                                  <UncontrolledTooltip target={`detail-${report.id}`}>
                                    Detayları Görüntüle
                                  </UncontrolledTooltip>
                                  
                                  <Button
                                    color="warning"
                                    size="sm"
                                    className="me-1"
                                    onClick={() => openUpdateModal(report)}
                                    id={`update-${report.id}`}
                                  >
                                    <i className="mdi mdi-pencil"></i>
                                  </Button>
                                  <UncontrolledTooltip target={`update-${report.id}`}>
                                    Güncelle
                                  </UncontrolledTooltip>
                                  
                                  <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(report)}
                                    id={`delete-${report.id}`}
                                  >
                                    <i className="mdi mdi-delete"></i>
                                  </Button>
                                  <UncontrolledTooltip target={`delete-${report.id}`}>
                                    Sil
                                  </UncontrolledTooltip>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <Row className="mt-3">
                          <Col>
                            <div className="d-flex justify-content-between align-items-center">
                              <div>
                                Toplam {totalReports} şikayet, Sayfa {currentPage} / {totalPages}
                              </div>
                              <div>
                                {renderPagination()}
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

          {/* Detail Modal */}
          <Modal isOpen={detailModal} toggle={() => setDetailModal(false)} size="lg">
            <ModalHeader toggle={() => setDetailModal(false)}>
              Şikayet Detayları
            </ModalHeader>
            <ModalBody>
              {selectedReport && (
                <div>
                  <Row>
                    <Col md={6}>
                      <strong>Şikayet ID:</strong> {selectedReport.id}
                    </Col>
                    <Col md={6}>
                      <strong>Durum:</strong>{' '}
                      <Badge color={getStatusBadgeColor(selectedReport.status)}>
                        {getStatusText(selectedReport.status)}
                      </Badge>
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col md={6}>
                      <strong>Şikayet Eden:</strong><br />
                      {selectedReport.reporter_name || 'Bilinmiyor'}<br />
                      <small className="text-muted">ID: {selectedReport.reporter_user_id}</small>
                    </Col>
                    <Col md={6}>
                      <strong>Şikayet Edilen:</strong><br />
                      {selectedReport.reported_name || 'Bilinmiyor'}<br />
                      <small className="text-muted">ID: {selectedReport.reported_user_id}</small>
                    </Col>
                  </Row>
                  <hr />
                  <Row>
                    <Col md={6}>
                      <strong>Kategori:</strong> {getCategoryText(selectedReport.category)}
                    </Col>
                    <Col md={6}>
                      <strong>Tarih:</strong> {new Date(selectedReport.created_at).toLocaleString('tr-TR')}
                    </Col>
                  </Row>
                  <hr />
                  <div>
                    <strong>Açıklama:</strong>
                    <p className="mt-2">{selectedReport.description || 'Açıklama yok'}</p>
                  </div>
                  {selectedReport.chat_context && (
                    <div>
                      <strong>Sohbet Mesajları:</strong>
                      <div className="mt-2 p-3 bg-light rounded">
                        {loadingChat ? (
                          <div className="text-center py-3">
                            <Spinner size="sm" className="me-2" />
                            Sohbet mesajları yükleniyor...
                          </div>
                        ) : chatMessages.length > 0 ? (
                          <div className="chat-messages" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {chatMessages.map((message, index) => (
                              <div key={index} className={`message-item mb-3 p-2 rounded ${
                                message.sender_id === selectedReport.reporter_user_id 
                                  ? 'bg-primary text-white' 
                                  : 'bg-white border'
                              }`}>
                                <div className="d-flex justify-content-between align-items-start mb-1">
                                  <small className={`fw-bold ${
                                    message.sender_id === selectedReport.reporter_user_id 
                                      ? 'text-light' 
                                      : 'text-primary'
                                  }`}>
                                    {message.sender_id === selectedReport.reporter_user_id 
                                      ? `${selectedReport.reporter_name || 'Şikayet Eden'}` 
                                      : `${selectedReport.reported_name || 'Şikayet Edilen'}`}
                                  </small>
                                  <small className={`${
                                    message.sender_id === selectedReport.reporter_user_id 
                                      ? 'text-light' 
                                      : 'text-muted'
                                  }`}>
                                    {message.created_at ? new Date(message.created_at).toLocaleString('tr-TR') : ''}
                                  </small>
                                </div>
                                <div className="message-content">
                                  {message.message_type === 'image' ? (
                                    <div>
                                      {message.caption && <div className="mb-2">{message.caption}</div>}
                                      <div className="d-flex align-items-center">
                                        <Badge color="info" size="sm" onClick={() => openImagePreview(message)} style={{ cursor: 'pointer' }} title="Resmi görüntüle">
                                          <i className="mdi mdi-image me-1"></i>
                                          Resim
                                        </Badge>
                                        {(() => {
                                          const url = buildChatImageUrl(message);
                                          return url ? (
                                            <a href={url} target="_blank" rel="noopener noreferrer" className="ms-2">
                                              <i className="mdi mdi-image-search-outline me-1"></i>
                                              Görüntüle
                                            </a>
                                          ) : null;
                                        })()}
                                      </div>
                                      {(() => {
                                        return null;
                                      })()}
                                    </div>
                                  ) : (
                                    message.message || 'Mesaj içeriği bulunamadı'
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-muted py-3">
                            <i className="mdi mdi-message-alert-outline me-2"></i>
                            Bu şikayet için sohbet mesajları bulunamadı
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {selectedReport.admin_notes && (
                    <div>
                      <strong>Admin Notları:</strong>
                      <p className="mt-2">{selectedReport.admin_notes}</p>
                    </div>
                  )}
                  
                  {/* Doğrulama Bilgileri */}
                  <hr />
                  <div>
                    <h6 className="mb-3">Doğrulama Durumu</h6>
                    <Row>
                      <Col md={6}>
                        <strong>Geçerlilik:</strong>
                        {selectedReport.validity ? (
                          <div className="mt-1">
                            {selectedReport.validity === 'valid' && (
                              <Badge color="success">
                                <i className="mdi mdi-check-circle me-1"></i>
                                Geçerli Şikayet
                              </Badge>
                            )}
                            {selectedReport.validity === 'invalid' && (
                              <Badge color="danger">
                                <i className="mdi mdi-close-circle me-1"></i>
                                Geçersiz Şikayet
                              </Badge>
                            )}
                            {selectedReport.validity === 'needs_investigation' && (
                              <Badge color="warning">
                                <i className="mdi mdi-magnify me-1"></i>
                                İnceleme Gerekli
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <div className="mt-1">
                            <Badge color="secondary">Henüz Değerlendirilmedi</Badge>
                          </div>
                        )}
                      </Col>
                      <Col md={6}>
                        {selectedReport.action_taken && (
                          <div>
                            <strong>Alınan Aksiyon:</strong>
                            <div className="mt-1">
                              <Badge color="info">
                                {selectedReport.action_taken === 'warning_sent' && 'Uyarı Gönderildi'}
                                {selectedReport.action_taken === 'content_removed' && 'İçerik Kaldırıldı'}
                                {selectedReport.action_taken === 'user_suspended' && 'Kullanıcı Askıya Alındı'}
                                {selectedReport.action_taken === 'user_banned' && 'Kullanıcı Yasaklandı'}
                                {selectedReport.action_taken === 'no_action' && 'Aksiyon Alınmadı'}
                              </Badge>
                            </div>
                          </div>
                        )}
                        {selectedReport.invalid_reason && (
                          <div>
                            <strong>Geçersizlik Nedeni:</strong>
                            <div className="mt-1">
                              <Badge color="warning">
                                {selectedReport.invalid_reason === 'insufficient_evidence' && 'Yetersiz Kanıt'}
                                {selectedReport.invalid_reason === 'false_accusation' && 'Yanlış Suçlama'}
                                {selectedReport.invalid_reason === 'spam_report' && 'Spam Şikayet'}
                                {selectedReport.invalid_reason === 'misunderstanding' && 'Yanlış Anlama'}
                                {selectedReport.invalid_reason === 'resolved_privately' && 'Özel Olarak Çözüldü'}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </div>
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setDetailModal(false)}>
                Kapat
              </Button>
            </ModalFooter>
          </Modal>

          {/* Update Modal */}
          <Modal isOpen={updateModal} toggle={() => setUpdateModal(false)}>
            <ModalHeader toggle={() => setUpdateModal(false)}>
              Şikayet Güncelle
            </ModalHeader>
            <ModalBody>
              <Form>
                <FormGroup>
                  <Label for="status">Durum</Label>
                  <Input
                    type="select"
                    name="status"
                    id="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="pending">Beklemede</option>
                    <option value="investigating">İnceleniyor</option>
                    <option value="resolved">Çözüldü</option>
                    <option value="dismissed">Reddedildi</option>
                  </Input>
                </FormGroup>
                <FormGroup>
                  <Label for="admin_notes">Admin Notları</Label>
                  <Input
                    type="textarea"
                    name="admin_notes"
                    id="admin_notes"
                    rows="4"
                    value={formData.admin_notes}
                    onChange={handleInputChange}
                    placeholder="Şikayet değerlendirme notlarını, alınan aksiyonları ve kararın gerekçesini buraya yazın..."
                  />
                </FormGroup>
                
                {/* Şikayet Doğrulama Bölümü */}
                <div className="border-top pt-3 mt-3">
                  <h6 className="mb-3">Şikayet Doğrulama</h6>
                  <FormGroup>
                    <Label>Şikayet Geçerliliği</Label>
                    <div>
                      <div className="form-check form-check-inline">
                        <Input
                          className="form-check-input"
                          type="radio"
                          name="validity"
                          id="valid"
                          value="valid"
                          checked={formData.validity === 'valid'}
                          onChange={handleInputChange}
                        />
                        <Label className="form-check-label text-success" for="valid">
                          <i className="mdi mdi-check-circle me-1"></i>
                          Geçerli Şikayet
                        </Label>
                      </div>
                      <div className="form-check form-check-inline">
                        <Input
                          className="form-check-input"
                          type="radio"
                          name="validity"
                          id="invalid"
                          value="invalid"
                          checked={formData.validity === 'invalid'}
                          onChange={handleInputChange}
                        />
                        <Label className="form-check-label text-danger" for="invalid">
                          <i className="mdi mdi-close-circle me-1"></i>
                          Geçersiz Şikayet
                        </Label>
                      </div>
                      <div className="form-check form-check-inline">
                        <Input
                          className="form-check-input"
                          type="radio"
                          name="validity"
                          id="needs_investigation"
                          value="needs_investigation"
                          checked={formData.validity === 'needs_investigation'}
                          onChange={handleInputChange}
                        />
                        <Label className="form-check-label text-warning" for="needs_investigation">
                          <i className="mdi mdi-magnify me-1"></i>
                          Daha Fazla İnceleme Gerekli
                        </Label>
                      </div>
                    </div>
                  </FormGroup>
                  
                  {formData.validity === 'valid' && (
                    <FormGroup>
                      <Label>Alınan Aksiyon</Label>
                      <Input
                        type="select"
                        name="action_taken"
                        value={formData.action_taken || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Aksiyon Seçin</option>
                        <option value="warning_sent">Kullanıcıya Uyarı Gönderildi</option>
                        <option value="content_removed">İçerik Kaldırıldı</option>
                        <option value="user_suspended">Kullanıcı Askıya Alındı</option>
                        <option value="user_banned">Kullanıcı Yasaklandı</option>
                        <option value="no_action">Herhangi Bir Aksiyon Alınmadı</option>
                      </Input>
                    </FormGroup>
                  )}
                  
                  {formData.validity === 'invalid' && (
                    <FormGroup>
                      <Label>Geçersizlik Nedeni</Label>
                      <Input
                        type="select"
                        name="invalid_reason"
                        value={formData.invalid_reason || ''}
                        onChange={handleInputChange}
                      >
                        <option value="">Neden Seçin</option>
                        <option value="insufficient_evidence">Yetersiz Kanıt</option>
                        <option value="false_accusation">Yanlış Suçlama</option>
                        <option value="spam_report">Spam Şikayet</option>
                        <option value="misunderstanding">Yanlış Anlama</option>
                        <option value="resolved_privately">Özel Olarak Çözüldü</option>
                      </Input>
                    </FormGroup>
                  )}
                </div>
              </Form>
            </ModalBody>
            <ModalFooter>
              <Button color="primary" onClick={updateReportStatus}>
                Güncelle
              </Button>
              <Button color="secondary" onClick={() => setUpdateModal(false)}>
                İptal
              </Button>
            </ModalFooter>
          </Modal>

          {/* Delete Modal */}
          <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
            <ModalHeader toggle={() => setDeleteModal(false)}>
              Şikayet Sil
            </ModalHeader>
            <ModalBody>
              Bu şikayeti silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </ModalBody>
            <ModalFooter>
              <Button color="danger" onClick={deleteReport}>
                Sil
              </Button>
              <Button color="secondary" onClick={() => setDeleteModal(false)}>
                İptal
              </Button>
            </ModalFooter>
          </Modal>

          {/* Image Preview Modal */}
          <Modal isOpen={imagePreviewOpen} toggle={closeImagePreview}>
            <ModalHeader toggle={closeImagePreview}>Resim Önizleme</ModalHeader>
            <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
              {imagePreviewUrl ? (
                <img src={imagePreviewUrl} alt="Sohbet resmi" style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 8 }} />
              ) : (
                <div className="text-muted">Resim yüklenemedi</div>
              )}
              {imagePreviewCaption && (
                <div className="mt-2 text-muted">{imagePreviewCaption}</div>
              )}
            </ModalBody>
          </Modal>

        </Container>
      </div>
    </React.Fragment>
  );
};

export default ReportsList;