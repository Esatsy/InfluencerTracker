# Influencer Tracker

Reklam ajanslari icin influencer takip uygulamasi. Instagram, TikTok ve YouTube verilerini takip edin, demografik bilgileri yonetin ve Excel olarak export edin.

## Ozellikler

- **Influencer Yonetimi**: Ekle, duzenle, sil, listele
- **Otomatik Veri Cekme**: Instagram, TikTok, YouTube takipci sayilarini otomatik cek
- **Demografik Veriler**: Cinsiyet, yas gruplari, ulke dagilimi (manuel giris)
- **Kategori Sistemi**: Influencerlari kategorilere ayir ve filtrele
- **KUYD Kategori**: Is paola, proje olustur, isbirliklerine odaklan vb.
- **Excel Export/Import**: Verileri Excel olarak indir veya mevcut Excel dosyasini ice aktar
- **Arama ve Filtreleme**: Ad, kategori ve KUYD kategorisine gore filtrele
- **Koyu/Acik Tema**: Sistem tercihine uyumlu tema degistirici
- **Masaustu ve Web**: Hem Electron (.exe) hem tarayici (localhost) olarak calisir

## Kurulum

```bash
# Bagimliliklari yukle
npm install

# Native modulleri Electron icin yeniden derle
npx electron-builder install-app-deps
```

## Calistirma

```bash
# Gelistirme modu (Electron penceresi + hot reload)
npm run dev

# Web modu (tarayicida localhost:5174)
# Electron dev mode ayni zamanda API server'i localhost:3001'de calistirir
```

## Build

```bash
# Uretim build (main + preload + renderer)
npm run build

# Windows .exe olustur
npm run build:win
```

## Teknolojiler

- **Frontend**: React 18, TypeScript, TailwindCSS v4, TanStack Table, TanStack Query
- **Backend**: Express.js, SQLite (better-sqlite3)
- **Masaustu**: Electron, electron-vite
- **Scraping**: cheerio (HTML parse)
- **Excel**: ExcelJS

## API Endpointleri

Uygulama localhost:3001 uzerinde bir API server calistirir:

| Method | Endpoint | Aciklama |
|--------|----------|----------|
| GET | /api/influencers | Tum influencerlari listele |
| POST | /api/influencers | Yeni influencer ekle |
| PUT | /api/influencers/:id | Influencer guncelle |
| DELETE | /api/influencers/:id | Influencer sil |
| POST | /api/influencers/:id/scrape | Tek influencer verisini cek |
| POST | /api/scrape-all | Tum verileri guncelle |
| GET | /api/export | Excel olarak indir |
| POST | /api/import | Excel dosyasindan ice aktar |
