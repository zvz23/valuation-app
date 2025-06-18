import React from 'react';
import { FormField, Textarea } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';
import { Download } from 'lucide-react';

export const GeneralCommentsSection: React.FC<SectionProps> = ({
  register,
  errors
}) => {
  const fetchFromCoreLogic = (field: string) => {
    // Placeholder for CoreLogic API integration
    console.log(`Fetching ${field} from CoreLogic...`);
    // This will be implemented with actual CoreLogic API calls
  };

  return (
    <div className="space-y-8">
      {/* Market Overview */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Market & Property Information
        </h4>
        
        <FormField
          label="Market Overview"
          error={errors.generalComments?.marketOverview?.message}
        >
          <Textarea
            {...register('generalComments.marketOverview')}
            placeholder="Enter market overview including market trends, recent sales, and area analysis..."
            rows={4}
            error={errors.generalComments?.marketOverview?.message}
          />
        </FormField>

        <FormField
          label="General Property Comments"
          error={errors.generalComments?.generalPropertyComments?.message}
        >
          <div className="space-y-2">
            <Textarea
              {...register('generalComments.generalPropertyComments')}
              placeholder="Auto-generated property comments from CoreLogic including property features, condition, and characteristics..."
              rows={4}
              error={errors.generalComments?.generalPropertyComments?.message}
            />
            <button
              type="button"
              onClick={() => fetchFromCoreLogic('generalPropertyComments')}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-3 h-3 mr-1" />
              Auto-fetch from CoreLogic
            </button>
          </div>
        </FormField>

        <FormField
          label="Property Description"
          error={errors.generalComments?.propertyDescription?.message}
        >
          <div className="space-y-2">
            <Textarea
              {...register('generalComments.propertyDescription')}
              placeholder="Auto-generated detailed property description from CoreLogic including layout, construction, and amenities..."
              rows={4}
              error={errors.generalComments?.propertyDescription?.message}
            />
            <button
              type="button"
              onClick={() => fetchFromCoreLogic('propertyDescription')}
              className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="w-3 h-3 mr-1" />
              Auto-fetch from CoreLogic
            </button>
          </div>
        </FormField>
      </div>

      {/* Manual Fields */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Additional Details
        </h4>
        
        <FormField
          label="Occupancy Details"
          error={errors.generalComments?.occupancyDetails?.message}
        >
          <Textarea
            {...register('generalComments.occupancyDetails')}
            placeholder="Enter details about current occupancy status, tenancy arrangements, lease terms, or vacancy information..."
            rows={3}
            error={errors.generalComments?.occupancyDetails?.message}
          />
        </FormField>

        <FormField
          label="Valuation Comments"
          error={errors.generalComments?.valuationComments?.message}
        >
          <Textarea
            {...register('generalComments.valuationComments')}
            placeholder="Enter detailed comments about the valuation methodology, assumptions, basis of value, and any special considerations..."
            rows={4}
            error={errors.generalComments?.valuationComments?.message}
          />
        </FormField>
      </div>

      {/* Professional Guidelines */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Professional Guidelines
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <ul className="list-disc pl-5 space-y-1">
                <li>Auto-fetch functions connect to CoreLogic RP Data for current market information</li>
                <li>Review and customize auto-generated content for accuracy and relevance</li>
                <li>Ensure all comments are professional, objective, and comply with valuation standards</li>
                <li>Include specific occupancy details that may affect property value</li>
                <li>Document valuation methodology and any limitations or assumptions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 