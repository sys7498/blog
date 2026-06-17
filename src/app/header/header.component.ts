import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavService } from '../services/nav.service';

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
    { id: 'about', label: 'About' },
    { id: 'education', label: 'Education' },
    { id: 'news', label: 'News' },
    { id: 'publication', label: 'Publications' },
    { id: 'project', label: 'Projects' },
  ];

  public recentPosts: PostMeta[] = [];
  public openMenu: '' | 'about' | 'posts' = ''; // 모바일 토글
  public readonly cvPdf = 'assets/Yoonseok_Shin_CV.pdf';

  constructor(
    private router: Router,
    private http: HttpClient,
    public navState: NavService
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

  /** 섹션으로 이동 (주소 fragment 갱신 → 뒤로가기/공유 가능) */
  public go(id: string) {
    this.openMenu = '';
    this.router.navigate(['/'], { fragment: id });
  }
  public goHome() {
    this.openMenu = '';
    this.router.navigate(['/'], { fragment: 'about' });
  }
  public goPosts() {
    this.openMenu = '';
    this.router.navigate(['/posts']);
  }
  public openPost(slug: string) {
    this.openMenu = '';
    this.router.navigate(['/post', slug]);
  }
  public openCv() {
    this.openMenu = '';
    window.open(this.cvPdf, '_blank');
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
