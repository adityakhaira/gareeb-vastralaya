import Link from 'next/link';
import { notFound } from 'next/navigation';
import ProductDetail from '@/components/storefront/ProductDetail';
import { getProductBySlug, getRelatedProducts } from '@/lib/store-data';

export async function generateMetadata({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: 'Product unavailable' };
  return { title: `${product.name} | Gareeb Vastarlaya`, description: product.description };
}

export default async function ProductPage({ params }) {
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const related = await getRelatedProducts(product);
  return <ProductDetail product={product} related={related} />;
}
