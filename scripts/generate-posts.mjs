// 블로그 글 인덱스 자동 생성.
// src/assets/posts/*.md 의 프론트매터(--- title/date/summary ---)를 읽어
// src/assets/posts/index.json 으로 정리합니다.
//
// 새 글 = .md 파일 하나만 추가하면 됩니다. (npm start / npm run build 시 자동 실행)
// 수동 실행: npm run generate:posts

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = join(__dirname, '..', 'src', 'assets', 'posts');
const OUT = join(POSTS_DIR, 'index.json');

/** 아주 단순한 프론트매터 파서 (key: value, 따옴표 제거) */
function parseFrontmatter(text) {
  const m = text.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
  const meta = {};
  if (!m) return meta;
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let val = line.slice(idx + 1).trim();
    val = val.replace(/^["']|["']$/g, '');
    if (key) meta[key] = val;
  }
  return meta;
}

const files = readdirSync(POSTS_DIR).filter((f) => f.endsWith('.md'));

const posts = files.map((file) => {
  const slug = basename(file, '.md');
  const text = readFileSync(join(POSTS_DIR, file), 'utf8');
  const meta = parseFrontmatter(text);
  return {
    slug,
    title: meta.title || slug,
    date: meta.date || '',
    summary: meta.summary || '',
  };
});

// 날짜 내림차순 (최신 글이 위로)
posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

writeFileSync(OUT, JSON.stringify(posts, null, 2) + '\n', 'utf8');
console.log(`[generate-posts] ${posts.length} posts → ${OUT}`);
