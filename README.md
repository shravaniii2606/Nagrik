# Project Name

## Problem
_What problem does this solve? Paste/paraphrase the core problem statement here._

## Approach
_1-2 paragraphs: what you built and why this approach, in plain language._

## Tech Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: FastAPI (Python)
- Database/Auth: Supabase
- Deployment: Vercel (frontend) + Render (backend)

## Setup Instructions

### Frontend
```bash
cd frontend
npm install
cp .env.example .env   # fill in real values
npm run dev
```

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # fill in real values
uvicorn app.main:app --reload
```

## Requirement Alignment
| Requirement from problem statement | How this project addresses it |
|---|---|
| _e.g. Requirement 1_ | _e.g. Implemented via X feature in Y file_ |
| _e.g. Requirement 2_ | _..._ |

## Security Notes
- All secrets loaded via environment variables, never committed (see `.env.example` files).
- CORS restricted to the deployed frontend origin only.
- Backend uses the Supabase service key server-side only; frontend uses the anon key only.
- Input validation applied on [describe where].

## Accessibility Notes
- Semantic HTML used throughout (buttons, labels, headings).
- All images include alt text.
- Color contrast checked against Tailwind defaults.
- Interactive elements are keyboard-navigable; icon-only buttons include aria-label.
