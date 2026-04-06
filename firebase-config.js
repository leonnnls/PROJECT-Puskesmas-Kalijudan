// Firebase Configuration for SIPERTI
// Puskesmas Kalijudan

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot, updateDoc, where } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, setPersistence, browserSessionPersistence, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBrt5SI6lzoWmbbLyCj46vRHRu49-_6VxI",
  authDomain: "siperti-puskesmas-kalijudan.firebaseapp.com",
  projectId: "siperti-puskesmas-kalijudan",
  storageBucket: "siperti-puskesmas-kalijudan.firebasestorage.app",
  messagingSenderId: "649134912217",
  appId: "1:649134912217:web:46ab35a5cbdc1ad299c4c8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ========================================
// SECURITY: Set Session Persistence
// ========================================
// Menggunakan browserSessionPersistence agar:
// 1. Token tidak tersimpan permanen di localStorage
// 2. User otomatis logout saat tab/browser ditutup
// 3. Mencegah session hijacking via local storage access
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log('🔒 Firebase Persistence: SESSION (Auto-logout saat tab ditutup)');
  })
  .catch((error) => {
    console.error('❌ Error setting persistence:', error);
  });

// Collection references
const casesCollection = collection(db, 'cases');
const usersCollection = collection(db, 'users');

// ============ USER MANAGEMENT FUNCTIONS ============

// Get user data from Firestore (optimized with where query)
async function getUserData(userId) {
  try {
    const q = query(usersCollection, where('uid', '==', userId));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// Get user by email (optimized with where query)
async function getUserByEmail(email) {
  try {
    // Use where query instead of fetching all users
    const q = query(usersCollection, where('email', '==', email));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
}

// Get all users
async function getAllUsers() {
  try {
    const snapshot = await getDocs(query(usersCollection, orderBy('created_at', 'desc')));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error getting all users:", error);
    return [];
  }
}

// Create new user with role
async function createUser(userData) {
  try {
    // Create auth account
    const userCredential = await createUserWithEmailAndPassword(auth, userData.email, userData.password);
    
    // Store user data in Firestore
    const userRef = await addDoc(usersCollection, {
      email: userData.email,
      nama: userData.nama,
      role: userData.role || 'staff',
      uid: userCredential.user.uid,
      created_at: new Date().toISOString(),
      created_by: userData.created_by || 'system'
    });
    
    return { 
      isOk: true, 
      uid: userCredential.user.uid,
      id: userRef.id
    };
  } catch (error) {
    console.error("Error creating user:", error);
    let errorMessage = "Gagal membuat user";
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = "Email sudah terdaftar";
    } else if (error.code === 'auth/weak-password') {
      errorMessage = "Password minimal 6 karakter";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Email tidak valid";
    }
    return { isOk: false, error: errorMessage };
  }
}

// Update user role
async function updateUserRole(userId, newRole) {
  try {
    const userDoc = doc(db, 'users', userId);
    await updateDoc(userDoc, {
      role: newRole,
      updated_at: new Date().toISOString()
    });
    return { isOk: true };
  } catch (error) {
    console.error("Error updating user role:", error);
    return { isOk: false, error: error.message };
  }
}

// Delete user
async function deleteUser(userId) {
  try {
    await deleteDoc(doc(db, 'users', userId));
    return { isOk: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return { isOk: false, error: error.message };
  }
}

// ============ DATA SDK FUNCTIONS ============

// Get all data with real-time listener
function subscribeToData(callback) {
  const q = query(casesCollection, orderBy('created_at', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      __backendId: doc.id,
      ...doc.data()
    }));
    callback(data);
  }, (error) => {
    console.error("Error subscribing to data:", error);
    callback([]);
  });
}

// Create new document
async function createData(data) {
  try {
    const docRef = await addDoc(casesCollection, {
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    return { isOk: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating document:", error);
    return { isOk: false, error: error.message };
  }
}

// Delete document
async function deleteData(id) {
  try {
    await deleteDoc(doc(db, 'cases', id));
    return { isOk: true };
  } catch (error) {
    console.error("Error deleting document:", error);
    return { isOk: false, error: error.message };
  }
}

// ============ AUTH SDK FUNCTIONS ============

// Login
async function login(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // Force refresh ID token to get latest custom claims
    await userCredential.user.getIdToken(true);

    // Get user role from Custom Claims (server-side, secure)
    const idTokenResult = await userCredential.user.getIdTokenResult();
    const customClaims = idTokenResult.claims;

    // Determine role from custom claims
    let role = null;
    if (customClaims.admin === true) {
      role = 'admin';
    } else if (customClaims.staff === true) {
      role = 'staff';
    }

    // Fallback: If custom claims not set yet, get from Firestore
    let userName = email.split('@')[0];
    if (!role) {
      console.warn('⚠️ Custom claims not found, falling back to Firestore role');
      const userData = await getUserByEmail(email);
      if (userData?.role) {
        role = userData.role;
        console.log(`✅ Role from Firestore: ${role}`);
      } else {
        role = 'staff'; // Default fallback
        console.warn('⚠️ No role found in Firestore, defaulting to staff');
      }
      if (userData?.nama) {
        userName = userData.nama;
      }
    } else {
      // Use name from custom claims if available
      userName = customClaims.nama || idTokenResult.claims.name || userName;
    }

    return {
      isOk: true,
      user: userCredential.user,
      email: userCredential.user.email,
      role: role,
      nama: userName,
      customClaims: customClaims // For debugging
    };
  } catch (error) {
    console.error("Login error:", error);
    let errorMessage = "Login gagal";
    if (error.code === 'auth/invalid-credential') {
      errorMessage = "Email atau password salah";
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = "Email tidak valid";
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = "Akun dinonaktifkan";
    }
    return { isOk: false, error: errorMessage };
  }
}

// Logout
async function logout() {
  try {
    await signOut(auth);
    return { isOk: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { isOk: false, error: error.message };
  }
}

// Listen to auth state changes
function onAuthStateChange(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        // Get ID token with custom claims
        const idTokenResult = await user.getIdTokenResult();
        const customClaims = idTokenResult.claims;

        // Determine role from custom claims
        let role = null;
        if (customClaims.admin === true) {
          role = 'admin';
        } else if (customClaims.staff === true) {
          role = 'staff';
        }

        // Fallback to Firestore if claims not set
        let userName = user.email.split('@')[0];
        if (!role) {
          console.warn('⚠️ Custom claims not found in auth state, using Firestore fallback');
          const userData = await getUserByEmail(user.email);
          if (userData?.role) {
            role = userData.role;
            console.log(`✅ Role from Firestore (auth state): ${role}`);
          } else {
            role = 'staff';
            console.warn('⚠️ No role found in Firestore, defaulting to staff');
          }
          if (userData?.nama) {
            userName = userData.nama;
          }
        } else {
          userName = customClaims.nama || customClaims.name || userName;
        }

        callback({
          isLoggedIn: true,
          user: user,
          email: user.email,
          role: role,
          nama: userName,
          customClaims: customClaims
        });
      } catch (error) {
        console.error('Error getting auth state:', error);
        // Fallback to basic user info
        callback({
          isLoggedIn: true,
          user: user,
          email: user.email,
          role: 'staff',
          nama: user.email.split('@')[0]
        });
      }
    } else {
      callback({ isLoggedIn: false, user: null });
    }
  });
}

// Export all functions
export {
  app,
  db,
  auth,
  subscribeToData,
  createData,
  deleteData,
  login,
  logout,
  onAuthStateChange,
  // User management
  getUserData,
  getUserByEmail,
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser
};

// Make functions available globally for console access
window.createData = createData;
window.deleteData = deleteData;
window.subscribeToData = subscribeToData;
window.login = login;
window.logout = logout;
window.app = app;
window.db = db;
window.auth = auth;
window.getUserData = getUserData;
window.getUserByEmail = getUserByEmail;
window.getAllUsers = getAllUsers;
window.createUser = createUser;
window.updateUserRole = updateUserRole;
window.deleteUser = deleteUser;
