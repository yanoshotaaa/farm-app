import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  type DocumentData,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { Crop, GrowthRecord, Task, FarmArea, ChatMessage } from '../types';

// ユーザーIDを取得
const getUserId = () => {
  return auth.currentUser?.uid || 'anonymous';
};

// コレクション名
const COLLECTIONS = {
  crops: 'crops',
  growthRecords: 'growthRecords',
  tasks: 'tasks',
  farmAreas: 'farmAreas',
  chatMessages: 'chatMessages',
};

// タイムスタンプ変換ヘルパー
const toFirestore = (data: any) => {
  const converted: any = {};
  
  // undefinedの値を除外し、タイムスタンプを変換
  Object.keys(data).forEach((key) => {
    const value = data[key];
    
    // undefinedの値はスキップ
    if (value === undefined) {
      return;
    }
    
    // タイムスタンプフィールドを変換
    if (['createdAt', 'updatedAt', 'date', 'dueDate', 'plantingDate', 'expectedHarvestDate', 'actualHarvestDate', 'completedDate', 'timestamp'].includes(key)) {
      if (value && typeof value === 'string') {
        converted[key] = Timestamp.fromDate(new Date(value));
      } else if (value) {
        converted[key] = value;
      }
    } else {
      converted[key] = value;
    }
  });
  
  return converted;
};

const fromFirestore = (doc: DocumentData) => {
  const data = doc.data();
  const converted = { ...data, id: doc.id };
  // TimestampをISO文字列に変換
  ['createdAt', 'updatedAt', 'date', 'dueDate', 'plantingDate', 'expectedHarvestDate', 'actualHarvestDate', 'completedDate', 'timestamp'].forEach((key) => {
    if (converted[key]?.toDate) {
      converted[key] = converted[key].toDate().toISOString();
    }
  });
  return converted;
};

// ========== Crop関連 ==========
export const cropService = {
  getAll: async (): Promise<Crop[]> => {
    try {
      const userId = getUserId();
      // まずはwhereのみで取得し、クライアント側でソート（インデックス不要）
      const q = query(
        collection(db, COLLECTIONS.crops),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const crops = snapshot.docs.map(fromFirestore) as Crop[];
      // クライアント側でソート
      return crops.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      console.error('Error fetching crops:', error);
      if (error.code === 'failed-precondition') {
        throw new Error('Firestoreインデックスが必要です。Firebase Consoleでインデックスを作成してください。');
      }
      throw error;
    }
  },

  getById: async (id: string): Promise<Crop | null> => {
    const docRef = doc(db, COLLECTIONS.crops, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return fromFirestore(docSnap) as Crop;
    }
    return null;
  },

  create: async (crop: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const userId = getUserId();
      if (!userId || userId === 'anonymous') {
        throw new Error('ログインが必要です。ページを再読み込みしてください。');
      }
      
      const cropData = {
        ...toFirestore(crop),
        userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      
      console.log('Creating crop with data:', cropData);
      const docRef = await addDoc(collection(db, COLLECTIONS.crops), cropData);
      return docRef.id;
    } catch (error: any) {
      console.error('Error creating crop:', error);
      if (error.code === 'permission-denied') {
        throw new Error('保存権限がありません。Firebase Consoleでセキュリティルールを確認してください。');
      }
      throw error;
    }
  },

  update: async (id: string, updates: Partial<Crop>): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.crops, id);
    await updateDoc(docRef, {
      ...toFirestore(updates),
      updatedAt: Timestamp.now(),
    });
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.crops, id));
  },
};

// ========== GrowthRecord関連 ==========
export const growthRecordService = {
  getByCropId: async (cropId: string): Promise<GrowthRecord[]> => {
    try {
      const userId = getUserId();
      // まずはwhereのみで取得し、クライアント側でソート
      const q = query(
        collection(db, COLLECTIONS.growthRecords),
        where('cropId', '==', cropId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(fromFirestore) as GrowthRecord[];
      // クライアント側でソート
      return records.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
    } catch (error: any) {
      console.error('Error fetching growth records:', error);
      if (error.code === 'failed-precondition') {
        throw new Error('Firestoreインデックスが必要です。Firebase Consoleでインデックスを作成してください。');
      }
      throw error;
    }
  },

  create: async (record: Omit<GrowthRecord, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.growthRecords), {
      ...toFirestore(record),
      userId: getUserId(),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.growthRecords, id));
  },
};

// ========== Task関連 ==========
export const taskService = {
  getAll: async (cropId?: string): Promise<Task[]> => {
    try {
      const userId = getUserId();
      let q;
      if (cropId) {
        q = query(
          collection(db, COLLECTIONS.tasks),
          where('userId', '==', userId),
          where('cropId', '==', cropId)
        );
      } else {
        q = query(
          collection(db, COLLECTIONS.tasks),
          where('userId', '==', userId)
        );
      }
      const snapshot = await getDocs(q);
      const tasks = snapshot.docs.map(fromFirestore) as Task[];
      // クライアント側でソート
      return tasks.sort((a, b) => 
        new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      );
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      if (error.code === 'failed-precondition') {
        throw new Error('Firestoreインデックスが必要です。Firebase Consoleでインデックスを作成してください。');
      }
      throw error;
    }
  },

  create: async (task: Omit<Task, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.tasks), {
      ...toFirestore(task),
      userId: getUserId(),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  update: async (id: string, updates: Partial<Task>): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.tasks, id);
    await updateDoc(docRef, toFirestore(updates));
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.tasks, id));
  },
};

// ========== FarmArea関連 ==========
export const farmAreaService = {
  getAll: async (): Promise<FarmArea[]> => {
    try {
      const userId = getUserId();
      const q = query(
        collection(db, COLLECTIONS.farmAreas),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const areas = snapshot.docs.map(fromFirestore) as FarmArea[];
      // クライアント側でソート
      return areas.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      console.error('Error fetching farm areas:', error);
      if (error.code === 'failed-precondition') {
        throw new Error('Firestoreインデックスが必要です。Firebase Consoleでインデックスを作成してください。');
      }
      throw error;
    }
  },

  create: async (area: Omit<FarmArea, 'id' | 'createdAt'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.farmAreas), {
      ...toFirestore(area),
      userId: getUserId(),
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  },

  update: async (id: string, updates: Partial<FarmArea>): Promise<void> => {
    const docRef = doc(db, COLLECTIONS.farmAreas, id);
    await updateDoc(docRef, toFirestore(updates));
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.farmAreas, id));
  },
};

// ========== ChatMessage関連 ==========
export const chatMessageService = {
  getAll: async (): Promise<ChatMessage[]> => {
    try {
      const userId = getUserId();
      const q = query(
        collection(db, COLLECTIONS.chatMessages),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map(fromFirestore) as ChatMessage[];
      // クライアント側でソート
      return messages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
    } catch (error: any) {
      console.error('Error fetching chat messages:', error);
      if (error.code === 'failed-precondition') {
        throw new Error('Firestoreインデックスが必要です。Firebase Consoleでインデックスを作成してください。');
      }
      throw error;
    }
  },

  create: async (message: Omit<ChatMessage, 'id'>): Promise<string> => {
    const docRef = await addDoc(collection(db, COLLECTIONS.chatMessages), {
      ...toFirestore(message),
      userId: getUserId(),
    });
    return docRef.id;
  },

  delete: async (id: string): Promise<void> => {
    await deleteDoc(doc(db, COLLECTIONS.chatMessages, id));
  },

  clearAll: async (): Promise<void> => {
    const q = query(
      collection(db, COLLECTIONS.chatMessages),
      where('userId', '==', getUserId())
    );
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  },
};
