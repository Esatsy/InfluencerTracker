# Influencer Tracker

Reklam ajanslari icin Instagram, TikTok ve YouTube influencer takip uygulamasi.

## Ozellikler

- **Otomatik Veri Cekme** — Instagram, TikTok ve YouTube takipci sayilarini otomatik olarak cekin
- **Instagram Engagement Rate** — Son 12 posttan otomatik ER% hesaplama
- **Excel Uyumluluk** — Verileri `.xlsx` formatinda iceri/disari aktarin
- **Lokal & Guvenli** — Tum veriler bilgisayarinizda kalir, internet sadece veri cekmek icin kullanilir
- **Koyu/Acik Tema** — Sistem ayarina gore otomatik veya manuel gecis
- **Kompakt Tablo** — Demografik veriler, kategoriler, KUYD ve proje takibi

## Kurulum (Setup)

### Hazir Installer (Onerilen)

1. [Releases](https://github.com/Esatsy/InfluencerTracker/releases) sayfasindan `InfluencerTracker-Setup-x.x.x.exe` dosyasini indirin
2. Setup dosyasini calistirin
3. Kurulum sihirbazini takip edin
4. Masaustunden veya Baslat menusunden uygulamayi baslatin

### Gelistirici Kurulumu

```bash
# Repoyu klonlayin
git clone https://github.com/Esatsy/InfluencerTracker.git
cd InfluencerTracker

# Bagimliliklari yukleyin
npm install

# Gelistirme modunda baslatin
npm run dev

# Windows installer olusturun
npm run build:win
```

## Kullanim

1. **Influencer Ekleme** — "Ekle" butonuna tiklayarak yeni influencer bilgilerini girin
2. **Excel Import** — Mevcut Excel dosyanizi "Import" ile icerik aktarin
3. **Veri Guncelleme** — "Guncelle" butonuyla tum takipci verilerini otomatik cekin
4. **Filtreleme** — Kategori, KUYD veya isim ile arama yapin
5. **Excel Export** — "Export" ile verileri Excel dosyasina aktarin

## Teknik Bilgiler

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Framer Motion
- **Backend**: Express.js (Electron icinde gomulu), SQLite
- **Desktop**: Electron 40
- **Scraping**: Node.js `https` modulu ile dogrudan veri cekme (API gerektirmez)

## Lisans

MIT
