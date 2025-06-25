import {
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
} from '@/models/PropertyValuation';

export const propertyValuationValidationSchemas = {
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
  annexures: AnnexuresSchema
};
