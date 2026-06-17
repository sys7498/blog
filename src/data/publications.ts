// 출판물 데이터.
//
// 두 가지 방법으로 추가할 수 있습니다 (둘은 자동으로 합쳐집니다):
//   1) BibTeX: src/assets/publications.bib 에 항목을 붙여넣기 (Scholar/arXiv에서 복사)
//   2) Manual: 아래 PUBLICATIONS 배열에 직접 추가
//
// 같은 해 안에서는 BibTeX 항목이 먼저, 그다음 manual 항목 순으로 표시됩니다.

export type PubCategory = 'paper' | 'demo-poster';

export interface Publication {
  title: string;
  authors: string;
  venue: string; // 학회/저널
  year: number;
  category: PubCategory; // 'paper' | 'demo-poster' (.bib 의 category 필드로 지정)
  thumbnail?: string; // 썸네일 이미지 (.bib 의 image/thumbnail 필드). 없으면 플레이스홀더
  links?: { label: string; url: string }[];
}

// 수동 입력 항목 (BibTeX 로 관리하면 비워둬도 됩니다)
export const PUBLICATIONS: Publication[] = [
  // 예시:
  // {
  //   title: 'A manually-added paper',
  //   authors: 'Yoonseok Shin, et al.',
  //   venue: 'Some Venue',
  //   year: 2024,
  //   links: [{ label: 'PDF', url: '#' }],
  // },
];
