import React, { useState, useEffect } from 'react';
import { Card, CardBody, Alert } from 'reactstrap';
import { get } from '../../helpers/backend_helper';
import './ListingCountdown.css';

const ListingCountdown = () => {
  const [remainingTime, setRemainingTime] = useState(null);
  const [isAvailable, setIsAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Kalan süreyi formatla
  const formatTime = (timeString) => {
    if (!timeString) return null;
    
    const formatted = {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

    // Türkçe zaman formatını parse et
    // Örnek: "2 gün 5 saat 30 dakika 15 saniye" veya "5 saat 30 dakika 15 saniye"
    
    // Gün değerini bul
    const dayMatch = timeString.match(/(\d+)\s*gün/);
    if (dayMatch) {
      formatted.days = parseInt(dayMatch[1], 10) || 0;
    }
    
    // Saat değerini bul
    const hourMatch = timeString.match(/(\d+)\s*saat/);
    if (hourMatch) {
      formatted.hours = parseInt(hourMatch[1], 10) || 0;
    }
    
    // Dakika değerini bul
    const minuteMatch = timeString.match(/(\d+)\s*dakika/);
    if (minuteMatch) {
      formatted.minutes = parseInt(minuteMatch[1], 10) || 0;
    }
    
    // Saniye değerini bul
    const secondMatch = timeString.match(/(\d+)\s*saniye/);
    if (secondMatch) {
      formatted.seconds = parseInt(secondMatch[1], 10) || 0;
    }

    return formatted;
  };

  // API'den kalan süreyi çek
  const fetchRemainingTime = async () => {
    try {
      setLoading(true);
      const response = await get('/api/listing-schedule/remaining-time');
      
      if (response.success) {
        setIsAvailable(response.data.canPost);
        setRemainingTime(response.data.remainingTimeFormatted);
        setError(null);
      } else {
        setError('Veri alınamadı');
      }
    } catch (err) {
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
      <Card className="listing-countdown-card h-100">
        <CardBody className="text-center d-flex flex-column justify-content-center">
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
      <Card className="listing-countdown-card h-100">
        <CardBody className="d-flex flex-column justify-content-center">
          <Alert color="warning" className="mb-0" fade timeout={3000}>
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
      <Card className="listing-countdown-card bg-success text-white h-100">
        <CardBody className="text-center d-flex flex-column justify-content-center">
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
    <Card className="listing-countdown-card bg-primary text-white h-100">
      <CardBody className="text-center d-flex flex-column">
        <div className="mb-3 flex-grow-1 d-flex flex-column justify-content-center">
          <h5 className="text-white mb-3 mt-3">İlan Verme Kapalı</h5>
          
          {timeData && (
            <div className="countdown-timer">
              <div className="row g-2 justify-content-center">
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
        </div>
     
      </CardBody>
    </Card>
  );
};

export default ListingCountdown;