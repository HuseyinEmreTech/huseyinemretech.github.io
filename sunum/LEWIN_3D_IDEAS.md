# Lewin Unfreeze → Change → Refreeze — 3D Görsel Fikirleri

Bu doküman, **Kurt Lewin**'in buz metaforunu Three.js ile görselleştirmek için kullanılabilecek 3D fikirleri içerir.

---

## 1. Buz Küpü → Su → Koni Animasyonu

**Ne görünür?**
- Siyah arka plan, altın aydınlatma
- Ortada başlangıçta bir **buz küpü** (BoxGeometry, cam gibi materyal)
- Aşama aşama: erime (partikül efekti) → sıvı (akışkan simülasyon veya particle system) → yeni kalıpta **koni** (ConeGeometry) donma

**Nasıl hareket eder?**
- Kamera hafif orbit
- Unfreeze: Buz küpü yavaşça erir, partiküller aşağı akar
- Change: Su parçacıkları koni kalıbına dolar
- Refreeze: Koni kristalleşir, parlama efekti

**Teknik zorluk:** Zor (akışkan/sıvı simülasyonu)

---

## 2. 3 Aşamalı Holografik Şema

**Ne görünür?**
- 3 adet wireframe 3D şekil yan yana
- Sol: **Küp** (buz) — mavi/buz mavisi
- Orta: **Yarı saydam sıvı** — akış çizgileri
- Sağ: **Koni** (yeni form) — altın

**Nasıl hareket eder?**
- Sırayla highlight: Küp parlar → sönüp orta aktif olur → orta akar → sağ koni belirir
- Kamera smooth geçiş

**Teknik zorluk:** Orta

---

## 3. Tek Obje Morfolaması

**Ne görünür?**
- Tek bir 3D mesh
- Shape morph: Küp → deforme → Koni
- Three.js `morphTargets` veya basit `scale` + `geometry` swap

**Nasıl hareket eder?**
- Sürekli morfolama (küp yumuşar, uzar, koniye dönüşür)
- Her aşamada ekranda label: UNFREEZE / CHANGE / REFREEZE

**Teknik zorluk:** Orta

---

## 4. Partikül Sistemi — Buzdan Konige

**Ne görünür?**
- Başta bir küp formunda toplanmış altın/buz mavisi partiküller
- Partiküller dağılır (Unfreeze)
- Havada dağılmış halde (Change)
- Koni formunda yeniden toplanır (Refreeze)

**Nasıl hareket eder?**
- Partiküller `lerp` ile pozisyon animasyonu
- Hedef pozisyonlar: önce küp yüzeyleri, sonra rastgele, sonra koni yüzeyi

**Teknik zorluk:** Orta

---

## 5. Minimal — 3 Wireframe Kutu + Ok

**Ne görünür?**
- 3 basit wireframe kutu/cube yan yana
- İlk kutu: "UNFREEZE" label, buz mavisi
- İkinci: "CHANGE", altın
- Üçüncü: "REFREEZE", beyaz/altın
- Aralarında animasyonlu oklar

**Nasıl hareket eder?**
- Kutular hafif rotate
- Oklar pulse animasyonu
- Çok sade, tahta için okunaklı

**Teknik zorluk:** Kolay

---

## Estetik Önerileri

| Özellik | Değer |
|---------|-------|
| Renk paleti | Buz: `#4fc3f7`, Su: `#81d4fa`, Koni: `#FFD700` |
| Arka plan | `#05050a` — `#0a0a12` |
| Işık | Spot, soft shadow, hafif bloom |

---

## Entegrasyon

- Three.js sahneleri ayrı HTML sayfası olabilir: `lewin-3d.html`
- Sunumda iframe ile embed veya ayrı sekmede açılabilir
- Alternatif: Sunumun Lewin slaytına `<canvas id="lewin-scene">` eklenip script ile render
