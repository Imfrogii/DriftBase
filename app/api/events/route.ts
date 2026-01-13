import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Database, Event } from "@/lib/supabase/types";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import { File } from "buffer";
import { createClient } from "@supabase/supabase-js";

// export async function GET(request: NextRequest) {
//   const supabase = await createServerSupabaseClient();
//   const { searchParams } = new URL(request.url);
//   const sortBy = searchParams.get("sortBy") || "start_date";
//   const sortOrder =
//     searchParams.get("sortOrder") === SortOrder.DESC ? false : true;

//   try {
//     let query = supabase
//       .from("events")
// .select(
//   `
//   title,
//   slug,
//   description:substr(description,1,130),
//   image_url,
//   start_date,
//   end_date,
//   level,
//   type,
//   price,
//   max_drivers,
//   registered_drivers,
//   status,
//   creator:users!events_created_by_fkey(display_name, email),
//   location:locations!events_location_id_fkey(
//     name,
//     address,
//     geom
//   )
//   `,
//   { count: "exact" }
// )

//       // .eq("status", "approved")
//       // .gte("end_date", new Date().toISOString())
//       .order(sortBy, { ascending: sortOrder });

//     // Apply filters
//     const level = searchParams.getAll("level") as EventLevel[];
//     const type = searchParams.getAll("type") as EventType[];
//     const priceMin = searchParams.get("priceMin");
//     const priceMax = searchParams.get("priceMax");
//     const dateFrom = searchParams.get("dateFrom");
//     const dateTo = searchParams.get("dateTo");
//     const freePlaces = searchParams.get("freePlaces");

//     const size = parseInt(searchParams.get("size") || "30", 10);
//     const page = parseInt(searchParams.get("page") || "1", 10);

//     if (level.length) query = query.in("level", level);
//     if (type.length) query = query.in("type", type);
//     if (priceMin) query = query.gte("price", Number(priceMin));
//     if (priceMax) query = query.lte("price", Number(priceMax));
//     if (freePlaces) query = query.gte("free_places", Number(freePlaces));

//     if (dateFrom && dateTo) {
//       query = query.lte("start_date", dateTo).gte("end_date", dateFrom);
//     } else if (dateFrom) {
//       query = query.gte("end_date", dateFrom);
//     } else if (dateTo) {
//       query = query.lte("start_date", dateTo);
//     }

//     const from = (page - 1) * size;
//     const to = from + size - 1;

//     const {
//       data: events,
//       count: totalItems,
//       error,
//     } = await query.range(from, to);

//     if (error) {
//       return NextResponse.json({ message: error.message }, { status: 500 });
//     }

//     return NextResponse.json({ events, totalItems });
//   } catch (error) {
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }

/* TODO add BE validations */
export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  const supabaseAdmin = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    const formData = await request.formData();
    const tempData: Record<string, any> = {};

    formData.forEach((value, key) => {
      if (typeof value === "string") {
        try {
          tempData[key] = JSON.parse(value);
        } catch {
          tempData[key] = value;
        }
      } else {
        // File or Blob
        tempData[key] = value;
      }
    });

    if (tempData.image instanceof File) {
      const arrayBuffer = await tempData.image.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const optimizedBuffer = await sharp(buffer)
        .resize({ height: 600 })
        .webp({ quality: 80 })
        .toBuffer();

      const { data: uploadedFile, error: uploadError } =
        await supabaseAdmin.storage
          .from("event_images")
          .upload(`events/${uuidv4()}`, optimizedBuffer, {
            contentType: "image/webp",
          });

      if (uploadError) {
        console.log("Upload error:", uploadError);
        return NextResponse.json(
          { error: "UPLOAD_IMAGE_ERROR" },
          { status: 500 }
        );
      }

      tempData.image_url = uploadedFile.path;
      delete tempData.image;
    }

    const eventData: Database["public"]["Tables"]["events"]["Insert"] = {
      title: tempData.title,
      description: tempData.description,
      max_drivers: tempData.max_drivers,
      image_url: tempData.image_url,
      start_date: tempData.start_date,
      end_date: tempData.end_date,
      location_id: tempData.location_id,
      level: tempData.level,
      price: tempData.price,
      type: tempData.type,
      payment_type: tempData.payment_type,
      slug: tempData.slug,
      created_by: user.id,
    };

    const { data: event, error } = await supabase
      .from("events")
      .insert({
        ...eventData,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
