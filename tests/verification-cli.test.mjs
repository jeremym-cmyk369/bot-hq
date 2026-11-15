import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const script = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'scripts/verify-hq.mjs');
const temp = () => fs.mkdtempSync(path.join(os.tmpdir(), 'bot-hq-verify-'));
const run = (command, root) => spawnSync(process.execPath, [script, command, '--json', '--root=' + root], { encoding: 'utf8' });
test('doctor fails closed on missing files and emits JSON diagnostics', () => {
  const root = temp();
  try {
    const r = run('doctor', root);
    assert.equal(r.status, 1);
    const out = JSON.parse(r.stdout);
    assert.equal(out.ok, false);
    assert.ok(out.details.some(x => !x.ok));
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test('feature-map does not create data or silently succeed without an index', () => {
  const root = temp();
  try {
    const r = run('feature-map', root);
    assert.equal(r.status, 1);
    assert.equal(JSON.parse(r.stdout).ok, false);
    assert.deepEqual(fs.readdirSync(root), []);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
test('smoke fails closed without the required approval and memory primitives', () => {
  const root = temp();
  try {
    const r = run('smoke', root);
    assert.equal(r.status, 1);
    assert.equal(JSON.parse(r.stdout).details.length, 4);
  } finally { fs.rmSync(root, { recursive: true, force: true }); }
});
