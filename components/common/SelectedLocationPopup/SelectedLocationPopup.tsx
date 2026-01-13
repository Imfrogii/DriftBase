"use client";
import { Popup } from "react-map-gl/maplibre";
import { LocationWithEvents } from "@/lib/types/location";
import { BaseMapItem } from "../MapModal/types";
import styles from "./SelectedLocationPopup.module.scss";
import { useBulkEvents } from "@/lib/queries/events";
import { EventWithCreator } from "@/lib/supabase/types";
import SmallEventSkeleton from "../Skeletons/SmallEventSkeleton/SmallEventSkeleton";
import { useLocale, useTranslations } from "next-intl";
import EventRowCard from "../EventRowCard/EventRowCard";

type SelectedLocationPopupProps = {
  locationWithEvents: BaseMapItem<LocationWithEvents>;
};

export function SelectedLocationPopup({
  locationWithEvents,
}: SelectedLocationPopupProps) {
  const locale = useLocale();
  const t = useTranslations();
  const { data: locationEvents, isLoading } = useBulkEvents(
    locationWithEvents.payload.event_ids || []
  );
  return (
    <Popup
      anchor="bottom"
      longitude={Number(locationWithEvents.longitude)}
      latitude={Number(locationWithEvents.latitude)}
      className={styles.selectedLocationPopup}
      closeButton={false}
      closeOnMove={false}
      closeOnClick={false}
    >
      {/* TODO probably need to create via Clusters */}
      {isLoading
        ? Array.from(
            { length: locationWithEvents.payload.event_count },
            (_, i) => <SmallEventSkeleton key={i} />
          )
        : locationEvents?.map((event: EventWithCreator) => (
            <EventRowCard
              key={event.slug}
              locale={locale}
              t={t}
              event={{
                ...event,
                location: { name: locationWithEvents.payload.name },
              }}
            />
          ))}
    </Popup>
  );
}
