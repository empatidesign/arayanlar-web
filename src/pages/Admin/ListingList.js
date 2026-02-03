import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, CardBody, Table, Button, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Input, FormGroup, Label, Alert } from 'reactstrap';
import { get, put, del } from '../../helpers/api_helper';

const ListingList = () => {
  const [listings, setListings] = useState([]);
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
  const [rejectModal, setRejectModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [bulkApproveModal, setBulkApproveModal] = useState(false);
  const [selectedListings, setSelectedListings] = useState([]);
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    category: '',
    city: '',
    page: 1
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError('');
      
      let endpoint = '/api/listings';
      const params = new URLSearchParams();
      
      // Bekleyen ilanlar için admin endpoint kullan
      if (filters.status === 'pending') {
        endpoint = '/api/admin/listings/pending';
      } else {
        // Diğer durumlar için normal endpoint
        if (filters.status !== 'all') {
          params.append('status', filters.status);
        }
        if (filters.category) {
          params.append('category_id', filters.category);
        }
        if (filters.city) {
          params.append('city', filters.city);
        }
        params.append('page', filters.page);
        params.append('limit', pagination.limit);
        
        if (params.toString()) {
          endpoint += '?' + params.toString();
        }
      }
      
      const response = await get(endpoint);
      
      if (response.success) {
        setListings(response.data || []);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      } else {
        setError(response.message || 'İlanlar yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('İlanlar yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (listingId) => {
    try {
      setError('');
      setSuccess('');
      
      const response = await put(`/api/admin/listings/${listingId}/approve`);
      
      if (response.success) {
        setSuccess('İlan başarıyla onaylandı');
        fetchListings();
      } else {
        setError(response.message || 'İlan onaylanırken hata oluştu');
      }
    } catch (error) {
      setError('İlan onaylanırken hata oluştu');
    }
  };

  const handleReject = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await put(`/api/admin/listings/${selectedListing.id}/reject`, {
        rejection_reason: rejectionReason
      });
      
      if (response.success) {
        setSuccess('İlan başarıyla reddedildi');
        setRejectModal(false);
        setRejectionReason('');
        setSelectedListing(null);
        fetchListings();
      } else {
        setError(response.message || 'İlan reddedilirken hata oluştu');
      }
    } catch (error) {
      setError('İlan reddedilirken hata oluştu');
    }
  };

  const handleDelete = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await del(`/api/admin/listings/${selectedListing.id}`);
      
      if (response.success) {
        setSuccess('İlan başarıyla silindi');
        setDeleteModal(false);
        setSelectedListing(null);
        fetchListings();
      } else {
        setError(response.message || 'İlan silinirken hata oluştu');
      }
    } catch (error) {
      setError('İlan silinirken hata oluştu');
    }
  };

  const handleBulkApprove = async () => {
    try {
      setError('');
      setSuccess('');
      
      const response = await put('/api/admin/listings/bulk-approve', {
        listing_ids: selectedListings
      });
      
      if (response.success) {
        setSuccess(`${selectedListings.length} ilan başarıyla onaylandı`);
        setBulkApproveModal(false);
        setSelectedListings([]);
        fetchListings();
      } else {
        setError(response.message || 'Toplu onaylama yapılırken hata oluştu');
      }
    } catch (error) {
      setError('Toplu onaylama yapılırken hata oluştu');
    }
  };

  const handleSelectListing = (listingId) => {
    setSelectedListings(prev => {
      if (prev.includes(listingId)) {
        return prev.filter(id => id !== listingId);
      } else {
        return [...prev, listingId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedListings.length === listings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(listings.map(listing => listing.id));
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
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="page-content">
      <Container fluid>
        <Row>
          <Col xs="12">
            <div className="page-title-box d-sm-flex align-items-center justify-content-between">
              <h4 className="mb-sm-0 font-size-18">İlan Yönetimi</h4>
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
          <Col xs="12">
            <Card>
              <CardBody>
                {/* Filtreler */}
                <Row className="mb-3">
                  <Col md="3">
                    <FormGroup>
                      <Label>Durum</Label>
                      <Input
                        type="select"
                        value={filters.status}
                        onChange={(e) => setFilters({...filters, status: e.target.value, page: 1})}
                      >
                        <option value="all">Tümü</option>
                        <option value="pending">Bekleyen</option>
                        <option value="approved">Onaylanan</option>
                        <option value="rejected">Reddedilen</option>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Label>Şehir</Label>
                      <Input
                        type="text"
                        placeholder="Şehir ara..."
                        value={filters.city}
                        onChange={(e) => setFilters({...filters, city: e.target.value, page: 1})}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="3" className="d-flex align-items-end">
                    <Button color="primary" onClick={fetchListings} disabled={loading}>
                      {loading ? 'Yükleniyor...' : 'Filtrele'}
                    </Button>
                  </Col>
                  <Col md="3" className="d-flex align-items-end justify-content-end">
                    {selectedListings.length > 0 && (
                      <Button 
                        color="success" 
                        onClick={() => setBulkApproveModal(true)}
                      >
                        Seçilenleri Onayla ({selectedListings.length})
                      </Button>
                    )}
                  </Col>
                </Row>

                {/* İlan Tablosu */}
                <div className="table-responsive">
                  <Table className="table-nowrap mb-0">
                    <thead>
                      <tr>
                        <th>
                          <Input
                            type="checkbox"
                            checked={selectedListings.length === listings.length && listings.length > 0}
                            onChange={handleSelectAll}
                          />
                        </th>
                        <th>Resim</th>
                        <th>Başlık</th>
                        <th>Kategori</th>
                        <th>Fiyat</th>
                        <th>Konum</th>
                        <th>Kullanıcı</th>
                        <th>Durum</th>
                        <th>Tarih</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="10" className="text-center">Yükleniyor...</td>
                        </tr>
                      ) : listings.length === 0 ? (
                        <tr>
                          <td colSpan="10" className="text-center">İlan bulunamadı</td>
                        </tr>
                      ) : (
                        listings.map((listing) => (
                          <tr key={listing.id}>
                            <td>
                              <Input
                                type="checkbox"
                                checked={selectedListings.includes(listing.id)}
                                onChange={() => handleSelectListing(listing.id)}
                              />
                            </td>
                            <td>
                              {listing.main_image ? (
                                <img
                                  src={`${process.env.REACT_APP_API_URL}${listing.main_image}`}
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
                                  <i className="mdi mdi-image text-muted"></i>
                                </div>
                              )}
                            </td>
                            <td>
                              <div>
                                <h6 className="mb-1">{listing.title}</h6>
                                <p className="text-muted mb-0 small">
                                  {listing.description?.substring(0, 50)}...
                                </p>
                              </div>
                            </td>
                            <td>{listing.category_name}</td>
                            <td>{formatPrice(listing.price, listing.currency)}</td>
                            <td>{listing.location_city}</td>
                            <td>
                              <div>
                                <div>{listing.user_name}</div>
                                <small className="text-muted">{listing.user_email}</small>
                              </div>
                            </td>
                            <td>{getStatusBadge(listing.status)}</td>
                            <td>{formatDate(listing.created_at)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                {listing.status === 'pending' && (
                                  <>
                                    <Button
                                      color="success"
                                      size="sm"
                                      onClick={() => handleApprove(listing.id)}
                                    >
                                      <i className="mdi mdi-check"></i>
                                    </Button>
                                    <Button
                                      color="warning"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedListing(listing);
                                        setRejectModal(true);
                                      }}
                                    >
                                      <i className="mdi mdi-close"></i>
                                    </Button>
                                  </>
                                )}
                                {listing.status === 'approved' && (
                                  <Button
                                    color="warning"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedListing(listing);
                                      setRejectModal(true);
                                    }}
                                    title="İlanı İptal Et"
                                  >
                                    <i className="mdi mdi-cancel"></i>
                                  </Button>
                                )}
                                {listing.status === 'rejected' && (
                                  <Button
                                    color="success"
                                    size="sm"
                                    onClick={() => handleApprove(listing.id)}
                                    title="İlanı Yeniden Onayla"
                                  >
                                    <i className="mdi mdi-check"></i>
                                  </Button>
                                )}
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedListing(listing);
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

                {/* Sayfalama */}
                {pagination.pages > 1 && (
                  <Row className="mt-3">
                    <Col className="d-flex justify-content-center">
                      <div className="d-flex gap-2">
                        <Button
                          color="secondary"
                          size="sm"
                          disabled={pagination.page === 1}
                          onClick={() => setFilters({...filters, page: pagination.page - 1})}
                        >
                          Önceki
                        </Button>
                        <span className="align-self-center">
                          Sayfa {pagination.page} / {pagination.pages}
                        </span>
                        <Button
                          color="secondary"
                          size="sm"
                          disabled={pagination.page === pagination.pages}
                          onClick={() => setFilters({...filters, page: pagination.page + 1})}
                        >
                          Sonraki
                        </Button>
                      </div>
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Silme Modal */}
        <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
          <ModalHeader toggle={() => setDeleteModal(false)}>
            İlanı Sil
          </ModalHeader>
          <ModalBody>
            <p>Bu ilanı silmek istediğinizden emin misiniz?</p>
            {selectedListing && (
              <div className="alert alert-info">
                <strong>{selectedListing.title}</strong>
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

        {/* Reddetme/İptal Modal */}
        <Modal isOpen={rejectModal} toggle={() => setRejectModal(false)}>
          <ModalHeader toggle={() => setRejectModal(false)}>
            {selectedListing?.status === 'approved' ? 'İlanı İptal Et' : 'İlanı Reddet'}
          </ModalHeader>
          <ModalBody>
            <FormGroup>
              <Label>{selectedListing?.status === 'approved' ? 'İptal Sebebi' : 'Red Sebebi'}</Label>
              <Input
                type="textarea"
                rows="3"
                placeholder={selectedListing?.status === 'approved' ? 'İptal sebebini yazın...' : 'Red sebebini yazın...'}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </FormGroup>
            {selectedListing && (
              <div className="alert alert-info">
                <strong>{selectedListing.title}</strong>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setRejectModal(false)}>
              İptal
            </Button>
            <Button 
              color="warning" 
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              {selectedListing?.status === 'approved' ? 'İptal Et' : 'Reddet'}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Toplu Onaylama Modal */}
        <Modal isOpen={bulkApproveModal} toggle={() => setBulkApproveModal(false)}>
          <ModalHeader toggle={() => setBulkApproveModal(false)}>
            Toplu Onaylama
          </ModalHeader>
          <ModalBody>
            <p>Seçilen {selectedListings.length} ilanı onaylamak istediğinizden emin misiniz?</p>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setBulkApproveModal(false)}>
              İptal
            </Button>
            <Button color="success" onClick={handleBulkApprove}>
              Onayla
            </Button>
          </ModalFooter>
        </Modal>
      </Container>
    </div>
  );
};

export default ListingList;