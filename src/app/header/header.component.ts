import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { NavService } from '../services/nav.service';
import { CvService } from '../services/cv.service';

interface SubItem {
  id: string;
  label: string;
}
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // 홈 한 페이지의 섹션으로 스크롤
  public readonly aboutSub: SubItem[] = [
    { id: 'about', label: 'Profile' },
    { id: 'education', label: 'Education' },
    { id: 'news', label: 'News' },
    { id: 'publication', label: 'Publications' },
  ];

  public openMenu = '';

  constructor(
    private router: Router,
    public navState: NavService,
    private cv: CvService
  ) {}

  get aboutActive(): boolean {
    return this.router.url.split('?')[0] === '/';
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
  public async openCv() {
    this.openMenu = '';
    await this.cv.download();
  }

  public toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.openMenu = this.openMenu ? '' : 'menu';
  }

  @HostListener('document:click')
  public closeMenu() {
    this.openMenu = '';
  }
}
