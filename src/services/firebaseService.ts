import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GithubAuthProvider, 
  OAuthProvider,
  UserCredential 
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB2gUX67IPnJw8E3aENclCdZXPf2JqqopY",
  authDomain: "logout-5ff36.firebaseapp.com",
  projectId: "logout-5ff36",
  storageBucket: "logout-5ff36.firebasestorage.app",
  messagingSenderId: "78598626971",
  appId: "1:78598626971:web:32a2b16bd589b436d2f03e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Providers
const githubProvider = new GithubAuthProvider();
const microsoftProvider = new OAuthProvider('microsoft.com');

// Configure scopes
githubProvider.addScope('user:email');
microsoftProvider.addScope('User.Read');

class FirebaseService {
  async loginWithGitHub(): Promise<UserCredential> {
    try {
      console.log("🔐 Iniciando login con GitHub...");
      const result = await signInWithPopup(auth, githubProvider);
      console.log("✅ Login con GitHub exitoso:", result.user);
      return result;
    } catch (error: any) {
      console.error("❌ Error en login con GitHub:", error);
      throw new Error(this.getFirebaseErrorMessage(error));
    }
  }

  async loginWithMicrosoft(): Promise<UserCredential> {
    try {
      console.log("🔐 Iniciando login con Microsoft...");
      const result = await signInWithPopup(auth, microsoftProvider);
      console.log("✅ Login con Microsoft exitoso:", result.user);
      return result;
    } catch (error: any) {
      console.error("❌ Error en login con Microsoft:", error);
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