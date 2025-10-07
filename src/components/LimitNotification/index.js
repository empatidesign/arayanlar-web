import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getUserListingLimit } from '../../helpers/backend_helper';

const LimitNotification = ({ 
  enableToast = true,
  checkOnMount = true,
  checkInterval = 600000 // 10 dakika
}) => {
  const [lastNotificationTime, setLastNotificationTime] = useState(null);
  const [lastLimitStatus, setLastLimitStatus] = useState(null);

  useEffect(() => {
    if (checkOnMount) {
      checkLimitAndNotify();
    }

    if (checkInterval > 0) {
      const interval = setInterval(checkLimitAndNotify, checkInterval);
      return () => clearInterval(interval);
    }
  }, [checkOnMount, checkInterval]);

  const checkLimitAndNotify = async () => {
    try {
      const response = await getUserListingLimit();
      const percentage = (response.current_count / response.daily_limit) * 100;
      
      // Bildirim gösterilmemesi gereken durumlar
      const now = Date.now();
      const oneHour = 60 * 60 * 1000;
      
      // Son 1 saat içinde aynı durum için bildirim gösterilmişse tekrar gösterme
      if (lastNotificationTime && (now - lastNotificationTime) < oneHour) {
        return;
      }

      let shouldNotify = false;
      let notificationConfig = null;

      if (percentage >= 100 && lastLimitStatus !== 'exceeded') {
        shouldNotify = true;
        notificationConfig = {
          type: 'error',
          title: '🚫 Günlük Limit Aşıldı!',
          message: `Bugün ${response.daily_limit} ilan verme hakkınızı kullandınız. Yarın tekrar deneyin.`,
          autoClose: false
        };
        setLastLimitStatus('exceeded');
      } else if (percentage >= 90 && percentage < 100 && lastLimitStatus !== 'critical') {
        shouldNotify = true;
        const remaining = response.daily_limit - response.current_count;
        notificationConfig = {
          type: 'warning',
          title: '⚠️ Kritik Limit Uyarısı',
          message: `Sadece ${remaining} ilan verme hakkınız kaldı! Günlük limitinize çok yaklaştınız.`,
          autoClose: 8000
        };
        setLastLimitStatus('critical');
      } else if (percentage >= 80 && percentage < 90 && lastLimitStatus !== 'warning') {
        shouldNotify = true;
        const remaining = response.daily_limit - response.current_count;
        notificationConfig = {
          type: 'info',
          title: 'ℹ️ Limit Uyarısı',
          message: `${remaining} ilan verme hakkınız kaldı. Günlük limitinize yaklaşıyorsunuz.`,
          autoClose: 5000
        };
        setLastLimitStatus('warning');
      } else if (percentage < 80) {
        setLastLimitStatus('normal');
      }

      if (shouldNotify && enableToast && notificationConfig) {
        showToastNotification(notificationConfig);
        setLastNotificationTime(now);
      }

    } catch (error) {
      console.error('Limit kontrolü yapılamadı:', error);
    }
  };

  const showToastNotification = (config) => {
    const toastOptions = {
      position: "top-right",
      autoClose: config.autoClose,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    };

    switch (config.type) {
      case 'error':
        toast.error(
          <div>
            <strong>{config.title}</strong>
            <div>{config.message}</div>
          </div>,
          toastOptions
        );
        break;
      case 'warning':
        toast.warning(
          <div>
            <strong>{config.title}</strong>
            <div>{config.message}</div>
          </div>,
          toastOptions
        );
        break;
      case 'info':
        toast.info(
          <div>
            <strong>{config.title}</strong>
            <div>{config.message}</div>
          </div>,
          toastOptions
        );
        break;
      default:
        toast(
          <div>
            <strong>{config.title}</strong>
            <div>{config.message}</div>
          </div>,
          toastOptions
        );
    }
  };

  // Bu komponent görsel bir şey render etmez, sadece bildirim mantığını yönetir
  return null;
};

export default LimitNotification;