import { NextResponse } from 'next/server';
import { getTeams } from '@/lib/data';

export async function GET() {
  return NextResponse.json(await getTeams());
}
