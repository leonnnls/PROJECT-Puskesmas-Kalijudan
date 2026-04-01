// Firebase Configuration for SIPERTI
// Puskesmas Kalijudan

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, onSnapshot, updateDoc } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";

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

// Collection references
const casesCollection = collection(db, 'cases');
const usersCollection = collection(db, 'users');

// ============ USER MANAGEMENT FUNCTIONS ============

// Get user data from Firestore
async function getUserData(userId) {
  try {
    const userDoc = await getDocs(query(usersCollection, orderBy('email')));
    const user = userDoc.docs.find(doc => doc.id === userId);
    if (user) {
      return { id: user.id, ...user.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
}

// Get user by email
async function getUserByEmail(email) {
  try {
    const userDoc = await getDocs(query(usersCollection, orderBy('email')));
    const user = userDoc.docs.find(doc => doc.data().email === email);
    if (user) {
      return { id: user.id, ...user.data() };
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
    
    // Get user role from Firestore
    const userData = await getUserByEmail(email);
    
    return {
      isOk: true,
      user: userCredential.user,
      email: userCredential.user.email,
      role: userData?.role || 'staff',
      nama: userData?.nama || email.split('@')[0]
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
      const userData = await getUserByEmail(user.email);
      callback({
        isLoggedIn: true,
        user: user,
        email: user.email,
        role: userData?.role || 'staff',
        nama: userData?.nama || user.email.split('@')[0]
      });
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
