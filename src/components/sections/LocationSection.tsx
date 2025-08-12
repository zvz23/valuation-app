import React, { useState, useCallback, useEffect } from 'react';
import { FormField, Input, Select, Checkbox } from '../ui/FormField';
import { SectionProps } from '@/types/valuation';
import { Download, MapPin, AlertCircle, Loader2, CheckCircle, RefreshCw } from 'lucide-react';
import { config } from '@/config/env';
import {
  geocodeAddress,
  searchNearbyPlaces,
  calculateDistance,
  getOptimalUnit,
  detectTransportType,
  detectShopType,
  getCBDTravelTime,
  formatPlaceName,
  isValidCoordinate
} from '@/utils/locationUtils';
import { fetchSuburbDescriptionFromWikipedia } from '@/utils/locationUtils';
const transportTypeOptions = [
  { value: 'bus_stop', label: 'Bus Stop' },
  { value: 'train_station', label: 'Train Station' },
  { value: 'metro_station', label: 'Metro Station' },
  { value: 'tram_stop', label: 'Tram Stop' },
  { value: 'ferry_terminal', label: 'Ferry Terminal' },
  { value: 'airport', label: 'Airport' }
];

const shopTypeOptions = [
  { value: 'shopping_center', label: 'Shopping Center' },
  { value: 'supermarket', label: 'Supermarket' },
  { value: 'convenience_store', label: 'Convenience Store' },
  { value: 'retail_strip', label: 'Retail Strip' },
  { value: 'department_store', label: 'Department Store' },
  { value: 'mall', label: 'Mall' }
];

const distanceUnitOptions = [
  { value: 'm', label: 'meters (m)' },
  { value: 'km', label: 'kilometers (km)' }
];

interface FetchedData {
  transport?: { name: string; type: string; distance: string; unit: string };
  shopping?: { name: string; type: string; distance: string; unit: string };
  primarySchool?: { name: string; distance: string; unit: string };
  highSchool?: { name: string; distance: string; unit: string };
  cbd?: { name: string; distance: string; unit: string; travelTime: string };
  streetConnection?: { street: string; position: string };
  suburbInfo?: { description: string; description2: string };
  gasAvailable?: boolean;
}

export const LocationSection: React.FC<SectionProps> = ({
  register,
  errors,
  watch,
  setValue
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mapLoading, setMapLoading] = useState(false);
  const [fetchedData, setFetchedData] = useState<FetchedData>({});
  const [lastFetchedAddress, setLastFetchedAddress] = useState<string>('');
  const [progress, setProgress] = useState<string>('');

  // Watch address fields from overview section (with fallback to empty string)
  const addressStreet = watch ? watch('overview.addressStreet') : '';
  const addressSuburb = watch ? watch('overview.addressSuburb') : '';
  const addressState = watch ? watch('overview.addressState') : '';
  const addressPostcode = watch ? watch('overview.addressPostcode') : '';

  // Construct full address
  const fullAddress = [addressStreet, addressSuburb, addressState, addressPostcode]
    .filter(Boolean)
    .join(', ');

  // Clear error when address changes
  useEffect(() => {
    if (error && fullAddress && fullAddress !== lastFetchedAddress) {
      setError(null);
    }
  }, [fullAddress, error, lastFetchedAddress]);

  // Test API connectivity function
  const testApiConnectivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setProgress('Testing API connectivity...');
    
    try {
      console.log('🧪 Testing API connectivity...');
      
      // Test basic fetch to our API routes
      const testUrls = [
        '/api/google-maps/geocode?address=Sydney+NSW+Australia',
        '/api/google-maps/places?lat=-33.8688&lng=151.2093&type=train_station'
      ];
      
      for (const url of testUrls) {
        console.log(`🧪 Testing: ${url}`);
        
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          }
        });
        
        console.log(`🧪 Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error(`🧪 Error response:`, errorText);
          throw new Error(`API test failed: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`🧪 Response data:`, data);
      }
      
      setProgress('API connectivity test passed ✅');
      setTimeout(() => setProgress(''), 3000);
      
    } catch (err: any) {
      console.error('🧪 API connectivity test failed:', err);
      setError(`API connectivity test failed: ${err.message}`);
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Enhanced utility detection with multiple search strategies
  const detectUtilities = async (lat: number, lng: number): Promise<{ gasAvailable: boolean }> => {
    try {
      setProgress('Detecting gas availability...');
      
      // Multiple search strategies for gas detection
      const searchPromises = [
        searchNearbyPlaces(lat, lng, 'gas_station'),
        searchNearbyPlaces(lat, lng, 'establishment', 'gas'),
        searchNearbyPlaces(lat, lng, 'establishment', 'natural gas'),
        searchNearbyPlaces(lat, lng, 'establishment', 'energy')
      ];
      
      const results = await Promise.all(searchPromises);
      const allGasRelated = results.flat();
      
      console.log(`Found ${allGasRelated.length} gas-related facilities`);
      
      return { gasAvailable: allGasRelated.length > 0 };
    } catch (err) {
      console.warn('Could not detect gas availability:', err);
      return { gasAvailable: false };
    }
  };

  // Simplified school detection with Google Places API types
  const findSchools = async (lat: number, lng: number, allSchools: any[]) => {
    console.log(`Processing ${allSchools.length} schools for classification`);
    
    // Primary school detection - prioritize Google Places API types
    const primarySchools = allSchools.filter(school => {
      const name = school.name?.toLowerCase() || '';
      const types = school.types || [];
      
      return types.includes('primary_school') ||
             name.includes('primary') ||
             name.includes('elementary') ||
             name.includes('preparatory');
    });

    // High school detection - prioritize Google Places API types  
    const highSchools = allSchools.filter(school => {
      const name = school.name?.toLowerCase() || '';
      const types = school.types || [];
      
      return types.includes('secondary_school') ||
             name.includes('high') ||
             name.includes('secondary') ||
             name.includes('college');
    });

    console.log(`Classified: ${primarySchools.length} primary, ${highSchools.length} high schools`);

    return { primarySchools, highSchools };
  };

  const fetchFromGoogle = useCallback(async () => {
    if (!fullAddress) {
      setError('Please complete the address in the Overview section before fetching location data.');
      return;
    }
    
    if (!config.googleMapsApiKey) {
      setError('Google Maps API key is not configured. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setProgress('Starting location data fetch...');
    setLastFetchedAddress(fullAddress);

    try {
      console.log('🚀 Starting location data fetch for:', fullAddress);
      
      // Step 1: Geocode the address
      setProgress('Geocoding address...');
      const geocodeData = await geocodeAddress(fullAddress);

      if (geocodeData.status !== 'OK' || !geocodeData.results[0]) {
        throw new Error('Address not found. Please check the address spelling and try again.');
      }

      const location = geocodeData.results[0].geometry.location;
      const { lat, lng } = location;
      
      if (!isValidCoordinate(lat, lng)) {
        throw new Error('Invalid coordinates received from geocoding.');
      }
      
      console.log('📍 Address geocoded to:', lat, lng);

      // Step 2: Search for various place types in parallel with enhanced strategies
      setProgress('Searching for nearby places...');
      console.log('🔍 Searching for nearby places...');
      
      const [
        transportResults,
        shoppingResults,
        schoolResults,
        utilities
      ] = await Promise.all([
        // Enhanced transport search with dedicated bus and train searches
        Promise.all([
          // Dedicated bus searches
          searchNearbyPlaces(lat, lng, 'bus_station'),
          searchNearbyPlaces(lat, lng, 'establishment', 'bus stop'),
          searchNearbyPlaces(lat, lng, 'establishment', 'bus station'),
          searchNearbyPlaces(lat, lng, 'establishment', 'bus interchange'),
          searchNearbyPlaces(lat, lng, 'transit_station', 'bus'),
          
          // Dedicated train/rail searches
          searchNearbyPlaces(lat, lng, 'train_station'),
          searchNearbyPlaces(lat, lng, 'subway_station'),
          searchNearbyPlaces(lat, lng, 'light_rail_station'),
          searchNearbyPlaces(lat, lng, 'transit_station'),
          searchNearbyPlaces(lat, lng, 'establishment', 'railway station'),
          searchNearbyPlaces(lat, lng, 'establishment', 'train station'),
          searchNearbyPlaces(lat, lng, 'establishment', 'metro station'),
          searchNearbyPlaces(lat, lng, 'establishment', 'rail'),
        ]).then(results => {
          const flatResults = results.flat().filter(Boolean);
          console.log('🚌 Enhanced transport search found:', flatResults.length, 'raw results');
          
          // Remove duplicates based on place_id
          const uniqueResults = flatResults.filter((place, index, self) =>
            index === self.findIndex(p => p.place_id === place.place_id)
          );
          
          console.log('🚌 After removing duplicates:', uniqueResults.length, 'unique results');
          console.log('🚌 Transport results sample:', uniqueResults.slice(0, 3).map(r => ({ 
            name: r.name, 
            types: r.types, 
            place_id: r.place_id.substring(0, 10) + '...' 
          })));
          
          return uniqueResults;
        }),
        
        // Enhanced shopping search - simplified to only shopping mall and supermarket
        Promise.all([
          searchNearbyPlaces(lat, lng, 'shopping_mall'),
          searchNearbyPlaces(lat, lng, 'supermarket')
        ]).then(results => {
          const flatResults = results.flat().filter(Boolean);
          console.log('🛍️ Shopping search found:', flatResults.length, 'results');
          return flatResults;
        }),
        
        // Enhanced school search - simplified to only primary and secondary schools
        Promise.all([
          searchNearbyPlaces(lat, lng, 'primary_school'),
          searchNearbyPlaces(lat, lng, 'secondary_school')
        ]).then(results => {
          const flatResults = results.flat().filter(Boolean);
          console.log('🏫 School search found:', flatResults.length, 'results');
          return flatResults;
        }),
        
        // Enhanced utilities detection
        detectUtilities(lat, lng)
      ]);

      // Sort all results by distance for accuracy
      const sortByDistance = (places: any[]) => {
        return places
          .filter(place => place.geometry?.location && place.name && place.place_id)
          .map(place => ({
            ...place,
            calculatedDistance: calculateDistance(lat, lng, place.geometry.location.lat, place.geometry.location.lng)
          }))
          .sort((a, b) => a.calculatedDistance - b.calculatedDistance);
      };

      setProgress('Processing and categorizing results...');
      
      const allTransportStations = sortByDistance(transportResults);
      const allShoppingPlaces = sortByDistance(shoppingResults);
      const allSchools = sortByDistance(schoolResults);

      console.log('✅ Search results:', {
        transport: allTransportStations.length,
        shopping: allShoppingPlaces.length,
        schools: allSchools.length
      });

      const newFetchedData: FetchedData = {};

      // Enhanced transport categorization with detailed logging
      setProgress('Categorizing transport options...');
      
      console.log('🔍 Starting transport categorization...');
      console.log('🔍 All transport stations:', allTransportStations.map(s => ({
        name: s.name,
        types: s.types,
        distance: s.calculatedDistance?.toFixed(3) + 'km'
      })));
      
      // Step 1: First identify clear train/rail stations with strong indicators
      const clearTrainStations = allTransportStations.filter(station => {
        const name = station.name?.toLowerCase() || '';
        const types = station.types || [];
        
        // Strong train/rail indicators that take priority
        const isDefinitelyTrain = types.includes('train_station') || 
                                 types.includes('subway_station') || 
                                 types.includes('light_rail_station') ||
                                 name.includes('railway station') ||
                                 name.includes('train station') ||
                                 (name.includes('station') && (name.includes('rail') || name.includes('metro') || name.includes('subway')));
        
        if (isDefinitelyTrain) {
          console.log(`🚆 CLEAR TRAIN STATION: ${name} (${types.join(', ')})`);
        }
        
        return isDefinitelyTrain;
      });

      // Step 2: Then identify clear bus stops, excluding already identified train stations
      const clearBusStops = allTransportStations.filter(station => {
        const name = station.name?.toLowerCase() || '';
        const types = station.types || [];
        const stationId = station.place_id;
        
        // Skip if already identified as train station
        const isAlreadyTrain = clearTrainStations.some(train => train.place_id === stationId);
        if (isAlreadyTrain) {
          console.log(`⏭️ Skipping ${name} - already classified as train station`);
          return false;
        }
        
        // Strong bus stop indicators
        const isDefinitelyBus = types.includes('bus_station') ||
                               name.includes('bus stop') ||
                               name.includes('bus station') ||
                               (name.includes('bus') && !name.includes('train') && !name.includes('rail'));
        
        if (isDefinitelyBus) {
          console.log(`🚌 CLEAR BUS STOP: ${name} (${types.join(', ')})`);
        }
        
        return isDefinitelyBus;
      });

      // Step 3: Handle remaining transit stations (ambiguous cases)
      const remainingStations = allTransportStations.filter(station => {
        const stationId = station.place_id;
        const isAlreadyClassified = clearTrainStations.some(t => t.place_id === stationId) ||
                                   clearBusStops.some(b => b.place_id === stationId);
        return !isAlreadyClassified;
      });

      // For remaining stations, classify based on context and types
      const additionalTrainStations = remainingStations.filter(station => {
        const name = station.name?.toLowerCase() || '';
        const types = station.types || [];
        
        // Prefer train classification for general transit stations
        const isLikelyTrain = types.includes('transit_station') ||
                             (name.includes('station') && !name.includes('bus') && !name.includes('service')) ||
                             name.includes('interchange');
        
        if (isLikelyTrain) {
          console.log(`🚆 LIKELY TRAIN STATION: ${name} (${types.join(', ')})`);
        }
        
        return isLikelyTrain;
      });

      // Combine final results
      const trainMetroStations = [...clearTrainStations, ...additionalTrainStations];
      const busStops = clearBusStops;

      console.log('🚇 Transport categorization results:', {
        totalStations: allTransportStations.length,
        busStops: busStops.length,
        trainMetroStations: trainMetroStations.length,
        busStopNames: busStops.map(s => s.name),
        trainStationNames: trainMetroStations.map(s => s.name)
      });

      // Enhanced train/metro station processing
      if (trainMetroStations.length > 0) {
        const nearest = trainMetroStations[0];
        const { distance: formattedDistance, unit } = getOptimalUnit(nearest.calculatedDistance);
        const transportType = detectTransportType(nearest);
        const displayName = formatPlaceName(nearest);
        
        console.log(`🚆 SETTING TRAIN STATION FIELDS:`);
        console.log(`   - Field: locationAndNeighborhood.publicTransport.name`);
        console.log(`   - Value: ${displayName}`);
        console.log(`   - Distance: ${formattedDistance}${unit}`);
        console.log(`   - Type: ${transportType}`);
        
        setValue?.('locationAndNeighborhood.publicTransport.name', displayName);
        setValue?.('locationAndNeighborhood.publicTransport.type', transportType);
        setValue?.('locationAndNeighborhood.publicTransport.distance', formattedDistance.toString());
        setValue?.('locationAndNeighborhood.publicTransport.unit', unit);
        
        console.log(`✅ COMPLETED: Train station fields set`);
      } else {
        console.log('❌ No train/metro stations found - clearing train fields');
        setValue?.('locationAndNeighborhood.publicTransport.name', '');
        setValue?.('locationAndNeighborhood.publicTransport.type', '');
        setValue?.('locationAndNeighborhood.publicTransport.distance', '');
        setValue?.('locationAndNeighborhood.publicTransport.unit', '');
      }

      // Enhanced bus stop processing
      if (busStops.length > 0) {
        const nearest = busStops[0];
        const { distance: formattedDistance, unit } = getOptimalUnit(nearest.calculatedDistance);
        const displayName = formatPlaceName(nearest);
        
        console.log(`🚌 SETTING BUS STOP FIELDS:`);
        console.log(`   - Field: locationAndNeighborhood.busStop.name`);
        console.log(`   - Value: ${displayName}`);
        console.log(`   - Distance: ${formattedDistance}${unit}`);
        console.log(`   - Type: bus_stop`);
        
        setValue?.('locationAndNeighborhood.busStop.name', displayName);
        setValue?.('locationAndNeighborhood.busStop.type', 'bus_stop');
        setValue?.('locationAndNeighborhood.busStop.distance', formattedDistance.toString());
        setValue?.('locationAndNeighborhood.busStop.unit', unit);
        
        console.log(`✅ COMPLETED: Bus stop fields set`);
      } else {
        console.log('❌ No bus stops found - clearing bus fields');
        setValue?.('locationAndNeighborhood.busStop.name', '');
        setValue?.('locationAndNeighborhood.busStop.type', '');
        setValue?.('locationAndNeighborhood.busStop.distance', '');
        setValue?.('locationAndNeighborhood.busStop.unit', '');
      }

      // Enhanced shopping data processing
      setProgress('Processing shopping facilities...');
      if (allShoppingPlaces.length > 0) {
        const nearest = allShoppingPlaces[0];
        const { distance: formattedDistance, unit } = getOptimalUnit(nearest.calculatedDistance);
        const shopType = detectShopType(nearest);
        const displayName = formatPlaceName(nearest);
        
        newFetchedData.shopping = {
          name: displayName,
          type: shopType,
          distance: formattedDistance.toString(),
          unit: unit
        };

        setValue?.('locationAndNeighborhood.shop.name', displayName);
        setValue?.('locationAndNeighborhood.shop.type', shopType);
        setValue?.('locationAndNeighborhood.shop.distance', formattedDistance.toString());
        setValue?.('locationAndNeighborhood.shop.unit', unit);
        
        console.log(`✅ Set shopping: ${displayName} (${formattedDistance}${unit})`);
      }

      // Enhanced school processing with better categorization
      setProgress('Classifying schools...');
      const { primarySchools, highSchools } = await findSchools(lat, lng, allSchools);
      
      if (primarySchools.length > 0) {
        const nearest = primarySchools[0];
        const { distance: formattedDistance, unit } = getOptimalUnit(nearest.calculatedDistance);
        const displayName = formatPlaceName(nearest);
        
        newFetchedData.primarySchool = {
          name: displayName,
          distance: formattedDistance.toString(),
          unit: unit
        };

        setValue?.('locationAndNeighborhood.primarySchool.name', displayName);
        setValue?.('locationAndNeighborhood.primarySchool.distance', formattedDistance.toString());
        setValue?.('locationAndNeighborhood.primarySchool.unit', unit);
        
        console.log(`✅ Set primary school: ${displayName} (${formattedDistance}${unit})`);
      }
      
      if (highSchools.length > 0) {
        const nearest = highSchools[0];
        const { distance: formattedDistance, unit } = getOptimalUnit(nearest.calculatedDistance);
        const displayName = formatPlaceName(nearest);
        
        newFetchedData.highSchool = {
          name: displayName,
          distance: formattedDistance.toString(),
          unit: unit
        };

        setValue?.('locationAndNeighborhood.highSchool.name', displayName);
        setValue?.('locationAndNeighborhood.highSchool.distance', formattedDistance.toString());
        setValue?.('locationAndNeighborhood.highSchool.unit', unit);
        
        console.log(`✅ Set high school: ${displayName} (${formattedDistance}${unit})`);
      }

      // Enhanced CBD processing with travel time
      setProgress('Calculating CBD distance and travel time...');
      const cbdData = await getCBDTravelTime(lat, lng, addressState || '');
      newFetchedData.cbd = {
        name: cbdData.name,
        distance: cbdData.distance.toString(),
        unit: cbdData.unit,
        travelTime: cbdData.travelTime
      };

      setValue?.('locationAndNeighborhood.cbd.name', cbdData.name);
      setValue?.('locationAndNeighborhood.cbd.distance', cbdData.distance.toString());
      setValue?.('locationAndNeighborhood.cbd.unit', cbdData.unit);
      setValue?.('locationAndNeighborhood.cbd.travelTime', cbdData.travelTime);
      
      console.log(`✅ Set CBD: ${cbdData.name} (${cbdData.distance}${cbdData.unit}, ${cbdData.travelTime})`);

      // Enhanced address component processing
      setProgress('Processing address components...');
      const addressComponents = geocodeData.results[0].address_components;
      const route = addressComponents.find((component: any) => component.types.includes('route'));
      const locality = addressComponents.find((component: any) => 
        component.types.includes('locality') || 
        component.types.includes('sublocality') ||
        component.types.includes('administrative_area_level_2')
      );

      // Enhanced street connection information
      if (route) {
        const streetName = route.long_name;
        newFetchedData.streetConnection = {
          street: streetName,
          position: 'Fronting street access'
        };
        setValue?.('locationAndNeighborhood.connectedStreet.name', streetName);
        setValue?.('locationAndNeighborhood.connectedStreet.position', 'Fronting street access');
        
        console.log(`✅ Set street connection: ${streetName}`);
      }

      // Enhanced suburb information
      if (locality) {
        const suburbName = locality.long_name;
        const stateComponent = addressComponents.find((component: any) =>
        component.types.includes('administrative_area_level_1')
      );
      const stateName = stateComponent?.long_name || '';

      const wikiDescription = await fetchSuburbDescriptionFromWikipedia(suburbName,stateName);
      const description = wikiDescription || `Located in the established residential area of ${suburbName}`;
      const description2 = 'Well-connected location with access to local amenities and transport infrastructure';
      
      
        newFetchedData.suburbInfo = {
          description,
          description2
        };
        setValue?.('locationAndNeighborhood.suburbDescription', description);
        setValue?.('locationAndNeighborhood.suburbDescription2', description2);
        
        console.log(`✅ Set suburb info: ${suburbName}`);
      }

      // Set utilities
      newFetchedData.gasAvailable = utilities.gasAvailable;
      setValue?.('locationAndNeighborhood.includesGas', utilities.gasAvailable);
      
      console.log(`✅ Set gas availability: ${utilities.gasAvailable}`);

      setFetchedData(newFetchedData);
      setProgress('');
      
      // Final verification of field assignments
      console.log('🔍 FINAL FIELD ASSIGNMENT VERIFICATION:');
      console.log('📍 Train Station Fields (publicTransport):');
      console.log(`   - Name: "${watch?.('locationAndNeighborhood.publicTransport.name') || 'EMPTY'}"`);
      console.log(`   - Type: "${watch?.('locationAndNeighborhood.publicTransport.type') || 'EMPTY'}"`);
      console.log('🚌 Bus Stop Fields (busStop):');  
      console.log(`   - Name: "${watch?.('locationAndNeighborhood.busStop.name') || 'EMPTY'}"`);
      console.log(`   - Type: "${watch?.('locationAndNeighborhood.busStop.type') || 'EMPTY'}"`);
      
      console.log('✅ Location data fetch completed successfully');
      
    } catch (err: any) {
      console.error('❌ Error fetching location data:', {
        error: err.message,
        name: err.name,
        stack: err.stack?.substring(0, 300)
      });
      
      let errorMessage = 'Failed to fetch location data. ';
      
      if (err.message?.includes('Network error')) {
        errorMessage += 'Please check your internet connection and try again.';
      } else if (err.message?.includes('API key')) {
        errorMessage += 'Google Maps API key is not configured properly. Please check your environment variables.';
      } else if (err.message?.includes('quota exceeded')) {
        errorMessage += 'Google Maps API quota has been exceeded. Please try again later.';
      } else if (err.message?.includes('timeout')) {
        errorMessage += 'Request timed out. Please try again.';
      } else {
        errorMessage += err.message || 'An unexpected error occurred.';
      }
      
      setError(errorMessage);
      setProgress('');
    } finally {
      setIsLoading(false);
    }
  }, [fullAddress, setValue, addressState]);

  const getMapUrl = () => {
    if (!fullAddress || !config.googleMapsApiKey) return '';
    // ✅ Use custom map API endpoint that adds address text above red marker
    return `/api/google-maps/custom-map?address=${encodeURIComponent(fullAddress)}`;
  };

  const hasBeenFetched = lastFetchedAddress === fullAddress && Object.keys(fetchedData).length > 0;

  // Runtime check for required props before rendering form
  if (!watch || !setValue || !register) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-yellow-700">Form functions not available. Please ensure the component is properly initialized.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Aerial View */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Aerial View
        </h4>
        
        <div className="bg-gray-100 rounded-lg p-4">
          {fullAddress && config.googleMapsApiKey ? (
            <div className="space-y-4">
              {/* Address inside map only; hide header address row */}
              <div className="relative">
                <img
                  src={getMapUrl()}
                  alt="Aerial view of property"
                  className="w-full h-80 object-cover rounded-lg shadow-md"
                  onLoad={() => setMapLoading(false)}
                  onError={() => setMapLoading(false)}
                  onLoadStart={() => setMapLoading(true)}
                />
                {mapLoading && (
                  <div className="absolute inset-0 bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      <span className="text-gray-500">Loading aerial view...</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-80 bg-gray-200 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MapPin className="w-8 h-8 mx-auto mb-2" />
                <p>Complete address in Overview section to view aerial map</p>
                {!config.googleMapsApiKey && (
                  <p className="text-red-500 text-sm mt-2">Google Maps API key required</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Auto-fetch and Status */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2 flex-1">
            Location Data
          </h4>
          <div className="flex items-center space-x-3">
            {hasBeenFetched && !isLoading && (
              <div className="flex items-center space-x-2 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" />
                <span>Data fetched</span>
              </div>
            )}
                      <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={testApiConnectivity}
              disabled={isLoading || !config.googleMapsApiKey}
              className="inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-1" />
              )}
              Test API
            </button>
            <button
              type="button"
              onClick={fetchFromGoogle}
              disabled={isLoading || !fullAddress || !config.googleMapsApiKey}
              className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Fetching...' : 'Auto-fetch from Google'}
            </button>
          </div>
          </div>
        </div>

        {progress && (
          <div className="flex items-center space-x-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
            <span className="text-sm text-blue-700">{progress}</span>
          </div>
        )}

        {error && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
          </div>
        )}

        {!config.googleMapsApiKey && (
          <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-700">
              To use enhanced auto-fetch, create a .env.local file with: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key
            </span>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-6">
          <FormField
            label="Suburb Description"
            error={errors.locationAndNeighborhood?.suburbDescription?.message}
          >
            <Input
              {...register('locationAndNeighborhood.suburbDescription')}
              placeholder="Auto-generated suburb description"
              error={errors.locationAndNeighborhood?.suburbDescription?.message}
            />
          </FormField>

          <FormField
            label="Suburb Description 2"
            error={errors.locationAndNeighborhood?.suburbDescription2?.message}
          >
            <Input
              {...register('locationAndNeighborhood.suburbDescription2')}
              placeholder="Additional suburb description"
              error={errors.locationAndNeighborhood?.suburbDescription2?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Street Connection */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Street Connection
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            label="Nearest Connected Street Name"
            error={errors.locationAndNeighborhood?.connectedStreet?.name?.message}
          >
            <Input
              {...register('locationAndNeighborhood.connectedStreet.name')}
              placeholder="e.g., Main Street"
              error={errors.locationAndNeighborhood?.connectedStreet?.name?.message}
            />
          </FormField>

          <FormField
            label="Situated Position"
            error={errors.locationAndNeighborhood?.connectedStreet?.position?.message}
          >
            <Input
              {...register('locationAndNeighborhood.connectedStreet.position')}
              placeholder="e.g., Fronting street access"
              error={errors.locationAndNeighborhood?.connectedStreet?.position?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Public Transport */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Public Transport
        </h4>
        
        {/* Train/Metro Station */}
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-700">Train/Metro Station</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField
              label="Station Name"
              error={errors.locationAndNeighborhood?.publicTransport?.name?.message}
            >
              <Input
                {...register('locationAndNeighborhood.publicTransport.name')}
                placeholder="e.g., Central Station"
                error={errors.locationAndNeighborhood?.publicTransport?.name?.message}
              />
            </FormField>

            <FormField
              label="Transport Type"
              error={(errors.locationAndNeighborhood?.publicTransport?.type as any)?.message}
            >
              <Select
                {...register('locationAndNeighborhood.publicTransport.type')}
                options={transportTypeOptions}
                error={(errors.locationAndNeighborhood?.publicTransport?.type as any)?.message}
              />
            </FormField>

            <FormField
              label="Distance"
              error={errors.locationAndNeighborhood?.publicTransport?.distance?.message}
            >
              <Input
                type="number"
                step="0.1"
                {...register('locationAndNeighborhood.publicTransport.distance', {
                  min: { value: 0, message: 'Distance must be positive' }
                })}
                placeholder="e.g., 500"
                error={errors.locationAndNeighborhood?.publicTransport?.distance?.message}
              />
            </FormField>

            <FormField
              label="Unit"
              error={errors.locationAndNeighborhood?.publicTransport?.unit?.message}
            >
              <Select
                {...register('locationAndNeighborhood.publicTransport.unit')}
                options={distanceUnitOptions}
                error={errors.locationAndNeighborhood?.publicTransport?.unit?.message}
              />
            </FormField>
          </div>
        </div>

        {/* Bus Stop */}
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-700">Bus Stop</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FormField
              label="Bus Stop Name"
              error={errors.locationAndNeighborhood?.busStop?.name?.message}
            >
              <Input
                {...register('locationAndNeighborhood.busStop.name')}
                placeholder="e.g., Main Street Bus Stop"
                error={errors.locationAndNeighborhood?.busStop?.name?.message}
              />
            </FormField>

            <FormField
              label="Type"
              error={(errors.locationAndNeighborhood?.busStop?.type as any)?.message}
            >
              <Select
                {...register('locationAndNeighborhood.busStop.type')}
                options={[{ value: 'bus_stop', label: 'Bus Stop' }]}
                error={(errors.locationAndNeighborhood?.busStop?.type as any)?.message}
              />
            </FormField>

            <FormField
              label="Distance"
              error={errors.locationAndNeighborhood?.busStop?.distance?.message}
            >
              <Input
                type="number"
                step="0.1"
                {...register('locationAndNeighborhood.busStop.distance', {
                  min: { value: 0, message: 'Distance must be positive' }
                })}
                placeholder="e.g., 200"
                error={errors.locationAndNeighborhood?.busStop?.distance?.message}
              />
            </FormField>

            <FormField
              label="Unit"
              error={errors.locationAndNeighborhood?.busStop?.unit?.message}
            >
              <Select
                {...register('locationAndNeighborhood.busStop.unit')}
                options={distanceUnitOptions}
                error={errors.locationAndNeighborhood?.busStop?.unit?.message}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* Shopping */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Shopping
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FormField
            label="Shop Name"
            error={errors.locationAndNeighborhood?.shop?.name?.message}
          >
            <Input
              {...register('locationAndNeighborhood.shop.name')}
              placeholder="e.g., Westfield Shopping Center"
              error={errors.locationAndNeighborhood?.shop?.name?.message}
            />
          </FormField>

          <FormField
            label="Shop Type"
            error={(errors.locationAndNeighborhood?.shop?.type as any)?.message}
          >
            <Select
              {...register('locationAndNeighborhood.shop.type')}
              options={shopTypeOptions}
              error={(errors.locationAndNeighborhood?.shop?.type as any)?.message}
            />
          </FormField>

          <FormField
            label="Distance"
            error={errors.locationAndNeighborhood?.shop?.distance?.message}
          >
            <Input
              type="number"
              step="0.1"
              {...register('locationAndNeighborhood.shop.distance', {
                min: { value: 0, message: 'Distance must be positive' }
              })}
              placeholder="e.g., 1.2"
              error={errors.locationAndNeighborhood?.shop?.distance?.message}
            />
          </FormField>

          <FormField
            label="Unit"
            error={errors.locationAndNeighborhood?.shop?.unit?.message}
          >
            <Select
              {...register('locationAndNeighborhood.shop.unit')}
              options={distanceUnitOptions}
              error={errors.locationAndNeighborhood?.shop?.unit?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Schools */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Schools
        </h4>
        
        {/* Primary School */}
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-700">Primary School</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="School Name"
              error={errors.locationAndNeighborhood?.primarySchool?.name?.message}
            >
              <Input
                {...register('locationAndNeighborhood.primarySchool.name')}
                placeholder="e.g., Riverside Primary"
                error={errors.locationAndNeighborhood?.primarySchool?.name?.message}
              />
            </FormField>

            <FormField
              label="Distance"
              error={errors.locationAndNeighborhood?.primarySchool?.distance?.message}
            >
              <Input
                type="number"
                step="0.1"
                {...register('locationAndNeighborhood.primarySchool.distance', {
                  min: { value: 0, message: 'Distance must be positive' }
                })}
                placeholder="e.g., 800"
                error={errors.locationAndNeighborhood?.primarySchool?.distance?.message}
              />
            </FormField>

            <FormField
              label="Unit"
              error={errors.locationAndNeighborhood?.primarySchool?.unit?.message}
            >
              <Select
                {...register('locationAndNeighborhood.primarySchool.unit')}
                options={distanceUnitOptions}
                error={errors.locationAndNeighborhood?.primarySchool?.unit?.message}
              />
            </FormField>
          </div>
        </div>

        {/* High School */}
        <div className="space-y-4">
          <h5 className="text-md font-medium text-gray-700">High School</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FormField
              label="School Name"
              error={errors.locationAndNeighborhood?.highSchool?.name?.message}
            >
              <Input
                {...register('locationAndNeighborhood.highSchool.name')}
                placeholder="e.g., Central High School"
                error={errors.locationAndNeighborhood?.highSchool?.name?.message}
              />
            </FormField>

            <FormField
              label="Distance"
              error={errors.locationAndNeighborhood?.highSchool?.distance?.message}
            >
              <Input
                type="number"
                step="0.1"
                {...register('locationAndNeighborhood.highSchool.distance', {
                  min: { value: 0, message: 'Distance must be positive' }
                })}
                placeholder="e.g., 1.5"
                error={errors.locationAndNeighborhood?.highSchool?.distance?.message}
              />
            </FormField>

            <FormField
              label="Unit"
              error={errors.locationAndNeighborhood?.highSchool?.unit?.message}
            >
              <Select
                {...register('locationAndNeighborhood.highSchool.unit')}
                options={distanceUnitOptions}
                error={errors.locationAndNeighborhood?.highSchool?.unit?.message}
              />
            </FormField>
          </div>
        </div>
      </div>

      {/* CBD */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Central Business District (CBD)
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <FormField
            label="CBD Name"
            error={errors.locationAndNeighborhood?.cbd?.name?.message}
          >
            <Input
              {...register('locationAndNeighborhood.cbd.name')}
              placeholder="e.g., Sydney CBD"
              error={errors.locationAndNeighborhood?.cbd?.name?.message}
            />
          </FormField>

          <FormField
            label="Distance"
            error={(errors.locationAndNeighborhood?.cbd?.distance as any)?.message}
          >
            <Input
              type="number"
              step="0.1"
              {...register('locationAndNeighborhood.cbd.distance', {
                min: { value: 0, message: 'Distance must be positive' }
              })}
              placeholder="e.g., 15.5"
              error={(errors.locationAndNeighborhood?.cbd?.distance as any)?.message}
            />
          </FormField>

          <FormField
            label="Unit"
            error={(errors.locationAndNeighborhood?.cbd?.unit as any)?.message}
          >
            <Select
              {...register('locationAndNeighborhood.cbd.unit')}
              options={distanceUnitOptions}
              error={(errors.locationAndNeighborhood?.cbd?.unit as any)?.message}
            />
          </FormField>

          <FormField
            label="Travel Time by Car"
            error={(errors.locationAndNeighborhood?.cbd?.travelTime as any)?.message}
          >
            <Input
              {...register('locationAndNeighborhood.cbd.travelTime')}
              placeholder="e.g., 25 mins"
              error={(errors.locationAndNeighborhood?.cbd?.travelTime as any)?.message}
            />
          </FormField>
        </div>
      </div>

      {/* Utilities */}
      <div className="space-y-6">
        <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
          Utilities
        </h4>
        
        <div className="space-y-4">
          <FormField
            label="Gas Available"
            error={errors.locationAndNeighborhood?.includesGas?.message}
          >
            <Checkbox
              {...register('locationAndNeighborhood.includesGas')}
              label="Property includes gas connection"
            />
          </FormField>
        </div>
      </div>
    </div>
  );
};