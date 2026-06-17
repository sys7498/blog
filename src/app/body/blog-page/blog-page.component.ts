import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    this.http.get<PostMeta[]>('assets/posts/index.json').subscribe({
      next: (p) => (this.posts = p),
      error: () => (this.posts = []),
    });
  }

  public open(slug: string) {
    this.router.navigate(['/post', slug]);
  }

  // 카드 커버에 글마다 다른 그라데이션
  public cover(i: number): string {
    const a = (i * 47) % 360;
    const b = (a + 40) % 360;
    return `linear-gradient(135deg, hsl(${a} 70% 62%), hsl(${b} 70% 48%))`;
  }
}
