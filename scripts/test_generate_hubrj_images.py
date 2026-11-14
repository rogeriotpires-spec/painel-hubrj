"""Regressions for paid generation, protocol binding and file preservation."""
import base64
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import urllib.error

import generate_hubrj_images as gen


class ImageGenerationSafetyTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.ai = self.root / 'portal/assets/ai'
        self.ai.mkdir(parents=True)
        self.projects_file = self.root / 'portal/data/projects.json'
        self.projects_file.parent.mkdir()
        self.projects = [dict(id=str(100001 + i), title=f'Projeto {i}',
                              fullSummary='Formação de professores com atividades STEM.',
                              applicant='DADO PESSOAL NAO ENVIAR') for i in range(4)]
        self.projects_file.write_text(json.dumps(self.projects))
        self.image = (gen.AI_DIR / '319542.webp').read_bytes()
        (self.ai / '100001.webp').write_bytes(self.image)
        for filename in gen.INDEX_FILES:
            (self.root / filename).write_text('HEADER; const aiIds=new Set(["100001"]); FOOTER;')
        for key, value in [('ROOT', self.root), ('PROJECTS', self.projects_file),
                           ('AI_DIR', self.ai), ('MANIFEST', self.ai / 'manifest.json')]:
            patcher = patch.object(gen, key, value)
            patcher.start()
            self.addCleanup(patcher.stop)
        gen.update_index(self.projects)
        self.report = self.root / 'report.json'

    def run_main(self, *args):
        with patch('sys.argv', ['generate', *args]), patch.dict('os.environ', {
            'OPENAI_API_KEY': 'test-only', 'GITHUB_STEP_SUMMARY': ''
        }):
            gen.main()

    def snapshot(self):
        return {str(p.relative_to(self.root)): p.read_bytes() for p in self.root.rglob('*') if p.is_file()}

    def test_protocols_and_indexes_match(self):
        gen.validate_indexes(gen.load_projects(), gen.image_inventory(self.projects))

    def test_three_images_preserve_portal_and_resume_without_duplicate_cost(self):
        before = self.snapshot()
        with patch.object(gen, 'generate', return_value=self.image) as generate:
            self.run_main('--limit', '3', '--report', str(self.report))
            self.assertEqual(generate.call_count, 3)
            self.run_main('--limit', '3')
            self.assertEqual(generate.call_count, 3)
        self.assertEqual((self.ai / '100001.webp').read_bytes(), self.image)
        self.assertEqual(self.projects_file.read_bytes(), before['portal/data/projects.json'])
        for filename in gen.INDEX_FILES:
            self.assertEqual(gen.AI_EXPRESSION.sub('', (self.root / filename).read_text()),
                             gen.AI_EXPRESSION.sub('', before[filename].decode()))
        gen.validate_indexes(self.projects, gen.image_inventory(self.projects))
        self.assertEqual(json.loads(self.report.read_text())['pending'], 0)

    def test_partial_failure_retains_first_success_and_reports_failure(self):
        with patch.object(gen, 'generate', side_effect=[self.image, RuntimeError('API unavailable')]):
            with self.assertRaisesRegex(RuntimeError, 'API unavailable'):
                self.run_main('--limit', '3', '--report', str(self.report))
        report = json.loads(self.report.read_text())
        self.assertEqual(report['generated'], ['100002'])
        self.assertEqual(report['status'], 'failed')
        gen.validate_indexes(self.projects, gen.image_inventory(self.projects))

    def test_dry_run_never_calls_api_or_modifies_files(self):
        before = self.snapshot()
        with patch.object(gen, 'generate') as generate:
            self.run_main('--dry-run')
            generate.assert_not_called()
        self.assertEqual(before, self.snapshot())

    def test_duplicate_protocol_fails_before_generation(self):
        self.projects.append(self.projects[0])
        self.projects_file.write_text(json.dumps(self.projects))
        with self.assertRaisesRegex(ValueError, 'duplicado'):
            gen.load_projects()

    def test_missing_key_creates_failure_report_without_api_call(self):
        with patch('sys.argv', ['generate', '--report', str(self.report)]), patch.dict('os.environ', {
            'OPENAI_API_KEY': '', 'GITHUB_STEP_SUMMARY': ''
        }), patch.object(gen, 'generate') as generate:
            with self.assertRaisesRegex(RuntimeError, 'OPENAI_API_KEY ausente'):
                gen.main()
            generate.assert_not_called()
        self.assertEqual(json.loads(self.report.read_text())['published'], [])

    def test_unknown_requested_protocol_is_rejected(self):
        with self.assertRaises(SystemExit), patch.object(gen, 'generate') as generate:
            self.run_main('--protocols', '999999')
        generate.assert_not_called()

    def test_orphan_or_corrupt_image_fails_before_api(self):
        orphan = self.ai / '999999.webp'
        orphan.write_bytes(self.image)
        with self.assertRaisesRegex(ValueError, 'sem protocolo'):
            gen.image_inventory(self.projects)
        orphan.unlink()
        (self.ai / '100001.webp').write_bytes(b'RIFF0000WEBPbroken')
        with self.assertRaises((ValueError, OSError)):
            gen.image_inventory(self.projects)

    def test_missing_index_marker_never_partially_updates_portal(self):
        (self.root / gen.INDEX_FILES[1]).write_text('preserve this content')
        before = self.snapshot()
        with self.assertRaises(RuntimeError):
            gen.update_index(self.projects)
        self.assertEqual(before, self.snapshot())

    def test_auth_failure_does_not_retry_or_expose_response(self):
        error = urllib.error.HTTPError('https://api.openai.com', 401, 'Unauthorized', {},
                                       io.BytesIO(b'{"error":{"message":"private detail"}}'))
        with patch.object(gen.urllib.request, 'urlopen', side_effect=error) as call, patch.object(gen.time, 'sleep') as sleep:
            with self.assertRaisesRegex(RuntimeError, 'HTTP 401') as raised:
                gen.generate('prompt', 'test-only', 'gpt-image-2.5-flare')
            self.assertNotIn('private detail', str(raised.exception))
            self.assertEqual(call.call_count, 1)
            sleep.assert_not_called()

    def test_transient_error_waits_two_minutes_then_recovers(self):
        error = urllib.error.HTTPError('https://api.openai.com', 429, 'Rate limit', {},
                                       io.BytesIO(b'{"error":{"code":"rate_limit_exceeded"}}'))
        response = io.BytesIO(json.dumps({'data': [{'b64_json': base64.b64encode(self.image).decode()}]}).encode())
        with patch.object(gen.urllib.request, 'urlopen', side_effect=[error, response]), patch.object(gen.time, 'sleep') as sleep:
            self.assertEqual(gen.generate('prompt', 'test-only', 'gpt-image-2.5-flare'), self.image)
            sleep.assert_called_once_with(120)

    def test_quota_in_error_type_stops_without_retries(self):
        error = urllib.error.HTTPError('https://api.openai.com', 429, 'Quota', {},
                                      io.BytesIO(b'{"error":{"code":null,"type":"insufficient_quota","message":"private detail"}}'))
        with patch.object(gen.urllib.request, 'urlopen', side_effect=error), patch.object(gen.time, 'sleep') as sleep:
            with self.assertRaisesRegex(RuntimeError, 'sem cota') as raised:
                gen.generate('prompt', 'test-only', 'gpt-image-2.5-flare')
            self.assertNotIn('private detail', str(raised.exception))
            sleep.assert_not_called()

    def test_zero_rate_limit_stops_without_leaking_server_message(self):
        error = urllib.error.HTTPError('https://api.openai.com', 429, 'Rate limit', {},
                                      io.BytesIO(b'{"error":{"code":"rate_limit_exceeded","message":"Private organization; Limit: 0"}}'))
        with patch.object(gen.urllib.request, 'urlopen', side_effect=error), patch.object(gen.time, 'sleep') as sleep:
            with self.assertRaisesRegex(RuntimeError, 'sem cota') as raised:
                gen.generate('prompt', 'test-only', 'gpt-image-2.5-flare')
            self.assertNotIn('Private organization', str(raised.exception))
            sleep.assert_not_called()

    def test_exhausted_credit_is_not_treated_as_temporary_rate_limit(self):
        error = urllib.error.HTTPError('https://api.openai.com', 429, 'Credit balance', {},
                                      io.BytesIO(b'{"error":{"code":"credit_balance_exhausted"}}'))
        with patch.object(gen.urllib.request, 'urlopen', side_effect=error), patch.object(gen.time, 'sleep') as sleep:
            with self.assertRaisesRegex(RuntimeError, 'credit_balance_exhausted'):
                gen.generate('prompt', 'test-only', 'gpt-image-2.5-flare')
            sleep.assert_not_called()

    def test_prompt_excludes_applicant_fields(self):
        self.assertNotIn('DADO PESSOAL', gen.prompt_for(self.projects[0]))


if __name__ == '__main__':
    unittest.main()
