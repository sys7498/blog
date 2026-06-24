import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import type { jsPDF as JsPDF } from 'jspdf';
import { PROFILE } from '../../data/profile';
import { PROJECTS } from '../../data/projects';
import { PUBLICATIONS, Publication } from '../../data/publications';
import { parseBibtex } from '../../data/bibtex';

@Injectable({ providedIn: 'root' })
export class CvService {
  constructor(private http: HttpClient) {}

  public async download(): Promise<void> {
    const { jsPDF } = await import('jspdf');
    const publications = await this.loadPublications();
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const layout = new CvLayout(doc);

    layout.header();
    layout.section('Summary');
    layout.paragraph(PROFILE.tagline);
    for (const para of PROFILE.bio) layout.paragraph(stripHtml(para));

    layout.section('Work Experience');
    for (const item of PROFILE.experience) {
      layout.entry(item.title, item.period, [
        item.org,
        item.location || '',
        item.detail || '',
      ]);
    }

    layout.section('Projects');
    for (const project of PROJECTS.filter((p) => p.slug !== 'embed-example')) {
      layout.entry(project.title, String(project.year), [
        project.summary,
        project.tags.join(', '),
      ]);
    }

    layout.section('Education');
    for (const item of PROFILE.education) {
      layout.entry(item.title, item.period, [item.org, item.location || '']);
    }

    layout.section('Publications');
    for (const pub of publications) layout.publication(pub);

    layout.section('Skills');
    for (const group of PROFILE.skills) {
      layout.skill(group.group, group.items.join(', '));
    }

    layout.footer();
    doc.save('Yoonseok_Shin_CV.pdf');
  }

  private async loadPublications(): Promise<Publication[]> {
    try {
      const bib = await firstValueFrom(
        this.http.get('assets/publications.bib', { responseType: 'text' })
      );
      return [...parseBibtex(bib), ...PUBLICATIONS].sort(
        (a, b) => b.year - a.year || a.title.localeCompare(b.title)
      );
    } catch {
      return [...PUBLICATIONS].sort(
        (a, b) => b.year - a.year || a.title.localeCompare(b.title)
      );
    }
  }
}

class CvLayout {
  private readonly margin = 42;
  private readonly pageWidth = 595.28;
  private readonly pageHeight = 841.89;
  private readonly contentWidth = this.pageWidth - this.margin * 2;
  private y = this.margin;

  constructor(private doc: JsPDF) {}

  public header(): void {
    const links = [
      'github.com/sys7498',
      'linkedin.com/in/yoonseok-shin-562055310',
      'scholar.google.com/citations?user=g8hg2zwAAAAJ',
      PROFILE.email,
    ];

    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(25);
    this.doc.text(PROFILE.name, this.pageWidth / 2, this.y, { align: 'center' });
    this.y += 20;

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(35, 35, 35);
    this.centerWrapped(links.join(' | '));
    this.y += 10;
  }

  public section(title: string): void {
    this.ensureSpace(44);
    this.y += 8;
    this.doc.setTextColor(17, 17, 17);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(14);
    this.doc.text(title, this.margin, this.y);
    this.y += 7;
    this.doc.setDrawColor(35, 35, 35);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 13;
  }

  public paragraph(text: string): void {
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.ensureSpace(lines.length * 13 + 6);
    this.doc.setTextColor(45, 45, 45);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(10);
    this.doc.text(lines, this.margin, this.y);
    this.y += lines.length * 13 + 5;
  }

  public entry(title: string, right: string, lines: string[]): void {
    this.ensureSpace(44);
    const titleWidth = this.contentWidth - 110;
    this.doc.setTextColor(17, 17, 17);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10.5);
    const titleLines = this.doc.splitTextToSize(title, titleWidth);
    this.doc.text(titleLines, this.margin, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9.5);
    this.doc.setTextColor(95, 95, 95);
    this.doc.text(right, this.pageWidth - this.margin, this.y, { align: 'right' });
    this.y += titleLines.length * 12 + 3;

    for (const line of lines.filter(Boolean)) {
      const wrapped = this.doc.splitTextToSize(line, this.contentWidth);
      this.ensureSpace(wrapped.length * 12 + 2);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(9.5);
      this.doc.setTextColor(55, 55, 55);
      this.doc.text(wrapped, this.margin, this.y);
      this.y += wrapped.length * 12 + 2;
    }
    this.y += 5;
  }

  public publication(pub: Publication): void {
    const category = pub.category === 'demo-poster' ? 'Demos & Posters' : 'Papers';
    const meta = [String(pub.year), category, pub.venue].filter(Boolean).join(' | ');
    this.ensureSpace(58);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setFontSize(10);
    this.doc.setTextColor(17, 17, 17);
    const titleLines = this.doc.splitTextToSize(pub.title, this.contentWidth);
    this.doc.text(titleLines, this.margin, this.y);
    this.y += titleLines.length * 12 + 2;

    if (pub.award) {
      this.doc.setFont('helvetica', 'bold');
      this.doc.setFontSize(9);
      this.doc.setTextColor(122, 77, 0);
      this.doc.text(`Award: ${pub.award}`, this.margin, this.y);
      this.y += 11;
    }

    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(9);
    this.doc.setTextColor(95, 95, 95);
    this.doc.text(meta, this.margin, this.y);
    this.y += 11;

    this.authors(stripHtml(pub.authors));

    const doi = pub.links?.find((link) => link.label === 'DOI')?.url;
    if (doi) {
      this.doc.setTextColor(95, 95, 95);
      this.doc.setFontSize(8.5);
      this.doc.text(doi, this.margin, this.y);
      this.y += 10;
    }
    this.y += 5;
  }

  public skill(group: string, items: string): void {
    this.ensureSpace(22);
    this.doc.setFontSize(10);
    this.doc.setTextColor(17, 17, 17);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(group, this.margin, this.y);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(45, 45, 45);
    const lines = this.doc.splitTextToSize(items, this.contentWidth - 110);
    this.doc.text(lines, this.margin + 110, this.y);
    this.y += Math.max(14, lines.length * 12 + 2);
  }

  public footer(): void {
    this.doc.setFont('helvetica', 'normal');
    this.doc.setFontSize(8);
    this.doc.setTextColor(130, 130, 130);
    this.doc.text(
      `Last updated: ${new Date().toISOString().slice(0, 10)}`,
      this.pageWidth / 2,
      this.pageHeight - 24,
      { align: 'center' }
    );
  }

  private authors(authors: string): void {
    const parts = authors.split(/(Yoonseok Shin|Y\. Shin)/g).filter(Boolean);
    let x = this.margin;
    const maxX = this.pageWidth - this.margin;
    const lineHeight = 11;
    this.doc.setFontSize(9);

    for (const part of parts) {
      this.doc.setFont('helvetica', part === 'Yoonseok Shin' || part === 'Y. Shin' ? 'bold' : 'normal');
      this.doc.setTextColor(55, 55, 55);
      const chunks = part.split(/(\s+)/);
      for (const chunk of chunks) {
        const w = this.doc.getTextWidth(chunk);
        if (x + w > maxX && chunk.trim()) {
          x = this.margin;
          this.y += lineHeight;
        }
        this.doc.text(chunk, x, this.y);
        x += w;
      }
    }
    this.y += lineHeight;
  }

  private centerWrapped(text: string): void {
    const lines = this.doc.splitTextToSize(text, this.contentWidth);
    this.doc.text(lines, this.pageWidth / 2, this.y, { align: 'center' });
    this.y += lines.length * 11;
  }

  private ensureSpace(height: number): void {
    if (this.y + height <= this.pageHeight - this.margin) return;
    this.doc.addPage();
    this.y = this.margin;
  }
}

function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
