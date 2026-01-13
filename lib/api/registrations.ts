"use server";
import { add, sub } from "date-fns";
import { createServerSupabaseClient } from "../supabase/server";
import { RegistrationStatus } from "../supabase/types";
import { createClient } from "@supabase/supabase-js";
import { RegistrationCheckInError } from "../types/errors";

export async function getMyRegistrations({
  page,
  size,
  userId,
}: {
  page: number;
  size: number;
  userId: string;
}) {
  try {
    // TODO переносить отмененные регистрации кроном в другую таблицу
    // TODO чекнуть, работает ли
    const supabase = await createServerSupabaseClient();

    const sortBy = "end_date";
    const from = (page - 1) * size;
    const to = from + size - 1;

    if (!userId) {
      return {};
    }

    const {
      data: registrations,
      count: totalItems,
      error,
    } = await supabase
      .from("registrations")
      .select(
        `
          id,
          event_id,
          car_id,
          status,
          event:events!registrations_event_id_fkey (
            start_date,
            status
          )
      `,
        { count: "exact" }
      )
      .eq("user_id", userId)
      .in("status", [RegistrationStatus.ACTIVE, RegistrationStatus.PAID])
      .gte("event.end_date", add(new Date(), { hours: 1 }).toISOString())
      .order("start_date", {
        ascending: false,
        nullsFirst: false,
        referencedTable: "events",
      })
      .range(from, to);

    if (!registrations?.length) {
      return { registrations: [], totalItems: 0 };
    }

    if (error) {
      throw error;
    }

    const eventIds = [...new Set(registrations.map((r) => r.event_id))];
    const carIds = [...new Set(registrations.map((r) => r.car_id))];

    const [eventsRes, carsRes] = await Promise.all([
      supabase
        .from("events")
        .select(
          `
            id, title, description, level, type, price, slug,
            start_date, end_date, image_url, status,
            registered_drivers, max_drivers,
            location:locations!events_location_id_fkey (id, name, address),
            creator:users!events_created_by_fkey (id, display_name, email)
          `
        )
        .in("id", eventIds),

      carIds.length
        ? supabase
            .from("cars")
            .select("id, name, model, level, power")
            .in("id", carIds)
        : Promise.resolve({ data: [], error: null }),
    ]);

    if (eventsRes.error) throw eventsRes.error;
    if (carsRes.error) throw carsRes.error;

    const eventsMap = Object.fromEntries(eventsRes.data.map((e) => [e.id, e]));
    const carsMap = Object.fromEntries(
      (carsRes.data ?? []).map((c) => [c.id, c])
    );

    const result = registrations.map((reg) => ({
      ...reg,
      event: eventsMap[reg.event_id] ?? null,
      car: reg.car_id ? carsMap[reg.car_id] ?? null : null,
    }));

    // const eventIds = registrations.map((registration) => registration.event_id);

    // const { data: events, error: eventsError } = await supabase
    //   .from("events")
    //   .select(
    //     `
    // id,
    //       title,
    //       description,
    //       level,
    //       type,
    //       price,
    //       slug,
    //       start_date,
    //       end_date,
    //       image_url,
    //       status,
    //       registered_drivers,
    //       max_drivers,
    // location:locations!events_location_id_fkey (
    //           id,
    //           name,
    //           address,
    //           latitude,
    //           longitude
    //       ),
    // creator:users!events_created_by_fkey(id, display_name, email)
    //     `
    //   )
    //   .in("id", eventIds);

    // if (eventsError) {
    //   throw new Error(eventsError.message);
    // }

    // const carIds = registrations.map((registration) => registration.car_id);
    // const { data: cars, error: carsError } = await supabase
    //   .from("cars")
    //   .select("id, make, model, year")
    //   .in("id", carIds);

    // if (carsError) {
    //   throw new Error(carsError.message);
    // }

    // const result = registrations
    //   .map((registration) => ({
    //     ...registration,
    //     event: events?.find((e) => e.id === registration.event_id) || null,
    //     car: cars.find((c) => c.id === registration.car_id) || null,
    //   }))
    //   .sort(
    //     (a, b) =>
    //       // TODO fix sorting to be from props
    //       new Date(a.event?.start_date || 0).getTime() -
    //       new Date(b.event?.start_date || 0).getTime()
    //   );

    return { registrations: result, totalItems: totalItems ?? 0 };
  } catch (error) {
    throw error;
  }
}

export async function checkInWithCode(code: string) {
  const supabase = await createServerSupabaseClient();

  // Получаем user_id из claims
  const { data: claims, error: authError } = await supabase.auth.getClaims();
  const userId = claims?.claims?.user_metadata?.sub;

  if (authError || !userId) {
    throw new Error("UNAUTHORIZED");
  }

  // Админ-клиент для обновления (чтобы обойти RLS)
  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  const parsedCode = parseInt(code, 10);
  if (isNaN(parsedCode)) {
    throw new Error(RegistrationCheckInError.NOT_FOUND);
  }

  // Получаем код с вложенными данными
  const { data: reg, error } = await supabase
    .from("registration_codes")
    .select(
      `
      expires_at,
      registration:registrations (
        id,
        attended,
        status,
        events:events (
          created_by,
          start_date,
          end_date
        )
      )
    `
    )
    .eq("code", parsedCode)
    .single();

  if (!reg || error) {
    throw new Error(RegistrationCheckInError.NOT_FOUND);
  }

  const registration = reg.registration;
  const event = registration.events;

  // Все проверки
  if (registration.attended) {
    throw new Error(RegistrationCheckInError.ALREADY_CHECKED_IN);
  }

  if (event.created_by !== userId) {
    throw new Error(RegistrationCheckInError.FORBIDDEN);
  }

  if (
    ![RegistrationStatus.ACTIVE, RegistrationStatus.PAID].includes(
      registration.status
    )
  ) {
    throw new Error(RegistrationCheckInError.NOT_PAID);
  }

  if (new Date(reg.expires_at) < new Date()) {
    throw new Error(RegistrationCheckInError.CODE_EXPIRED);
  }

  if (add(new Date(event.end_date), { hours: 1 }) < new Date()) {
    throw new Error(RegistrationCheckInError.EVENT_ALREADY_ENDED);
  }

  if (sub(new Date(event.start_date), { hours: 1 }) > new Date()) {
    throw new Error(RegistrationCheckInError.EVENT_NOT_STARTED);
  }

  // Обновляем посещение
  const { data, error: updateError } = await supabaseAdmin
    .from("registrations")
    .update({ attended: true })
    .eq("id", registration.id)
    .select()
    .single();

  if (updateError) {
    throw updateError;
  }

  return { registration: data };
}
