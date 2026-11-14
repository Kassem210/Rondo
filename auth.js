// Accounts, through Firebase Authentication. Everything here is a no-op
// until firebase-config.js is filled in.

const Auth = (() => {
  // The Firebase scripts can fail to load, for example behind a content blocker.
  const scriptsBlocked = Boolean(FIREBASE_CONFIG) && typeof firebase === 'undefined';
  const isConfigured = Boolean(FIREBASE_CONFIG) && !scriptsBlocked;

  const ERROR_MESSAGES = {
    'auth/invalid-email': 'That email address is not valid.',
    'auth/missing-password': 'Enter a password.',
    'auth/weak-password': 'Choose a password with at least 6 characters.',
    'auth/email-already-in-use': 'There is already an account with that email. Sign in instead.',
    'auth/invalid-credential': 'Wrong email or password.',
    'auth/wrong-password': 'Wrong email or password.',
    'auth/user-not-found': 'There is no account with that email.',
    'auth/popup-blocked': 'Your browser blocked the sign-in window. Allow pop-ups and try again.',
    'auth/operation-not-allowed': 'That way of signing in is not switched on yet.',
    'auth/unauthorized-domain': 'This website is not yet allowed to sign people in.',
    'auth/network-request-failed': 'Could not connect. Check your internet.',
  };

  // Closing the sign-in window is not an error worth showing.
  const SILENT_ERRORS = ['auth/popup-closed-by-user', 'auth/cancelled-popup-request'];

  function describe(user) {
    if (!user) return null;
    const emailName = user.email ? user.email.split('@')[0] : '';
    return {
      id: user.uid,
      name: (user.displayName || emailName).slice(0, 14),
      isGuest: user.isAnonymous,
    };
  }

  // Calls `onChange` now and whenever someone signs in or out.
  function start(onChange) {
    if (!isConfigured) return;
    firebase.initializeApp(FIREBASE_CONFIG);
    firebase.auth().onAuthStateChanged((user) => onChange(describe(user)));
  }

  function currentUser() {
    return isConfigured ? describe(firebase.auth().currentUser) : null;
  }

  function signInWithGoogle() {
    return firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider());
  }

  function signInWithApple() {
    return firebase.auth().signInWithPopup(new firebase.auth.OAuthProvider('apple.com'));
  }

  function signInWithEmail(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
  }

  async function createAccount(name, email, password) {
    const created = await firebase.auth().createUserWithEmailAndPassword(email, password);
    await created.user.updateProfile({ displayName: name });
  }

  // Guests get a temporary Firebase identity so they can join online rooms.
  async function signInAsGuest() {
    const current = firebase.auth().currentUser;
    const user = current || (await firebase.auth().signInAnonymously()).user;
    return user.uid;
  }

  function signOut() {
    return isConfigured ? firebase.auth().signOut() : Promise.resolve();
  }

  function database() {
    return isConfigured ? firebase.firestore() : null;
  }

  // Text to show for a failed sign-in, or '' if nothing should be shown.
  function errorMessage(error) {
    const code = error && error.code;
    if (SILENT_ERRORS.includes(code)) return '';
    return ERROR_MESSAGES[code] || 'Could not sign in. Try again.';
  }

  return {
    isConfigured,
    scriptsBlocked,
    start,
    currentUser,
    signInWithGoogle,
    signInWithApple,
    signInWithEmail,
    createAccount,
    signInAsGuest,
    signOut,
    database,
    errorMessage,
  };
})();
