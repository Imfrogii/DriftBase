import { FiltersType } from "@/components/common/LeftHandFilters/LeftHandFilters";
import { CarLevel, EventType } from "../supabase/types";

export type SearchParamsFilters = Partial<FiltersType>;
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}

export const generateFiltersFromParams = (
  searchParams?: SearchParamsFilters
): FiltersType => {
  const res: FiltersType = {
    level: Array.isArray(searchParams?.level)
      ? searchParams.level
      : searchParams?.level
      ? [searchParams.level]
      : [],
    type: Array.isArray(searchParams?.type)
      ? searchParams.type
      : searchParams?.type
      ? [searchParams.type]
      : [],
    priceMin: searchParams?.priceMin || "",
    priceMax: searchParams?.priceMax || "",
    dateFrom: searchParams?.dateFrom || "",
    dateTo: searchParams?.dateTo || "",
    freePlaces: searchParams?.freePlaces || "",
  };

  if (searchParams?.page) {
    res.page = searchParams.page;
  }
  return res;
};

export const parseFilters = (
  filters?: unknown,
  urlParams?: URLSearchParams
) => {
  const params = urlParams || new URLSearchParams();
  Object.entries(filters || {}).forEach(([key, value]) => {
    if (!value || (Array.isArray(value) && value.length === 0)) return;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.append(key, value.toString());
    }
  });
  return params;
};

export const DEFAULT_FILTERS: FiltersType = {
  level: [],
  priceMin: "",
  priceMax: "",
  dateFrom: "",
  dateTo: "",
  type: [],
  freePlaces: "",
};

export const levelCheckboxes = [
  {
    label: "Street",
    value: CarLevel.STREET,
  },
  {
    label: "Semi-Pro",
    value: CarLevel.SEMI_PRO,
  },
  {
    label: "Pro",
    value: CarLevel.PRO,
  },
];

export const typeCheckboxes = [
  {
    label: "Event",
    value: EventType.EVENT,
  },
  {
    label: "Training",
    value: EventType.TRAINING,
  },
  {
    label: "Competition",
    value: EventType.COMPETITION,
  },
];

export const freePlacesVariants = [
  {
    label: "Available spots",
    value: "1",
  },
  {
    label: "2+ spots",
    value: "2",
  },
  {
    label: "3+ spots",
    value: "3",
  },
  {
    label: "4+ spots",
    value: "4",
  },
  {
    label: "5+ spots",
    value: "5",
  },
  {
    label: "6+ spots",
    value: "6",
  },
  {
    label: "7+ spots",
    value: "7",
  },
];
