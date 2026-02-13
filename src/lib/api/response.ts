import { NextResponse } from 'next/server';
import { ApiResponse } from '@/types';

export function successResponse<T>(data: T, status: number = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data
  }, { status });
}

export function errorResponse(
  error: string,
  status: number = 500,
  message?: string,
  options?: {
    code?: string;
    fieldErrors?: Record<string, string>;
  }
): NextResponse<ApiResponse<null>> {
  return NextResponse.json({
    success: false,
    error,
    message: message || error,
    code: options?.code,
    fieldErrors: options?.fieldErrors,
  }, { status });
}
