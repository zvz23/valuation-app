import React, { useState } from 'react';
import { FormField } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';
import { X } from 'lucide-react';
import axios from 'axios';
import Image from 'next/image';

export const PhotosSection: React.FC<SectionProps> = ({ 
  data, 
  updateData, 
  register, 
  errors 
}) => {
  console.log('📸 PhotosSection: Received data:', data);
  console.log('📸 PhotosSection: Photos data:', data?.photos);
  console.log('📸 PhotosSection: Photos data type:', typeof data?.photos);
  console.log('📸 PhotosSection: reportCoverPhoto:', data?.photos?.reportCoverPhoto);
  console.log('📸 PhotosSection: reportCoverPhoto type:', typeof data?.photos?.reportCoverPhoto);
  console.log('📸 PhotosSection: reportCoverPhoto is array:', Array.isArray(data?.photos?.reportCoverPhoto));
  
  const [counts, setCounts] = useState({
    reportCover: 0,
    exterior: 0,
    interior: 0,
    additional: 0,
    grannyFlat: 0,
  });
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleFileChange = (type: 'exterior' | 'interior' | 'additional' | 'reportCover' | 'grannyFlat') =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const { files } = event.target;
      setCounts(prev => ({
        ...prev,
        [type]: files?.length || 0
      }));
    };

  const handleDeletePhoto = async (photoType: string, photoUrl: string) => {
    setIsDeleting(photoUrl);
    try {
      const propertyId = window.location.pathname.split('/').pop();
      
      console.log(`🗑️ Frontend: Deleting photo from ${photoType}:`, photoUrl);
      console.log('🗑️ Frontend: Current photos data:', data.photos);
      
      const response = await axios.delete(`/api/property/${propertyId}/photos`, {
        data: {
          photoType,
          photoUrl
        }
      });
      
      console.log('🗑️ Frontend: Delete response:', response.data);

      // Update local data to remove the photo
      const updatedPhotos = { ...(data.photos || {}) } as any;
      
      if (photoType in updatedPhotos) {
        const currentPhotos = updatedPhotos[photoType];
        console.log('🗑️ Frontend: Photos before update:', currentPhotos);

        if (Array.isArray(currentPhotos)) {
          // Filter out the deleted photo URL
          updatedPhotos[photoType] = currentPhotos.filter((url: string) => url !== photoUrl);
        }
        console.log('🗑️ Frontend: Photos after update:', updatedPhotos[photoType]);
      }
      console.log('🗑️ Frontend: Full updated photos object:', updatedPhotos);
      
      updateData({ photos: updatedPhotos });
      console.log('🗑️ Frontend: updateData called with:', { photos: updatedPhotos });
      
      // Refetch data from API to ensure sync (more reliable than local state update)
      try {
        // Add a small delay to ensure database operation completes
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const propertyResponse = await axios.get(`/api/property/${propertyId}`);
        if (propertyResponse.data?.photos) {
          updateData({ photos: propertyResponse.data.photos });
          console.log('🔄 Frontend: Refetched photos from API:', propertyResponse.data.photos);
          console.log('🔄 Frontend: Updated local data successfully');
        }
      } catch (refetchError) {
        console.error('Error refetching data:', refetchError);
        // Force a page refresh as ultimate fallback
        setTimeout(() => {
          console.log('🔄 Frontend: Forcing page refresh as fallback');
          window.location.reload();
        }, 1000);
      }
      
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    } finally {
      setIsDeleting(null);
    }
  };

  const renderPhotoGrid = (photoType: string, photos: any, title: string) => {
    console.log(`🖼️ Rendering ${photoType}:`, photos);
    console.log(`🖼️ Type of photos:`, typeof photos);
    console.log(`🖼️ Is array:`, Array.isArray(photos));
    
    // Ensure photos is an array
    let photoArray: string[] = [];
    if (Array.isArray(photos)) {
      photoArray = photos;
    } else if (photos && typeof photos === 'object') {
      // If it's an object, try to extract values or convert to array
      photoArray = Object.values(photos).filter((item): item is string => typeof item === 'string');
    } else if (typeof photos === 'string') {
      // If it's a single string, make it an array
      photoArray = [photos];
    }
    
    console.log(`🖼️ Final photoArray for ${photoType}:`, photoArray);
    
    if (!photoArray || photoArray.length === 0) return null;

    return (
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photoArray.map((photoUrl: string, index: number) => (
            <div key={index} className="relative group">
                             <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                 <Image
                   src={photoUrl}
                   alt={`${title} ${index + 1}`}
                   width={200}
                   height={200}
                   className="w-full h-full object-cover"
                 />
               </div>
              <button
                type="button"
                onClick={() => handleDeletePhoto(photoType, photoUrl)}
                disabled={isDeleting === photoUrl}
                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 disabled:opacity-50"
                title="Delete photo"
              >
                {isDeleting === photoUrl ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <X size={16} />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Report Cover Photo Section */}
        <FormField
          label="Report Cover Photo"
          error={errors.photos?.reportCoverPhoto?.message}
        >
          {/* Display existing report cover photo */}
          {renderPhotoGrid('reportCoverPhoto', data?.photos?.reportCoverPhoto, 'Current Report Cover Photo')}
          
          <input
            type="file"
            accept="image/*"
            {...register('photos.reportCoverPhoto')}
            onChange={handleFileChange('reportCover')}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload report cover photo (front) - Only one photo allowed. New upload will replace existing photo.
          </p>
          {counts.reportCover > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {counts.reportCover} photo selected
            </p>
          )}
        </FormField>
        {/* Exterior Photos Section */}
        <FormField
          label="Exterior Photos"
          error={errors.photos?.exteriorPhotos?.message}
        >
          {/* Display existing exterior photos */}
          {renderPhotoGrid('exteriorPhotos', data?.photos?.exteriorPhotos, 'Current Exterior Photos')}
          
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

        {/* Interior Photos Section */}
        <FormField
          label="Interior Photos"
          error={errors.photos?.interiorPhotos?.message}
        >
          {/* Display existing interior photos */}
          {renderPhotoGrid('interiorPhotos', data?.photos?.interiorPhotos, 'Current Interior Photos')}
          
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

        {/* Additional Photos Section */}
        <FormField
          label="Additional Photos"
          error={errors.photos?.additionalPhotos?.message}
        >
          {/* Display existing additional photos */}
          {renderPhotoGrid('additionalPhotos', data?.photos?.additionalPhotos, 'Current Additional Photos')}
          
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

        {/* Granny Flat Photos Section */}
        <FormField
          label="Granny Flat Photos"
          error={errors.photos?.grannyFlatPhotos?.message}
        >
          {/* Display existing granny flat photos */}
          {renderPhotoGrid('grannyFlatPhotos', data?.photos?.grannyFlatPhotos, 'Current Granny Flat Photos')}
          
          <input
            type="file"
            accept="image/*"
            multiple
            {...register('photos.grannyFlatPhotos')}
            onChange={handleFileChange('grannyFlat')}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-gray-300 file:rounded-md file:text-sm file:bg-white file:text-gray-700 hover:file:bg-gray-100"
          />
          <p className="text-sm text-gray-500 mt-1">
            Upload granny flat photos (interior, exterior, etc.)
          </p>
          {counts.grannyFlat > 0 && (
            <p className="text-xs text-green-600 mt-1">
              {counts.grannyFlat} photo{counts.grannyFlat > 1 ? 's' : ''} selected
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
