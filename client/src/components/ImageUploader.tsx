import React, { useState } from 'react';
import { Upload, X, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { fetchApi } from '../api/client';

interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  value,
  onChange,
  label = 'Upload Image'
}) => {
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetchApi<{ imageUrl: string }>('/uploads', {
        method: 'POST',
        body: formData
      });

      if (res.success && res.data?.imageUrl) {
        onChange(res.data.imageUrl);
      } else {
        setErrorMsg(res.error?.message || 'Failed to upload image');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-400 uppercase">{label}</label>

      {value ? (
        <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 group max-w-sm">
          <img src={value} alt="Uploaded preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
            <label className="p-2 rounded-xl bg-brand-purple text-white cursor-pointer font-bold text-xs flex items-center space-x-1 hover:bg-brand-pink transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>Replace</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={() => onChange('')}
              className="p-2 rounded-xl bg-red-600 text-white font-bold text-xs hover:bg-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950 hover:border-brand-purple cursor-pointer transition-colors max-w-sm">
          {uploading ? (
            <div className="flex items-center space-x-2 text-brand-purple font-bold text-xs">
              <div className="w-4 h-4 border-2 border-brand-purple border-t-transparent rounded-full animate-spin" />
              <span>Uploading image...</span>
            </div>
          ) : (
            <div className="text-center space-y-1">
              <Upload className="w-6 h-6 text-slate-500 mx-auto" />
              <span className="text-xs font-bold text-slate-300 block">Click to select image file</span>
              <span className="text-[10px] text-slate-500 block">JPEG, PNG, WEBP or SVG (Max 10MB)</span>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {errorMsg && <p className="text-[11px] text-red-400 font-semibold">{errorMsg}</p>}
    </div>
  );
};
