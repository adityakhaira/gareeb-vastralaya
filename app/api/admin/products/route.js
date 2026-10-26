import { NextResponse } from 'next/server';
import { createProduct } from '@/lib/store-data';
import { getAdminSessionFromRequest } from '@/lib/auth';

export async function POST(request) {
  const session = getAdminSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const payload = await request.json();

  if (!payload.name || !payload.slug || !payload.category) {
    return NextResponse.json({ error: 'Name, slug and category are required.' }, { status: 400 });
  }

  const pricePaise = Number(payload.pricePaise ?? (payload.price ?? 0) * 100);

  const result = await createProduct({
    name: payload.name,
    slug: payload.slug,
    category: payload.category,
    description: payload.description || '',
    status: payload.status || 'published',
    featured: Boolean(payload.featured),
    variants: [{
      sku: payload.sku || `${payload.slug}-sku`,
      pricePaise,
      inventory: { availableQuantity: 10, lowStockThreshold: 5 }
    }]
  });

  return NextResponse.json({ ok: true, product: result });
}
