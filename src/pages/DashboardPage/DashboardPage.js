import React, { useState, useEffect } from 'react';
import './DashboardPage.css';

const DashboardPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalCategories: 0,
    totalBrands: 0,
    activeUsers: 0,
    pendingListings: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Simulated data - replace with actual API calls
      setStats({
        totalUsers: 1250,
        totalListings: 3420,
        totalCategories: 45,
        totalBrands: 180,
        activeUsers: 89,
        pendingListings: 23
      });

      setRecentActivities([
        { id: 1, type: 'user', message: 'Yeni kullanıcı kaydı: Ahmet Yılmaz', time: '5 dakika önce' },
        { id: 2, type: 'listing', message: 'Yeni ilan eklendi: iPhone 14 Pro', time: '12 dakika önce' },
        { id: 3, type: 'category', message: 'Kategori güncellendi: Elektronik', time: '1 saat önce' },
        { id: 4, type: 'brand', message: 'Yeni marka eklendi: Samsung', time: '2 saat önce' }
      ]);
    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
    <div className={`stat-card ${color}`}>
      <div className="stat-icon">
        <span>{icon}</span>
      </div>
      <div className="stat-content">
        <h3 className="stat-value">{value.toLocaleString()}</h3>
        <p className="stat-title">{title}</p>
        {trend && (
          <div className={`stat-trend ${trend > 0 ? 'positive' : 'negative'}`}>
            <span>{trend > 0 ? '↗' : '↘'}</span>
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => (
    <div className="activity-item">
      <div className={`activity-icon ${activity.type}`}>
        {activity.type === 'user' && '👤'}
        {activity.type === 'listing' && '📝'}
        {activity.type === 'category' && '📂'}
        {activity.type === 'brand' && '🏷️'}
      </div>
      <div className="activity-content">
        <p className="activity-message">{activity.message}</p>
        <span className="activity-time">{activity.time}</span>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Arayanvar yönetim paneline hoş geldiniz</p>
      </div>

      <div className="dashboard-stats">
        <StatCard
          title="Toplam Kullanıcı"
          value={stats.totalUsers}
          icon="👥"
          color="blue"
          trend={12}
        />
        <StatCard
          title="Toplam İlan"
          value={stats.totalListings}
          icon="📝"
          color="green"
          trend={8}
        />
        <StatCard
          title="Kategori Sayısı"
          value={stats.totalCategories}
          icon="📂"
          color="purple"
          trend={5}
        />
        <StatCard
          title="Marka Sayısı"
          value={stats.totalBrands}
          icon="🏷️"
          color="orange"
          trend={15}
        />
        <StatCard
          title="Aktif Kullanıcı"
          value={stats.activeUsers}
          icon="🟢"
          color="teal"
          trend={-3}
        />
        <StatCard
          title="Bekleyen İlan"
          value={stats.pendingListings}
          icon="⏳"
          color="red"
          trend={-18}
        />
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Son Aktiviteler</h2>
            <button className="view-all-btn">Tümünü Gör</button>
          </div>
          <div className="activities-list">
            {recentActivities.map(activity => (
              <ActivityItem key={activity.id} activity={activity} />
            ))}
          </div>
        </div>

        <div className="dashboard-section">
          <div className="section-header">
            <h2>Hızlı İşlemler</h2>
          </div>
          <div className="quick-actions">
            <button className="quick-action-btn primary">
              <span className="action-icon">➕</span>
              <span>Yeni Kategori</span>
            </button>
            <button className="quick-action-btn secondary">
              <span className="action-icon">🏷️</span>
              <span>Yeni Marka</span>
            </button>
            <button className="quick-action-btn tertiary">
              <span className="action-icon">📊</span>
              <span>Rapor Oluştur</span>
            </button>
            <button className="quick-action-btn quaternary">
              <span className="action-icon">⚙️</span>
              <span>Ayarlar</span>
            </button>
          </div>
        </div>
      </div>

      <div className="dashboard-charts">
        <div className="chart-section">
          <h3>Aylık İstatistikler</h3>
          <div className="chart-placeholder">
            <p>📈 Grafik alanı - Chart.js ile entegre edilecek</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;