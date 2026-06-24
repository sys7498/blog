import { Injectable, signal } from '@angular/core';

// 싱글 페이지 네비게이션: 헤더 버튼 ↔ 페이지 섹션 스크롤 연동
@Injectable({ providedIn: 'root' })
export class NavService {
  // 현재 화면 상단에 걸린 섹션 id (스크롤 스파이용)
  public active = signal<string>('about');

  // 홈의 스크롤 컨테이너(.page). 헤더는 건드리지 않고 이 안에서만 스크롤.
  private container: HTMLElement | null = null;

  public register(el: HTMLElement | null) {
    this.container = el;
  }

  /** 섹션으로 부드럽게 스크롤. 해당 섹션이 있으면 true */
  public scrollTo(id: string): boolean {
    const el = document.getElementById(id);
    if (!el) return false;

    const c = this.container;
    if (c && c.contains(el)) {
      // 컨테이너만 스크롤 → 상단 헤더는 절대 밀려나지 않음
      const top =
        el.getBoundingClientRect().top -
        c.getBoundingClientRect().top +
        c.scrollTop;
      c.scrollTo({ top, behavior: 'smooth' });
    } else {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    this.active.set(id);
    return true;
  }

  public scrollTop(): void {
    if (this.container) {
      this.container.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    this.active.set('about');
  }
}
