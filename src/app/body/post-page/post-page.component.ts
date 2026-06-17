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
  selector: 'app-post-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './post-page.component.html',
  styleUrl: './post-page.component.scss',
})
export class PostPageComponent implements OnInit {
  public posts: PostMeta[] = [];

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    // 자동 생성된 인덱스 (scripts/generate-posts.mjs). 이미 날짜순 정렬됨.
    this.http
      .get<PostMeta[]>('assets/posts/index.json')
      .subscribe({
        next: (posts) => (this.posts = posts),
        error: () => (this.posts = []),
      });
  }

  public open(slug: string) {
    this.router.navigate(['/post', slug]);
  }
}
