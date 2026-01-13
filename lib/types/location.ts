export interface Location {
  id: string;
  name: string;
  geom: string;
  address: string;
  location_id?: string;
}

export type LocationWithEvents = Location & {
  location_id: string;
  event_count: number;
  event_ids: string[];
};

export interface LocationSearchParams {
  q?: string;
  lat?: number;
  lng?: number;
  radius?: number;
  page?: number;
  limit?: number;
}

export interface LocationSearchResponse {
  locations: Location[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
