import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  CardTitle,
  Table,
  Button,
  Input,
  Label,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Alert,
  Badge,
  UncontrolledTooltip,
  Spinner
} from 'reactstrap';
import { Link } from 'react-router-dom';
import Breadcrumbs from '../../components/Common/Breadcrumb';

const UserManagement = () => {
  // State yönetimi
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [limit] = useState(10);
  
  // Search ve filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  
  // Modal state
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [banModal, setBanModal] = useState(false);
  const [unbanModal, setUnbanModal] = useState(false);
  const [banHistoryModal, setBanHistoryModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Ban state
  const [banData, setBanData] = useState({
    reason: '',
    banType: 'temporary',
    banDuration: 24
  });
  const [banHistory, setBanHistory] = useState([]);
  const [userBanStatus, setUserBanStatus] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    role: 'user',
    city: '',
    gender: '',
    birthday: '',
    subscription_end_date: '',
    profile_image_url: '',
    about: '',
    instagram_url: '',
    facebook_url: '',
    whatsapp_url: '',
    linkedin_url: ''
  });

  // Profil resmi için ek state
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState('');

  // API çağrıları için base URL
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('fetchUsers başlatılıyor...');
      
      const authUser = localStorage.getItem('authUser');
      console.log('authUser localStorage:', authUser ? 'Mevcut' : 'Yok');
      
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      console.log('Parsed user:', user);
      
      // Backend response yapısına göre token'ı data.token'dan al
      const token = user.data?.token || user.token || user.accessToken;
      console.log('Token bulundu:', token ? 'Evet' : 'Hayır');
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const queryParams = new URLSearchParams({
        page: currentPage,
        limit: limit,
        ...(searchTerm && { search: searchTerm }),
        ...(roleFilter && { role: roleFilter })
      });

      const apiUrl = `${API_BASE_URL}/api/admin/users?${queryParams}`;
      console.log('API URL:', apiUrl);
      console.log('API_BASE_URL:', API_BASE_URL);
      console.log('Query params:', Object.fromEntries(queryParams));

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response Status:', response.status);
      console.log('API Response Headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText || 'Kullanıcılar getirilemedi'}`);
      }

      const data = await response.json();
      console.log('API Response Data:', data);
      console.log('Users array:', data.data?.users);
      console.log('Users array length:', data.data?.users ? data.data.users.length : 'undefined');
      console.log('First user profile_image_url:', data.data?.users?.[0]?.profile_image_url);
      console.log('First user is_banned:', data.data?.users?.[0]?.is_banned);
      console.log('All users ban status:', data.data?.users?.map(u => ({ id: u.id, name: u.name, is_banned: u.is_banned })));
      
      setUsers(data.data?.users || []);
      setTotalPages(data.data?.pagination?.totalPages || 1);
      setTotalUsers(data.data?.pagination?.totalUsers || 0);
      setError('');
    } catch (err) {
      setError(err.message || 'Bir hata oluştu');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı güncelle
  const updateUser = async () => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      // Önce profil resmi yükle (eğer varsa)
      let updatedFormData = { ...formData };
      if (profileImageFile) {
        try {
          const uploadedImageUrl = await uploadProfileImage(selectedUser.id, token);
          if (uploadedImageUrl) {
            updatedFormData.profile_image_url = uploadedImageUrl;
          }
        } catch (uploadError) {
          console.error('Image upload failed:', uploadError);
          setError('Resim yüklenemedi, ancak diğer bilgiler güncellenecek');
        }
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedFormData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kullanıcı güncellenemedi');
      }

      setSuccess('Kullanıcı başarıyla güncellendi');
      setEditModal(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Güncelleme sırasında hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Kullanıcı sil
  const deleteUser = async () => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/users/${selectedUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kullanıcı silinemedi');
      }

      setSuccess('Kullanıcı başarıyla silindi');
      setDeleteModal(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Silme sırasında hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Edit modal aç
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      surname: user.surname || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'user',
      city: user.city || '',
      gender: user.gender || '',
      birthday: user.birthday || '',
      subscription_end_date: user.subscription_end_date || '',
      profile_image_url: user.profile_image_url || '',
      about: user.about || '',
      instagram_url: user.instagram_url || '',
      facebook_url: user.facebook_url || '',
      whatsapp_url: user.whatsapp_url || '',
      linkedin_url: user.linkedin_url || ''
    });
    
    // Profil resmi preview'ını ayarla
    if (user.profile_image_url) {
      const imageUrl = user.profile_image_url.startsWith('http') 
        ? user.profile_image_url 
        : `${API_BASE_URL}${user.profile_image_url}`;
      setProfileImagePreview(imageUrl);
    } else {
      setProfileImagePreview('');
    }
    
    setProfileImageFile(null);
    setEditModal(true);
  };

  // Delete modal aç
  const openDeleteModal = (user) => {
    setSelectedUser(user);
    setDeleteModal(true);
  };

  // Form input değişikliklerini handle et
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Search ve filter değişikliklerini handle et
  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  // Sayfa değişikliklerini handle et
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Component mount olduğunda kullanıcıları getir
  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  // Role badge rengi
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'moderator':
        return 'warning';
      default:
        return 'primary';
    }
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Ban süresini hesapla ve formatla
  const formatBanDuration = (createdAt, bannedUntil) => {
    if (!bannedUntil) return 'Kalıcı';
    
    const startDate = new Date(createdAt);
    const endDate = new Date(bannedUntil);
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationHours = Math.round(durationMs / (1000 * 60 * 60));
    
    if (durationHours < 24) {
      return `${durationHours} saat`;
    } else if (durationHours < 24 * 7) {
      const days = Math.round(durationHours / 24);
      return `${days} gün`;
    } else if (durationHours < 24 * 30) {
      const weeks = Math.round(durationHours / (24 * 7));
      return `${weeks} hafta`;
    } else {
      const months = Math.round(durationHours / (24 * 30));
      return `${months} ay`;
    }
  };

  // Profil resmi seçme fonksiyonu
  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        setError('Sadece resim dosyaları yüklenebilir');
        return;
      }

      setProfileImageFile(file);
      
      // Preview için FileReader kullan
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Profil resmini kaldır
  const removeProfileImage = () => {
    setProfileImageFile(null);
    setProfileImagePreview('');
    setFormData(prev => ({
      ...prev,
      profile_image_url: ''
    }));
  };

  // Profil resmi upload fonksiyonu
  const uploadProfileImage = async (userId, token) => {
    if (!profileImageFile) return null;

    const formData = new FormData();
    formData.append('profile_image', profileImageFile);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/users/${userId}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Resim yüklenemedi');
      }

      const data = await response.json();
      return data.data?.profile_image_url || data.profile_image_url;
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };

  // Ban işlemleri
  const banUser = async () => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const banPayload = {
        reason: banData.reason,
        banType: banData.banType,
        banDuration: banData.banType === 'temporary' ? banData.banDuration : null
      };

      const response = await fetch(`${API_BASE_URL}/api/admin/ban-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser.id,
          ...banPayload
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Kullanıcı banlanamadı');
      }

      setSuccess('Kullanıcı başarıyla banlandı');
      setBanModal(false);
      setBanData({ reason: '', banType: 'temporary', banDuration: 24 });
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Ban işlemi sırasında hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const unbanUser = async () => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/unban-user`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ban kaldırılamadı');
      }

      setSuccess('Kullanıcının banı başarıyla kaldırıldı');
      setUnbanModal(false);
      fetchUsers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Ban kaldırma işlemi sırasında hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  const checkUserBanStatus = async (userId) => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) return null;
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}/api/admin/check-ban-status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) return null;

      const data = await response.json();
      return data.data;
    } catch (err) {
      console.error('Ban durumu kontrol edilemedi:', err);
      return null;
    }
  };

  const getUserBanHistory = async (userId) => {
    try {
      const authUser = localStorage.getItem('authUser');
      if (!authUser) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }
      
      const user = JSON.parse(authUser);
      const token = user.data?.token || user.token || user.accessToken;
      
      if (!token) {
        setError('Yetkilendirme token\'ı bulunamadı');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/api/admin/ban-history/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ban geçmişi getirilemedi');
      }

      const data = await response.json();
      setBanHistory(data.data || []);
    } catch (err) {
      setError(err.message || 'Ban geçmişi getirilirken hata oluştu');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Ban modal açma fonksiyonları
  const openBanModal = async (user) => {
    setSelectedUser(user);
    const banStatus = await checkUserBanStatus(user.id);
    setUserBanStatus(banStatus);
    setBanModal(true);
  };

  const openUnbanModal = (user) => {
    setSelectedUser(user);
    setUnbanModal(true);
  };

  const openBanHistoryModal = async (user) => {
    setSelectedUser(user);
    await getUserBanHistory(user.id);
    setBanHistoryModal(true);
  };

  // Ban form input değişikliklerini handle et
  const handleBanInputChange = (e) => {
    const { name, value } = e.target;
    setBanData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Admin" breadcrumbItem="Kullanıcı Yönetimi" />

          {/* Alert mesajları */}
          {error && (
            <Alert color="danger" className="mb-3">
              {error}
            </Alert>
          )}
          {success && (
            <Alert color="success" className="mb-3">
              {success}
            </Alert>
          )}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <CardTitle className="h4 mb-4">Kullanıcı Yönetimi</CardTitle>

                  {/* Search ve Filter */}
                  <Row className="mb-3">
                    <Col md={4}>
                      <FormGroup>
                        <Label>Arama</Label>
                        <Input
                          type="text"
                          placeholder="İsim, email veya telefon ile ara..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                      </FormGroup>
                    </Col>
                    <Col md={3}>
                      <FormGroup>
                        <Label>Rol Filtresi</Label>
                        <Input
                          type="select"
                          value={roleFilter}
                          onChange={(e) => setRoleFilter(e.target.value)}
                        >
                          <option value="">Tüm Roller</option>
                          <option value="user">Kullanıcı</option>
                          <option value="admin">Admin</option>
                          <option value="moderator">Moderatör</option>
                        </Input>
                      </FormGroup>
                    </Col>
                    <Col md={2}>
                      <FormGroup>
                        <Label>&nbsp;</Label>
                        <div>
                          <Button color="primary" onClick={handleSearch}>
                            <i className="mdi mdi-magnify me-1"></i>
                            Ara
                          </Button>
                        </div>
                      </FormGroup>
                    </Col>
                  </Row>

                  {/* Kullanıcı Tablosu */}
                  <div className="table-responsive">
                    <Table className="table table-centered table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>ID</th>
                          <th>Kullanıcı</th>
                          <th>Email</th>
                          <th>Telefon</th>
                          <th>Rol</th>
                          <th>Şehir</th>
                          <th>Durum</th>
                          <th>Kayıt Tarihi</th>
                          <th>İşlemler</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          <tr>
                            <td colSpan="9" className="text-center py-4">
                              <Spinner color="primary" />
                              <div className="mt-2">Yükleniyor...</div>
                            </td>
                          </tr>
                        ) : users.length === 0 ? (
                          <tr>
                            <td colSpan="9" className="text-center py-4">
                              Kullanıcı bulunamadı
                            </td>
                          </tr>
                        ) : (
                          users.map((user) => (
                            <tr key={user.id}>
                              <td>{user.id}</td>
                              <td>
                                <div className="d-flex align-items-center">
                                  <div className="avatar-xs me-3" style={{ position: 'relative' }}>
                                    {user.profile_image_url ? (
                                      <img
                                        src={user.profile_image_url.startsWith('http') 
                                          ? user.profile_image_url 
                                          : `${API_BASE_URL}${user.profile_image_url}`}
                                        alt={`${user.name} ${user.surname}`}
                                        className="rounded-circle"
                                        style={{ 
                                          width: '32px', 
                                          height: '32px', 
                                          objectFit: 'cover',
                                          display: 'block'
                                        }}
                                        onError={(e) => {
                                          console.log('Image load error for user:', user.id, e.target.src);
                                          e.target.style.display = 'none';
                                          const fallback = e.target.parentNode.querySelector('.avatar-title');
                                          if (fallback) fallback.style.display = 'flex';
                                        }}
                                        onLoad={() => {
                                          console.log('Image loaded successfully for user:', user.id);
                                        }}
                                      />
                                    ) : null}
                                    <span 
                                      className="avatar-title rounded-circle bg-soft-primary text-primary"
                                      style={{ 
                                        display: user.profile_image_url ? 'none' : 'flex',
                                        width: '32px',
                                        height: '32px',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '14px'
                                      }}
                                    >
                                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                                    </span>
                                  </div>
                                  <div>
                                    <h6 className="mb-0 font-size-14">
                                      {user.name} {user.surname}
                                    </h6>
                                    {user.gender && (
                                      <p className="text-muted font-size-12 mb-0">
                                        {user.gender === 'male' ? 'Erkek' : user.gender === 'female' ? 'Kadın' : user.gender}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td>{user.email}</td>
                              <td>{user.phone || '-'}</td>
                              <td>
                                <Badge color={getRoleBadgeColor(user.role)} className="font-size-12">
                                  {user.role === 'admin' ? 'Admin' : 
                                   user.role === 'moderator' ? 'Moderatör' : 'Kullanıcı'}
                                </Badge>
                              </td>
                              <td>{user.city || '-'}</td>
                              <td>
                                <Badge 
                                  color={user.is_banned ? 'danger' : 'success'} 
                                  className="font-size-12"
                                >
                                  {user.is_banned ? 'Yasaklı' : 'Aktif'}
                                </Badge>
                              </td>
                              <td>{formatDate(user.created_at)}</td>
                              <td>
                                <div className="d-flex gap-2">
                                  <Button
                                    color="info"
                                    size="sm"
                                    onClick={() => openEditModal(user)}
                                    id={`edit-${user.id}`}
                                  >
                                    <i className="mdi mdi-pencil"></i>
                                  </Button>
                                  <UncontrolledTooltip placement="top" target={`edit-${user.id}`}>
                                    Düzenle
                                  </UncontrolledTooltip>

                                  {user.is_banned ? (
                                    <Button
                                      color="success"
                                      size="sm"
                                      onClick={() => openUnbanModal(user)}
                                      id={`unban-${user.id}`}
                                    >
                                      <i className="mdi mdi-check-circle"></i>
                                    </Button>
                                  ) : (
                                    <Button
                                      color="warning"
                                      size="sm"
                                      onClick={() => openBanModal(user)}
                                      id={`ban-${user.id}`}
                                    >
                                      <i className="mdi mdi-block-helper"></i>
                                    </Button>
                                  )}
                                  <UncontrolledTooltip placement="top" target={user.is_banned ? `unban-${user.id}` : `ban-${user.id}`}>
                                    {user.is_banned ? 'Ban Kaldır' : 'Ban'}
                                  </UncontrolledTooltip>

                                  <Button
                                    color="secondary"
                                    size="sm"
                                    onClick={() => openBanHistoryModal(user)}
                                    id={`history-${user.id}`}
                                  >
                                    <i className="mdi mdi-history"></i>
                                  </Button>
                                  <UncontrolledTooltip placement="top" target={`history-${user.id}`}>
                                    Ban Geçmişi
                                  </UncontrolledTooltip>

                                  <Button
                                    color="danger"
                                    size="sm"
                                    onClick={() => openDeleteModal(user)}
                                    id={`delete-${user.id}`}
                                  >
                                    <i className="mdi mdi-delete"></i>
                                  </Button>
                                  <UncontrolledTooltip placement="top" target={`delete-${user.id}`}>
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
                  {totalPages > 1 && (
                    <Row className="mt-4">
                      <Col>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            Toplam {totalUsers} kullanıcı, {totalPages} sayfa
                          </div>
                          <div className="d-flex gap-2">
                            <Button
                              color="primary"
                              outline
                              size="sm"
                              disabled={currentPage === 1}
                              onClick={() => handlePageChange(currentPage - 1)}
                            >
                              <i className="mdi mdi-chevron-left"></i>
                            </Button>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                              const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                              return (
                                <Button
                                  key={page}
                                  color={currentPage === page ? "primary" : "primary"}
                                  outline={currentPage !== page}
                                  size="sm"
                                  onClick={() => handlePageChange(page)}
                                >
                                  {page}
                                </Button>
                              );
                            })}
                            
                            <Button
                              color="primary"
                              outline
                              size="sm"
                              disabled={currentPage === totalPages}
                              onClick={() => handlePageChange(currentPage + 1)}
                            >
                              <i className="mdi mdi-chevron-right"></i>
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

           {/* Edit Modal */}
           <Modal isOpen={editModal} toggle={() => setEditModal(false)} size="xl">
             <ModalHeader toggle={() => setEditModal(false)}>
               Kullanıcı Düzenle
             </ModalHeader>
             <ModalBody>
               <Form>
                 {/* Profil Resmi Bölümü */}
                 <Row className="mb-4">
                   <Col md={12}>
                     <FormGroup>
                       <Label>Profil Resmi</Label>
                       <div className="d-flex align-items-center gap-3">
                         <div className="avatar-lg">
                           {profileImagePreview || formData.profile_image_url ? (
                             <img
                               src={profileImagePreview || (formData.profile_image_url.startsWith('http') 
                                 ? formData.profile_image_url 
                                 : `${API_BASE_URL}${formData.profile_image_url}`)}
                               alt="Profil"
                               className="rounded-circle"
                               style={{ 
                                 width: '80px', 
                                 height: '80px', 
                                 objectFit: 'cover' 
                               }}
                             />
                           ) : (
                             <span 
                               className="avatar-title rounded-circle bg-soft-primary text-primary"
                               style={{ 
                                 width: '80px',
                                 height: '80px',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 fontSize: '24px'
                               }}
                             >
                               {formData.name ? formData.name.charAt(0).toUpperCase() : 'U'}
                             </span>
                           )}
                         </div>
                         <div>
                           <Input
                             type="file"
                             accept="image/*"
                             onChange={handleProfileImageChange}
                             className="mb-2"
                           />
                           <div className="d-flex gap-2">
                             <Button
                               color="danger"
                               size="sm"
                               outline
                               onClick={removeProfileImage}
                               disabled={!profileImagePreview && !formData.profile_image_url}
                             >
                               <i className="mdi mdi-delete me-1"></i>
                               Resmi Kaldır
                             </Button>
                           </div>
                           <small className="text-muted">
                             Maksimum dosya boyutu: 5MB. Desteklenen formatlar: JPG, PNG, GIF
                           </small>
                         </div>
                       </div>
                     </FormGroup>
                   </Col>
                 </Row>

                 {/* Temel Bilgiler */}
                 <Row>
                   <Col md={6}>
                     <FormGroup>
                       <Label>Ad *</Label>
                       <Input
                         type="text"
                         name="name"
                         value={formData.name}
                         onChange={handleInputChange}
                         placeholder="Ad"
                       />
                     </FormGroup>
                   </Col>
                   <Col md={6}>
                     <FormGroup>
                       <Label>Soyad *</Label>
                       <Input
                         type="text"
                         name="surname"
                         value={formData.surname}
                         onChange={handleInputChange}
                         placeholder="Soyad"
                       />
                     </FormGroup>
                   </Col>
                 </Row>
                 <Row>
                   <Col md={6}>
                     <FormGroup>
                       <Label>Email *</Label>
                       <Input
                         type="email"
                         name="email"
                         value={formData.email}
                         onChange={handleInputChange}
                         placeholder="Email"
                       />
                     </FormGroup>
                   </Col>
                   <Col md={6}>
                     <FormGroup>
                       <Label>Telefon</Label>
                       <Input
                         type="text"
                         name="phone"
                         value={formData.phone}
                         onChange={handleInputChange}
                         placeholder="Telefon"
                       />
                     </FormGroup>
                   </Col>
                 </Row>
                 <Row>
                   <Col md={4}>
                     <FormGroup>
                       <Label>Rol *</Label>
                       <Input
                         type="select"
                         name="role"
                         value={formData.role}
                         onChange={handleInputChange}
                       >
                         <option value="user">Kullanıcı</option>
                         <option value="admin">Admin</option>
                         <option value="moderator">Moderatör</option>
                       </Input>
                     </FormGroup>
                   </Col>
                   <Col md={4}>
                     <FormGroup>
                       <Label>Cinsiyet</Label>
                       <Input
                         type="select"
                         name="gender"
                         value={formData.gender}
                         onChange={handleInputChange}
                       >
                         <option value="">Seçiniz</option>
                         <option value="male">Erkek</option>
                         <option value="female">Kadın</option>
                       </Input>
                     </FormGroup>
                   </Col>
                   <Col md={4}>
                     <FormGroup>
                       <Label>Şehir</Label>
                       <Input
                         type="text"
                         name="city"
                         value={formData.city}
                         onChange={handleInputChange}
                         placeholder="Şehir"
                       />
                     </FormGroup>
                   </Col>
                 </Row>

                 {/* Ek Bilgiler */}
                 <Row>
                   <Col md={6}>
                     <FormGroup>
                       <Label>Doğum Tarihi</Label>
                       <Input
                         type="date"
                         name="birthday"
                         value={formData.birthday ? formData.birthday.split('T')[0] : ''}
                         onChange={handleInputChange}
                       />
                     </FormGroup>
                   </Col>
                   <Col md={6}>
                     <FormGroup>
                       <Label>Abonelik Bitiş Tarihi</Label>
                       <Input
                         type="date"
                         name="subscription_end_date"
                         value={formData.subscription_end_date ? formData.subscription_end_date.split('T')[0] : ''}
                         onChange={handleInputChange}
                       />
                     </FormGroup>
                   </Col>
                 </Row>

                 {/* Hakkında */}
                 <Row>
                   <Col md={12}>
                     <FormGroup>
                       <Label>Hakkında</Label>
                       <Input
                         type="textarea"
                         name="about"
                         value={formData.about}
                         onChange={handleInputChange}
                         placeholder="Kullanıcı hakkında bilgi..."
                         rows="3"
                       />
                     </FormGroup>
                   </Col>
                 </Row>

                 {/* Sosyal Medya Linkleri */}
                 <Row>
                   <Col md={12}>
                     <h6 className="mb-3">Sosyal Medya Linkleri</h6>
                   </Col>
                 </Row>
                 <Row>
                   <Col md={6}>
                     <FormGroup>
                       <Label>Instagram URL</Label>
                       <Input
                         type="url"
                         name="instagram_url"
                         value={formData.instagram_url}
                         onChange={handleInputChange}
                         placeholder="https://instagram.com/kullanici"
                       />
                     </FormGroup>
                   </Col>
                   <Col md={6}>
                     <FormGroup>
                       <Label>Facebook URL</Label>
                       <Input
                         type="url"
                         name="facebook_url"
                         value={formData.facebook_url}
                         onChange={handleInputChange}
                         placeholder="https://facebook.com/kullanici"
                       />
                     </FormGroup>
                   </Col>
                 </Row>
                 <Row>
                   <Col md={6}>
                     <FormGroup>
                       <Label>WhatsApp URL</Label>
                       <Input
                         type="url"
                         name="whatsapp_url"
                         value={formData.whatsapp_url}
                         onChange={handleInputChange}
                         placeholder="https://wa.me/905xxxxxxxxx"
                       />
                     </FormGroup>
                   </Col>
                   <Col md={6}>
                     <FormGroup>
                       <Label>LinkedIn URL</Label>
                       <Input
                         type="url"
                         name="linkedin_url"
                         value={formData.linkedin_url}
                         onChange={handleInputChange}
                         placeholder="https://linkedin.com/in/kullanici"
                       />
                     </FormGroup>
                   </Col>
                 </Row>
               </Form>
             </ModalBody>
             <ModalFooter>
               <Button color="secondary" onClick={() => setEditModal(false)}>
                 İptal
               </Button>
               <Button color="primary" onClick={updateUser}>
                 Güncelle
               </Button>
             </ModalFooter>
           </Modal>

           {/* Delete Modal */}
           <Modal isOpen={deleteModal} toggle={() => setDeleteModal(false)}>
             <ModalHeader toggle={() => setDeleteModal(false)}>
               Kullanıcı Sil
             </ModalHeader>
             <ModalBody>
               <p>
                 <strong>{selectedUser?.name} {selectedUser?.surname}</strong> kullanıcısını silmek istediğinizden emin misiniz?
               </p>
               <p className="text-muted">
                 Bu işlem geri alınamaz ve kullanıcının tüm verileri silinecektir.
               </p>
             </ModalBody>
             <ModalFooter>
               <Button color="secondary" onClick={() => setDeleteModal(false)}>
                 İptal
               </Button>
               <Button color="danger" onClick={deleteUser}>
                 Sil
               </Button>
             </ModalFooter>
           </Modal>

           {/* Ban Modal */}
           <Modal isOpen={banModal} toggle={() => setBanModal(false)}>
             <ModalHeader toggle={() => setBanModal(false)}>
               Kullanıcı Ban
             </ModalHeader>
             <ModalBody>
               {userBanStatus && userBanStatus.is_active ? (
                 <Alert color="warning">
                   Bu kullanıcı zaten banlanmış durumda. 
                   {userBanStatus.banned_until ? 
                     ` Ban süresi: ${formatBanDuration(userBanStatus.created_at, userBanStatus.banned_until)}` : 
                     ' Kalıcı ban.'
                   }
                 </Alert>
               ) : null}
               
               <Form>
                 <FormGroup>
                   <Label>Ban Sebebi *</Label>
                   <Input
                     type="textarea"
                     name="reason"
                     value={banData.reason}
                     onChange={handleBanInputChange}
                     placeholder="Ban sebebini açıklayın..."
                     rows="3"
                     required
                   />
                 </FormGroup>
                 
                 <FormGroup>
                   <Label>Ban Türü *</Label>
                   <Input
                     type="select"
                     name="banType"
                     value={banData.banType}
                     onChange={handleBanInputChange}
                   >
                     <option value="temporary">Geçici Ban</option>
                     <option value="permanent">Kalıcı Ban</option>
                   </Input>
                 </FormGroup>
                 
                 {banData.banType === 'temporary' && (
                   <FormGroup>
                     <Label>Ban Süresi (Saat) *</Label>
                     <Input
                       type="number"
                       name="banDuration"
                       value={banData.banDuration}
                       onChange={handleBanInputChange}
                       min="1"
                       max="8760"
                       placeholder="Saat cinsinden ban süresi"
                     />
                     <small className="text-muted">
                       Maksimum 8760 saat (1 yıl) ban verebilirsiniz.
                     </small>
                   </FormGroup>
                 )}
               </Form>
               
               <p className="text-muted mt-3">
                 <strong>{selectedUser?.name} {selectedUser?.surname}</strong> kullanıcısını banlamak istediğinizden emin misiniz?
               </p>
             </ModalBody>
             <ModalFooter>
               <Button color="secondary" onClick={() => setBanModal(false)}>
                 İptal
               </Button>
               <Button 
                 color="warning" 
                 onClick={banUser}
                 disabled={!banData.reason.trim()}
               >
                 Ban Uygula
               </Button>
             </ModalFooter>
           </Modal>

           {/* Unban Modal */}
           <Modal isOpen={unbanModal} toggle={() => setUnbanModal(false)}>
             <ModalHeader toggle={() => setUnbanModal(false)}>
               Ban Kaldır
             </ModalHeader>
             <ModalBody>
               <p>
                 <strong>{selectedUser?.name} {selectedUser?.surname}</strong> kullanıcısının banını kaldırmak istediğinizden emin misiniz?
               </p>
               <p className="text-muted">
                 Bu işlem kullanıcının uygulamaya tekrar erişim sağlamasına olanak tanır.
               </p>
             </ModalBody>
             <ModalFooter>
               <Button color="secondary" onClick={() => setUnbanModal(false)}>
                 İptal
               </Button>
               <Button color="success" onClick={unbanUser}>
                 Ban Kaldır
               </Button>
             </ModalFooter>
           </Modal>

           {/* Ban History Modal */}
           <Modal isOpen={banHistoryModal} toggle={() => setBanHistoryModal(false)} size="lg">
             <ModalHeader toggle={() => setBanHistoryModal(false)}>
               Ban Geçmişi - {selectedUser?.name} {selectedUser?.surname}
             </ModalHeader>
             <ModalBody>
               {banHistory.length === 0 ? (
                 <p className="text-center text-muted">Bu kullanıcının ban geçmişi bulunmamaktadır.</p>
               ) : (
                 <div className="table-responsive">
                   <Table className="table table-centered table-nowrap mb-0">
                     <thead className="table-light">
                       <tr>
                         <th>Tarih</th>
                         <th>Sebep</th>
                         <th>Süre</th>
                         <th>Banlayan</th>
                         <th>Durum</th>
                       </tr>
                     </thead>
                     <tbody>
                       {banHistory.map((ban, index) => (
                         <tr key={index}>
                           <td>{formatDate(ban.created_at)}</td>
                           <td>{ban.reason}</td>
                           <td>
                             {formatBanDuration(ban.created_at, ban.banned_until)}
                           </td>
                           <td>{ban.banned_by_name || 'Sistem'}</td>
                           <td>
                             <Badge color={ban.is_active ? 'danger' : 'success'}>
                               {ban.is_active ? 'Aktif' : 'Sona Erdi'}
                             </Badge>
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </Table>
                 </div>
               )}
             </ModalBody>
             <ModalFooter>
               <Button color="secondary" onClick={() => setBanHistoryModal(false)}>
                 Kapat
               </Button>
             </ModalFooter>
           </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default UserManagement;