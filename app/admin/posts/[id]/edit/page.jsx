import { notFound } from 'next/navigation';

import AdminPostEditor from '@/components/AdminPostEditor';
import { requireAdminPageSession } from '@/lib/auth';
import { getPostById } from '@/lib/blog';

export default async function EditPostPage({ params }) {
  await requireAdminPageSession();
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <section className="section-gap admin-editor-page">
      <div className="container">
        <AdminPostEditor post={post} />
      </div>
    </section>
  );
}
