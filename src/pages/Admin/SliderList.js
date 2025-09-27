import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Table, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Form, FormGroup, Label, Input } from "reactstrap";
import { Link } from "react-router-dom";
import Breadcrumbs from "../../components/Common/Breadcrumb";

const SliderList = () => {
  const [sliders, setSliders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedSlider, setSelectedSlider] = useState(null);
  
  // Yeni slider ekleme modal state'leri
  const [addModal, setAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [newSlider, setNewSlider] = useState({
    title: '',
    category: '',
    order_index: 1,
    is_active: true,
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);

  // Breadcrumb
  document.title = "Slider Yönetimi | Arayanvar Admin";

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      console.log('API URL:', process.env.REACT_APP_API_URL);
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sliders`);
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data);
        setSliders(data.data || []);
      } else {
        console.error('API yanıtı başarısız:', response.status, response.statusText);
        const errorText = await response.text();
        console.error('Hata detayı:', errorText);
      }
    } catch (error) {
      console.error('Slider listesi yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedSlider) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sliders/${selectedSlider.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        setSliders(sliders.filter(slider => slider.id !== selectedSlider.id));
        setDeleteModal(false);
        setSelectedSlider(null);
      }
    } catch (error) {
      console.error('Slider silinirken hata:', error);
    }
  };

  const toggleStatus = async (slider) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sliders/${slider.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          title: slider.title,
          category: slider.category,
          order_index: slider.order_index,
          is_active: !slider.is_active
        })
      });

      if (response.ok) {
        setSliders(sliders.map(s => 
          s.id === slider.id ? { ...s, is_active: !s.is_active } : s
        ));
      }
    } catch (error) {
      console.error('Slider durumu güncellenirken hata:', error);
    }
  };

  const updateOrder = async (sliderId, newOrder) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sliders/order`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orders: [{ id: sliderId, order_index: newOrder }]
        })
      });

      if (response.ok) {
        fetchSliders(); // Listeyi yenile
      }
    } catch (error) {
      console.error('Slider sırası güncellenirken hata:', error);
    }
  };

  // Yeni slider ekleme fonksiyonları
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewSlider(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewSlider(prev => ({ ...prev, image: file }));
      
      // Resim önizlemesi oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAddModal = () => {
    setNewSlider({
      title: '',
      category: '',
      order_index: 1,
      is_active: true,
      image: null
    });
    setImagePreview(null);
    setAddModal(false);
  };

  const handleAddSlider = async () => {
    if (!newSlider.title || !newSlider.category || !newSlider.image) {
      alert('Lütfen tüm alanları doldurun ve bir resim seçin.');
      return;
    }

    setAddLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('title', newSlider.title);
      formData.append('category', newSlider.category);
      formData.append('order_index', newSlider.order_index);
      formData.append('is_active', newSlider.is_active);
      formData.append('image', newSlider.image);

      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/sliders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setSliders(prev => [...prev, result.data]);
        resetAddModal();
        fetchSliders(); // Listeyi yenile
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Slider eklenirken hata oluştu.');
      }
    } catch (error) {
      console.error('Slider eklenirken hata:', error);
      alert('Slider eklenirken hata oluştu.');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Admin" breadcrumbItem="Slider Yönetimi" />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title">Slider Listesi</h4>
                    <div className="d-flex gap-2">
                      <Button 
                        color="primary" 
                        onClick={() => setAddModal(true)}
                      >
                        <i className="mdi mdi-plus me-1"></i>
                        Yeni Slider Ekle
                      </Button>
                      <Link to="/admin/slider/add" className="btn btn-outline-primary">
                        <i className="mdi mdi-form-select me-1"></i>
                        Form Sayfası
                      </Link>
                    </div>
                  </div>

                  {loading ? (
                    <div className="text-center">
                      <div className="spinner-border" role="status">
                        <span className="sr-only">Yükleniyor...</span>
                      </div>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <Table className="table table-centered table-nowrap mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Resim</th>
                            <th>Başlık</th>
                            <th>Kategori</th>
                            <th>Sıra</th>
                            <th>Durum</th>
                            <th>Oluşturma Tarihi</th>
                            <th>İşlemler</th>
                          </tr>
                        </thead>
                        <tbody>
                          {sliders.length > 0 ? (
                            sliders.map((slider) => (
                              <tr key={slider.id}>
                                <td>
                                  {slider.image_url ? (
                                    <img
                                      src={`${process.env.REACT_APP_API_URL}${slider.image_url}`}
                                      alt={slider.title}
                                      className="img-thumbnail"
                                      style={{ width: '80px', height: '50px', objectFit: 'cover' }}
                                      onError={(e) => {
                                        console.log('Resim yüklenemedi:', slider.image_url);
                                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iNTAiIHZpZXdCb3g9IjAgMCA4MCA1MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjUwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0yNSAyMEwzNSAzMEw0NSAyMEw1NSAzMEgyNVYyMFoiIGZpbGw9IiNEREREREQiLz4KPHN2Zz4K';
                                      }}
                                    />
                                  ) : (
                                    <div 
                                      className="img-thumbnail d-flex align-items-center justify-content-center"
                                      style={{ width: '80px', height: '50px', backgroundColor: '#f5f5f5' }}
                                    >
                                      <i className="mdi mdi-image text-muted"></i>
                                    </div>
                                  )}
                                </td>
                                <td>
                                  <h5 className="font-size-14 mb-1">