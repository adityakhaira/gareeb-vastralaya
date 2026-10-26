import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/store-data';

export async function POST(request) {
  try {
    const body = await request.json();
    const idempotencyKey = body.idempotencyKey || request.headers.get('x-idempotency-key') || undefined;
    const result = await createOrder(body, { idempotencyKey });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Checkout failed.' }, { status: 400 });
  }
}
