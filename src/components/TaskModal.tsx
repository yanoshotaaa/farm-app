import { useState, useEffect } from 'react';
import { useCropStore } from '../store/cropStore';
import { X } from 'lucide-react';

interface TaskModalProps {
  cropId?: string;
  onClose: () => void;
}

const TaskModal = ({ cropId, onClose }: TaskModalProps) => {
  const { addTask, crops } = useCropStore();
  const [formData, setFormData] = useState({
    cropId: cropId || '',
    type: 'other' as 'watering' | 'fertilizing' | 'pruning' | 'harvesting' | 'other',
    title: '',
    description: '',
    dueDate: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (cropId) {
      setFormData((prev) => ({ ...prev, cropId }));
    }
  }, [cropId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cropId) {
      alert('作物を選択してください');
      return;
    }
    try {
      await addTask({
        ...formData,
        dueDate: new Date(formData.dueDate).toISOString(),
        completed: false,
      });
      onClose();
    } catch (error) {
      alert('タスクの追加に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">タスクを追加</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="task-crop-id" className="label">作物 *</label>
            <select
              id="task-crop-id"
              name="cropId"
              required
              value={formData.cropId}
              onChange={(e) => setFormData({ ...formData, cropId: e.target.value })}
              className="input"
              disabled={!!cropId}
            >
              <option value="">選択してください</option>
              {crops
                .filter((c) => c.status === 'growing')
                .map((crop) => (
                  <option key={crop.id} value={crop.id}>
                    {crop.name} ({crop.variety})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label htmlFor="task-type" className="label">タスクの種類 *</label>
            <select
              id="task-type"
              name="type"
              required
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="input"
            >
              <option value="watering">水やり</option>
              <option value="fertilizing">施肥</option>
              <option value="pruning">剪定</option>
              <option value="harvesting">収穫</option>
              <option value="other">その他</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-title" className="label">タイトル *</label>
            <input
              id="task-title"
              name="title"
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input"
              placeholder="例: 水やり"
            />
          </div>

          <div>
            <label htmlFor="task-description" className="label">説明</label>
            <textarea
              id="task-description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={4}
              placeholder="タスクの詳細を入力..."
            />
          </div>

          <div>
            <label htmlFor="task-due-date" className="label">期限 *</label>
            <input
              id="task-due-date"
              name="dueDate"
              type="date"
              required
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="input"
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary flex-1">
              追加
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              キャンセル
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;

