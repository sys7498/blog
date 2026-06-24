import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PROFILE } from '../../../data/profile';
import { PUBLICATIONS, Publication } from '../../../data/publications';
import { parseBibtex } from '../../../data/bibtex';
import { PROJECTS, Project } from '../../../data/projects';
import { NavService } from '../../services/nav.service';
import { CvService } from '../../services/cv.service';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.scss',
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  public readonly profile = PROFILE;
  public publications: Publication[] = [...PUBLICATIONS];
  public readonly projects: Project[] = PROJECTS;

  public tiltStyle = 'perspective(900px) rotateX(0) rotateY(0)';

  @ViewChild('scroller') scroller!: ElementRef<HTMLElement>;

  constructor(
    private http: HttpClient,
    private host: ElementRef<HTMLElement>,
    private route: ActivatedRoute,
    private router: Router,
    public nav: NavService,
    private cv: CvService
  ) {}

  get papers(): Publication[] {
    return this.publications.filter((p) => p.category !== 'demo-poster');
  }
  get demosPosters(): Publication[] {
    return this.publications.filter((p) => p.category === 'demo-poster');
  }

  ngOnInit() {
    this.http
      .get('assets/publications.bib', { responseType: 'text' })
      .subscribe({
        next: (bib) => {
          this.publications = [...parseBibtex(bib), ...PUBLICATIONS].sort(
            (a, b) => b.year - a.year
          );
        },
        error: () => {},
      });
  }

  ngOnDestroy() {
    this.nav.register(null);
  }

  ngAfterViewInit() {
    const root = this.scroller?.nativeElement ?? null;
    this.nav.register(root); // 컨테이너 등록 → 섹션 스크롤이 헤더를 밀지 않음
    const sections = this.host.nativeElement.querySelectorAll('section[id]');

    // 스크롤 스파이: 화면 상단에 걸린 섹션을 네비 활성화
    const spy = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) this.nav.active.set(e.target.id);
        }
      },
      { root, rootMargin: '-8% 0px -78% 0px', threshold: 0 }
    );
    sections.forEach((s) => spy.observe(s));

    // reveal
    const reveal = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            reveal.unobserve(e.target);
          }
        }
      },
      { root, threshold: 0.08 }
    );
    this.host.nativeElement
      .querySelectorAll('.reveal')
      .forEach((el) => reveal.observe(el));

    // 주소 fragment(섹션) 로 스크롤 — 헤더 클릭/뒤로가기/공유 모두 동작
    this.route.fragment.subscribe((frag) => {
      if (frag) setTimeout(() => this.nav.scrollTo(frag), 60);
    });
  }

  public tilt(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const px = (event.clientX - r.left) / r.width - 0.5;
    const py = (event.clientY - r.top) / r.height - 0.5;
    this.tiltStyle = `perspective(900px) rotateX(${(-py * 10).toFixed(
      2
    )}deg) rotateY(${(px * 10).toFixed(2)}deg)`;
  }
  public resetTilt() {
    this.tiltStyle = 'perspective(900px) rotateX(0) rotateY(0)';
  }

  public linkify(text: string): string {
    return linkifyProfileText(text);
  }

  // 링크 라벨 → 아이콘 종류
  public linkIcon(label: string): string {
    const l = label.toLowerCase();
    if (l.includes('git')) return 'github';
    if (l.includes('linked')) return 'linkedin';
    if (l.includes('scholar')) return 'scholar';
    if (l.includes('mail') || l.includes('email')) return 'mail';
    return 'link';
  }

  // 썸네일이 없을 때 보여줄 색 플레이스홀더 (항목마다 다른 그라데이션)
  public cover(seed: number): string {
    const a = (seed * 57 + 20) % 360;
    const b = (a + 38) % 360;
    return `linear-gradient(135deg, hsl(${a} 64% 60%), hsl(${b} 64% 46%))`;
  }

  public async openCv() {
    await this.cv.download();
  }
  public openProject(slug: string) {
    this.router.navigate(['/project', slug]);
  }
}

function linkifyProfileText(text: string): string {
  let html = escapeHtml(text);
  const links = [...PROFILE.entityLinks].sort((a, b) => b.label.length - a.label.length);
  const replacements: string[] = [];
  for (const link of links) {
    html = html.replace(
      new RegExp(`\\b${escapeRegExp(link.label)}\\b`, 'g'),
      () => {
        const token = `@@PROFILE_LINK_${replacements.length}@@`;
        replacements.push(
          `<a class="text-link" href="${escapeHtml(link.url)}" target="_blank" rel="noopener">${link.label}</a>`
        );
        return token;
      }
    );
  }
  replacements.forEach((replacement, index) => {
    html = html.replace(`@@PROFILE_LINK_${index}@@`, replacement);
  });
  return html;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return entities[ch];
  });
}

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
