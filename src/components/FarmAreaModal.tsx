import { useState, useEffect } from 'react';
import { useCropStore } from '../store/cropStore';
import { X } from 'lucide-react';

interface FarmAreaModalProps {
  areaId: string | null;
  onClose: () => void;
}

const FarmAreaModal = ({ areaId, onClose }: FarmAreaModalProps) => {
  const { farmAreas, addFarmArea, updateFarmArea } = useCropStore();
  const isEdit = !!areaId;
  const area = areaId ? farmAreas.find((a) => a.id === areaId) : undefined;

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    area: '',
  });

  useEffect(() => {
    if (area) {
      setFormData({
        name: area.name,
        description: area.description,
        area: area.area.toString(),
      });
    }
  }, [area]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEdit && areaId) {
        await updateFarmArea(areaId, {
          ...formData,
          area: parseFloat(formData.area) || 0,
        });
      } else {
        await addFarmArea({
          ...formData,
          area: parseFloat(formData.area) || 0,
        });
      }
      onClose();
    } catch (error) {
      alert('保存に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEdit ? '区画を編集' : '新しい区画を追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="farm-area-name" className="label">区画名 *</label>
            <input
              id="farm-area-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="例: 畑A-1区画"
            />
          </div>

          <div>
            <label htmlFor="farm-area-description" className="label">説明</label>
            <textarea
              id="farm-area-description"
              name="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows={4}
              placeholder="区画の説明を入力..."
            />
          </div>

          <div>
            <label htmlFor="farm-area-area" className="label">面積 (㎡)</label>
            <input
              id="farm-area-area"
              name="area"
              type="number"
              step="0.1"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: e.target.value })}
              className="input"
              placeholder="例: 10.5"
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary flex-1">
              {isEdit ? '更新' : '追加'}
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

export default FarmAreaModal;

