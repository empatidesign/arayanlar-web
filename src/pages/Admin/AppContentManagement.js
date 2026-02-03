import React, { useState, useEffect } from "react";
import { Row, Col, Card, CardBody, Button, Form, FormGroup, Label, Input, Alert } from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, put } from "../../helpers/backend_helper";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const AppContentManagement = () => {
  const [termsContent, setTermsContent] = useState(null);
  const [howItWorksContent, setHowItWorksContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [termsFormData, setTermsFormData] = useState({
    title: '',
    content: '',
    is_active: true
  });
  const [howItWorksFormData, setHowItWorksFormData] = useState({
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
      // Kullanım Şartları
      const termsData = await get('/api/app-content/terms_and_privacy');
      if (termsData.success) {
        setTermsContent(termsData.data);
        setTermsFormData({
          title: termsData.data.title,
          content: termsData.data.content,
          is_active: termsData.data.is_active
        });
      }

      // Nasıl Çalışır
      const howItWorksData = await get('/api/app-content/how_it_works');
      if (howItWorksData.success) {
        setHowItWorksContent(howItWorksData.data);
        setHowItWorksFormData({
          title: howItWorksData.data.title,
          content: howItWorksData.data.content,
          is_active: howItWorksData.data.is_active
        });
      }
    } catch (error) {
      setMessage({ type: 'danger', text: 'İçerik yüklenirken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTerms = async () => {
    if (!termsFormData.title || !termsFormData.content) {
      setMessage({ type: 'warning', text: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await put(`/api/app-content/admin/${termsContent.id}`, termsFormData);
      setMessage({ type: 'success', text: 'Kullanım Şartları başarıyla güncellendi!' });
      await fetchContent();
    } catch (error) {
      setMessage({ type: 'danger', text: 'İçerik güncellenirken hata oluştu.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveHowItWorks = async () => {
    if (!howItWorksFormData.title || !howItWorksFormData.content) {
      setMessage({ type: 'warning', text: 'Lütfen tüm alanları doldurun.' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });
    
    try {
      await put(`/api/app-content/admin/${howItWorksContent.id}`, howItWorksFormData);
      setMessage({ type: 'success', text: 'Nasıl Çalışır içeriği başarıyla güncellendi!' });
      await fetchContent();
    } catch (error) {
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

          {message.text && (
            <Alert color={message.type} className="mb-4">
              {message.text}
            </Alert>
          )}

          {/* Kullanım Şartları ve Gizlilik Politikası */}
          <Row className="mb-4">
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

                  <Form>
                    <FormGroup>
                      <Label for="terms-title">Başlık</Label>
                      <Input
                        type="text"
                        id="terms-title"
                        value={termsFormData.title}
                        onChange={(e) => setTermsFormData({ ...termsFormData, title: e.target.value })}
                        placeholder="Örn: Kullanım Şartları ve Gizlilik Politikası"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label for="terms-content">İçerik</Label>
                      <div className="mb-3">
                        <small className="text-muted">
                          İpucu: Kullanım şartları ve gizlilik politikasını aynı içerikte yazabilirsiniz. 
                          Başlıklar için H2 kullanın.
                        </small>
                      </div>
                      <ReactQuill
                        theme="snow"
                        value={termsFormData.content}
                        onChange={(value) => setTermsFormData({ ...termsFormData, content: value })}
                        modules={modules}
                        style={{ height: '400px', marginBottom: '60px' }}
                      />
                    </FormGroup>

                    <FormGroup check className="mb-4">
                      <Input
                        type="checkbox"
                        id="terms-is-active"
                        checked={termsFormData.is_active}
                        onChange={(e) => setTermsFormData({ ...termsFormData, is_active: e.target.checked })}
                      />
                      <Label check for="terms-is-active">
                        Aktif (Mobile uygulamada göster)
                      </Label>
                    </FormGroup>

                    <div className="d-flex gap-2">
                      <Button 
                        color="primary" 
                        onClick={handleSaveTerms}
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

          {/* Nasıl Çalışır */}
          <Row>
            <Col xs="12">
              <Card>
                <CardBody>
                  <div className="mb-4">
                    <h4 className="card-title">Nasıl Çalışır?</h4>
                    <p className="text-muted">
                      Login ekranında gösterilecek "Nasıl Çalışır?" içeriğini buradan düzenleyebilirsiniz. 
                      Değişiklikler anında mobile uygulamada görünür olacaktır.
                    </p>
                  </div>

                  <Form>
                    <FormGroup>
                      <Label for="how-title">Başlık</Label>
                      <Input
                        type="text"
                        id="how-title"
                        value={howItWorksFormData.title}
                        onChange={(e) => setHowItWorksFormData({ ...howItWorksFormData, title: e.target.value })}
                        placeholder="Örn: Nasıl Çalışır?"
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label for="how-content">İçerik</Label>
                      <div className="mb-3">
                        <small className="text-muted">
                          İpucu: Platformun nasıl çalıştığını adım adım anlatın. 
                          Başlıklar için H2 ve H3 kullanın.
                        </small>
                      </div>
                      <ReactQuill
                        theme="snow"
                        value={howItWorksFormData.content}
                        onChange={(value) => setHowItWorksFormData({ ...howItWorksFormData, content: value })}
                        modules={modules}
                        style={{ height: '400px', marginBottom: '60px' }}
                      />
                    </FormGroup>

                    <FormGroup check className="mb-4">
                      <Input
                        type="checkbox"
                        id="how-is-active"
                        checked={howItWorksFormData.is_active}
                        onChange={(e) => setHowItWorksFormData({ ...howItWorksFormData, is_active: e.target.checked })}
                      />
                      <Label check for="how-is-active">
                        Aktif (Mobile uygulamada göster)
                      </Label>
                    </FormGroup>

                    <div className="d-flex gap-2">
                      <Button 
                        color="primary" 
                        onClick={handleSaveHowItWorks}
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
