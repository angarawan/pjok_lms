import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach(scope => {
  provider.addScope(scope);
});
provider.setCustomParameters({
  prompt: 'select_account'
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;
let cachedUser: User | null = null;

type AuthCallback = (user: User, token: string) => void;
type FailureCallback = () => void;
const listeners: { success?: AuthCallback; failure?: FailureCallback }[] = [];

export const initAuth = (
  onAuthSuccess?: AuthCallback,
  onAuthFailure?: FailureCallback
) => {
  const listener = { success: onAuthSuccess, failure: onAuthFailure };
  listeners.push(listener);

  const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
    cachedUser = user;
    if (user && cachedAccessToken) {
      listeners.forEach(l => l.success?.(user, cachedAccessToken!));
    } else if (!isSigningIn) {
      if (!user) cachedAccessToken = null;
      listeners.forEach(l => l.failure?.());
    }
  });

  return () => {
    const idx = listeners.indexOf(listener);
    if (idx !== -1) listeners.splice(idx, 1);
    unsubscribe();
  };
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }

    cachedAccessToken = credential.accessToken;
    cachedUser = result.user;
    listeners.forEach(l => l.success?.(result.user, cachedAccessToken!));
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error);
    if (error?.code === 'auth/unauthorized-domain' || error?.message?.includes('unauthorized-domain')) {
      error.isUnauthorizedDomain = true;
      error.unauthorizedHostname = window.location.hostname;
    }
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const setManualGoogleSession = (email: string, displayName: string = ''): { user: any; accessToken: string } => {
  const pseudoUser: any = {
    email,
    displayName: displayName || email.split('@')[0],
    photoURL: null,
    uid: 'manual_' + email.replace(/[^a-zA-Z0-9]/g, '_')
  };
  cachedUser = pseudoUser;
  cachedAccessToken = 'session_' + Date.now();
  listeners.forEach(l => l.success?.(pseudoUser, cachedAccessToken!));
  return { user: pseudoUser, accessToken: cachedAccessToken };
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const getCurrentGoogleUser = (): User | null => {
  return cachedUser || auth.currentUser;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
  cachedUser = null;
  listeners.forEach(l => l.failure?.());
};
