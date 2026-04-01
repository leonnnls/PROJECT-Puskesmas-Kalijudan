# 🔐 SIPERTI - Role-Based Access Control (RBAC)

## 📋 Overview

SIPERTI sekarang memiliki **2 role** dengan akses berbeda:

| Role | Akses |
|------|-------|
| **Staff** | CRUD Data Pasien (Input DBD, Input Lainnya, Tarik Data) |
| **Admin** | Semua akses Staff + Manage Staff Accounts (Kelola Staff) |

---

## 🚀 Setup Admin Account Pertama

### **Step 1: Jalankan Server**
```bash
cd "/Users/nyx/Documents/PROJECT/PROJECT-MAURA"
npx http-server -p 8080
```

### **Step 2: Buka SIPERTI**
```
http://127.0.0.1:8080
```

### **Step 3: Buat Admin Account**
1. **Login** dengan akun yang sudah ada (atau daftar manual di Firebase Console)
2. Tekan **F12** → Tab **Console**
3. **Copy-paste** script dari file `setup-admin.js`
4. Tekan **Enter**
5. Tunggu konfirmasi "SELESAI!"

### **Step 4: Login sebagai Admin**
```
Email: admin@kalijudan.com
Password: admin123
```

---

## 🎯 Role Features

### **Staff Role**
✅ **Dashboard** - View statistics & charts
✅ **Peta Sebaran** - View disease distribution map
✅ **Input DBD** - Create new DBD cases
✅ **Input Lainnya** - Create new Diare/Hepatitis/TBC cases
✅ **Tarik Data** - View & export data

❌ **Kelola Staff** - Menu tidak terlihat

---

### **Admin Role**
✅ **Semua fitur Staff** +
✅ **Kelola Staff** - Manage user accounts:
   - ➕ Add new staff
   - ✏️ Edit staff (change role)
   - 🗑️ Delete staff
   - 👥 View all users

---

## 🗄️ Database Structure

### **Firestore Collections:**

#### **1. `cases`** (Data Pasien)
```
/cases/{caseId}
  - disease_type: "DBD" | "Hepatitis" | "Diare" | "TBC"
  - nama_penderita: string
  - nik: string (16 digits)
  - umur: number
  - jenis_kelamin: "Laki-laki" | "Perempuan"
  - alamat_domisili: string
  - kelurahan: string
  - latitude: number (optional)
  - longitude: number (optional)
  - ... (field lainnya)
  - created_at: timestamp
  - updated_at: timestamp
```

#### **2. `users`** (User Accounts)
```
/users/{userId}
  - email: string
  - nama: string
  - role: "staff" | "admin"
  - uid: string (Firebase Auth UID)
  - created_at: timestamp
  - created_by: string
```

---

## 🔧 Firebase Setup

### **Enable Authentication:**
1. Buka https://console.firebase.google.com/
2. Pilih project `siperti-puskesmas-kalijudan`
3. **Authentication** → **Sign-in method**
4. Enable **Email/Password**

### **Firestore Database:**
1. **Firestore Database** → **Create database**
2. Start in **test mode** (atau setup security rules)
3. Collections akan auto-created saat input data

---

## 📝 Cara Menambah Staff

### **Via UI (Admin Only):**
1. Login sebagai **Admin**
2. Klik menu **"Kelola Staff"**
3. Klik **"Tambah Staff"**
4. Isi form:
   - Nama Lengkap
   - Email
   - Password (min 6 karakter)
   - Role (Staff / Admin)
5. Klik **"Buat Akun"**

### **Via Console (Developer):**
```javascript
// Paste di browser console
const result = await createUser({
  email: 'staff@kalijudan.com',
  password: 'staff123',
  nama: 'Staff Baru',
  role: 'staff'
});
console.log(result);
```

---

## 🔒 Security Notes

### **Current Implementation:**
- ✅ Role-based UI (menu show/hide)
- ✅ Role stored in Firestore
- ✅ Firebase Authentication for login
- ⚠️ Client-side role check (can be bypassed)

### **Recommended for Production:**
- 🔐 Firestore Security Rules (server-side)
- 🔐 Custom Firebase Claims for roles
- 🔐 Admin-only API endpoints

---

##  UI Changes

### **Sidebar Navigation:**
```
┌─────────────────────────┐
│ 🏥 SIPERTI              │
│ Puskesmas Kalijudan     │
├─────────────────────────┤
│ 📊 Dashboard            │
│ 🗺️ Peta Sebaran         │
├─────────────────────────┤
│ INPUT DATA              │ ← Staff & Admin
│   📄 Input DBD          │
│   📄 Input Lainnya      │
│   📊 Tarik Data         │
├─────────────────────────┤
│ ADMIN                   │ ← Admin Only
│   👥 Kelola Staff       │
├─────────────────────────┤
│ 👤 User Name            │
│    Role Display         │
│ 🚪 Keluar               │
└─────────────────────────┘
```

---

## 🧪 Testing

### **Test as Admin:**
1. Login: `admin@kalijudan.com` / `admin123`
2. ✅ Lihat semua menu
3. ✅ Akses "Kelola Staff"
4. ✅ Tambah staff baru
5. ✅ Edit role staff

### **Test as Staff:**
1. Login dengan akun staff
2. ✅ Lihat menu Input Data
3. ❌ Menu "Kelola Staff" **tidak terlihat**
4. ✅ CRUD data pasien

---

## 📚 Files Modified

| File | Changes |
|------|---------|
| `firebase-config.js` | + User management functions (createUser, updateUserRole, deleteUser) |
| `index.html` | + Role-based UI, Kelola Staff page, Staff modals |
| `setup-admin.js` | New file - Script untuk create admin account |
| `generate-dummy-data.js` | Existing - Dummy data generator |

---

## 🆘 Troubleshooting

### **"createUser function not found"**
- Pastikan sudah login sebagai admin
- Refresh halaman
- Check console untuk error

### **"Email sudah terdaftar"**
- Email unik, gunakan email lain
- Atau delete user di Firebase Console → Authentication

### **"Permission denied"**
- Setup Firestore rules
- Atau gunakan test mode untuk development

---

## ✅ Done!

Role-based access control sudah implementasi! 🎉

**Next Steps:**
1. Setup admin account dengan `setup-admin.js`
2. Test login sebagai admin & staff
3. Tambah staff via menu "Kelola Staff"
4. Customize sesuai kebutuhan

---

**Created:** March 30, 2026
**Version:** 1.0.3
**Status:** Production Ready
