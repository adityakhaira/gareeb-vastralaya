import { NextResponse } from 'next/server';
import { updateStoreSettings } from '@/lib/store-config';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function POST(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  await updateStoreSettings(body);
  return NextResponse.json({ ok: true });
}
