# Implementation boundary: learning, routing and verification

Updated 2026-11-15 UTC · ChatGPT · reason: begin Bot HQ hardening without replacing existing Hermes capabilities.

Existing runtime already includes Hermes memory in `server/src/engine-memory.ts`, serial per-bot scheduling in `server/src/agent/loop.ts`, and routines in `server/src/routines.ts`. Do not introduce a second uncontrolled memory store or independent task queue.

**This PR implements only verification foundations**: a side-effect-free CLI, tests of its failure behavior, and a behavior-level feature map. It does not yet modify the runtime, connect GitHub, install Noodle or Brainmaxxing, or authorize unattended writes.

The next implementation PR should:
- Keep task classification deterministic, with explicit allowlisted skills, declared required permissions and unknown-task fallback to an owner.
- Keep session memory per bot; do not auto-ingest secrets, user PII, permission changes or tool output as trusted policy. Reflection notes should be suggested for owner review before they affect system behavior.
- Enforce GitHub denial for Grok **in code**, not just in `AGENTS.md`, including Composio tool access, event triggers and inherited integrations.
- Test denial, expiry and revocation while tasks are queued; fail closed on ambiguity; keep app-write approvals.
- Log UTC timestamp, authoring AI and reason for every future change. Tests need actual execution evidence.
