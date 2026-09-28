import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import firebaseConfig from '../../../firebase-applet-config.json';

// Inicializar la app oficial de Firebase
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Proveedor oficial de Google con solicitud explícita de cuentas y consentimientos
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
googleProvider.addScope('openid');
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export interface GoogleUserProfile {
  email: string;
  name: string;
  picture: string;
  uid: string;
}

/**
 * Autenticación oficial con Firebase Auth y GoogleAuthProvider.
 * Requiere que el dominio del applet esté agregado en Firebase Console > Authentication > Settings > Authorized domains.
 */
export const signInWithGoogle = async (): Promise<GoogleUserProfile> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    return {
      email: user.email || '',
      name: user.displayName || (user.email ? user.email.split('@')[0] : 'Usuario'),
      picture: user.photoURL || '',
      uid: user.uid
    };
  } catch (error: any) {
    if (error?.code === 'auth/popup-closed-by-user' || error?.code === 'auth/cancelled-popup-request') {
      throw new Error("Se cerró la ventana de Google antes de completar la autenticación.");
    }
    if (error?.code === 'auth/popup-blocked') {
      throw new Error("La ventana emergente de Google fue bloqueada por el navegador. Habilite las ventanas emergentes en la barra de direcciones.");
    }
    if (error?.code === 'auth/unauthorized-domain') {
      throw new Error("Dominio no autorizado en Firebase. Agregue el dominio en Firebase Console > Authentication > Settings > Authorized domains.");
    }
    throw new Error(error?.message || "Error al autenticar con Google.");
  }
};

export const signInWithEmail = async (email: string, password: string) => {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return {
    email: result.user.email || email,
    name: result.user.displayName || email.split('@')[0] || 'Usuario',
    picture: result.user.photoURL || '',
  };
};

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const result = await createUserWithEmailAndPassword(auth, email, password);
  if (result.user && name) {
    await updateProfile(result.user, { displayName: name });
  }
  return {
    email: result.user.email || email,
    name: name || result.user.email?.split('@')[0] || 'Usuario',
    picture: result.user.photoURL || '',
  };
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Error al cerrar sesión en Firebase:', e);
  }
};
