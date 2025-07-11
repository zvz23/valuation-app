import React, { useState } from 'react';
import { FormField } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';

export const PhotosSection: React.FC<SectionProps> = ({ register, errors }) => {
  const [counts, setCounts] = useState({
    exterior: 0,
    interior: 0,
    additional: 0,
  });

  const handleFileChange = (type: 'exterior' | 'interior' | 'additional') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      setCounts(prev => ({
        ...prev,
        [type]: files?.length || 0
      }));
    };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Exterior */}
        <FormField
          label="Exterior Photos"
          error={errors.photos?.exteriorPhotos?.message}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            {...register('photos.exteriorPhotos')}
            onChange={handleFileChange('exterior')}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload exterior photos (front, back, garden, etc.)
          </p>
          {counts.exterior > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {counts.exterior} photo{counts.exterior > 1 ? 's' : ''} selected
            </p>
          )}
        </FormField>

        {/* Interior */}
        <FormField
          label="Interior Photos"
          error={errors.photos?.interiorPhotos?.message}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            {...register('photos.interiorPhotos')}
            onChange={handleFileChange('interior')}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload interior room photos (kitchen, bathrooms, etc.)
          </p>
          {counts.interior > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {counts.interior} photo{counts.interior > 1 ? 's' : ''} selected
            </p>
          )}
        </FormField>

        {/* Additional */}
        <FormField
          label="Additional Photos"
          error={errors.photos?.additionalPhotos?.message}
        >
          <input
            type="file"
            accept="image/*"
            multiple
            {...register('photos.additionalPhotos')}
            onChange={handleFileChange('additional')}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload other relevant images (defects, features, etc.)
          </p>
          {counts.additional > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {counts.additional} photo{counts.additional > 1 ? 's' : ''} selected
            </p>
          )}
        </FormField>

        {/* Guidelines */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Photo Guidelines</h3>
              <ul className="list-disc pl-5 mt-2 text-sm text-blue-700 space-y-1">
                <li>Accepted formats: JPEG, PNG, WebP</li>
                <li>Max file size: 10MB per image</li>
                <li>Recommended resolution: 1024x768+</li>
                <li>Good lighting, wide-angle shots preferred</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
