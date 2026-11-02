import { promises as fs } from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'store-settings.json');

const base = {
  name: process.env.SITE_NAME || 'Gareeb Vastarlaya',
  address: process.env.STORE_ADDRESS || 'Jhansi, Uttar Pradesh, India',
  phone: process.env.NEXT_PUBLIC_STORE_PHONE || '+91 8840193987',
  whatsapp: process.env.NEXT_PUBLIC_STORE_WHATSAPP || '+91 8840193987',
  email: process.env.NEXT_PUBLIC_STORE_EMAIL || 'gareebvastralayajhs@gmail.com',
  openingHours: process.env.STORE_OPENING_HOURS || '10:30 AM - 8:30 PM',
  googleMapsUrl: process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL || 'https://maps.google.com/?q=Gareeb+Vastarlaya+Jhansi',
  googleBusinessUrl: process.env.GOOGLE_BUSINESS_PROFILE_URL || 'https://www.google.com/search?q=Gareeb+Vastarlaya+Jhansi',
  whatsappUrl: `https://wa.me/${(process.env.NEXT_PUBLIC_STORE_WHATSAPP || '+91 00000 00000').replace(/\D/g, '')}`
};

export async function getStoreSettings() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(data);
    return { ...base, ...parsed };
  } catch {
    return base;
  }
}

export async function updateStoreSettings(input) {
  const current = await getStoreSettings();
  const next = { ...current, ...input };
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(next, null, 2));
  return next;
}
