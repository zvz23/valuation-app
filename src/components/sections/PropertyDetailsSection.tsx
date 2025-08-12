import React, { useState } from 'react';
import { FormField, Input, Select } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';
import { Calculator, Download, Home, MapPin, Ruler, FileText, ChevronDown, ChevronUp } from 'lucide-react';

const propertyTypeOptions = [
  { value: 'none', label: 'None' },
  { value: 'house', label: 'House' },
  { value: 'unit', label: 'Unit' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house_granny_flat', label: 'House & Granny Flat' },
  { value: 'dual_key_apartment', label: 'Dual Key Apartment' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'villa', label: 'Villa' },
  { value: 'terrace', label: 'Terrace' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'commercial_office', label: 'Commercial (Office)' },
  { value: 'commercial_retail', label: 'Commercial (Retail)' },
  { value: 'commercial_warehouse', label: 'Commercial (Warehouse)' },
  { value: 'rural', label: 'Rural' },
  { value: 'land', label: 'Land' }
];

const landShapeOptions = [
  { value: 'none', label: 'None' },
  { value: 'rectangular', label: 'Rectangular' },
  { value: 'regular', label: 'Regular' },
  { value: 'irregular', label: 'Irregular' }
];

const landSlopeOptions = [
  { value: 'none', label: 'None' },
  { value: 'sharp', label: 'Sharp' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'flat', label: 'Flat' },
  { value: 'gentle_slope', label: 'Gentle Slope' },
  { value: 'steep_slope', label: 'Steep Slope' },
  { value: 'very_steep', label: 'Very Steep' }
];

export const PropertyDetailsSection: React.FC<SectionProps> = ({
  register,
  errors,
  watch,
  setValue
}) => {
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    areas: true,
    land: true,
    planning: true
  });

  // Watch area fields for auto calculation
  const livingArea = watch?.('propertyDetails.livingArea') || 0;
  const parkingArea = watch?.('propertyDetails.parkingArea') || 0;
  const externalArea = watch?.('propertyDetails.externalArea') || 0;
  const lettableArea = watch?.('propertyDetails.lettableArea') || 0;
  const otherAreas = watch?.('propertyDetails.otherAreas') || 0;

  // Watch zoning field for auto-updating zoning effects
  const zoning = watch?.('propertyDetails.zoning') || '';

  const calculateBuildingArea = () => {
    const total = Number(livingArea) + Number(parkingArea) + Number(externalArea) + Number(lettableArea) + Number(otherAreas);
    setValue?.('propertyDetails.buildingArea', total.toString());
  };

  // Auto-update zoning effects when zoning changes
  React.useEffect(() => {
    if (zoning && zoning.trim() !== '') {
      const zoningEffects = `${zoning} Local Environment Plan (LEP)`;
      setValue?.('propertyDetails.zoningEffects', zoningEffects);
    }
  }, [zoning, setValue]);

  // Set default value for Heritage Issue field (used for Existing Use)
  React.useEffect(() => {
    const currentValue = watch?.('propertyDetails.heritageIssue');
    if (!currentValue || currentValue.trim() === '') {
      setValue?.('propertyDetails.heritageIssue', 'The existing land use is a conforming land use with no adverse effects.');
    }
  }, [setValue, watch]);

  // Manual function to generate zoning effects
  const generateZoningEffects = () => {
    if (zoning && zoning.trim() !== '') {
      const zoningEffects = `${zoning} Local Environment Plan (LEP)`;
      setValue?.('propertyDetails.zoningEffects', zoningEffects);
    } else {
      alert('Please enter a zoning classification first.');
    }
  };

  const fetchFromCoreLogic = (field: string) => {
    // Placeholder for CoreLogic API integration
    console.log(`Fetching ${field} from CoreLogic...`);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Property Details
        </h3>
        <p className="text-gray-600">Configure comprehensive property information with intelligent automation</p>
      </div>

      {/* Basic Property Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('basic')}
        >
          <div className="flex items-center space-x-3">
            <Home className="w-5 h-5 text-gray-500" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Basic Property Information</h4>
              <p className="text-sm text-gray-500">Core property details and specifications</p>
            </div>
          </div>
          {expandedSections.basic ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
        
        {expandedSections.basic && (
          <div className="p-6 space-y-6">
            {/* Single CoreLogic Auto Fetch Button */}
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => fetchFromCoreLogic('all')}
                className="inline-flex items-center px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors shadow-sm"
              >
                <Download className="w-5 h-5 mr-2" />
                Auto Fetch from CoreLogic
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Property Type"
                required
                error={errors.propertyDetails?.propertyType?.message}
              >
                <Select
                  {...register('propertyDetails.propertyType', {
                    required: 'Property type is required'
                  })}
                  options={propertyTypeOptions}
                  error={errors.propertyDetails?.propertyType?.message}
                />
              </FormField>

              <FormField
                label="Build Year"
                required
                error={errors.propertyDetails?.buildYear?.message}
              >
                <Input
                  type="number"
                  min="1800"
                  max="2024"
                  {...register('propertyDetails.buildYear', {
                    required: 'Build year is required',
                    min: { value: 1800, message: 'Year must be after 1800' },
                    max: { value: 2024, message: 'Year cannot be in the future' }
                  })}
                  placeholder="e.g., 1995"
                  error={errors.propertyDetails?.buildYear?.message}
                />
              </FormField>

              <FormField
                label="Site Area (m²)"
                required
                error={errors.propertyDetails?.siteArea?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('propertyDetails.siteArea', {
                    required: 'Site area is required',
                    min: { value: 0, message: 'Area must be positive' }
                  })}
                  placeholder="e.g., 600.5"
                  error={errors.propertyDetails?.siteArea?.message}
                />
              </FormField>

              <FormField
                label="Title Reference"
                required
                error={errors.propertyDetails?.titleReference?.message}
              >
                <Input
                  {...register('propertyDetails.titleReference', {
                    required: 'Title reference is required'
                  })}
                  placeholder="Enter title reference"
                  error={errors.propertyDetails?.titleReference?.message}
                />
              </FormField>

              <FormField
                label="Council Area"
                required
                error={errors.propertyDetails?.councilArea?.message}
              >
                <Input
                  {...register('propertyDetails.councilArea', {
                    required: 'Council area is required'
                  })}
                  placeholder="Enter council area"
                  error={errors.propertyDetails?.councilArea?.message}
                />
              </FormField>

              <FormField
                label="Zoning"
                required
                error={errors.propertyDetails?.zoning?.message}
              >
                <Input
                  {...register('propertyDetails.zoning', {
                    required: 'Zoning is required'
                  })}
                  placeholder="Enter zoning classification"
                  error={errors.propertyDetails?.zoning?.message}
                />
              </FormField>

              <FormField
                label="Accommodation"
                required
                error={errors.propertyDetails?.accommodation?.message}
              >
                <Input
                  {...register('propertyDetails.accommodation', {
                    required: 'Accommodation details are required'
                  })}
                  placeholder="Will be auto-fetched from CoreLogic"
                  error={errors.propertyDetails?.accommodation?.message}
                />
              </FormField>
            </div>
          </div>
        )}
      </div>

      {/* Area Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('areas')}
        >
          <div className="flex items-center space-x-3">
            <Ruler className="w-5 h-5 text-gray-500" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Area Information</h4>
              <p className="text-sm text-gray-500">Detailed measurements and calculations</p>
            </div>
          </div>
          {expandedSections.areas ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
        
        {expandedSections.areas && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Living Area (m²)"
                error={errors.propertyDetails?.livingArea?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('propertyDetails.livingArea', {
                    min: { value: 0, message: 'Area must be positive' }
                  })}
                  placeholder="e.g., 180.0"
                  error={errors.propertyDetails?.livingArea?.message}
                />
              </FormField>

              <FormField
                label="Parking Area (m²)"
                error={errors.propertyDetails?.parkingArea?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('propertyDetails.parkingArea', {
                    min: { value: 0, message: 'Area must be positive' }
                  })}
                  placeholder="e.g., 40.0"
                  error={errors.propertyDetails?.parkingArea?.message}
                />
              </FormField>

              <FormField
                label="External Area (m²)"
                error={errors.propertyDetails?.externalArea?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('propertyDetails.externalArea', {
                    min: { value: 0, message: 'Area must be positive' }
                  })}
                  placeholder="e.g., 20.0"
                  error={errors.propertyDetails?.externalArea?.message}
                />
              </FormField>

              <FormField
                label="Lettable Area (m²)"
                error={errors.propertyDetails?.lettableArea?.message}
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('propertyDetails.lettableArea', {
                    min: { value: 0, message: 'Area must be positive' }
                  })}
                  placeholder="e.g., 200.0"
                  error={errors.propertyDetails?.lettableArea?.message}
                />
              </FormField>

              <FormField
                label="Other Areas (m²)"
                error={errors.propertyDetails?.otherAreas?.message}
                className="md:col-span-2"
              >
                <Input
                  type="number"
                  step="0.01"
                  {...register('propertyDetails.otherAreas', {
                    min: { value: 0, message: 'Area must be positive' }
                  })}
                  placeholder="e.g., 10.0"
                  error={errors.propertyDetails?.otherAreas?.message}
                />
              </FormField>
            </div>

            {/* Building Area Total Calculation */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <FormField
                label="Building Area (m²) - Total"
                error={errors.propertyDetails?.buildingArea?.message}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200">
                    <span className="text-sm text-gray-600">
                      Living + Parking + External + Lettable + Other Areas
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      = {Number(livingArea || 0) + Number(parkingArea || 0) + Number(externalArea || 0) + Number(lettableArea || 0) + Number(otherAreas || 0)} m²
                    </span>
                  </div>
                  
                  <Input
                    type="number"
                    step="0.01"
                    {...register('propertyDetails.buildingArea', {
                      min: { value: 0, message: 'Area must be positive' }
                    })}
                    placeholder="Total building area"
                    error={errors.propertyDetails?.buildingArea?.message}
                  />
                  
                  <button
                    type="button"
                    onClick={calculateBuildingArea}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    <Calculator className="w-4 h-4 mr-2" />
                    Calculate Total
                  </button>
                </div>
              </FormField>
            </div>
          </div>
        )}
      </div>

      {/* Land Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('land')}
        >
          <div className="flex items-center space-x-3">
            <MapPin className="w-5 h-5 text-gray-500" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Land Information</h4>
              <p className="text-sm text-gray-500">Topography and dimensional details</p>
            </div>
          </div>
          {expandedSections.land ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
        
        {expandedSections.land && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Land Shape"
                error={errors.propertyDetails?.landShape?.message}
              >
                <Select
                  {...register('propertyDetails.landShape')}
                  options={landShapeOptions}
                  error={errors.propertyDetails?.landShape?.message}
                />
              </FormField>

              <FormField
                label="Land Slope"
                error={errors.propertyDetails?.landSlope?.message}
              >
                <Select
                  {...register('propertyDetails.landSlope')}
                  options={landSlopeOptions}
                  error={errors.propertyDetails?.landSlope?.message}
                />
              </FormField>

              <FormField
                label="Frontage (m)"
                error={errors.propertyDetails?.frontage?.message}
              >
                <Input
                  type="number"
                  step="0.1"
                  {...register('propertyDetails.frontage', {
                    min: { value: 0, message: 'Frontage must be positive' }
                  })}
                  placeholder="e.g., 20.5"
                  error={errors.propertyDetails?.frontage?.message}
                />
              </FormField>

              <FormField
                label="Depth (m)"
                error={errors.propertyDetails?.depth?.message}
              >
                <Input
                  type="number"
                  step="0.1"
                  {...register('propertyDetails.depth', {
                    min: { value: 0, message: 'Depth must be positive' }
                  })}
                  placeholder="e.g., 30.0"
                  error={errors.propertyDetails?.depth?.message}
                />
              </FormField>
            </div>
          </div>
        )}
      </div>

      {/* Planning & Legal */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection('planning')}
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-500" />
            <div>
              <h4 className="text-lg font-semibold text-gray-900">Planning & Legal Information</h4>
              <p className="text-sm text-gray-500">Regulatory and compliance details</p>
            </div>
          </div>
          {expandedSections.planning ? <ChevronUp className="w-5 h-5 text-gray-500" /> : <ChevronDown className="w-5 h-5 text-gray-500" />}
        </div>
        
        {expandedSections.planning && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Zoning Effects"
                error={errors.propertyDetails?.zoningEffects?.message}
              >
                <div className="space-y-3">
                  <Input
                    {...register('propertyDetails.zoningEffects')}
                    placeholder="Enter zoning effects"
                    error={errors.propertyDetails?.zoningEffects?.message}
                  />
                  <button
                    type="button"
                    onClick={generateZoningEffects}
                    className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-md hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Auto Generate
                  </button>
                </div>
              </FormField>

              <FormField
                label="Permissible Uses"
                error={errors.propertyDetails?.permissibleUses?.message}
              >
                <Input
                  {...register('propertyDetails.permissibleUses')}
                  placeholder="Enter permissible uses"
                  error={errors.propertyDetails?.permissibleUses?.message}
                />
              </FormField>

              <FormField
                label="Existing Use"
                error={errors.propertyDetails?.heritageIssue?.message}
              >
                <Input
                  {...register('propertyDetails.heritageIssue')}
                  placeholder="Enter existing use details"
                  error={errors.propertyDetails?.heritageIssue?.message}
                />
              </FormField>

              <FormField
                label="Heritage Issue"
                error={errors.propertyDetails?.heritageIssue?.message}
              >
                <Input
                  {...register('propertyDetails.permissibleUses')}
                  placeholder="Enter heritage issues or restrictions"
                  error={errors.propertyDetails?.heritageIssue?.message}
                />
              </FormField>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 