# Mikro Barkod

Barkodu okut, ürünü bul, mağaza fiyatlarını birim fiyatla karşılaştır. Mobil ve masaüstünde çalışan, açık/koyu temalı, kurulum gerektirmeyen bir web uygulaması (React + Vite).

## GitHub Pages'e yayınlama (terminal gerekmez)

1. ZIP'i açın; içindeki **tüm dosya ve klasörleri** (`.github` klasörü dahil) deponun ana dizinine yükleyin.
2. GitHub'da **Settings → Pages → Source → GitHub Actions** seçin.
3. **Actions** sekmesinde yayın işinin yeşil tikle bitmesini bekleyin. Adres Pages ayarında görünür.

Not: Eski sürümden kalan `mikro-barkod/` klasörünü ve `YAMA_KURULUM.txt` dosyasını depodan silebilirsiniz; artık kullanılmıyor.

## Özellikler

- Kamera ile EAN-13 / EAN-8 / UPC barkod okuma (destekleyen tarayıcılarda), flaş ve ön/arka kamera seçimi
- Elle barkod girişi, kontrol basamağı doğrulaması, 12 haneli UPC-A → EAN-13 eşleme
- Katalog araması (Türkçe harf duyarlı), ürün oluşturma ve düzenleme, ürün görseli seçimi
- Fiyat ekleme, silme, sıralama; paket miktarından birim fiyat (₺/kg, ₺/L, ₺/adet) ve en düşük fiyat vurgusu
- Favoriler, fiyat takibi listesi, son tarananlar
- Barkodun gerçek EAN çizimi (SVG)
- Sistem / Açık / Koyu tema
- JSON dışa / içe aktarım (içe aktarma mevcut kayıtlarla birleştirir)
- Ana ekrana eklenebilir, çevrimdışı açılır (PWA)
- Tüm ikon ve illüstrasyonlar SVG; emoji kullanılmaz, dış font/kütüphane yüklenmez

## Veri ve gizlilik

Kayıtlar yalnızca tarayıcının `localStorage` alanında saklanır. Kamera görüntüsü kaydedilmez ve gönderilmez. Canlı mağaza fiyatı entegrasyonu yoktur; fiyatlar kullanıcının eklediği kayıtlardır.

## Kamera notu

Kamera yalnızca HTTPS (GitHub Pages dahil) veya `localhost` üzerinde çalışır. Barkod okuma tarayıcının `BarcodeDetector` API'sine dayanır (Android Chrome/Edge). Desteklemeyen tarayıcılarda uygulama bunu söyler ve elle girişe yönlendirir.

## Yerelde çalıştırma (isteğe bağlı)

```bash
npm install
npm run dev
```
