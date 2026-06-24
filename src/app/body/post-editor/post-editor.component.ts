import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary?: string;
}

interface EasyMDEInstance {
  value(): string;
  value(text: string): void;
  cleanup(): void;
  codemirror: {
    on(event: string, handler: () => void): void;
  };
}

@Component({
  selector: 'app-post-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-editor.component.html',
  styleUrl: './post-editor.component.scss',
})
export class PostEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('markdownInput') markdownInput!: ElementRef<HTMLTextAreaElement>;

  public posts: PostMeta[] = [];
  public selectedSlug = '';
  public title = 'Untitled Post';
  public date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
  public summary = '';
  public slug = 'untitled-post';
  public savedAt = '';

  private editor?: EasyMDEInstance;
  private body = '# Untitled Post\n\nWrite here.\n';
  private readonly draftKey = 'yoons-post-editor-draft';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<PostMeta[]>('assets/posts/index.json').subscribe({
      next: (posts) => (this.posts = posts),
      error: () => (this.posts = []),
    });
    this.restoreDraft();
  }

  async ngAfterViewInit() {
    const { default: EasyMDE } = await import('easymde');

    this.editor = new EasyMDE({
      element: this.markdownInput.nativeElement,
      autofocus: true,
      spellChecker: false,
      status: ['lines', 'words'],
      minHeight: '460px',
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

    this.editor.codemirror.on('change', () => this.saveDraft());
  }

  ngOnDestroy() {
    this.editor?.cleanup();
  }

  public async loadSelected() {
    if (!this.selectedSlug) return;
    const raw = await firstValueFrom(
      this.http.get(`assets/posts/${this.selectedSlug}.md`, {
        responseType: 'text',
      })
    );
    if (!raw) return;

    const { meta, body } = splitFrontmatter(raw);
    this.title = meta['title'] || this.selectedSlug;
    this.date = meta['date'] || this.date;
    this.summary = meta['summary'] || '';
    this.slug = this.selectedSlug;
    this.body = body.trimStart();
    this.editor?.value(this.body);
    this.saveDraft();
  }

  public newPost() {
    this.selectedSlug = '';
    this.title = 'Untitled Post';
    this.date = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
    this.summary = '';
    this.slug = 'untitled-post';
    this.body = '# Untitled Post\n\nWrite here.\n';
    this.editor?.value(this.body);
    this.saveDraft();
  }

  public syncSlugFromTitle() {
    this.slug = slugify(this.title);
    this.saveDraft();
  }

  public downloadMarkdown() {
    const content = this.composeMarkdown();
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.slug || 'post'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public copyMarkdown() {
    navigator.clipboard?.writeText(this.composeMarkdown());
  }

  public clearDraft() {
    localStorage.removeItem(this.draftKey);
    this.savedAt = '';
    this.newPost();
  }

  public backToPosts() {
    this.router.navigate(['/posts']);
  }

  private composeMarkdown(): string {
    const body = this.editor?.value() || this.body;
    return `---\ntitle: ${escapeMeta(this.title)}\ndate: ${escapeMeta(this.date)}\nsummary: ${escapeMeta(this.summary)}\n---\n\n${body.trim()}\n`;
  }

  public saveDraft() {
    const draft = {
      title: this.title,
      date: this.date,
      summary: this.summary,
      slug: this.slug,
      selectedSlug: this.selectedSlug,
      body: this.editor?.value() || this.body,
    };
    localStorage.setItem(this.draftKey, JSON.stringify(draft));
    this.savedAt = new Date().toLocaleTimeString();
  }

  private restoreDraft() {
    const raw = localStorage.getItem(this.draftKey);
    if (!raw) return;
    try {
      const draft = JSON.parse(raw);
      this.title = draft.title || this.title;
      this.date = draft.date || this.date;
      this.summary = draft.summary || '';
      this.slug = draft.slug || this.slug;
      this.selectedSlug = draft.selectedSlug || '';
      this.body = draft.body || this.body;
      this.editor?.value(this.body);
    } catch {
      localStorage.removeItem(this.draftKey);
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
