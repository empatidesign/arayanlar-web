import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Button,
  Alert,
  Table,
  Input,
  Label,
  FormGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import { get, put } from '../../helpers/backend_helper';

const ListingSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [previewModal, setPreviewModal] = useState(false);

  const dayNames = {
    0: 'Pazar',
    1: 'Pazartesi',
    2: 'Salı',
    3: 'Çarşamba',
    4: 'Perşembe',
    5: 'Cuma',
    6: 'Cumartesi'
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await get('/api/listing-schedule/admin/schedule');
      
      if (response.success) {
        // Günleri sırala ve eksik günleri ekle
        const sortedSchedules = [];
        for (let day = 0; day <= 6; day++) {
          const existingSchedule = response.data.find(s => s.day_of_week === day);
          if (existingSchedule) {
            sortedSchedules.push(existingSchedule);
          } else {
            // Eksik gün için varsayılan değer
            sortedSchedules.push({
              day_of_week: day,
              start_time: '09:00',
              end_time: '18:00',
              is_active: false
            });
          }
        }
        setSchedules(sortedSchedules);
      } else {
        setError('İlan verme saatleri yüklenirken hata oluştu');
      }
    } catch (error) {
      setError('İlan verme saatleri yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (dayIndex, field, value) => {
    const updatedSchedules = [...schedules];
    updatedSchedules[dayIndex] = {
      ...updatedSchedules[dayIndex],
      [field]: value
    };
    setSchedules(updatedSchedules);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      // Validation
      for (const schedule of schedules) {
        if (schedule.is_active) {
          if (!schedule.start_time || !schedule.end_time) {
            setError('Aktif günler için başlangıç ve bitiş saati zorunludur');
            return;
          }
          if (schedule.start_time >= schedule.end_time) {
            setError('Başlangıç saati bitiş saatinden önce olmalıdır');
            return;
          }
        }
      }

      const response = await put('/api/listing-schedule/admin/schedule', {
        schedules: schedules
      });

      if (response.success) {
        setSuccess('İlan verme saatleri başarıyla güncellendi');
        fetchSchedules(); // Refresh data
      } else {
        setError(response.message || 'Güncelleme sırasında hata oluştu');
      }
    } catch (error) {
      setError('Güncelleme sırasında hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  const toggleAllDays = (active) => {
    const updatedSchedules = schedules.map(schedule => ({
      ...schedule,
      is_active: active
    }));
    setSchedules(updatedSchedules);
  };

  const setWorkingHours = (startTime, endTime) => {
    const updatedSchedules = schedules.map(schedule => ({
      ...schedule,
      start_time: startTime,
      end_time: endTime
    }));
    setSchedules(updatedSchedules);
  };

  const getActiveSchedulesPreview = () => {
    return schedules.filter(s => s.is_active).map(s => ({
      day: dayNames[s.day_of_week],
      time: `${s.start_time} - ${s.end_time}`
    }));
  };

  if (loading) {
    return (
      <div className="page-content">
        <Container fluid>
          <div className="text-center">
            <div className="spinner-border" role="status">
              <span className="sr-only">Yükleniyor...</span>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <Breadcrumbs title="Admin" breadcrumbItem="İlan Verme Saatleri" />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="card-title">İlan Verme Saatleri Yönetimi</h4>
                    <div className="d-flex gap-2">
                      <Button
                        color="info"
                        size="sm"
                        onClick={() => setPreviewModal(true)}
                      >
                        <i className="mdi mdi-eye me-1"></i>
                        Önizleme
                      </Button>
                      <Button
                        color="success"
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <i className="mdi mdi-loading mdi-spin me-1"></i>
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <i className="mdi mdi-check me-1"></i>
                            Kaydet
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {error && (
                    <Alert color="danger" className="mb-4">
                      {error}
                    </Alert>
                  )}

                  {success && (
                    <Alert color="success" className="mb-4">
                      {success}
                    </Alert>
                  )}

                  {/* Hızlı Ayarlar */}
                  <Card className="mb-4">
                    <CardBody>
                      <h5 className="card-title">Hızlı Ayarlar</h5>
                      <Row>
                        <Col md="6">
                          <div className="d-flex gap-2 mb-2">
                            <Button
                              color="outline-primary"
                              size="sm"
                              onClick={() => toggleAllDays(true)}
                            >
                              Tüm Günleri Aç
                            </Button>
                            <Button
                              color="outline-secondary"
                              size="sm"
                              onClick={() => toggleAllDays(false)}
                            >
                              Tüm Günleri Kapat
                            </Button>
                          </div>
                        </Col>
                        <Col md="6">
                          <div className="d-flex gap-2 mb-2">
                       
                          
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>

                  {/* Günlük Ayarlar */}
                  <div className="table-responsive">
                    <Table className="table table-centered table-nowrap mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Gün</th>
                          <th>Aktif</th>
                          <th>Başlangıç Saati</th>
                          <th>Bitiş Saati</th>
                          <th>Durum</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedules.map((schedule, index) => (
                          <tr key={schedule.day_of_week}>
                            <td>
                              <strong>{dayNames[schedule.day_of_week]}</strong>
                            </td>
                            <td>
                              <FormGroup check className="mb-0">
                                <Input
                                  type="checkbox"
                                  checked={schedule.is_active}
                                  onChange={(e) => handleScheduleChange(index, 'is_active', e.target.checked)}
                                />
                              </FormGroup>
                            </td>
                            <td>
                              <Input
                                type="time"
                                value={schedule.start_time}
                                onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                                disabled={!schedule.is_active}
                                style={{ width: '120px' }}
                              />
                            </td>
                            <td>
                              <Input
                                type="time"
                                value={schedule.end_time}
                                onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                                disabled={!schedule.is_active}
                                style={{ width: '120px' }}
                              />
                            </td>
                            <td>
                              {schedule.is_active ? (
                                <span className="badge badge-soft-success">
                                  Aktif ({schedule.start_time} - {schedule.end_time})
                                </span>
                              ) : (
                                <span className="badge badge-soft-secondary">
                                  Kapalı
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>

                  <div className="mt-4">
                    <div className="alert alert-info">
                      <h6 className="alert-heading">Bilgi:</h6>
                      <ul className="mb-0">
                        <li>İlan verme saatleri kullanıcıların ilan verebileceği zaman dilimlerini belirler</li>
                        <li>Aktif olmayan günlerde kullanıcılar ilan veremez</li>
                        <li>Saatler 24 saat formatında (HH:MM) girilmelidir</li>
                        <li>Başlangıç saati bitiş saatinden önce olmalıdır</li>
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>

          {/* Önizleme Modal */}
          <Modal isOpen={previewModal} toggle={() => setPreviewModal(!previewModal)}>
            <ModalHeader toggle={() => setPreviewModal(!previewModal)}>
              İlan Verme Saatleri Önizlemesi
            </ModalHeader>
            <ModalBody>
              <h6>Aktif İlan Verme Saatleri:</h6>
              {getActiveSchedulesPreview().length > 0 ? (
                <div className="table-responsive">
                  <Table size="sm">
                    <thead>
                      <tr>
                        <th>Gün</th>
                        <th>Saat Aralığı</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getActiveSchedulesPreview().map((item, index) => (
                        <tr key={index}>
                          <td><strong>{item.day}</strong></td>
                          <td>{item.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="alert alert-warning">
                  Hiç aktif gün bulunmuyor. Kullanıcılar ilan veremeyecek.
                </div>
              )}
            </ModalBody>
            <ModalFooter>
              <Button color="secondary" onClick={() => setPreviewModal(false)}>
                Kapat
              </Button>
            </ModalFooter>
          </Modal>
        </Container>
      </div>
    </React.Fragment>
  );
};

export default ListingSchedule;