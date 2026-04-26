# SIPERTI - Sistem Informasi Penyakit Real Time
**Puskesmas Kalijudan - Surabaya**

SIPERTI adalah sistem informasi berbasis web untuk pencatatan dan visualisasi data penyakit menular secara real-time di Puskesmas Kalijudan, Kecamatan Mulyorejo, Surabaya.

---

## Daftar Isi

- [Fitur Utama](#fitur-utama)
- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Role & Akses](#role--akses)
- [Instalasi Lokal](#instalasi-lokal)
- [Deploy ke Production](#deploy-ke-production)
- [Struktur Database](#struktur-database)
- [Screenshots](#screenshots)
- [Kontributor](#kontributor)

---

## Fitur Utama

### Dashboard Real-Time
- Statistik Kasus: 4 penyakit utama (DBD, Hepatitis, Diare, TBC)
- Grafik Tabulasi: Visualisasi kasus per jenis penyakit
- Grafik Kelurahan: Distribusi kasus per wilayah
- Tren Bulanan: Monitoring kasus dalam 12 bulan terakhir

### Peta Sebaran Interaktif
- Leaflet.js + CARTO Positron: Peta interaktif tanpa API berbayar
- Polygon Boundary: Batas kelurahan akurat dari Google My Maps
- Case Markers: Titik lokasi pasien berdasarkan geocoding alamat
- Color Intensity: Warna polygon berdasarkan jumlah kasus
- Filter Penyakit: Filter view per jenis penyakit

### Input Data Pasien
- Input DBD: 19 field lengkap (demografis, klinis, lab)
- Input Lainnya: Diare, Hepatitis, TBC (8 field)
- Validasi Otomatis: NIK 16 digit, Umur 1-100, Jenis Kelamin
- Geocoding: Konversi alamat ke koordinat (Nominatim OSM)

### Tarik Data
- Data Table: View semua kasus dengan filter
- Export CSV: Download data untuk laporan
- Delete Data: Hapus kasus (admin only)

### Role-Based Access Control
- Staff: CRUD data pasien
- Admin: Manage staff accounts + semua akses Staff
- Guest: View-only dashboard & peta

---

## Teknologi yang Digunakan

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Vanilla JavaScript | ES6+ |
| UI Framework | Tailwind CSS | 3.4.17 (CDN) |
| Icons | Lucide Icons | 0.263.0 |
| Charts | Chart.js | 4.4.0 |
| Maps | Leaflet.js | 1.9.4 |
| Map Tiles | CARTO Positron | Free |
| Geocoding | Nominatim OSM | Free |
| Backend | Firebase Firestore | Latest |
| Authentication | Firebase Auth | Latest |
| Fonts | Plus Jakarta Sans | Google Fonts |

---

## Role & Akses

| Fitur | Guest | Staff | Admin |
|-------|-------|-------|-------|
| View Dashboard | Ya | Ya | Ya |
| View Peta Sebaran | Ya | Ya | Ya |
| Input DBD | Tidak | Ya | Ya |
| Input Lainnya | Tidak | Ya | Ya |
| Tarik Data | Tidak | Ya | Ya |
| Kelola Staff | Tidak | Tidak | Ya |

### Default Credentials
Default credentials dapat dilihat pada dokumen internal Puskesmas Kalijudan.

---

## Instalasi Lokal

### Prerequisites
- Node.js (untuk http-server)
- Modern browser (Chrome, Firefox, Edge)

### Step-by-Step

```bash
# 1. Clone repository
git clone https://github.com/leonnnls/siperti-kalijudan.git
cd siperti-kalijudan

# 2. Install dependencies (optional, hanya untuk http-server)
npm install

# 3. Jalankan development server
npx http-server -p 8080

# 4. Buka browser
http://127.0.0.1:8080
```

### Setup Firebase

1. Firebase Console: https://console.firebase.google.com/
2. Create Project: siperti-puskesmas-kalijudan
3. Enable Authentication: Email/Password
4. Create Firestore Database: Test mode
5. Update firebase-config.js dengan credentials project kamu

---

## Deploy ke Production

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd siperti-kalijudan
vercel --prod
```

### Netlify

```bash
# Drag & drop folder ke Netlify
# Atau gunakan Netlify CLI
npm install -g netlify-cli
netlify deploy --prod
```

### Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

---

## Struktur Database

### Collection: cases
```javascript
{
  disease_type: "DBD" | "Hepatitis" | "Diare" | "TBC",
  nama_penderita: string,
  nik: string,
  umur: number,
  jenis_kelamin: string,
  alamat_domisili: string,
  kelurahan: string,
  rw: string,
  latitude: number,
  longitude: number,
  created_at: timestamp,
  updated_at: timestamp
}
```

### Collection: users
```javascript
{
  email: string,
  nama: string,
  role: "staff" | "admin",
  uid: string,
  created_at: timestamp,
  created_by: string
}
```

---

## Lokasi

**Puskesmas Kalijudan**
Jl. Raya Kalijudan, Mulyorejo
Kota Surabaya, Jawa Timur
Indonesia

---

## Kontributor

- Developer: Puskesmas Kalijudan IT Team
- Technical Support: [REDACTED]

---

## License

Internal Use Only - Puskesmas Kalijudan

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Mar 30, 2026 | Initial Release |
| 1.0.1 | Mar 30, 2026 | Map upgrade (SVG to Leaflet) |
| 1.0.2 | Mar 30, 2026 | Map improvements |
| 1.0.3 | Mar 30, 2026 | Major enhancements |
| 1.0.4 | Apr 6, 2026 | Security enhancements |

---

Last Updated: April 6, 2026
