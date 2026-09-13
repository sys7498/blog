import importlib.util
import unittest
from pathlib import Path
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('sync', Path(__file__).with_name('sync-publications.py'))
sync = importlib.util.module_from_spec(spec)
spec.loader.exec_module(sync)


def work(doi='10.1234/example', title='New Research', kind='proceedings-article'):
    return {'DOI': doi, 'title': [title], 'type': kind,
            'author': [{'given': 'Yoonseok', 'family': 'Shin', 'ORCID': 'https://orcid.org/' + sync.ORCID}],
            'published': {'date-parts': [[2026]]}, 'container-title': ['Conference']}


class SyncTests(unittest.TestCase):
    def test_curated_fields_and_case_insensitive_doi_are_preserved(self):
        bib = '@misc{x, title={Curated}, doi={10.1234/EXAMPLE}, category={demo-poster}, award={Award}, image={custom.jpg}}'
        self.assertEqual(sync.merge_bib(bib, [work()]), (bib, 0))

    def test_title_duplicate_and_repeat_run(self):
        bib = '@misc{x, title={New Research!}}'
        self.assertEqual(sync.merge_bib(bib, [work()]), (bib, 0))
        updated, count = sync.merge_bib('', [work(), work()])
        self.assertEqual(count, 1)
        self.assertEqual(sync.merge_bib(updated, [work()]), (updated, 0))

    def test_ambiguous_proceedings_not_mislabelled_as_paper(self):
        updated, _ = sync.merge_bib('', [work()])
        self.assertIn('category = {unclassified}', updated)
        updated, _ = sync.merge_bib('', [work(kind='journal-article')])
        self.assertIn('category = {paper}', updated)

    def test_wrong_author_is_ignored(self):
        item = work()
        item['author'][0]['given'] = 'Someone'
        self.assertEqual(sync.merge_bib('', [item]), ('', 0))
        item = work()
        item['author'][0]['ORCID'] = 'https://orcid.org/other'
        self.assertEqual(sync.merge_bib('', [item]), ('', 0))

    def test_pagination_and_failure(self):
        responses = iter([{'message': {'items': [work()] * 100, 'next-cursor': 'next'}},
                          {'message': {'items': [work()]}}])
        self.assertEqual(len(sync.collect_works(lambda url: next(responses))), 101)
        with self.assertRaises(KeyError):
            sync.collect_works(lambda url: {'error': 'unavailable'})

    def test_failure_does_not_write_bibliography(self):
        with patch.object(sync, 'collect_works', side_effect=TimeoutError), patch.object(Path, 'write_text') as write:
            with self.assertRaises(TimeoutError):
                sync.main()
            write.assert_not_called()

    def test_missing_year_rejected_and_metadata_sanitized(self):
        item = work(title='<i>Nested</i> {Research}')
        updated, _ = sync.merge_bib('', [item])
        self.assertIn('title = {Nested Research}', updated)
        item['published'] = {}
        with self.assertRaises(ValueError):
            sync.merge_bib('', [item])


if __name__ == '__main__':
    unittest.main()
