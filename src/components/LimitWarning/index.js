import React, { useState, useEffect } from 'react';
import { Alert, Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import { getUserListingLimit } from '../../helpers/backend_helper';

const LimitWarning = ({ 
  showInline = false, 
  showModal = false, 
  onClose = () => {},
  checkInterval = 300000 // 5 dakika
}) => {
  const [limitInfo, setLimitInfo] = useState(null);
  const [showWarning, setShowWarning] = useState(false);
  const [warningType, setWarningType] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    checkLimitStatus();
    
    // Periyodik kontrol
    const interval = setInterval(checkLimitStatus, checkInterval);
    
    return () => clearInterval(interval);
  }, [checkInterval]);

  useEffect(() => {
    if (showModal && warningType) {
      setModalOpen(true);
    }
  }, [showModal, warningType]);

  const checkLimitStatus = async () => {
    try {
      const response = await getUserListingLimit();
      setLimitInfo(response);
      
      const percentage = (response.current_count / response.daily_limit) * 100;
      
      if (percentage >= 100) {
        setWarningType('exceeded');
        setShowWarning(true);
      } else if (percentage >= 90) {
        setWarningType('critical');
        setShowWarning(true);
      } else if (percentage >= 80) {
        setWarningType('warning');
        setShowWarning(true);
      } else {
        setWarningType('');
        setShowWarning(false);
      }
    } catch (error) {
      console.error('Limit kontrolü yapılamadı:', error);
    }
  };

  const getWarningConfig = () => {
    if (!limitInfo) return null;

    const remaining = limitInfo.daily_limit - limitInfo.current_count;
    
    switch (warningType) {
      case 'exceeded':
        return {
          color: 'danger',
          icon: 'mdi-alert-circle',
          title: 'Günlük Limit Aşıldı!',
          message: `Bugün ${limitInfo.daily_limit} ilan verme hakkınızı kullandınız. Yeni ilan verebilmek için yarın tekrar deneyin.`,
          action: 'Tamam'
        };
      case 'critical':
        return {
          color: 'warning',
          icon: 'mdi-alert',
          title: 'Limit Dolmak Üzere!',
          message: `Sadece ${remaining} ilan verme hakkınız kaldı. Dikkatli kullanın.`,
          action: 'Anladım'
        };
      case 'warning':
        return {
          color: 'info',
          icon: 'mdi-information',
          title: 'Limit Uyarısı',
          message: `${remaining} ilan verme hakkınız kaldı. Günlük limitinize yaklaşıyorsunuz.`,
          action: 'Tamam'
        };
      default:
        return null;
    }
  };

  const handleClose = () => {
    setModalOpen(false);
    setShowWarning(false);
    onClose();
  };

  const config = getWarningConfig();
  
  if (!showWarning || !config) {
    return null;
  }

  // Inline Alert
  if (showInline) {
    return (
      <Alert color={config.color} className="d-flex align-items-center">
        <i className={`mdi ${config.icon} me-2 font-size-16`}></i>
        <div className="flex-grow-1">
          <strong>{config.title}</strong>
          <div>{config.message}</div>
        </div>
        <Button 
          color={config.color} 
          size="sm" 
          outline 
          onClick={handleClose}
          className="ms-2"
        >
          <i className="mdi mdi-close"></i>
        </Button>
      </Alert>
    );
  }

  // Modal
  if (showModal) {
    return (
      <Modal isOpen={modalOpen} toggle={handleClose} centered>
        <ModalHeader toggle={handleClose} className={`bg-${config.color} text-white`}>
          <i className={`mdi ${config.icon} me-2`}></i>
          {config.title}
        </ModalHeader>
        <ModalBody>
          <div className="text-center py-3">
            <i className={`mdi ${config.icon} font-size-48 text-${config.color} mb-3`}></i>
            <p className="mb-0">{config.message}</p>
            
            {limitInfo && (
              <div className="mt-4 p-3 bg-light rounded">
                <div className="row text-center">
                  <div className="col-4">
                    <h5 className="mb-1">{limitInfo.current_count}</h5>
                    <small className="text-muted">Kullanılan</small>
                  </div>
                  <div className="col-4">
                    <h5 className="mb-1">{limitInfo.daily_limit}</h5>
                    <small className="text-muted">Toplam Limit</small>
                  </div>
                  <div className="col-4">
                    <h5 className="mb-1 text-primary">
                      {Math.max(0, limitInfo.daily_limit - limitInfo.current_count)}
                    </h5>
                    <small className="text-muted">Kalan</small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ModalBody>
        <ModalFooter>
          <Button color={config.color} onClick={handleClose}>
            {config.action}
          </Button>
        </ModalFooter>
      </Modal>
    );
  }

  return null;
};

export default LimitWarning;