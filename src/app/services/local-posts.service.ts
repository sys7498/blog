import { Injectable } from '@angular/core';

export interface EditablePost {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  body: string;
  updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class LocalPostsService {
  private readonly storageKey = 'yoons-local-posts';

  public all(): EditablePost[] {
    return this.read().sort((a, b) => b.date.localeCompare(a.date));
  }

  public get(slug: string): EditablePost | undefined {
    return this.read().find((post) => post.slug === slug);
  }

  public save(post: Omit<EditablePost, 'updatedAt'>): EditablePost {
    const saved: EditablePost = {
      ...post,
      updatedAt: new Date().toISOString(),
    };
    const posts = this.read().filter((item) => item.slug !== saved.slug);
    posts.push(saved);
    this.write(posts);
    return saved;
  }

  private read(): EditablePost[] {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed.filter(isEditablePost) : [];
    } catch {
      localStorage.removeItem(this.storageKey);
      return [];
    }
  }

  private write(posts: EditablePost[]) {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(this.storageKey, JSON.stringify(posts));
  }
}

function isEditablePost(value: unknown): value is EditablePost {
  if (!value || typeof value !== 'object') return false;
  const post = value as Record<string, unknown>;
  return (
    typeof post['slug'] === 'string' &&
    typeof post['title'] === 'string' &&
    typeof post['date'] === 'string' &&
    typeof post['body'] === 'string'
  );
}
