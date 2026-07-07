Paste this once your core feature works, in the "make it demoable" phase
(roughly 1 hour before your deadline). Don't run it too early.

---

Do a full audit of the current codebase against these 4 criteria. Go file by file,
not just a general summary. For each violation found, tell me the exact file and line,
then fix it directly.

1. CODE QUALITY
   - Any file over ~150 lines that should be split up?
   - Any leftover console.log, print(), commented-out code, or unused imports/variables?
   - Any function doing more than one clear thing?
   - Inconsistent naming anywhere?

2. SECURITY
   - Search the entire repo for hardcoded API keys, tokens, or secrets — including in
     frontend code, config files, and git history if any were committed accidentally.
   - Confirm .env is in .gitignore and .env.example exists with placeholder values only.
   - Check CORS config — is it scoped or wide open?
   - Check every API endpoint — is user input validated before use?
   - Any raw SQL string concatenation instead of parameterized queries?

3. ACCESSIBILITY
   - Find every <div onClick> or clickable non-button element — flag and fix.
   - Find every <img> missing alt text.
   - Find every <input> missing an associated <label>.
   - Check heading hierarchy across all pages — flag skipped levels (h1 -> h3 with no h2).
   - Flag any icon-only button missing aria-label.

4. PROBLEM STATEMENT ALIGNMENT
   - Here is the original problem statement: [PASTE PROBLEM STATEMENT HERE]
   - List each requirement from it as a checklist.
   - For each one, tell me: implemented fully / implemented partially / not implemented.
   - For anything not fully implemented, tell me the fastest possible way to at least
     partially address it given limited time left.

After the audit, generate/update the README with sections: Problem, Approach, Tech Stack,
Setup Instructions, Requirement Alignment (explicit mapping), Security Notes,
Accessibility Notes.

Finally, give me a short prioritized list: if I only have 30 minutes left, what should
I fix first from everything you found, ranked by impact on the 4 judging criteria.
