
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import AuthSessionProvider from '@/components/SessionProvider';

export const metadata = {
  title: 'Gareeb Vastarlaya',
  description: 'Sarees and lehengas in Jhansi, Uttar Pradesh.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthSessionProvider>
          <div className="page-shell">
            <Header />
            <main>{children}</main>
            <Footer />
          </div>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
