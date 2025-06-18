import React from 'react';
import { SectionProps } from '@/types/valuation';

export const AnnexuresSection: React.FC<SectionProps> = ({ 
  data, 
  updateData, 
  register, 
  errors 
}) => {
  const handleFileChange = (field: 'titleDeed' | 'buildingPlans' | 'additionalDocuments', files: FileList | null) => {
    updateData({
      annexures: {
        ...data.annexures,
        [field]: files
      }
    });
  };

  return (
    <div className="p-8 bg-white">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
        Annexures
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Title Deed */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Title Deed
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              onChange={(e) => handleFileChange('titleDeed', e.target.files)}
              className="hidden"
              id="titleDeed"
            />
            <label htmlFor="titleDeed" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-sm text-gray-600">Click to upload title deed documents</p>
                <p className="text-xs text-gray-400">PDF, DOC, or images</p>
              </div>
            </label>
          </div>
          {data.annexures?.titleDeed && (
            <p className="text-sm text-green-600">
              {data.annexures.titleDeed.length} file(s) selected
            </p>
          )}
        </div>

        {/* Building Plans */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Building Plans
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.dwg"
              onChange={(e) => handleFileChange('buildingPlans', e.target.files)}
              className="hidden"
              id="buildingPlans"
            />
            <label htmlFor="buildingPlans" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-gray-600">Click to upload building plans</p>
                <p className="text-xs text-gray-400">PDF, CAD, or images</p>
              </div>
            </label>
          </div>
          {data.annexures?.buildingPlans && (
            <p className="text-sm text-green-600">
              {data.annexures.buildingPlans.length} file(s) selected
            </p>
          )}
        </div>

        {/* Additional Documents */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Additional Documents
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            <input
              type="file"
              multiple
              accept="*"
              onChange={(e) => handleFileChange('additionalDocuments', e.target.files)}
              className="hidden"
              id="additionalDocuments"
            />
            <label htmlFor="additionalDocuments" className="cursor-pointer">
              <div className="space-y-2">
                <svg className="w-8 h-8 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <p className="text-sm text-gray-600">Click to upload additional documents</p>
                <p className="text-xs text-gray-400">Any file type accepted</p>
              </div>
            </label>
          </div>
          {data.annexures?.additionalDocuments && (
            <p className="text-sm text-green-600">
              {data.annexures.additionalDocuments.length} file(s) selected
            </p>
          )}
        </div>
      </div>

      {/* Add from Photos Button */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900">Add from Photos</h4>
            <p className="text-sm text-gray-600">Select photos from your valuation photos to include as annexures</p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            onClick={() => {
              // This would open a photo selection modal
              alert('Photo selection functionality - to be implemented with photo management system');
            }}
          >
            Edit / Add Photos
          </button>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-900 mb-1">Annexures Help</h5>
        <p className="text-sm text-blue-700">
          Upload supporting documents such as title deeds, building plans, surveys, and any other relevant documentation. 
          You can also add photos from your valuation photo collection by clicking &ldquo;Edit / Add Photos&rdquo;.
        </p>
      </div>
    </div>
  );
}; 