import React, { useState, useEffect } from "react";
import {
  Row, Col, Card, CardBody, CardHeader,
  Button, FormGroup, Label, Input, Spinner, Alert
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, put, post } from "../../helpers/backend_helper";

const EXTENSION_KEYS = [
  { key: "payment_extension_price_car",     label: "Araç İlanı Uzatma Ücreti (TL)" },
  { key: "payment_extension_price_watch",   label: "Saat İlanı Uzatma Ücreti (TL)" },
  { key: "payment_extension_price_housing", label: "Konut İlanı Uzatma Ücreti (TL)" },
  { key: "payment_extension_days",          label: "Uzatma Süresi (Gün)" },
];

const PREMIUM_KEYS = [
  { key: "payment_premium_price", label: "Ciddi Alıcı Paketi Ücreti (TL)" },
  { key: "payment_premium_days",  label: "Ciddi Alıcı Paketi Süresi (Gün)" },
];

const SERIOUS_BADGE_IMAGE_KEY = "payment_serious_buyer_badge_image";
const NUMERIC_KEYS = [...EXTENSION_KEYS, ...PREMIUM_KEYS];

const buildImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;

  const apiUrl = process.env.REACT_APP_API_URL || "";
  const baseUrl = apiUrl.endsWith("/api") ? apiUrl.slice(0, -4) : apiUrl;
  const normalizedPath = imagePath.startsWith("/") ? imagePath : `/${imagePath}`;
  return `${baseUrl}${normalizedPath}`;
};

const PricingSettings = () => {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingBadgeImage, setUploadingBadgeImage] = useState(false);
  const [alert, setAlert] = useState({ type: "", text: "" });

  document.title = "Fiyat Ayarları | Arayanvar Admin";

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await get("/api/admin/settings");
      if (data.success) {
        const flat = {};
        Object.values(data.data).forEach(group =>
          group.forEach(s => { flat[s.key] = s.value; })
        );
        if (flat[SERIOUS_BADGE_IMAGE_KEY] === undefined) {
          flat[SERIOUS_BADGE_IMAGE_KEY] = "";
        }
        setValues(flat);
      }
    } catch (err) {
      setAlert({ type: "danger", text: "Ayarlar yüklenirken hata oluştu." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  const handleSave = async () => {
    // Validasyon
    for (const { key, label } of NUMERIC_KEYS) {
      const v = parseFloat(values[key]);
      if (isNaN(v) || v <= 0) {
        setAlert({ type: "danger", text: `"${label}" için geçerli bir değer girin.` });
        return;
      }
    }

    try {
      setSaving(true);
      setAlert({ type: "", text: "" });

      const settings = NUMERIC_KEYS.map(({ key }) => ({ key, value: values[key] }));
      if ((values[SERIOUS_BADGE_IMAGE_KEY] || "").trim()) {
        settings.push({
          key: SERIOUS_BADGE_IMAGE_KEY,
          value: values[SERIOUS_BADGE_IMAGE_KEY].trim(),
        });
      }

      const data = await put("/api/admin/settings", { settings });

      if (data.success) {
        setAlert({ type: "success", text: "Ayarlar başarıyla kaydedildi." });
      } else {
        setAlert({ type: "danger", text: data.message || "Kaydetme başarısız." });
      }
    } catch (err) {
      setAlert({ type: "danger", text: "Ayarlar kaydedilirken hata oluştu." });
    } finally {
      setSaving(false);
    }
  };

  const handleBadgeImageUpload = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
      setAlert({ type: "danger", text: "Lütfen sadece resim dosyası seçin." });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setAlert({ type: "danger", text: "Resim boyutu 5MB'dan büyük olamaz." });
      return;
    }

    try {
      setUploadingBadgeImage(true);
      setAlert({ type: "", text: "" });

      const formData = new FormData();
      formData.append("image", file);

      const data = await post("/api/admin/settings/serious-buyer-badge-image", formData);
      if (data.success && data.data && data.data.value) {
        setValues(prev => ({ ...prev, [SERIOUS_BADGE_IMAGE_KEY]: data.data.value }));
        setAlert({ type: "success", text: "Etiket görseli güncellendi." });
      } else {
        setAlert({ type: "danger", text: data.message || "Görsel yüklenemedi." });
      }
    } catch (err) {
      setAlert({ type: "danger", text: "Görsel yüklenirken hata oluştu." });
    } finally {
      setUploadingBadgeImage(false);
      e.target.value = "";
    }
  };

  const seriousBadgeImagePreview = buildImageUrl(values[SERIOUS_BADGE_IMAGE_KEY]);

  return (
    <div className="page-content">
      <div className="container-fluid">
        <Breadcrumbs title="Ayarlar" breadcrumbItem="Fiyat Ayarları" />

        {alert.text && (
          <Alert color={alert.type} toggle={() => setAlert({ type: "", text: "" })}>
            {alert.text}
          </Alert>
        )}

        <Row>
          <Col lg={6}>
            <Card>
              <CardHeader>
                <h5 className="mb-0">İlan Uzatma Ücretleri</h5>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <>
                    {EXTENSION_KEYS.map(({ key, label }) => (
                      <FormGroup key={key} row>
                        <Label sm={7}>{label}</Label>
                        <Col sm={5}>
                          <Input
                            type="number"
                            min="0"
                            step={key === "payment_extension_days" ? "1" : "0.01"}
                            value={values[key] || ""}
                            onChange={e => handleChange(key, e.target.value)}
                          />
                        </Col>
                      </FormGroup>
                    ))}
                  </>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h5 className="mb-0">Ciddi Alıcı Paketi</h5>
              </CardHeader>
              <CardBody>
                {loading ? (
                  <div className="text-center py-4">
                    <Spinner color="primary" />
                  </div>
                ) : (
                  <>
                    {PREMIUM_KEYS.map(({ key, label }) => (
                      <FormGroup key={key} row>
                        <Label sm={7}>{label}</Label>
                        <Col sm={5}>
                          <Input
                            type="number"
                            min="0"
                            step={key === "payment_premium_days" ? "1" : "0.01"}
                            value={values[key] || ""}
                            onChange={e => handleChange(key, e.target.value)}
                          />
                        </Col>
                      </FormGroup>
                    ))}

                    <hr />

                    <FormGroup>
                      <Label>Ciddi Alıcı Etiketi Görseli (URL)</Label>
                      <Input
                        type="text"
                        placeholder="https://... veya /uploads/..."
                        value={values[SERIOUS_BADGE_IMAGE_KEY] || ""}
                        onChange={e => handleChange(SERIOUS_BADGE_IMAGE_KEY, e.target.value)}
                      />
                    </FormGroup>

                    <FormGroup>
                      <Label>Görsel Yükle</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleBadgeImageUpload}
                        disabled={uploadingBadgeImage}
                      />
                      {uploadingBadgeImage && (
                        <div className="mt-2">
                          <Spinner size="sm" color="primary" className="me-2" />
                          Yükleniyor...
                        </div>
                      )}
                    </FormGroup>

                    {seriousBadgeImagePreview && (
                      <div className="mt-3">
                        <Label className="d-block">Önizleme</Label>
                        <img
                          src={seriousBadgeImagePreview}
                          alt="Ciddi Alıcı Etiketi"
                          style={{
                            width: 180,
                            height: 180,
                            objectFit: "contain",
                            border: "1px solid #e9ecef",
                            borderRadius: 8,
                            padding: 8,
                            background: "#fff",
                          }}
                        />
                      </div>
                    )}
                  </>
                )}
              </CardBody>
            </Card>

            <div className="text-end mb-4">
              <Button color="primary" onClick={handleSave} disabled={saving || loading}>
                {saving ? <Spinner size="sm" className="me-1" /> : null}
                Kaydet
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PricingSettings;
