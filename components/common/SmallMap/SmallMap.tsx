"use client";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  MapRef,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useMemo, useRef, useState } from "react";
import type { Location } from "@/lib/types/location";
import EventLocationSVG from "@/components/icons/EventLocationIcon";
import LocationInfoPanel from "../LocationInfoPanel/LocationInfoPanel";
import { ViewEventsMapModal } from "../MapModal/ViewEventsMapModal/ViewEventsMapModal";
import { getLatLng } from "@/lib/helpers/geo";

interface SmallMapProps {
  selectedLocation: Location;
}

export default function SmallMap({ selectedLocation }: SmallMapProps) {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  const onCloseMapModal = useCallback(() => {
    setIsMapModalOpen(false);
  }, []);

  const markerInfo = useMemo(
    () => getLatLng(selectedLocation.geom),
    [selectedLocation]
  );

  const initialViewState = useMemo(
    () => ({
      ...markerInfo,
      zoom: 8,
    }),
    [markerInfo]
  );

  const mapRef = useRef<MapRef>(null);

  return (
    <>
      <Map
        ref={mapRef}
        initialViewState={initialViewState}
        style={{ width: "100%", height: "300px" }}
        mapStyle="https://api.maptiler.com/maps/01984cbc-fe5d-76ed-8656-eac8dfd8ec1d/style.json?key=zCfR02amxyJq9aMmU5Iy"
      >
        <NavigationControl position="top-right" />
        <GeolocateControl position="top-right" />
        <LocationInfoPanel
          mainText={selectedLocation.name}
          subText={selectedLocation.address}
          onViewLargerMap={() => setIsMapModalOpen(true)}
          {...markerInfo}
        />

        <Marker {...markerInfo}>
          <EventLocationSVG />
        </Marker>
      </Map>
      <ViewEventsMapModal
        open={isMapModalOpen}
        onClose={onCloseMapModal}
        initialSelectedLocation={selectedLocation}
      />
    </>
  );
}
