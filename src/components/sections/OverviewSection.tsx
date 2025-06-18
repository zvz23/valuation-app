import React from 'react';
import { FormField, Input, Select, Checkbox } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';

// Employee options - these should be replaced with actual employee data from API
const employeeOptions = [
  { value: 'john_smith', label: 'John Smith' },
  { value: 'jane_doe', label: 'Jane Doe' },
  { value: 'michael_brown', label: 'Michael Brown' },
  { value: 'sarah_wilson', label: 'Sarah Wilson' },
  { value: 'david_johnson', label: 'David Johnson' }
];

const reportTypeOptions = [
  { value: 'property_valuation_report', label: 'Property Valuation Report' },
  { value: 'insurance_valuation_report', label: 'Insurance Valuation Report' },
  { value: 'market_assessment_report', label: 'Market Assessment Report' },
  { value: 'rental_assessment_report', label: 'Rental Assessment Report' }
];

const valuationTypeOptions = [
  { value: 'market_assessment', label: 'Market Assessment' },
  { value: 'capital_gains_tax', label: 'Capital Gains Tax' },
  { value: 'stamp_duty', label: 'Stamp Duty' },
  { value: 'transfer_duty', label: 'Transfer Duty' },
  { value: 'retrospective_capital_gain_tax', label: 'Retrospective Capital Gain Tax' },
  { value: 'pre_purchase', label: 'Pre-Purchase' },
  { value: 'pre_sale', label: 'Pre-Sale' },
  { value: 'rent_review', label: 'Rent Review' }
];

const surveyTypeOptions = [
  { value: 'inspection', label: 'Inspection' },
  { value: 'self_assessed', label: 'Self Assessed' },
  { value: 'no_survey', label: 'No Survey' },
  { value: 'desktop_valuation', label: 'Desktop Valuation' }
];

const australianStateOptions = [
  { value: 'NSW', label: 'New South Wales' },
  { value: 'VIC', label: 'Victoria' },
  { value: 'QLD', label: 'Queensland' },
  { value: 'SA', label: 'South Australia' },
  { value: 'WA', label: 'Western Australia' },
  { value: 'TAS', label: 'Tasmania' },
  { value: 'NT', label: 'Northern Territory' },
  { value: 'ACT', label: 'Australian Capital Territory' }
];

const yesNoOptions = [
  { value: 'yes', label: 'Yes' },
  { value: 'no', label: 'No' }
];

export const OverviewSection: React.FC<SectionProps> = ({
  register,
  errors
}) => {
  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Job Number"
          required
          error={errors.overview?.jobNumber?.message}
        >
          <Input
            type="number"
            {...register('overview.jobNumber', {
              required: 'Job number is required'
            })}
            placeholder="Enter job number"
            error={errors.overview?.jobNumber?.message}
          />
        </FormField>

        <FormField
          label="Closed By"
          error={errors.overview?.closedBy?.message}
        >
          <Select
            {...register('overview.closedBy')}
            options={employeeOptions}
            error={errors.overview?.closedBy?.message}
          />
        </FormField>

        <FormField
          label="Property Valuer"
          error={errors.overview?.propertyValuer?.message}
        >
          <Select
            {...register('overview.propertyValuer')}
            options={employeeOptions}
            error={errors.overview?.propertyValuer?.message}
          />
        </FormField>

        <FormField
          label="Instructed By"
          error={errors.overview?.instructedBy?.message}
        >
          <Input
            {...register('overview.instructedBy')}
            placeholder="Enter who instructed this valuation"
            error={errors.overview?.instructedBy?.message}
          />
        </FormField>

        <FormField
          label="Report Type"
          required
          error={errors.overview?.reportType?.message}
        >
          <Select
            {...register('overview.reportType', {
              required: 'Report type is required'
            })}
            options={reportTypeOptions}
            error={errors.overview?.reportType?.message}
          />
        </FormField>

        <FormField
          label="Valuation Type"
          required
          error={errors.overview?.valuationType?.message}
        >
          <Select
            {...register('overview.valuationType', {
              required: 'Valuation type is required'
            })}
            options={valuationTypeOptions}
            error={errors.overview?.valuationType?.message}
          />
        </FormField>

        <FormField
          label="Survey Type"
          required
          error={errors.overview?.surveyType?.message}
        >
          <Select
            {...register('overview.surveyType', {
              required: 'Survey type is required'
            })}
            options={surveyTypeOptions}
            error={errors.overview?.surveyType?.message}
          />
        </FormField>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Date of Inspection"
          required
          error={errors.overview?.dateOfInspection?.message}
        >
          <Input
            type="date"
            {...register('overview.dateOfInspection', {
              required: 'Date of inspection is required'
            })}
            error={errors.overview?.dateOfInspection?.message}
          />
        </FormField>

        <FormField
          label="Date of Valuation"
          required
          error={errors.overview?.dateOfValuation?.message}
        >
          <Input
            type="date"
            {...register('overview.dateOfValuation', {
              required: 'Date of valuation is required'
            })}
            error={errors.overview?.dateOfValuation?.message}
          />
        </FormField>
      </div>

      {/* Address Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Address Street"
          required
          error={errors.overview?.addressStreet?.message}
        >
          <Input
            {...register('overview.addressStreet', {
              required: 'Street address is required'
            })}
            placeholder="Enter street address"
            error={errors.overview?.addressStreet?.message}
          />
        </FormField>

        <FormField
          label="Address Suburb"
          required
          error={errors.overview?.addressSuburb?.message}
        >
          <Input
            {...register('overview.addressSuburb', {
              required: 'Suburb is required'
            })}
            placeholder="Enter suburb"
            error={errors.overview?.addressSuburb?.message}
          />
        </FormField>

        <FormField
          label="Address State"
          required
          error={errors.overview?.addressState?.message}
        >
          <Select
            {...register('overview.addressState', {
              required: 'State is required'
            })}
            options={australianStateOptions}
            error={errors.overview?.addressState?.message}
          />
        </FormField>

        <FormField
          label="Address Postcode"
          required
          error={errors.overview?.addressPostcode?.message}
        >
          <Input
            type="number"
            {...register('overview.addressPostcode', {
              required: 'Postcode is required',
              pattern: {
                value: /^\d{4}$/,
                message: 'Postcode must be 4 digits'
              }
            })}
            placeholder="Enter 4-digit postcode"
            error={errors.overview?.addressPostcode?.message}
          />
        </FormField>
      </div>

      {/* Delegation Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Fillout Delegation"
          error={errors.overview?.filloutDelegation?.message}
        >
          <Input
            {...register('overview.filloutDelegation')}
            placeholder="Enter fillout delegation"
            error={errors.overview?.filloutDelegation?.message}
          />
        </FormField>

        <FormField
          label="Fillout By"
          error={errors.overview?.filloutBy?.message}
        >
          <Input
            {...register('overview.filloutBy')}
            placeholder="Enter who filled out"
            error={errors.overview?.filloutBy?.message}
          />
        </FormField>

        <FormField
          label="Market Evidence Delegation"
          error={errors.overview?.marketEvidenceDelegation?.message}
        >
          <Input
            {...register('overview.marketEvidenceDelegation')}
            placeholder="Enter market evidence delegation"
            error={errors.overview?.marketEvidenceDelegation?.message}
          />
        </FormField>

        <FormField
          label="Market Evidence By"
          error={errors.overview?.marketEvidenceBy?.message}
        >
          <Input
            {...register('overview.marketEvidenceBy')}
            placeholder="Enter who provided market evidence"
            error={errors.overview?.marketEvidenceBy?.message}
          />
        </FormField>

        <FormField
          label="Check Delegation"
          error={errors.overview?.checkDelegation?.message}
        >
          <Input
            {...register('overview.checkDelegation')}
            placeholder="Enter check delegation"
            error={errors.overview?.checkDelegation?.message}
          />
        </FormField>

        <FormField
          label="Check By"
          error={errors.overview?.checkBy?.message}
        >
          <Input
            {...register('overview.checkBy')}
            placeholder="Enter who performed check"
            error={errors.overview?.checkBy?.message}
          />
        </FormField>
      </div>

      {/* Final Fields */}
      <div className="space-y-6">
        <FormField
          label="Purpose of Report"
          error={errors.overview?.purposeOfReport?.message}
        >
          <Input
            {...register('overview.purposeOfReport')}
            placeholder="Enter purpose of report"
            error={errors.overview?.purposeOfReport?.message}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Report Uploaded"
            error={errors.overview?.reportUploaded?.message}
          >
            <Checkbox
              label="Mark as uploaded"
              {...register('overview.reportUploaded')}
            />
          </FormField>

          <FormField
            label="Report Sent"
            error={errors.overview?.reportSent?.message}
          >
            <Checkbox
              label="Mark as sent"
              {...register('overview.reportSent')}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}; 