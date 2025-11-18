import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { convertImageToBase64, validateImageFile, compressImage } from '../utils/imageUtils';

interface ImageUploadProps {
  currentImage?: string;
  onImageChange: (base64: string | undefined) => void;
  label?: string;
}

const ImageUpload = ({ currentImage, onImageChange, label = '画像をアップロード' }: ImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error || '画像のアップロードに失敗しました');
      return;
    }

    setIsUploading(true);
    try {
      const base64 = await convertImageToBase64(file);
      const compressed = await compressImage(base64);
      onImageChange(compressed);
    } catch (err) {
      setError('画像の処理に失敗しました');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    onImageChange(undefined);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>
      {currentImage ? (
        <div className="relative">
          <img
            src={currentImage}
            alt="アップロード済み"
            className="w-full h-64 object-cover rounded-lg border border-gray-300"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors"
        >
          <input
            id="image-upload-input"
            name="image"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />
          {isUploading ? (
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mb-2"></div>
              <p className="text-gray-600">アップロード中...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <Upload className="h-12 w-12 text-gray-400 mb-2" />
              <p className="text-gray-600 font-medium">{label}</p>
              <p className="text-sm text-gray-500 mt-1">JPEG、PNG、WebP形式（最大5MB）</p>
            </div>
          )}
        </div>
      )}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;

