const firebaseConfig = {
  apiKey: "AIzaSyDRLEw8W-GcYCUaEeIDLsvPGN79zegZaO0",
  authDomain: "app-gastos-familia-f5c8b.firebaseapp.com",
  projectId: "app-gastos-familia-f5c8b",
  storageBucket: "app-gastos-familia-f5c8b.firebasestorage.app",
  messagingSenderId: "72954833295",
  appId: "1:72954833295:web:c48291b0b4203ae3f4c3fa"
};

const script1 = document.createElement('script');
script1.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js';
script1.onload = function() {
  const script2 = document.createElement('script');
  script2.src = 'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js';
  script2.onload = function() {
    firebase.initializeApp(firebaseConfig);
    window.auth = firebase.auth();

    const allowedEmails = [
      'carlosrojasgirao@gmail.com',
      'catherineberaun@gmail.com',
      'sr17062012@gmail.com'
    ];

    window.auth.onAuthStateChanged(function(user) {
      if (user && allowedEmails.includes(user.email.toLowerCase())) {
        window.currentUser = { email: user.email, name: user.displayName };
        document.getElementById('userName').textContent = user.displayName;
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        loadSheetsAPI().then(() => {
          loadData().then(() => updateDashboard());
        });
      } else if (user && !allowedEmails.includes(user.email.toLowerCase())) {
        alert('❌ No tienes permiso para usar esta app');
        window.auth.signOut();
      } else {
        document.getElementById('loginScreen').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
      }
    });
  };
  document.head.appendChild(script2);
};
document.head.appendChild(script1);

window.signInWithGoogle = async function() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await window.auth.signInWithPopup(provider);
  } catch (error) {
    console.error('Error en login:', error);
    alert('Error iniciando sesión: ' + error.message);
  }
};

window.signOut = async function() {
  try {
    await window.auth.signOut();
  } catch (error) {
    console.error('Error en logout:', error);
  }
};

function initAuth() {
  return Promise.resolve();
}