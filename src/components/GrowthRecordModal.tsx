import { useState } from 'react';
import { useCropStore } from '../store/cropStore';
import { X } from 'lucide-react';

interface GrowthRecordModalProps {
  cropId: string;
  onClose: () => void;
}

const GrowthRecordModal = ({ cropId, onClose }: GrowthRecordModalProps) => {
  const { addGrowthRecord } = useCropStore();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    notes: '',
    height: '',
    width: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addGrowthRecord({
        cropId,
        date: new Date(formData.date).toISOString(),
        notes: formData.notes,
        height: formData.height ? parseFloat(formData.height) : undefined,
        width: formData.width ? parseFloat(formData.width) : undefined,
      });
      onClose();
    } catch (error) {
      alert('成長記録の追加に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">成長記録を追加</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="growth-record-date" className="label">日付 *</label>
            <input
              id="growth-record-date"
              name="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="growth-record-height" className="label">高さ (cm)</label>
              <input
                id="growth-record-height"
                name="height"
                type="number"
                step="0.1"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="input"
                placeholder="例: 30.5"
              />
            </div>

            <div>
              <label htmlFor="growth-record-width" className="label">幅 (cm)</label>
              <input
                id="growth-record-width"
                name="width"
                type="number"
                step="0.1"
                value={formData.width}
                onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                className="input"
                placeholder="例: 25.0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="growth-record-notes" className="label">メモ</label>
            <textarea
              id="growth-record-notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={5}
              placeholder="成長の様子や気づいたことを記録..."
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

export default GrowthRecordModal;

