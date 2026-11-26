import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeForIndonesianTTS } from '../normalizeForIndonesianTTS.js';

test('menghapus markdown dan emoji', () => {
  const out = normalizeForIndonesianTTS('Halo **Fitri** #RS\n- item ⭐');
  assert.ok(!out.includes('*'));
  assert.ok(!out.includes('#'));
  assert.ok(!out.includes('⭐'));
});

test('jam 08.00 -> pukul delapan', () => {
  const out = normalizeForIndonesianTTS('Jam 08.00');
  assert.match(out, /pukul delapan/);
});

test('nomor telepon dibaca per digit', () => {
  const out = normalizeForIndonesianTTS('Hubungi 08123456789');
  assert.match(out, /nol delapan satu/);
});