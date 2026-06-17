import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { PUBLICATIONS, Publication } from '../../../data/publications';
import { parseBibtex } from '../../../data/bibtex';

@Component({
  selector: 'app-publication-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publication-page.component.html',
  styleUrl: './publication-page.component.scss',
})
export class PublicationPageComponent implements OnInit {
  public publications: Publication[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // .bib 를 불러와 파싱 → 수동 항목과 병합 → 연도 내림차순 정렬
    this.http
      .get('assets/publications.bib', { responseType: 'text' })
      .subscribe({
        next: (bib) => this.merge(parseBibtex(bib)),
        error: () => this.merge([]), // .bib 가 없거나 실패하면 수동 항목만
      });
  }

  private merge(fromBib: Publication[]) {
    this.publications = [...fromBib, ...PUBLICATIONS].sort(
      (a, b) => b.year - a.year
    );
  }
}
