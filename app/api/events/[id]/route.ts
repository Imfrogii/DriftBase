import { createServerSupabaseClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { v4 as uuidv4 } from "uuid";
import { File } from "buffer";
import { Database, Event } from "@/lib/supabase/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();
  const { id } = params;

  try {
    const { data: event, error } = await supabase
      .from("events")
      .select(
        `
          *,
          location:locations!events_location_id_fkey(
          id,
          name,
          address,
          geom
          ),
          creator:users!events_created_by_fkey(id, display_name),
          registrations(
              *,
              user:users(id, display_name),
              car:cars(id, name, model, power)
          )
        `
      )
      .eq("slug", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json(event);
  } catch (error) {
    return NextResponse.json({ message: error }, { status: 500 });
  }
}

export const deleteFile = async (
  supabaseAdmin: SupabaseClient,
  image_url: string
) => {
  const { error: deleteError } = await supabaseAdmin.storage
    .from("event_images")
    .remove([image_url]);

  if (deleteError) {
    return NextResponse.json(
      { message: "DELETE_IMAGE_ERROR" },
      { status: 500 }
    );
  }
};

// TODO add validations
export async function PUT(request: NextRequest, params: { id: string }) {
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

    const { data: originalEvent } = await supabase
      .from("events")
      .select("image_url, registered_drivers, max_drivers")
      .eq("id", params.id)
      .eq("created_by", user.id)
      .single();

    if (!originalEvent) {
      return NextResponse.json({ message: "NOT_FOUND" }, { status: 404 });
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

    if (
      tempData.max_drivers &&
      originalEvent.registered_drivers > tempData.max_drivers
    ) {
      return NextResponse.json(
        { message: "MAX_DRIVERS_EXCEEDED" },
        { status: 400 }
      );
    }

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
            upsert: true,
          });

      if (uploadError) {
        console.log("Upload error:", uploadError);
        return NextResponse.json(
          { message: "UPLOAD_IMAGE_ERROR" },
          { status: 500 }
        );
      }
      if (originalEvent.image_url) {
        await deleteFile(supabaseAdmin, originalEvent.image_url);
      }

      tempData.image_url = uploadedFile.path;
    } else if (tempData.isDeleteImg && originalEvent.image_url) {
      await deleteFile(supabaseAdmin, originalEvent.image_url);
      tempData.image_url = null;
    }

    const eventData: Database["public"]["Tables"]["events"]["Update"] = {
      title: tempData.title,
      description: tempData.description,
      max_drivers: tempData.max_drivers,
      image_url: tempData.image_url,
    };

    if (originalEvent.registered_drivers === 0) {
      eventData.start_date = tempData.start_date;
      eventData.end_date = tempData.end_date;
      eventData.location_id = tempData.location_id;
      eventData.level = tempData.level;
      eventData.price = tempData.price;
      eventData.type = tempData.type;
      eventData.payment_type = tempData.payment_type;
    }

    const { data: event, error } = await supabase
      .from("events")
      .update({
        ...eventData,
      })
      .eq("id", params.id)
      .eq("created_by", user.id)
      .select()
      .single();

    if (!event) {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    if (error) {
      return NextResponse.json({ message: error.message }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
