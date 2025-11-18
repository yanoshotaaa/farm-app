import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from '../config/firebase';

export const authService = {
  signUp: async (email: string, password: string) => {
    return await createUserWithEmailAndPassword(auth, email, password);
  },

  signIn: async (email: string, password: string) => {
    return await signInWithEmailAndPassword(auth, email, password);
  },

  signOut: async () => {
    return await signOut(auth);
  },

  onAuthStateChange: (callback: (user: User | null) => void) => {
    return onAuthStateChanged(auth, callback);
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },
};

