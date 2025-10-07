import React, { useState, useEffect } from 'react';
import { Card, CardBody, Alert } from 'reactstrap';
import axios from 'axios';
import './ListingCountdown.css';

const ListingCountdown = () => {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kalan süreyi formatla
  const formatTime = (timeString) => {
    if (!timeString) return null;
    
    const parts = timeString.split(' ');
    const formatted = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    parts.forEach(part => {
      if (part.includes('gün')) {
        formatted.days = parseInt(part);
      } else if (part.includes('saat')) {
        formatted.hours = parseInt(part);
      } else if (part.includes('dakika')) {
        formatted.minutes = parseInt(part);
      } else if (part.includes('saniye')) {
        formatted.seconds = parseInt(part);
      }
    });

    return formatted;
  };

  // API'den kalan süreyi çek
  const fetchRemainingTime = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/listing-schedule/remaining-time');
      
      if (response.data.success) {
        setIsAvailable(response.data.isAvailable);
        setRemainingTime(response.data.remainingTime);
        setError(null);
      } else {
        setError('Veri alınamadı');
      }
    } catch (err) {
      console.error('Kalan süre alınırken hata:', err);
      setError('Bağlantı hatası');
    } finally {
      setLoading(false);
    }
  };

  // Component mount olduğunda ve her dakika güncelle
  useEffect(() => {
    fetchRemainingTime();
    
    // Her 30 saniyede bir güncelle
    const interval = setInterval(fetchRemainingTime, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Yükleniyor durumu
  if (loading) {
    return (
      <Card className="listing-countdown-card">
        <CardBody className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
          <p className="mt-2 mb-0">Kalan süre hesaplanıyor...</p>
        </CardBody>
      </Card>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <Card className="listing-countdown-card">
        <CardBody>
          <Alert color="warning" className="mb-0">
            <i className="mdi mdi-alert-circle me-2"></i>
            {error}
          </Alert>
        </CardBody>
      </Card>
    );
  }

  // İlan verme açık
  if (isAvailable) {
    return (
      <Card className="listing-countdown-card bg-success text-white">
        <CardBody className="text-center">
          <div className="mb-3">
            <i className="mdi mdi-check-circle display-4"></i>
          </div>
          <h5 className="text-white mb-2">İlan Verme Açık</h5>
          <p className="text-white-50 mb-0">
            Şu anda ilan verebilirsiniz!
          </p>
        </CardBody>
      </Card>
    );
  }

  // Kalan süre göster
  const timeData = formatTime(remainingTime);
  
  return (
    <Card className="listing-countdown-card bg-primary text-white">
      <CardBody className="text-center">
        <div className="mb-3">
          <i className="mdi mdi-clock-outline display-4"></i>
        </div>
        <h5 className="text-white mb-3">İlan Verme Kapalı</h5>
        
        {timeData && (
          <div className="countdown-timer">
            <div className="row g-2">
              {timeData.days > 0 && (
                <div className="col-3">
                  <div className="countdown-item">
                    <div className="countdown-number">{timeData.days}</div>
                    <div className="countdown-label">Gün</div>
                  </div>
                </div>
              )}
              <div className="col-3">
                <div className="countdown-item">
                  <div className="countdown-number">{timeData.hours}</div>
                  <div className="countdown-label">Saat</div>
                </div>
              </div>
              <div className="col-3">
                <div className="countdown-item">
                  <div className="countdown-number">{timeData.minutes}</div>
                  <div className="countdown-label">Dakika</div>
                </div>
              </div>
              <div className="col-3">
                <div className="countdown-item">
                  <div className="countdown-number">{timeData.seconds}</div>
                  <div className="countdown-label">Saniye</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-white-50 mt-3 mb-0">
          İlan verebilmek için kalan süre
        </p>
      </CardBody>
    </Card>
  );
};

export default ListingCountdown;