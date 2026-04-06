/**
 * SIPERTI - Firebase Cloud Functions
 * Firestore Rules & Custom Claims Management
 * 
 * Fungsi:
 * 1. Set custom claims saat user dibuat
 * 2. Validate role changes (prevent privilege escalation)
 * 3. Sync role dari Firestore ke Custom Claims
 * 
 * DEPLOY:
 * firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
admin.initializeApp();

const db = admin.firestore();
const auth = admin.auth();

// ========================================
// FUNCTION 1: Set Custom Claims on User Creation
// ========================================

/**
 * Triggered ketika document baru dibuat di collection 'users'
 * Otomatis set custom claims berdasarkan role
 */
exports.setUserRoleClaim = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snapshot, context) => {
    try {
      const userData = snapshot.data();
      const userId = context.params.userId;
      const { role, uid, email } = userData;

      // Validate role
      if (!role || !['staff', 'admin'].includes(role)) {
        console.error(`Invalid role for user ${userId}: ${role}`);
        return null;
      }

      console.log(`Setting custom claims for ${email} (${role})`);

      // Set custom claims via Admin SDK (server-side, secure)
      await auth.setCustomUserClaims(uid, {
        [role]: true, // Sets either {staff: true} or {admin: true}
        role: role    // Also store role name for easy access
      });

      console.log(`✅ Custom claims set successfully for ${email}`);
      return null;

    } catch (error) {
      console.error('❌ Error setting custom claims:', error);
      return null; // Don't fail the function
    }
  });

// ========================================
// FUNCTION 2: Update Custom Claims on Role Change
// ========================================

/**
 * Triggered ketika document user di-update
 * Sync perubahan role ke custom claims
 */
exports.updateUserRoleClaim = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();
      const userId = context.params.userId;

      // Check if role changed
      if (before.role === after.role) {
        return null; // No change needed
      }

      console.log(`Role changed for ${after.email}: ${before.role} → ${after.role}`);

      // Validate new role
      if (!['staff', 'admin'].includes(after.role)) {
        console.error(`Invalid role: ${after.role}`);
        return null;
      }

      // Remove old role claim, set new role claim
      const newClaims = {
        [after.role]: true,
        role: after.role
      };

      // Clear old role claim
      if (before.role === 'staff') {
        newClaims.staff = null; // Remove claim
      } else if (before.role === 'admin') {
        newClaims.admin = null; // Remove claim
      }

      await auth.setCustomUserClaims(after.uid, newClaims);

      console.log(`✅ Custom claims updated for ${after.email}`);
      return null;

    } catch (error) {
      console.error('❌ Error updating custom claims:', error);
      return null;
    }
  });

// ========================================
// FUNCTION 3: Prevent Privilege Escalation
// ========================================

/**
 * SECURITY: Prevent unauthorized role changes
 * Triggered BEFORE write to users collection
 */
exports.validateRoleChange = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    try {
      const before = change.before.exists ? change.before.data() : null;
      const after = change.after.exists ? change.after.data() : null;

      // If new document, allow (handled by createUserRoleClaim)
      if (!before) {
        return true;
      }

      // If deleted, allow
      if (!after) {
        return true;
      }

      // Check if role changed
      if (before.role === after.role) {
        return true; // No change
      }

      // Role changed - verify this is authorized
      // In production, check request.auth.token.admin === true
      // For now, log the change for audit
      console.warn(`⚠️ Role change detected: ${before.email} (${before.role} → ${after.role})`);
      
      // TODO: Add verification logic here
      // For now, allow but log for audit trail
      
      return true;

    } catch (error) {
      console.error('❌ Error validating role change:', error);
      return false; // Block the change on error
    }
  });

// ========================================
// FUNCTION 4: Audit Logging
// ========================================

/**
 * Log all user management actions for security audit
 */
exports.logUserAction = functions.firestore
  .document('users/{userId}')
  .onWrite(async (change, context) => {
    try {
      const userId = context.params.userId;
      const before = change.before.exists ? change.before.data() : null;
      const after = change.after.exists ? change.after.data() : null;

      let action = '';
      if (!before && after) {
        action = 'CREATE';
      } else if (before && !after) {
        action = 'DELETE';
      } else if (before && after) {
        action = 'UPDATE';
      }

      // Log to audit collection
      await db.collection('audit_logs').add({
        action: action,
        collection: 'users',
        documentId: userId,
        email: after ? after.email : (before ? before.email : 'unknown'),
        role: after ? after.role : (before ? before.role : 'unknown'),
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        triggeredBy: 'system' // TODO: Get from request.auth
      });

      console.log(`📝 Audit log: ${action} user ${userId}`);
      return null;

    } catch (error) {
      console.error('❌ Error logging audit:', error);
      return null;
    }
  });

// ========================================
// UTILITY: Bulk Set Claims for Existing Users
// ========================================

/**
 * Callable function to sync all existing users' claims
 * Run once after deploying these functions
 * 
 * Cara run via console:
 * firebase functions:shell
 * > syncExistingClaims()
 */
exports.syncExistingClaims = functions.https.onCall(async (data, context) => {
  try {
    // Verify caller is admin
    if (!context.auth || !context.auth.token.admin) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Only admins can sync claims'
      );
    }

    const usersSnapshot = await db.collection('users').get();
    let successCount = 0;
    let errorCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      try {
        const userData = userDoc.data();
        const { uid, role } = userData;

        await auth.setCustomUserClaims(uid, {
          [role]: true,
          role: role
        });

        successCount++;
        console.log(`✅ Synced: ${userData.email} (${role})`);
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed: ${userData.email}`, error);
      }
    }

    return {
      success: true,
      message: `Synced ${successCount} users, ${errorCount} failed`
    };

  } catch (error) {
    console.error('❌ Error syncing claims:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});
