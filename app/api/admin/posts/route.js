import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

import { verifyAdminRequest } from '@/lib/auth';
import { savePost } from '@/lib/blog';

function revalidatePostPaths(post) {
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  post.categories.forEach((category) => revalidatePath(`/blog/category/${category.slug}`));
  post.tags.forEach((tag) => revalidatePath(`/blog/tag/${tag.slug}`));
}

export async function POST(request) {
  const session = await verifyAdminRequest(request);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const post = await savePost(body);
    revalidatePostPaths(post);
    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
