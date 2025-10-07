import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input, Alert, UncontrolledTooltip } from "reactstrap";
import { Link } from "react-router-dom";
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
                      <Label>Konut Tipi</Label>
                      <Input
                        type="select"
                        value={filters.property_type}
                        onChange={(e) => setFilters({...filters, property_type: e.target.value, page: 1})}
                      >
                        <option value="">Tümü</option>
                        <option value="Daire">Daire</option>
                        <option value="Villa">Villa</option>
                        <option value="Müstakil Ev">Müstakil Ev</option>
                        <option value="Dubleks">Dubleks</option>
                        <option value="Tripleks">Tripleks</option>
                        <option value="Residence">Residence</option>
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
                        <th>Tarih</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan="11" className="text-center">
                            <div className="spinner-border text-primary" role="status">
                              <span className="sr-only">Yükleniyor...</span>
                            </div>
                          </td>
                        </tr>
                      ) : listings.length === 0 ? (
                        <tr>
                          <td colSpan="11" className="text-center">Konut ilanı bulunamadı</td>
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
                            <td>{listing.property_type || "Belirtilmemiş"}</td>
                            <td>{listing.room_count || "Belirtilmemiş"}</td>
                            <td>
                              <span className="text-success font-weight-bold">
                                {formatPrice(listing.price, listing.currency)}
                              </span>
                            </td>
                            <td>
                              <div>
                                <div>{listing.province}</div>
                                {listing.district && (
                                  <small className="text-muted">{listing.district}</small>
                                )}
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
                            <td>{getStatusBadge(listing.status)}</td>
                            <td>{formatDate(listing.created_at)}</td>
                            <td>
                              <div className="d-flex gap-2">
                                <Link
                                  to={`/admin/housing-listings/${listing.id}`}
                                  className="btn btn-outline-primary btn-sm"
                                  id={`view-${listing.id}`}
                                >
                                  <i className="mdi mdi-eye"></i>
                                </Link>
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
      </div>
    </div>
  );
};

export default HousingListingsList;