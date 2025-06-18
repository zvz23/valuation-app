import React from 'react';
import { FormField, Input, Select, Textarea } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';

const titleTypeOptions = [
  { value: 'torrens', label: 'Torrens Title' },
  { value: 'old_system', label: 'Old System Title' },
  { value: 'strata', label: 'Strata Title' },
  { value: 'community', label: 'Community Title' },
  { value: 'leasehold', label: 'Leasehold' },
  { value: 'crown_lease', label: 'Crown Lease' },
  { value: 'other', label: 'Other' }
];

const complianceStatusOptions = [
  { value: 'compliant', label: 'Compliant' },
  { value: 'non_compliant', label: 'Non-Compliant' },
  { value: 'partial', label: 'Partially Compliant' },
  { value: 'unknown', label: 'Unknown' },
  { value: 'not_applicable', label: 'Not Applicable' }
];

export const StatutoryDetailsSection: React.FC<SectionProps> = ({
  register,
  errors
}) => {
  return (
    <div className="space-y-8">
      {/* Title & Legal Information */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Title & Legal Information
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Title Reference Number"
            error={errors.statutoryDetails?.titleReference?.message}
          >
            <Input
              {...register('statutoryDetails.titleReference')}
              placeholder="e.g., 12345/678"
              error={errors.statutoryDetails?.titleReference?.message}
            />
          </FormField>

          <FormField
            label="Title Type"
            error={errors.statutoryDetails?.titleType?.message}
          >
            <Select
              {...register('statutoryDetails.titleType')}
              options={titleTypeOptions}
              error={errors.statutoryDetails?.titleType?.message}
            />
          </FormField>

          <FormField
            label="Registered Proprietor"
            error={errors.statutoryDetails?.registeredProprietor?.message}
          >
            <Input
              {...register('statutoryDetails.registeredProprietor')}
              placeholder="Enter registered owner name"
              error={errors.statutoryDetails?.registeredProprietor?.message}
            />
          </FormField>

          <FormField
            label="Lot/Plan Number"
            error={errors.statutoryDetails?.lotPlanNumber?.message}
          >
            <Input
              {...register('statutoryDetails.lotPlanNumber')}
              placeholder="e.g., Lot 15 Plan 1234567"
              error={errors.statutoryDetails?.lotPlanNumber?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Important Dates */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Important Dates
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            label="Title Issue Date"
            error={errors.statutoryDetails?.titleIssueDate?.message}
          >
            <Input
              type="date"
              {...register('statutoryDetails.titleIssueDate')}
              error={errors.statutoryDetails?.titleIssueDate?.message}
            />
          </FormField>

          <FormField
            label="Last Transfer Date"
            error={errors.statutoryDetails?.lastTransferDate?.message}
          >
            <Input
              type="date"
              {...register('statutoryDetails.lastTransferDate')}
              error={errors.statutoryDetails?.lastTransferDate?.message}
            />
          </FormField>

          <FormField
            label="Certificate of Occupancy Date"
            error={errors.statutoryDetails?.certificateOccupancyDate?.message}
          >
            <Input
              type="date"
              {...register('statutoryDetails.certificateOccupancyDate')}
              error={errors.statutoryDetails?.certificateOccupancyDate?.message}
            />
          </FormField>

          <FormField
            label="Building Approval Date"
            error={errors.statutoryDetails?.buildingApprovalDate?.message}
          >
            <Input
              type="date"
              {...register('statutoryDetails.buildingApprovalDate')}
              error={errors.statutoryDetails?.buildingApprovalDate?.message}
            />
          </FormField>

          <FormField
            label="Planning Approval Date"
            error={errors.statutoryDetails?.planningApprovalDate?.message}
          >
            <Input
              type="date"
              {...register('statutoryDetails.planningApprovalDate')}
              error={errors.statutoryDetails?.planningApprovalDate?.message}
            />
          </FormField>

          <FormField
            label="Site Value Assessment Date"
            error={errors.statutoryDetails?.siteValueAssessmentDate?.message}
          >
            <Input
              type="date"
              {...register('statutoryDetails.siteValueAssessmentDate')}
              error={errors.statutoryDetails?.siteValueAssessmentDate?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Site Value & Assessments */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Site Value & Assessments
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Land Value (Rating Purposes) ($)"
            error={errors.statutoryDetails?.landValue?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('statutoryDetails.landValue', {
                min: { value: 0, message: 'Value cannot be negative' }
              })}
              placeholder="e.g., 450000.00"
              error={errors.statutoryDetails?.landValue?.message}
            />
          </FormField>

          <FormField
            label="Unimproved Capital Value ($)"
            error={errors.statutoryDetails?.unimprovedCapitalValue?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('statutoryDetails.unimprovedCapitalValue', {
                min: { value: 0, message: 'Value cannot be negative' }
              })}
              placeholder="e.g., 480000.00"
              error={errors.statutoryDetails?.unimprovedCapitalValue?.message}
            />
          </FormField>

          <FormField
            label="Capital Improved Value ($)"
            error={errors.statutoryDetails?.capitalImprovedValue?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('statutoryDetails.capitalImprovedValue', {
                min: { value: 0, message: 'Value cannot be negative' }
              })}
              placeholder="e.g., 750000.00"
              error={errors.statutoryDetails?.capitalImprovedValue?.message}
            />
          </FormField>

          <FormField
            label="Site Value Assessment Authority"
            error={errors.statutoryDetails?.siteValueAuthority?.message}
          >
            <Input
              {...register('statutoryDetails.siteValueAuthority')}
              placeholder="e.g., Valuer-General NSW"
              error={errors.statutoryDetails?.siteValueAuthority?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Rates & Charges */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Rates & Charges
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Annual Council Rates ($)"
            error={errors.statutoryDetails?.councilRates?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('statutoryDetails.councilRates', {
                min: { value: 0, message: 'Value cannot be negative' }
              })}
              placeholder="e.g., 2500.00"
              error={errors.statutoryDetails?.councilRates?.message}
            />
          </FormField>

          <FormField
            label="Annual Land Tax ($)"
            error={errors.statutoryDetails?.landTax?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('statutoryDetails.landTax', {
                min: { value: 0, message: 'Value cannot be negative' }
              })}
              placeholder="e.g., 1200.00"
              error={errors.statutoryDetails?.landTax?.message}
            />
          </FormField>

          <FormField
            label="Annual Water Rates ($)"
            error={errors.statutoryDetails?.waterRates?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('statutoryDetails.waterRates', {
                min: { value: 0, message: 'Value cannot be negative' }
              })}
              placeholder="e.g., 800.00"
              error={errors.statutoryDetails?.waterRates?.message}
            />
          </FormField>

          <FormField
            label="Other Annual Charges ($)"
            error={errors.statutoryDetails?.otherCharges?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('statutoryDetails.otherCharges', {
                min: { value: 0, message: 'Value cannot be negative' }
              })}
              placeholder="e.g., 500.00"
              error={errors.statutoryDetails?.otherCharges?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Planning & Zoning */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Planning & Zoning
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Zoning Classification"
            error={errors.statutoryDetails?.zoningClassification?.message}
          >
            <Input
              {...register('statutoryDetails.zoningClassification')}
              placeholder="e.g., R2 Low Density Residential"
              error={errors.statutoryDetails?.zoningClassification?.message}
            />
          </FormField>

          <FormField
            label="Planning Authority"
            error={errors.statutoryDetails?.planningAuthority?.message}
          >
            <Input
              {...register('statutoryDetails.planningAuthority')}
              placeholder="e.g., City of Sydney Council"
              error={errors.statutoryDetails?.planningAuthority?.message}
            />
          </FormField>
        </div>

        <FormField
          label="Development Approvals & Permits"
          error={errors.statutoryDetails?.developmentApprovals?.message}
        >
          <Textarea
            {...register('statutoryDetails.developmentApprovals')}
            placeholder="List any development approvals, building permits, or planning permits affecting the property..."
            rows={3}
            error={errors.statutoryDetails?.developmentApprovals?.message}
          />
        </FormField>
      </div>

      {/* Compliance Status */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Compliance Status
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            label="Building Code Compliance"
            error={errors.statutoryDetails?.buildingCodeCompliance?.message}
          >
            <Select
              {...register('statutoryDetails.buildingCodeCompliance')}
              options={complianceStatusOptions}
              error={errors.statutoryDetails?.buildingCodeCompliance?.message}
            />
          </FormField>

          <FormField
            label="Fire Safety Compliance"
            error={errors.statutoryDetails?.fireSafetyCompliance?.message}
          >
            <Select
              {...register('statutoryDetails.fireSafetyCompliance')}
              options={complianceStatusOptions}
              error={errors.statutoryDetails?.fireSafetyCompliance?.message}
            />
          </FormField>

          <FormField
            label="Disability Access Compliance"
            error={errors.statutoryDetails?.disabilityAccessCompliance?.message}
          >
            <Select
              {...register('statutoryDetails.disabilityAccessCompliance')}
              options={complianceStatusOptions}
              error={errors.statutoryDetails?.disabilityAccessCompliance?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Encumbrances & Restrictions */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Encumbrances & Restrictions
        </h4>
        
        <FormField
          label="Easements"
          error={errors.statutoryDetails?.easements?.message}
        >
          <Textarea
            {...register('statutoryDetails.easements')}
            placeholder="Describe any easements affecting the property (drainage, access, utility, etc.)..."
            rows={3}
            error={errors.statutoryDetails?.easements?.message}
          />
        </FormField>

        <FormField
          label="Covenant Restrictions"
          error={errors.statutoryDetails?.covenantRestrictions?.message}
        >
          <Textarea
            {...register('statutoryDetails.covenantRestrictions')}
            placeholder="List any covenant restrictions, building restrictions, or use limitations..."
            rows={3}
            error={errors.statutoryDetails?.covenantRestrictions?.message}
          />
        </FormField>

        <FormField
          label="Heritage Listings & Environmental Overlays"
          error={errors.statutoryDetails?.heritageEnvironmental?.message}
        >
          <Textarea
            {...register('statutoryDetails.heritageEnvironmental')}
            placeholder="Note any heritage listings, environmental overlays, or conservation areas affecting the property..."
            rows={3}
            error={errors.statutoryDetails?.heritageEnvironmental?.message}
          />
        </FormField>

        <FormField
          label="Body Corporate Details"
          error={errors.statutoryDetails?.bodyCorporateDetails?.message}
        >
          <Textarea
            {...register('statutoryDetails.bodyCorporateDetails')}
            placeholder="For strata/community title properties: body corporate name, fees, special levies, restrictions..."
            rows={3}
            error={errors.statutoryDetails?.bodyCorporateDetails?.message}
          />
        </FormField>
      </div>
    </div>
  );
}; 