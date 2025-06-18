import React from 'react';
import { FormField, Input, Select, Checkbox } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';

const drivewayOptions = [
  { value: 'concrete', label: 'Concrete' },
  { value: 'paved', label: 'Paved' },
  { value: 'gravel', label: 'Gravel' },
  { value: 'asphalt', label: 'Asphalt' },
  { value: 'brick', label: 'Brick' },
  { value: 'custom', label: 'Custom (specify below)' }
];

const fencingOptions = [
  { value: 'timber', label: 'Timber' },
  { value: 'colorbond', label: 'Colorbond' },
  { value: 'brick', label: 'Brick' },
  { value: 'metal', label: 'Metal' },
  { value: 'custom', label: 'Custom (specify below)' }
];

const materialOptions = [
  { value: 'timber', label: 'Timber' },
  { value: 'concrete', label: 'Concrete' },
  { value: 'brick', label: 'Brick' },
  { value: 'metal', label: 'Metal' },
  { value: 'stone', label: 'Stone' },
  { value: 'steel', label: 'Steel' },
  { value: 'glass', label: 'Glass' },
  { value: 'pvc', label: 'PVC' },
  { value: 'composite', label: 'Composite' },
  { value: 'natural', label: 'Natural' },
  { value: 'synthetic', label: 'Synthetic' },
  { value: 'custom', label: 'Custom (specify below)' }
];

const improvementOptions = [
  { key: 'paths', label: 'Paths' },
  { key: 'swimmingPool', label: 'Swimming Pool' },
  { key: 'retainingWalls', label: 'Retaining Walls' },
  { key: 'verandah', label: 'Verandah' },
  { key: 'pergola', label: 'Pergola' },
  { key: 'solarPanels', label: 'Solar Panels' },
  { key: 'landscaping', label: 'Landscaping' },
  { key: 'lifts', label: 'Lifts' },
  { key: 'gym', label: 'Gym' },
  { key: 'communalGarden', label: 'Communal Garden' },
  { key: 'paving', label: 'Paving' },
  { key: 'tennisCourt', label: 'Tennis Court' },
  { key: 'custom1', label: 'Custom 1 (specify below)' },
  { key: 'custom2', label: 'Custom 2 (specify below)' },
  { key: 'custom3', label: 'Custom 3 (specify below)' }
];

export const AncillaryImprovementsSection: React.FC<SectionProps> = ({
  register,
  errors,
  watch
}) => {
  const showSection = watch?.('ancillaryImprovements.showSection');
  const drivewayValue = watch?.('ancillaryImprovements.driveway');
  const fencingValue = watch?.('ancillaryImprovements.fencing');
  
  // Watch all improvement checkboxes
  const watchedImprovements = improvementOptions.reduce((acc, option) => {
    acc[option.key] = watch?.(`ancillaryImprovements.improvements.${option.key}.selected` as any) as boolean;
    return acc;
  }, {} as Record<string, boolean>);

  // Watch custom improvement materials
  const watchedMaterials = improvementOptions.reduce((acc, option) => {
    acc[option.key] = watch?.(`ancillaryImprovements.improvements.${option.key}.material` as any) as string;
    return acc;
  }, {} as Record<string, string>);

  if (!showSection) {
    return (
      <div className="space-y-6">
        <FormField
          label="Show Ancillary Improvements Section"
          error={errors.ancillaryImprovements?.showSection?.message}
        >
          <Checkbox
            {...register('ancillaryImprovements.showSection')}
            label="Include ancillary improvements in this valuation"
          />
        </FormField>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Show Section Toggle */}
      <FormField
        label="Show Ancillary Improvements Section"
        error={errors.ancillaryImprovements?.showSection?.message}
      >
        <Checkbox
          {...register('ancillaryImprovements.showSection')}
          label="Include ancillary improvements in this valuation"
        />
      </FormField>

      {/* Primary Improvements */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Primary Improvements
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Driveway"
            error={errors.ancillaryImprovements?.driveway?.message}
          >
            <div className="space-y-2">
              <Select
                {...register('ancillaryImprovements.driveway')}
                options={[{ value: '', label: 'None' }, ...drivewayOptions]}
                error={errors.ancillaryImprovements?.driveway?.message}
              />
              {drivewayValue === 'custom' && (
                <Input
                  {...register('ancillaryImprovements.customDriveway')}
                  placeholder="Specify custom driveway material"
                  error={errors.ancillaryImprovements?.customDriveway?.message}
                />
              )}
              <p className="text-xs text-gray-500">You can type a custom value if it is not on the list</p>
            </div>
          </FormField>

          <FormField
            label="Fencing"
            error={errors.ancillaryImprovements?.fencing?.message}
          >
            <div className="space-y-2">
              <Select
                {...register('ancillaryImprovements.fencing')}
                options={[{ value: '', label: 'None' }, ...fencingOptions]}
                error={errors.ancillaryImprovements?.fencing?.message}
              />
              {fencingValue === 'custom' && (
                <Input
                  {...register('ancillaryImprovements.customFencing')}
                  placeholder="Specify custom fencing material"
                  error={errors.ancillaryImprovements?.customFencing?.message}
                />
              )}
              <p className="text-xs text-gray-500">You can type a custom value if it is not on the list</p>
            </div>
          </FormField>
        </div>
      </div>

      {/* Additional Improvements */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Additional Improvements
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {improvementOptions.map((option) => (
            <div key={option.key} className="space-y-3">
              <FormField
                label={option.label}
                error={(errors.ancillaryImprovements?.improvements as any)?.[option.key]?.selected?.message}
              >
                <Checkbox
                  {...register(`ancillaryImprovements.improvements.${option.key}.selected` as any)}
                  label={`Include ${option.label.toLowerCase()}`}
                />
              </FormField>

              {watchedImprovements[option.key] && (
                <FormField
                  label={`${option.label} Material`}
                  error={(errors.ancillaryImprovements?.improvements as any)?.[option.key]?.material?.message}
                >
                  <div className="space-y-2">
                    <Select
                      {...register(`ancillaryImprovements.improvements.${option.key}.material` as any)}
                      options={materialOptions}
                      error={(errors.ancillaryImprovements?.improvements as any)?.[option.key]?.material?.message}
                    />
                    {watchedMaterials[option.key] === 'custom' && (
                      <Input
                        {...register(`ancillaryImprovements.improvements.${option.key}.customMaterial` as any)}
                        placeholder={`Specify custom ${option.label.toLowerCase()} material`}
                        error={(errors.ancillaryImprovements?.improvements as any)?.[option.key]?.customMaterial?.message}
                      />
                    )}
                  </div>
                </FormField>
              )}

              {option.key === 'custom1' && watchedImprovements[option.key] && (
                <FormField
                  label="Custom Improvement Name"
                  error={(errors.ancillaryImprovements?.improvements as any)?.custom1?.customName?.message}
                >
                  <Input
                    {...register('ancillaryImprovements.improvements.custom1.customName' as any)}
                    placeholder="Specify custom improvement type"
                    error={(errors.ancillaryImprovements?.improvements as any)?.custom1?.customName?.message}
                  />
                </FormField>
              )}

              {option.key === 'custom2' && watchedImprovements[option.key] && (
                <FormField
                  label="Custom Improvement Name"
                  error={(errors.ancillaryImprovements?.improvements as any)?.custom2?.customName?.message}
                >
                  <Input
                    {...register('ancillaryImprovements.improvements.custom2.customName' as any)}
                    placeholder="Specify custom improvement type"
                    error={(errors.ancillaryImprovements?.improvements as any)?.custom2?.customName?.message}
                  />
                </FormField>
              )}

              {option.key === 'custom3' && watchedImprovements[option.key] && (
                <FormField
                  label="Custom Improvement Name"
                  error={(errors.ancillaryImprovements?.improvements as any)?.custom3?.customName?.message}
                >
                  <Input
                    {...register('ancillaryImprovements.improvements.custom3.customName' as any)}
                    placeholder="Specify custom improvement type"
                    error={(errors.ancillaryImprovements?.improvements as any)?.custom3?.customName?.message}
                  />
                </FormField>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 