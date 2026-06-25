import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { LocalPostsService } from '../../services/local-posts.service';

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary?: string;
}

@Component({
  selector: 'app-blog-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './blog-page.component.html',
  styleUrl: './blog-page.component.scss',
})
export class BlogPageComponent implements OnInit {
  public posts: PostMeta[] = [];

  constructor(
    private http: HttpClient,
    private router: Router,
    private localPosts: LocalPostsService
  ) {}

  ngOnInit() {
    this.http.get<PostMeta[]>('assets/posts/index.json').subscribe({
      next: (p) => (this.posts = this.mergeLocalPosts(p)),
      error: () => (this.posts = this.mergeLocalPosts([])),
    });
  }

  public open(slug: string) {
    this.router.navigate(['/post', slug]);
  }

  public openWriter() {
    this.router.navigate(['/posts/write']);
  }

  // 카드 커버에 글마다 다른 그라데이션
  public cover(i: number): string {
    const a = (i * 47) % 360;
    const b = (a + 40) % 360;
    return `linear-gradient(135deg, hsl(${a} 70% 62%), hsl(${b} 70% 48%))`;
  }

  private mergeLocalPosts(posts: PostMeta[]): PostMeta[] {
    const bySlug = new Map(posts.map((post) => [post.slug, post]));
    for (const post of this.localPosts.all()) {
      bySlug.set(post.slug, {
        slug: post.slug,
        title: post.title,
        date: post.date,
        summary: post.summary,
      });
    }
    return [...bySlug.values()].sort((a, b) => b.date.localeCompare(a.date));
  }
}
