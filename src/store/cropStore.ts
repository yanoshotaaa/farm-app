import { create } from 'zustand';
import type { Crop, GrowthRecord, Task, FarmArea } from '../types';
import * as firestoreService from '../services/firestoreService';

interface CropStore {
  crops: Crop[];
  growthRecords: GrowthRecord[];
  tasks: Task[];
  farmAreas: FarmArea[];
  loading: boolean;
  error: string | null;
  
  // データ読み込み
  loadData: () => Promise<void>;
  
  // Crop actions
  addCrop: (crop: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateCrop: (id: string, crop: Partial<Crop>) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  getCrop: (id: string) => Crop | undefined;
  
  // GrowthRecord actions
  addGrowthRecord: (record: Omit<GrowthRecord, 'id' | 'createdAt'>) => Promise<void>;
  getGrowthRecords: (cropId: string) => GrowthRecord[];
  deleteGrowthRecord: (id: string) => Promise<void>;
  loadGrowthRecords: (cropId: string) => Promise<void>;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => Promise<void>;
  updateTask: (id: string, task: Partial<Task>) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  getTasks: (cropId?: string) => Task[];
  completeTask: (id: string) => Promise<void>;
  
  // FarmArea actions
  addFarmArea: (area: Omit<FarmArea, 'id' | 'createdAt'>) => Promise<void>;
  updateFarmArea: (id: string, area: Partial<FarmArea>) => Promise<void>;
  deleteFarmArea: (id: string) => Promise<void>;
  
  // Data import
  importData: (data: { crops: Crop[]; growthRecords: GrowthRecord[]; tasks: Task[]; farmAreas: FarmArea[] }) => Promise<void>;
}

export const useCropStore = create<CropStore>((set, get) => ({
  crops: [],
  growthRecords: [],
  tasks: [],
  farmAreas: [],
  loading: false,
  error: null,

  loadData: async () => {
    set({ loading: true, error: null });
    try {
      const [crops, tasks, farmAreas] = await Promise.all([
        firestoreService.cropService.getAll(),
        firestoreService.taskService.getAll(),
        firestoreService.farmAreaService.getAll(),
      ]);
      set({ crops, tasks, farmAreas, loading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'データの読み込みに失敗しました',
        loading: false 
      });
    }
  },

  addCrop: async (crop) => {
    try {
      const id = await firestoreService.cropService.create(crop);
      const newCrop: Crop = {
        ...crop,
        id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ crops: [...state.crops, newCrop] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '作物の追加に失敗しました' });
      throw error;
    }
  },

  updateCrop: async (id, updates) => {
    try {
      await firestoreService.cropService.update(id, updates);
      set((state) => ({
        crops: state.crops.map((crop) =>
          crop.id === id
            ? { ...crop, ...updates, updatedAt: new Date().toISOString() }
            : crop
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '作物の更新に失敗しました' });
      throw error;
    }
  },

  deleteCrop: async (id) => {
    try {
      await firestoreService.cropService.delete(id);
      set((state) => ({
        crops: state.crops.filter((crop) => crop.id !== id),
        growthRecords: state.growthRecords.filter((record) => record.cropId !== id),
        tasks: state.tasks.filter((task) => task.cropId !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '作物の削除に失敗しました' });
      throw error;
    }
  },

  getCrop: (id) => {
    return get().crops.find((crop) => crop.id === id);
  },

  addGrowthRecord: async (record) => {
    try {
      const id = await firestoreService.growthRecordService.create(record);
      const newRecord: GrowthRecord = {
        ...record,
        id,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        growthRecords: [...state.growthRecords, newRecord],
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '成長記録の追加に失敗しました' });
      throw error;
    }
  },

  loadGrowthRecords: async (cropId) => {
    try {
      const records = await firestoreService.growthRecordService.getByCropId(cropId);
      set((state) => ({
        growthRecords: [
          ...state.growthRecords.filter((r) => r.cropId !== cropId),
          ...records,
        ],
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '成長記録の読み込みに失敗しました' });
    }
  },

  getGrowthRecords: (cropId) => {
    return get().growthRecords
      .filter((record) => record.cropId === cropId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  deleteGrowthRecord: async (id) => {
    try {
      await firestoreService.growthRecordService.delete(id);
      set((state) => ({
        growthRecords: state.growthRecords.filter((record) => record.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '成長記録の削除に失敗しました' });
      throw error;
    }
  },

  addTask: async (task) => {
    try {
      const id = await firestoreService.taskService.create(task);
      const newTask: Task = {
        ...task,
        id,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ tasks: [...state.tasks, newTask] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'タスクの追加に失敗しました' });
      throw error;
    }
  },

  updateTask: async (id, updates) => {
    try {
      await firestoreService.taskService.update(id, updates);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id ? { ...task, ...updates } : task
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'タスクの更新に失敗しました' });
      throw error;
    }
  },

  deleteTask: async (id) => {
    try {
      await firestoreService.taskService.delete(id);
      set((state) => ({
        tasks: state.tasks.filter((task) => task.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'タスクの削除に失敗しました' });
      throw error;
    }
  },

  getTasks: (cropId) => {
    const tasks = get().tasks;
    if (cropId) {
      return tasks.filter((task) => task.cropId === cropId);
    }
    return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  completeTask: async (id) => {
    try {
      await firestoreService.taskService.update(id, {
        completed: true,
        completedDate: new Date().toISOString(),
      });
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task.id === id
            ? { ...task, completed: true, completedDate: new Date().toISOString() }
            : task
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'タスクの完了に失敗しました' });
      throw error;
    }
  },

  addFarmArea: async (area) => {
    try {
      const id = await firestoreService.farmAreaService.create(area);
      const newArea: FarmArea = {
        ...area,
        id,
        createdAt: new Date().toISOString(),
      };
      set((state) => ({ farmAreas: [...state.farmAreas, newArea] }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '区画の追加に失敗しました' });
      throw error;
    }
  },

  updateFarmArea: async (id, updates) => {
    try {
      await firestoreService.farmAreaService.update(id, updates);
      set((state) => ({
        farmAreas: state.farmAreas.map((area) =>
          area.id === id ? { ...area, ...updates } : area
        ),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '区画の更新に失敗しました' });
      throw error;
    }
  },

  deleteFarmArea: async (id) => {
    try {
      await firestoreService.farmAreaService.delete(id);
      set((state) => ({
        farmAreas: state.farmAreas.filter((area) => area.id !== id),
      }));
    } catch (error) {
      set({ error: error instanceof Error ? error.message : '区画の削除に失敗しました' });
      throw error;
    }
  },

  importData: async (data) => {
    try {
      // バッチでインポート
      const promises = [
        ...data.crops.map((crop) => firestoreService.cropService.create(crop)),
        ...data.growthRecords.map((record) => firestoreService.growthRecordService.create(record)),
        ...data.tasks.map((task) => firestoreService.taskService.create(task)),
        ...data.farmAreas.map((area) => firestoreService.farmAreaService.create(area)),
      ];
      await Promise.all(promises);
      // データを再読み込み
      await get().loadData();
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'データのインポートに失敗しました' });
      throw error;
    }
  },
}));
