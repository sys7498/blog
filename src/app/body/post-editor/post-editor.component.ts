import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
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
export class PostEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('markdownInput') markdownInput!: ElementRef<HTMLTextAreaElement>;

  public mode: 'write' | 'edit' = 'write';
  public originalSlug = '';
  public title = '';
  public date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  public calendarDate = new Date().toISOString().slice(0, 10);
  public summary = '';
  public slug = '';
  public body = '';
  public previewHtml = '';
  public savedAt = '';
  public loading = true;
  public error = false;

  private editor?: EasyMDEInstance;
  private viewReady = false;

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
    this.calendarDate = dateToInputValue(this.date);
    await this.updatePreview();
    this.syncEditorBody();
  }

  async ngAfterViewInit() {
    this.viewReady = true;
    const { default: EasyMDE } = await import('easymde');
    this.editor = new EasyMDE({
      element: this.markdownInput.nativeElement,
      autofocus: true,
      spellChecker: false,
      status: ['lines', 'words'],
      minHeight: '500px',
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        'code',
        '|',
        'link',
        'image',
        'table',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
        '|',
        'guide',
      ],
      initialValue: this.body,
    }) as EasyMDEInstance;
    this.editor.codemirror.on('change', () => {
      this.body = this.editor?.value() || '';
      this.updatePreview();
    });
  }

  ngOnDestroy() {
    this.editor?.cleanup();
  }

  public syncSlugFromTitle() {
    if (this.mode === 'edit') return;
    this.slug = slugify(this.title);
  }

  public async updatePreview() {
    this.previewHtml = await marked.parse(this.body || '');
  }

  public syncDateFromCalendar() {
    this.date = inputDateToDisplay(this.calendarDate);
  }

  public async save() {
    this.body = this.editor?.value() || this.body;
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
    this.body = this.editor?.value() || this.body;
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
      this.calendarDate = dateToInputValue(local.date);
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
      this.calendarDate = dateToInputValue(this.date);
      this.summary = meta['summary'] || '';
      this.slug = slug;
      this.body = body.trimStart();
      this.loading = false;
    } catch {
      this.error = true;
      this.loading = false;
    }
  }

  private syncEditorBody() {
    if (!this.viewReady || !this.editor) return;
    this.editor.value(this.body);
  }
}

interface EasyMDEInstance {
  value(): string;
  value(text: string): void;
  cleanup(): void;
  codemirror: {
    on(event: string, handler: () => void): void;
  };
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

function dateToInputValue(value: string): string {
  const normalized = value.trim().replace(/\./g, '-');
  return /^\d{4}-\d{2}-\d{2}$/.test(normalized)
    ? normalized
    : new Date().toISOString().slice(0, 10);
}

function inputDateToDisplay(value: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value.replace(/-/g, '.')
    : new Date().toISOString().slice(0, 10).replace(/-/g, '.');
}
