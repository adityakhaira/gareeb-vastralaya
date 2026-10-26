import { promises as fs } from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const storeFile = path.join(dataDir, 'store-data.json');
const idempotencyFile = path.join(dataDir, 'order-idempotency.json');

const defaultProducts = [
  {
    id: 'p-1',
    name: 'Royal Peach Saree',
    slug: 'royal-peach-saree',
    category: 'Sarees',
    description: 'A festive saree with graceful drape and soft shimmer for celebrations.',
    status: 'published',
    featured: true,
    seoTitle: 'Royal Peach Saree | Gareeb Vastarlaya',
    seoDescription: 'Explore the Royal Peach Saree in Jhansi and shop festive ready-to-wear styles.',
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=900&q=80', altText: 'Royal Peach Saree' }],
    variants: [{
      id: 'v-1', sku: 'GV-SR-001', barcode: null, attributes: { colour: 'Peach', fabric: 'Silk blend' }, pricePaise: 249900, compareAtPricePaise: 289900, active: true, inventory: { availableQuantity: 12, lowStockThreshold: 5 }
    }]
  },
  {
    id: 'p-2',
    name: 'Emerald Bridal Lehenga',
    slug: 'emerald-bridal-lehenga',
    category: 'Lehengas',
    description: 'A premium lehenga with a rich emerald finish for weddings and festive gatherings.',
    status: 'published',
    featured: true,
    seoTitle: 'Emerald Bridal Lehenga | Gareeb Vastarlaya',
    seoDescription: 'Shop emerald bridal lehengas in Jhansi with elegant textures and festive-ready silhouettes.',
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', altText: 'Emerald Bridal Lehenga' }],
    variants: [{ id: 'v-2', sku: 'GV-LH-101', barcode: null, attributes: { colour: 'Emerald', fabric: 'Net with embroidery' }, pricePaise: 329900, compareAtPricePaise: 389900, active: true, inventory: { availableQuantity: 7, lowStockThreshold: 4 } }]
  },
  {
    id: 'p-3',
    name: 'Classic Maroon Saree',
    slug: 'classic-maroon-saree',
    category: 'Sarees',
    description: 'Classic maroon styling with elegant texture for everyday elegance and family functions.',
    status: 'published',
    featured: false,
    seoTitle: 'Classic Maroon Saree | Gareeb Vastarlaya',
    seoDescription: 'Classic maroon saree for everyday elegance and family events in Jhansi.',
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80', altText: 'Classic Maroon Saree' }],
    variants: [{ id: 'v-3', sku: 'GV-SR-015', barcode: null, attributes: { colour: 'Maroon', fabric: 'Cotton silk' }, pricePaise: 189900, compareAtPricePaise: 229900, active: true, inventory: { availableQuantity: 18, lowStockThreshold: 5 } }]
  },
  {
    id: 'p-4',
    name: 'Festive Gold Lehenga',
    slug: 'festive-gold-lehenga',
    category: 'Lehengas',
    description: 'A festive gold lehenga suited for gatherings, puja, and family celebrations.',
    status: 'published',
    featured: true,
    seoTitle: 'Festive Gold Lehenga | Gareeb Vastarlaya',
    seoDescription: 'Explore festive gold lehengas in Jhansi with elegant detailing and great value.',
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=80', altText: 'Festive Gold Lehenga' }],
    variants: [{ id: 'v-4', sku: 'GV-LH-230', barcode: null, attributes: { colour: 'Gold', fabric: 'Georgette' }, pricePaise: 279900, compareAtPricePaise: 329900, active: true, inventory: { availableQuantity: 9, lowStockThreshold: 4 } }]
  }
];

const defaultStoreData = {
  products: defaultProducts,
  categories: ['Sarees', 'Lehengas', 'Festive Wear', 'Wedding Wear'],
  orders: []
};

const orderIdempotency = new Map();

function buildOrderReference() {
  return `GV-${Date.now().toString().slice(-6)}`;
}

async function readJsonFile(filePath, fallback) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

export async function readStoreData() {
  try {
    const parsed = await readJsonFile(storeFile, defaultStoreData);
    return parsed && parsed.products ? parsed : defaultStoreData;
  } catch {
    return defaultStoreData;
  }
}

export async function writeStoreData(next) {
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(storeFile, JSON.stringify(next, null, 2));
}

async function readIdempotencyMap() {
  const persisted = await readJsonFile(idempotencyFile, {});
  Object.entries(persisted || {}).forEach(([key, value]) => {
    orderIdempotency.set(key, value);
  });
  return orderIdempotency;
}

async function persistIdempotencyMap() {
  await fs.mkdir(dataDir, { recursive: true });
  const snapshot = Object.fromEntries(orderIdempotency.entries());
  await fs.writeFile(idempotencyFile, JSON.stringify(snapshot, null, 2));
}

export async function getProductsForPublicPage() {
  const store = await readStoreData();
  return store.products.filter((product) => product.status === 'published');
}

export async function getProductsByCategory(category) {
  const store = await readStoreData();
  return store.products.filter((product) => product.status === 'published' && product.category === category);
}

export async function getProductsBySearch(query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return getProductsForPublicPage();

  const store = await readStoreData();
  return store.products.filter((product) => product.status === 'published' && `${product.name} ${product.category} ${product.description}`.toLowerCase().includes(q));
}

export async function getProductBySlug(slug) {
  const products = await getProductsForPublicPage();
  return products.find((product) => product.slug === slug) || null;
}

export async function getRelatedProducts(product) {
  const products = await getProductsForPublicPage();
  return products.filter((item) => item.id !== product.id && item.category === product.category).slice(0, 3);
}

export async function createProduct(input) {
  const store = await readStoreData();
  const product = {
    id: `p-${Date.now()}`,
    name: input.name,
    slug: input.slug,
    category: input.category,
    description: input.description || '',
    status: input.status || 'published',
    featured: Boolean(input.featured),
    seoTitle: input.seoTitle || input.name,
    seoDescription: input.seoDescription || input.description || '',
    images: [{ imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80', altText: input.name }],
    variants: [
      {
        id: `v-${Date.now()}`,
        sku: input.variants?.[0]?.sku || `${input.slug}-sku`,
        barcode: input.variants?.[0]?.barcode || null,
        attributes: input.variants?.[0]?.attributes || {},
        pricePaise: Number(input.variants?.[0]?.pricePaise || 0),
        compareAtPricePaise: input.variants?.[0]?.compareAtPricePaise || null,
        active: true,
        inventory: input.variants?.[0]?.inventory || { availableQuantity: 10, lowStockThreshold: 5 }
      }
    ]
  };

  store.products.push(product);
  await writeStoreData(store);
  return product;
}

export async function createOrder(payload = {}, options = {}) {
  const { idempotencyKey } = options;
  if (idempotencyKey) {
    await readIdempotencyMap();
    const existing = orderIdempotency.get(idempotencyKey);
    if (existing) {
      return existing;
    }
  }

  const store = await readStoreData();
  const customer = payload.customer || {};
  const rawItems = Array.isArray(payload.items) ? payload.items : [];

  if (!rawItems.length) {
    throw new Error('Cart is empty.');
  }

  const itemEntries = new Map();
  for (const raw of rawItems) {
    const sku = String(raw.sku || '').trim();
    const quantity = Number(raw.quantity || 1);
    const variantMatch = store.products.flatMap((product) => (product.variants || []).map((variant) => ({ product, variant }))).find((entry) => entry.variant.sku === sku);

    if (!sku || !variantMatch || !variantMatch.variant.active) {
      throw new Error(`Invalid product SKU: ${sku || 'unknown'}`);
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      throw new Error(`Invalid quantity for ${sku}`);
    }

    const availableQuantity = Number(variantMatch.variant.inventory?.availableQuantity ?? 0);
    if (availableQuantity < quantity) {
      throw new Error(`Insufficient stock for ${variantMatch.product.name}.`);
    }

    const current = itemEntries.get(sku) || { sku, quantity: 0, productName: variantMatch.product.name, unitPricePaise: Number(variantMatch.variant.pricePaise || 0), variantId: variantMatch.variant.id, productId: variantMatch.product.id };
    current.quantity += quantity;
    itemEntries.set(sku, current);
  }

  const orderItems = Array.from(itemEntries.values()).map((item) => ({
    sku: item.sku,
    name: item.productName,
    quantity: item.quantity,
    pricePaise: item.unitPricePaise,
    productId: item.productId,
    variantId: item.variantId,
    lineTotalPaise: item.unitPricePaise * item.quantity
  }));

  const subtotalPaise = orderItems.reduce((total, item) => total + item.lineTotalPaise, 0);
  const shippingPaise = 0;
  const discountPaise = 0;
  const taxPaise = 0;
  const totalPaise = subtotalPaise + shippingPaise + taxPaise - discountPaise;

  if (!String(customer.name || '').trim() || !String(customer.phone || '').trim() || !String(customer.address || '').trim()) {
    throw new Error('Customer name, phone and address are required.');
  }

  const orderReference = buildOrderReference();
  const order = {
    id: `o-${Date.now()}`,
    orderNumber: orderReference,
    orderReference,
    customerName: String(customer.name || 'Guest customer').trim(),
    customerEmail: String(customer.email || '').trim(),
    customerPhone: String(customer.phone || '').trim(),
    shippingAddressSnapshot: {
      address: String(customer.address || '').trim(),
      city: String(customer.city || '').trim(),
      state: String(customer.state || '').trim(),
      postalCode: String(customer.postalCode || '').trim()
    },
    paymentStatus: String(payload.paymentStatus || 'pending').trim() || 'pending',
    orderStatus: 'pending',
    subtotalPaise,
    discountPaise,
    shippingPaise,
    taxPaise,
    totalPaise,
    createdAt: new Date().toISOString(),
    items: orderItems.map((item) => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      pricePaise: item.unitPricePaise,
      lineTotalPaise: item.lineTotalPaise
    }))
  };

  for (const productEntry of store.products) {
    for (const variant of productEntry.variants || []) {
      const quantityToReduce = orderItems
        .filter((item) => item.sku === variant.sku)
        .reduce((sum, item) => sum + item.quantity, 0);

      if (quantityToReduce > 0) {
        if (!variant.inventory) {
          variant.inventory = { availableQuantity: 0, lowStockThreshold: 5 };
        }
        variant.inventory.availableQuantity = Number(variant.inventory.availableQuantity ?? 0) - quantityToReduce;
      }
    }
  }

  store.orders.push(order);
  await writeStoreData(store);

  const result = { ok: true, order, orderReference, orderNumber: order.orderNumber };
  if (idempotencyKey) {
    orderIdempotency.set(idempotencyKey, result);
    await persistIdempotencyMap();
  }

  return result;
}

export async function readOrderByReference(reference) {
  const store = await readStoreData();
  return store.orders.find((order) => order.orderReference === reference) || null;
}
