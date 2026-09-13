# LegalSense deployment checklist

## 1. Local
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2. Gemini
Create a Google AI Studio API key and set:
- `GEMINI_API_KEY`
- Optional: `GEMINI_MODEL` (defaults to `gemini-3.8-flash`)

The browser never receives this key. Requests go to `/api/analyze` and `/api/chat`.

## 3. Vercel
Import the repository into Vercel. The project uses Vite for the frontend and Vercel Node Functions for `/api/*.ts`.

Set the environment variable for Production + Preview as needed, then redeploy.

## 4. Smoke test
- Open `/api/health`
- Upload a small PDF from Home → Analyze a Document
- Ask a follow-up in Ask AI
- Choose two small PDFs in Compare Contracts

## 5. Hackathon hardening
- Enable Vercel Analytics/Logs
- Replace demo data with persisted documents if desired
- Add auth before storing private legal documents
- For files above the starter limit, add direct Vercel Blob client uploads and pass a signed URL/URI to Gemini instead of proxying file bytes through the function
