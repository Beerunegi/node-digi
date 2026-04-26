import { requireAdminPageSession } from '@/lib/auth';
import { getAdminPosts } from '@/lib/blog';

function formatDate(value) {
  if (!value) {
    return 'Unpublished';
  }

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default async function AdminDashboardPage() {
  const session = await requireAdminPageSession();
  const posts = await getAdminPosts();

  return (
    <section className="section-gap admin-dashboard-shell">
      <div className="container">
        <div className="admin-dashboard-header">
          <div>
            <span className="eyebrow">Content Management</span>
            <h1>Blog Admin</h1>
            <p>Signed in as {session.sub}. Manage drafts, published posts, SEO fields, and media.</p>
          </div>
          <div className="admin-dashboard-actions">
            <a href="/admin/posts/new" className="btn">
              New Post
            </a>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className="btn btn-secondary">
                Sign Out
              </button>
            </form>
          </div>
        </div>

        <div className="admin-post-list">
          {posts.map((post) => (
            <article key={post.id} className="admin-post-row">
              <div>
                <div className="admin-post-status">{post.status}</div>
                <h2>{post.title}</h2>
                <p>/{post.slug}</p>
              </div>
              <div className="admin-post-row-meta">
                <span>{formatDate(post.publishedAt)}</span>
                <span>{post.readingTimeMinutes} min read</span>
              </div>
              <div className="admin-post-row-actions">
                <a href={`/blog/${post.slug}`} className="btn btn-secondary" target="_blank" rel="noopener">
                  View
                </a>
                <a href={`/admin/posts/${post.id}/edit`} className="btn">
                  Edit
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
