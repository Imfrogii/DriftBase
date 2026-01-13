"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  IconButton,
  Alert,
  Card,
  CardContent,
  Paper,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  Popup,
} from "react-map-gl/maplibre";
import type { MapRef, ViewState } from "react-map-gl/maplibre";
import EventLocationSVG from "@/components/icons/EventLocationIcon";
import "maplibre-gl/dist/maplibre-gl.css";
import styles from "./BaseMapModal.module.scss";
import LocationSearch, {
  MapboxLocation,
} from "../LocationSearch/LocationSearch";
import { Location, LocationWithEvents } from "@/lib/types/location";
import { Event } from "@/lib/supabase/types";
import { BaseMapItem, isLocationWithEvents } from "./types";
import classNames from "classnames";

export const INITIAL_VIEW_STATE: ViewState = {
  longitude: 21.0122,
  latitude: 52.2297,
  zoom: 10,
  bearing: 0,
  pitch: 0,
  padding: { top: 0, bottom: 0, left: 0, right: 0 },
};

export function BaseMapModal({
  open,
  onClose,
  title = "Map",
  mapRef,
  viewState,
  onMove,
  onMoveEnd,
  onMapClick,
  items = [],
  onMarkerClick,
  mapLayers,
  contentLayers,
  extraLayers,
  error,
  clearError,
  onLoad,
  onSelectOption,
  isViewPage = false,
  renderSelectedLocationPopup,
  Header,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  mapRef: React.RefObject<MapRef>;
  viewState: ViewState;
  onMove?: (evt: { viewState: ViewState }) => void;
  onMoveEnd?: () => void;
  onMapClick?: (evt: any) => void;
  items?: BaseMapItem[];
  onMarkerClick?: (e: any, item: BaseMapItem) => void;
  mapLayers?: React.ReactNode;
  contentLayers?: React.ReactNode;
  extraLayers?: React.ReactNode;
  error?: string | null;
  clearError?: () => void;
  onLoad?: () => void;
  onSelectOption?: (location: MapboxLocation | null) => void;
  isViewPage?: boolean;
  renderSelectedLocationPopup?: (
    locationWithEvents: BaseMapItem<LocationWithEvents>
  ) => JSX.Element;
  Header?: JSX.Element;
}) {
  const renderSelectedPopup = (
    it: BaseMapItem<Location | LocationWithEvents>
  ) => {
    if (!it.selected) return null;

    if (isLocationWithEvents(it)) {
      return renderSelectedLocationPopup && renderSelectedLocationPopup(it);
    }

    const newPayload = it.payload as Location;
    return (
      <Popup
        anchor="bottom"
        longitude={Number(it.longitude)}
        latitude={Number(it.latitude)}
        closeButton={false}
        offset={[0, -42]}
      >
        <div>
          <Typography variant="subtitle1">{newPayload.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {newPayload.address}
          </Typography>
        </div>
      </Popup>
    );
  };

  return (
    // TODO make dialog look the same
    <Dialog open={open} onClose={onClose} fullScreen maxWidth={false}>
      {Header ? (
        Header
      ) : (
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pb: 1,
          }}
        >
          <Typography variant="h6">{title}</Typography>

          <IconButton onClick={onClose}>
            <Close />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent
        sx={{
          p: 0,
          position: "relative",
          flex: 1,
          display: "flex",
          flexDirection: "row-reverse",
        }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={clearError}
            sx={{
              position: "absolute",
              top: 16,
              left: 16,
              right: 16,
              zIndex: 1000,
            }}
          >
            {error}
          </Alert>
        )}
        {!isViewPage && (
          <div className={styles.searchContainer}>
            <LocationSearch onSelect={onSelectOption} />
          </div>
        )}

        <Map
          ref={mapRef}
          {...viewState}
          onMove={onMove}
          onMoveEnd={onMoveEnd}
          onZoomEnd={onMoveEnd}
          onClick={onMapClick}
          style={{ width: "100%", height: "100%" }}
          onLoad={onLoad}
          mapStyle={
            "https://api.maptiler.com/maps/01984cbc-fe5d-76ed-8656-eac8dfd8ec1d/style.json?key=zCfR02amxyJq9aMmU5Iy"
          }
        >
          <NavigationControl position="bottom-right" />
          <GeolocateControl position="bottom-right" />

          {items.map((it) => (
            <React.Fragment key={it.id}>
              <Marker
                key={it.id}
                longitude={it.longitude}
                latitude={it.latitude}
                onClick={(e) => onMarkerClick?.(e, it)}
                anchor="bottom"
              >
                <div
                  className={classNames(styles.marker, {
                    [styles.selectedMarker]: it.selected,
                  })}
                >
                  {it.marker ?? <EventLocationSVG />}
                </div>
              </Marker>
              {renderSelectedPopup(it)}
            </React.Fragment>
          ))}
          {mapLayers}
        </Map>
        {contentLayers}
      </DialogContent>
      {extraLayers}
    </Dialog>
  );
}
