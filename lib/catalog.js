import { prisma } from './prisma';

export async function getCatalogProducts() {
  return prisma.product.findMany({
    where: { status: 'published' },
    include: { variants: { include: { inventory: true } }, images: true }
  });
}

export async function getProductBySlug(slug) {
  return prisma.product.findUnique({
    where: { slug },
    include: { variants: { include: { inventory: true } }, images: true }
  });
}

export async function getCatalogSettings() {
  return {
    name: process.env.SITE_NAME || 'Gareeb Vastarlaya',
    address: process.env.STORE_ADDRESS || 'Jhansi, Uttar Pradesh, India',
    phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+91 00000 00000',
    whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '+91 00000 00000',
    email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'hello@gareebvastarlaya.in',
    openingHours: process.env.STORE_OPENING_HOURS || '10:00 AM - 9:00 PM',
    googleMapsUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || 'https://maps.google.com/?q=Gareeb+Vastarlaya+Jhansi',
    googleBusinessUrl: process.env.GOOGLE_BUSINESS_PROFILE_URL || 'https://www.google.com/search?q=Gareeb+Vastarlaya+Jhansi'
  };
}
