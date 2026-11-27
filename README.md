# Mikro Barkod — MVP

Mobil öncelikli ürün/barkod keşfi ve fiyat karşılaştırma prototipi.

## Çalıştırma

```bash
npm install
npm run dev
```

Vite geliştirme sunucusunu açın. Kamera özelliği için localhost veya HTTPS ortamı gerekir. Tarayıcı `BarcodeDetector` API'sini destekliyorsa EAN-13/EAN-8/UPC/Code 128 algılaması denenir; destek yoksa manuel giriş kullanılabilir.

## MVP kapsamı
- Barkod girişinde EAN/UPC kontrol basamağı doğrulama
- Uygun tarayıcılarda kamera tabanlı barkod algılama
- Katalog araması, ürün detayı, ürün oluşturma akışı
- Favori, takip, son tarananlar
- JSON içe/dışa aktarım ve localStorage
- Mobil responsive arayüz
- Boş fiyat durumunu dürüstçe gösterme

## Bilinçli sınırlamalar
Bu prototipte canlı mağaza API/feed entegrasyonu, sunucu/veritabanı, gerçek ürün kataloğu, bildirim altyapısı, grafik geçmişi, otomatik ürün eşleştirme ve fiyat doğrulama bulunmuyor. Mağaza fiyatları uydurulmaz; ürün kayıtları örnek/demo kataloğudur. Flaş kontrolü ve kamera değişimi cihaz/tarayıcı API desteğine göre geliştirilecek. Kamera izni yalnızca tarama modunda istenir ve tarama sonrasında akış kapatılır. Kamera görüntüsü kaydedilmez.

## GitHub
Projeyi ZIP'ten çıkarıp yeni GitHub deposuna yükleyebilirsiniz. `.gitignore` `node_modules` ve build çıktılarını hariç tutar.
