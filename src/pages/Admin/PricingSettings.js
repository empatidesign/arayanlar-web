import React, { useState, useEffect } from "react";
import {
  Row, Col, Card, CardBody, CardHeader,
  Button, FormGroup, Label, Input, Spinner, Alert
} from "reactstrap";
import Breadcrumbs from "../../components/Common/Breadcrumb";
import { get, put } from "../../helpers/backend_helper";

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

const ALL_KEYS = [...EXTENSION_KEYS, ...PREMIUM_KEYS];

const PricingSettings = () => {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
    for (const { key, label } of ALL_KEYS) {
      const v = parseFloat(values[key]);
      if (isNaN(v) || v <= 0) {
        setAlert({ type: "danger", text: `"${label}" için geçerli bir değer girin.` });
        return;
      }
    }

    try {
      setSaving(true);
      setAlert({ type: "", text: "" });

      const settings = ALL_KEYS.map(({ key }) => ({ key, value: values[key] }));
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
                            value={values[key] ?? ""}
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
                            value={values[key] ?? ""}
                            onChange={e => handleChange(key, e.target.value)}
                          />
                        </Col>
                      </FormGroup>
                    ))}
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
