# Pre-Shortlist Prompts (Candidate Side)

The actual LLM evaluation prompt lives in the backend at
`apps/backend/src/app/pre-shortlist/prompts/evaluate-answers.ts`.

This folder is intentionally empty in the web app — the candidate side does
not call the LLM directly. It is kept as a placeholder so the folder
structure mirrors the employer's `apps/web/src/features/employer/new-job/prompts/`.
