# Nagrik - Smart Bharat AI-Powered Civic Companion
**Live Demo:**https://nagrik-sigma.vercel.app/
## Problem
Citizens often struggle to understand which government service applies to their situation, which documents are required, and how to report or track local public issues. Smart Bharat is a GenAI-powered civic companion that simplifies everyday civic interactions through service discovery, personalized AI guidance, complaint reporting, status tracking, and multilingual assistance.

## Approach
The app uses a React frontend, FastAPI backend, Supabase Auth/Database/Storage, and an OpenRouter-powered AI service. Citizens sign in with Supabase Auth, browse common Indian government services, open the AI chat with a selected service context, upload checklist images, report civic issues, and track their own complaints.

Security and accessibility are built into the main flow: the frontend only uses the Supabase anon key, the backend validates authenticated bearer tokens before using the Supabase service key, inputs and images are validated server-side, and all user-owned tables have RLS policies.

## Prompt Workflow / Strategy

Given the solo, time-boxed nature of this hackathon, we used a structured, staged 
prompting strategy with our AI coding agent (Codex/Antigravity) rather than ad-hoc 
requests — treating prompts as versioned engineering artifacts, stored in `PROMPTS/`.

**1. Standing constraints prompt (`01_build_phase_prompt.md`)**
Before any code was written, we established a persistent instruction set covering 
the four judging criteria (Code Quality, Security, Accessibility, Problem Statement 
Alignment) as non-negotiable rules applied to every file generated - not a one-time 
request, but a standing contract with the AI agent for the entire build session.

**2. Feature-specification prompts**
Each feature (Gov Services Browser, AI Chatbot with RAG-lite grounding, Report Issue, 
Track Complaints, Application Tracking, Profile/Language) was specified as its own 
structured prompt: data model first, then endpoint logic, then UI - enforcing a 
consistent build order (security/data layer before polish) across every feature 
rather than letting the agent freelance the architecture.

**3. Grounding layer prompt**
Rather than relying on the LLM's general knowledge for civic information (risking 
hallucinated document requirements), we authored a curated JSON knowledge base 
(`civic_services.json`) and explicitly instructed the agent to ground chatbot 
responses in this data first, falling back to general reasoning only when a query 
fell outside its scope.

**4. End-of-session audit prompt (`02_audit_phase_prompt.md`)**
Before submission, we ran a dedicated audit pass instructing the agent to review 
its own output file-by-file against the same four criteria, flag violations with 
exact file/line references, and fix them directly - catching issues like missing 
RLS policies or leftover console.logs before they reached the final commit.

**Why this approach:** treating AI-assisted development as a structured pipeline 
(constraints → build → ground → audit) rather than a single unstructured chat 
session let us maintain consistency across a multi-feature build under a hard time 
constraint, and gives full traceability - every architectural decision in this repo 
can be traced back to an explicit, saved prompt rather than an undocumented one-off 
exchange.
## Tech Stack
- Frontend: React, Vite, Tailwind CSS, Supabase JS
- Backend: FastAPI, Pydantic, SlowAPI, HTTPX
- Database/Auth/Storage: Supabase
- GenAI: OpenRouter chat completions
- Deployment: Vercel or Netlify for frontend, Render or Railway for backend

## Setup Instructions

### Supabase
1. Create a Supabase project.
2. Enable email magic-link auth in Supabase Auth.
3. Open the SQL editor and run `backend/app/db/supabase_schema.sql`.
   If your `users` table already existed before the sign-up details were added, also run `backend/app/db/profile_details_migration.sql`.
   If your database existed before application tracking was added, also run `backend/app/db/applications_migration.sql`.
4. Confirm RLS is enabled on `public.users`, `public.complaints`, and `public.applications`.
5. Confirm storage buckets `complaint-images` and `document-uploads` exist and are private.

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload
```

Fill `backend/.env` with:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY`
- `OPENROUTER_API_KEY`
- `OPENROUTER_MODEL`
- `FRONTEND_ORIGIN`
- `COMPLAINT_IMAGE_BUCKET`
- `DOCUMENT_UPLOAD_BUCKET`
- `MAX_UPLOAD_BYTES`

### Frontend
```bash
cd frontend
npm install
copy .env.example .env
npm run dev
```

Fill `frontend/.env` with:
- `VITE_API_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Requirement Alignment
| Requirement | How this project addresses it |
|---|---|
| Gov services browser with 12-15 Indian services | `frontend/src/lib/services.js` defines 15 services including Passport, Aadhaar Card, Ration Card, Voter ID, PAN Card, Property Tax, Water Connection, Ayushman Bharat, and PM-Kisan. `ServicesPage.jsx` renders them as keyboard-accessible links with icon alt text. |
| Clicking a service opens chat with service context | Each service card links to `/chat?service=...`. `ChatPage.jsx` reads that query value and automatically sends the first contextual message to the backend. |
| Single AI chat endpoint with optional `service_context` | `backend/app/routes/chat.py` exposes `POST /api/chat`. `backend/app/services/llm_service.py` includes the selected service in the system prompt and requests structured JSON output. |
| Intent classification: document checklist, simple Q&A, service recommendation | `ChatResponse` restricts intent to `document_checklist`, `simple_qna`, or `service_recommendation`. The frontend renders checklist uploads and recommendation links based on that intent. |
| Document checklist upload to Supabase Storage | `ChecklistBlock.jsx` lets users upload JPG/PNG files and shows a real Done button after every required document has uploaded. `POST /api/chat/document-upload` validates type/size and stores files in the private `document-uploads` bucket. |
| Application session flow | `backend/app/routes/applications.py` and `backend/app/services/application_service.py` create owner-scoped applications only after the backend verifies all required documents for that service. `ChatPage.jsx` checks existing applications before starting a fresh checklist and renders `ApplicationStatusView.jsx` with timeline and uploaded document links. |
| LLM key kept backend-only | OpenRouter keys appear only in `backend/.env.example` and backend config. The frontend has only Supabase anon and API URL variables. |
| Respond in selected profile language | `ProfilePage.jsx` and `LanguageSelector.jsx` save English/Hindi/Marathi preference. The chat route loads the saved preference and passes it to the LLM prompt. |
| Report issue form | `ReportIssuePage.jsx` collects required description and optional image. The backend sanitizes description, validates JPG/PNG max 5MB, classifies the category, and saves to Supabase. |
| Complaint category classification | `llm_service.py` classifies complaints as pothole, garbage, water, electricity, or other before `complaints_service.py` stores the row. |
| Track complaints timeline | `ComplaintsPage.jsx` loads only the signed-in user's complaints and renders each as a vertical Submitted -> In Review -> Resolved timeline. |
| Profile and language preference | `LandingPage.jsx` and `AuthPanel.jsx` collect email, name, birth date, gender, address, city, state, and pincode during sign-up. `ProfilePage.jsx` lets users edit those fields plus language preference and optional location in the `users` table through `backend/app/routes/profile.py`. |
| Supabase schema with RLS policies | `backend/app/db/supabase_schema.sql` creates `users`, `complaints`, and `applications`, enables RLS, defines own-row profile/application policies, lets users create/read only their own complaints, and adds private storage policies. |
| Existing project structure | Backend code is split across `routes`, `services`, `models`, `core`, and `db`. Frontend code is split across `pages`, `components`, and `lib`. |

## Security Notes
- No API keys, Supabase keys, or credentials are hardcoded in source files.
- `backend/.env.example` uses placeholders for the Supabase service key and OpenRouter key.
- `frontend/.env.example` uses placeholders for the Supabase anon key only.
- `.env` and `.env.local` are ignored at the root, and backend/frontend folders also ignore local env files.
- CORS is scoped with `FRONTEND_ORIGIN`; the backend does not use wildcard origins.
- Supabase Auth is used for login. The app does not implement custom password or session handling.
- Backend endpoints validate bearer tokens before reading or writing user-owned data.
- Chat and complaint submission endpoints are rate-limited with SlowAPI.
- Server-side validation and sanitization are applied to chat messages, profile fields, complaint descriptions, and uploaded image files.
- Uploaded images are limited to JPG/PNG and 5MB before being accepted into Supabase Storage.
- Supabase tables have RLS enabled with explicit authenticated-user own-row policies.

## Accessibility Notes
- The app uses semantic landmarks: `header`, `nav`, `main`, `section`, forms, labels, buttons, links, lists, and headings.
- Every input has a visible label tied by `htmlFor` and `id`.
- Service cards are real links, not clickable divs, so the services grid is keyboard-navigable.
- Service icons and complaint images include alt text.
- The language selector is visible in the header after sign-in and also available in the profile form.
- Focus states are visible through global `:focus-visible` styling and Tailwind focus rings.
- Text colors use high-contrast slate, blue, green, amber, and red combinations on light backgrounds.

PROMPTS/ contains the structured prompts used to guide AI-assisted development of this project, documenting our engineering process
