import { redirect } from 'next/navigation';

import AdminLoginForm from '@/components/AdminLoginForm';
import { getAdminSession } from '@/lib/auth';

export default async function AdminLoginPage() {
  const session = await getAdminSession();

  if (session) {
    redirect('/admin');
  }

  return (
    <section className="section-gap admin-auth-shell">
      <div className="container">
        <AdminLoginForm />
      </div>
    </section>
  );
}
