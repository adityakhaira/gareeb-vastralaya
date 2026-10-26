import { readStoreData } from '@/lib/store-data';

export default async function sitemap() {
  const siteUrl = process.env.SITE_URL || 'http://localhost:3000';
  const store = await readStoreData();
  const products = store.products.map((product) => ({ url: `${siteUrl}/products/${product.slug}` }));

  return [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/sarees`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${siteUrl}/lehengas`, changeFrequency: 'weekly', priority: 0.8 },
    ...products
  ];
}
