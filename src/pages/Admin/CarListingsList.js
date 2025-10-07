import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, patch, del } from "../../helpers/backend_helper";

const CarListingsList = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  
  // Filter states
  const [filters, setFilters] = useState({
    status: '',
    brand: '',
    search: '',
    page: 1
  });
  
  // Modal states
  const [rejectModal, setRejectModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectLoading, setRejectLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Alert state
  const [alert, setAlert] = useState({ show: false, message: '', color: 'success' });

  // Breadcrumb
  document.title = "Araba İlanları Yönetimi | Arayanvar Admin";

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.search) params.append('search', filters.search);
      params.append('page', filters.page);
      params.append('limit', pagination.limit);
      
      const queryString = params.toString();
      const endpoint = `/api/cars/admin/listings${queryString ? '?' + queryString : ''}`;
      
      const response = await get(endpoint);
      
      if (response.success) {
        setListings(response.data?.listings || []);
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
        }
      } else {
        showAlert(response.message || 'İlanlar yüklenirken hata oluştu', 'danger');
      }
    } catch (error) {
      console.error('İlanlar yüklenirken hata:', error);
      showAlert('İlanlar yüklenirken hata oluştu', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message, color = 'success') => {
    setAlert({ show: true, message, color });
    setTimeout(() => {
      setAlert({ show: false, message: '', color: 'success' });
    }, 5000);
  };

  const handleApprove = async (listingId) => {
    try {
      const response = await patch(`/api/cars/admin/listings/${listingId}/approve`);
      
      if (response.success) {
        showAlert('İlan başarıyla onaylandı', 'success');
        fetchListings();
      } else {
        showAlert(response.message || 'İlan onaylanırken hata oluştu', 'danger');
      }
    } catch (error) {
      console.error('İlan onaylanırken hata:', error);
      showAlert('İlan onaylanırken hata oluştu', 'danger');
    }
  };

  const handleRevertToPending = async (listingId) => {
    try {
      const response = await patch(`/api/cars/admin/listings/${listingId}/revert-to-pending`);
      
      if (response.success) {
        showAlert('İlan durumu beklemede olarak değiştirildi', 'success');
        fetchListings();
      } else {
        showAlert(response.message || 'İlan durumu değiştirilirken hata oluştu', 'danger');
      }
    } catch (error) {
      console.error('İlan durumu değiştirilirken hata:', error);
      showAlert('İlan durumu değiştirilirken hata oluştu', 'danger');
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      showAlert('Reddetme sebebi yazmalısınız', 'warning');
      return;
    }

    try {
      setRejectLoading(true);
      
      const response = await patch(`/api/cars/admin/listings/${selectedListing.id}/reject`, {
        rejection_reason: rejectionReason
      });
      
      if (response.success) {
        showAlert('İlan başarıyla reddedildi', 'success');
        setRejectModal(false);
        setRejectionReason('');
        setSelectedListing(null);
        fetchListings();
      } else {
        showAlert(response.message || 'İlan reddedilirken hata oluştu', 'danger');
      }
    } catch (error) {
      console.error('İlan reddedilirken hata:', error);
      showAlert('İlan reddedilirken hata oluştu', 'danger');
    } finally {
      setRejectLoading(false);
    }
  };

  const openRejectModal = (listing) => {
    setSelectedListing(listing);
    setRejectionReason('');
    setRejectModal(true);
  };

  const openDetailModal = (listing) => {
    setSelectedListing(listing);
    setDetailModal(true);
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      
      const response = await del(`/api/cars/admin/listings/${selectedListing.id}`);
      
      if (response.success) {
        showAlert('İlan başarıyla silindi', 'success');
        setDeleteModal(false);
        setSelectedListing(null);
        fetchListings();
      } else {
        showAlert(response.message || 'İlan silinirken hata oluştu', 'danger');
      }
    } catch (error) {
      console.error('İlan silinirken hata:', error);
      showAlert('İlan silinirken hata oluştu', 'danger');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openDeleteModal = (listing) => {
    setSelectedListing(listing);
    setDeleteModal(true);
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

  const formatPrice = (price, currency) => {
    return new Intl.NumberFormat('tr-TR').format(price) + ' ' + (currency || 'TL');
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRemainingTime = (expiresAt, status) => {
    if (!expiresAt || status !== 'approved') return '-';
    
    const now = new Date();
    const expireDate = new Date(expiresAt);
    const diffTime = expireDate - now;
    
    if (diffTime <= 0) {
      return <span className="text-danger">Süresi Dolmuş</span>;
    }
    
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return <span className="text-warning">1 Gün</span>;
    } else if (diffDays <= 3) {
      return <span className="text-warning">{diffDays} Gün</span>;
    } else {
      return <span className="text-success">{diffDays} Gün</span>;
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset page when filter changes
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Admin" breadcrumbItem="Araba İlanları" />
          
          {alert.show && (
            <Alert color={alert.color} className="mb-3" fade={false}>
              {alert.message}
            </Alert>
          )}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h4 className="card-title">Araba İlanları Yönetimi</h4>
                  </div>

                  {/* Filters */}
                  <Row className="mb-3">
                    <Col md={3}>
                      <FormGroup>
                        <Label>Durum</Label>
                        <Input
                          type="select"
                          value={filters.status}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                          <option value="">Tümü</option>
                          <option value="pending">Bekliyor</option>
                          <option value="approved">Onaylandı</option>
                          <option value="rejected">Reddedildi</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label>Marka</Label>
                        <Input
                          type="text"
                          placeholder="Marka ara..."
                          value={filters.brand}
                          onChange={(e) => handleFilterChange('brand', e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={4}>
                      <FormGroup>
                        <Label>Arama</Label>
                        <Input
                          type="text"
                          placeholder="Başlık veya açıklama ara..."
                          value={filters.search}
                          onChange={(e) => handleFilterChange('search', e.target.value)}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <Label>&nbsp;</Label>
                        <div>
                          <Button color="primary" onClick={fetchListings}>
                            <i className="mdi mdi-refresh me-1"></i>
                            Yenile
                          </Button>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Yükleniyor...</span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="table-responsive">
                        <Table className="table-nowrap mb-0">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Resim</th>
                              <th>Başlık</th>
                              <th>Marka/Model</th>
                              <th>Fiyat</th>
                              <th>Şehir</th>
                              <th>Durum</th>
                              <th>Kalan Süre</th>
                              <th>Kullanıcı</th>
                              <th>Tarih</th>
                              <th>İşlemler</th>
                            </tr>
                          </thead>
                          <tbody>
                            {listings.length > 0 ? (
                              listings.map((listing) => (
                                <tr key={listing.id}>
                                  <td>{listing.id}</td>
                                  <td>
                                    {listing.main_image ? (
                                      <img
                                        src={listing.main_image}
                                        alt={listing.title}
                                        style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                      />
                                    ) : (
                                      <div 
                                        style={{ 
                                          width: '50px', 
                                          height: '50px', 
                                          backgroundColor: '#f8f9fa', 
                                          display: 'flex', 
                                          alignItems: 'center', 
                                          justifyContent: 'center',
                                          borderRadius: '4px'
                                        }}
                                      >
                                        <i className="mdi mdi-car text-muted"></i>
                                      </div>
                                    )}
                                  </td>
                                  <td>
                                    <div style={{ maxWidth: '200px' }}>
                                      <div className="text-truncate fw-medium">{listing.title}</div>
                                      <small className="text-muted">{listing.model_year} • {listing.km} km</small>
                                    </div>
                                  </td>
                                  <td>
                                    <div>
                                      <div className="fw-medium">{listing.brand_name}</div>
                                      <small className="text-muted">{listing.product_name}</small>
                                    </div>
                                  </td>
                                  <td>
                                    <span className="fw-medium text-success">
                                      {formatPrice(listing.price, listing.currency)}
                                    </span>
                                  </td>
                                  <td>{listing.location_city}</td>
                                  <td>{getStatusBadge(listing.status)}</td>
                                  <td>{formatRemainingTime(listing.expires_at, listing.status)}</td>
                                  <td>
                                    <div>
                                      <div className="fw-medium">{listing.user_name} {listing.user_surname}</div>
                                      <small className="text-muted">{listing.user_email}</small>
                                    </div>
                                  </td>
                                  <td>{formatDate(listing.created_at)}</td>
                                  <td>
                                    <div className="d-flex gap-1">
                                      <Button
                                        color="info"
                                        size="sm"
                                        onClick={() => openDetailModal(listing)}
                                        id={`detail-${listing.id}`}
                                      >
                                        <i className="mdi mdi-eye"></i>
                                      </Button>
                                      <UncontrolledTooltip placement="top" target={`detail-${listing.id}`}>
                                        Detayları Görüntüle
                                      </UncontrolledTooltip>

                                      {listing.status === 'pending' && (
                                        <>
                                          <Button
                                            color="success"
                                            size="sm"
                                            onClick={() => handleApprove(listing.id)}
                                            id={`approve-${listing.id}`}
                                          >
                                            <i className="mdi mdi-check"></i>
                                          </Button>
                                          <UncontrolledTooltip placement="top" target={`approve-${listing.id}`}>
                                            Onayla
                                          </UncontrolledTooltip>

                                          <Button
                                            color="danger"
                                            size="sm"
                                            onClick={() => openRejectModal(listing)}
                                            id={`reject-${listing.id}`}
                                          >
                                            <i className="mdi mdi-close"></i>
                                          </Button>
                                          <UncontrolledTooltip placement="top" target={`reject-${listing.id}`}>
                                            Reddet
                                          </UncontrolledTooltip>
                                        </>
                                      )}

                                      {listing.status === 'approved' && (
                                        <>
                                          <Button
                                            color="danger"
                                            size="sm"
                                            onClick={() => openRejectModal(listing)}
                                            id={`reject-approved-${listing.id}`}
                                          >
                                            <i className="mdi mdi-close"></i>
                                          </Button>
                                          <UncontrolledTooltip placement="top" target={`reject-approved-${listing.id}`}>
                                            Reddet
                                          </UncontrolledTooltip>
                                        </>
                                      )}

                                      {listing.status === 'rejected' && (
                                        <>
                                          <Button
                                            color="success"
                                            size="sm"
                                            onClick={() => handleApprove(listing.id)}
                                            id={`approve-rejected-${listing.id}`}
                                          >
                                            <i className="mdi mdi-check"></i>
                                          </Button>
                                          <UncontrolledTooltip placement="top" target={`approve-rejected-${listing.id}`}>
                                            Onayla
                                          </UncontrolledTooltip>
                                        </>
                                      )}

                                      <Button
                                        color="dark"
                                        size="sm"
                                        onClick={() => openDeleteModal(listing)}
                                        id={`delete-${listing.id}`}
                                      >
                                        <i className="mdi mdi-delete"></i>
                                      </Button>
                                      <UncontrolledTooltip placement="top" target={`delete-${listing.id}`}>
                                        Sil
                                      </UncontrolledTooltip>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="10" className="text-center">
                                  Henüz ilan bulunmuyor
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </Table>
                      </div>

                      {/* Pagination */}
                      {pagination.pages > 1 && (
                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <div>
                            <small className="text-muted">
                              Toplam {pagination.total} kayıt, Sayfa {pagination.page} / {pagination.pages}
                            </small>
                          </div>
                          <div>
                            <Button
                              color="primary"
                              size="sm"
                              disabled={pagination.page <= 1}
                              onClick={() => handlePageChange(pagination.page - 1)}
                            >
                              Önceki
                            </Button>
                            <span className="mx-2">
                              {pagination.page} / {pagination.pages}
                            </span>
                            <Button
                              color="primary"
                              size="sm"
                              disabled={pagination.page >= pagination.pages}
                              onClick={() => handlePageChange(pagination.page + 1)}
                            >
                              Sonraki
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Reddetme Modal */}
          <Modal isOpen={rejectModal} toggle={() => setRejectModal(!rejectModal)}>
            <ModalHeader toggle={() => setRejectModal(!rejectModal)}>
              İlanı Reddet
            </ModalHeader>
            <ModalBody>
              <p>
                <strong>{selectedListing?.title}</strong> adlı ilanı reddetmek istediğinizden emin misiniz?
              </p>
              <FormGroup>
                <Label for="rejectionReason">Reddetme Sebebi *</Label>
                <Input
                  type="textarea"
                  id="rejectionReason"
                  rows="4"
                  placeholder="Reddetme sebebini yazın..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setRejectModal(false)}>
                İptal
              </Button>
              <Button 
                color="danger" 
                onClick={handleRejectSubmit}
                disabled={rejectLoading || !rejectionReason.trim()}
              >
                {rejectLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    Reddediliyor...
                  </>
                ) : (
                  'Reddet'
                )}
              </Button>
            </ModalFooter>
          </Modal>

          {/* Detay Modal */}
          <Modal isOpen={detailModal} toggle={() => setDetailModal(!detailModal)} size="lg">
            <ModalHeader toggle={() => setDetailModal(!detailModal)}>
              İlan Detayları
            </ModalHeader>
            <ModalBody>
              {selectedListing && (
                <div>
                  <Row>
                    <Col md={6}>
                      {selectedListing.main_image && (
                        <img
                          src={selectedListing.main_image}
                          alt={selectedListing.title}
                          className="img-fluid rounded mb-3"
                          style={{ maxHeight: '300px', width: '100%', objectFit: 'cover' }}
                        />
                      )}
                    </Col>
                    <Col md={6}>
                      <h5>{selectedListing.title}</h5>
                      <p><strong>Fiyat:</strong> {formatPrice(selectedListing.price, selectedListing.currency)}</p>
                      <p><strong>Marka:</strong> {selectedListing.brand_name}</p>
                      <p><strong>Model:</strong> {selectedListing.product_name}</p>
                      <p><strong>Model Yılı:</strong> {selectedListing.model_year}</p>
                      <p><strong>KM:</strong> {selectedListing.km?.toLocaleString('tr-TR')}</p>
                      <p><strong>Motor Hacmi:</strong> {selectedListing.engine_size}</p>
                      <p><strong>Şehir:</strong> {selectedListing.location_city}</p>
                      <p><strong>Durum:</strong> {getStatusBadge(selectedListing.status)}</p>
                      <p><strong>Oluşturulma:</strong> {formatDate(selectedListing.created_at)}</p>
                    </Col>
                  </Row>
                  
                  {selectedListing.description && (
                    <div className="mt-3">
                      <h6>Açıklama:</h6>
                      <p>{selectedListing.description}</p>
                    </div>
                  )}

                  {selectedListing.rejection_reason && (
                    <div className="mt-3">
                      <h6>Reddetme Sebebi:</h6>
                      <div className="alert alert-danger">
                        {selectedListing.rejection_reason}
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <h6>İletişim Bilgileri:</h6>
                    <p><strong>Kullanıcı:</strong> {selectedListing.user_name} {selectedListing.user_surname}</p>
                    <p><strong>E-posta:</strong> {selectedListing.user_email}</p>
                    {selectedListing.contact_phone && (
                      <p><strong>Telefon:</strong> {selectedListing.contact_phone}</p>
                    )}
                    {selectedListing.contact_whatsapp && (
                      <p><strong>WhatsApp:</strong> {selectedListing.contact_whatsapp}</p>
                    )}
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

          {/* Silme Modal */}
          <Modal isOpen={deleteModal} toggle={() => setDeleteModal(!deleteModal)}>
            <ModalHeader toggle={() => setDeleteModal(!deleteModal)}>
              <i className="mdi mdi-alert-circle-outline text-warning me-2"></i>
              İlan Silme Onayı
            </ModalHeader>
            <ModalBody>
              <div className="text-center">
                <i className="mdi mdi-alert-circle-outline text-warning" style={{ fontSize: '48px' }}></i>
                <h5 className="mt-3 mb-3">Bu işlem geri alınamaz!</h5>
                <p className="text-muted">
                  Aşağıdaki ilanı kalıcı olarak silmek istediğinizden emin misiniz?
                </p>
                
                {selectedListing && (
                  <div className="alert alert-light mt-3">
                    <div className="d-flex align-items-center">
                      {selectedListing.main_image && (
                        <img
                          src={selectedListing.main_image}
                          alt={selectedListing.title}
                          style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }}
                          className="me-3"
                        />
                      )}
                      <div className="text-start">
                        <div className="fw-bold">{selectedListing.title}</div>
                        <div className="text-muted small">
                          {selectedListing.brand_name} {selectedListing.product_name} • {formatPrice(selectedListing.price, selectedListing.currency)}
                        </div>
                        <div className="text-muted small">
                          {selectedListing.user_name} {selectedListing.user_surname}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button 
                color="secondary" 
                onClick={() => setDeleteModal(false)}
                disabled={deleteLoading}
              >
                İptal
              </Button>
              <Button 
                color="danger" 
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <>
                    <i className="mdi mdi-loading mdi-spin me-1"></i>
                    Siliniyor...
                  </>
                ) : (
                  <>
                    <i className="mdi mdi-delete me-1"></i>
                    Sil
                  </>
                )}
              </Button>
            </ModalFooter>
          </Modal>
        </div>
      </div>
    </React.Fragment>
  );
};

export default CarListingsList;