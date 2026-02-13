export class ApiClientError extends Error {
  code?: string;
  fieldErrors?: Record<string, string>;
  status?: number;
  raw?: unknown;

  constructor(message: string, options?: {
    code?: string;
    fieldErrors?: Record<string, string>;
    status?: number;
    raw?: unknown;
  }) {
    super(message);
    this.name = 'ApiClientError';
    this.code = options?.code;
    this.fieldErrors = options?.fieldErrors;
    this.status = options?.status;
    this.raw = options?.raw;
  }
}

export async function parseApiError(
  response: Response,
  fallbackMessage: string
): Promise<{
  message: string;
  error?: string;
  code?: string;
  fieldErrors?: Record<string, string>;
  raw?: unknown;
}> {
  try {
    const payload = await response.json();
    const message = payload?.message || payload?.error || fallbackMessage;
    return {
      message,
      error: payload?.error,
      code: payload?.code,
      fieldErrors: payload?.fieldErrors,
      raw: payload,
    };
  } catch {
    return { message: fallbackMessage };
  }
}

export async function throwApiError(response: Response, fallbackMessage: string): Promise<never> {
  const parsed = await parseApiError(response, fallbackMessage);
  throw new ApiClientError(parsed.message, {
    code: parsed.code,
    fieldErrors: parsed.fieldErrors,
    status: response.status,
    raw: parsed.raw,
  });
}

