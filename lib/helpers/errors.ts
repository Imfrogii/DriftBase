const COMMON_ERRORS = {
  NOT_FOUND: { status: 404 },
  ALREADY_DELETED: { status: 410 },
  ALREADY_EXISTS: { status: 409 },
  INVALID_STATE: { status: 400 },
  IN_USE: { status: 400 },
  FORBIDDEN: { status: 403 },
} as const;

type CommonErrorCode = keyof typeof COMMON_ERRORS;

export function handleCommonError(
  error: any,
  data: any = null,
  specificErrors: Record<string, { status: number }> = {}
) {
  // TODO add
  if (!error) {
    // 1. RLS / not found / already deleted
    if (data === null || data === false) {
      return { code: "NOT_FOUND", ...COMMON_ERRORS.NOT_FOUND };
    }
    return null;
  }

  // 2. Custom errors from Supabase functions
  if (error.code === "P0001") {
    const code = error.message as CommonErrorCode;
    if (specificErrors[code]) {
      return { code, ...specificErrors[code] };
    }
    return COMMON_ERRORS[code]
      ? { code, ...COMMON_ERRORS[code] }
      : { code: "UNKNOWN", status: 500 };
  }

  // 3. Unique violation
  if (error.code === "23505") {
    return { code: "ALREADY_EXISTS", ...COMMON_ERRORS.ALREADY_EXISTS };
  }

  // 4. Unexpected
  return { code: "INTERNAL", status: 500 };
}
