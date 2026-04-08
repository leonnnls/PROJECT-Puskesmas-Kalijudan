# SIPERTI - Sistem Informasi Penyakit Real Time
**Puskesmas Kalijudan - Surabaya**

[![Version](https://img.shields.io/badge/version-1.0.3-blue.svg)](https://github.com/leonnnls/siperti-kalijudan)
[![Status](https://img.shields.io/badge/status-production%20ready-green.svg)](https://siperti-kalijudan.vercel.app)
[![License](https://img.shields.io/badge/license-internal%20use-red.svg)](LICENSE)

SIPERTI adalah sistem informasi berbasis web untuk pencatatan dan visualisasi data penyakit menular secara real-time di Puskesmas Kalijudan, Kecamatan Mulyorejo, Surabaya.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Role & Akses](#-role--akses)
- [Instalasi Lokal](#-instalasi-lokal)
- [Deploy ke Production](#-deploy-ke-production)
- [Struktur Database](#-struktur-database)
- [Screenshots](#-screenshots)
- [Kontributor](#-kontributor)

---

## ✨ Fitur Utama

### 📊 Dashboard Real-Time
- **Statistik Kasus**: 4 penyakit utama (DBD, Hepatitis, Diare, TBC)
- **Grafik Tabulasi**: Visualisasi kasus per jenis penyakit
- **Grafik Kelurahan**: Distribusi kasus per wilayah
- **Tren Bulanan**: Monitoring kasus dalam 12 bulan terakhir

### 🗺️ Peta Sebaran Interaktif
- **Leaflet.js + CARTO Positron**: Peta interaktif tanpa API berbayar
- **Polygon Boundary**: Batas kelurahan akurat dari Google My Maps
- **Case Markers**: Titik lokasi pasien berdasarkan geocoding alamat
- **Color Intensity**: Warna polygon berdasarkan jumlah kasus
- **Filter Penyakit**: Filter view per jenis penyakit

### 📝 Input Data Pasien
- **Input DBD**: 19 field lengkap (demografis, klinis, lab)
- **Input Lainnya**: Diare, Hepatitis, TBC (8 field)
- **Validasi Otomatis**: NIK 16 digit, Umur 1-100, Jenis Kelamin
- **Geocoding**: Konversi alamat ke koordinat (Nominatim OSM)

### 📋 Tarik Data
- **Data Table**: View semua kasus dengan filter
- **Export CSV**: Download data untuk laporan
- **Delete Data**: Hapus kasus (admin only)

### 👥 Role-Based Access Control
- **Staff**: CRUD data pasien
- **Admin**: Manage staff accounts + semua akses Staff
- **Guest**: View-only dashboard & peta

---

## 🛠️ Teknologi yang Digunakan

| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | Vanilla JavaScript | ES6+ |
| **UI Framework** | Tailwind CSS | 3.4.17 (CDN) |
| **Icons** | Lucide Icons | 0.263.0 |
| **Charts** | Chart.js | 4.4.0 |
| **Maps** | Leaflet.js | 1.9.4 |
| **Map Tiles** | CARTO Positron | Free |
| **Geocoding** | Nominatim OSM | Free |
| **Backend** | Firebase Firestore | Latest |
| **Authentication** | Firebase Auth | Latest |
| **Fonts** | Plus Jakarta Sans | Google Fonts |

---

## 👤 Role & Akses

| Fitur | Guest | Staff | Admin |
|-------|-------|-------|-------|
| View Dashboard | ✅ | ✅ | ✅ |
| View Peta Sebaran | ✅ | ✅ | ✅ |
| Input DBD | ❌ | ✅ | ✅ |
| Input Lainnya | ❌ | ✅ | ✅ |
| Tarik Data | ❌ | ✅ | ✅ |
| Kelola Staff | ❌ | ❌ | ✅ |

### Default Credentials
```
Admin:
  Email: admin@kalijudan.com
  Password: admin123

Staff:
  Email: staff@kalijudan.com
  Password: staff123
```

---

## 💻 Instalasi Lokal

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

1. **Firebase Console**: https://console.firebase.google.com/
2. **Create Project**: `siperti-puskesmas-kalijudan`
3. **Enable Authentication**: Email/Password
4. **Create Firestore Database**: Test mode
5. **Update firebase-config.js** dengan credentials project kamu

### Setup Admin Account

1. **Firebase Console** → **Authentication** → **Add user**
   - Email: `admin@kalijudan.com`
   - Password: `admin123`

2. **Firestore Database** → **Start collection** → `users`
   - Document ID: Auto-ID
   - Fields:
     ```
     email: "admin@kalijudan.com"
     nama: "Administrator"
     role: "admin"
     created_at: [timestamp]
     ```

3. **Firestore Rules** → Publish:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /cases/{document=**} {
         allow read: if true;
         allow write: if request.auth != null;
       }
       match /users/{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

---

## 🚀 Deploy ke Production

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

## 🗄️ Struktur Database

### Collection: `cases`
```javascript
{
  disease_type: "DBD" | "Hepatitis" | "Diare" | "TBC",
  nama_penderita: string,
  nik: string,           // 16 digits
  umur: number,          // 1-100
  jenis_kelamin: string,
  alamat_domisili: string,
  kelurahan: string,
  rw: string,            // Format: "01/02"
  latitude: number,      // Optional (from geocoding)
  longitude: number,     // Optional (from geocoding)
  
  // DBD specific fields
  tanggal_lahir: date,
  alamat_ktp: string,
  kecamatan: string,
  puskesmas: string,
  tgl_mulai_sakit: date,
  tgl_diagnosa: date,
  tanggal_pelaporan: date,
  diagnosa_rs: "DD" | "DBD" | "DSS",
  keadaan_pulang: "Sembuh" | "Meninggal",
  igm: "Reaktif" | "Non",
  igg: "Reaktif" | "Non",
  ns1: "Reaktif" | "Non",
  
  created_at: timestamp,
  updated_at: timestamp
}
```

### Collection: `users`
```javascript
{
  email: string,
  nama: string,
  role: "staff" | "admin",
  uid: string,           // Firebase Auth UID
  created_at: timestamp,
  created_by: string
}
```

---

## 📸 Screenshots

### Dashboard (Admin View)
![Dashboard](screenshots/dashboard.png)

### Peta Sebaran
![Peta Sebaran](screenshots/peta-sebaran.png)

### Input DBD
![Input DBD](screenshots/input-dbd.png)

### Kelola Staff (Admin Only)
![Kelola Staff](screenshots/kelola-staff.png)

### Guest Mode (Public View)
![Guest Mode](screenshots/guest-mode.png)

---

## 📍 Lokasi

**Puskesmas Kalijudan**
```
Jl. Raya Kalijudan, Mulyorejo
Kota Surabaya, Jawa Timur
Indonesia
```

**Koordinat Kelurahan:**
| Kelurahan | Latitude | Longitude |
|-----------|----------|-----------|
| Kalijudan | -7.2563 | 112.7812 |
| Kalisari | -7.2640 | 112.8055 |
| Dukuh Sutorejo | -7.2615 | 112.7995 |

---

## 👨‍ Kontributor

- **Developer**: Puskesmas Kalijudan IT Team
- **Product Owner**: Dr. [Nama Kepala Puskesmas]
- **Technical Support**: [Email Support]

---

## 📄 License

**Internal Use Only** - Puskesmas Kalijudan

Dokumen ini bersifat rahasia dan hanya untuk penggunaan internal Puskesmas Kalijudan. Dilarang mendistribusikan atau membagikan kode sumber tanpa izin.

---

## 📞 Contact & Support

- **Email**: [support@puskesmas-kalijudan.go.id](mailto:support@puskesmas-kalijudan.go.id)
- **Phone**: (031) XXXX-XXXX
- **Address**: Jl. Raya Kalijudan, Mulyorejo, Surabaya

---

## 🗓️ Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Mar 30, 2026 | Initial Release |
| 1.0.1 | Mar 30, 2026 | Map upgrade (SVG to Leaflet) |
| 1.0.2 | Mar 30, 2026 | Map improvements (polygons, markers, geocoding) |
| 1.0.3 | Mar 30, 2026 | Role-based access control (Staff/Admin) |

---

**Created with ❤️ for Puskesmas Kalijudan**

*Last Updated: March 30, 2026*
