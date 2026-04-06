/**
 * SIPERTI - Sync Existing Users Custom Claims
 * 
 * Script ini dijalankan SEKALI setelah deploy Cloud Functions
 * untuk set custom claims ke semua user yang sudah ada
 * 
 * CARA PAKAI:
 * 1. Deploy functions dulu: firebase deploy --only functions
 * 2. Jalankan script ini via browser console (setelah login sebagai admin)
 * 
 * ATAU via Node.js:
 * node sync-existing-claims.js
 */

// ========================================
// OPTION 1: Via Browser Console (Recommended)
// ========================================

/**
 * Copy-paste script ini ke browser console setelah login sebagai admin
 */
async function syncClaimsViaConsole() {
  console.log('🔄 Syncing custom claims for existing users...');
  console.log('');

  try {
    // Import functions
    const { getAllUsers } = window;
    
    if (typeof getAllUsers !== 'function') {
      console.error('❌ getAllUsers function not found!');
      console.error('Make sure SIPERTI is loaded and you are logged in as admin.');
      return;
    }

    const users = await getAllUsers();
    console.log(`📊 Found ${users.length} users to sync`);
    console.log('');

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        console.log(`⏳ Syncing: ${user.email} (${user.role})`);

        // Call the cloud function to sync this user's claims
        const result = await syncSingleUser(user.uid, user.role);
        
        if (result.success) {
          successCount++;
          console.log(`✅ ${user.email} - ${user.role}`);
        } else {
          errorCount++;
          console.error(`❌ ${user.email}: ${result.error}`);
        }

        // Delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
      } catch (error) {
        errorCount++;
        console.error(`❌ Exception syncing ${user.email}:`, error);
      }
    }

    console.log('');
    console.log('=====================================');
    console.log('✅ SELESAI!');
    console.log(`   Success: ${successCount}`);
    console.log(`   Failed: ${errorCount}`);
    console.log('');
    console.log('🔄 Users perlu login ulang untuk refresh claims');
    console.log('');

  } catch (error) {
    console.error('❌ Error syncing claims:', error);
  }
}

// Helper: Sync single user via Admin SDK (requires server-side execution)
async function syncSingleUser(uid, role) {
  // Note: This requires Firebase Admin SDK
  // For browser console, use the callable function instead
  console.warn('⚠️ syncSingleUser requires server-side execution');
  console.warn('Use firebase functions:shell atau callable function');
  return { success: false, error: 'Requires server-side execution' };
}

// ========================================
// OPTION 2: Via Firebase Functions Shell
// ========================================

/**
 * 1. Run: firebase functions:shell
 * 2. In shell: syncExistingClaims()
 * 
 * OR via HTTP callable:
 * 
 * const callable = firebase.functions().httpsCallable('syncExistingClaims');
 * callable().then(result => console.log(result.data));
 */

// ========================================
// OPTION 3: Via Node.js Script (Advanced)
// ========================================

// Uncomment jika ingin run via Node.js
/*
const admin = require('firebase-admin');
const serviceAccount = require('./service-account-key.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function syncExistingClaims() {
  console.log('🔄 Starting sync...');
  
  const usersSnapshot = await admin.firestore().collection('users').get();
  let success = 0;
  let failed = 0;

  for (const doc of usersSnapshot.docs) {
    try {
      const user = doc.data();
      await admin.auth().setCustomUserClaims(user.uid, {
        [user.role]: true,
        role: user.role
      });
      console.log(`✅ ${user.email} (${user.role})`);
      success++;
    } catch (error) {
      console.error(`❌ ${doc.id}:`, error.message);
      failed++;
    }
  }

  console.log('');
  console.log(`✅ Done! Success: ${success}, Failed: ${failed}`);
  process.exit(0);
}

syncExistingClaims();
*/

// Auto-run if executed in browser console
if (typeof window !== 'undefined') {
  console.log('');
  console.log('🔧 SIPERTI - Custom Claims Sync Script');
  console.log('=====================================');
  console.log('');
  console.log('📋 Usage:');
  console.log('   1. Make sure you are logged in as ADMIN');
  console.log('   2. Run: syncClaimsViaConsole()');
  console.log('');
  console.log('⚠️ Note:');
  console.log('   This script requires Cloud Functions to be deployed first');
  console.log('   Run: firebase deploy --only functions');
  console.log('');
  console.log(' Ready to sync!');
  console.log('');
}
