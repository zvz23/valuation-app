import React from 'react';
import { SectionProps } from '@/types/valuation';

export const SiteDetailsSection: React.FC<SectionProps> = ({ 
  data, 
  updateData, 
  register, 
  errors 
}) => {
  const handleChange = (field: string, value: string | string[]) => {
    updateData({
      siteDetails: {
        ...data.siteDetails,
        [field]: value
      }
    });
  };

  const handleUtilityChange = (utility: string, checked: boolean) => {
    const currentUtilities = data.siteDetails?.utilities || [];
    const updatedUtilities = checked 
      ? [...currentUtilities, utility]
      : currentUtilities.filter(u => u !== utility);
    
    handleChange('utilities', updatedUtilities);
  };

  const utilityOptions = [
    'Electricity',
    'Water',
    'Sewer',
    'Gas',
    'Telecommunications',
    'Cable/Fiber',
    'Stormwater'
  ];

  return (
    <div className="p-8 bg-white">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
        Site Details
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* ERF Size */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              ERF Size
            </label>
            <input
              type="text"
              {...register('siteDetails.erfSize')}
              value={data.siteDetails?.erfSize || ''}
              onChange={(e) => handleChange('erfSize', e.target.value)}
              placeholder="e.g., 500m², 0.5 hectares"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            {errors.siteDetails?.erfSize && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.erfSize.message}
              </p>
            )}
          </div>

          {/* Site Topography */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Site Topography
            </label>
            <select
              {...register('siteDetails.siteTopography')}
              value={data.siteDetails?.siteTopography || ''}
              onChange={(e) => handleChange('siteTopography', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select topography...</option>
              <option value="Level">Level</option>
              <option value="Gently Sloping">Gently Sloping</option>
              <option value="Moderately Sloping">Moderately Sloping</option>
              <option value="Steeply Sloping">Steeply Sloping</option>
              <option value="Undulating">Undulating</option>
              <option value="Elevated">Elevated</option>
              <option value="Valley">Valley</option>
            </select>
            {errors.siteDetails?.siteTopography && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.siteTopography.message}
              </p>
            )}
          </div>

          {/* Soil Conditions */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Soil Conditions
            </label>
            <select
              {...register('siteDetails.soilConditions')}
              value={data.siteDetails?.soilConditions || ''}
              onChange={(e) => handleChange('soilConditions', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select soil conditions...</option>
              <option value="Sandy">Sandy</option>
              <option value="Clay">Clay</option>
              <option value="Loam">Loam</option>
              <option value="Rocky">Rocky</option>
              <option value="Mixed">Mixed</option>
              <option value="Fill">Fill</option>
              <option value="Unknown">Unknown</option>
            </select>
            {errors.siteDetails?.soilConditions && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.soilConditions.message}
              </p>
            )}
          </div>

          {/* Drainage */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Drainage
            </label>
            <select
              {...register('siteDetails.drainage')}
              value={data.siteDetails?.drainage || ''}
              onChange={(e) => handleChange('drainage', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select drainage...</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Average">Average</option>
              <option value="Poor">Poor</option>
              <option value="Very Poor">Very Poor</option>
            </select>
            {errors.siteDetails?.drainage && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.drainage.message}
              </p>
            )}
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Site Description
            </label>
            <textarea
              {...register('siteDetails.description')}
              value={data.siteDetails?.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Provide a detailed description of the site including its characteristics, features, and overall condition..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
            />
            {errors.siteDetails?.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.description.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Utilities */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Available Utilities
            </label>
            <div className="grid grid-cols-1 gap-2">
              {utilityOptions.map((utility) => (
                <label key={utility} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={(data.siteDetails?.utilities || []).includes(utility)}
                    onChange={(e) => handleUtilityChange(utility, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-900">{utility}</span>
                </label>
              ))}
            </div>
            {errors.siteDetails?.utilities && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.utilities.message}
              </p>
            )}
          </div>

          {/* Site Access */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Site Access
            </label>
            <textarea
              {...register('siteDetails.access')}
              value={data.siteDetails?.access || ''}
              onChange={(e) => handleChange('access', e.target.value)}
              placeholder="Describe access to the site including road conditions, entry points, parking, public transport accessibility..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
            />
            {errors.siteDetails?.access && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.access.message}
              </p>
            )}
          </div>

          {/* Site Identification */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Site Identification
            </label>
            <textarea
              {...register('siteDetails.identification')}
              value={data.siteDetails?.identification || ''}
              onChange={(e) => handleChange('identification', e.target.value)}
              placeholder="Include lot numbers, title references, street numbers, landmarks, and other identifying features..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
            />
            {errors.siteDetails?.identification && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.identification.message}
              </p>
            )}
          </div>

          {/* Map Source */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Map Source
            </label>
            <input
              type="text"
              {...register('siteDetails.mapSource')}
              value={data.siteDetails?.mapSource || ''}
              onChange={(e) => handleChange('mapSource', e.target.value)}
              placeholder="e.g., Google Maps, Council Maps, Survey Plans, etc."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            {errors.siteDetails?.mapSource && (
              <p className="text-red-500 text-sm mt-1">
                {errors.siteDetails.mapSource.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 