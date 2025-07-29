import React, { useState, useEffect } from 'react';
import { FormField, Input, Select, Checkbox, Textarea } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';

// Room categories and their specific items
const roomData = {
  bedrooms: {
    title: "Bedrooms",
    rooms: ['Bedroom 1', 'Bedroom 2', 'Bedroom 3', 'Bedroom 4', 'Bedroom 5', 'Bedroom 6'],
    pcItems: [],
    extraItems: [],
    flooringOptions: ['Carpet', 'Tile flooring', 'Blinds', 'Plantation shutters', 'Built-in wardrobe', 'Aluminium framed windows', 'Timber framed windows']
  },
  bathrooms: {
    title: "Bathrooms & Ensuites",
    rooms: ['Bathroom', 'Ensuite'],
    pcItems: ['Toilet suite', 'Shower', 'Vanity', 'Exhaust fan', 'Heater lighting'],
    extraItems: ['Bath tub', 'Fitted mirror', 'Aluminium framed windows', 'Timber framed windows'],
    flooringOptions: ['Tile flooring']
  },
  livingAreas: {
    title: "Living Areas",
    rooms: ['Study', 'Living', 'Dining', 'Lounge', 'Rumpus', 'Sunroom'],
    pcItems: [],
    extraItems: ['Blinds', 'Plantation shutters', 'Built-in wardrobe', 'Aluminium framed windows', 'Timber framed windows', 'Kitchen cupboards', 'Overhead cupboard', 'Sliding door'],
    flooringOptions: ['Carpet', 'Tile flooring']
  },
  kitchen: {
    title: "Kitchen",
    rooms: ['Kitchen'],
    pcItems: ['Double bowl sink', 'Single bowl sink', 'Rangehood', 'Cooktop', 'Oven', 'Freestanding cooktop', 'Dishwasher'],
    extraItems: ['Kitchen cupboards', 'Overhead cupboard', 'Timber framed windows', 'Aluminium glazed door'],
    flooringOptions: ['Tile flooring']
  },
  utilityAreas: {
    title: "Utility & Storage Areas",
    rooms: ['Storage area', 'Workshop', 'Laundry'],
    pcItems: ['Stainless steel laundry tub'],
    extraItems: ['Blinds', 'Plantation shutters', 'Sliding door', 'Aluminium framed windows', 'Timber framed windows'],
    flooringOptions: ['Tile flooring', 'Brick flooring']
  },
  outdoorAreas: {
    title: "Outdoor Areas",
    rooms: ['Porch', 'Alfresco', 'Patio', 'Balcony'],
    pcItems: [],
    extraItems: ['Sliding door', 'Aluminium framed windows', 'Timber framed windows'],
    flooringOptions: ['Brick flooring']
  },
  general: {
    title: "General Property Features",
    rooms: ['General'],
    pcItems: ['Room unit air conditioning', 'Split air conditioning', 'Ducted air con', 'Ceiling fans', 'Solar panels', 'Shed', 'Swimming pool', 'Ducted heater'],
    extraItems: ['Wood fireplace', 'Powder room', 'Water system', 'Security system', 'Smoke alarm', 'Aluminium glazed windows', 'Timber framed windows'],
    flooringOptions: []
  }
};

export const RoomFeaturesSection: React.FC<SectionProps> = ({
  register,
  errors,
  watch,
  setValue
}) => {
  // Collapse all sections by default for cleaner look
  const [expandedSections, setExpandedSections] = useState({
    bedrooms: false,
    bathrooms: false,
    livingAreas: false,
    kitchen: false,
    utilityAreas: false,
    outdoorAreas: false,
    general: false
  });

  // State for which rooms exist in the property
  const [selectedRooms, setSelectedRooms] = useState<{[key: string]: string[]}>({});
  const [roomsToInitialize, setRoomsToInitialize] = useState<string[]>([]);
  const [roomsToRemove, setRoomsToRemove] = useState<string[]>([]);

  // State for custom items
  const [customItems, setCustomItems] = useState<{[key: string]: {pcItems: string[], extraItems: string[], flooringOptions: string[]}}>({});
  const [newCustomItem, setNewCustomItem] = useState<{[key: string]: {pcItems: string, extraItems: string, flooringOptions: string}}>({});

  // Effect to initialize rooms
  useEffect(() => {
    if (roomsToInitialize.length > 0 && setValue) {
      roomsToInitialize.forEach(room => {
        setValue(`roomFeaturesFixtures.rooms.${room}` as any, {
          pcItems: [],
          extraItems: [],
          flooringTypes: [],
          pcItemsCondition: '',
          extraItemsCondition: '',
          flooringCondition: '',
          notes: ''
        });
      });
      setRoomsToInitialize([]);
    }
  }, [roomsToInitialize, setValue]);

  // Effect to remove rooms
  useEffect(() => {
    if (roomsToRemove.length > 0 && setValue) {
      roomsToRemove.forEach(room => {
        setValue(`roomFeaturesFixtures.rooms.${room}` as any, undefined);
      });
      setRoomsToRemove([]);
    }
  }, [roomsToRemove, setValue]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const toggleRoom = (categoryKey: string, room: string) => {
    setSelectedRooms(prev => {
      const currentRooms = prev[categoryKey] || [];
      const isSelected = currentRooms.includes(room);
      
      if (isSelected) {
        // Remove room from selected rooms and mark for removal
        const updatedRooms = currentRooms.filter(r => r !== room);
        setRoomsToRemove(current => [...current, room]);
        return {
          ...prev,
          [categoryKey]: updatedRooms
        };
      } else {
        // Add room to selected rooms and mark for initialization
        setRoomsToInitialize(current => [...current, room]);
        return {
          ...prev,
          [categoryKey]: [...currentRooms, room]
        };
      }
    });
  };

  const addCustomItem = (categoryKey: string, itemType: 'pcItems' | 'extraItems' | 'flooringOptions') => {
    const newItem = newCustomItem[categoryKey]?.[itemType]?.trim();
    if (!newItem) return;

    setCustomItems(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [itemType]: [...(prev[categoryKey]?.[itemType] || []), newItem]
      }
    }));

    setNewCustomItem(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [itemType]: ''
      }
    }));
  };

  const removeCustomItem = (categoryKey: string, itemType: 'pcItems' | 'extraItems' | 'flooringOptions', index: number) => {
    setCustomItems(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        [itemType]: prev[categoryKey]?.[itemType]?.filter((_, i) => i !== index) || []
      }
    }));
  };

  const renderCustomInput = (categoryKey: string, itemType: 'pcItems' | 'extraItems' | 'flooringOptions', label: string, roomName?: string) => (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder={`Add custom ${label.toLowerCase()}...`}
          value={newCustomItem[categoryKey]?.[itemType] || ''}
          onChange={(e) => setNewCustomItem(prev => ({
            ...prev,
            [categoryKey]: {
              ...prev[categoryKey],
              [itemType]: e.target.value
            }
          }))}
          className="flex-1 text-sm"
        />
        <button
          type="button"
          onClick={() => addCustomItem(categoryKey, itemType)}
          className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
      
      {/* Display custom items */}
      {customItems[categoryKey]?.[itemType]?.length > 0 && (
        <div className="mt-2 space-y-1">
          {customItems[categoryKey][itemType].map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-blue-50 px-3 py-2 rounded-md">
              <Checkbox
                {...register(roomName 
                  ? `roomFeaturesFixtures.rooms.${roomName}.${itemType === 'extraItems' ? 'extraItems' : itemType === 'flooringOptions' ? 'flooringTypes' : 'pcItems'}` as any
                  : itemType === 'pcItems' ? 'roomFeaturesFixtures.pcItems' : itemType === 'extraItems' ? 'roomFeaturesFixtures.additionalFeatures' : 'roomFeaturesFixtures.flooringTypes'
                )}
                value={item}
                label={item}
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => removeCustomItem(categoryKey, itemType, index)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderRoomSelection = (categoryKey: string, category: any) => (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
      <h6 className="text-sm font-medium text-gray-700 mb-2">Select which {category.title.toLowerCase()} exist in this property:</h6>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {category.rooms.map((room: string) => (
          <Checkbox
            key={room}
            checked={selectedRooms[categoryKey]?.includes(room) || false}
            onChange={() => toggleRoom(categoryKey, room)}
            label={room}
            className="text-sm"
          />
        ))}
      </div>
    </div>
  );

  const renderRoomCategory = (categoryKey: string, category: any) => {
    const existingRooms = selectedRooms[categoryKey] || [];
    const hasSelectedRooms = existingRooms.length > 0;

    return (
      <div key={categoryKey} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => toggleSection(categoryKey as keyof typeof expandedSections)}
        >
          <div>
            <h4 className="text-lg font-semibold text-gray-900">{category.title}</h4>
            <p className="text-sm text-gray-500">
              {hasSelectedRooms ? `Selected: ${existingRooms.join(', ')}` : 'No rooms selected'}
            </p>
          </div>
          {expandedSections[categoryKey as keyof typeof expandedSections] ? 
            <ChevronUp className="w-5 h-5 text-gray-500" /> : 
            <ChevronDown className="w-5 h-5 text-gray-500" />
          }
        </div>
        
        {expandedSections[categoryKey as keyof typeof expandedSections] && (
          <div className="p-6 space-y-6">
            {/* Room Selection */}
            {renderRoomSelection(categoryKey, category)}
            
            {/* Room Features - Only show if rooms are selected */}
            {hasSelectedRooms ? (
              <div className="space-y-6">
                {existingRooms.map((room: string) => (
                  <div key={room} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="text-md font-medium text-gray-800 mb-4">{room}</h5>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* PC Items */}
                      {(category.pcItems.length > 0 || categoryKey === 'general') && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-700 mb-2">PC Items</h6>
                          <div className="space-y-2">
                            {category.pcItems.map((item: string) => (
                              <Checkbox
                                key={`${room}-${item}`}
                                {...register(`roomFeaturesFixtures.rooms.${room}.pcItems` as any)}
                                value={item}
                                label={item}
                              />
                            ))}
                          </div>
                          {renderCustomInput(categoryKey, 'pcItems', 'PC Items', room)}
                        </div>
                      )}

                      {/* Extra Items */}
                      {(category.extraItems.length > 0 || categoryKey === 'bedrooms') && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Extra Items</h6>
                          <div className="space-y-2">
                            {category.extraItems.map((item: string) => (
                              <Checkbox
                                key={`${room}-${item}`}
                                {...register(`roomFeaturesFixtures.rooms.${room}.extraItems` as any)}
                                value={item}
                                label={item}
                              />
                            ))}
                          </div>
                          {renderCustomInput(categoryKey, 'extraItems', 'Extra Items', room)}
                        </div>
                      )}

                      {/* Flooring */}
                      {category.flooringOptions.length > 0 && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-700 mb-2">Flooring</h6>
                          <div className="space-y-2">
                            {category.flooringOptions.map((flooring: string) => (
                              <Checkbox
                                key={`${room}-${flooring}`}
                                {...register(`roomFeaturesFixtures.rooms.${room}.flooringTypes` as any)}
                                value={flooring}
                                label={flooring}
                              />
                            ))}
                          </div>
                          {renderCustomInput(categoryKey, 'flooringOptions', 'Flooring Options', room)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Select rooms above to configure their features and fixtures</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            Room Features & Fixtures
          </h3>
          <p className="text-gray-600">First select which rooms exist, then configure their features and fixtures</p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setExpandedSections(Object.keys(expandedSections).reduce((acc, key) => ({ ...acc, [key]: true }), {} as any))}
            className="px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={() => setExpandedSections(Object.keys(expandedSections).reduce((acc, key) => ({ ...acc, [key]: false }), {} as any))}
            className="px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Room Categories */}
      <div className="space-y-4">
        {Object.entries(roomData).map(([categoryKey, category]) => 
          renderRoomCategory(categoryKey, category)
        )}
      </div>

      {/* Summary Notes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h4>
        
        <div className="space-y-4">
          <FormField
            label="Room Features Summary"
            error={errors.roomFeaturesFixtures?.featuresFixturesNotes?.message}
          >
            <Textarea
              {...register('roomFeaturesFixtures.featuresFixturesNotes')}
              placeholder="Enter any additional notes about room features and fixtures..."
              rows={3}
              error={errors.roomFeaturesFixtures?.featuresFixturesNotes?.message}
            />
          </FormField>

          <FormField
            label="PC Items Notes"
            error={errors.roomFeaturesFixtures?.pcItemsNotes?.message}
          >
            <Textarea
              {...register('roomFeaturesFixtures.pcItemsNotes')}
              placeholder="Enter notes about personal chattels and included items..."
              rows={3}
              error={errors.roomFeaturesFixtures?.pcItemsNotes?.message}
            />
          </FormField>

          <FormField
            label="PC Items Value ($)"
            error={errors.roomFeaturesFixtures?.pcItemsValue?.message}
          >
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('roomFeaturesFixtures.pcItemsValue')}
              placeholder="e.g., 15000.00"
              error={errors.roomFeaturesFixtures?.pcItemsValue?.message}
            />
          </FormField>
        </div>
      </div>
    </div>
  );
}; 