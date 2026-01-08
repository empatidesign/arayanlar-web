import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, put } from "../../helpers/backend_helper";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AppContentManagement = () => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    is_active: true
  });

  document.title = "Uygulama İçerik Yönetimi | Arayanvar Admin";

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const data = await get('/api/app-content/terms_and_privacy');
      if (data.success) {
        setContent(data.data);
        setFormData({
          title: data.data.title,
          content: data.data.content,
          is_active: data.data.is_active
        });
      }
    } catch (error) {
      console.error('İçerik yüklenirken hata:', error);
      setMessage({ type: 'danger', text: 'İçerik yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.content) {
      setMessage({ type: 'warning', text: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await put(`/api/app-content/admin/${content.id}`, formData);
      setMessage({ type: 'success', text: 'İçerik başarıyla güncellendi!' });
      await fetchContent();
    } catch (error) {
      console.error('İçerik güncellenirken hata:', error);
      setMessage({ type: 'danger', text: 'İçerik güncellenirken hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link'],
      ['clean']
    ],
  };

  if (loading) {
    return (
      <div className="page-content">
        <div className="container-fluid">
          <div className="text-center mt-5">
            <div className="spinner-border" role="status">
              <span className="sr-only">Yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <div className="page-content">
        <div className="container-fluid">
          <Breadcrumbs title="Admin" breadcrumbItem="Uygulama İçerik Yönetimi" />

          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="mb-4">
                    <h4 className="card-title">Kullanım Şartları ve Gizlilik Politikası</h4>
                    <p className="text-muted">
                      Login ekranında gösterilecek içeriği buradan düzenleyebilirsiniz. 
                      Değişiklikler anında mobile uygulamada görünür olacaktır.
                    </p>
                  </div>

                  {message.text && (
                    <Alert color={message.type} className="mb-4">
                      {message.text}
                    </Alert>
                  )}

                  <Form>
                    <FormGroup>
                      <Label for="title">Başlık</Label>
                      <Input
                        type="text"
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Örn: Kullanım Şartları ve Gizlilik Politikası"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label for="content">İçerik</Label>
                      <div className="mb-3">
                        <small className="text-muted">
                          İpucu: Kullanım şartları ve gizlilik politikasını aynı içerikte yazabilirsiniz. 
                          Başlıklar için H2 kullanın.
                        </small>
                      </div>
                      <ReactQuill
                        theme="snow"
                        value={formData.content}
                        onChange={(value) => setFormData({ ...formData, content: value })}
                        modules={modules}
                        style={{ height: '500px', marginBottom: '60px' }}
                      />
                    </FormGroup>

                    <FormGroup check className="mb-4">
                      <Input
                        type="checkbox"
                        id="is_active"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      />
                      <Label check for="is_active">
                        Aktif (Mobile uygulamada göster)
                      </Label>
                    </FormGroup>

                    <div className="d-flex gap-2">
                      <Button 
                        color="primary" 
                        onClick={handleSave}
                        disabled={saving}
                      >
                        {saving ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            Kaydediliyor...
                          </>
                        ) : (
                          <>
                            <i className="mdi mdi-content-save me-1"></i>
                            Kaydet
                          </>
                        )}
                      </Button>
                      <Button 
                        color="secondary" 
                        onClick={fetchContent}
                        disabled={saving}
                      >
                        <i className="mdi mdi-refresh me-1"></i>
                        Yenile
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </React.Fragment>
  );
};

export default AppContentManagement;
