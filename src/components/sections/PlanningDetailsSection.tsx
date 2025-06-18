import React from 'react';
import { SectionProps } from '@/types/valuation';

export const PlanningDetailsSection: React.FC<SectionProps> = ({ 
  data, 
  updateData, 
  register, 
  errors 
}) => {
  const handleChange = (field: string, value: string | boolean) => {
    updateData({
      planningDetails: {
        ...data.planningDetails,
        [field]: value
      }
    });
  };

  return (
    <div className="p-8 bg-white">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
        Planning Details
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Planning Approval */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Planning Approval
            </label>
            <select
              {...register('planningDetails.planningApproval')}
              value={data.planningDetails?.planningApproval || ''}
              onChange={(e) => handleChange('planningApproval', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select planning approval status...</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Not Required">Not Required</option>
              <option value="Rejected">Rejected</option>
              <option value="Conditional Approval">Conditional Approval</option>
              <option value="Under Review">Under Review</option>
              <option value="Expired">Expired</option>
            </select>
            {errors.planningDetails?.planningApproval && (
              <p className="text-red-500 text-sm mt-1">
                {errors.planningDetails.planningApproval.message}
              </p>
            )}
          </div>

          {/* Current Use */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Current Use
            </label>
            <select
              {...register('planningDetails.currentUse')}
              value={data.planningDetails?.currentUse || ''}
              onChange={(e) => handleChange('currentUse', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select current use...</option>
              <option value="Residential - Single Dwelling">Residential - Single Dwelling</option>
              <option value="Residential - Multi Dwelling">Residential - Multi Dwelling</option>
              <option value="Commercial - Office">Commercial - Office</option>
              <option value="Commercial - Retail">Commercial - Retail</option>
              <option value="Commercial - Warehouse">Commercial - Warehouse</option>
              <option value="Industrial">Industrial</option>
              <option value="Mixed Use">Mixed Use</option>
              <option value="Agricultural">Agricultural</option>
              <option value="Vacant Land">Vacant Land</option>
              <option value="Institutional">Institutional</option>
              <option value="Other">Other</option>
            </select>
            {errors.planningDetails?.currentUse && (
              <p className="text-red-500 text-sm mt-1">
                {errors.planningDetails.currentUse.message}
              </p>
            )}
          </div>

          {/* Heritage Registration */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Heritage Registration
            </label>
            <select
              {...register('planningDetails.heritageRegistration')}
              value={data.planningDetails?.heritageRegistration || ''}
              onChange={(e) => handleChange('heritageRegistration', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            >
              <option value="">Select heritage status...</option>
              <option value="No Heritage Listing">No Heritage Listing</option>
              <option value="Local Heritage">Local Heritage</option>
              <option value="State Heritage">State Heritage</option>
              <option value="National Heritage">National Heritage</option>
              <option value="World Heritage">World Heritage</option>
              <option value="Heritage Overlay">Heritage Overlay</option>
              <option value="Conservation Area">Conservation Area</option>
              <option value="Under Assessment">Under Assessment</option>
            </select>
            {errors.planningDetails?.heritageRegistration && (
              <p className="text-red-500 text-sm mt-1">
                {errors.planningDetails.heritageRegistration.message}
              </p>
            )}
          </div>

          {/* Legacy Fields - Zoning Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Zoning Category <span className="text-xs text-gray-500">(Legacy)</span>
            </label>
            <input
              type="text"
              {...register('planningDetails.zoningCategory')}
              value={data.planningDetails?.zoningCategory || ''}
              onChange={(e) => handleChange('zoningCategory', e.target.value)}
              placeholder="e.g., R1, B1, IN1"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            />
            {errors.planningDetails?.zoningCategory && (
              <p className="text-red-500 text-sm mt-1">
                {errors.planningDetails.zoningCategory.message}
              </p>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Potential Future Use */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Potential Future Use
            </label>
            <textarea
              {...register('planningDetails.potentialFutureUse')}
              value={data.planningDetails?.potentialFutureUse || ''}
              onChange={(e) => handleChange('potentialFutureUse', e.target.value)}
              placeholder="Describe potential future development opportunities, rezoning possibilities, subdivision potential, etc..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
            />
            {errors.planningDetails?.potentialFutureUse && (
              <p className="text-red-500 text-sm mt-1">
                {errors.planningDetails.potentialFutureUse.message}
              </p>
            )}
          </div>

          {/* Planning Scheme */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Planning Scheme
            </label>
            <textarea
              {...register('planningDetails.planningScheme')}
              value={data.planningDetails?.planningScheme || ''}
              onChange={(e) => handleChange('planningScheme', e.target.value)}
              placeholder="Details about the applicable planning scheme, zones, overlays, and relevant planning provisions..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
            />
            {errors.planningDetails?.planningScheme && (
              <p className="text-red-500 text-sm mt-1">
                {errors.planningDetails.planningScheme.message}
              </p>
            )}
          </div>

          {/* Legacy Fields - Checkboxes */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Compliance Status <span className="text-xs text-gray-500">(Legacy Fields)</span>
            </h4>
            
            <div className="grid grid-cols-1 gap-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('planningDetails.buildingPlans')}
                  checked={data.planningDetails?.buildingPlans || false}
                  onChange={(e) => handleChange('buildingPlans', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900">Building Plans Available</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('planningDetails.occupancyCertificate')}
                  checked={data.planningDetails?.occupancyCertificate || false}
                  onChange={(e) => handleChange('occupancyCertificate', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900">Occupancy Certificate Available</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  {...register('planningDetails.buildingCompliance')}
                  checked={data.planningDetails?.buildingCompliance || false}
                  onChange={(e) => handleChange('buildingCompliance', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-900">Building Compliance Verified</span>
              </label>
            </div>
          </div>

          {/* Future Development Rights */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Future Development Rights <span className="text-xs text-gray-500">(Legacy)</span>
            </label>
            <textarea
              {...register('planningDetails.futureDevRights')}
              value={data.planningDetails?.futureDevRights || ''}
              onChange={(e) => handleChange('futureDevRights', e.target.value)}
              placeholder="Description of future development rights and restrictions..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[100px] text-gray-900"
            />
            {errors.planningDetails?.futureDevRights && (
              <p className="text-red-500 text-sm mt-1">
                {errors.planningDetails.futureDevRights.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 