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
import UserLimitCard from "../../components/UserLimitCard";
import LimitWarning from "../../components/LimitWarning";

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
          
          {/* Limit Uyarısı Modal */}
          <LimitWarning showModal={true} />

          {/* İstatistik Kartları */}
          <Row className="mb-4">
            {/* İlan Verme Durumu */}
            <Col xl={4} md={6} className="mb-3">
              <ListingCountdown />
            </Col>
            
            {/* Kullanıcı İlan Limiti */}
            <Col xl={4} md={6} className="mb-3">
              <UserLimitCard />
            </Col>
            
            <Col xl={4} md={6} className="mb-3">
              <Card className="mini-stat bg-primary text-white h-100">
                <CardBody className="d-flex flex-column">
                  <div className="mb-4 flex-grow-1">
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
                  <div className="pt-2 mt-auto">
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
          </Row>
            
          <Row className="mb-4">
            <Col xl={4} md={6} className="mb-3">
              <Card className="mini-stat bg-primary text-white h-100">
                <CardBody className="d-flex flex-column">
                  <div className="mb-4 flex-grow-1">
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
                  <div className="pt-2 mt-auto">
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
            
            <Col xl={4} md={6} className="mb-3">
              <Card className="mini-stat bg-primary text-white h-100">
                <CardBody className="d-flex flex-column">
                  <div className="mb-4 flex-grow-1">
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
                  <div className="pt-2 mt-auto">
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
            
            <Col xl={4} md={6} className="mb-3">
              <Card className="mini-stat bg-primary text-white h-100">
                <CardBody className="d-flex flex-column">
                  <div className="mb-4 flex-grow-1">
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
                  <div className="pt-2 mt-auto">
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
          <Row className="mb-4">
            <Col xl={4} md={6} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center d-flex flex-column">
                  <div className="py-4 flex-grow-1 d-flex flex-column justify-content-center">
                    <i className="ti-plus display-4 text-primary mb-4"></i>
                    <h5 className="text-primary mt-2 mb-3">Yeni İlan Ekle</h5>
                    <p className="text-muted mb-4">
                      Sisteme yeni ilan eklemek için tıklayın
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link to="/admin/listings/add" className="btn btn-primary">
                      İlan Ekle
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={4} md={6} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center d-flex flex-column">
                  <div className="py-4 flex-grow-1 d-flex flex-column justify-content-center">
                    <i className="ti-settings display-4 text-success mb-4"></i>
                    <h5 className="text-success mt-2 mb-3">Kategori Yönetimi</h5>
                    <p className="text-muted mb-4">
                      Kategorileri düzenlemek için tıklayın
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link to="/admin/categories" className="btn btn-success">
                      Kategoriler
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={4} md={6} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center d-flex flex-column">
                  <div className="py-4 flex-grow-1 d-flex flex-column justify-content-center">
                    <i className="ti-image display-4 text-warning mb-4"></i>
                    <h5 className="text-warning mt-2 mb-3">Slider Yönetimi</h5>
                    <p className="text-muted mb-4">
                      Ana sayfa slider'larını yönetmek için tıklayın
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link to="/admin/sliders" className="btn btn-warning">
                      Slider'lar
                    </Link>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={4} md={6} className="mb-3">
              <Card className="h-100">
                <CardBody className="text-center d-flex flex-column">
                  <div className="py-4 flex-grow-1 d-flex flex-column justify-content-center">
                    <i className="ti-user display-4 text-info mb-4"></i>
                    <h5 className="text-info mt-2 mb-3">Kullanıcı Yönetimi</h5>
                    <p className="text-muted mb-4">
                      Kullanıcıları yönetmek için tıklayın
                    </p>
                  </div>
                  <div className="mt-auto">
                    <Link to="/admin/users" className="btn btn-info">
                      Kullanıcılar
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
