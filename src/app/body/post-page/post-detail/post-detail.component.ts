import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { marked } from 'marked';
import { LocalPostsService } from '../../../services/local-posts.service';

@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.scss',
})
export class PostDetailComponent implements OnInit {
  public title = '';
  public date = '';
  public html = '';
  public loading = true;
  public error = false;
  public slug = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private localPosts: LocalPostsService
  ) {}

  ngOnInit() {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.fail();
      return;
    }
    this.slug = slug;

    const local = this.localPosts.get(slug);
    if (local) {
      this.title = local.title;
      this.date = local.date;
      Promise.resolve(marked.parse(local.body)).then((html) => {
        this.html = html;
        this.loading = false;
      });
      return;
    }

    this.http
      .get(`assets/posts/${slug}.md`, { responseType: 'text' })
      .subscribe({
        next: async (raw) => {
          const { meta, body } = this.splitFrontmatter(raw);
          this.title = meta['title'] || slug;
          this.date = meta['date'] || '';
          this.html = await marked.parse(body);
          this.loading = false;
        },
        error: () => this.fail(),
      });
  }

  public editPost() {
    if (!this.slug) return;
    this.router.navigate(['/post', this.slug, 'edit']);
  }

  /** 프론트매터(--- ... ---)를 분리해 메타와 본문을 반환 */
  private splitFrontmatter(text: string): {
    meta: Record<string, string>;
    body: string;
  } {
    const m = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?/);
    const meta: Record<string, string> = {};
    if (!m) return { meta, body: text };
    for (const line of m[1].split(/\r?\n/)) {
      const idx = line.indexOf(':');
      if (idx === -1) continue;
      const key = line.slice(0, idx).trim();
      const val = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (key) meta[key] = val;
    }
    return { meta, body: text.slice(m[0].length) };
  }

  private fail() {
    this.loading = false;
    this.error = true;
  }
}
