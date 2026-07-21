import { NextResponse } from 'next/server';
import { getPortrait, getJourneys, getLibrary, getChats } from '@/lib/db';

export async function GET() {
  try {
    const [portrait, journeys, library, recentChats] = await Promise.all([
      getPortrait(),
      getJourneys(),
      getLibrary(),
      getChats(20),
    ]);
    return NextResponse.json({ portrait, journeys, library, recentChats });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}
