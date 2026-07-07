Paste this as your FIRST message in Codex/Antigravity, before the problem statement drops.

---

You are helping me build a solo hackathon project under a hard 4-hour deadline.
This will be graded first by an AI leaderboard system, then top 10 go to human judges.
Judging criteria (in this priority order): Code Quality, Security, Accessibility,
Problem Statement Alignment.

Apply these rules to EVERY file you write or edit, without me having to remind you:

## CODE QUALITY
- Split logic into proper components/functions/modules — never dump everything into
  one giant file, even for speed.
- Consistent naming conventions (camelCase JS/TS, snake_case Python) throughout.
- No leftover console.log, print(), commented-out code, or TODOs in final files.
- Add short comments explaining *why* non-obvious decisions were made, not just what
  the code does.
- Keep functions small and single-purpose. No 100+ line functions.
- Use proper error handling (try/catch, error boundaries) instead of letting things
  fail silently or crash.

## SECURITY
- NEVER hardcode API keys, secrets, or credentials in source files. Always use
  environment variables and remind me to add them to .env (and create a .env.example
  with placeholder values).
- Never write raw string-concatenated SQL — use parameterized queries/ORM methods.
- Validate and sanitize all user inputs on both frontend and backend, not just frontend.
- Do not set CORS to allow all origins (`*`) in backend config — scope it to the actual
  frontend URL.
- If auth is needed, use an existing provider (e.g. Supabase Auth) — do not write custom
  password/session handling.
- Avoid eval(), dangerouslySetInnerHTML, or any pattern that executes unsanitized input.

## ACCESSIBILITY
- Use semantic HTML: <button> for actions, <nav>, <main>, <label> tied to every input
  via htmlFor/id — never bare <div onClick> for interactive elements.
- Add alt text to every image.
- Maintain a logical heading hierarchy (one h1, then h2/h3 nested properly).
- Ensure sufficient color contrast — don't use light gray text on white/light backgrounds.
- Make sure every interactive element is reachable and usable via keyboard (Tab, Enter).
- Add aria-label to icon-only buttons.

## PROBLEM STATEMENT ALIGNMENT
- Before writing code, restate the problem statement's core requirements as a checklist.
- As you build, map each feature back to a specific requirement from that checklist.
- If the problem statement has multiple sub-requirements, address all of them at least
  minimally rather than deeply solving only one and ignoring the rest.
- At the end, generate a README section titled "Requirement Alignment" that explicitly
  lists each requirement and how the project addresses it — write this in plain,
  explicit language since an AI grader will read it directly.

## GENERAL
- Prioritize a working, deployed end-to-end flow over feature completeness. One clean
  core feature > three broken ones.
- After every major change, tell me if anything above was violated so I can catch it
  before deploy.
- When generating the README, structure it as: Problem, Approach, Tech Stack, Setup
  Instructions, Requirement Alignment, Security Notes, Accessibility Notes.

Confirm you understand these constraints, then wait for me to paste the actual problem
statement before generating any code.
