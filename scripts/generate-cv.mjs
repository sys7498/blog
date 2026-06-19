// Generate a PDF CV from the same profile data and BibTeX used by the site.
// Runs before local start/build so Download CV always points at a real file.

import PDFDocument from 'pdfkit';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PROFILE_TS = join(ROOT, 'src', 'data', 'profile.ts');
const BIB = join(ROOT, 'src', 'assets', 'publications.bib');
const OUT = join(ROOT, 'src', 'assets', 'Yoonseok_Shin_CV.pdf');

function extractProfile() {
  const text = readFileSync(PROFILE_TS, 'utf8');
  const marker = 'export const PROFILE: Profile =';
  const start = text.indexOf(marker);
  if (start === -1) throw new Error('PROFILE export not found');
  const objectStart = text.indexOf('{', start);
  if (objectStart === -1) throw new Error('PROFILE object boundary not found');
  const [body] = readBraced(text, objectStart);
  const literal = `{${body}}`;
  return Function(`"use strict"; return (${literal});`)();
}

function readBraced(src, start) {
  let depth = 0;
  let out = '';
  let i = start;
  for (; i < src.length; i++) {
    const c = src[i];
    if (c === '{') {
      depth++;
      if (depth === 1) continue;
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

function clean(value) {
  return value.replace(/[{}]/g, '').replace(/\s+/g, ' ').trim();
}

function formatAuthors(raw) {
  return raw
    .split(/\s+and\s+/i)
    .map((name) => {
      const parts = name.split(',');
      if (parts.length === 2) return `${parts[1].trim()} ${parts[0].trim()}`;
      return name.trim();
    })
    .join(', ');
}

function parseBibtex(src) {
  const pubs = [];
  let i = 0;
  while (i < src.length) {
    if (src[i] !== '@') {
      i++;
      continue;
    }
    i++;
    while (i < src.length && /[a-zA-Z]/.test(src[i])) i++;
    while (i < src.length && /\s/.test(src[i])) i++;
    if (src[i] !== '{') continue;
    i++;
    while (i < src.length && src[i] !== ',' && src[i] !== '}') i++;
    if (src[i] === ',') i++;

    const fields = {};
    while (i < src.length) {
      while (i < src.length && /[\s,]/.test(src[i])) i++;
      if (src[i] === '}') {
        i++;
        break;
      }
      let name = '';
      while (i < src.length && /[a-zA-Z0-9_-]/.test(src[i])) name += src[i++];
      while (i < src.length && /\s/.test(src[i])) i++;
      if (src[i] !== '=') break;
      i++;
      while (i < src.length && /\s/.test(src[i])) i++;

      let value = '';
      if (src[i] === '{') {
        [value, i] = readBraced(src, i);
      } else if (src[i] === '"') {
        i++;
        while (i < src.length && src[i] !== '"') value += src[i++];
        i++;
      } else {
        while (i < src.length && !/[,}\n]/.test(src[i])) value += src[i++];
      }
      if (name) fields[name.toLowerCase()] = value;
    }

    if (!fields.title) continue;
    const cat = clean(fields.category || '').toLowerCase();
    pubs.push({
      title: clean(fields.title),
      authors: formatAuthors(clean(fields.author || '')),
      venue: clean(fields.journal || fields.booktitle || fields.note || 'Preprint'),
      year: Number.parseInt(clean(fields.year || '0'), 10) || 0,
      category: cat.includes('demo') || cat.includes('poster') ? 'Demos & Posters' : 'Papers',
      doi: clean(fields.doi || ''),
      award: clean(fields.award || ''),
    });
  }
  return pubs.sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
}

function addSection(doc, title) {
  doc.moveDown(0.9);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#111').text(title.toUpperCase());
  doc.moveTo(doc.x, doc.y + 3).lineTo(540, doc.y + 3).strokeColor('#dddddd').stroke();
  doc.moveDown(0.6);
}

function addEntry(doc, left, title, lines = []) {
  const top = doc.y;
  doc.font('Helvetica').fontSize(9).fillColor('#777').text(left, 54, top, { width: 82 });
  doc.font('Helvetica-Bold').fontSize(10.5).fillColor('#111').text(title, 145, top, { width: 395 });
  for (const line of lines.filter(Boolean)) {
    doc.font('Helvetica').fontSize(9.5).fillColor('#444').text(line, 145, doc.y + 2, { width: 395 });
  }
  doc.moveDown(0.55);
}

function addAuthors(doc, authors) {
  const parts = authors.split(/(Yoonseok Shin|Y\. Shin)/g).filter(Boolean);
  doc.fontSize(9.3).fillColor('#444');
  for (const part of parts) {
    const isMe = part === 'Yoonseok Shin' || part === 'Y. Shin';
    doc.font(isMe ? 'Helvetica-Bold' : 'Helvetica').text(part, { continued: true });
  }
  doc.text('');
}

const profile = extractProfile();
const publications = parseBibtex(readFileSync(BIB, 'utf8'));

mkdirSync(dirname(OUT), { recursive: true });
const chunks = [];
const doc = new PDFDocument({ size: 'A4', margin: 54, info: { Title: `${profile.name} CV` } });
doc.on('data', (chunk) => chunks.push(chunk));
doc.on('end', () => {
  writeFileSync(OUT, Buffer.concat(chunks));
  console.log(`[generate-cv] ${OUT}`);
});

doc.font('Helvetica-Bold').fontSize(24).fillColor('#111').text(profile.name);
doc.font('Helvetica').fontSize(10.5).fillColor('#444').text(`${profile.role} - ${profile.affiliation}`);
doc.moveDown(0.25);
doc.fontSize(9.5).fillColor('#555').text(`${profile.location} | ${profile.email} | github.com/sys7498 | Google Scholar`);
doc.moveDown(0.9);
doc.font('Helvetica').fontSize(10.5).fillColor('#222').text(profile.tagline, { width: 480, lineGap: 2 });

addSection(doc, 'Education');
for (const item of profile.education) addEntry(doc, item.period, item.title, [item.org, item.location]);

addSection(doc, 'Experience');
for (const item of profile.experience) addEntry(doc, item.period, item.title, [item.org, item.location, item.detail]);

addSection(doc, 'Publications');
for (const pub of publications) {
  const top = doc.y;
  doc.font('Helvetica').fontSize(9).fillColor('#777').text(String(pub.year), 54, top, { width: 82 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#111').text(pub.title, 145, top, { width: 395 });
  doc.font('Helvetica').fontSize(9).fillColor('#777').text(`${pub.category} | ${pub.venue}`, 145, doc.y + 2, { width: 395 });
  if (pub.award) doc.font('Helvetica-Bold').fontSize(9).fillColor('#7a4d00').text(`Award: ${pub.award}`, 145, doc.y + 2, { width: 395 });
  addAuthors(doc, pub.authors);
  if (pub.doi) doc.font('Helvetica').fontSize(8.7).fillColor('#666').text(`DOI: ${pub.doi}`, 145, doc.y + 1, { width: 395 });
  doc.moveDown(0.55);
}

addSection(doc, 'Skills');
for (const group of profile.skills) addEntry(doc, group.group, group.items.join(', '));

doc.moveDown(0.5);
doc.font('Helvetica').fontSize(8).fillColor('#888').text('Generated from website profile data and publications.bib.', {
  align: 'right',
});

doc.end();
