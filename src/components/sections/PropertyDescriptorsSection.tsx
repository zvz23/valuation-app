import React, { useState } from 'react';
import { FormField, Input, Select, Textarea } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';

const buildingCategoryOptions = [
  { value: 'house', label: 'House' },
  { value: 'granny_flat', label: 'Granny Flat' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'townhouse', label: 'Townhouse' },
  { value: 'studio', label: 'Studio' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'villa', label: 'Villa' },
  { value: 'house_and_granny_flat', label: 'House & Granny Flat' },
  { value: 'house_and_studio', label: 'House & Studio' }
];

const buildingTypeOptions = [
  { value: 'freestanding_single_storey_house', label: 'Freestanding single storey house dwelling' },
  { value: 'freestanding_two_storey_house', label: 'Freestanding two storey house dwelling' },
  { value: 'freestanding_granny_flat', label: 'Freestanding granny flat dwelling' },
  { value: 'freestanding_single_storey_duplex', label: 'Freestanding single storey duplex dwelling' },
  { value: 'freestanding_two_storey_duplex', label: 'Freestanding two storey duplex dwelling' },
  { value: 'residential_townhouse', label: 'Residential townhouse dwelling' },
  { value: 'residential_studio', label: 'Residential studio dwelling' },
  { value: 'residential_apartment', label: 'Residential apartment dwelling' },
  { value: 'residential_villa', label: 'Residential villa dwelling' },
  { value: 'single_storey_house_with_granny_flat', label: 'Freestanding single storey house dwelling with granny flat' },
  { value: 'two_storey_house_with_granny_flat', label: 'Freestanding two storey house dwelling with granny flat' },
  { value: 'single_storey_house_with_studio', label: 'Freestanding single storey house dwelling with studio' },
  { value: 'office', label: 'Office' },
  { value: 'retail', label: 'Retail' },
  { value: 'warehouse', label: 'Warehouse' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'custom', label: 'Custom (specify below)' }
];

// Mapping of building categories to their corresponding main building types
const categoryToTypeMapping = {
  house: ['freestanding_single_storey_house', 'freestanding_two_storey_house'],
  granny_flat: ['freestanding_granny_flat'],
  duplex: ['freestanding_single_storey_duplex', 'freestanding_two_storey_duplex'],
  townhouse: ['residential_townhouse'],
  studio: ['residential_studio'],
  apartment: ['residential_apartment'],
  villa: ['residential_villa'],
  house_and_granny_flat: ['single_storey_house_with_granny_flat', 'two_storey_house_with_granny_flat'],
  house_and_studio: ['single_storey_house_with_studio']
};

const externalWallOptions = [
  { value: 'brick_veneer', label: 'Brick veneer' },
  { value: 'double_brick', label: 'Double brick' },
  { value: 'concrete_slab', label: 'Concrete slab' },
  { value: 'horizontal_cladding', label: 'Horizontal cladding' },
  { value: 'cavity_brick', label: 'Cavity brick' },
  { value: 'weatherboard', label: 'Weatherboard' },
  { value: 'rendered_brick', label: 'Rendered brick' },
  { value: 'timber_cladding', label: 'Timber cladding' },
  { value: 'bagged_brick', label: 'Bagged brick' },
  { value: 'sandstone', label: 'Sandstone' },
  { value: 'rendered_hebel', label: 'Rendered hebel' },
  { value: 'rendered_masonry', label: 'Rendered masonry' },
  { value: 'custom', label: 'Custom (specify below)' }
];

const internalWallOptions = [
  { value: 'plasterboard', label: 'Plasterboard' },
  { value: 'rendered_brick', label: 'Rendered brick' },
  { value: 'concrete_slab', label: 'Concrete slab' },
  { value: 'gyprock', label: 'Gyprock' },
  { value: 'rendered_face_brick', label: 'Rendered face brick' },
  { value: 'face_brick', label: 'Face brick' },
  { value: 'custom', label: 'Custom (specify below)' }
];

const roofingOptions = [
  { value: 'colorbond_metal', label: 'Colorbond/metal' },
  { value: 'terracotta_tile', label: 'Terracotta tile' },
  { value: 'concrete_slab', label: 'Concrete slab' },
  { value: 'metal_concrete', label: 'Metal/concrete' },
  { value: 'concrete_tile', label: 'Concrete tile' },
  { value: 'galvanised_iron', label: 'Galvanised Iron' },
  { value: 'corrugated_metal', label: 'Corrugated metal' },
  { value: 'corrugated_galvanised', label: 'Corrugated galvanised' },
  { value: 'custom', label: 'Custom (specify below)' }
];

const garageOptions = [
  { value: 'single_garage', label: 'Single garage' },
  { value: 'double_garage', label: 'Double garage' },
  { value: 'car_port', label: 'Car port' },
  { value: 'lock_up_garage', label: 'Lock up garage' },
  { value: '1_secure_car_space', label: '1 Secure car space' },
  { value: '2_secure_car_space', label: '2 Secure car space' },
  { value: '3_secure_car_space', label: '3 Secure car space' },
  { value: '1_secure_car_space_with_storage', label: '1 Secure car space with storage space' },
  { value: '2_secure_car_space_with_storage', label: '2 Secure car space with storage space' },
  { value: '3_secure_car_space_with_storage', label: '3 Secure car space with storage space' },
  { value: 'none', label: 'None' }
];

// Mapping of garage types to their sizes
const garageToSizeMapping = {
  single_garage: '18',
  double_garage: '36',
  car_port: '18',
  lock_up_garage: '18',
  '1_secure_car_space': '12',
  '2_secure_car_space': '24',
  '3_secure_car_space': '36',
  '1_secure_car_space_with_storage': '15',
  '2_secure_car_space_with_storage': '30',
  '3_secure_car_space_with_storage': '45',
  none: '0'
};

// Mapping of garage types to number of car spaces
const garageToCarSpacesMapping = {
  single_garage: '1',
  double_garage: '2',
  car_port: '1',
  lock_up_garage: '1',
  '1_secure_car_space': '1',
  '2_secure_car_space': '2',
  '3_secure_car_space': '3',
  '1_secure_car_space_with_storage': '1',
  '2_secure_car_space_with_storage': '2',
  '3_secure_car_space_with_storage': '3',
  none: '0'
};

const conditionOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'very_good', label: 'Very Good' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
  { value: 'very_poor', label: 'Very Poor' }
];

const lightingOptions = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'adequate', label: 'Adequate' },
  { value: 'poor', label: 'Poor' },
  { value: 'very_poor', label: 'Very Poor' }
];

const airConditioningOptions = [
  { value: 'ducted', label: 'Ducted' },
  { value: 'split_system', label: 'Split System' },
  { value: 'window_wall', label: 'Window/Wall Units' },
  { value: 'evaporative', label: 'Evaporative' },
  { value: 'none', label: 'None' }
];

const fireServicesOptions = [
  { value: 'sprinkler_system', label: 'Sprinkler System' },
  { value: 'fire_alarm', label: 'Fire Alarm' },
  { value: 'smoke_detectors', label: 'Smoke Detectors' },
  { value: 'fire_extinguishers', label: 'Fire Extinguishers' },
  { value: 'emergency_lighting', label: 'Emergency Lighting' },
  { value: 'none', label: 'None' }
];

const liftOptions = [
  { value: 'passenger', label: 'Passenger Lift' },
  { value: 'goods', label: 'Goods Lift' },
  { value: 'both', label: 'Both' },
  { value: 'none', label: 'None' }
];

export const PropertyDescriptorsSection: React.FC<SectionProps> = ({
  register,
  errors,
  watch,
  setValue
}) => {
  const [customExternalWall, setCustomExternalWall] = useState('');
  const externalWallValue = watch?.('propertyDescriptors.externalWalls');
  const buildingTypeValue = watch?.('propertyDescriptors.mainBuildingType');
  const internalWallValue = watch?.('propertyDescriptors.internalWalls');
  const roofingValue = watch?.('propertyDescriptors.roofing');
  
  // Watch the building category to filter main building type options
  const buildingCategoryValue = watch?.('propertyDescriptors.customMainBuildingType');
  
  // Watch the garage type to auto-populate garage size
  const garageTypeValue = watch?.('propertyDescriptors.parkingType');

  // Auto-update garage size when garage type changes
  React.useEffect(() => {
    if (garageTypeValue && garageToSizeMapping[garageTypeValue as keyof typeof garageToSizeMapping]) {
      const size = garageToSizeMapping[garageTypeValue as keyof typeof garageToSizeMapping];
      const carSpaces = garageToCarSpacesMapping[garageTypeValue as keyof typeof garageToCarSpacesMapping];
      
      setValue?.('propertyDescriptors.numberOfCarSpaces', carSpaces);
      setValue?.('propertyDescriptors.customExternalWalls', size); // Using this field for garage size temporarily
    }
  }, [garageTypeValue, setValue]);

  // Get filtered main building type options based on selected category
  const getFilteredBuildingTypeOptions = () => {
    if (!buildingCategoryValue || !categoryToTypeMapping[buildingCategoryValue as keyof typeof categoryToTypeMapping]) {
      return [{ value: '', label: 'Please select a building category first' }];
    }
    
    const allowedTypes = categoryToTypeMapping[buildingCategoryValue as keyof typeof categoryToTypeMapping];
    const filteredOptions = buildingTypeOptions.filter(option => 
      allowedTypes.includes(option.value) || option.value === 'custom'
    );
    
    return filteredOptions;
  };

  // Get garage size based on selected garage type
  const getGarageSize = () => {
    if (!garageTypeValue || !garageToSizeMapping[garageTypeValue as keyof typeof garageToSizeMapping]) {
      return '';
    }
    return garageToSizeMapping[garageTypeValue as keyof typeof garageToSizeMapping];
  };

  return (
    <div className="space-y-8">
      {/* Property Descriptors */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Property Descriptors
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Building Category"
            required
            error={errors.propertyDescriptors?.customMainBuildingType?.message}
          >
            <div className="space-y-2">
              <Select
                {...register('propertyDescriptors.customMainBuildingType', {
                  required: 'Building category is required'
                })}
                options={buildingCategoryOptions}
                error={errors.propertyDescriptors?.customMainBuildingType?.message}
              />
              <p className="text-xs text-gray-500">Select the building category</p>
            </div>
          </FormField>

          <FormField
            label="Main Building Type"
            required
            error={errors.propertyDescriptors?.mainBuildingType?.message}
          >
            <div className="space-y-2">
              <Select
                {...register('propertyDescriptors.mainBuildingType', {
                  required: 'Main building type is required'
                })}
                options={getFilteredBuildingTypeOptions()}
                error={errors.propertyDescriptors?.mainBuildingType?.message}
              />
              {buildingTypeValue === 'custom' && (
                <Input
                  {...register('propertyDescriptors.customMainBuildingType')}
                  placeholder="Specify custom building type"
                  error={errors.propertyDescriptors?.customMainBuildingType?.message}
                />
              )}
              <p className="text-xs text-gray-500">You can type a custom value if it is not on the list</p>
            </div>
          </FormField>

          <FormField
            label="External Walls"
            error={errors.propertyDescriptors?.externalWalls?.message}
          >
            <div className="space-y-2">
              <Select
                {...register('propertyDescriptors.externalWalls')}
                options={externalWallOptions}
                error={errors.propertyDescriptors?.externalWalls?.message}
              />
              {externalWallValue === 'custom' && (
                <Input
                  {...register('propertyDescriptors.customExternalWalls')}
                  placeholder="Specify custom external wall type"
                  error={errors.propertyDescriptors?.customExternalWalls?.message}
                />
              )}
              <p className="text-xs text-gray-500">You can type a custom value if it is not on the list</p>
            </div>
          </FormField>

          <FormField
            label="Internal Walls"
            error={errors.propertyDescriptors?.internalWalls?.message}
          >
            <div className="space-y-2">
              <Select
                {...register('propertyDescriptors.internalWalls')}
                options={internalWallOptions}
                error={errors.propertyDescriptors?.internalWalls?.message}
              />
              {internalWallValue === 'custom' && (
                <Input
                  {...register('propertyDescriptors.customInternalWalls')}
                  placeholder="Specify custom internal wall type"
                  error={errors.propertyDescriptors?.customInternalWalls?.message}
                />
              )}
              <p className="text-xs text-gray-500">You can type a custom value if it is not on the list</p>
            </div>
          </FormField>

          <FormField
            label="Roofing"
            error={errors.propertyDescriptors?.roofing?.message}
          >
            <div className="space-y-2">
              <Select
                {...register('propertyDescriptors.roofing')}
                options={roofingOptions}
                error={errors.propertyDescriptors?.roofing?.message}
              />
              {roofingValue === 'custom' && (
                <Input
                  {...register('propertyDescriptors.customRoofing')}
                  placeholder="Specify custom roofing type"
                  error={errors.propertyDescriptors?.customRoofing?.message}
                />
              )}
              <p className="text-xs text-gray-500">You can type a custom value if it is not on the list</p>
            </div>
          </FormField>

          <FormField
            label="Number of Bedrooms"
            error={errors.propertyDescriptors?.numberOfBedrooms?.message}
          >
            <Input
              type="number"
              min="0"
              max="20"
              {...register('propertyDescriptors.numberOfBedrooms', {
                min: { value: 0, message: 'Cannot be negative' },
                max: { value: 20, message: 'Maximum 20 bedrooms' }
              })}
              placeholder="e.g., 3"
              error={errors.propertyDescriptors?.numberOfBedrooms?.message}
            />
          </FormField>

          <FormField
            label="Number of Bathrooms"
            error={errors.propertyDescriptors?.numberOfBathrooms?.message}
          >
            <Input
              type="number"
              min="0"
              max="10"
              step="0.5"
              {...register('propertyDescriptors.numberOfBathrooms', {
                min: { value: 0, message: 'Cannot be negative' },
                max: { value: 10, message: 'Maximum 10 bathrooms' }
              })}
              placeholder="e.g., 2.5"
              error={errors.propertyDescriptors?.numberOfBathrooms?.message}
            />
          </FormField>

          <FormField
            label="Number of Car Spaces"
            error={errors.propertyDescriptors?.numberOfCarSpaces?.message}
          >
            <Input
              type="number"
              min="0"
              max="20"
              {...register('propertyDescriptors.numberOfCarSpaces', {
                min: { value: 0, message: 'Cannot be negative' },
                max: { value: 20, message: 'Maximum 20 car spaces' }
              })}
              placeholder="e.g., 2"
              error={errors.propertyDescriptors?.numberOfCarSpaces?.message}
            />
          </FormField>

          <FormField
            label="Garage"
            error={errors.propertyDescriptors?.parkingType?.message}
          >
            <Select
              {...register('propertyDescriptors.parkingType')}
              options={garageOptions}
              error={errors.propertyDescriptors?.parkingType?.message}
            />
          </FormField>

          <FormField
            label="Garage Size (m²)"
            error={errors.propertyDescriptors?.customExternalWalls?.message}
          >
            <div className="space-y-2">
              <Input
                type="number"
                min="0"
                step="0.1"
                {...register('propertyDescriptors.customExternalWalls', {
                  min: { value: 0, message: 'Garage size must be positive' }
                })}
                placeholder="Enter garage size in m²"
                error={errors.propertyDescriptors?.customExternalWalls?.message}
              />
              <p className="text-xs text-gray-500">
                Auto-calculated: {getGarageSize()} m² (can be customized)
              </p>
            </div>
          </FormField>
        </div>
      </div>

      {/* Conditions */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Property Conditions
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            label="Internal Condition"
            error={errors.propertyDescriptors?.internalCondition?.message}
          >
            <Select
              {...register('propertyDescriptors.internalCondition')}
              options={conditionOptions}
              error={errors.propertyDescriptors?.internalCondition?.message}
            />
          </FormField>

          <FormField
            label="External Condition"
            error={errors.propertyDescriptors?.externalCondition?.message}
          >
            <Select
              {...register('propertyDescriptors.externalCondition')}
              options={conditionOptions}
              error={errors.propertyDescriptors?.externalCondition?.message}
            />
          </FormField>

          <FormField
            label="Lighting"
            error={errors.propertyDescriptors?.lighting?.message}
          >
            <Select
              {...register('propertyDescriptors.lighting')}
              options={lightingOptions}
              error={errors.propertyDescriptors?.lighting?.message}
            />
          </FormField>

          <FormField
            label="Air Conditioning"
            error={errors.propertyDescriptors?.airConditioning?.message}
          >
            <Select
              {...register('propertyDescriptors.airConditioning')}
              options={airConditioningOptions}
              error={errors.propertyDescriptors?.airConditioning?.message}
            />
          </FormField>

          <FormField
            label="Fire Services"
            error={errors.propertyDescriptors?.fireServices?.message}
          >
            <Select
              {...register('propertyDescriptors.fireServices')}
              options={fireServicesOptions}
              error={errors.propertyDescriptors?.fireServices?.message}
            />
          </FormField>

          <FormField
            label="Lift"
            error={errors.propertyDescriptors?.lift?.message}
          >
            <Select
              {...register('propertyDescriptors.lift')}
              options={liftOptions}
              error={errors.propertyDescriptors?.lift?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Additional Information */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Additional Information
        </h4>
        
        <FormField
          label="General Description"
          error={errors.propertyDescriptors?.generalDescription?.message}
        >
          <Textarea
            {...register('propertyDescriptors.generalDescription')}
            placeholder="Provide a comprehensive description of the property including layout, features, and overall characteristics..."
            rows={4}
            error={errors.propertyDescriptors?.generalDescription?.message}
          />
        </FormField>

        <FormField
          label="Repair Requirements"
          error={errors.propertyDescriptors?.repairRequirements?.message}
        >
          <Textarea
            {...register('propertyDescriptors.repairRequirements')}
            placeholder="List any required repairs, maintenance items, or improvements needed..."
            rows={3}
            error={errors.propertyDescriptors?.repairRequirements?.message}
          />
        </FormField>

        <FormField
          label="Defects"
          error={errors.propertyDescriptors?.defects?.message}
        >
          <Textarea
            {...register('propertyDescriptors.defects')}
            placeholder="Document any identified defects, structural issues, or areas of concern..."
            rows={3}
            error={errors.propertyDescriptors?.defects?.message}
          />
        </FormField>
      </div>
    </div>
  );
}; 