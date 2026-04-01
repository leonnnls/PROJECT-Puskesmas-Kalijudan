/**
 * SIPERTI - Dummy Data Generator
 * Generate data dummy massive untuk testing
 * 
 * CARA PAKAI:
 * 1. Buka SIPERTI di browser (http://127.0.0.1:8080)
 * 2. Login sebagai admin
 * 3. Tekan F12 → Tab Console
 * 4. Copy-paste script ini → Enter
 * 5. Tunggu proses selesai
 */

// Konfigurasi
const CONFIG = {
  JUMLAH_DATA: 100,          // Jumlah data yang akan digenerate
  KELURAHAN_LIST: ['Kalijudan', 'Kalisari', 'Dukuh Sutorejo'],
  DISEASE_LIST: ['DBD', 'Hepatitis', 'Diare', 'TBC'],
  JENIS_KELAMIN: ['Laki-laki', 'Perempuan'],
  DIAGNOSA_RS: ['DD', 'DBD', 'DSS'],
  KEADAAN_PULANG: ['Sembuh', 'Meninggal'],
  LAB_RESULT: ['Reaktif', 'Non'],
  NAMA_DEPAN: ['Ahmad', 'Budi', 'Citra', 'Dewi', 'Eko', 'Fajar', 'Gunawan', 'Hana', 'Indra', 'Juli', 
               'Kartika', 'Lestari', 'Muhammad', 'Nina', 'Oki', 'Putri', 'Qori', 'Rudi', 'Siti', 'Tono',
               'Agus', 'Bayu', 'Candra', 'Dian', 'Edi', 'Fitri', 'Gita', 'Hendra', 'Ika', 'Joko'],
  NAMA_BELAKANG: ['Pratama', 'Wibowo', 'Saputra', 'Kusuma', 'Purnama', 'Sari', 'Putri', 'Wijaya', 'Nugroho', 'Setiawan',
                  'Hidayat', 'Rahman', 'Fauzi', 'Akbar', 'Ramadan', 'Utami', 'Lestari', 'Wulandari', 'Handayani', 'Kurniawan'],
  JALAN: ['Jl. Raya Sutorejo', 'Jl. Mulyosari', 'Jl. Kalijudan', 'Jl. Raya ITS', 'Jl. Raya Manyar',
          'Jl. Tenggilis Mejoyo', 'Jl. Raya Kendangsari', 'Jl. Gebang Putih', 'Jl. Raya Nginden',
          'Jl. Semolowaru', 'Jl. Raya Medokan', 'Jl. Kedung Baruk', 'Jl. Raya Panjatan', 'Jl. Raya Kertajaya'],
  GANG: ['Gang 1', 'Gang 2', 'Gang 3', 'Gang 4', 'Gang 5', 'Gang 6', 'Gang 7', 'Gang 8', 'Gang 9', 'Gang 10'],
};

// Helper: Random integer
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Random array item
function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Generate NIK (16 digit)
function generateNIK() {
  const nik = [];
  for (let i = 0; i < 16; i++) {
    nik.push(Math.floor(Math.random() * 10));
  }
  return nik.join('');
}

// Generate nama lengkap
function generateNama() {
  const depan = randomItem(CONFIG.NAMA_DEPAN);
  const belakang = randomItem(CONFIG.NAMA_BELAKANG);
  return `${depan} ${belakang}`;
}

// Generate alamat
function generateAlamat() {
  const jalan = randomItem(CONFIG.JALAN);
  const nomor = randomInt(1, 150);
  const gang = Math.random() > 0.7 ? ` ${randomItem(CONFIG.GANG)}` : '';
  return `${jalan} No. ${nomor}${gang}`;
}

// Generate tanggal random (dalam 12 bulan terakhir)
function generateTanggal(maxMonthsAgo = 12) {
  const now = new Date();
  const past = new Date();
  past.setMonth(past.getMonth() - randomInt(0, maxMonthsAgo));
  past.setDate(randomInt(1, 28));
  
  const diff = now - past;
  const randomDiff = Math.random() * diff;
  return new Date(past.getTime() + randomDiff);
}

// Format date to YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Generate umur
function generateUmur() {
  return randomInt(1, 85);
}

// Generate data DBD
function generateDataDBD() {
  const tanggalLapor = generateTanggal(12);
  const tanggalSakit = new Date(tanggalLapor);
  tanggalSakit.setDate(tanggalSakit.getDate() - randomInt(1, 14));
  const tanggalDiagnosa = new Date(tanggalSakit);
  tanggalDiagnosa.setDate(tanggalDiagnosa.getDate() + randomInt(1, 3));
  
  return {
    disease_type: 'DBD',
    nama_penderita: generateNama(),
    nik: generateNIK(),
    tanggal_lahir: formatDate(generateTanggal(100)),
    umur: generateUmur(),
    jenis_kelamin: randomItem(CONFIG.JENIS_KELAMIN),
    alamat_domisili: generateAlamat(),
    alamat_ktp: generateAlamat(),
    kecamatan: 'Mulyorejo',
    kelurahan: randomItem(CONFIG.KELURAHAN_LIST),
    rw: `${randomInt(1, 10)}/${randomInt(1, 5)}`,
    puskesmas: 'Kalijudan',
    tgl_mulai_sakit: formatDate(tanggalSakit),
    tgl_diagnosa: formatDate(tanggalDiagnosa),
    tanggal_pelaporan: formatDate(tanggalLapor),
    diagnosa_rs: randomItem(CONFIG.DIAGNOSA_RS),
    keadaan_pulang: randomItem(CONFIG.KEADAAN_PULANG),
    igm: randomItem(CONFIG.LAB_RESULT),
    igg: randomItem(CONFIG.LAB_RESULT),
    ns1: randomItem(CONFIG.LAB_RESULT),
    created_at: tanggalLapor.toISOString(),
    updated_at: tanggalLapor.toISOString(),
  };
}

// Generate data penyakit lain (Diare, Hepatitis, TBC)
function generateDataPenyakitLain(diseaseType) {
  const tanggalLapor = generateTanggal(12);
  
  return {
    disease_type: diseaseType,
    nama_penderita: generateNama(),
    nik: generateNIK(),
    umur: generateUmur(),
    jenis_kelamin: randomItem(CONFIG.JENIS_KELAMIN),
    alamat_domisili: generateAlamat(),
    kelurahan: randomItem(CONFIG.KELURAHAN_LIST),
    tanggal_pelaporan: formatDate(tanggalLapor),
    created_at: tanggalLapor.toISOString(),
    updated_at: tanggalLapor.toISOString(),
  };
}

// Generate semua data
function generateAllData(jumlah) {
  const data = [];
  
  for (let i = 0; i < jumlah; i++) {
    const diseaseType = randomItem(CONFIG.DISEASE_LIST);
    
    if (diseaseType === 'DBD') {
      data.push(generateDataDBD());
    } else {
      data.push(generateDataPenyakitLain(diseaseType));
    }
  }
  
  return data;
}

// Insert ke Firebase Firestore
async function insertToFirebase(dataArray) {
  console.log('📊 SIPERTI - Dummy Data Generator');
  console.log('=====================================');
  console.log(`📦 Jumlah data: ${dataArray.length}`);
  console.log('');
  
  const successCount = { DBD: 0, Hepatitis: 0, Diare: 0, TBC: 0 };
  const errorCount = 0;
  
  // Check if createData function exists (from firebase-config.js)
  if (typeof createData !== 'function') {
    console.error('❌ Error: createData function not found!');
    console.error('Make sure SIPERTI is loaded and you are logged in.');
    return;
  }
  
  console.log('⏳ Memulai insert data ke Firebase...');
  console.log('');
  
  for (let i = 0; i < dataArray.length; i++) {
    const data = dataArray[i];
    
    try {
      const result = await createData(data);
      
      if (result.isOk) {
        successCount[data.disease_type]++;
        const progress = ((i + 1) / dataArray.length * 100).toFixed(1);
        console.log(`✅ [${i + 1}/${dataArray.length}] (${progress}%) - ${data.disease_type} - ${data.nama_penderita}`);
      } else {
        console.error(`❌ [${i + 1}/${dataArray.length}] Error: ${result.error}`);
      }
    } catch (error) {
      console.error(`❌ [${i + 1}/${dataArray.length}] Exception: ${error.message}`);
    }
    
    // Delay 100ms untuk avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log('');
  console.log('=====================================');
  console.log('✅ SELESAI!');
  console.log('');
  console.log('📈 Ringkasan:');
  console.log(`   DBD:       ${successCount.DBD} data`);
  console.log(`   Hepatitis: ${successCount.Hepatitis} data`);
  console.log(`   Diare:     ${successCount.Diare} data`);
  console.log(`   TBC:       ${successCount.TBC} data`);
  console.log(`   ─────────────────────`);
  console.log(`   TOTAL:     ${dataArray.length} data`);
  console.log('');
  console.log('🔄 Refresh halaman untuk melihat data di dashboard & peta!');
  console.log('');
}

// === MAIN EXECUTION ===
console.log('');
console.log('🚀 SIPERTI Dummy Data Generator');
console.log('   by Puskesmas Kalijudan');
console.log('');

// Wait for page to be fully loaded and check prerequisites
function initGenerator() {
  // Check if createData function exists
  if (typeof createData !== 'function') {
    console.error('❌ Error: createData function not found!');
    console.error('');
    console.error('📋 Troubleshooting:');
    console.error('   1. Make sure SIPERTI is fully loaded');
    console.error('   2. Make sure you are logged in as admin');
    console.error('   3. Try refreshing the page and run script again');
    console.error('   4. Check if firebase-config.js is loaded properly');
    console.error('');
    console.error('🔍 Debug info:');
    console.error('   - typeof createData:', typeof createData);
    console.error('   - typeof app:', typeof app);
    console.error('   - typeof db:', typeof db);
    return false;
  }
  
  console.log('✅ Firebase connection OK!');
  console.log('');
  
  // Generate and insert data
  const dummyData = generateAllData(CONFIG.JUMLAH_DATA);
  insertToFirebase(dummyData);
  
  return true;
}

// Run the generator
initGenerator();
