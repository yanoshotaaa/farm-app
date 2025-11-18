import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Firebase設定
// 環境変数から取得（フォールバック付き）
const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyAmAHIZ6xjliLN1WaKmlfyZsJiYAY3076M';
const authDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'farm-app-cccbf.firebaseapp.com';
const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || 'farm-app-cccbf';
const storageBucket = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'farm-app-cccbf.firebasestorage.app';
const messagingSenderId = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '868260869864';
const appId = import.meta.env.VITE_FIREBASE_APP_ID || '1:868260869864:web:ea93c5de0b4686a3dc3b5d';

// デバッグ用（開発環境のみ）
if (import.meta.env.DEV) {
  console.log('Firebase Config:', {
    apiKey: apiKey ? `${apiKey.substring(0, 10)}...` : 'NOT SET',
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId: appId ? `${appId.substring(0, 10)}...` : 'NOT SET',
  });
  
  // ブラウザのコンソールで確認できるようにグローバル変数として公開
  if (typeof window !== 'undefined') {
    (window as any).__FIREBASE_CONFIG__ = {
      apiKey: apiKey ? `${apiKey.substring(0, 20)}...` : 'NOT SET',
      authDomain,
      projectId,
      storageBucket,
      messagingSenderId,
      appId: appId ? `${appId.substring(0, 20)}...` : 'NOT SET',
    };
    console.log('ブラウザのコンソールで __FIREBASE_CONFIG__ を確認できます');
  }
}

// 環境変数が設定されていない場合のエラーチェック
if (!apiKey || !authDomain || !projectId || !storageBucket || !messagingSenderId || !appId) {
  console.error('Firebase環境変数が設定されていません。.envファイルを確認してください。');
  console.error('Missing:', {
    apiKey: !apiKey,
    authDomain: !authDomain,
    projectId: !projectId,
    storageBucket: !storageBucket,
    messagingSenderId: !messagingSenderId,
    appId: !appId,
  });
}

const firebaseConfig = {
  apiKey: apiKey || '',
  authDomain: authDomain || '',
  projectId: projectId || '',
  storageBucket: storageBucket || '',
  messagingSenderId: messagingSenderId || '',
  appId: appId || '',
};

// Firebase初期化
const app = initializeApp(firebaseConfig);

// FirestoreとAuthの初期化
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;

