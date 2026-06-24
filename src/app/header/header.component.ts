import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavService } from '../services/nav.service';
import { CvService } from '../services/cv.service';

interface SubItem {
  id: string;
  label: string;
}
interface PostMeta {
  slug: string;
  title: string;
  date: string;
  summary?: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  // About 드롭다운: 홈 한 페이지의 섹션들로 스크롤
  public readonly aboutSub: SubItem[] = [
    { id: 'about', label: 'Profile' },
    { id: 'education', label: 'Education' },
    { id: 'news', label: 'News' },
    { id: 'publication', label: 'Publications' },
    { id: 'project', label: 'Projects' },
  ];

  public recentPosts: PostMeta[] = [];
  public openMenu: '' | 'about' | 'posts' = ''; // 모바일 토글

  constructor(
    private router: Router,
    private http: HttpClient,
    public navState: NavService,
    private cv: CvService
  ) {}

  ngOnInit() {
    this.http.get<PostMeta[]>('assets/posts/index.json').subscribe({
      next: (p) => (this.recentPosts = p.slice(0, 4)),
      error: () => (this.recentPosts = []),
    });
  }

  get postsActive(): boolean {
    return this.router.url.startsWith('/post');
  }
  get aboutActive(): boolean {
    return !this.postsActive;
  }
  public isSecActive(id: string): boolean {
    return this.aboutActive && this.navState.active() === id;
  }

  public go(id: string) {
    this.openMenu = '';
    if (id === 'about') {
      this.goHome();
      return;
    }
    if (this.router.url.split('?')[0] === '/') {
      this.navState.scrollTo(id);
      return;
    }
    this.router.navigate(['/']).then(() => {
      setTimeout(() => this.navState.scrollTo(id), 0);
    });
  }
  public goHome() {
    this.openMenu = '';
    if (this.router.url.split('?')[0] === '/') {
      this.navState.scrollTop();
      return;
    }
    this.router.navigate(['/']).then(() => {
      setTimeout(() => this.navState.scrollTop(), 0);
    });
  }
  public goPosts() {
    this.openMenu = '';
    this.router.navigate(['/posts']);
  }
  public openPost(slug: string) {
    this.openMenu = '';
    this.router.navigate(['/post', slug]);
  }
  public async openCv() {
    this.openMenu = '';
    await this.cv.download();
  }

  public toggleMenu(which: 'about' | 'posts', event: MouseEvent) {
    event.stopPropagation();
    this.openMenu = this.openMenu === which ? '' : which;
  }

  @HostListener('document:click')
  public closeMenu() {
    this.openMenu = '';
  }
}
