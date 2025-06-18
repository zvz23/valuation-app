import React, { useState } from 'react';
import { SectionProps } from '@/types/valuation';

export const MarketEvidenceSection: React.FC<SectionProps> = ({ 
  data, 
  updateData, 
  register, 
  errors 
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'rentals'>('sales');

  const handleChange = (section: 'salesEvidence' | 'rentalEvidence', field: string, value: string) => {
    updateData({
      marketEvidence: {
        ...data.marketEvidence,
        [section]: {
          ...data.marketEvidence?.[section],
          [field]: value
        }
      }
    });
  };

  const handlePriceRangeChange = (section: 'salesEvidence' | 'rentalEvidence', rangeType: 'priceRange' | 'rentalRange', field: 'low' | 'median' | 'high', value: string) => {
    const currentSection = data.marketEvidence?.[section] || {};
    const currentRange = (currentSection as any)?.[rangeType] || {};
    updateData({
      marketEvidence: {
        ...data.marketEvidence,
        [section]: {
          ...currentSection,
          [rangeType]: {
            ...currentRange,
            [field]: value
          }
        }
      }
    });
  };

  return (
    <div className="p-8 bg-white">
      <h3 className="text-2xl font-bold mb-6 text-gray-900 border-b pb-2">
        Market Evidence
      </h3>

      {/* Tab Navigation */}
      <div className="flex space-x-1 mb-8 bg-gray-100 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'sales'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sales Evidence
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rentals')}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'rentals'
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Rental Evidence
        </button>
      </div>

      {/* Sales Evidence Tab */}
      {activeTab === 'sales' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Market Trends
              </label>
              <textarea
                value={data.marketEvidence?.salesEvidence?.marketTrends || ''}
                onChange={(e) => handleChange('salesEvidence', 'marketTrends', e.target.value)}
                placeholder="Describe current sales market trends, price movements, buyer sentiment..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Average Days on Market
              </label>
              <input
                type="text"
                value={data.marketEvidence?.salesEvidence?.averageDaysOnMarket || ''}
                onChange={(e) => handleChange('salesEvidence', 'averageDaysOnMarket', e.target.value)}
                placeholder="e.g., 30 days"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Sales Volume
              </label>
              <input
                type="text"
                value={data.marketEvidence?.salesEvidence?.salesVolume || ''}
                onChange={(e) => handleChange('salesEvidence', 'salesVolume', e.target.value)}
                placeholder="e.g., 45 sales this quarter"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Market Conditions
              </label>
              <textarea
                value={data.marketEvidence?.salesEvidence?.marketConditions || ''}
                onChange={(e) => handleChange('salesEvidence', 'marketConditions', e.target.value)}
                placeholder="Describe overall market conditions, supply and demand, economic factors..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Price Range</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Low Price</label>
                  <input
                    type="text"
                    value={data.marketEvidence?.salesEvidence?.priceRange?.low || ''}
                    onChange={(e) => handlePriceRangeChange('salesEvidence', 'priceRange', 'low', e.target.value)}
                    placeholder="$"
                    className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Median Price</label>
                  <input
                    type="text"
                    value={data.marketEvidence?.salesEvidence?.priceRange?.median || ''}
                    onChange={(e) => handlePriceRangeChange('salesEvidence', 'priceRange', 'median', e.target.value)}
                    placeholder="$"
                    className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">High Price</label>
                  <input
                    type="text"
                    value={data.marketEvidence?.salesEvidence?.priceRange?.high || ''}
                    onChange={(e) => handlePriceRangeChange('salesEvidence', 'priceRange', 'high', e.target.value)}
                    placeholder="$"
                    className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rental Evidence Tab */}
      {activeTab === 'rentals' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Rental Trends
              </label>
              <textarea
                value={data.marketEvidence?.rentalEvidence?.rentalTrends || ''}
                onChange={(e) => handleChange('rentalEvidence', 'rentalTrends', e.target.value)}
                placeholder="Describe rental market trends, demand levels, tenant preferences..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Average Vacancy Period
              </label>
              <input
                type="text"
                value={data.marketEvidence?.rentalEvidence?.averageVacancyPeriod || ''}
                onChange={(e) => handleChange('rentalEvidence', 'averageVacancyPeriod', e.target.value)}
                placeholder="e.g., 2 weeks"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Rental Volume
              </label>
              <input
                type="text"
                value={data.marketEvidence?.rentalEvidence?.rentalVolume || ''}
                onChange={(e) => handleChange('rentalEvidence', 'rentalVolume', e.target.value)}
                placeholder="e.g., 25 new leases this month"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Rental Yield
              </label>
              <input
                type="text"
                value={data.marketEvidence?.rentalEvidence?.rentalYield || ''}
                onChange={(e) => handleChange('rentalEvidence', 'rentalYield', e.target.value)}
                placeholder="e.g., 4.5%"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Rental Market Conditions
              </label>
              <textarea
                value={data.marketEvidence?.rentalEvidence?.rentalMarketConditions || ''}
                onChange={(e) => handleChange('rentalEvidence', 'rentalMarketConditions', e.target.value)}
                placeholder="Describe rental market conditions, tenant demand, vacancy rates..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical min-h-[120px] text-gray-900"
              />
            </div>

            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">Rental Range</h4>
              
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Low Rental</label>
                  <input
                    type="text"
                    value={data.marketEvidence?.rentalEvidence?.rentalRange?.low || ''}
                    onChange={(e) => handlePriceRangeChange('rentalEvidence', 'rentalRange', 'low', e.target.value)}
                    placeholder="$ per week"
                    className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Median Rental</label>
                  <input
                    type="text"
                    value={data.marketEvidence?.rentalEvidence?.rentalRange?.median || ''}
                    onChange={(e) => handlePriceRangeChange('rentalEvidence', 'rentalRange', 'median', e.target.value)}
                    placeholder="$ per week"
                    className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">High Rental</label>
                  <input
                    type="text"
                    value={data.marketEvidence?.rentalEvidence?.rentalRange?.high || ''}
                    onChange={(e) => handlePriceRangeChange('rentalEvidence', 'rentalRange', 'high', e.target.value)}
                    placeholder="$ per week"
                    className="w-full p-2 border border-gray-300 rounded text-sm text-gray-900"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 