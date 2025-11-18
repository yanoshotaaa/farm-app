import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCropStore } from '../store/cropStore';
import { ArrowLeft } from 'lucide-react';
import ImageUpload from '../components/ImageUpload';

const CropForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getCrop, addCrop, updateCrop } = useCropStore();
  const isEdit = !!id;

  const crop = id ? getCrop(id) : undefined;

  const [formData, setFormData] = useState({
    name: '',
    variety: '',
    location: '',
    plantingDate: new Date().toISOString().split('T')[0],
    expectedHarvestDate: '',
    notes: '',
    status: 'growing' as 'growing' | 'harvested' | 'removed',
    imageUrl: undefined as string | undefined,
  });

  useEffect(() => {
    if (crop) {
      setFormData({
        name: crop.name,
        variety: crop.variety,
        location: crop.location,
        plantingDate: crop.plantingDate.split('T')[0],
        expectedHarvestDate: crop.expectedHarvestDate.split('T')[0],
        notes: crop.notes,
        status: crop.status,
        imageUrl: crop.imageUrl,
      });
    }
  }, [crop]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEdit && id) {
      updateCrop(id, {
        ...formData,
        plantingDate: new Date(formData.plantingDate).toISOString(),
        expectedHarvestDate: new Date(formData.expectedHarvestDate).toISOString(),
      });
    } else {
      addCrop({
        ...formData,
        plantingDate: new Date(formData.plantingDate).toISOString(),
        expectedHarvestDate: new Date(formData.expectedHarvestDate).toISOString(),
      });
    }
    
    navigate(isEdit ? `/crops/${id}` : '/crops');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link to={isEdit ? `/crops/${id}` : '/crops'} className="btn btn-secondary flex items-center w-fit">
        <ArrowLeft className="h-5 w-5 mr-2" />
        戻る
      </Link>

      <div className="card">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? '作物を編集' : '新しい作物を追加'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="crop-name" className="label">作物名 *</label>
            <input
              id="crop-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input"
              placeholder="例: トマト"
            />
          </div>

          <div>
            <label htmlFor="crop-variety" className="label">品種 *</label>
            <input
              id="crop-variety"
              name="variety"
              type="text"
              required
              value={formData.variety}
              onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
              className="input"
              placeholder="例: 桃太郎"
            />
          </div>

          <div>
            <label htmlFor="crop-location" className="label">場所 *</label>
            <input
              id="crop-location"
              name="location"
              type="text"
              required
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input"
              placeholder="例: 畑A-1区画"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="crop-planting-date" className="label">植え付け日 *</label>
              <input
                id="crop-planting-date"
                name="plantingDate"
                type="date"
                required
                value={formData.plantingDate}
                onChange={(e) => setFormData({ ...formData, plantingDate: e.target.value })}
                className="input"
              />
            </div>

            <div>
              <label htmlFor="crop-expected-harvest-date" className="label">収穫予定日 *</label>
              <input
                id="crop-expected-harvest-date"
                name="expectedHarvestDate"
                type="date"
                required
                value={formData.expectedHarvestDate}
                onChange={(e) => setFormData({ ...formData, expectedHarvestDate: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="crop-status" className="label">状態</label>
            <select
              id="crop-status"
              name="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="input"
            >
              <option value="growing">成長中</option>
              <option value="harvested">収穫済み</option>
              <option value="removed">除去済み</option>
            </select>
          </div>

          <div>
            <ImageUpload
              currentImage={formData.imageUrl}
              onImageChange={(base64) => setFormData({ ...formData, imageUrl: base64 })}
              label="作物の写真"
            />
          </div>

          <div>
            <label htmlFor="crop-notes" className="label">メモ</label>
            <textarea
              id="crop-notes"
              name="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows={5}
              placeholder="メモや注意事項を入力..."
            />
          </div>

          <div className="flex gap-4">
            <button type="submit" className="btn btn-primary flex-1">
              {isEdit ? '更新' : '追加'}
            </button>
            <Link
              to={isEdit ? `/crops/${id}` : '/crops'}
              className="btn btn-secondary"
            >
              キャンセル
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CropForm;

