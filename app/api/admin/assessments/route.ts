import { NextResponse } from 'next/server';
import { getAssessments } from '@/lib/data';

export async function GET() {
  return NextResponse.json(getAssessments());
}
