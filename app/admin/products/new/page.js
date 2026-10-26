import { requireAdminSession } from '@/lib/auth';
import NewProductForm from '@/components/admin/NewProductForm';

export default function NewProductPage() {
  requireAdminSession();

  return <NewProductForm />;
}
