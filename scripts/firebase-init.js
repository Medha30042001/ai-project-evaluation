if (!window.firebaseInitialized) {
  (async () => {
    const load = src => new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s);
    });

    await load('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
    await load('https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js');
    await load('https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js');

    if (window.__FIREBASE_CONFIG) {
      firebase.initializeApp(window.__FIREBASE_CONFIG);
    } else {
      console.warn('No Firebase config found. Add window.__FIREBASE_CONFIG in index or create firebase-config.js per README.');
    }

    window.db = firebase.firestore();
    window.auth = firebase.auth();
    window.firebaseInitialized = true;
  })();
}
