import mongoose, { Document } from 'mongoose';

const OverviewSchema = new Schema({
  jobNumber: String,
  closedBy: String,
  propertyValuer: String,
  instructedBy: String,
  reportType: String,
  valuationType: String,
  surveyType: String,
  dateOfInspection: String,
  dateOfValuation: String,
  addressStreet: String,
  addressSuburb: String,
  addressState: String,
  addressPostcode: String,
  filloutDelegation: String,
  filloutBy: String,
  marketEvidenceDelegation: String,
  marketEvidenceBy: String,
  checkDelegation: String,
  checkBy: String,
  purposeOfReport: String,
  reportUploaded: String,
  reportSent: String,
  propertyAddress: String,
  clientName: String,
  valuationDate: String,
  purposeOfValuation: String,
  propertyType: String,
  occupancyStatus: String,
}, { _id: false });


const ValuationDetailsSchema = new Schema({
  landValue: String,
  improvements: String,
  marketValue: String,
  interestValued: String,
  valuationAmount: String,
  directComparison: String,
  dateOfValuation: String,
  externalDesktopValuation: Boolean,
  showLandValue: Boolean,
  showCurrencyOfValuation: Boolean,
  showImprovements: Boolean,
  clientsExpectedValue: String,
  valuersGuaranteedValue: String,
  capitalisationRate: String,
  lettingUpExpenses: String,
  occupancyStatus: String,
  nlaValueRate: String,
  assessedNetRental: String,
  rentalValue: String,
  rentalFrequency: String,
  requestedValuationTarget: String,
  valuationNotes: String,
  forcedSaleValue: String,
  rentValue: String,
  valuationMethod: String,
  dateOfInspection: String,
  valuerId: String,
}, { _id: false });

const PropertyDetailsSchema = new Schema({
  propertyType: String,
  buildYear: String,
  siteArea: String,
  titleReference: String,
  councilArea: String,
  zoning: String,
  accommodation: String,
  buildingArea: String,
  livingArea: String,
  parkingArea: String,
  externalArea: String,
  lettableArea: String,
  otherAreas: String,
  landShape: String,
  landSlope: String,
  frontage: String,
  depth: String,
  zoningEffects: String,
  permissibleUses: String,
  heritageIssue: String,
  buildingType: String,
  constructionYear: String,
  totalFloorArea: String,
  numberOfBedrooms: Number,
  numberOfBathrooms: Number,
  numberOfLivingRooms: Number,
  garageSpaces: Number,
  storeyHeight: String,
  roofType: String,
  wallConstruction: String,
}, { _id: false });

import { Schema } from 'mongoose';

const DistanceObjectSchema = new Schema({
  name: String,
  type: String,
  distance: String,
  unit: String
}, { _id: false });

const SchoolDistanceSchema = new Schema({
  name: String,
  distance: String,
  unit: String
}, { _id: false });

const CBDObjectSchema = new Schema({
  name: String,
  distance: String,
  unit: String,
  travelTime: String
}, { _id: false });

const ConnectedStreetSchema = new Schema({
  name: String,
  position: String
}, { _id: false });

const LocationAndNeighborhoodSchema = new Schema({
  suburbDescription: String,
  suburbDescription2: String,
  publicTransport: DistanceObjectSchema,
  busStop: DistanceObjectSchema,
  shop: DistanceObjectSchema,
  primarySchool: SchoolDistanceSchema,
  highSchool: SchoolDistanceSchema,
  cbd: CBDObjectSchema,
  connectedStreet: ConnectedStreetSchema,
  includesGas: Boolean,
  suburb: String,
  city: String,
  province: String,
  postalCode: String,
  proximityToAmenities: [String],
  transportLinks: String,
  neighborhoodCharacter: String,
  schoolDistrict: String
}, { _id: false });



const RoomFeaturesFixturesSchema = new Schema({
  primaryCategory: String,
  secondaryCategory: String,
  categoryDescription: String,
  flooringTypes: [String],
  flooringCondition: String,
  flooringAge: String,
  flooringNotes: String,
  features: [String],
  fixtures: [String],
  featuresCondition: String,
  fixturesCondition: String,
  featuresFixturesNotes: String,
  pcItems: [String],
  pcItemsCondition: String,
  pcItemsValue: String,
  pcItemsNotes: String,
  kitchen: {
    fittedCupboards: Boolean,
    appliances: [String],
    condition: String,
  },
  bathrooms: {
    numberOfToilets: Number,
    bathTypes: [String],
    fittings: [String],
  },
  livingAreas: {
    airConditioning: Boolean,
    heating: Boolean,
    flooring: [String],
    lighting: String,
  },
  additionalFeatures: [String],
}, { _id: false });


const PhotosSchema = new Schema({
  exteriorPhotos: Schema.Types.Mixed,
  interiorPhotos: Schema.Types.Mixed,
  additionalPhotos: Schema.Types.Mixed,
}, { _id: false });


const PropertyDescriptorsSchema = new Schema({
  mainBuildingType: String,
  customMainBuildingType: String,
  externalWalls: String,
  customExternalWalls: String,
  internalWalls: String,
  customInternalWalls: String,
  roofing: String,
  customRoofing: String,
  numberOfBedrooms: String,
  numberOfBathrooms: String,
  numberOfCarSpaces: String,
  parkingType: String,
  internalCondition: String,
  externalCondition: String,
  lighting: String,
  airConditioning: String,
  fireServices: String,
  lift: String,
  generalDescription: String,
  repairRequirements: String,
  defects: String,
  overallCondition: String,
  maintenanceRequired: [String],
  specialFeatures: [String],
  improvements: [String],
}, { _id: false });


const AncillaryImprovementsSchema = new Schema({
  showSection: Boolean,
  driveway: String,
  customDriveway: String,
  fencing: String,
  customFencing: String,
  improvements: Schema.Types.Mixed,
  swimmingPool: Boolean,
  borehole: Boolean,
  solarPanels: Boolean,
  generator: Boolean,
  securityFeatures: [String],
  landscaping: String,
  otherImprovements: [String],
}, { _id: false });


const StatutoryDetailsSchema = new Schema({
  titleReference: String,
  titleType: String,
  registeredProprietor: String,
  lotPlanNumber: String,
  titleIssueDate: String,
  lastTransferDate: String,
  certificateOccupancyDate: String,
  buildingApprovalDate: String,
  planningApprovalDate: String,
  siteValueAssessmentDate: String,
  landValue: String,
  unimprovedCapitalValue: String,
  capitalImprovedValue: String,
  siteValueAuthority: String,
  councilRates: String,
  landTax: String,
  waterRates: String,
  otherCharges: String,
  zoningClassification: String,
  planningAuthority: String,
  developmentApprovals: String,
  buildingCodeCompliance: String,
  fireSafetyCompliance: String,
  disabilityAccessCompliance: String,
  easements: String,
  covenantRestrictions: String,
  heritageEnvironmental: String,
  bodyCorporateDetails: String,
  erfNumber: String,
  titleDeedNumber: String,
  municipalAccount: Boolean,
  ratesAndTaxes: String,
  bondDetails: String,
  zoningRights: String,
}, { _id: false });

const SiteDetailsSchema = new Schema({
  erfSize: String,
  siteTopography: String,
  soilConditions: String,
  drainage: String,
  utilities: [String],
  access: String,
  description: String,
  identification: String,
  mapSource: String,
}, { _id: false });

const PlanningDetailsSchema = new Schema({
  planningApproval: String,
  potentialFutureUse: String,
  currentUse: String,
  heritageRegistration: String,
  planningScheme: String,
  zoningCategory: String,
  buildingPlans: Boolean,
  occupancyCertificate: Boolean,
  buildingCompliance: Boolean,
  futureDevRights: String,
}, { _id: false });

const GeneralCommentsSchema = new Schema({
  marketOverview: String,
  generalPropertyComments: String,
  propertyDescription: String,
  occupancyDetails: String,
  valuationComments: String,
  marketComments: String,
  recommendationsRestrictions: String,
}, { _id: false });

const MarketEvidenceSchema = new Schema({
  comparableSales: [
    {
      address: String,
      salePrice: String,
      saleDate: String,
      adjustments: String,
    }
  ],
  marketTrends: String,
  averageDaysOnMarket: String,
  salesEvidence: Schema.Types.Mixed,
  rentalEvidence: Schema.Types.Mixed,
}, { _id: false });

const AnnexuresSchema = new Schema({
  titleDeed: Schema.Types.Mixed,
  buildingPlans: Schema.Types.Mixed,
  additionalDocuments: Schema.Types.Mixed,
}, { _id: false });

const PropertyValuationSchema = new Schema({
  overview: OverviewSchema,
  valuationDetails: ValuationDetailsSchema,
  propertyDetails: PropertyDetailsSchema,
  locationAndNeighborhood: LocationAndNeighborhoodSchema,
  roomFeaturesFixtures: RoomFeaturesFixturesSchema,
  photos: PhotosSchema,
  propertyDescriptors: PropertyDescriptorsSchema,
  ancillaryImprovements: AncillaryImprovementsSchema,
  statutoryDetails: StatutoryDetailsSchema,
  siteDetails: SiteDetailsSchema,
  planningDetails: PlanningDetailsSchema,
  generalComments: GeneralCommentsSchema,
  marketEvidence: MarketEvidenceSchema,
  annexures: AnnexuresSchema,
}, { timestamps: true });

export {
  OverviewSchema,
  ValuationDetailsSchema,
  PropertyDetailsSchema,
  LocationAndNeighborhoodSchema,
  RoomFeaturesFixturesSchema,
  PhotosSchema,
  PropertyDescriptorsSchema,
  AncillaryImprovementsSchema,
  StatutoryDetailsSchema,
  SiteDetailsSchema,
  PlanningDetailsSchema,
  GeneralCommentsSchema,
  MarketEvidenceSchema,
  AnnexuresSchema
};

export interface IPropertyValuation extends Document {
  overview: any;
  valuationDetails: any;
  propertyDetails: any;
  locationAndNeighborhood: any;
  roomFeaturesFixtures: any;
  photos: any;
  propertyDescriptors: any;
  ancillaryImprovements: any;
  statutoryDetails: any;
  siteDetails: any;
  planningDetails: any;
  generalComments: any;
  marketEvidence: any;
  annexures: any;
}

if (mongoose.models['PropertyValuation']) {
  delete mongoose.models['PropertyValuation'];
}

export default mongoose.models.PropertyValuation || mongoose.model<IPropertyValuation>('PropertyValuation', PropertyValuationSchema);
