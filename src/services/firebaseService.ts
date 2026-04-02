import { initializeApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GithubAuthProvider,
  OAuthProvider,
  UserCredential,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBkHcdTG5WbtqT0uLQbCAWAA0-Jt5pD_QY',
  authDomain: 'backend-bb349.firebaseapp.com',
  projectId: 'backend-bb349',
  storageBucket: 'backend-bb349.firebasestorage.app',
  messagingSenderId: '572067774503',
  appId: '1:572067774503:web:0a35999fed8aaebef54e02',
  measurementId: 'G-6WL5T36K9N',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
const githubProvider = new GithubAuthProvider();
// Solitudes:
githubProvider.addScope('user:email'); // ← para el correo
githubProvider.addScope('read:user'); // ← para el nombre y la foto
githubProvider.setCustomParameters({
  allow_signup: 'true',
  prompt: 'select_account', // ← agrega esto
});

const microsoftProvider = new OAuthProvider('microsoft.com');
// Solitudes:
githubProvider.addScope('user:email');
microsoftProvider.addScope('User.Read');
microsoftProvider.setCustomParameters({
  prompt: 'select_account' // ← Microsoft sí soporta esto
});

class FirebaseService {
  async loginWithGitHub(): Promise<UserCredential> {
    try {
      console.log('🔐 Iniciando login con GitHub...');
      const result = await signInWithPopup(auth, githubProvider);
      console.log('✅ Login con GitHub exitoso:', result.user);
      return result;
    } catch (error: any) {
      console.error('❌ Error en login con GitHub:', error);
      throw new Error(this.getFirebaseErrorMessage(error));
    }
  }

  async loginWithMicrosoft(): Promise<UserCredential> {
    try {
      console.log('🔐 Iniciando login con Microsoft...');
      const result = await signInWithPopup(auth, microsoftProvider);
      console.log('✅ Login con Microsoft exitoso:', result.user);
      return result;
    } catch (error: any) {
      console.error('❌ Error en login con Microsoft:', error);
      throw new Error(this.getFirebaseErrorMessage(error));
    }
  }

  private getFirebaseErrorMessage(error: any): string {
    const errorCode = error.code;

    switch (errorCode) {
      case 'auth/popup-closed-by-user':
        return 'El popup de autenticación fue cerrado. Intenta de nuevo.';
      case 'auth/popup-blocked':
        return 'El popup fue bloqueado por el navegador. Permite popups para este sitio.';
      case 'auth/network-request-failed':
        return 'Error de conexión. Verifica tu internet.';
      case 'auth/unauthorized-domain':
        return 'Dominio no autorizado. Contacta al administrador.';
      case 'auth/operation-not-allowed':
        return 'Método de login no habilitado. Contacta al administrador.';
      default:
        return error.message || 'Error desconocido en autenticación';
    }
  }

  async getFirebaseToken(): Promise<string> {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('No hay usuario autenticado');
    }
    return await user.getIdToken();
  }

  logout() {
    return auth.signOut();
  }
}

export default new FirebaseService();
