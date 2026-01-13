import { EventStatus } from "../supabase/types";

export const getImageUrl = (imageUrl?: string | null, status?: EventStatus) =>
  status === EventStatus.CANCELLED
    ? "/cancelled.png"
    : imageUrl
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/event_images/${imageUrl}`
    : "https://drifting.hu/wp-content/uploads/DMEC24-R5-Event-Poster-V5-2000x1333.jpg";
