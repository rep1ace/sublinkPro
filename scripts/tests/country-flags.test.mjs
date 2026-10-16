import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { isoToFlag, formatCountry, getCountryDisplay } from '../../webs/src/utils/countryDisplay.js';

test('country displays preserve ISO flags, including Taiwan', () => {
  for (const [code, flag] of [['TW', '🇹🇼'], ['CN', '🇨🇳'], ['HK', '🇭🇰'], ['US', '🇺🇸']]) {
    assert.equal(isoToFlag(code), flag);
    assert.equal(isoToFlag(` ${code.toLowerCase()} `), flag);
    assert.equal(formatCountry(code), `${flag} ${code}`);
    assert.equal(getCountryDisplay(code).flag, flag);
  }
  assert.equal(isoToFlag('invalid', '?'), '?');
  assert.equal(formatCountry('UNKNOWN'), '');
  assert.equal(getCountryDisplay('').isUnknown, true);
});

test('country rules use the shared flag formatter', async () => {
  const source = await readFile(new URL('../../webs/src/views/country-rules/components/CountryRules.jsx', import.meta.url), 'utf8');
  assert.match(source, /import\s*\{\s*isoToFlag as getCountryFlag\s*\}\s*from 'utils\/countryDisplay'/);
  assert.doesNotMatch(source, /const getCountryFlag\s*=/);
});

test('default subscription groups consistently use the Taiwan flag', async () => {
  for (const file of ['clash.yaml', 'surge.conf']) {
    const source = await readFile(new URL(`../../template/${file}`, import.meta.url), 'utf8');
    assert.ok(source.includes('🇹🇼 台湾节点'), file);
    assert.ok(!source.includes('🇨🇳 台湾节点'), file);
  }
});
