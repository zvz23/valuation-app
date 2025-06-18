import React from 'react';
import { FormField, FileUpload } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';

export const PhotosSection: React.FC<SectionProps> = ({
  register,
  errors
}) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <FormField
          label="Exterior Photos"
          error={errors.photos?.exteriorPhotos?.message}
        >
          <FileUpload
            {...register('photos.exteriorPhotos')}
            multiple
            accept="image/*"
            error={errors.photos?.exteriorPhotos?.message}
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload multiple exterior photos of the property (front, back, sides, garden, etc.)
          </p>
        </FormField>

        <FormField
          label="Interior Photos"
          error={errors.photos?.interiorPhotos?.message}
        >
          <FileUpload
            {...register('photos.interiorPhotos')}
            multiple
            accept="image/*"
            error={errors.photos?.interiorPhotos?.message}
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload photos of interior rooms (kitchen, bedrooms, bathrooms, living areas, etc.)
          </p>
        </FormField>

        <FormField
          label="Additional Photos"
          error={errors.photos?.additionalPhotos?.message}
        >
          <FileUpload
            {...register('photos.additionalPhotos')}
            multiple
            accept="image/*"
            error={errors.photos?.additionalPhotos?.message}
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload any additional photos (special features, defects, improvements, etc.)
          </p>
        </FormField>

        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Photo Guidelines
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc pl-5 space-y-1">
                  <li>Accepted formats: JPEG, PNG, WebP</li>
                  <li>Maximum file size: 10MB per image</li>
                  <li>Recommended resolution: At least 1024x768 pixels</li>
                  <li>Take photos in good lighting conditions</li>
                  <li>Include wide-angle shots of each room</li>
                  <li>Capture any defects or special features clearly</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 