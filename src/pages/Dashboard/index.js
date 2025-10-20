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
    categories: 0,
    watchListings: { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0 },
    carListings: { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0 },
    housingListings: { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0 }
  });

  // API'den istatistikleri çekme fonksiyonu
  const fetchDashboardStats = async () => {
    try {
      // localStorage'dan authUser objesini al ve token'ı çıkar
      const authUser = localStorage.getItem('authUser');
      let token = null;
      
      if (authUser) {
        try {
          const parsedUser = JSON.parse(authUser);
          // Token'ı data objesi içinden al
          token = parsedUser.data?.token || parsedUser.token || parsedUser.accessToken;
        } catch (parseError) {
          console.error('AuthUser parse hatası:', parseError);
        }
      }
      
      // Alternatif olarak direkt token'ı da kontrol et
      if (!token) {
        token = localStorage.getItem('token');
      }
      
      if (!token) {
       
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          console.log(`${key}:`, localStorage.getItem(key));
        }
        return;
      }

      console.log('API çağrısı başlatılıyor...');
      console.log('Token mevcut:', token.substring(0, 20) + '...');
      
      const response = await fetch('http://localhost:3000/api/admin/dashboard/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers.get('content-type'));
      
      if (response.ok) {
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          const result = await response.json();
          console.log('API Response:', result);
          
          if (result.success) {
            const data = result.data;
            console.log('Data from API:', data);
            
            setStats({
              users: data.users?.total || 0,
              listings: data.totalListings?.total || 0,
              messages: data.messages?.total || 0,
              categories: data.categories?.total || 0,
              watchListings: data.watchListings || { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0 },
              carListings: data.carListings || { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0 },
              housingListings: data.housingListings || { total: 0, pending: 0, approved: 0, rejected: 0, expired: 0 }
            });
            
            console.log('Stats başarıyla güncellendi');
          } else {
            console.error('API başarısız response:', result.message);
          }
        } else {
          const textResponse = await response.text();
          console.error('API HTML response döndü:', textResponse.substring(0, 200));
        }
      } else {
        const errorText = await response.text();
        console.error('API çağrısı başarısız:', response.status, response.statusText, errorText);
      }
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenirken hata:', error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
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
            
        
            
          {/* İlan Detayları */}
          <Row className="mb-4">
            <Col xl={4} md={6} className="mb-3">
              <Card className="mini-stat bg-primary text-white h-100">
                <CardBody className="d-flex flex-column">
                  <div className="mb-4 flex-grow-1">
                    <div className="float-start mini-stat-img me-4">
                      <i className="ti-time font-size-40"></i>
                    </div>
                    <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                      Saat İlanları
                    </h5>
                    <h4 className="fw-medium font-size-24">
                      {stats.watchListings.total}{" "}
                      <i className="mdi mdi-arrow-up text-success ms-2"></i>
                    </h4>
                    <div className="mini-stat-label bg-success">
                      <p className="mb-0">Toplam</p>
                    </div>
                  </div>
                  <div className="pt-2 mt-auto">
                    <div className="d-flex justify-content-between text-white-50 mb-2">
                      <small>Onaylı: {stats.watchListings.approved}</small>
                      <small>Bekleyen: {stats.watchListings.pending}</small>
                    </div>
                    <div className="d-flex justify-content-between text-white-50 mb-2">
                      <small>Reddedilen: {stats.watchListings.rejected}</small>
                      <small>Süresi Dolmuş: {stats.watchListings.expired}</small>
                    </div>
                    <div className="float-end">
                      <Link to="/admin/watch-listings" className="text-white-50">
                        <i className="mdi mdi-arrow-right h5"></i>
                      </Link>
                    </div>
                    <p className="text-white-50 mb-0 mt-1">Saat ilanları</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={4} md={6} className="mb-3">
              <Card className="mini-stat bg-primary text-white h-100">
                <CardBody className="d-flex flex-column">
                  <div className="mb-4 flex-grow-1">
                    <div className="float-start mini-stat-img me-4">
                      <i className="ti-car font-size-40"></i>
                    </div>
                    <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                      Araba İlanları
                    </h5>
                    <h4 className="fw-medium font-size-24">
                      {stats.carListings.total}{" "}
                      <i className="mdi mdi-arrow-up text-success ms-2"></i>
                    </h4>
                    <div className="mini-stat-label bg-success">
                      <p className="mb-0">Toplam</p>
                    </div>
                  </div>
                  <div className="pt-2 mt-auto">
                    <div className="d-flex justify-content-between text-white-50 mb-2">
                      <small>Onaylı: {stats.carListings.approved}</small>
                      <small>Bekleyen: {stats.carListings.pending}</small>
                    </div>
                    <div className="d-flex justify-content-between text-white-50 mb-2">
                      <small>Reddedilen: {stats.carListings.rejected}</small>
                      <small>Süresi Dolmuş: {stats.carListings.expired}</small>
                    </div>
                    <div className="float-end">
                      <Link to="/admin/car-listings" className="text-white-50">
                        <i className="mdi mdi-arrow-right h5"></i>
                      </Link>
                    </div>
                    <p className="text-white-50 mb-0 mt-1">Araba ilanları</p>
                  </div>
                </CardBody>
              </Card>
            </Col>
            
            <Col xl={4} md={6} className="mb-3">
              <Card className="mini-stat bg-primary text-white h-100">
                <CardBody className="d-flex flex-column">
                  <div className="mb-4 flex-grow-1">
                    <div className="float-start mini-stat-img me-4">
                      <i className="ti-home font-size-40"></i>
                    </div>
                    <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
                      Ev İlanları
                    </h5>
                    <h4 className="fw-medium font-size-24">
                      {stats.housingListings.total}{" "}
                      <i className="mdi mdi-arrow-up text-success ms-2"></i>
                    </h4>
                    <div className="mini-stat-label bg-success">
                      <p className="mb-0">Toplam</p>
                    </div>
                  </div>
                  <div className="pt-2 mt-auto">
                    <div className="d-flex justify-content-between text-white-50 mb-2">
                      <small>Onaylı: {stats.housingListings.approved}</small>
                      <small>Bekleyen: {stats.housingListings.pending}</small>
                    </div>
                    <div className="d-flex justify-content-between text-white-50 mb-2">
                      <small>Reddedilen: {stats.housingListings.rejected}</small>
                      <small>Süresi Dolmuş: {stats.housingListings.expired}</small>
                    </div>
                    <div className="float-end">
                      <Link to="/admin/housing-listings" className="text-white-50">
                        <i className="mdi mdi-arrow-right h5"></i>
                      </Link>
                    </div>
                    <p className="text-white-50 mb-0 mt-1">Ev ilanları</p>
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
