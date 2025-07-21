'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';
import { Navigation } from '@/components/Navigation';
import {
  OverviewSection,
  ValuationDetailsSection,
  PropertyDetailsSection,
  LocationSection,
  RoomFeaturesSection,
  PhotosSection,
  PropertyDescriptorsSection,
  AncillaryImprovementsSection,
  StatutoryDetailsSection,
  SiteDetailsSection,
  PlanningDetailsSection,
  GeneralCommentsSection,
  MarketEvidenceSection,
  AnnexuresSection
} from '@/components/sections';
import { PropertyValuationData } from '@/types/valuation';
import { Save, Send, Edit3, Check, X, ArrowLeft, Eye, Download, ChevronLeft, ChevronRight, CheckCircle, Building } from 'lucide-react';

const sectionComponents = {
  overview: OverviewSection,
  valuationDetails: ValuationDetailsSection,
  propertyDetails: PropertyDetailsSection,
  locationAndNeighborhood: LocationSection,
  roomFeaturesFixtures: RoomFeaturesSection,
  photos: PhotosSection,
  propertyDescriptors: PropertyDescriptorsSection,
  ancillaryImprovements: AncillaryImprovementsSection,
  statutoryDetails: StatutoryDetailsSection,
  siteDetails: SiteDetailsSection,
  planningDetails: PlanningDetailsSection,
  generalComments: GeneralCommentsSection,
  marketEvidence: MarketEvidenceSection,
  annexures: AnnexuresSection
};

const sectionTitles = {
  overview: 'Overview',
  valuationDetails: 'Valuation Details',
  propertyDetails: 'Property Details',
  locationAndNeighborhood: 'Location & Neighborhood',
  roomFeaturesFixtures: 'Room Features & Fixtures',
  photos: 'Photos',
  propertyDescriptors: 'Property Descriptors & Condition',
  ancillaryImprovements: 'Ancillary Improvements',
  statutoryDetails: 'Statutory Details',
  siteDetails: 'Site Details',
  planningDetails: 'Planning Details',
  generalComments: 'General Comments',
  marketEvidence: 'Market Evidence',
  annexures: 'Annexures'
};

const sectionOrder = [
  'overview',
  'valuationDetails',
  'propertyDetails',
  'locationAndNeighborhood',
  'roomFeaturesFixtures',
  'photos',
  'propertyDescriptors',
  'ancillaryImprovements',
  'statutoryDetails',
  'siteDetails',
  'planningDetails',
  'generalComments',
  'marketEvidence',
  'annexures'
];

// Stage Progress Component with Modern Animations
const StageProgress: React.FC<{ 
  currentStage: string; 
  onStageChange: (stage: string) => void;
  isViewMode: boolean;
}> = ({ currentStage, onStageChange, isViewMode }) => {
  const stages = [
    'Automated Data Collection',
    'Fillout',
    'Market Evidence',
    'Check',
    'Revision',
    'Closed'
  ];

  const currentIndex = stages.indexOf(currentStage);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleStageChange = (stage: string) => {
    if (isViewMode) return;
    setIsAnimating(true);
    setTimeout(() => {
      onStageChange(stage);
      setIsAnimating(false);
    }, 150);
  };

  const handlePreviousStage = () => {
    if (currentIndex > 0) {
      handleStageChange(stages[currentIndex - 1]);
    }
  };

  const handleNextStage = () => {
    if (currentIndex < stages.length - 1) {
      handleStageChange(stages[currentIndex + 1]);
    }
  };

  const handleCompleteStage = () => {
    if (currentIndex < stages.length - 1) {
      handleStageChange(stages[currentIndex + 1]);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Stage Controls with Modern Animations */}
      {!isViewMode && (
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <button
            onClick={handlePreviousStage}
            disabled={currentIndex <= 0}
            className={`group inline-flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
              currentIndex > 0
                ? 'text-gray-700 bg-white border-2 border-gray-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                : 'text-gray-400 bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-60'
            }`}
          >
            <ChevronLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
            Previous Stage
          </button>

          <div className="text-center transform transition-all duration-500">
            <div className="text-xl font-bold text-gray-900 mb-1">Current Stage</div>
            <div className={`text-sm px-4 py-2 rounded-full bg-blue-100 text-blue-700 border-2 border-blue-200 transition-all duration-300 ${isAnimating ? 'animate-pulse' : ''}`}>
              {currentStage}
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleCompleteStage}
              disabled={currentIndex >= stages.length - 1}
              className={`group inline-flex items-center px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                currentIndex < stages.length - 1
                  ? 'text-white bg-green-600 border-2 border-green-600 hover:bg-green-700 hover:border-green-700 hover:shadow-lg hover:shadow-green-100 focus:ring-4 focus:ring-green-100'
                  : 'text-gray-400 bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-60'
              }`}
            >
              <CheckCircle className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
              {currentIndex >= stages.length - 1 ? 'Stage Complete' : 'Complete Stage'}
            </button>
            <button
              onClick={handleNextStage}
              disabled={currentIndex >= stages.length - 1}
              className={`group inline-flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                currentIndex < stages.length - 1
                  ? 'text-gray-700 bg-white border-2 border-gray-300 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-100'
                  : 'text-gray-400 bg-gray-100 border-2 border-gray-200 cursor-not-allowed opacity-60'
              }`}
            >
              Next Stage
              <ChevronRight className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Progress Visualization */}
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {/* Animated Progress Line */}
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 z-0 rounded-full"></div>
          <div 
            className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-blue-500 to-blue-600 -translate-y-1/2 z-0 transition-all duration-700 ease-out rounded-full shadow-sm"
            style={{ width: currentIndex >= 0 ? `${(currentIndex / (stages.length - 1)) * 100}%` : '0%' }}
          ></div>

          {/* Enhanced Stage Nodes */}
          {stages.map((stage, index) => {
            const isCompleted = index < currentIndex;
            const isCurrent = index === currentIndex;
            const isUpcoming = index > currentIndex;

            return (
              <div key={stage} className="flex flex-col items-center relative z-10 group">
                <button
                  onClick={() => handleStageChange(stage)}
                  disabled={isViewMode}
                  className={`w-8 h-8 rounded-full border-3 flex items-center justify-center transition-all duration-500 transform hover:scale-110 active:scale-95 relative ${
                    isCompleted
                      ? 'bg-blue-600 border-blue-600 hover:bg-blue-700 hover:border-blue-700 shadow-lg hover:shadow-blue-200'
                      : isCurrent
                      ? 'bg-blue-600 border-blue-600 ring-4 ring-blue-200 ring-opacity-75 animate-pulse-slow shadow-lg'
                      : 'bg-white border-gray-300 hover:border-blue-400 hover:shadow-md'
                  } ${!isViewMode ? 'cursor-pointer' : 'cursor-default'}`}
                  title={!isViewMode ? `Go to ${stage}` : stage}
                >
                  {isCompleted && (
                    <Check className="w-4 h-4 text-white transition-transform duration-300 group-hover:scale-110" />
                  )}
                  {isCurrent && (
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
                  )}
                  {isUpcoming && !isViewMode && (
                    <div className="w-2 h-2 bg-gray-300 rounded-full group-hover:bg-blue-400 transition-colors duration-300"></div>
                  )}
                  
                  {/* Selection Ring */}
                  {isCurrent && (
                    <div className="absolute inset-0 rounded-full border-2 border-blue-400 animate-ping opacity-75"></div>
                  )}
                </button>
                
                <div className={`mt-4 text-xs font-medium text-center max-w-28 leading-tight transition-all duration-300 ${
                  isCurrent ? 'text-blue-600 font-semibold scale-105' : isCompleted ? 'text-gray-700' : 'text-gray-400'
                }`}>
                  {stage}
                </div>
                
                {/* Hover tooltip effect */}
                {!isViewMode && (
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
                    Click to jump to {stage}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Enhanced Stage Info */}
        <div className="mt-8 text-center animate-fade-in">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-sm transition-all duration-300 hover:shadow-md">
            <span className="text-sm font-medium text-gray-700">
              Stage <span className="font-bold text-blue-600">{currentIndex + 1}</span> of {stages.length}
              {currentIndex >= stages.length - 1 && <span className="ml-2 text-green-600 font-semibold">✓ Complete</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ViewOnlyProps {
  data: PropertyValuationData;
  sectionKey: string;
}

// Enhanced Preview Components with Modern Styling
const OverviewPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
    {[
      { label: 'Job Number', value: data?.jobNumber || 'Not set' },
      { label: 'Property Valuer', value: data?.propertyValuer || 'Not assigned' },
      { label: 'Property Address', value: data?.addressStreet && data?.addressSuburb ? `${data.addressStreet}, ${data.addressSuburb}` : 'Not entered' },
      { label: 'Date of Valuation', value: data?.dateOfValuation || 'Not set' }
    ].map((item, index) => (
      <div key={index} className="space-y-3 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{item.label}</div>
        <div className="text-gray-900 font-medium">{item.value}</div>
      </div>
    ))}
  </div>
);

const ValuationDetailsPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
    {[
      { label: 'Market Value', value: data?.marketValue || 'Not calculated', highlight: true },
      { label: 'Land Value', value: data?.landValue || 'Not set' },
      { label: 'Improvements', value: data?.improvements || 'Not set' },
      { label: 'Interest Valued', value: data?.interestValued || 'Not specified' }
    ].map((item, index) => (
      <div key={index} className={`space-y-3 p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
        item.highlight 
          ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300' 
          : 'bg-gradient-to-br from-white to-gray-50 border-gray-100 hover:border-blue-200'
      }`}>
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{item.label}</div>
        <div className={`font-medium ${item.highlight ? 'text-blue-900 text-lg' : 'text-gray-900'}`}>{item.value}</div>
      </div>
    ))}
  </div>
);

const PropertyDetailsPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
    {[
      { label: 'Property Type', value: data?.propertyType || 'Not specified' },
      { label: 'Build Year', value: data?.buildYear || 'Not specified' },
      { label: 'Site Area', value: data?.siteArea || 'Not measured' },
      { label: 'Accommodation', value: data?.accommodation || 'Not specified' }
    ].map((item, index) => (
      <div key={index} className="space-y-3 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{item.label}</div>
        <div className="text-gray-900 font-medium">{item.value}</div>
      </div>
    ))}
  </div>
);

const LocationPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
    <div className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
      <div className="text-sm font-medium text-gray-600">Suburb Description</div>
      <div className="text-gray-900 line-clamp-2">{data?.suburbDescription || 'Not available'}</div>
    </div>
    <div className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
      <div className="text-sm font-medium text-gray-600">Public Transport</div>
      <div className="text-gray-900">
        {data?.publicTransport?.name 
          ? `${data.publicTransport.name} (${data.publicTransport.distance}${data.publicTransport.unit})`
          : 'Not specified'}
      </div>
    </div>
    <div className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
      <div className="text-sm font-medium text-gray-600">Nearest Shop</div>
      <div className="text-gray-900">
        {data?.shop?.name 
          ? `${data.shop.name} (${data.shop.distance}${data.shop.unit})`
          : 'Not specified'}
      </div>
    </div>
    <div className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
      <div className="text-sm font-medium text-gray-600">Gas Available</div>
      <div className="text-gray-900">{data?.includesGas ? 'Yes' : 'No'}</div>
    </div>
  </div>
);

const RoomFeaturesPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
    <div className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
      <div className="text-sm font-medium text-gray-600">Primary Category</div>
      <div className="text-gray-900">{data?.primaryCategory || 'Not categorized'}</div>
    </div>
    <div className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
      <div className="text-sm font-medium text-gray-600">Key Features</div>
      <div className="text-gray-900">
        {data?.features?.length 
          ? data.features.slice(0, 2).join(', ') + (data.features.length > 2 ? '...' : '')
          : 'Not specified'}
      </div>
    </div>
  </div>
);
const PhotosPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
    {['exteriorPhotos', 'interiorPhotos', 'additionalPhotos', 'reportCoverPhoto'].map((type, index) => (
      <div key={index} className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
        <div className="text-sm font-medium text-gray-600">
          {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        </div>
        <div>
          {Array.isArray(data?.[type]) && data[type].length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data[type].map((url: string, i: number) => (
                <a href={url} target="_blank" rel="noopener noreferrer" key={i}>
                  <img src={url} alt={type} width={100} height={100} className="w-24 h-24 object-cover rounded shadow" />
                </a>
              ))}
            </div>
          ) : (
            <span className="text-gray-500">0 photos</span>
          )}
        </div>
      </div>
    ))}
  </div>
);

const PropertyDescriptorsPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
    <div className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
      <div className="text-sm font-medium text-gray-600">Main Building Type</div>
      <div className="text-gray-900">{data?.mainBuildingType || 'Not specified'}</div>
    </div>
    <div className="space-y-2 p-4 bg-white rounded-lg border hover:border-blue-300 transition-all duration-300">
      <div className="text-sm font-medium text-gray-600">Bedrooms/Bathrooms</div>
      <div className="text-gray-900">{data?.numberOfBedrooms || 'N/A'} bed / {data?.numberOfBathrooms || 'N/A'} bath</div>
    </div>
  </div>
);

const AncillaryImprovementsPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => {
  if (!data?.showSection) {
    return (
      <div className="text-center py-8 animate-fade-in">
        <div className="text-gray-500 italic">Section not included in valuation</div>
      </div>
    );
  }
  
  const selectedImprovements: string[] = [];
  if (data?.improvements) {
    Object.entries(data.improvements).forEach(([key, value]: [string, any]) => {
      if (value?.selected) {
        selectedImprovements.push(key.charAt(0).toUpperCase() + key.slice(1));
      }
    });
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
      <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Driveway</div>
        <div className="text-gray-900 font-medium">{data?.driveway || 'Not specified'}</div>
      </div>
      <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Fencing</div>
        <div className="text-gray-900 font-medium">{data?.fencing || 'Not specified'}</div>
      </div>
      <div className="space-y-2 md:col-span-2 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Selected Improvements</div>
        <div className="text-gray-900 font-medium">
          {selectedImprovements.length 
            ? selectedImprovements.slice(0, 4).join(', ') + (selectedImprovements.length > 4 ? '...' : '')
            : 'None selected'}
        </div>
      </div>
    </div>
  );
};

const StatutoryDetailsPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Title Reference</div>
      <div className="text-gray-900 font-medium">{data?.titleReference || 'Not available'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Zoning Classification</div>
      <div className="text-gray-900 font-medium">{data?.zoningClassification || 'Not specified'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Council Rates</div>
      <div className="text-gray-900 font-medium">{data?.councilRates || 'Not available'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Land Value</div>
      <div className="text-green-900 font-medium">{data?.landValue || 'Not assessed'}</div>
    </div>
  </div>
);

const SiteDetailsPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">ERF Size</div>
      <div className="text-gray-900 font-medium">{data?.erfSize || 'Not measured'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Site Topography</div>
      <div className="text-gray-900 font-medium">{data?.siteTopography || 'Not assessed'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Soil Conditions</div>
      <div className="text-gray-900 font-medium">{data?.soilConditions || 'Not assessed'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Available Utilities</div>
      <div className="text-blue-900 font-medium">
        {data?.utilities?.length 
          ? data.utilities.slice(0, 3).join(', ') + (data.utilities.length > 3 ? '...' : '')
          : 'Not specified'}
      </div>
    </div>
  </div>
);

const PlanningDetailsPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Planning Approval</div>
      <div className="text-gray-900 font-medium">{data?.planningApproval || 'Not specified'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Current Use</div>
      <div className="text-gray-900 font-medium">{data?.currentUse || 'Not specified'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Heritage Registration</div>
      <div className="text-gray-900 font-medium">{data?.heritageRegistration || 'Not assessed'}</div>
    </div>
    <div className="space-y-2 p-4 bg-gradient-to-br from-purple-50 to-white rounded-xl border-2 border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Planning Scheme</div>
      <div className="text-purple-900 font-medium">{data?.planningScheme || 'Not specified'}</div>
    </div>
  </div>
);

const GeneralCommentsPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="space-y-6 animate-fade-in">
    <div className="p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Valuation Comments</div>
      <div className="text-gray-900 leading-relaxed line-clamp-3">
        {data?.valuationComments || 'No comments entered'}
      </div>
    </div>
    {data?.marketOverview && (
      <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Market Overview</div>
        <div className="text-blue-900 leading-relaxed line-clamp-2">{data.marketOverview}</div>
      </div>
    )}
    {data?.additionalComments && (
      <div className="p-4 bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-md">
        <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">Additional Comments</div>
        <div className="text-green-900 leading-relaxed line-clamp-2">{data.additionalComments}</div>
      </div>
    )}
  </div>
);

const MarketEvidencePreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="space-y-6 animate-fade-in">
    {/* Sales Evidence Summary */}
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-xl border-2 border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md p-5">
      <h4 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
        <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
        Sales Evidence
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Market Trends</div>
          <div className="text-blue-900 line-clamp-2">
            {data?.salesEvidence?.marketTrends || 'Not assessed'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Average Days on Market</div>
          <div className="text-blue-900 font-semibold">
            {data?.salesEvidence?.averageDaysOnMarket || 'Not available'}
          </div>
        </div>
      </div>
    </div>
    
    {/* Rental Evidence Summary */}
    <div className="bg-gradient-to-br from-green-50 to-white rounded-xl border-2 border-green-100 hover:border-green-200 transition-all duration-300 hover:shadow-md p-5">
      <h4 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
        Rental Evidence
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Rental Trends</div>
          <div className="text-green-900 line-clamp-2">
            {data?.rentalEvidence?.rentalTrends || 'Not assessed'}
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-600">Rental Yield</div>
          <div className="text-green-900 font-semibold">
            {data?.rentalEvidence?.rentalYield || 'Not calculated'}
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AnnexuresPreview: React.FC<{ data: any; sectionKey?: string }> = ({ data }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
    <div className="space-y-3 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md text-center">
      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Title Deed</div>
      <div className="text-lg font-bold text-blue-600">
        {data?.titleDeed?.length || 0}
      </div>
      <div className="text-xs text-gray-500">document(s)</div>
    </div>
    
    <div className="space-y-3 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md text-center">
      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Building Plans</div>
      <div className="text-lg font-bold text-green-600">
        {data?.buildingPlans?.length || 0}
      </div>
      <div className="text-xs text-gray-500">document(s)</div>
    </div>
    
    <div className="space-y-3 p-4 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300 hover:shadow-md text-center">
      <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
        </svg>
      </div>
      <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Additional Documents</div>
      <div className="text-lg font-bold text-purple-600">
        {data?.additionalDocuments?.length || 0}
      </div>
      <div className="text-xs text-gray-500">document(s)</div>
    </div>
  </div>
);

// Simplified fallback for remaining previews
const DefaultPreview: React.FC<{ data: any; sectionKey: string }> = ({ sectionKey }) => (
  <div className="text-center py-8 animate-fade-in">
    <div className="text-gray-500 italic">Preview available for {sectionKey}</div>
  </div>
);

const previewComponents = {
  overview: OverviewPreview,
  valuationDetails: ValuationDetailsPreview,
  propertyDetails: PropertyDetailsPreview,
  locationAndNeighborhood: LocationPreview,
  roomFeaturesFixtures: RoomFeaturesPreview,
  photos: PhotosPreview,
  propertyDescriptors: PropertyDescriptorsPreview,
  ancillaryImprovements: AncillaryImprovementsPreview,
  statutoryDetails: StatutoryDetailsPreview,
  siteDetails: SiteDetailsPreview,
  planningDetails: PlanningDetailsPreview,
  generalComments: GeneralCommentsPreview,
  marketEvidence: MarketEvidencePreview,
  annexures: AnnexuresPreview
};

// Enhanced ViewOnlySection with Modern Styling
const ViewOnlySection: React.FC<ViewOnlyProps> = ({ data, sectionKey }) => {
  const sectionData = data[sectionKey as keyof PropertyValuationData] || {};
  const PreviewComponent = previewComponents[sectionKey as keyof typeof previewComponents];
  
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border-2 border-gray-100 hover:border-blue-200 transition-all duration-300">
      <PreviewComponent data={sectionData} sectionKey={sectionKey} />
    </div>
  );
};

export default function PropertyValuationForm() {
  const params = useParams();
  const searchParams = useSearchParams();
  const propertyId = params.id as string;
  const isViewMode = searchParams.get('mode') === 'view';

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [editingSections, setEditingSections] = useState<Set<string>>(new Set());
  const [completedSections, setCompletedSections] = useState<Set<string>>(new Set());
  const [sectionsWithErrors] = useState<Set<string>>(new Set());
  
  // Load initial stage from URL params or localStorage, default to first stage
  const [currentStage, setCurrentStage] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`property-${propertyId}-stage`) || 'Automated Data Collection';
    }
    return 'Automated Data Collection';
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Save stage changes to localStorage
  useEffect(() => {
    if (mounted && propertyId) {
      localStorage.setItem(`property-${propertyId}-stage`, currentStage);
    }
  }, [currentStage, propertyId, mounted]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    trigger,
    setValue,
    reset
  } = useForm<PropertyValuationData>({
    mode: 'onChange',
    defaultValues: {
      overview: {},
      valuationDetails: {},
      propertyDetails: {},
      locationAndNeighborhood: {},
      roomFeaturesFixtures: {},
      photos: {},
      propertyDescriptors: {},
      ancillaryImprovements: {},
      statutoryDetails: {},
      siteDetails: {},
      planningDetails: {},
      generalComments: {},
      marketEvidence: {},
      annexures: {}
    }
  });

  const watchedData = watch();

  useEffect(() => {
    setMounted(true);
    async function fetchData() {
      setLoading(true);
      try {
        const res = await axios.get(`/api/property/${propertyId}`);
        if (res.data) {
          reset(res.data);
        }
      } catch (e) {
        // If not found, keep defaults
      }
      setLoading(false);
    }
    if (propertyId) fetchData();
  }, [propertyId, reset]);

  useEffect(() => {
    if (mounted && propertyId) {
      localStorage.setItem(`property-${propertyId}-stage`, currentStage);
    }
  }, [currentStage, propertyId, mounted]);



  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (mounted) {
      const element = document.getElementById(`section-${sectionId}`);
      if (element) {
        const headerHeight = 180;
        const elementTop = element.offsetTop - headerHeight;
        window.scrollTo({
          top: elementTop,
          behavior: 'smooth'
        });
      }
    }
  };

  const toggleEditMode = (sectionId: string) => {
    if (isViewMode) return;
    const newEditingSections = new Set(editingSections);
    if (newEditingSections.has(sectionId)) {
      newEditingSections.delete(sectionId);
    } else {
      newEditingSections.add(sectionId);
    }
    setEditingSections(newEditingSections);
  };

  const saveSection = async (sectionId: string) => {
  const isValid = await trigger(sectionId as keyof PropertyValuationData);
  if (!isValid) return;

  const newEditingSections = new Set(editingSections);
  newEditingSections.delete(sectionId);
  setEditingSections(newEditingSections);

  const newCompleted = new Set(completedSections);
  newCompleted.add(sectionId);
  setCompletedSections(newCompleted);

  try {
    if (sectionId === 'photos') {

      const formData = new FormData();
      const photos = watchedData.photos;
      for (const key of ['exteriorPhotos', 'interiorPhotos', 'additionalPhotos', 'reportCoverPhoto'] as const) {
        const files = photos[key];
        if (files && files.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append(key, files[i]);
          }
        }
      }
      // Add propertyId if needed
      // formData.append('propertyId', propertyId);

      await axios.put(`/api/property/${propertyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await axios.put(`/api/property/${propertyId}`, {
        [sectionId]: watchedData[sectionId as keyof PropertyValuationData]
      });
    }
  } catch (e) {
    alert('Failed to save section to database.');
  }
};

   const cancelEdit = (sectionId: string) => {
    const newEditingSections = new Set(editingSections);
    newEditingSections.delete(sectionId);
    setEditingSections(newEditingSections);
  };


  const onSave = async (data: PropertyValuationData) => {
  try {
    if (
      data.photos &&
      (data.photos.exteriorPhotos?.length ||
        data.photos.interiorPhotos?.length ||
        data.photos.additionalPhotos?.length)
    ) {
      const formData = new FormData();
      (['exteriorPhotos', 'interiorPhotos', 'additionalPhotos', 'reportCoverPhoto'] as const).forEach((key) => {
        const files = data.photos[key];
        if (files && files.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append(key, files[i]);
          }
        }
      });
      const { photos, ...rest } = data;
      formData.append('data', JSON.stringify(rest));
      await axios.put(`/api/property/${propertyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await axios.put(`/api/property/${propertyId}`, data);
    }
    alert('Data saved successfully!');
  } catch (e) {
    alert('Failed to save data to database.');
  }
};

  const onSubmit = async (data: PropertyValuationData) => {
  if (!propertyId) {
    alert('No property ID found. Please create or select a property first.');
    return;
  }
  try {
    if (
      data.photos &&
      (
        data.photos.exteriorPhotos?.length ||
        data.photos.interiorPhotos?.length ||
        data.photos.additionalPhotos?.length ||
        data.photos.reportCoverPhoto?.length
      )
    ) {
      
      const formData = new FormData();
      (['exteriorPhotos', 'interiorPhotos', 'additionalPhotos', 'reportCoverPhoto'] as const).forEach((key) => {
        const files = data.photos[key];
        if (files && files.length) {
          for (let i = 0; i < files.length; i++) {
            formData.append(key, files[i]);
          }
        }
      });
      const { photos, ...rest } = data;
      formData.append('data', JSON.stringify(rest));
      await axios.put(`/api/property/${propertyId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    } else {
      await axios.put(`/api/property/${propertyId}`, data);
    }
    alert('Valuation report submitted successfully!');
  } catch (e) {
    alert('Failed to submit data to database.');
  }
};

  const handlePreview = async () => {
  try {
    const res = await fetch(`/api/property/${propertyId}/report`);
    const data = await res.json();

    if (data?.pdfUrl) {
      window.open(data.pdfUrl, '_blank'); // Preview PDF in new tab
    } else {
      alert('PDF preview not available.');
    }
  } catch (err) {
    console.error('Error previewing report:', err);
    alert('Something went wrong loading the PDF preview.');
  }
};


  const handleGenerateReport = async () => {
  try {
    const res = await fetch(`/api/property/${propertyId}/report`);
    const data = await res.json();

    if (data?.reportUrl) {
      window.open(data.reportUrl, '_blank');
    }

    if (data?.download && data?.filename) {
      const blob = new Blob(
        [Uint8Array.from(atob(data.download), c => c.charCodeAt(0))],
        { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } else {
      alert('Report generation failed.');
    }
  } catch (err) {
    console.error('Error generating report:', err);
    alert('Something went wrong generating the report.');
  }
};





  const handleStageChange = (newStage: string) => {
    setCurrentStage(newStage);
    alert(`Stage updated to: ${newStage}`);
  };

  const goBackToProperties = () => {
    window.location.href = '/properties';
  };

  const handleGoHome = () => {
    window.location.href = '/properties';
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-blue-100">
      {/* Background Glow Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <Navigation
        currentSection={activeSection}
        onSectionChange={scrollToSection}
        completedSections={completedSections}
        sectionsWithErrors={sectionsWithErrors}
      />

      <div className="ml-80">
        {/* Enhanced Header */}
        <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-xl px-6 py-4 sticky top-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              {/* Val AI Logo and Title */}
              <div className="flex items-center space-x-4">
                <div className="relative group cursor-pointer" onClick={handleGoHome}>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl flex items-center justify-center shadow-2xl transform transition-transform duration-300 group-hover:scale-110">
                    <Building className="w-6 h-6 text-white drop-shadow-lg" />
                  </div>
                </div>
                <div className="cursor-pointer" onClick={handleGoHome}>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 bg-clip-text text-transparent drop-shadow-lg hover:from-blue-500 hover:via-blue-600 hover:to-blue-700 transition-all duration-300">
                    Val AI
                  </h1>
                  <p className="text-gray-600 text-sm font-medium">Alliance Australia Property</p>
                </div>
              </div>
              
              {/* Breadcrumb */}
              <div className="flex items-center space-x-3 animate-fade-in">
                <button
                  onClick={goBackToProperties}
                  className="group flex items-center text-gray-600 hover:text-blue-600 transition-all duration-300 px-3 py-2 rounded-lg hover:bg-blue-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:-translate-x-1" />
                  Back to Properties
                </button>
                <div className="border-l-2 border-gray-300 pl-4">
                  <h2 className="text-xl font-bold text-gray-900 bg-gradient-to-r from-gray-900 to-blue-900 bg-clip-text text-transparent">
                    Property Valuation Report
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Property ID: <span className="font-medium text-blue-600">{propertyId}</span> 
                    {isViewMode && <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">(View Only)</span>}
                  </p>
                </div>
              </div>
            </div>
           
            {/* Action Buttons */}
            <div className="flex space-x-3 animate-fade-in">
              <button
                onClick={handlePreview}
                className="group inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
              >
                <Eye className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Preview
              </button>
              <button
                onClick={handleGenerateReport}
                className="group inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white text-sm font-medium rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-blue-200"
              >
                <Download className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                Generate Report
              </button>
              {!isViewMode && (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit(onSave)}
                    className="group inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
                  >
                    <Save className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    Save Draft
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit(onSubmit)}
                    className="group inline-flex items-center px-4 py-2 border-2 border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-green-200"
                  >
                    <Send className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                    Submit Report
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Enhanced Stage Progress */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 px-6 py-8">
          <StageProgress 
            currentStage={currentStage} 
            onStageChange={handleStageChange}
            isViewMode={isViewMode}
          />
        </div>

        {/* Enhanced Main Content */}
        <main className="p-6">
          <div className="max-w-4xl mx-auto">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              {sectionOrder.map((sectionId, index) => {
                const SectionComponent = sectionComponents[sectionId as keyof typeof sectionComponents];
                const isEditing = editingSections.has(sectionId);
                const hasErrors = errors[sectionId as keyof PropertyValuationData];
                
                return (
                  <div
                    key={sectionId}
                    id={`section-${sectionId}`}
                    className={`bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/30 transition-all duration-500 overflow-hidden transform hover:scale-[1.01] animate-slide-up ${
                      hasErrors ? 'border-red-300 shadow-red-100' : 
                      isEditing ? 'border-blue-400 shadow-blue-100 ring-4 ring-blue-100' : 
                      'border-gray-200 hover:border-blue-300 hover:shadow-blue-50'
                    }`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Enhanced Section Header */}
                    <div className={`flex items-center justify-between p-6 border-b-2 transition-all duration-300 ${
                      isEditing ? 'bg-blue-50 border-blue-200' : 'bg-gradient-to-r from-blue-50 to-blue-100 border-gray-200 hover:bg-blue-100'
                    }`}>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                          {sectionTitles[sectionId as keyof typeof sectionTitles]}
                          {isEditing && <div className="ml-3 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>}
                        </h3>
                        {hasErrors && (
                          <p className="text-sm text-red-600 mt-1 animate-fade-in">
                            This section has validation errors
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        {isEditing && !isViewMode ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveSection(sectionId)}
                              className="group inline-flex items-center px-4 py-2 border-2 border-transparent text-sm font-medium rounded-xl text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                            >
                              <Check className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => cancelEdit(sectionId)}
                              className="group inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:border-red-300 hover:text-red-600 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                              <X className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:rotate-90" />
                              Cancel
                            </button>
                          </>
                        ) : (
                          !isViewMode && (
                            <button
                              type="button"
                              onClick={() => toggleEditMode(sectionId)}
                              className="group inline-flex items-center px-4 py-2 border-2 border-gray-300 text-sm font-medium rounded-xl text-gray-700 bg-white hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg"
                            >
                              <Edit3 className="w-4 h-4 mr-2 transition-transform duration-300 group-hover:scale-110" />
                              Edit
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Enhanced Section Content */}
                    <div className={`p-6 transition-all duration-500 ${isEditing ? 'bg-blue-25' : ''}`}>
                      {isEditing ? (
                        <div className="animate-fade-in">
                          <SectionComponent
                            register={register}
                            control={control}
                            errors={errors}
                            data={watchedData}
                            updateData={() => {}}
                            watch={watch}
                            setValue={setValue}
                          />
                        </div>
                      ) : (
                        <ViewOnlySection data={watchedData} sectionKey={sectionId} />
                      )}
                    </div>
                  </div>
                );
              })}
            </form>
          </div>
        </main>
      </div>

      {/* Custom CSS for animations */}
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 2s ease-in-out infinite;
        }
        
        .border-3 {
          border-width: 3px;
        }
      `}</style>
    </div>
  );
} 