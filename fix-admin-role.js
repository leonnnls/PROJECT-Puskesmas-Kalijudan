/**
 * SIPERTI - Fix Admin Role in Firestore
 * 
 * Script ini untuk memastikan user admin punya role 'admin' di Firestore
 * 
 * MASALAH:
 * - Jika admin dibuat via Firebase Console (Authentication), 
 *   document di Firestore mungkin tidak ada atau role tidak ter-set
 * 
 * CARA PAKAI:
 * 1. Buka SIPERTI di browser
 * 2. Login sebagai admin
 * 3. Tekan F12 → Console
 * 4. Copy-paste script ini → Enter
 */

async function fixAdminRole() {
  console.log('🔧 SIPERTI - Fix Admin Role');
  console.log('=====================================');
  console.log('');

  const adminEmail = 'admin@kalijudan.com';
  const adminNama = 'Administrator';

  try {
    // Check if getAllUsers and createData functions exist
    if (typeof getAllUsers !== 'function') {
      console.error('❌ Error: getAllUsers function not found!');
      console.error('Make sure SIPERTI is loaded and you are logged in.');
      return;
    }

    console.log('⏳ Checking admin user in Firestore...');
    console.log('');

    const users = await getAllUsers();
    const adminUser = users.find(u => u.email === adminEmail);

    if (adminUser) {
      console.log('✅ Admin user found in Firestore:');
      console.log(`   Email: ${adminUser.email}`);
      console.log(`   Nama: ${adminUser.nama}`);
      console.log(`   Role: ${adminUser.role}`);
      console.log('');

      if (adminUser.role === 'admin') {
        console.log('✅ Admin role is already correct!');
        console.log('');
        console.log('💡 If you still see "Staff" in UI:');
        console.log('   1. Logout dan login ulang');
        console.log('   2. Clear browser cache');
        console.log('   3. Check console untuk error');
        return;
      } else {
        console.log('⚠️ Admin role is NOT "admin". Attempting to fix...');
        console.log('');
        
        // Try to update the role
        if (typeof updateUserRole === 'function') {
          const result = await updateUserRole(adminUser.id, 'admin');
          if (result.isOk) {
            console.log('✅ Admin role updated to "admin"!');
            console.log('');
            console.log('🔄 Please logout and login again to see the change.');
          } else {
            console.error('❌ Failed to update role:', result.error);
          }
        } else {
          console.error('❌ updateUserRole function not found!');
          console.error('You may need to manually update via Firebase Console.');
        }
      }
    } else {
      console.log('⚠️ Admin user NOT found in Firestore!');
      console.log('');
      console.log('💡 Solution:');
      console.log('   1. Go to Firebase Console:');
      console.log('      https://console.firebase.google.com/');
      console.log('   2. Select project: siperti-puskesmas-kalijudan');
      console.log('   3. Firestore Database → users collection');
      console.log('   4. Click "Add document"');
      console.log('   5. Add fields:');
      console.log(`      - email: "${adminEmail}"`);
      console.log(`      - nama: "${adminNama}"`);
      console.log(`      - role: "admin"`);
      console.log(`      - uid: [get from Authentication tab]`);
      console.log(`      - created_at: [current timestamp]`);
      console.log('');
      console.log('📋 To get admin UID:');
      console.log('   1. Go to Authentication → Users');
      console.log('   2. Find admin@kalijudan.com');
      console.log('   3. Copy the "User UID"');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Auto-run info
console.log('');
console.log('📋 Usage:');
console.log('   Run: fixAdminRole()');
console.log('');
console.log('🔍 Debug Info:');
console.log('   - Check if admin user exists in Firestore');
console.log('   - Verify role field is set to "admin"');
console.log('   - Update if necessary');
console.log('');

// Export function
window.fixAdminRole = fixAdminRole;
