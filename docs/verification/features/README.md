# Bot HQ behavior-level feature map
Updated 2026-11-15 UTC · author: ChatGPT · reason: establish repeatable verification for existing Bot HQ runtime.

This index is an engineering guide, not proof that the live system passed a test. Read only the subsystem needed for a change. **Grok bots must never receive GitHub access**, regardless of tool or connector availability.

| Journey | Entry point | Source of truth | Essential verification |
|---|---|---|---|
| User sends message | Chat UI → server → Hermes | `server/src/agent/loop.ts` | Success, interrupted, failed, serial ordering, no duplicated output |
| Approval card | Tool invocation → owner decision | `server/src/agent/loop.ts` | Allow, deny, expiry, new-message cancellation, no side effect before approval |
| Connected app tools | Agent tools and Composio | `server/src/agent/tools.ts`, `server/src/composio.ts` | Read vs write policy, account scope, deny/revoke, no GitHub access for Grok |
| Persistent bot memory | Bot memory UI / Hermes home | `server/src/engine-memory.ts` | Correct bot ownership, read/delete, restart, malformed entry, no cross-bot leakage |
| Recurring routine | Routine schedule / trigger | `server/src/routines.ts`, `server/src/triggers.ts` | Enable/disable, overlapping fires, revoked app permission, interruption |
| Agent collaboration | Bot-to-bot messaging | `server/src/agent/rooms.ts`, `server/src/agent/loop.ts` | Sender validity, depth bound, isolation |
| Screen takeover | Browser viewer | `server/src/box.ts`, `server/src/desk.ts` | Viewer vs controller auth, disconnect, stale session |

## Reproducible local checks
```bash
node scripts/verify-hq.mjs doctor --json
node scripts/verify-hq.mjs smoke --json
node --test tests/verification-cli.test.mjs
npm run typecheck -w server
```

`doctor` checks file presence, `smoke` checks source markers, and the Node tests exercise the CLI. **None** of those checks is a substitute for runtime authorization, browser journeys, persistent-memory tests or real external connector testing.

## Evidence required for any runtime change
Log timestamp, contributing AI, reason, commit SHA, actual commands/results, app version, role, browser path, state before and after, screenshot or structured assertion when appropriate, network side effect, regression cases, rollback plan, and any untested path. Do not store PII, tokens, sessions, or real chat history in evidence.

## Next verification milestones
1. Add a read-only test account and disposable development database under explicit test environment configuration.
2. Add end-to-end approval/revocation and simultaneous-request tests with a mock external writer.
3. Add bot-scoped memory lifecycle tests using temp Hermes directories.
4. Add an explicit GitHub-deny policy in the underlying connector/tool permission layer and prove it with a denied-call test.
5. Extend this map as features change, in the same PR as runtime changes.
