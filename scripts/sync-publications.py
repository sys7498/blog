"""Append ORCID-verified Crossref works without overwriting curated BibTeX."""
import json
import re
import sys
import unicodedata
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
ORCID = '0009-0004-4164-9559'
BIB = ROOT / 'src/assets/publications.bib'


def fetch_json(url):
    request = Request(url, headers={
        'Accept': 'application/json',
        'User-Agent': 'YoonseokBlog/1.0 (mailto:sys7498@kaist.ac.kr)',
    })
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def collect_works(fetch=fetch_json):
    cursor, seen, works = '*', set(), []
    while True:
        query = urlencode({'filter': f'orcid:{ORCID}', 'rows': 100,
                           'cursor': cursor, 'mailto': 'sys7498@kaist.ac.kr'})
        result = fetch('https://api.crossref.org/works?' + query)
        message = result['message']
        items = message['items']
        if not isinstance(items, list):
            raise ValueError('Invalid Crossref response')
        works.extend(items)
        if len(items) < 100:
            return works
        next_cursor = message.get('next-cursor')
        if not next_cursor or next_cursor in seen:
            raise ValueError('Crossref pagination did not advance')
        seen.add(next_cursor)
        cursor = next_cursor


def normalized(value):
    return re.sub(r'[^\w]', '', unicodedata.normalize('NFKC', value).casefold())


def safe(value):
    # Strip markup and BibTeX delimiters from externally supplied metadata.
    return re.sub(r'\s+', ' ', re.sub(r'<[^>]*>|[{}\\]', '', str(value))).strip()


def merge_bib(existing, works):
    dois = {d.lower().strip() for d in re.findall(r'\bdoi\s*=\s*\{([^}]+)\}', existing, re.I)}
    titles = {normalized(t) for t in re.findall(r'\btitle\s*=\s*\{([^}]+)\}', existing, re.I)}
    additions = []
    for work in sorted(works, key=lambda w: w.get('DOI', '').lower()):
        authors = work.get('author', [])
        if not any(a.get('ORCID', '').rstrip('/').endswith('/' + ORCID)
                   and normalized(a.get('given', '') + a.get('family', '')) == 'yoonseokshin'
                   for a in authors):
            continue
        doi = work.get('DOI', '').lower().strip()
        title = safe((work.get('title') or [''])[0])
        if not re.fullmatch(r'10\.\d{4,9}/[^\s{}\\]+', doi) or not title:
            raise ValueError('Verified work is missing a valid DOI or title')
        if doi in dois or normalized(title) in titles:
            continue
        date = work.get('published', {}).get('date-parts', [[]])[0]
        if not date or not isinstance(date[0], int) or not 1900 <= date[0] <= 2200:
            raise ValueError(f'Missing publication year: {doi}')
        venue = safe((work.get('container-title') or [''])[0])
        # Proceedings metadata alone cannot distinguish full papers from demos.
        category = 'paper' if work.get('type') == 'journal-article' else 'unclassified'
        fields = {
            'title': title,
            'author': ' and '.join(safe(' '.join(filter(None, [a.get('given'), a.get('family')])) or a.get('name', '')) for a in authors),
            'journal' if work.get('type') == 'journal-article' else 'booktitle': venue,
            'year': str(date[0]), 'category': category, 'doi': doi,
            'url': 'https://doi.org/' + doi,
        }
        key = 'crossref_' + re.sub(r'[^a-z0-9]', '_', doi)
        entry_type = 'article' if work.get('type') == 'journal-article' else 'misc'
        additions.append('@' + entry_type + '{' + key + ',\n' +
                         ',\n'.join(f'  {k} = {{{v}}}' for k, v in fields.items() if v) + '\n}')
        dois.add(doi)
        titles.add(normalized(title))
    if not additions:
        return existing, 0
    return existing.rstrip() + '\n\n% Automatically imported from Crossref; edit category/image/award here.\n' + '\n\n'.join(additions) + '\n', len(additions)


def main():
    existing = BIB.read_text()
    updated, count = merge_bib(existing, collect_works())
    if updated != existing:
        temporary = BIB.with_suffix('.bib.tmp')
        temporary.write_text(updated)
        temporary.replace(BIB)
    print(f'Crossref: {count} new publications; existing metadata preserved.')


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print(f'Publication sync failed; existing bibliography retained: {error}', file=sys.stderr)
        sys.exit(1)
