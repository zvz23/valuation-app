import { Control, FieldErrors, UseFormRegister, UseFormWatch, UseFormSetValue } from 'react-hook-form';

export interface PropertyValuationData {
  overview: OverviewData;
  valuationDetails: ValuationDetailsData;
  propertyDetails: PropertyDetailsData;
  locationAndNeighborhood: LocationData;
  roomFeaturesFixtures: RoomFeaturesData;
  photos: PhotosData;
  propertyDescriptors: PropertyDescriptorsData;
  ancillaryImprovements: AncillaryImprovementsData;
  statutoryDetails: StatutoryDetailsData;
  siteDetails: SiteDetailsData;
  planningDetails: PlanningDetailsData;
  generalComments: GeneralCommentsData;
  marketEvidence: MarketEvidenceData;
  annexures: AnnexuresData;
}

export interface OverviewData {
  // Basic Information
  jobNumber: number;
  closedBy: string;
  propertyValuer: string;
  instructedBy: string;
  reportType: string;
  valuationType: string;
  surveyType: string;
  
  // Dates
  dateOfInspection: string;
  dateOfValuation: string;
  
  // Address Fields
  addressStreet: string;
  addressSuburb: string;
  addressState: string;
  addressPostcode: string;
  
  // Delegation Fields
  filloutDelegation?: string;
  filloutBy?: string;
  marketEvidenceDelegation?: string;
  marketEvidenceBy?: string;
  checkDelegation?: string;
  checkBy?: string;
  
  // Final Fields
  purposeOfReport: string;
  reportUploaded: string;
  reportSent: string;
  
  // Legacy fields (keeping for backward compatibility)
  propertyAddress?: string;
  clientName?: string;
  valuationDate?: string;
  purposeOfValuation?: string;
  propertyType?: string;
  occupancyStatus?: string;
}

export interface ValuationDetailsData {
  // Core valuation values
  landValue: string;
  improvements: string;
  marketValue: string;
  interestValued: string;
  valuationAmount: string;
  directComparison: string;
  dateOfValuation: string;
  
  // Display options
  externalDesktopValuation: boolean;
  showLandValue: boolean;
  showCurrencyOfValuation: boolean;
  showImprovements: boolean;
  
  // Client & valuer values
  clientsExpectedValue: string;
  valuersGuaranteedValue: string;
  capitalisationRate: string;
  lettingUpExpenses: string;
  occupancyStatus: string;
  nlaValueRate: string;
  assessedNetRental: string;
  rentalValue: string;
  rentalFrequency: string;
  requestedValuationTarget: string;
  
  // Additional notes
  valuationNotes: string;
  
  // Legacy fields (keeping for backward compatibility)
  forcedSaleValue?: string;
  rentValue?: string;
  valuationMethod?: string;
  dateOfInspection?: string;
  valuerId?: string;
}

export interface PropertyDetailsData {
  // Basic property information
  propertyType: string;
  buildYear: string;
  siteArea: string;
  titleReference: string;
  councilArea: string;
  zoning: string;
  accommodation: string;
  
  // Area information
  buildingArea: string;
  livingArea: string;
  parkingArea: string;
  externalArea: string;
  lettableArea: string;
  otherAreas: string;
  
  // Land information
  landShape: string;
  landSlope: string;
  frontage: string;
  depth: string;
  
  // Planning & legal information
  zoningEffects: string;
  permissibleUses: string;
  heritageIssue: string;
  
  // Legacy fields (keeping for backward compatibility)
  buildingType?: string;
  constructionYear?: string;
  totalFloorArea?: string;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  numberOfLivingRooms?: number;
  garageSpaces?: number;
  storeyHeight?: string;
  roofType?: string;
  wallConstruction?: string;
}

export interface LocationData {
  // Auto-generated suburb descriptions
  suburbDescription: string;
  suburbDescription2: string;
  
  // Public transport details
  publicTransport: {
    name: string;
    type: string;
    distance: string;
    unit: string;
  };
  
  // Bus stop details
  busStop: {
    name: string;
    type: string;
    distance: string;
    unit: string;
  };
  
  // Shopping details
  shop: {
    name: string;
    type: string;
    distance: string;
    unit: string;
  };
  
  // School details
  primarySchool: {
    name: string;
    distance: string;
    unit: string;
  };
  
  highSchool: {
    name: string;
    distance: string;
    unit: string;
  };
  
  // CBD details
  cbd: {
    name: string;
    distance: string;
    unit: string;
    travelTime: string;
  };
  
  // Connected street details
  connectedStreet: {
    name: string;
    position: string;
  };
  
  // Utilities
  includesGas: boolean;
  
  // Legacy fields (keeping for backward compatibility)
  suburb?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  proximityToAmenities?: string[];
  transportLinks?: string;
  neighborhoodCharacter?: string;
  schoolDistrict?: string;
}

export interface RoomFeaturesData {
  // Categories
  primaryCategory: string;
  secondaryCategory?: string;
  categoryDescription?: string;
  
  // Flooring
  flooringTypes: string[];
  flooringCondition?: string;
  flooringAge?: string;
  flooringNotes?: string;
  
  // Features and Fixtures
  features: string[];
  fixtures: string[];
  featuresCondition?: string;
  fixturesCondition?: string;
  featuresFixturesNotes?: string;
  
  // PC Items (Personal Chattels)
  pcItems: string[];
  pcItemsCondition?: string;
  pcItemsValue?: string;
  pcItemsNotes?: string;
  
  // Legacy fields (keeping for backward compatibility)
  kitchen?: {
    fittedCupboards: boolean;
    appliances: string[];
    condition: string;
  };
  bathrooms?: {
    numberOfToilets: number;
    bathTypes: string[];
    fittings: string[];
  };
  livingAreas?: {
    airConditioning: boolean;
    heating: boolean;
    flooring: string[];
    lighting: string;
  };
  additionalFeatures?: string[];
}

export interface PhotosData {
  reportCoverPhoto: FileList | null;
  exteriorPhotos: FileList | null;
  interiorPhotos: FileList | null;
  additionalPhotos: FileList | null;
}

export interface PropertyDescriptorsData {
  // Property descriptors
  mainBuildingType: string;
  customMainBuildingType?: string;
  externalWalls?: string;
  customExternalWalls?: string;
  internalWalls?: string;
  customInternalWalls?: string;
  roofing?: string;
  customRoofing?: string;
  numberOfBedrooms?: string;
  numberOfBathrooms?: string;
  numberOfCarSpaces?: string;
  parkingType?: string;
  
  // Property conditions
  internalCondition?: string;
  externalCondition?: string;
  lighting?: string;
  airConditioning?: string;
  fireServices?: string;
  lift?: string;
  
  // Additional information
  generalDescription?: string;
  repairRequirements?: string;
  defects?: string;
  
  // Legacy fields (keeping for backward compatibility)
  overallCondition?: string;
  maintenanceRequired?: string[];
  specialFeatures?: string[];
  improvements?: string[];
}

export interface AncillaryImprovementsData {
  // Section toggle
  showSection?: boolean;
  
  // Primary improvements
  driveway?: string;
  customDriveway?: string;
  fencing?: string;
  customFencing?: string;
  
  // Additional improvements with material selection
  improvements?: {
    paths?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    swimmingPool?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    retainingWalls?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    verandah?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    pergola?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    solarPanels?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    landscaping?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    lifts?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    gym?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    communalGarden?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    paving?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    tennisCourt?: {
      selected?: boolean;
      material?: string;
      customMaterial?: string;
    };
    custom?: {
      selected?: boolean;
      customName?: string;
      material?: string;
      customMaterial?: string;
    };
    custom1?: {
      selected?: boolean;
      customName?: string;
      material?: string;
      customMaterial?: string;
    };
    custom2?: {
      selected?: boolean;
      customName?: string;
      material?: string;
      customMaterial?: string;
    };
    custom3?: {
      selected?: boolean;
      customName?: string;
      material?: string;
      customMaterial?: string;
    };
  };
  
  // Legacy fields (keeping for backward compatibility)
  swimmingPool?: boolean;
  borehole?: boolean;
  solarPanels?: boolean;
  generator?: boolean;
  securityFeatures?: string[];
  landscaping?: string;
  otherImprovements?: string[];
}

export interface StatutoryDetailsData {
  // Title & Legal Information
  titleReference?: string;
  titleType?: string;
  registeredProprietor?: string;
  lotPlanNumber?: string;
  
  // Important Dates
  titleIssueDate?: string;
  lastTransferDate?: string;
  certificateOccupancyDate?: string;
  buildingApprovalDate?: string;
  planningApprovalDate?: string;
  siteValueAssessmentDate?: string;
  
  // Site Value & Assessments
  landValue?: string;
  unimprovedCapitalValue?: string;
  capitalImprovedValue?: string;
  siteValueAuthority?: string;
  
  // Rates & Charges
  councilRates?: string;
  landTax?: string;
  waterRates?: string;
  otherCharges?: string;
  
  // Planning & Zoning
  zoningClassification?: string;
  planningAuthority?: string;
  developmentApprovals?: string;
  
  // Compliance Status
  buildingCodeCompliance?: string;
  fireSafetyCompliance?: string;
  disabilityAccessCompliance?: string;
  
  // Encumbrances & Restrictions
  easements?: string;
  covenantRestrictions?: string;
  heritageEnvironmental?: string;
  bodyCorporateDetails?: string;
  
  // Legacy fields (keeping for backward compatibility)
  erfNumber?: string;
  titleDeedNumber?: string;
  municipalAccount?: boolean;
  ratesAndTaxes?: string;
  bondDetails?: string;
  zoningRights?: string;
}

export interface SiteDetailsData {
  erfSize: string;
  siteTopography: string;
  soilConditions: string;
  drainage: string;
  utilities: string[];
  access: string;
  description?: string;
  identification?: string;
  mapSource?: string;
}

export interface PlanningDetailsData {
  // New comprehensive planning fields
  planningApproval?: string;
  potentialFutureUse?: string;
  currentUse?: string;
  heritageRegistration?: string;
  planningScheme?: string;
  
  // Legacy fields (keeping for backward compatibility)
  zoningCategory?: string;
  buildingPlans?: boolean;
  occupancyCertificate?: boolean;
  buildingCompliance?: boolean;
  futureDevRights?: string;
}

export interface GeneralCommentsData {
  // Auto-generated from CoreLogic
  marketOverview?: string;
  generalPropertyComments?: string;
  propertyDescription?: string;
  
  // Manual fields
  occupancyDetails?: string;
  valuationComments: string;
  
  // Legacy fields (keeping for backward compatibility)
  marketComments?: string;
  recommendationsRestrictions?: string;
}

export interface MarketEvidenceData {
  // Sales Evidence
  comparableSales: Array<{
    address: string;
    salePrice: string;
    saleDate: string;
    adjustments: string;
  }>;
  marketTrends: string;
  averageDaysOnMarket: string;
  
  // New comprehensive sales fields
  salesEvidence?: {
    comparableSales?: Array<{
      address: string;
      salePrice: string;
      saleDate: string;
      propertyType: string;
      bedrooms: string;
      bathrooms: string;
      carSpaces: string;
      landSize: string;
      adjustments: string;
      adjustedPrice: string;
      notes: string;
    }>;
    marketTrends?: string;
    averageDaysOnMarket?: string;
    priceRange?: {
      low: string;
      high: string;
      median: string;
    };
    salesVolume?: string;
    marketConditions?: string;
  };
  
  // Rental Evidence
  rentalEvidence?: {
    comparableRentals?: Array<{
      address: string;
      rentalPrice: string;
      rentalPeriod: string;
      leaseDate: string;
      propertyType: string;
      bedrooms: string;
      bathrooms: string;
      carSpaces: string;
      landSize: string;
      adjustments: string;
      adjustedRental: string;
      notes: string;
    }>;
    rentalTrends?: string;
    averageVacancyPeriod?: string;
    rentalRange?: {
      low: string;
      high: string;
      median: string;
    };
    rentalVolume?: string;
    rentalMarketConditions?: string;
    rentalYield?: string;
  };
}

export interface AnnexuresData {
  titleDeed: FileList | null;
  buildingPlans: FileList | null;
  additionalDocuments: FileList | null;
}

export type FormSection = keyof PropertyValuationData;

export interface SectionProps {
  data: PropertyValuationData;
  updateData: (data: Partial<PropertyValuationData>) => void;
  register: UseFormRegister<PropertyValuationData>;
  control: Control<PropertyValuationData>;
  errors: FieldErrors<PropertyValuationData>;
  watch?: UseFormWatch<PropertyValuationData>;
  setValue?: UseFormSetValue<PropertyValuationData>;
} 