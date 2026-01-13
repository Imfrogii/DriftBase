import { Location, LocationWithEvents } from "@/lib/types/location";

export type BaseMapItem<T = Location | LocationWithEvents> = {
  id: string | number;
  latitude: number;
  longitude: number;
  marker?: React.ReactNode;
  payload: T;
  selected?: boolean;
  Header?: JSX.Element;
  type: MapMarkersType;
};

export enum MapMarkersType {
  EVENT = "event",
  LOCATION = "location",
}

export const isLocationWithEvents = (
  baseItem: BaseMapItem
): baseItem is BaseMapItem<LocationWithEvents> => {
  return baseItem.type === "event";
};
