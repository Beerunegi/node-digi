import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { verifyAdminRequest } from '@/lib/auth';
import { deletePost, getPostById, savePost } from '@/lib/blog';

function revalidatePostPaths(post) {
  if (!post) {
    revalidatePath('/blog');
    return;
  }

  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  post.categories.forEach((category) => revalidatePath(`/blog/category/${category.slug}`));
  post.tags.forEach((tag) => revalidatePath(`/blog/tag/${tag.slug}`));
}

export async function GET(request, { params }) {
  const session = await verifyAdminRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const post = await getPostById(id);
  return NextResponse.json({ post });
}

export async function PUT(request, { params }) {
  const session = await verifyAdminRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const previousPost = await getPostById(id);
    const body = await request.json();
    const post = await savePost(body, id);
    revalidatePostPaths(previousPost);
    revalidatePostPaths(post);
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}

export async function DELETE(request, { params }) {
  const session = await verifyAdminRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const post = await deletePost(id);
    revalidatePostPaths(post);
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
