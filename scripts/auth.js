function signInWithGoogle() {
  const provider = new firebase.auth.GoogleAuthProvider();
  return firebase.auth().signInWithPopup(provider);
}

function signOut() {
  return firebase.auth().signOut();
}

function onAuthStateChanged(cb) {
  firebase.auth().onAuthStateChanged(cb);
}

window.authHelpers = {
  signInWithGoogle,
  signOut,
  onAuthStateChanged
};

window.signInWithGoogle = signInWithGoogle;
window.onAuthStateChanged = onAuthStateChanged;
window.signOut = signOut;
