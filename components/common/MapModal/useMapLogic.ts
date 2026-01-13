import { useDeviceDetection } from "@/lib/hooks/useDeviceDetection";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import { MapRef } from "react-map-gl/dist/esm/exports-maplibre";
import { ViewState } from "react-map-gl/dist/esm/types";
import { INITIAL_VIEW_STATE } from "./BaseMapModal";
import { Location } from "@/lib/types/location";
import { MapboxLocation } from "../LocationSearch/LocationSearch";
import { BaseMapItem, isLocationWithEvents } from "./types";
import { FiltersType } from "../LeftHandFilters/LeftHandFilters";
import { getLatLng } from "@/lib/helpers/geo";

export function useMapLogic({
  open,
  selectedLocation,
  setSelectedLocation,
  initialViewState = INITIAL_VIEW_STATE,
  fetchLocationsInBounds,
}: {
  open: boolean;
  selectedLocation: Location | null;
  initialViewState?: ViewState;
  fetchLocationsInBounds?: (
    opts: {
      center: { lat: number; lng: number };
      bounds: any;
      zoom: number;
    },
    filters?: FiltersType
  ) => void | Promise<void>;
  setSelectedLocation?: (location: Location | null) => void;
}) {
  const mapRef = useRef<MapRef | null>(null);
  const { isTouchDevice } = useDeviceDetection();

  const [viewState, setViewState] = useState<ViewState>(initialViewState);

  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(
    null
  );

  useEffect(() => {
    if (!open) return;

    if (selectedLocation) {
      const coords = getLatLng(selectedLocation.geom);
      const newViewState = {
        ...coords,
        zoom: 15,
      } as ViewState;
      setViewState(newViewState);
      setMarkerPosition([coords.latitude, coords.longitude]);
      return;
    }

    // Try browser geolocation, fallback leaves initial
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setViewState((prev) => ({ ...prev, longitude, latitude, zoom: 12 }));
          setMarkerPosition([latitude, longitude]);
        },
        () => {
          // fallback keep initial center
          setMarkerPosition([
            initialViewState.latitude as number,
            initialViewState.longitude as number,
          ]);
        }
      );
    }
  }, [
    open,
    // selectedLocation,
    initialViewState.latitude,
    initialViewState.longitude,
  ]);

  const handleMove = useCallback(
    (evt: { viewState: ViewState }) => {
      setViewState(evt.viewState);
      if (isTouchDevice) {
        setSelectedLocation?.(null);
      }
    },
    [isTouchDevice]
  );

  const getLocations = useCallback(
    (filters?: FiltersType) => {
      if (!mapRef.current) return;
      const map = mapRef.current.getMap();
      const bounds = map.getBounds();

      if (fetchLocationsInBounds && (viewState.zoom ?? 0) >= 6) {
        fetchLocationsInBounds(
          {
            center: {
              lat: viewState.latitude ?? initialViewState.latitude ?? 0,
              lng: viewState.longitude ?? initialViewState.longitude ?? 0,
            },
            bounds: {
              getNorth: () => bounds.getNorth(),
              getSouth: () => bounds.getSouth(),
              getEast: () => bounds.getEast(),
              getWest: () => bounds.getWest(),
            } as any,
            zoom: viewState.zoom ?? 0,
          },
          filters
        );
      }
    },
    [fetchLocationsInBounds, viewState, initialViewState]
  );

  const handleMoveEnd = useCallback(() => {
    getLocations();
  }, [getLocations]);

  const handleMapClick = useCallback(
    (event: any) => {
      if (isTouchDevice) return; // disable click selection on touch
      const { lngLat } = event;
      setMarkerPosition([lngLat.lat, lngLat.lng]);
      setSelectedLocation?.(null);
    },
    [isTouchDevice]
  );

  const handleMarkerClick = useCallback(
    (event: any, item: BaseMapItem) => {
      if (!item.payload) return;
      event.originalEvent.stopPropagation();
      isLocationWithEvents(item)
        ? setSelectedLocation?.(item.payload)
        : setSelectedLocation?.(
            item.payload as BaseMapItem<Location>["payload"]
          );
      setViewState((prev) => ({
        ...prev,
        longitude: item.longitude,
        latitude: item.latitude,
      }));
    },
    [setSelectedLocation]
  );

  const handleMarkerDrag = useCallback(
    (event: any) => {
      if (isTouchDevice) return;
      const { lngLat } = event;
      setMarkerPosition([lngLat.lat, lngLat.lng]);
      setSelectedLocation?.(null);
    },
    [isTouchDevice]
  );

  const getZoomForFeature = (
    place_type: MapboxLocation["feature_type"]
  ): number => {
    switch (place_type) {
      case "address":
      case "custom":
        return 17; // конкретный дом
      case "street":
        return 15; // улица
      case "neighborhood":
        return 14; // район
      case "locality":
      case "place":
        return 13; // город / населённый пункт
      case "district":
        return 12; // район административный
      case "postcode":
        return 13; // индекс (приблизительно район)
      case "region":
        return 10; // область / регион
      case "country":
        return 5; // страна
      default:
        return 12; // запасной вариант
    }
  };

  const handleSelectOption = useCallback(
    (location: MapboxLocation | null) => {
      if (!location) return;

      setMarkerPosition(location.center);

      setSelectedLocation?.(
        location.feature_type === "custom"
          ? ({
              id: location.id,
              location_id: location.id,
              name: location.place_name,
              address: location.full_address || location.place_formatted,
              // geom: { type: "Point", coordinates: location.center },
            } as Location)
          : null
      );
      setViewState((prev) => ({
        ...prev,
        longitude: location.center[0],
        latitude: location.center[1],
        zoom: getZoomForFeature(location.feature_type),
      }));
    },
    [setSelectedLocation]
  );

  const currentPosition = useMemo(() => {
    return isTouchDevice
      ? [viewState.latitude!, viewState.longitude!]
      : markerPosition;
  }, [isTouchDevice, viewState.latitude, viewState.longitude, markerPosition]);

  return {
    mapRef,
    viewState,
    setViewState,
    markerPosition,
    setMarkerPosition,
    isTouchDevice,
    handleMove,
    handleMoveEnd,
    handleMapClick,
    handleMarkerDrag,
    currentPosition,
    handleMarkerClick,
    handleSelectOption,
    getLocations,
  } as const;
}
