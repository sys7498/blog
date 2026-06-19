import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { PROFILE } from '../../../data/profile';
import { PUBLICATIONS, Publication } from '../../../data/publications';
import { parseBibtex } from '../../../data/bibtex';

@Component({
  selector: 'app-about-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './about-page.component.html',
  styleUrl: './about-page.component.scss',
})
export class AboutPageComponent implements OnInit, AfterViewInit {
  public readonly profile = PROFILE;
  public publications: Publication[] = [...PUBLICATIONS];

  public tiltStyle = 'perspective(900px) rotateX(0) rotateY(0)';

  // 컴파일된 LaTeX CV PDF 경로 (cv/cv.tex → 컴파일 후 여기에 저장)
  public readonly cvPdf = 'assets/Yoonseok_Shin_CV.pdf';

  @ViewChild('scroller') scroller!: ElementRef<HTMLElement>;

  constructor(private http: HttpClient, private host: ElementRef<HTMLElement>) {}

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

  ngAfterViewInit() {
    const root = this.scroller?.nativeElement ?? null;
    const els = this.host.nativeElement.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { root, threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  public tilt(event: MouseEvent) {
    const el = event.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    const px = (event.clientX - r.left) / r.width - 0.5;
    const py = (event.clientY - r.top) / r.height - 0.5;
    this.tiltStyle = `perspective(900px) rotateX(${(-py * 12).toFixed(
      2
    )}deg) rotateY(${(px * 12).toFixed(2)}deg)`;
  }
  public resetTilt() {
    this.tiltStyle = 'perspective(900px) rotateX(0) rotateY(0)';
  }

  public linkify(text: string): string {
    return linkifyProfileText(text);
  }

  public openCv() {
    window.open(this.cvPdf, '_blank');
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
