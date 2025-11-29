import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, UncontrolledTooltip } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, patch, del } from "../../helpers/backend_helper";

const HousingListingsList = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Modal states
  const [approveModal, setApproveModal] = useState(false);
  const [rejectModal, setRejectModal] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [reapproveModal, setReapproveModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [extendDurationModal, setExtendDurationModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [cancellationReason, setCancellationReason] = useState("");

  // Filter states
  const [filters, setFilters] = useState({
    status: "all",
    property_type: "",
    province: "",
    district: "",
    page: 1
  });

  useEffect(() => {
    fetchListings();
  }, [filters]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      setError("");
      
      const queryParams = new URLSearchParams();
      if (filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.property_type) queryParams.append("property_type", filters.property_type);
      if (filters.province) queryParams.append("province", filters.province);
      if (filters.district) queryParams.append("district", filters.district);
      queryParams.append("page", filters.page);
      queryParams.append("limit", pagination.limit);

      const response = await get(`/api/housing/admin/listings?${queryParams.toString()}`);
      
      if (response.success) {
        setListings(response.data.listings || []);
        setPagination(prev => ({
          ...prev,
          page: response.data.pagination?.page || 1,
          total: response.data.pagination?.total || 0,
          pages: response.data.pagination?.pages || 1
        }));
      } else {
        setError(response.message || "Konut ilanları yüklenirken hata oluştu");
      }
    } catch (error) {
      console.error("Konut ilanları yüklenirken hata:", error);
      setError("Konut ilanları yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedListing) return;

    try {
      setLoading(true);
      const response = await patch(`/api/housing/admin/listings/${selectedListing.id}/approve`);
      
      if (response.success) {
        setSuccess("Konut ilanı başarıyla onaylandı");
        setApproveModal(false);
        setSelectedListing(null);
        fetchListings();
      } else {
        setError(response.message || "İlan onaylanırken hata oluştu");
      }
    } catch (error) {
      console.error("İlan onaylanırken hata:", error);
      setError("İlan onaylanırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedListing || !rejectionReason.trim()) {
      setError("Lütfen red nedeni belirtin");
      return;
    }

    try {
      setLoading(true);
      const response = await patch(`/api/housing/admin/listings/${selectedListing.id}/reject`, {
        rejection_reason: rejectionReason
      });
      
      if (response.success) {
        setSuccess("Konut ilanı başarıyla reddedildi");
        setRejectModal(false);
        setSelectedListing(null);
        setRejectionReason("");
        fetchListings();
      } else {
        setError(response.message || "İlan reddedilirken hata oluştu");
      }
    } catch (error) {
      console.error("İlan reddedilirken hata:", error);
      setError("İlan reddedilirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!selectedListing) return;

    try {
      setLoading(true);
      const response = await patch(`/api/housing/admin/listings/${selectedListing.id}/cancel`, {
        cancellation_reason: cancellationReason || 'Admin tarafından iptal edildi'
      });
      
      if (response.success) {
        setSuccess("Konut ilanı başarıyla iptal edildi");
        setCancelModal(false);
        setSelectedListing(null);
        setCancellationReason("");
        fetchListings();
      } else {
        setError(response.message || "İlan iptal edilirken hata oluştu");
      }
    } catch (error) {
      console.error("İlan iptal edilirken hata:", error);
      setError("İlan iptal edilirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleReapprove = async () => {
    if (!selectedListing) return;

    try {
      setLoading(true);
      const response = await patch(`/api/housing/admin/listings/${selectedListing.id}/reapprove`);
      
      if (response.success) {
        setSuccess("Konut ilanı başarıyla tekrar onaylandı");
        setReapproveModal(false);
        setSelectedListing(null);
        fetchListings();
      } else {
        setError(response.message || "İlan tekrar onaylanırken hata oluştu");
      }
    } catch (error) {
      console.error("İlan tekrar onaylanırken hata:", error);
      setError("İlan tekrar onaylanırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedListing) return;

    try {
      setLoading(true);
      const response = await del(`/api/housing/admin/listings/${selectedListing.id}`);
      
      if (response.success) {
        setSuccess("Konut ilanı başarıyla silindi");
        setDeleteModal(false);
        setSelectedListing(null);
        fetchListings();
      } else {
        setError(response.message || "İlan silinirken hata oluştu");
      }
    } catch (error) {
      console.error("İlan silinirken hata:", error);
      setError("İlan silinirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const handleExtendDuration = async () => {
    if (!selectedListing) return;

    try {
      setLoading(true);
      const response = await patch(`/api/housing/admin/listings/${selectedListing.id}/extend-duration`);
      
      if (response.success) {
        setSuccess("Konut ilanı süresi başarıyla uzatıldı (7 gün eklendi)");
        setExtendDurationModal(false);
        setSelectedListing(null);
        fetchListings();
      } else {
        setError(response.message || "İlan süresi uzatılırken hata oluştu");
      }
    } catch (error) {
      console.error("İlan süresi uzatılırken hata:", error);
      setError("İlan süresi uzatılırken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "approved":
        return <Badge color="success">Onaylandı</Badge>;
      case "rejected":
        return <Badge color="danger">Reddedildi</Badge>;
      case "cancelled":
        return <Badge color="warning">İptal Edildi</Badge>;
      case "pending":
        return <Badge color="warning">Bekliyor</Badge>;
      case "expired":
        return <Badge color="secondary">Süresi Doldu</Badge>;
      case "deleted":
        return <Badge color="dark">Silindi</Badge>;
      default:
        return <Badge color="secondary">{status}</Badge>;
    }
  };

  const formatPrice = (price, currency = "TL") => {
    if (!price) return "Belirtilmemiş";
    return new Intl.NumberFormat("tr-TR").format(price) + " " + currency;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Belirtilmemiş";
    return new Date(dateString).toLocaleDateString("tr-TR");
  };

  // Kalan süreyi hesapla ve formatla (expires_at alanını kullan)
  const formatRemainingTime = (expiresAt, status) => {
    if (!expiresAt || status !== 'approved') {
      return status === 'pending' ? 'Onay Bekliyor' : '-';
    }

    const now = new Date();
    const expireDate = new Date(expiresAt);
    const diffTime = expireDate - now;

    if (diffTime <= 0) {
      return <span className="text-danger fw-medium">Süresi Doldu</span>;
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));

    if (diffDays > 1) {
      return <span className="text-success fw-medium">{diffDays} gün</span>;
    } else if (diffHours > 1) {
      return <span className="text-warning fw-medium">{diffHours} saat</span>;
    } else {
      const diffMinutes = Math.ceil(diffTime / (1000 * 60));
      return <span className="text-danger fw-medium">{diffMinutes} dakika</span>;
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${process.env.REACT_APP_API_URL}${imagePath}`;
  };

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Konut İlanları" breadcrumbItem="Konut İlanları Yönetimi" />

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
                <div className="d-flex flex-wrap align-items-center mb-4">
                  <h5 className="card-title mb-0">Konut İlanları Listesi</h5>
                  <div className="ms-auto">
                    <Button color="primary" onClick={fetchListings} disabled={loading}>
                      <i className="mdi mdi-refresh me-1"></i>
                      {loading ? "Yükleniyor..." : "Yenile"}
                    </Button>
                  </div>
                </div>

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
                         <option value="cancelled">İptal Edilenler</option>
                       </Input>
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Label>Konut/Ticari Tipi</Label>
                      <Input
                        type="select"
                        value={filters.property_type}
                        onChange={(e) => setFilters({...filters, property_type: e.target.value, page: 1})}
                      >
                        <option value="">Tümü</option>
                        <optgroup label="Konut">
                          <option value="DAİRE">Daire</option>
                          <option value="VİLLA">Villa</option>
                        </optgroup>
                        <optgroup label="Ticari">
                          <option value="DÜKKAN">Dükkan</option>
                          <option value="OFİS">Ofis</option>
                          <option value="FABRİKA">Fabrika</option>
                          <option value="DEPO">Depo</option>
                          <option value="ATÖLYE">Atölye</option>
                          <option value="İMALATHANE">İmalathane</option>
                        </optgroup>
                      </Input>
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Label>İl</Label>
                      <Input
                        type="text"
                        placeholder="İl ara..."
                        value={filters.province}
                        onChange={(e) => setFilters({...filters, province: e.target.value, page: 1})}
                      />
                    </FormGroup>
                  </Col>
                  <Col md="3">
                    <FormGroup>
                      <Label>İlçe</Label>
                      <Input
                        type="text"
                        placeholder="İlçe ara..."
                        value={filters.district}
                        onChange={(e) => setFilters({...filters, district: e.target.value, page: 1})}
                      />
                    </FormGroup>
                  </Col>
                </Row>

                {/* Konut İlanları Tablosu */}
                <div className="table-responsive">
                  <Table className="table-nowrap mb-0">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Resim</th>
                        <th>Başlık</th>
                        <th>Konut Tipi</th>
                        <th>Oda Sayısı</th>
                        <th>Fiyat</th>
                        <th>Konum</th>
                        <th>Kullanıcı</th>
                        <th>Durum</th>
                        <th>Kalan Süre</th>
                        <th>Tarih</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="12" className="text-center">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Yükleniyor...</span>
                            </div>
                          </td>
                        </tr>
                      ) : listings.length === 0 ? (
                        <tr>
                          <td colSpan="12" className="text-center">Konut ilanı bulunamadı</td>
                        </tr>
                      ) : (
                        listings.map((listing) => (
                          <tr key={listing.id}>
                            <td>{listing.id}</td>
                            <td>
                              {listing.main_image ? (
                                <img
                                  src={getImageUrl(listing.main_image)}
                                  alt={listing.title}
                                  style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
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
                                    borderRadius: '4px',
                                    border: '1px solid #dee2e6'
                                  }}
                                >
                                  <i className="mdi mdi-image text-muted"></i>
                                </div>
                              )}
                              <div 
                                style={{ 
                                  width: '50px', 
                                  height: '50px', 
                                  backgroundColor: '#f8f9fa', 
                                  display: 'none', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  borderRadius: '4px',
                                  border: '1px solid #dee2e6'
                                }}
                              >
                                <i className="mdi mdi-image text-muted"></i>
                              </div>
                            </td>
                            <td>
                              <div style={{ maxWidth: '200px' }}>
                                <div className="text-truncate font-weight-bold">
                                  {listing.title}
                                </div>
                                {listing.description && (
                                  <small className="text-muted text-truncate d-block">
                                    {listing.description.substring(0, 50)}...
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <div>
                                {listing.commercial_type ? (
                                  <>
                                    <Badge color="info" className="me-1">Ticari</Badge>
                                    <div className="mt-1">{listing.commercial_type}</div>
                                  </>
                                ) : (
                                  <>
                                    <Badge color="success" className="me-1">Konut</Badge>
                                    <div className="mt-1">{listing.property_type || "Belirtilmemiş"}</div>
                                  </>
                                )}
                              </div>
                            </td>
                            <td>{listing.room_count || "-"}</td>
                            <td>
                              <span className="text-success font-weight-bold">
                                {formatPrice(listing.price, listing.currency)}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                {listing.district_image && (
                                  <img
                                    src={getImageUrl(listing.district_image)}
                                    alt={listing.district}
                                    style={{ 
                                      width: '30px', 
                                      height: '30px', 
                                      objectFit: 'cover', 
                                      borderRadius: '4px',
                                      marginRight: '8px'
                                    }}
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                    }}
                                  />
                                )}
                                <div>
                                  <div>{listing.province}</div>
                                  {listing.district && (
                                    <small className="text-muted">{listing.district}</small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <div>
                                <div>{listing.user_name || "Bilinmiyor"}</div>
                                {listing.user_phone && (
                                  <small className="text-muted">{listing.user_phone}</small>
                                )}
                              </div>
                            </td>
                            <td>{getStatusBadge(listing.display_status || listing.status)}</td>
                            <td>{formatRemainingTime(listing.expires_at, listing.status)}</td>
                            <td>{formatDate(listing.created_at)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  color="outline-primary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedListing(listing);
                                    setDetailModal(true);
                                  }}
                                  id={`view-${listing.id}`}
                                >
                                  <i className="mdi mdi-eye"></i>
                                </Button>
                                <UncontrolledTooltip placement="top" target={`view-${listing.id}`}>
                                  Detayları Görüntüle
                                </UncontrolledTooltip>

                                {listing.status === "pending" && (
                                  <>
                                    <Button
                                      color="success"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedListing(listing);
                                        setApproveModal(true);
                                      }}
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
                                      onClick={() => {
                                        setSelectedListing(listing);
                                        setRejectModal(true);
                                      }}
                                      id={`reject-${listing.id}`}
                                    >
                                      <i className="mdi mdi-close"></i>
                                    </Button>
                                    <UncontrolledTooltip placement="top" target={`reject-${listing.id}`}>
                                      Reddet
                                    </UncontrolledTooltip>
                                  </>
                                )}

                                {listing.status === "approved" && (
                                  <>
                                    <Button
                                      color="warning"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedListing(listing);
                                        setCancelModal(true);
                                      }}
                                      id={`cancel-${listing.id}`}
                                    >
                                      <i className="mdi mdi-cancel"></i>
                                    </Button>
                                    <UncontrolledTooltip placement="top" target={`cancel-${listing.id}`}>
                                      İptal Et
                                    </UncontrolledTooltip>
                                  </>
                                )}

                                {listing.status === "cancelled" && (
                                  <>
                                    <Button
                                      color="success"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedListing(listing);
                                        setReapproveModal(true);
                                      }}
                                      id={`reapprove-${listing.id}`}
                                    >
                                      <i className="mdi mdi-check-circle"></i>
                                    </Button>
                                    <UncontrolledTooltip placement="top" target={`reapprove-${listing.id}`}>
                                      Tekrar Onayla
                                    </UncontrolledTooltip>
                                  </>
                                )}

                                {/* Süre uzatma butonu - expired durumundaki ilanlar için */}
                                {(listing.status === "approved" && listing.expires_at && new Date(listing.expires_at) <= new Date()) || listing.status === "expired" ? (
                                  <>
                                    <Button
                                      color="info"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedListing(listing);
                                        setExtendDurationModal(true);
                                      }}
                                      id={`extend-${listing.id}`}
                                    >
                                      <i className="mdi mdi-plus"></i>
                                    </Button>
                                    <UncontrolledTooltip placement="top" target={`extend-${listing.id}`}>
                                      Süre Uzat (+7 gün)
                                    </UncontrolledTooltip>
                                  </>
                                ) : null}

                                {/* Silme butonu - tüm durumlar için */}
                                <Button
                                  color="danger"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedListing(listing);
                                    setDeleteModal(true);
                                  }}
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
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                {pagination.pages > 1 && (
                  <Row className="mt-4">
                    <Col>
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          Toplam {pagination.total} kayıt, {pagination.pages} sayfa
                        </div>
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
                      </div>
                    </Col>
                  </Row>
                )}
              </CardBody>
            </Card>
          </Col>
        </Row>

        {/* Onaylama Modal */}
        <Modal isOpen={approveModal} toggle={() => setApproveModal(false)}>
          <ModalHeader toggle={() => setApproveModal(false)}>
            Konut İlanını Onayla
          </ModalHeader>
          <ModalBody>
            <p>Bu konut ilanını onaylamak istediğinizden emin misiniz?</p>
            {selectedListing && (
              <div className="alert alert-info">
                <strong>{selectedListing.title}</strong>
                <br />
                <small>{selectedListing.property_type} - {selectedListing.room_count}</small>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setApproveModal(false)}>
              İptal
            </Button>
            <Button color="success" onClick={handleApprove} disabled={loading}>
              {loading ? "Onaylanıyor..." : "Onayla"}
            </Button>
          </ModalFooter>
        </Modal>

        {/* Reddetme Modal */}
        <Modal isOpen={rejectModal} toggle={() => setRejectModal(false)}>
          <ModalHeader toggle={() => setRejectModal(false)}>
            Konut İlanını Reddet
          </ModalHeader>
          <ModalBody>
            <p>Bu konut ilanını reddetmek istediğinizden emin misiniz?</p>
            {selectedListing && (
              <div className="alert alert-info mb-3">
                <strong>{selectedListing.title}</strong>
                <br />
                <small>{selectedListing.property_type} - {selectedListing.room_count}</small>
              </div>
            )}
            <Form>
              <FormGroup>
                <Label>Red Nedeni *</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Lütfen red nedenini belirtin..."
                  required
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setRejectModal(false)}>
              İptal
            </Button>
            <Button color="danger" onClick={handleReject} disabled={loading || !rejectionReason.trim()}>
              {loading ? "Reddediliyor..." : "Reddet"}
            </Button>
          </ModalFooter>
        </Modal>

        {/* İptal Etme Modal */}
        <Modal isOpen={cancelModal} toggle={() => setCancelModal(false)}>
          <ModalHeader toggle={() => setCancelModal(false)}>
            Konut İlanını İptal Et
          </ModalHeader>
          <ModalBody>
            <p>Bu konut ilanını iptal etmek istediğinizden emin misiniz?</p>
            {selectedListing && (
              <div className="alert alert-info mb-3">
                <strong>{selectedListing.title}</strong>
                <br />
                <small>{selectedListing.property_type} - {selectedListing.room_count}</small>
              </div>
            )}
            <Form>
              <FormGroup>
                <Label>İptal Nedeni</Label>
                <Input
                  type="textarea"
                  rows="3"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="İptal nedenini belirtin (isteğe bağlı)..."
                />
              </FormGroup>
            </Form>
          </ModalBody>
          <ModalFooter>
            <Button color="secondary" onClick={() => setCancelModal(false)}>
              Vazgeç
            </Button>
            <Button color="warning" onClick={handleCancel} disabled={loading}>
              {loading ? "İptal Ediliyor..." : "İptal Et"}
            </Button>
          </ModalFooter>
        </Modal>

         {/* Tekrar Onaylama Modal */}
         <Modal isOpen={reapproveModal} toggle={() => setReapproveModal(false)}>
           <ModalHeader toggle={() => setReapproveModal(false)}>
             Konut İlanını Tekrar Onayla
           </ModalHeader>
           <ModalBody>
             <p>Bu konut ilanını tekrar onaylamak istediğinizden emin misiniz?</p>
             {selectedListing && (
               <div className="alert alert-info">
                 <strong>{selectedListing.title}</strong>
                 <br />
                 <small>{selectedListing.property_type} - {selectedListing.room_count}</small>
               </div>
             )}
           </ModalBody>
           <ModalFooter>
             <Button color="secondary" onClick={() => setReapproveModal(false)}>
               İptal
             </Button>
             <Button color="success" onClick={handleReapprove} disabled={loading}>
               {loading ? "Onaylanıyor..." : "Tekrar Onayla"}
             </Button>
           </ModalFooter>
         </Modal>

         {/* Silme Modal */}
         <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
           <ModalHeader toggle={() => setDeleteModal(false)}>
             Konut İlanını Sil
           </ModalHeader>
           <ModalBody>
             <div className="alert alert-warning">
               <i className="mdi mdi-alert-triangle me-2"></i>
               <strong>Dikkat!</strong> Bu işlem geri alınamaz.
             </div>
             <p>Bu konut ilanını kalıcı olarak silmek istediğinizden emin misiniz?</p>
             {selectedListing && (
               <div className="alert alert-info">
                 <strong>{selectedListing.title}</strong>
                 <br />
                 <small>{selectedListing.property_type} - {selectedListing.room_count}</small>
                 <br />
                 <small className="text-muted">Kullanıcı: {selectedListing.user_name}</small>
               </div>
             )}
           </ModalBody>
           <ModalFooter>
             <Button color="secondary" onClick={() => setDeleteModal(false)}>
               İptal
             </Button>
             <Button color="danger" onClick={handleDelete} disabled={loading}>
               {loading ? "Siliniyor..." : "Sil"}
             </Button>
           </ModalFooter>
         </Modal>

         {/* Süre Uzatma Modal */}
         <Modal isOpen={extendDurationModal} toggle={() => setExtendDurationModal(false)}>
           <ModalHeader toggle={() => setExtendDurationModal(false)}>
             İlan Süresini Uzat
           </ModalHeader>
           <ModalBody>
             <p>Bu konut ilanının süresini 7 gün uzatmak istediğinizden emin misiniz?</p>
             {selectedListing && (
               <div className="alert alert-info">
                 <strong>{selectedListing.title}</strong>
                 <br />
                 <small>{selectedListing.property_type} - {selectedListing.room_count}</small>
                 <br />
                 <small className="text-muted">
                   Mevcut bitiş tarihi: {selectedListing.expires_at ? new Date(selectedListing.expires_at).toLocaleDateString('tr-TR') : 'Belirtilmemiş'}
                 </small>
               </div>
             )}
             <div className="alert alert-success">
               <i className="mdi mdi-information me-2"></i>
               İlan süresi 7 gün uzatılacak ve durumu "Onaylandı" olarak güncellenecektir.
             </div>
           </ModalBody>
           <ModalFooter>
             <Button color="secondary" onClick={() => setExtendDurationModal(false)}>
               İptal
             </Button>
             <Button color="info" onClick={handleExtendDuration} disabled={loading}>
               {loading ? "Uzatılıyor..." : "Süre Uzat (+7 gün)"}
             </Button>
           </ModalFooter>
         </Modal>

         {/* Detay Modal */}
         <Modal isOpen={detailModal} toggle={() => setDetailModal(false)} size="xl">
           <ModalHeader toggle={() => setDetailModal(false)}>
             Konut İlanı Detayları
           </ModalHeader>
           <ModalBody>
             {selectedListing && (
               <div>
                 {/* Başlık ve Durum */}
                 <div className="mb-4">
                   <div className="d-flex justify-content-between align-items-start">
                     <div>
                       <h4 className="mb-2">{selectedListing.title}</h4>
                       <p className="text-muted mb-2">{selectedListing.description}</p>
                     </div>
                     <div>
                       {getStatusBadge(selectedListing.display_status || selectedListing.status)}
                     </div>
                   </div>
                 </div>

                 {/* Ana Resim */}
                 {selectedListing.main_image && (
                   <div className="mb-4">
                     <img
                       src={getImageUrl(selectedListing.main_image)}
                       alt={selectedListing.title}
                       className="img-fluid rounded"
                       style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
                     />
                   </div>
                 )}

                 {/* Temel Bilgiler */}
                 <Row className="mb-4">
                   <Col md="6">
                     <Card className="border">
                       <CardBody>
                         <h5 className="card-title mb-3">Fiyat Bilgileri</h5>
                         <Table size="sm" borderless>
                           <tbody>
                             <tr>
                               <td className="fw-bold">Fiyat:</td>
                               <td className="text-success fw-bold">{formatPrice(selectedListing.price, selectedListing.currency)}</td>
                             </tr>
                             {selectedListing.monthly_dues && (
                               <tr>
                                 <td className="fw-bold">Aylık Aidat:</td>
                                 <td>{formatPrice(selectedListing.monthly_dues)} TL</td>
                               </tr>
                             )}
                           </tbody>
                         </Table>
                       </CardBody>
                     </Card>
                   </Col>
                   <Col md="6">
                     <Card className="border">
                       <CardBody>
                         <h5 className="card-title mb-3">Konum Bilgileri</h5>
                         <Table size="sm" borderless>
                           <tbody>
                             <tr>
                               <td className="fw-bold">İl:</td>
                               <td>{selectedListing.province}</td>
                             </tr>
                             {selectedListing.district && (
                               <tr>
                                 <td className="fw-bold">İlçe:</td>
                                 <td>{selectedListing.district}</td>
                               </tr>
                             )}
                             {selectedListing.neighborhood && (
                               <tr>
                                 <td className="fw-bold">Mahalle:</td>
                                 <td>{selectedListing.neighborhood}</td>
                               </tr>
                             )}
                           </tbody>
                         </Table>
                       </CardBody>
                     </Card>
                   </Col>
                 </Row>

                 {/* Konut Özellikleri */}
                 <Row className="mb-4">
                   <Col md="6">
                     <Card className="border">
                       <CardBody>
                         <h5 className="card-title mb-3">Konut Özellikleri</h5>
                         <Table size="sm" borderless>
                           <tbody>
                             <tr>
                               <td className="fw-bold">Konut Tipi:</td>
                               <td>
                                 {selectedListing.commercial_type ? (
                                   <>
                                     <Badge color="info" className="me-1">Ticari</Badge>
                                     {selectedListing.commercial_type}
                                   </>
                                 ) : (
                                   <>
                                     <Badge color="success" className="me-1">Konut</Badge>
                                     {selectedListing.property_type || "Belirtilmemiş"}
                                   </>
                                 )}
                               </td>
                             </tr>
                             {selectedListing.room_count && (
                               <tr>
                                 <td className="fw-bold">Oda Sayısı:</td>
                                 <td>{selectedListing.room_count}</td>
                               </tr>
                             )}
                             {selectedListing.gross_area && (
                               <tr>
                                 <td className="fw-bold">Min m²:</td>
                                 <td>{selectedListing.gross_area} m²</td>
                               </tr>
                             )}
                             {selectedListing.max_area && (
                               <tr>
                                 <td className="fw-bold">Max m²:</td>
                                 <td>{selectedListing.max_area} m²</td>
                               </tr>
                             )}
                             {selectedListing.net_area && (
                               <tr>
                                 <td className="fw-bold">Net m²:</td>
                                 <td>{selectedListing.net_area} m²</td>
                               </tr>
                             )}
                             {selectedListing.floor_number && (
                               <tr>
                                 <td className="fw-bold">Bulunduğu Kat:</td>
                                 <td>{selectedListing.floor_number}</td>
                               </tr>
                             )}
                             {selectedListing.total_floors && (
                               <tr>
                                 <td className="fw-bold">Toplam Kat:</td>
                                 <td>{selectedListing.total_floors}</td>
                               </tr>
                             )}
                             {selectedListing.building_age && (
                               <tr>
                                 <td className="fw-bold">Bina Yaşı:</td>
                                 <td>{selectedListing.building_age}</td>
                               </tr>
                             )}
                             {selectedListing.heating_type && (
                               <tr>
                                 <td className="fw-bold">Isıtma:</td>
                                 <td>{selectedListing.heating_type}</td>
                               </tr>
                             )}
                             {selectedListing.bathroom_count && (
                               <tr>
                                 <td className="fw-bold">Banyo Sayısı:</td>
                                 <td>{selectedListing.bathroom_count}</td>
                               </tr>
                             )}
                             {selectedListing.deed_status && (
                               <tr>
                                 <td className="fw-bold">Tapu Durumu:</td>
                                 <td>{selectedListing.deed_status}</td>
                               </tr>
                             )}
                             {selectedListing.facade_direction && (
                               <tr>
                                 <td className="fw-bold">Cephe Yönü:</td>
                                 <td>{selectedListing.facade_direction}</td>
                               </tr>
                             )}
                           </tbody>
                         </Table>
                       </CardBody>
                     </Card>
                   </Col>
                   <Col md="6">
                     <Card className="border">
                       <CardBody>
                         <h5 className="card-title mb-3">Özellikler</h5>
                         <div className="d-flex flex-wrap gap-2">
                           {selectedListing.is_in_site && (
                             <Badge color="primary" className="p-2">
                               <i className="mdi mdi-home-city me-1"></i>
                               Site İçinde {selectedListing.site_name && `(${selectedListing.site_name})`}
                             </Badge>
                           )}
                           {selectedListing.has_balcony && (
                             <Badge color="info" className="p-2">
                               <i className="mdi mdi-balcony me-1"></i>
                               Balkon
                             </Badge>
                           )}
                           {selectedListing.is_furnished && (
                             <Badge color="info" className="p-2">
                               <i className="mdi mdi-sofa me-1"></i>
                               Eşyalı
                             </Badge>
                           )}
                           {selectedListing.has_parking && (
                             <Badge color="info" className="p-2">
                               <i className="mdi mdi-car me-1"></i>
                               Otopark
                             </Badge>
                           )}
                           {selectedListing.has_elevator && (
                             <Badge color="info" className="p-2">
                               <i className="mdi mdi-elevator me-1"></i>
                               Asansör
                             </Badge>
                           )}
                           {selectedListing.has_security && (
                             <Badge color="info" className="p-2">
                               <i className="mdi mdi-security me-1"></i>
                               Güvenlik
                             </Badge>
                           )}
                           {selectedListing.has_pool && (
                             <Badge color="info" className="p-2">
                               <i className="mdi mdi-pool me-1"></i>
                               Havuz
                             </Badge>
                           )}
                           {selectedListing.has_gym && (
                             <Badge color="info" className="p-2">
                               <i className="mdi mdi-dumbbell me-1"></i>
                               Spor Salonu
                             </Badge>
                           )}
                           {selectedListing.has_garden && (
                             <Badge color="info" className="p-2">
                               <i className="mdi mdi-flower me-1"></i>
                               Bahçe
                             </Badge>
                           )}
                           {selectedListing.is_exchange_suitable && (
                             <Badge color="success" className="p-2">
                               <i className="mdi mdi-swap-horizontal me-1"></i>
                               Takasa Uygun
                             </Badge>
                           )}
                           {selectedListing.is_urgent && (
                             <Badge color="danger" className="p-2">
                               <i className="mdi mdi-alert me-1"></i>
                               Acil İlan
                             </Badge>
                           )}
                         </div>
                       </CardBody>
                     </Card>
                   </Col>
                 </Row>

                 {/* Kullanıcı ve Tarih Bilgileri */}
                 <Row className="mb-4">
                   <Col md="6">
                     <Card className="border">
                       <CardBody>
                         <h5 className="card-title mb-3">İlan Sahibi</h5>
                         <Table size="sm" borderless>
                           <tbody>
                             <tr>
                               <td className="fw-bold">Ad Soyad:</td>
                               <td>{selectedListing.user_name || "Bilinmiyor"}</td>
                             </tr>
                             {selectedListing.user_phone && (
                               <tr>
                                 <td className="fw-bold">Telefon:</td>
                                 <td>{selectedListing.user_phone}</td>
                               </tr>
                             )}
                             {selectedListing.user_email && (
                               <tr>
                                 <td className="fw-bold">E-posta:</td>
                                 <td>{selectedListing.user_email}</td>
                               </tr>
                             )}
                           </tbody>
                         </Table>
                       </CardBody>
                     </Card>
                   </Col>
                   <Col md="6">
                     <Card className="border">
                       <CardBody>
                         <h5 className="card-title mb-3">Tarih Bilgileri</h5>
                         <Table size="sm" borderless>
                           <tbody>
                             <tr>
                               <td className="fw-bold">Oluşturulma:</td>
                               <td>{formatDate(selectedListing.created_at)}</td>
                             </tr>
                             {selectedListing.updated_at && (
                               <tr>
                                 <td className="fw-bold">Güncellenme:</td>
                                 <td>{formatDate(selectedListing.updated_at)}</td>
                               </tr>
                             )}
                             {selectedListing.expires_at && (
                               <tr>
                                 <td className="fw-bold">Bitiş Tarihi:</td>
                                 <td>{formatDate(selectedListing.expires_at)}</td>
                               </tr>
                             )}
                             <tr>
                               <td className="fw-bold">Kalan Süre:</td>
                               <td>{formatRemainingTime(selectedListing.expires_at, selectedListing.status)}</td>
                             </tr>
                           </tbody>
                         </Table>
                       </CardBody>
                     </Card>
                   </Col>
                 </Row>

                 {/* Red/İptal Nedeni */}
                 {(selectedListing.rejection_reason || selectedListing.cancellation_reason) && (
                   <Row className="mb-4">
                     <Col md="12">
                       <Card className="border border-warning">
                         <CardBody>
                           <h5 className="card-title mb-3">
                             {selectedListing.rejection_reason ? 'Red Nedeni' : 'İptal Nedeni'}
                           </h5>
                           <p className="mb-0">
                             {selectedListing.rejection_reason || selectedListing.cancellation_reason}
                           </p>
                         </CardBody>
                       </Card>
                     </Col>
                   </Row>
                 )}

                 {/* Diğer Resimler */}
                 {selectedListing.images && selectedListing.images.length > 0 && (
                   <Row>
                     <Col md="12">
                       <Card className="border">
                         <CardBody>
                           <h5 className="card-title mb-3">İlan Resimleri</h5>
                           <div className="row">
                             {selectedListing.images.map((image, index) => (
                               <div key={index} className="col-6 col-md-4 col-lg-3 mb-3">
                                 <img
                                   src={getImageUrl(image)}
                                   alt={`İlan resmi ${index + 1}`}
                                   className="img-fluid rounded"
                                   style={{ width: '100%', height: '150px', objectFit: 'cover', cursor: 'pointer' }}
                                   onClick={() => window.open(getImageUrl(image), '_blank')}
                                 />
                               </div>
                             ))}
                           </div>
                         </CardBody>
                       </Card>
                     </Col>
                   </Row>
                 )}
               </div>
             )}
           </ModalBody>
           <ModalFooter>
             <Button color="secondary" onClick={() => setDetailModal(false)}>
               Kapat
             </Button>
           </ModalFooter>
         </Modal>
      </div>
    </div>
  );
};

export default HousingListingsList;