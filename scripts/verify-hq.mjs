#!/usr/bin/env node
/**
 * Safe, read-only verification entrypoint for Bot HQ.
 * No agent tokens, remote requests, database writes, or GitHub access.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const command = args.find(a => !a.startsWith('--')) || 'help';
const json = args.includes('--json');
const rootArg = args.find(a => a.startsWith('--root='));
const root = rootArg ? path.resolve(rootArg.slice(7)) : defaultRoot;
const required = [
  ['Server entry point', 'server/src/index.ts'],
  ['Approval gate', 'server/src/agent/loop.ts'],
  ['Tool definitions', 'server/src/agent/tools.ts'],
  ['Hermes memory', 'server/src/engine-memory.ts'],
  ['Routine scheduler', 'server/src/routines.ts'],
  ['Feature map', 'docs/verification/features/README.md'],
];
function result(ok, details) {
  const data = { ok, command, root, timestamp: new Date().toISOString(), details };
  if (json) console.log(JSON.stringify(data));
  else {
    console.log(`Bot HQ verification: ${command} — ${ok ? 'PASS' : 'FAIL'}`);
    for (const item of details) console.log(`  ${item.ok ? 'OK' : 'FAIL'} ${item.name}: ${item.detail}`);
  }
  if (!ok) process.exitCode = 1;
}
if (command === 'doctor') {
  const details = required.map(([name, rel]) => {
    const exists = fs.existsSync(path.join(root, rel));
    return { name, ok: exists, detail: exists ? rel : `missing ${rel}; restore or update the feature map` };
  });
  result(details.every(x => x.ok), details);
} else if (command === 'feature-map') {
  const file = path.join(root, 'docs/verification/features/README.md');
  if (!fs.existsSync(file)) result(false, [{ name: 'Feature map', ok: false, detail: 'Not found' }]);
  else if (json) result(true, [{ name: 'Feature map', ok: true, detail: file }]);
  else process.stdout.write(fs.readFileSync(file, 'utf8'));
} else if (command === 'smoke') {
  const details = [];
  const check = (name, rel, needle) => {
    const file = path.join(root, rel);
    const ok = fs.existsSync(file) && fs.readFileSync(file, 'utf8').includes(needle);
    details.push({ name, ok, detail: ok ? `found in ${rel}` : `missing marker in ${rel}; inspect the implementation before release` });
  };
  check('Approval request path', 'server/src/agent/loop.ts', 'requestApproval(');
  check('Persistent Hermes memory', 'server/src/engine-memory.ts', 'listMemories(');
  check('Serialized bot work queue', 'server/src/agent/loop.ts', 'runInBotQueue');
  check('Routine scheduling', 'server/src/routines.ts', 'scheduleRoutine(');
  result(details.every(x => x.ok), details);
} else {
  console.log('Usage: node scripts/verify-hq.mjs <doctor|feature-map|smoke> [--json] [--root=/checkout]');
  console.log('All commands are read-only. smoke checks source markers, not live application behavior.');
  if (command !== 'help') process.exitCode = 2;
}
