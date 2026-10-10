import assert from 'node:assert/strict';
import test from 'node:test';
import { getSafeExternalUrl } from '../src/utils/url.js';

test('accepts and normalizes HTTP(S) links', () => {
  assert.equal(getSafeExternalUrl('https://example.com/path'), 'https://example.com/path');
  assert.equal(getSafeExternalUrl('http://example.com'), 'http://example.com/');
});

test('rejects empty, malformed, and executable URL schemes', () => {
  assert.equal(getSafeExternalUrl(''), null);
  assert.equal(getSafeExternalUrl('not a url'), null);
  assert.equal(getSafeExternalUrl('javascript:alert(1)'), null);
  assert.equal(getSafeExternalUrl('data:text/html,<script>alert(1)</script>'), null);
});
