# 🔒 SIPERTI - Security Setup Guide

## 📋 Daftar Isi
1. [Firestore Security Rules](#1-firestore-security-rules)
2. [Firebase Custom Claims](#2-firebase-custom-claims)
3. [API Key Restriction](#3-api-key-restriction)
4. [Input Sanitization (XSS Protection)](#4-input-sanitization-xss-protection)

---

## 1. Firestore Security Rules

### **Status:** ✅ File created (`firestore.rules`)

### **Cara Deploy:**

#### **Option A: Via Firebase Console (Recommended untuk pemula)**

1. **Buka Firebase Console:**
   ```
   https://console.firebase.google.com/
   ```

2. **Pilih Project:**
   - Project: `siperti-puskesmas-kalijudan`

3. **Navigate ke Firestore Rules:**
   - Klik **Firestore Database** (di sidebar kiri)
   - Klik tab **Rules** (di top menu)

4. **Copy-Paste Rules:**
   - Buka file `firestore.rules` di project
   - Copy semua isi file
   - Paste ke Firebase Console Rules editor
   - Klik **Publish**

5. **Verify:**
   - Status harus berubah dari "Test mode" ke "Secured"
   - Green checkmark muncul

---

#### **Option B: Via Firebase CLI (Advanced)**

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login ke Firebase
firebase login

# 3. Init project (jika belum)
cd /Users/nyx/Documents/PROJECT/PROJECT-MAURA
firebase init firestore
# - Pilih project: siperti-puskesmas-kalijudan
# - Firestore rules file: firestore.rules
# - Firestore indexes: firestore.indexes.json

# 4. Deploy rules
firebase deploy --only firestore:rules

# 5. Verify deployment
firebase firestore:rules
```

---

### **Rules Summary:**

| Collection | Read | Create | Update | Delete |
|------------|------|--------|--------|--------|
| `cases` | ✅ Public | ✅ Staff/Admin | ✅ Staff/Admin | 🔒 Admin only |
| `users` | 🔒 Admin/Owner | 🔒 Admin only | 🔒 Admin/Owner | 🔒 Admin only |

### **Validations:**
- ✅ NIK: 16 digits numeric only
- ✅ NIK uniqueness check
- ✅ Umur: 1-100 years
- ✅ Jenis Kelamin: Laki-laki/Perempuan only
- ✅ Disease type: DBD/Hepatitis/Diare/TBC only
- ✅ Email format validation
- ✅ Role validation (prevent privilege escalation)

---

## 2. Firebase Custom Claims

### **Status:** ✅ Implementation complete

Custom Claims adalah **secure server-side role storage** yang tidak bisa di-bypass via client console.

### **What Changed:**

**BEFORE (Insecure):**
```javascript
// Role dibaca dari Firestore (client-side)
const userData = await getUserByEmail(email);
role = userData?.role || 'staff'; // ❌ Bisa diubah via console
```

**AFTER (Secure):**
```javascript
// Role dibaca dari Firebase Auth Custom Claims (server-side)
const idTokenResult = await user.getIdTokenResult();
role = idTokenResult.claims.admin ? 'admin' : 'staff'; // ✅ Server-side, immutable
```

---

### **Setup Cloud Functions:**

#### **Step 1: Install Dependencies**

```bash
cd /Users/nyx/Documents/PROJECT/PROJECT-MAURA/functions
npm install
```

#### **Step 2: Deploy Cloud Functions**

```bash
cd ..
firebase deploy --only functions
```

Deploy akan membuat 4 functions:
- `setUserRoleClaim` - Auto-set claims saat user dibuat
- `updateUserRoleClaim` - Sync role changes
- `validateRoleChange` - Prevent privilege escalation
- `logUserAction` - Audit logging

#### **Step 3: Sync Existing Users**

Setelah functions deployed, sync users yang sudah ada:

**Option A: Via Firebase Console (Recommended)**

1. Buka Firebase Console → Functions
2. Klik function `syncExistingClaims`
3. Klik "Test" tab
4. Klik "Test the function"

**Option B: Via Firebase CLI**

```bash
firebase functions:shell
> syncExistingClaims()
```

**Option C: Via Browser Console (Setelah login admin)**

```javascript
// Copy-paste sync-existing-claims.js ke console
syncClaimsViaConsole()
```

---

### **Verification:**

Test custom claims setelah deploy:

```javascript
// Di browser console (setelah login)
const user = firebase.auth().currentUser;
const token = await user.getIdTokenResult();
console.log('Custom Claims:', token.claims);

// Expected output:
// { admin: true, role: 'admin' }  // untuk admin
// { staff: true, role: 'staff' }  // untuk staff
```

---

### **Security Benefits:**

✅ **Server-side role storage** - Tidak bisa diubah via client console
✅ **Auto-sync** - Cloud Functions otomatis set claims saat user dibuat/diubah
✅ **Audit trail** - Semua perubahan role di-log
✅ **Fallback** - Masih bisa baca dari Firestore jika claims belum set
✅ **Token refresh** - Role update setelah re-login

---

### **Important Notes:**

⚠️ **Users perlu login ulang** setelah claims di-set untuk pertama kali
⚠️ **Custom claims max 1000 bytes** - Jangan simpan data besar
⚠️ **Token cache** - Claims di-cache di ID token (1 hour), perlu refresh manual

---

### **Files Created:**

| File | Purpose |
|------|---------|
| `functions/index.js` | Cloud Functions code |
| `functions/package.json` | Dependencies |
| `functions/.gitignore` | Ignore sensitive files |
| `sync-existing-claims.js` | Script sync existing users |

---

## 3. API Key Restriction

### **Status:** ⚠️ Manual setup required (See Step 3 below)

---

## 4. Input Sanitization (XSS Protection)

### **Status:** ✅ Implementation complete

Cross-Site Scripting (XSS) adalah serangan di mana hacker menginjeksikan script jahat melalui form input.

### **What Changed:**

**BEFORE (Vulnerable):**
```javascript
// User input: <script>alert('HACKED')</script>
// Langsung ditampilkan tanpa filter → Script jalan! ❌
<div>${userInput}</div>
```

**AFTER (Secure):**
```javascript
// User input: <script>alert('HACKED')</script>
// Di-sanitize jadi: &lt;script&gt;alert('HACKED')&lt;/script&gt;
// Ditampilkan sebagai teks biasa, bukan script ✅
<div>${escapeHtml(userInput)}</div>
```

---

### **Implementation Details:**

#### **1. escapeHtml() Function**
Mengganti karakter berbahaya dengan HTML entities:
- `<` → `&lt;`
- `>` → `&gt;`
- `"` → `&quot;`
- `'` → `&#039;`
- `&` → `&amp;`
- dll.

#### **2. sanitizeData() Function**
Membersihkan seluruh object data sebelum disimpan ke Firebase.

#### **3. Applied To:**
- ✅ Data Table rendering (`updateTable()`)
- ✅ Map Popups (`createCaseMarker()`)
- ✅ Form DBD submission (sanitize before save)
- ✅ Form Lainnya submission (sanitize before save)
- ✅ Staff Table rendering (`loadStaffData()`)

---

### **Security Benefits:**

✅ **Prevent Script Injection** - Script jahat tidak akan jalan
✅ **Prevent Data Corruption** - Karakter aneh tidak merusak layout
✅ **Defense in Depth** - Sanitize di client + validate di server (Firestore Rules)
✅ **Comprehensive Coverage** - Semua titik render data sudah di-protect

---

### **Testing XSS Protection:**

Coba input data dengan script jahat:

**Test Case 1: Script Tag**
```
Nama: <script>alert('XSS')</script>
Expected: Ditampilkan sebagai teks biasa, tidak ada popup alert
```

**Test Case 2: Event Handler**
```
Alamat: <img src=x onerror=alert('XSS')>
Expected: Gambar tidak muncul, tidak ada popup alert
```

**Test Case 3: JavaScript URI**
```
NIK: javascript:alert('XSS')
Expected: Ditampilkan sebagai teks biasa
```

---

### **Files Modified:**

| File | Changes |
|------|---------|
| `index.html` | + `escapeHtml()`, `sanitizeData()` functions |
| `index.html` | + Sanitize all form submissions |
| `index.html` | + Sanitize all data rendering (table, map, staff) |
| `firebase-config.js` | + Session persistence (auto-logout on tab close) |
