import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from '@/lib/auth';

export default function AdminLayout({ children }) {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  if (!verifyAdminSessionToken(token)) redirect('/admin/login');
  return <div className="container">{children}</div>;
}
