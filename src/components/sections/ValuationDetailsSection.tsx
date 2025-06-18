import React from 'react';
import { FormField, Input, Select, Checkbox, Textarea } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';
import { DollarSign, Calculator } from 'lucide-react';

const interestValuedOptions = [
  { value: 'fee_simple_vacant_possession', label: 'Fee Simple Vacant Possession' },
  { value: 'fee_simple_subject_to_lease', label: 'Fee Simple Subject to Lease' },
  { value: 'leasehold_interest', label: 'Leasehold Interest' },
  { value: 'life_estate', label: 'Life Estate' },
  { value: 'other', label: 'Other' }
];

const rentalFrequencyOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'annually', label: 'Annually' },
  { value: 'weekly', label: 'Weekly' }
];

const requestedValuationTargetOptions = [
  { value: 'high', label: 'High' },
  { value: 'fair', label: 'Fair' },
  { value: 'low', label: 'Low' }
];

const occupancyStatusOptions = [
  { value: 'owner_occupied', label: 'Owner Occupied' },
  { value: 'tenant_occupied', label: 'Tenant Occupied' },
  { value: 'vacant', label: 'Vacant' },
  { value: 'partially_occupied', label: 'Partially Occupied' }
];

export const ValuationDetailsSection: React.FC<SectionProps> = ({
  register,
  errors,
  setValue
}) => {
  const calculateMarketValue = () => {
    // Get values directly from the form fields
    const landValueField = document.querySelector('input[name="valuationDetails.landValue"]') as HTMLInputElement;
    const improvementsField = document.querySelector('input[name="valuationDetails.improvements"]') as HTMLInputElement;
    
    if (!landValueField || !improvementsField) {
      alert('Could not find input fields. Please try again.');
      return;
    }
    
    const landValue = parseFloat(landValueField.value) || 0;
    const improvements = parseFloat(improvementsField.value) || 0;
    
    if (landValue === 0 && improvements === 0) {
      alert('Please enter values in Land Value and Improvements fields before calculating.');
      return;
    }
    
    const calculatedValue = landValue + improvements;
    
    // Set the calculated value directly
    setValue?.('valuationDetails.marketValue', calculatedValue.toString());
    
    // Also update the field directly to ensure it shows
    const marketValueField = document.querySelector('input[name="valuationDetails.marketValue"]') as HTMLInputElement;
    if (marketValueField) {
      marketValueField.value = calculatedValue.toString();
    }
    
    console.log('Calculated:', { landValue, improvements, result: calculatedValue });
  };

  const syncValuationAmount = () => {
    const marketValueField = document.querySelector('input[name="valuationDetails.marketValue"]') as HTMLInputElement;
    
    if (!marketValueField) {
      alert('Could not find market value field.');
      return;
    }
    
    const marketValue = parseFloat(marketValueField.value) || 0;
    
    if (marketValue === 0) {
      alert('Please enter a market value before syncing.');
      return;
    }
    
    // Set the valuation amount
    setValue?.('valuationDetails.valuationAmount', marketValue.toString());
    
    // Also update the field directly
    const valuationAmountField = document.querySelector('input[name="valuationDetails.valuationAmount"]') as HTMLInputElement;
    if (valuationAmountField) {
      valuationAmountField.value = marketValue.toString();
    }
    
    console.log('Synced valuation amount:', marketValue);
  };

  const generateDirectComparison = () => {
    // This would integrate with an API later
    const autoText = "Auto-generated comparison based on recent sales in the area...";
    setValue?.('valuationDetails.directComparison', autoText);
  };

  return (
    <div className="space-y-8">
      {/* Core Valuation Values */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Core Valuation Values
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Land Value"
            required
            error={errors.valuationDetails?.landValue?.message}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs">AUD</span>
              </div>
              <Input
                type="number"
                step="5000"
                {...register('valuationDetails.landValue', {
                  required: 'Land value is required',
                  min: { value: 0, message: 'Land value must be positive' }
                })}
                placeholder="0"
                className="pl-10 pr-12"
                error={errors.valuationDetails?.landValue?.message}
              />
            </div>
          </FormField>

          <FormField
            label="Improvements"
            required
            error={errors.valuationDetails?.improvements?.message}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs">AUD</span>
              </div>
              <Input
                type="number"
                step="5000"
                {...register('valuationDetails.improvements', {
                  required: 'Improvements value is required',
                  min: { value: 0, message: 'Improvements value must be positive' }
                })}
                placeholder="0"
                className="pl-10 pr-12"
                error={errors.valuationDetails?.improvements?.message}
              />
            </div>
          </FormField>

          <FormField
            label="Market Value"
            required
            error={errors.valuationDetails?.marketValue?.message}
          >
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">AUD</span>
                </div>
                <Input
                  type="number"
                  step="5000"
                  {...register('valuationDetails.marketValue', {
                    required: 'Market value is required',
                    min: { value: 0, message: 'Market value must be positive' }
                  })}
                  placeholder="0"
                  className="pl-10 pr-12"
                  error={errors.valuationDetails?.marketValue?.message}
                />
              </div>
              <button
                type="button"
                onClick={calculateMarketValue}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <Calculator className="w-3 h-3 mr-1" />
                Auto Calculate
              </button>
              <p className="text-xs text-gray-500">
                Auto calculates as Land Value + Improvements, but can be manually adjusted
              </p>
            </div>
          </FormField>

          <FormField
            label="Interest Valued"
            required
            error={errors.valuationDetails?.interestValued?.message}
          >
            <Select
              {...register('valuationDetails.interestValued', {
                required: 'Interest valued is required'
              })}
              options={interestValuedOptions}
              error={errors.valuationDetails?.interestValued?.message}
            />
          </FormField>

          <FormField
            label="Valuation Amount"
            required
            error={errors.valuationDetails?.valuationAmount?.message}
          >
            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                </div>
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-xs">AUD</span>
                </div>
                <Input
                  type="number"
                  step="5000"
                  {...register('valuationDetails.valuationAmount', {
                    required: 'Valuation amount is required',
                    min: { value: 0, message: 'Valuation amount must be positive' }
                  })}
                  placeholder="0"
                  className="pl-10 pr-12"
                  error={errors.valuationDetails?.valuationAmount?.message}
                />
              </div>
              <button
                type="button"
                onClick={syncValuationAmount}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Calculator className="w-3 h-3 mr-1" />
                Sync with Market Value
              </button>
            </div>
          </FormField>

          <FormField
            label="Direct Comparison"
            error={errors.valuationDetails?.directComparison?.message}
          >
            <div className="space-y-2">
              <Input
                {...register('valuationDetails.directComparison')}
                placeholder="Enter direct comparison details"
                error={errors.valuationDetails?.directComparison?.message}
              />
              <button
                type="button"
                onClick={generateDirectComparison}
                className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Calculator className="w-3 h-3 mr-1" />
                Auto Generate
              </button>
            </div>
          </FormField>
        </div>
      </div>

      {/* Display Options */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Display Options
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Checkbox
              {...register('valuationDetails.externalDesktopValuation')}
              label="External/Desktop Valuation"
            />
            <Checkbox
              {...register('valuationDetails.showLandValue')}
              label="Show Land Value"
            />
            <Checkbox
              {...register('valuationDetails.showCurrencyOfValuation')}
              label="Show Currency of Valuation"
            />
            <Checkbox
              {...register('valuationDetails.showImprovements')}
              label="Show Improvements"
            />
          </div>
        </div>
      </div>

      {/* Client & Valuer Values */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Client & Valuer Values
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Client's Expected Value"
            error={errors.valuationDetails?.clientsExpectedValue?.message}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs">AUD</span>
              </div>
              <Input
                type="number"
                step="5000"
                {...register('valuationDetails.clientsExpectedValue', {
                  min: { value: 0, message: 'Value must be positive' }
                })}
                placeholder="0"
                className="pl-10 pr-12"
                error={errors.valuationDetails?.clientsExpectedValue?.message}
              />
            </div>
          </FormField>

          <FormField
            label="Valuer's Guaranteed Value"
            error={errors.valuationDetails?.valuersGuaranteedValue?.message}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs">AUD</span>
              </div>
              <Input
                type="number"
                step="5000"
                {...register('valuationDetails.valuersGuaranteedValue', {
                  min: { value: 0, message: 'Value must be positive' }
                })}
                placeholder="0"
                className="pl-10 pr-12"
                error={errors.valuationDetails?.valuersGuaranteedValue?.message}
              />
            </div>
          </FormField>

          <FormField
            label="Capitalisation Rate (%)"
            error={errors.valuationDetails?.capitalisationRate?.message}
          >
            <Input
              type="number"
              step="0.01"
              {...register('valuationDetails.capitalisationRate', {
                min: { value: 0, message: 'Rate must be positive' },
                max: { value: 100, message: 'Rate cannot exceed 100%' }
              })}
              placeholder="0.00"
              error={errors.valuationDetails?.capitalisationRate?.message}
            />
          </FormField>

          <FormField
            label="Letting Up Expenses"
            error={errors.valuationDetails?.lettingUpExpenses?.message}
          >
            <Input
              {...register('valuationDetails.lettingUpExpenses')}
              placeholder="Enter letting up expenses"
              error={errors.valuationDetails?.lettingUpExpenses?.message}
            />
          </FormField>

          <FormField
            label="Occupancy Status"
            error={errors.valuationDetails?.occupancyStatus?.message}
          >
            <Select
              {...register('valuationDetails.occupancyStatus')}
              options={occupancyStatusOptions}
              error={errors.valuationDetails?.occupancyStatus?.message}
            />
          </FormField>

          <FormField
            label="NLA Value Rate"
            error={errors.valuationDetails?.nlaValueRate?.message}
          >
            <Input
              type="number"
              step="0.01"
              {...register('valuationDetails.nlaValueRate', {
                min: { value: 0, message: 'Rate must be positive' }
              })}
              placeholder="0.00"
              error={errors.valuationDetails?.nlaValueRate?.message}
            />
          </FormField>

          <FormField
            label="Assessed Net Rental"
            error={errors.valuationDetails?.assessedNetRental?.message}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs">AUD</span>
              </div>
              <Input
                type="number"
                step="5000"
                {...register('valuationDetails.assessedNetRental', {
                  min: { value: 0, message: 'Rental must be positive' }
                })}
                placeholder="0"
                className="pl-10 pr-12"
                error={errors.valuationDetails?.assessedNetRental?.message}
              />
            </div>
          </FormField>

          <FormField
            label="Rental Value"
            error={errors.valuationDetails?.rentalValue?.message}
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <DollarSign className="h-4 w-4 text-gray-400" />
              </div>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-400 text-xs">AUD</span>
              </div>
              <Input
                type="number"
                step="5000"
                {...register('valuationDetails.rentalValue', {
                  min: { value: 0, message: 'Rental value must be positive' }
                })}
                placeholder="0"
                className="pl-10 pr-12"
                error={errors.valuationDetails?.rentalValue?.message}
              />
            </div>
          </FormField>

          <FormField
            label="Rental Frequency"
            error={errors.valuationDetails?.rentalFrequency?.message}
          >
            <Select
              {...register('valuationDetails.rentalFrequency')}
              options={rentalFrequencyOptions}
              error={errors.valuationDetails?.rentalFrequency?.message}
            />
          </FormField>

          <FormField
            label="Requested Valuation Target"
            error={errors.valuationDetails?.requestedValuationTarget?.message}
          >
            <Select
              {...register('valuationDetails.requestedValuationTarget')}
              options={requestedValuationTargetOptions}
              error={errors.valuationDetails?.requestedValuationTarget?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Valuation Notes */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Additional Notes
        </h4>
        
        <FormField
          label="Valuation Notes"
          error={errors.valuationDetails?.valuationNotes?.message}
        >
          <Textarea
            {...register('valuationDetails.valuationNotes')}
            placeholder="Enter detailed valuation notes, methodology, assumptions, and any additional comments..."
            rows={4}
            error={errors.valuationDetails?.valuationNotes?.message}
          />
        </FormField>
      </div>
    </div>
  );
}; 