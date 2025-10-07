import PropTypes from 'prop-types';
import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
} from "reactstrap";
import { Link } from "react-router-dom";

//i18n
import { withTranslation } from "react-i18next";

// Components
import ListingCountdown from "../../components/ListingCountdown";

const Dashboard = props => {
  const [stats, setStats] = useState({
    users: 0,
    listings: 0,
    messages: 0,
    categories: 0
  });

  // API'den istatistikleri çekme fonksiyonu (gelecekte implement edilecek)
  useEffect(() => {
    // TODO: API'den gerçek verileri çek
    // fetchDashboardStats();
  }, []);

  document.title = "Dashboard | Arayanvar Admin Panel";
  
  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <div className="page-title-box">
            <Row className="align-items-center">
              <Col md={12}>
                <h6 className="page-title">Dashboard</h6>
                <ol className="breadcrumb m-0">
                  <li className="breadcrumb-item active">Arayanvar Yönetim Paneline Hoş Geldiniz</li>
                </ol>
              </Col>
            </Row>
          </div>
          
          {/* İstatistik Kartları */}
          <Row>
            {/* İlan Verme Durumu */}
            <Col xl={4} md={6}>
              <ListingCountdown />
            </Col>
            
            <Col xl={3} md={6}>
              <Card className="mini-stat bg-primary text-white">
                <CardBody>
                  <div className="mb-4">
                    <div className="float-start mini-stat-img me-4">
                      <i className="ti-user font-size-40"></i>
                    </div>
                    <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                      Kullanıcılar
                    </h5>
                    <h4 className="fw-medium font-size-24">
                      {stats.users}{" "}
                      <i className="mdi mdi-arrow-up text-success ms-2"></i>
                    </h4>
                    <div className="mini-stat-label bg-success">
                      <p className="mb-0">Toplam</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="float-end">
                      <Link to="/admin/users" className="text-white-50">
                        <i className="mdi mdi-arrow-right h5"></i>
                      </Link>
                    </div>
                    <p className="text-white-50 mb-0 mt-1">Kayıtlı kullanıcılar</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={3} md={6}>
              <Card className="mini-stat bg-primary text-white">
                <CardBody>
                  <div className="mb-4">
                    <div className="float-start mini-stat-img me-4">
                      <i className="ti-list font-size-40"></i>
                    </div>
                    <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                      İlanlar
                    </h5>
                    <h4 className="fw-medium font-size-24">
                      {stats.listings}{" "}
                      <i className="mdi mdi-arrow-up text-success ms-2"></i>
                    </h4>
                    <div className="mini-stat-label bg-success">
                      <p className="mb-0">Toplam</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="float-end">
                      <Link to="/admin/listings" className="text-white-50">
                        <i className="mdi mdi-arrow-right h5"></i>
                      </Link>
                    </div>
                    <p className="text-white-50 mb-0 mt-1">Aktif ilanlar</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={2} md={6}>
              <Card className="mini-stat bg-primary text-white">
                <CardBody>
                  <div className="mb-4">
                    <div className="float-start mini-stat-img me-4">
                      <i className="ti-comment font-size-40"></i>
                    </div>
                    <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                      Mesajlar
                    </h5>
                    <h4 className="fw-medium font-size-24">
                      {stats.messages}{" "}
                      <i className="mdi mdi-arrow-up text-success ms-2"></i>
                    </h4>
                    <div className="mini-stat-label bg-info">
                      <p className="mb-0">Toplam</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="float-end">
                      <Link to="/chat" className="text-white-50">
                        <i className="mdi mdi-arrow-right h5"></i>
                      </Link>
                    </div>
                    <p className="text-white-50 mb-0 mt-1">Gönderilen mesajlar</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={3} md={6}>
              <Card className="mini-stat bg-primary text-white">
                <CardBody>
                  <div className="mb-4">
                    <div className="float-start mini-stat-img me-4">
                      <i className="ti-tag font-size-40"></i>
                    </div>
                    <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                      Kategoriler
                    </h5>
                    <h4 className="fw-medium font-size-24">
                      {stats.categories}{" "}
                      <i className="mdi mdi-arrow-up text-success ms-2"></i>
                    </h4>
                    <div className="mini-stat-label bg-warning">
                      <p className="mb-0">Toplam</p>
                    </div>
                  </div>
                  <div className="pt-2">
                    <div className="float-end">
                      <Link to="/admin/categories" className="text-white-50">
                        <i className="mdi mdi-arrow-right h5"></i>
                      </Link>
                    </div>
                    <p className="text-white-50 mb-0 mt-1">Aktif kategoriler</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Hızlı Erişim Kartları */}
          <Row>
            <Col xl={4} md={6}>
              <Card>
                <CardBody className="text-center">
                  <div className="py-4">
                    <i className="ti-plus display-4 text-primary"></i>
                    <h5 className="text-primary mt-4">Yeni İlan Ekle</h5>
                    <p className="text-muted">
                      Sisteme yeni ilan eklemek için tıklayın
                    </p>
                    <div className="mt-4">
                      <Link to="/admin/listings/add" className="btn btn-primary">
                        İlan Ekle
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={4} md={6}>
              <Card>
                <CardBody className="text-center">
                  <div className="py-4">
                    <i className="ti-settings display-4 text-success"></i>
                    <h5 className="text-success mt-4">Kategori Yönetimi</h5>
                    <p className="text-muted">
                      Kategorileri düzenlemek için tıklayın
                    </p>
                    <div className="mt-4">
                      <Link to="/admin/categories" className="btn btn-success">
                        Kategoriler
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={4} md={6}>
              <Card>
                <CardBody className="text-center">
                  <div className="py-4">
                    <i className="ti-image display-4 text-warning"></i>
                    <h5 className="text-warning mt-4">Slider Yönetimi</h5>
                    <p className="text-muted">
                      Ana sayfa slider'larını yönetmek için tıklayın
                    </p>
                    <div className="mt-4">
                      <Link to="/admin/sliders" className="btn btn-warning">
                        Slider'lar
                      </Link>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Son Aktiviteler */}
          <Row>
            <Col xl={12}>
              <Card>
                <CardBody>
                  <h4 className="card-title mb-4">Son Aktiviteler</h4>
                  <div className="table-responsive">
                    <table className="table table-hover table-centered table-nowrap mb-0">
                      <thead>
                        <tr>
                          <th scope="col">Tarih</th>
                          <th scope="col">Aktivite</th>
                          <th scope="col">Kullanıcı</th>
                          <th scope="col">Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td>Bugün</td>
                          <td>Yeni ilan eklendi</td>
                          <td>Admin</td>
                          <td>
                            <span className="badge bg-success">Başarılı</span>
                          </td>
                        </tr>
                        <tr>
                          <td>Dün</td>
                          <td>Kategori güncellendi</td>
                          <td>Admin</td>
                          <td>
                            <span className="badge bg-info">Güncellendi</span>
                          </td>
                        </tr>
                        <tr>
                          <td>2 gün önce</td>
                          <td>Slider eklendi</td>
                          <td>Admin</td>
                          <td>
                            <span className="badge bg-success">Başarılı</span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="text-center mt-3">
                    <Link to="/admin/logs" className="btn btn-outline-primary">
                      Tüm Aktiviteleri Görüntüle
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </React.Fragment>
  );
};

Dashboard.propTypes = {
  t: PropTypes.any
};

export default Dashboard;
