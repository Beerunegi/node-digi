'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState } from 'react';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

function slugifyValue(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function AdminPostEditor({ post }) {
  const [title, setTitle] = useState(post?.title || '');
  const [slug, setSlug] = useState(post?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(post?.slug));
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [authorName, setAuthorName] = useState(post?.authorName || 'Digi Web Tech Team');
  const [categories, setCategories] = useState(
    (post?.categories || []).map((item) => item.name).join(', '),
  );
  const [tags, setTags] = useState((post?.tags || []).map((item) => item.name).join(', '));
  const [coverImage, setCoverImage] = useState(post?.coverImage || '');
  const [coverImageAlt, setCoverImageAlt] = useState(post?.coverImageAlt || '');
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || '');
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || '');
  const [status, setStatus] = useState(post?.status || 'draft');
  const [contentHtml, setContentHtml] = useState(post?.contentHtml || '');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, 4, false] }],
        ['bold', 'italic', 'underline', 'blockquote'],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['link', 'clean'],
      ],
    }),
    [],
  );

  function handleTitleChange(event) {
    const nextTitle = event.target.value;
    setTitle(nextTitle);

    if (!slugTouched) {
      setSlug(slugifyValue(nextTitle));
    }
  }

  async function handleImageUpload(event) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setError('');
    setUploading(true);

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/admin/upload', {
      method: 'POST',
      body: formData,
    });

    setUploading(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'Image upload failed.');
      return;
    }

    const data = await response.json();
    setCoverImage(data.url);
    setCoverImageAlt(coverImageAlt || file.name.replace(/\.[^.]+$/, ''));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSaving(true);

    const payload = {
      title,
      slug,
      excerpt,
      authorName,
      categories,
      tags,
      coverImage,
      coverImageAlt,
      metaTitle,
      metaDescription,
      status,
      contentHtml,
    };

    const response = await fetch(post ? `/api/admin/posts/${post.id}` : '/api/admin/posts', {
      method: post ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'Post save failed.');
      return;
    }

    window.location.href = '/admin';
  }

  async function handleDelete() {
    const confirmed = window.confirm('Delete this post permanently?');

    if (!confirmed || !post) {
      return;
    }

    const response = await fetch(`/api/admin/posts/${post.id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message || 'Delete failed.');
      return;
    }

    window.location.href = '/admin';
  }

  return (
    <form className="admin-editor-shell" onSubmit={handleSubmit}>
      <div className="admin-editor-header">
        <div>
          <span className="eyebrow">Content Editor</span>
          <h1>{post ? 'Edit Post' : 'Create Post'}</h1>
        </div>
        <div className="admin-editor-actions">
          {post ? (
            <button type="button" className="btn btn-secondary" onClick={handleDelete}>
              Delete
            </button>
          ) : null}
          <button type="submit" className="btn" disabled={saving}>
            {saving ? 'Saving...' : status === 'published' ? 'Save & Publish' : 'Save Draft'}
          </button>
        </div>
      </div>

      {error ? <p className="admin-form-error">{error}</p> : null}

      <div className="admin-editor-grid">
        <div className="admin-editor-main">
          <label>
            Title
            <input type="text" value={title} onChange={handleTitleChange} required />
          </label>

          <label>
            Slug
            <input
              type="text"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugifyValue(event.target.value));
              }}
              required
            />
          </label>

          <label>
            Excerpt
            <textarea
              rows="4"
              value={excerpt}
              onChange={(event) => setExcerpt(event.target.value)}
            />
          </label>

          <div className="admin-editor-richtext">
            <span>Content</span>
            <ReactQuill
              theme="snow"
              value={contentHtml}
              onChange={setContentHtml}
              modules={modules}
            />
          </div>
        </div>

        <aside className="admin-editor-sidebar">
          <label>
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>

          <label>
            Author Name
            <input
              type="text"
              value={authorName}
              onChange={(event) => setAuthorName(event.target.value)}
            />
          </label>

          <label>
            Categories
            <input
              type="text"
              value={categories}
              onChange={(event) => setCategories(event.target.value)}
              placeholder="SEO, Web Development"
            />
          </label>

          <label>
            Tags
            <input
              type="text"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="seo, nextjs, performance"
            />
          </label>

          <label>
            Cover Image URL
            <input
              type="url"
              value={coverImage}
              onChange={(event) => setCoverImage(event.target.value)}
            />
          </label>

          <label className="admin-upload-field">
            Upload Cover Image
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <span>{uploading ? 'Uploading image...' : 'Choose an image file'}</span>
          </label>

          <label>
            Cover Image Alt
            <input
              type="text"
              value={coverImageAlt}
              onChange={(event) => setCoverImageAlt(event.target.value)}
            />
          </label>

          <label>
            Meta Title
            <input
              type="text"
              value={metaTitle}
              onChange={(event) => setMetaTitle(event.target.value)}
            />
          </label>

          <label>
            Meta Description
            <textarea
              rows="4"
              value={metaDescription}
              onChange={(event) => setMetaDescription(event.target.value)}
            />
          </label>
        </aside>
      </div>
    </form>
  );
}
