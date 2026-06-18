// 의존성 없는 경량 BibTeX 파서. src/assets/publications.bib 를 Publication[] 으로 변환합니다.
// 표준 @article / @inproceedings / @misc 등 일반적인 엔트리를 처리합니다.

import { Publication } from './publications';

/** "{...}" 형태의 중괄호 균형을 맞춰 안쪽 내용을 읽음 (중첩 중괄호 보존) */
function readBraced(src: string, start: number): [string, number] {
  let depth = 0;
  let out = '';
  let i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{') {
      depth++;
      if (depth === 1) continue; // 바깥 중괄호 제외
    }
    if (c === '}') {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
    out += c;
  }
  return [out, i];
}

/** "Last, First and Last, First" → "First Last, First Last" */
function formatAuthors(raw: string): string {
  return raw
    .split(/\s+and\s+/i)
    .map((name) => {
      const parts = name.split(',');
      if (parts.length === 2) {
        return `${parts[1].trim()} ${parts[0].trim()}`;
      }
      return name.trim();
    })
    .map((name) => (name === 'Yoonseok Shin' ? '<strong>Yoonseok Shin</strong>' : name))
    .join(', ');
}

function clean(v: string): string {
  return v.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

export function parseBibtex(src: string): Publication[] {
  const pubs: Publication[] = [];
  let i = 0;
  const n = src.length;

  while (i < n) {
    if (src[i] !== '@') {
      i++;
      continue;
    }
    i++; // '@'
    let type = '';
    while (i < n && /[a-zA-Z]/.test(src[i])) type += src[i++];
    type = type.toLowerCase();
    while (i < n && /\s/.test(src[i])) i++;
    if (src[i] !== '{') continue;
    i++; // '{'

    // citation key (사용하지 않지만 건너뛰기 위해 읽음)
    while (i < n && src[i] !== ',' && src[i] !== '}') i++;
    if (src[i] === ',') i++;

    const f: Record<string, string> = {};
    while (i < n) {
      while (i < n && /[\s,]/.test(src[i])) i++;
      if (src[i] === '}') {
        i++;
        break;
      }
      let name = '';
      while (i < n && /[a-zA-Z0-9_\-]/.test(src[i])) name += src[i++];
      while (i < n && /\s/.test(src[i])) i++;
      if (src[i] !== '=') break; // malformed
      i++; // '='
      while (i < n && /\s/.test(src[i])) i++;

      let value = '';
      if (src[i] === '{') {
        [value, i] = readBraced(src, i);
      } else if (src[i] === '"') {
        i++;
        while (i < n && src[i] !== '"') value += src[i++];
        i++;
      } else {
        while (i < n && !/[,}\n]/.test(src[i])) value += src[i++];
      }
      if (name) f[name.toLowerCase().trim()] = value;
    }

    if (Object.keys(f).length === 0) continue;

    const links: { label: string; url: string }[] = [];
    if (f['url']) links.push({ label: 'Link', url: clean(f['url']) });
    if (f['pdf']) links.push({ label: 'PDF', url: clean(f['pdf']) });
    if (f['arxiv'])
      links.push({ label: 'arXiv', url: `https://arxiv.org/abs/${clean(f['arxiv'])}` });
    if (f['doi'])
      links.push({ label: 'DOI', url: `https://doi.org/${clean(f['doi'])}` });
    if (f['code']) links.push({ label: 'Code', url: clean(f['code']) });

    const venue =
      clean(f['journal'] || f['booktitle'] || f['publisher'] || f['school'] || f['note'] || '') ||
      'Preprint';

    // category 필드로 분류 ('demo'/'poster' 포함 시 demo-poster, 기본 paper)
    const cat = clean(f['category'] || '').toLowerCase();
    const category: 'paper' | 'demo-poster' =
      cat.includes('demo') || cat.includes('poster') ? 'demo-poster' : 'paper';

    const thumbnail = clean(f['thumbnail'] || f['image'] || '') || undefined;

    pubs.push({
      title: clean(f['title'] || 'Untitled'),
      authors: formatAuthors(clean(f['author'] || '')),
      venue,
      year: parseInt(clean(f['year'] || '0'), 10) || 0,
      category,
      thumbnail,
      links: links.length ? links : undefined,
    });
  }

  return pubs;
}
