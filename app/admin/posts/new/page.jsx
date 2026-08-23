import AdminPostEditor from '@/components/AdminPostEditor';
import { requireAdminPageSession } from '@/lib/auth';

export default async function NewPostPage() {
  await requireAdminPageSession();

  return (
    <section className="section-gap admin-editor-page">
      <div className="container">
        <AdminPostEditor />
      </div>
    </section>
  );
}
