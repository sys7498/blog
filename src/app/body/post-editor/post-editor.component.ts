import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { marked } from 'marked';
import { firstValueFrom } from 'rxjs';
import { LocalPostsService } from '../../services/local-posts.service';

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.scss',
})
export class PostEditorComponent implements OnInit {
  public mode: 'write' | 'edit' = 'write';
  public originalSlug = '';
  public title = '';
  public date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  public summary = '';
  public slug = '';
  public body = '';
  public previewHtml = '';
  public savedAt = '';
  public loading = true;
  public error = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private localPosts: LocalPostsService
  ) {}

  async ngOnInit() {
    this.originalSlug = this.route.snapshot.paramMap.get('slug') || '';
    this.mode = this.originalSlug ? 'edit' : 'write';

    if (this.mode === 'edit') {
      await this.loadExistingPost(this.originalSlug);
    } else {
      this.title = 'Untitled Post';
      this.slug = 'untitled-post';
      this.summary = '';
      this.body = '# Untitled Post\n\nWrite here.';
      this.loading = false;
    }
    await this.updatePreview();
  }

  public syncSlugFromTitle() {
    if (this.mode === 'edit') return;
    this.slug = slugify(this.title);
  }

  public async updatePreview() {
    this.previewHtml = await marked.parse(this.body || '');
  }

  public async save() {
    const slug = slugify(this.slug || this.title);
    const saved = this.localPosts.save({
      slug,
      title: this.title.trim() || 'Untitled Post',
      date: this.date.trim() || new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
      summary: this.summary.trim(),
      body: this.body.trim() || '# Untitled Post',
    });
    this.savedAt = new Date(saved.updatedAt).toLocaleTimeString();
    await this.router.navigate(['/post', saved.slug]);
  }

  public downloadMarkdown() {
    const content = composeMarkdown({
      title: this.title,
      date: this.date,
      summary: this.summary,
      body: this.body,
    });
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slugify(this.slug || this.title)}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  private async loadExistingPost(slug: string) {
    const local = this.localPosts.get(slug);
    if (local) {
      this.title = local.title;
      this.date = local.date;
      this.summary = local.summary || '';
      this.slug = local.slug;
      this.body = local.body;
      this.loading = false;
      return;
    }

    try {
      const raw = await firstValueFrom(
        this.http.get(`assets/posts/${slug}.md`, { responseType: 'text' })
      );
      const { meta, body } = splitFrontmatter(raw);
      this.title = meta['title'] || slug;
      this.date = meta['date'] || this.date;
      this.summary = meta['summary'] || '';
      this.slug = slug;
      this.body = body.trimStart();
      this.loading = false;
    } catch {
      this.error = true;
      this.loading = false;
    }
  }
}

function splitFrontmatter(text: string): {
  meta: Record<string, string>;
  body: string;
} {
  const match = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
  const meta: Record<string, string> = {};
  if (!match) return { meta, body: text };
  for (const line of match[1].split(/\r?\n/)) {
    const index = line.indexOf(':');
    if (index === -1) continue;
    meta[line.slice(0, index).trim()] = line
      .slice(index + 1)
      .trim()
      .replace(/^["']|["']$/g, '');
  }
  return { meta, body: text.slice(match[0].length) };
}

function composeMarkdown(post: {
  title: string;
  date: string;
  summary: string;
  body: string;
}): string {
  return `---\ntitle: ${escapeMeta(post.title)}\ndate: ${escapeMeta(post.date)}\nsummary: ${escapeMeta(post.summary)}\n---\n\n${post.body.trim()}\n`;
}

function slugify(value: string): string {
  return (
    value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled-post'
  );
}

function escapeMeta(value: string): string {
  return value.replace(/\r?\n/g, ' ').trim();
}
