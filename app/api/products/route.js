import { NextResponse } from 'next/server';
import { readStoreData } from '@/lib/store-data';

export async function GET() {
  const store = await readStoreData();
  return NextResponse.json(store.products);
}
