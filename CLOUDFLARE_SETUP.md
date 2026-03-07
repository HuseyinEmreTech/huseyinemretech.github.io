# 🔒 Cloudflare Security Headers Kurulum Rehberi

Bu rehber, sitenize HTTP Security Header'larını eklemenin 2 farklı yöntemini açıklar.

## Yöntem 1: Cloudflare Workers (Önerilen) ⚡

Cloudflare Workers kullanarak tüm header'ları dinamik olarak ekleyebilirsiniz.

### Adımlar:

1. **Cloudflare Dashboard'a gidin**
   - https://dash.cloudflare.com/ adresine gidin
   - `huseyinemre.tech` domain'inizi seçin

2. **Worker Oluşturun**
   - Sol menüden **Workers & Pages** seçin
   - **Create Application** butonuna tıklayın
   - **Create Worker** seçin
   - Worker'a isim verin: `security-headers`
   - **Deploy** butonuna tıklayın

3. **Worker Kodunu Ekleyin**
   - **Edit Code** butonuna tıklayın
   - `cloudflare-worker.js` dosyasındaki kodu kopyalayıp yapıştırın
   - **Save and Deploy** butonuna tıklayın

4. **Adaptive UI API için Secret'lar (Opsiyonel)**
   - Worker sayfasında **Settings** > **Variables and Secrets**
   - **Add** > **Secret** ile ekleyin:
     - `OPENROUTER_API_KEY` — https://openrouter.ai/settings/keys adresinden ücretsiz key
     - `GEMINI_API_KEY` — (yedek) Google AI Studio'dan key
   - En az biri tanımlı olmalı. OpenRouter önceliklidir.

5. **Worker'ı Domain'e Bağlayın**
   - Worker sayfasında **Triggers** sekmesine gidin
   - **Add Route** butonuna tıklayın
   - Route: `huseyinemre.tech/*`
   - Worker seçin: `security-headers`
   - **Save** butonuna tıklayın

6. **Test Edin**
   - https://securityheaders.com/?q=https://huseyinemre.tech/ adresine gidin
   - Tüm header'ların eklendiğini doğrulayın ✅

---

## Yöntem 2: Transform Rules (Basit) 🛠️

Cloudflare Transform Rules ile worker kullanmadan header ekleyebilirsiniz.

### Adımlar:

1. **Dashboard'a gidin**
   - https://dash.cloudflare.com/ 
   - `huseyinemre.tech` seçin

2. **Transform Rules oluşturun**
   - Sol menüden **Rules** > **Transform Rules** seçin
   - **Modify Response Header** sekmesine gidin
   - **Create rule** butonuna tıklayın

3. **Kural Ayarları**
   - **Rule name**: `Security Headers`
   - **When incoming requests match**: `All incoming requests`
   - **Then**: Aşağıdaki header'ları **Set static** olarak ekleyin:

   | Header Name | Value |
   |-------------|-------|
   | `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
   | `X-Frame-Options` | `SAMEORIGIN` |
   | `X-Content-Type-Options` | `nosniff` |
   | `Referrer-Policy` | `strict-origin-when-cross-origin` |
   | `Permissions-Policy` | `geolocation=(), microphone=(), camera=(), payment=(), usb=()` |
   | `Cross-Origin-Resource-Policy` | `same-origin` |
   | `Cross-Origin-Opener-Policy` | `same-origin` |

4. **Deploy Rule**
   - **Deploy** butonuna tıklayın

5. **Test Edin**
   - https://securityheaders.com/ ile test edin

---

## 📊 Beklenen Sonuç

Başarılı kurulumdan sonra güvenlik taraması şu şekilde olmalı:

```
✅ Strict-Transport-Security
✅ Content-Security-Policy
✅ X-Frame-Options
✅ X-Content-Type-Options
✅ Referrer-Policy
✅ Permissions-Policy
✅ Cross-Origin-Resource-Policy
✅ Cross-Origin-Opener-Policy
```

---

## 🚨 Önemli Notlar

### HSTS Preload (Opsiyonel)
Eğer sitenizi HSTS Preload listesine eklemek isterseniz:
1. https://hstspreload.org/ adresine gidin
2. Domain'inizi girin ve submit edin
3. Bu işlem GERİ ALINAMAZ, dikkatli karar verin!

### CDN Kullanımı
Eğer harici CDN'ler (fonts.googleapis.com, cdnjs.cloudflare.com) kullanıyorsanız:
- `Cross-Origin-Embedder-Policy` header'ını **EKLEMEYIN**
- Bu header CDN kaynaklarının yüklenmesini engelleyebilir

### GitHub Pages
GitHub Pages sunucu tarafı header'larını desteklemez, bu yüzden:
- ✅ Cloudflare kullanıyorsanız: Worker veya Transform Rules ile ekleyin
- ✅ Meta tag'ler: CSP, X-Frame-Options gibi bazıları meta tag ile eklenebilir
- ❌ HSTS meta tag ile EKLENEMEZ, mutlaka Cloudflare gerekir

---

## 🔍 Test ve Doğrulama

### 1. Security Headers Test
```bash
curl -I https://huseyinemre.tech/
```

### 2. Online Tarama
- https://securityheaders.com/?q=https://huseyinemre.tech/
- https://observatory.mozilla.org/analyze/huseyinemre.tech

### 3. Browser Developer Tools
- F12 > Network sekmesi > Response Headers kontrol edin

---

## ❓ Sorun Giderme

### Header'lar görünmüyor
- Cloudflare cache'i temizleyin: Dashboard > Caching > Purge Everything
- 5-10 dakika bekleyin (propagation süresi)
- Incognito modda test edin

### Worker çalışmıyor
- Route'un doğru olduğundan emin olun: `huseyinemre.tech/*`
- Worker'ın deploy edildiğinden emin olun
- Cloudflare proxy'sinin aktif (🧡 turuncu bulut) olduğundan emin olun

### Sayfa bozuk görünüyor
- CSP ayarlarını kontrol edin
- `Cross-Origin-Embedder-Policy` varsa kaldırın
- Browser console'da hata var mı kontrol edin

---

## 📞 İletişim

Kurulumda sorun yaşarsanız:
- GitHub Issues: https://github.com/huseyinemretech/huseyinemretech.github.io/issues
- Email: huseyinemre.tech@gmail.com
