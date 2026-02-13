import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { mapZodErrorToFieldErrors } from '@/lib/api/error-utils';

export function withValidation<T>(schema: z.ZodSchema<T>) {
  return (handler: (req: NextRequest, data: T) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      try {
        const body = await req.json();
        const result = schema.safeParse(body);
        
        if (!result.success) {
          return NextResponse.json(
            {
              success: false,
              error: 'Validation failed',
              message: result.error.issues[0]?.message || 'Please correct the highlighted fields.',
              code: 'VALIDATION_ERROR',
              fieldErrors: mapZodErrorToFieldErrors(result.error),
            },
            { status: 400 }
          );
        }
        
        return await handler(req, result.data);
      } catch {
        return NextResponse.json({
          success: false,
          error: 'Invalid JSON',
          message: 'Request body must be valid JSON.',
          code: 'INVALID_JSON',
        }, { status: 400 });
      }
    };
  };
}
