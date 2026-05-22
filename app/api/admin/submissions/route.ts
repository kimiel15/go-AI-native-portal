import { NextResponse } from 'next/server';
import { getSubmissions } from '@/lib/data';

export async function GET() {
  return NextResponse.json(await getSubmissions());
}
