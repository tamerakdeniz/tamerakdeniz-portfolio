import { test } from 'node:test';
import assert from 'node:assert/strict';
import { cvPreviewSrc } from '@/lib/cv-preview';

const local = '/resume/Mustafa-Tamer-Akdeniz-Resume.pdf';
const remote = 'https://firebasestorage.googleapis.com/v0/b/demo.appspot.com/o/resume.pdf?alt=media&token=1';
const proxy = `/api/download-cv?url=${encodeURIComponent(remote)}&name=Mustafa-Tamer-Akdeniz-Resume.pdf`;

test('same-origin CV paths are rendered directly', () => {
  assert.equal(cvPreviewSrc(local, local), local);
});

test('registered remote CVs are read through the download route', () => {
  assert.equal(cvPreviewSrc(remote, proxy), proxy);
});

test('unregistered cross-origin URLs are not fetched', () => {
  assert.equal(cvPreviewSrc('https://example.com/secret.pdf', 'https://example.com/secret.pdf'), '');
  assert.equal(cvPreviewSrc('//cdn.example/cv.pdf', '//cdn.example/cv.pdf'), '');
});
