import { create } from 'zustand';
import { authService } from '../services/authService';
import type { User } from 'firebase/auth';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  initialize: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: true,
  error: null,

  initialize: () => {
    authService.onAuthStateChange((user) => {
      set({ user, loading: false });
    });
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await authService.signUp(email, password);
      set({ loading: false });
    } catch (error: any) {
      console.error('Sign up error:', error);
      let errorMessage = 'アカウント作成に失敗しました';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            errorMessage = 'このメールアドレスは既に使用されています';
            break;
          case 'auth/weak-password':
            errorMessage = 'パスワードが弱すぎます（6文字以上）';
            break;
          case 'auth/invalid-email':
            errorMessage = 'メールアドレスの形式が正しくありません';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'メール/パスワード認証が有効化されていません。Firebase Consoleで設定を確認してください。';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
            break;
          default:
            errorMessage = `エラー: ${error.code} - ${error.message || 'アカウント作成に失敗しました'}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null });
    try {
      await authService.signIn(email, password);
      set({ loading: false });
    } catch (error: any) {
      console.error('Sign in error:', error);
      let errorMessage = 'ログインに失敗しました';
      
      if (error.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'ユーザーが見つかりません';
            break;
          case 'auth/wrong-password':
            errorMessage = 'パスワードが正しくありません';
            break;
          case 'auth/invalid-email':
            errorMessage = 'メールアドレスの形式が正しくありません';
            break;
          case 'auth/operation-not-allowed':
            errorMessage = 'メール/パスワード認証が有効化されていません。Firebase Consoleで設定を確認してください。';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'ネットワークエラーが発生しました。接続を確認してください。';
            break;
          case 'auth/invalid-credential':
            errorMessage = 'メールアドレスまたはパスワードが正しくありません';
            break;
          default:
            errorMessage = `エラー: ${error.code} - ${error.message || 'ログインに失敗しました'}`;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    try {
      await authService.signOut();
      set({ user: null, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'ログアウトに失敗しました',
        loading: false 
      });
      throw error;
    }
  },
}));

