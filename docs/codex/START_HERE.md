# Safe first task for a new Codex user

1. Install ChatGPT desktop and select Codex.
2. Install Git and Node.js 22.12+.
3. Clone `https://github.com/gillooleyj/FedRAMP-Policy-Atlas.git` to your computer.
4. Open the repository's top folder as the Codex project. Do not create a new blank application.
5. Check `AGENTS.md`, `SPEC.md`, `README.md`, `docs/backlog.md` and `docs/workspace/README.md`.
6. Run `npm ci`, `npm run dev`; open the local Vite address. Stop with Ctrl+C.
7. Validate `npm run lint`, `npm run typecheck`, `npm test`, `npm run build`.
8. Start with a **read-only inventory task**; see `docs/workspace/CODEX_WORKSTREAMS.md`.
9. Review proposed plan before code changes. Keep subsequent changes on dedicated feature branches/worktrees.
10. Commit a PR, test it, and merge/deploy only after explicit review.

## Safety

Only publicly published sources may be processed. No credentials, CUI, internal GSA/FedRAMP records, confidential assessments or personal data. Do not enable unrestricted filesystem/network permissions or automatic production deployment. Read and preserve the existing root `AGENTS.md`.

## Git helper commands

```bash
git clone https://github.com/gillooleyj/FedRAMP-Policy-Atlas.git
cd FedRAMP-Policy-Atlas
npm ci
npm run dev
```

`Ctrl+C` stops the development server. After a successful start, use separate terminal runs for the validation commands above.
