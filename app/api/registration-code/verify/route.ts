// app/api/registration-code/verify/route.ts

import { checkInWithCode } from "@/lib/api/registrations";
import { RegistrationCheckInError } from "@/lib/types/errors";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(request: NextRequest) {
  try {
    const { code } = await request.json();

    const result = await checkInWithCode(code);

    return NextResponse.json(result);
  } catch (error: any) {
    const message = error.message || "Internal Server Error";

    const statusMap: Record<string, number> = {
      UNAUTHORIZED: 401,
      [RegistrationCheckInError.ALREADY_CHECKED_IN]: 400,
      [RegistrationCheckInError.NOT_PAID]: 400,
      [RegistrationCheckInError.CODE_EXPIRED]: 400,
      [RegistrationCheckInError.EVENT_ALREADY_ENDED]: 400,
      [RegistrationCheckInError.EVENT_NOT_STARTED]: 400,
      [RegistrationCheckInError.FORBIDDEN]: 403,
      [RegistrationCheckInError.NOT_FOUND]: 404,
    };

    const status = statusMap[message] || 500;

    return NextResponse.json({ message }, { status });
  }
}
