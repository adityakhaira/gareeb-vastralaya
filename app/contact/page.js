import { getStoreSettings } from '@/lib/store-config';

export const metadata = { title: 'Contact | Gareeb Vastarlaya' };

export default async function ContactPage() {
  const settings = await getStoreSettings();

  return (
    <div className="container section">
      <div className="page-title">
        <h1>Visit our store</h1>
      </div>
      <div className="grid-3">
        <div className="info-box">
          <h3>Store information</h3>
          <p>{settings.address}</p>
          <p>{settings.openingHours}</p>
          <p>{settings.phone}</p>
          <p>{settings.email}</p>
        </div>
        <div className="info-box">
          <h3>Quick actions</h3>
          <p><a href={settings.whatsappUrl}>WhatsApp enquiry</a></p>
          <p><a href={settings.googleMapsUrl}>Open in Google Maps</a></p>
          <p><a href={settings.googleBusinessUrl}>Google Business Profile</a></p>
        </div>
        <div className="info-box">
          <h3>Need help?</h3>
          <p>For product questions, order support, and local pickup arrangements, contact the store directly using the phone number or WhatsApp option above.</p>
        </div>
      </div>
    </div>
  );
}
