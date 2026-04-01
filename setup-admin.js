/**
 * SIPERTI - Setup Admin Account
 * Script untuk membuat akun admin pertama
 * 
 * CARA PAKAI:
 * 1. Buka SIPERTI di browser (http://127.0.0.1:8080)
 * 2. Login dengan akun admin yang sudah ada
 * 3. Tekan F12 → Tab Console
 * 4. Copy-paste script ini → Enter
 * 5. Admin account akan dibuat
 */

// Default admin credentials
const ADMIN_EMAIL = 'admin@kalijudan.com';
const ADMIN_PASSWORD = 'admin123';
const ADMIN_NAMA = 'Administrator';

async function setupAdmin() {
  console.log('');
  console.log('🔧 SIPERTI - Setup Admin Account');
  console.log('=====================================');
  console.log('');
  
  // Check if createUser function exists
  if (typeof createUser !== 'function') {
    console.error('❌ Error: createUser function not found!');
    console.error('Make sure SIPERTI is loaded and you are logged in as admin.');
    return;
  }
  
  console.log('⏳ Membuat admin account...');
  console.log('');
  console.log('📋 Admin Credentials:');
  console.log(`   Email: ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Nama: ${ADMIN_NAMA}`);
  console.log('');
  
  try {
    const result = await createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      nama: ADMIN_NAMA,
      role: 'admin',
      created_by: 'setup-script'
    });
    
    if (result.isOk) {
      console.log('');
      console.log('✅ SELESAI!');
      console.log('');
      console.log('🎉 Admin account berhasil dibuat!');
      console.log('');
      console.log('📝 Login dengan:');
      console.log(`   Email: ${ADMIN_EMAIL}`);
      console.log(`   Password: ${ADMIN_PASSWORD}`);
      console.log('');
      console.log('🔄 Refresh halaman untuk login');
      console.log('');
    } else {
      console.log('');
      console.error('❌ Gagal: ' + result.error);
      console.log('');
      console.log('💡 Kemungkinan email sudah terdaftar.');
      console.log('   Coba login dengan email yang sudah ada.');
      console.log('');
    }
  } catch (error) {
    console.log('');
    console.error('❌ Exception: ' + error.message);
    console.log('');
  }
}

// Run setup
setupAdmin();
