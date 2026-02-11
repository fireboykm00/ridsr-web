import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

export function withValidation(schema: z.ZodSchema) {
  return (handler: (req: NextRequest, data: any) => Promise<NextResponse>) => {
    return async (req: NextRequest) => {
      try {
        const body = await req.json();
        const result = schema.safeParse(body);
        
        if (!result.success) {
          return NextResponse.json(
            { error: 'Validation failed', details: result.error.errors },
            { status: 400 }
          );
        }
        
        return await handler(req, result.data);
      } catch (error) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
    };
  };
}
