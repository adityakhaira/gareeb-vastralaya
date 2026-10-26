import fs from 'node:fs/promises';
import path from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';
import { createOrder, readStoreData, writeStoreData } from '../lib/store-data';

const storePath = path.join(process.cwd(), 'data', 'store-data.json');
let baselineStore;

beforeEach(async () => {
  baselineStore = await readStoreData();
  await writeStoreData(JSON.parse(JSON.stringify(baselineStore, null, 2)));
});

describe('checkout validation', () => {
  it('recalculates totals on the server and reserves stock', async () => {
    const result = await createOrder({
      customer: {
        name: 'Test Customer',
        phone: '9999999999',
        address: 'Jhansi',
        city: 'Jhansi',
        state: 'UP',
        postalCode: '284001'
      },
      items: [{ sku: 'GV-SR-001', quantity: 1 }],
      totalPaise: 999,
      discountPaise: 0,
      shippingPaise: 0,
      taxPaise: 0,
      paymentStatus: 'pending'
    });

    expect(result.order.totalPaise).toBe(249900);
    expect(result.order.items[0].lineTotalPaise).toBe(249900);

    const updated = await readStoreData();
    const variant = updated.products.find((product) => product.slug === 'royal-peach-saree')?.variants[0];
    expect(variant.inventory.availableQuantity).toBe(11);
  });

  it('rejects stock shortages and client-tampered totals', async () => {
    await expect(
      createOrder({
        customer: {
          name: 'Test Customer',
          phone: '9999999999',
          address: 'Jhansi'
        },
        items: [{ sku: 'GV-SR-001', quantity: 99 }],
        totalPaise: 1,
        paymentStatus: 'pending'
      })
    ).rejects.toThrow(/Insufficient stock/i);
  });
});
