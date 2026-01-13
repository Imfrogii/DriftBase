"use server";
import {
  EventLevel,
  EventStatus,
  EventType,
  RegistrationStatus,
} from "../supabase/types";
import { FiltersType } from "@/components/common/LeftHandFilters/LeftHandFilters";
import { SortOrder } from "../helpers/filters";
import { createServerSupabaseClient } from "../supabase/server";

export type Filters = Partial<FiltersType> & Pagination;

export type Pagination = {
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
};

export async function getEvents(params?: Filters) {
  const supabase = await createServerSupabaseClient();
  const sortBy = params?.sortBy || "start_date";
  const sortOrder = params?.sortOrder === SortOrder.DESC ? false : true;

  try {
    let query = supabase
      .from("events")
      .select(
        `
          title,
          slug,
          description_short,
          image_url,
          start_date,
          end_date,
          level,
          type,
          price,
          max_drivers,
          registered_drivers,
          creator:users!events_created_by_fkey(display_name),
          location:locations!events_location_id_fkey(
            name
          )
         `,
        { count: "exact" }
      )

      .eq("status", EventStatus.ACTIVE)
      .gte("end_date", new Date().toISOString())
      .order(sortBy, { ascending: sortOrder });

    // Apply filters
    const level = (params?.level || []) as EventLevel[];
    const type = (params?.type || []) as EventType[];
    const priceMin = params?.priceMin;
    const priceMax = params?.priceMax;
    const dateFrom = params?.dateFrom;
    const dateTo = params?.dateTo;
    const freePlaces = params?.freePlaces;

    const size = params?.size || 30;
    const page = params?.page || 1;

    if (level.length) query = query.in("level", level);
    if (type.length) query = query.in("type", type);
    if (priceMin) query = query.gte("price", Number(priceMin));
    if (priceMax) query = query.lte("price", Number(priceMax));
    if (freePlaces) query = query.gte("free_places", Number(freePlaces));

    if (dateFrom && dateTo) {
      query = query.lte("start_date", dateTo).gte("end_date", dateFrom);
    } else if (dateFrom) {
      query = query.gte("end_date", dateFrom);
    } else if (dateTo) {
      query = query.lte("start_date", dateTo);
    }

    const from = (page - 1) * size;
    const to = from + size - 1;

    const {
      data: events,
      count: totalItems,
      error,
    } = await query.range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return { events, totalItems: totalItems || 0 };
  } catch (error) {
    throw error;
  }
}

export async function getEvent(slug: string) {
  try {
    const supabase = await createServerSupabaseClient();

    const { data: event, error } = await supabase
      .from("events")
      .select(
        `
            id,
            title,
            slug,
            description,
            image_url,
            start_date,
            end_date,
            level,
            type,
            price,
            max_drivers,
            registered_drivers,
            created_by,
            status,
            payment_type,
            location:locations!events_location_id_fkey(
              id,
              name,
              address,
              geom
            ),  
            creator:users!events_created_by_fkey(display_name),
            registrations(
                id,
                status,
                user:users(id, display_name),
                car:cars(name, model, power, level)
            )
          `
      )
      .eq("slug", slug)
      .in("registrations.status", [
        RegistrationStatus.ACTIVE,
        RegistrationStatus.PAID,
        RegistrationStatus.PAYMENT_INITIATED,
      ])
      .order("created_at", {
        ascending: false,
        foreignTable: "registrations",
      })
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return event;
  } catch (error) {
    throw error;
  }
}

export async function getMyEvents({
  page,
  size,
  userId,
}: {
  page: number;
  size: number;
  userId: string;
}) {
  try {
    const supabase = await createServerSupabaseClient();

    const sortBy = "end_date";
    const from = (page - 1) * size;
    const to = from + size - 1;

    if (!userId) {
      return {};
    }

    const query = supabase
      .from("events")
      .select(
        `
          id,
          title,
          slug,
          description,
          image_url,
          start_date,
          end_date,
          level,
          type,
          price,
          max_drivers,
          registered_drivers,
          status,
          creator:users!events_created_by_fkey(display_name),
          location:locations!events_location_id_fkey(
            name
          )
        `,
        { count: "exact" }
      )
      .eq("created_by", userId)
      .order(sortBy, { ascending: true });

    const {
      data: events,
      count: totalItems,
      error,
    } = await query.range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return { events, totalItems };
  } catch (error) {
    throw error;
  }
}
