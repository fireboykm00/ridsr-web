import { NextRequest, NextResponse } from 'next/server';

export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      console.error('API Error:', error);
      
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
      }
      
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}
