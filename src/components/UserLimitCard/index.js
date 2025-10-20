import React, { useState, useEffect } from 'react';
import { Card, CardBody, Badge, Spinner, Alert } from 'reactstrap';
import { getUserListingLimit } from '../../helpers/backend_helper';

const UserLimitCard = () => {
  const [limitData, setLimitData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLimitData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getUserListingLimit();
      
      if (response.success) {
        setLimitData(response.data);
      } else {
        setError(response.message || 'Limit bilgisi alınamadı');
      }
    } catch (err) {
      console.error('Limit bilgisi alınırken hata:', err);
      setError('Limit bilgisi alınırken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLimitData();
  }, []);

  if (loading) {
    return (
      <Card className="mini-stat bg-info text-white h-100">
        <CardBody className="text-center d-flex flex-column justify-content-center">
          <Spinner color="light" size="sm" className="me-2" />
          <span>Limit bilgisi yükleniyor...</span>
        </CardBody>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mini-stat bg-warning text-white h-100">
        <CardBody className="d-flex flex-column justify-content-center">
          <div className="mb-2">
            <i className="ti-alert font-size-24 float-start me-3"></i>
            <h6 className="font-size-14 text-uppercase mt-0 text-white-50">
              Günlük İlan Limiti
            </h6>
            <p className="mb-0 font-size-12">{error}</p>
          </div>
        </CardBody>
      </Card>
    );
  }

  const getStatusColor = () => {
    if (!limitData) return 'secondary';
    if (!limitData.can_post) return 'danger';
    if (limitData.remaining <= 2) return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (!limitData) return 'Bilinmiyor';
    if (!limitData.can_post) return 'Limit Aşıldı';
    if (limitData.remaining <= 2) return 'Dikkat';
    return 'Normal';
  };

  return (
    <Card className={`mini-stat bg-${getStatusColor()} text-white h-100`}>
      <CardBody className="d-flex flex-column">
        <div className="mb-4 flex-grow-1">
          <div className="float-start mini-stat-img me-4">
            <i className="ti-clipboard font-size-40"></i>
          </div>
          <h5 className="font-size-16 text-uppercase mt-0 text-white-50">
            Günlük İlan Limiti
          </h5>
          <h4 className="fw-medium font-size-24">
            {limitData?.current_count || 0}/{limitData?.daily_limit || 0}
          </h4>
          <div className={`mini-stat-label bg-${getStatusColor() === 'danger' ? 'danger' : 'light'}`}>
            <p className="mb-0 text-dark">
              <Badge color={getStatusColor()} className="me-1">
                {getStatusText()}
              </Badge>
            </p>
          </div>
        </div>
        <div className="pt-2 mt-auto">
          <div className="float-end">
            <i className="mdi mdi-refresh h5 cursor-pointer" 
               onClick={fetchLimitData} 
               title="Yenile"></i>
          </div>
          <p className="text-white-50 mb-0 mt-1">
            Kalan: {limitData?.remaining || 0} ilan
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default UserLimitCard;