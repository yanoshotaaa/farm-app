import type { Crop, Task } from '../types';
import { parseISO, differenceInDays } from 'date-fns';

export interface CropStatistics {
  totalCrops: number;
  growingCrops: number;
  harvestedCrops: number;
  removedCrops: number;
  averageGrowthDays: number;
  upcomingHarvests: number;
  overdueTasks: number;
  completedTasks: number;
  pendingTasks: number;
}

export const calculateStatistics = (
  crops: Crop[],
  tasks: Task[]
): CropStatistics => {
  const now = new Date();
  
  const growingCrops = crops.filter((c) => c.status === 'growing');
  const harvestedCrops = crops.filter((c) => c.status === 'harvested');
  const removedCrops = crops.filter((c) => c.status === 'removed');
  
  // 平均成長日数を計算
  const harvestedWithDates = harvestedCrops.filter(
    (c) => c.actualHarvestDate && c.plantingDate
  );
  const averageGrowthDays =
    harvestedWithDates.length > 0
      ? Math.round(
          harvestedWithDates.reduce((sum, c) => {
            const days = differenceInDays(
              parseISO(c.actualHarvestDate!),
              parseISO(c.plantingDate)
            );
            return sum + days;
          }, 0) / harvestedWithDates.length
        )
      : 0;
  
  // 近々の収穫予定（7日以内）
  const upcomingHarvests = growingCrops.filter((c) => {
    const daysUntil = differenceInDays(parseISO(c.expectedHarvestDate), now);
    return daysUntil >= 0 && daysUntil <= 7;
  }).length;
  
  // タスク統計
  const overdueTasks = tasks.filter(
    (t) => !t.completed && differenceInDays(now, parseISO(t.dueDate)) > 0
  ).length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const pendingTasks = tasks.filter((t) => !t.completed).length;
  
  return {
    totalCrops: crops.length,
    growingCrops: growingCrops.length,
    harvestedCrops: harvestedCrops.length,
    removedCrops: removedCrops.length,
    averageGrowthDays,
    upcomingHarvests,
    overdueTasks,
    completedTasks,
    pendingTasks,
  };
};

