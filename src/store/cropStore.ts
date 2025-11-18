import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Crop, GrowthRecord, Task, FarmArea } from '../types';

interface CropStore {
  crops: Crop[];
  growthRecords: GrowthRecord[];
  tasks: Task[];
  farmAreas: FarmArea[];
  
  // Crop actions
  addCrop: (crop: Omit<Crop, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateCrop: (id: string, crop: Partial<Crop>) => void;
  deleteCrop: (id: string) => void;
  getCrop: (id: string) => Crop | undefined;
  
  // GrowthRecord actions
  addGrowthRecord: (record: Omit<GrowthRecord, 'id' | 'createdAt'>) => void;
  getGrowthRecords: (cropId: string) => GrowthRecord[];
  deleteGrowthRecord: (id: string) => void;
  
  // Task actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  getTasks: (cropId?: string) => Task[];
  completeTask: (id: string) => void;
  
  // FarmArea actions
  addFarmArea: (area: Omit<FarmArea, 'id' | 'createdAt'>) => void;
  updateFarmArea: (id: string, area: Partial<FarmArea>) => void;
  deleteFarmArea: (id: string) => void;
  
  // Data import
  importData: (data: { crops: Crop[]; growthRecords: GrowthRecord[]; tasks: Task[]; farmAreas: FarmArea[] }) => void;
}

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useCropStore = create<CropStore>()(
  persist(
    (set, get) => ({
      crops: [],
      growthRecords: [],
      tasks: [],
      farmAreas: [],

      addCrop: (crop) => {
        const newCrop: Crop = {
          ...crop,
          id: generateId(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ crops: [...state.crops, newCrop] }));
      },

      updateCrop: (id, updates) => {
        set((state) => ({
          crops: state.crops.map((crop) =>
            crop.id === id
              ? { ...crop, ...updates, updatedAt: new Date().toISOString() }
              : crop
          ),
        }));
      },

      deleteCrop: (id) => {
        set((state) => ({
          crops: state.crops.filter((crop) => crop.id !== id),
          growthRecords: state.growthRecords.filter((record) => record.cropId !== id),
          tasks: state.tasks.filter((task) => task.cropId !== id),
        }));
      },

      getCrop: (id) => {
        return get().crops.find((crop) => crop.id === id);
      },

      addGrowthRecord: (record) => {
        const newRecord: GrowthRecord = {
          ...record,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          growthRecords: [...state.growthRecords, newRecord],
        }));
      },

      getGrowthRecords: (cropId) => {
        return get().growthRecords
          .filter((record) => record.cropId === cropId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      deleteGrowthRecord: (id) => {
        set((state) => ({
          growthRecords: state.growthRecords.filter((record) => record.id !== id),
        }));
      },

      addTask: (task) => {
        const newTask: Task = {
          ...task,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ tasks: [...state.tasks, newTask] }));
      },

      updateTask: (id, updates) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      getTasks: (cropId) => {
        const tasks = get().tasks;
        if (cropId) {
          return tasks.filter((task) => task.cropId === cropId);
        }
        return tasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
      },

      completeTask: (id) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, completed: true, completedDate: new Date().toISOString() }
              : task
          ),
        }));
      },

      addFarmArea: (area) => {
        const newArea: FarmArea = {
          ...area,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ farmAreas: [...state.farmAreas, newArea] }));
      },

      updateFarmArea: (id, updates) => {
        set((state) => ({
          farmAreas: state.farmAreas.map((area) =>
            area.id === id ? { ...area, ...updates } : area
          ),
        }));
      },

      deleteFarmArea: (id) => {
        set((state) => ({
          farmAreas: state.farmAreas.filter((area) => area.id !== id),
        }));
      },

      importData: (data) => {
        set({
          crops: data.crops,
          growthRecords: data.growthRecords,
          tasks: data.tasks,
          farmAreas: data.farmAreas,
        });
      },
    }),
    {
      name: 'farm-crop-storage',
    }
  )
);

