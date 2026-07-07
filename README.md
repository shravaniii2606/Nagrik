# Smart Bharat - AI-Powered Civic Companion

## Problem
Citizens often struggle to understand which government service applies to their situation, which documents are required, and how to report or track local public issues. Smart Bharat is a GenAI-powered civic companion that simplifies everyday civic interactions through service discovery, personalized AI guidance, complaint reporting, status tracking, and multilingual assistance.

## Approach
The app uses a React frontend, FastAPI backend, Supabase Auth/Database/Storage, and an OpenRouter-powered AI service. Citizens sign in with Supabase Auth, browse common Indian government services, open the AI chat with a selected service context, upload checklist images, report civic issues, and track their own complaints.

Security and accessibility are built into the main flow: the frontend only uses the Supabase anon key, the backend validates authenticated bearer tokens before using the Supabase service key, inputs and images are validated server-side, and all user-owned tables have RLS policies.

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
4. Confirm RLS is enabled on `public.users` and `public.complaints`.
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
| Document checklist upload to Supabase Storage | `ChecklistBlock.jsx` lets users mark documents uploaded and upload JPG/PNG files. `POST /api/chat/document-upload` validates type/size and stores files in the private `document-uploads` bucket. |
| LLM key kept backend-only | OpenRouter keys appear only in `backend/.env.example` and backend config. The frontend has only Supabase anon and API URL variables. |
| Respond in selected profile language | `ProfilePage.jsx` and `LanguageSelector.jsx` save English/Hindi/Marathi preference. The chat route loads the saved preference and passes it to the LLM prompt. |
| Report issue form | `ReportIssuePage.jsx` collects required description and optional image. The backend sanitizes description, validates JPG/PNG max 5MB, classifies the category, and saves to Supabase. |
| Complaint category classification | `llm_service.py` classifies complaints as pothole, garbage, water, electricity, or other before `complaints_service.py` stores the row. |
| Track complaints timeline | `ComplaintsPage.jsx` loads only the signed-in user's complaints and renders each as a vertical Submitted -> In Review -> Resolved timeline. |
| Profile and language preference | `ProfilePage.jsx` stores name, language preference, and optional location in the `users` table through `backend/app/routes/profile.py`. |
| Supabase schema with RLS policies | `backend/app/db/supabase_schema.sql` creates `users` and `complaints`, enables RLS, defines own-row profile policies, lets users create/read only their own complaints, and adds private storage policies. |
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
