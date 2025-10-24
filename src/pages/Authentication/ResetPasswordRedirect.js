import React, { useEffect } from "react";

const ResetPasswordRedirect = () => {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token") || "";
      const encodedToken = encodeURIComponent(token);

      const schemeUrl = `arayanvar://reset-password?token=${encodedToken}`;
      const androidIntent = `intent://reset-password?token=${encodedToken}#Intent;scheme=arayanvar;package=com.arayanvar;end`;

      const ua = navigator.userAgent || "";
      const isAndroid = /Android/i.test(ua);
      const isiOS = /iPhone|iPad|iPod/i.test(ua);

      if (isAndroid) {
        // Chrome ve çoğu Android tarayıcı için intent:// daha güvenilir
        window.location.href = androidIntent;
        // Eğer açılmazsa mağazaya yönlendir
        setTimeout(() => {
          window.location.href = "https://play.google.com/store/apps/details?id=com.arayanvar";
        }, 1500);
      } else if (isiOS) {
        // iOS Safari için custom scheme
        window.location.href = schemeUrl;
        setTimeout(() => {
          // App Store fallback – yayınlanmış uygulama ID'nizle güncelleyin
          window.location.href = "https://apps.apple.com/app/id0000000000";
        }, 1500);
      } else {
        // Diğer platformlarda da en azından dene
        window.location.href = schemeUrl;
      }
    } catch (e) {
      // Sessizce yut; kullanıcı fallback ile devam eder
      // eslint-disable-next-line no-console
      console.error("Deep link yönlendirme hatası:", e);
    }
  }, []);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Arial" }}>
      <div style={{ textAlign: "center", padding: 24 }}>
        <h2 style={{ marginBottom: 12 }}>Uygulamaya yönlendiriliyor…</h2>
        <p style={{ color: "#666" }}>Az sonra Arayanvar uygulaması açılacaktır.</p>
        <p style={{ marginTop: 16, fontSize: 14, color: "#888" }}>
          Otomatik açılmazsa aşağıdaki bağlantıları kullanabilirsiniz:
        </p>
        <div style={{ marginTop: 12 }}>
          <a href="arayanvar://reset-password" style={{ marginRight: 12, color: "#007AFF" }}>Uygulamayı aç</a>
          <a href="https://play.google.com/store/apps/details?id=com.arayanvar" style={{ marginRight: 12, color: "#007AFF" }}>Google Play</a>
          <a href="https://apps.apple.com/app/id0000000000" style={{ color: "#007AFF" }}>App Store</a>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordRedirect;