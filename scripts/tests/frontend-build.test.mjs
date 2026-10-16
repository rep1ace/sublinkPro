import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import test from 'node:test';

const dist = new URL('../../webs/dist/', import.meta.url);

test('built private UI loads the manifest with credentials', async () => {
  const html = await readFile(new URL('index.html', dist), 'utf8');
  const manifestTag = html.match(/<link\b[^>]*rel="manifest"[^>]*>/)?.[0];
  assert.ok(manifestTag, 'manifest link must be emitted');
  assert.match(manifestTag, /crossorigin="use-credentials"/);
  const manifest = JSON.parse(await readFile(new URL('manifest.webmanifest', dist), 'utf8'));
  assert.equal(manifest.start_url, '/');
  for (const icon of manifest.icons) await access(new URL(icon.src.replace(/^\//, ''), dist));
});

test('built homepage references assets included in the same build', async () => {
  const html = await readFile(new URL('index.html', dist), 'utf8');
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map((match) => match[1]);
  assert.ok(assets.some((asset) => asset.endsWith('.js')), 'module entry must be present');
  for (const asset of assets) await access(new URL(asset.slice(1), dist));
  await access(new URL('sw.js', dist));
  await access(new URL('registerSW.js', dist));
  assert.ok(!html.includes('fomo.codedthemes.com'), 'preserve the private homepage without the Fomo script');
});
