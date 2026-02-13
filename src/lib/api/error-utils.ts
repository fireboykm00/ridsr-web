import { z, ZodError } from 'zod';
import { errorResponse } from './response';
import { normalizeZodIssueMessage } from '@/lib/utils/zod';

export function mapZodErrorToFieldErrors(error: ZodError): Record<string, string> {
  const fieldErrors: Record<string, string> = {};

  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'form';
    if (!fieldErrors[path]) {
      fieldErrors[path] = normalizeZodIssueMessage(issue);
    }
  }

  return fieldErrors;
}

export function validationErrorResponse(error: ZodError, message: string = 'Validation failed') {
  return errorResponse(message, 400, error.issues[0]?.message || message, {
    code: 'VALIDATION_ERROR',
    fieldErrors: mapZodErrorToFieldErrors(error),
  });
}

export class ApiValidationError extends Error {
  status: number;
  code: string;
  errorTitle: string;
  fieldErrors?: Record<string, string>;

  constructor(options: {
    message: string;
    errorTitle?: string;
    code?: string;
    status?: number;
    fieldErrors?: Record<string, string>;
  }) {
    super(options.message);
    this.name = 'ApiValidationError';
    this.status = options.status ?? 400;
    this.code = options.code ?? 'VALIDATION_ERROR';
    this.errorTitle = options.errorTitle ?? 'Validation failed';
    this.fieldErrors = options.fieldErrors;
  }
}

export function isApiValidationError(error: unknown): error is ApiValidationError {
  return error instanceof ApiValidationError;
}

export function apiValidationErrorResponse(error: ApiValidationError) {
  return errorResponse(error.errorTitle, error.status, error.message, {
    code: error.code,
    fieldErrors: error.fieldErrors,
  });
}

export async function parseAndValidateBody<T>(
  request: Request,
  schema: z.ZodType<T>,
  options?: { message?: string }
): Promise<T> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ApiValidationError({
      errorTitle: 'Invalid JSON',
      message: 'Request body must be valid JSON.',
      code: 'INVALID_JSON',
      status: 400,
    });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    throw new ApiValidationError({
      errorTitle: 'Validation failed',
      message: options?.message || parsed.error.issues[0]?.message || 'Please correct the highlighted fields.',
      code: 'VALIDATION_ERROR',
      status: 400,
      fieldErrors: mapZodErrorToFieldErrors(parsed.error),
    });
  }

  return parsed.data;
}

export function serverErrorResponse(error: unknown, fallback: string, code: string = 'INTERNAL_ERROR') {
  const safeMessage = error instanceof Error ? error.message : fallback;
  return errorResponse(fallback, 500, process.env.NODE_ENV === 'development' ? safeMessage : fallback, { code });
}
