# ⚖️ ClariLegal — AI Legal Analyst & Contract Intelligence Workspace

> **Empowering non-lawyers, founders, and professionals to demystify, compare, and navigate complex legal agreements with grounded GenAI intelligence.**

![ClariLegal Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Gemini AI](https://img.shields.io/badge/Powered%20By-Google%20Gemini%20Flash-blue?logo=google)
![TypeScript](https://img.shields.io/badge/Built%20With-TypeScript%20%26%20React%2019-3178c6?logo=typescript)
![Remotion](https://img.shields.io/badge/Motion-Remotion%204.0-ff0055?logo=react)
![License](https://img.shields.io/badge/License-MIT-green)

---

## 📌 Mission & Core Problem

Legal documents (NDAs, employment contracts, commercial leases, SaaS agreements) are deliberately dense, laden with archaic jargon, and asymmetric in risk. Everyday individuals and growing companies frequently sign away fundamental rights, accept uncapped indemnities, or face catastrophic termination penalties simply because hiring legal counsel for routine document reviews is prohibitively slow and expensive.

**ClariLegal** bridges this gap: a GenAI-powered AI Legal Analyst workspace that makes legal agreements transparent, accessible, and actionable. It translates complex legalese into plain English, performs automated risk scoring, and enables side-by-side contract comparisons with complete confidence.

---

### 🎯 Key Use Cases & Functional Capabilities

| Core Use Case | ClariLegal Feature | Technical & UX Mechanism |
| :--- | :--- | :--- |
| **1. Simplifying complex legal documents** | **Plain-English Translation Engine** | Converts dense statutory legalese into conversational layman summaries accompanied by dedicated *"Why It Matters"* impact cards. |
| **2. Interactive document & PDF inspection** | **Split-Pane Viewer with Click-to-Highlight** | Displays original documents and rendered PDFs side-by-side with audited clauses; clicking any risk clause jumps to and highlights the exact clause in the document. |
| **3. Highlighting obligations, liabilities & risks** | **Clause Inspector & Risk Scoring** | Flags clauses as **High / Medium / Low Risk**, highlights one-sided liabilities, and tags party attribution (`Party.Company`, `Party.Individual`). |
| **4. In-depth clause breakdown** | **Inline Clause Expansion** | Selected clauses expand smoothly in place, displaying exact contract quotes, plain-English translations, and attorney consultation advice. |
| **5. Comparing contracts & redlines** | **Side-by-Side Diff Engine** | Ingests two contract versions (e.g., standard vs. vendor redlines), pinpoints additions/deletions, and highlights risk shifts. |
| **6. Answering questions grounded in documents** | **Document-Grounded AI Legal Analyst ("Ask AI")** | Interactive Q&A strictly grounded in the document context, citing specific clauses with click-to-highlight jump references. |
| **7. Helping users prepare for legal counsel** | **"Questions to Ask Counsel" Generator** | Prepares structured, precise inquiries for the user to present to their attorney, significantly cutting down billable consultation hours. |
| **8. Real-time visual contract scanning** | **Remotion Cinematic Video Feed** | Live visual scanning pipeline powered by **Remotion**, rendering OCR parsing, chunking, and risk detection animations. |

---

## 🛡️ Responsible AI & Ethical Boundaries

> **Note on Legal Scope:** ClariLegal is engineered to provide informational transparency and analytical assistance, rather than replace professional legal counsel.

ClariLegal operates with strict ethical and regulatory boundaries:
1. **Informational Assistance, Not Legal Advice**: Prominent notices are integrated across the Landing Page, Analysis Workspace, AI Chat, and Export Reports.
2. **Automated Attorney Escalation**: High-risk clauses automatically trigger guidance recommending escalation to a certified attorney.
3. **Counsel Enablement Tool**: Rather than offering unauthorized legal practice, ClariLegal equips clients with specific citations, questions, and risk profiles to maximize attorney consultation efficiency.

---

## ✨ Key Features & Architectural Highlights

### 1. 🔍 Split-Pane Document Viewer & Bidirectional Highlighting
- **Synchronized Document View**: Load and review PDFs or source text side-by-side with automated risk audits.
- **Interactive Highlighting**: Clicking any clause in the audit panel instantly scrolls to and highlights the text in the viewer pane.
- **Inline Clause Expansion**: View detailed risk rationales and legal implications without losing document context.

### 2. ⚖️ Two-Contract Comparison & Diff Analysis
- Compares standard contracts against counterparty redlines (NDAs, Service Agreements, Leases).
- Pinpoints added liabilities, omitted protections, changed timelines, and net risk shifts.

### 3. 💬 Document-Grounded AI Legal Analyst ("Ask AI")
- **Context-Adaptive Suggested Prompts**: Questions dynamically adapt to the document type (e.g., leases suggest security deposits and repairs; employment contracts suggest non-competes and IP assignment).
- **Persistent Multi-Session History**: Organize, switch, and resume conversations across different contracts without losing past insights.

### 4. 🎬 Remotion Video & Motion Engine
- **RemotionHeroAnimation**: Dynamic, interactive visualizer showcasing contract analysis on the landing page.
- **RemotionAnalysisModal**: Real-time cinematic legal scanner visualizing clause extraction and vulnerability detection.
- **RemotionDemoModal**: Dedicated product demonstration modal showcasing the platform's core workflows.

### 5. 🧭 Interactive Onboarding (Driver.js)
- Step-by-step guided product tour that introduces first-time users to the workspace, metrics, and clause inspection workflow.

---

## 🏗️ Architecture & Technology Stack

```
   ┌─────────────────────────────────────────────────────────────┐
   │                     ClariLegal Frontend                     │
   │  React 19 + TypeScript + Vite + Tailwind CSS 4.0 + Lucide   │
   └───────────────┬─────────────────────────────┬───────────────┘
                   │                             │
         Direct Client Fallback            Server-Side API
         (Built-in Demo Mode)           (/api/analyze, /api/chat)
                   │                             │
                   ▼                             ▼
       ┌────────────────────────┐   ┌─────────────────────────┐
       │  Local Document Store  │   │ Google Gemini 2.5 Flash │
       │  & Preloaded Datasets  │   │ (Structured Extraction) │
       └────────────────────────┘   └─────────────────────────┘
```

- **Frontend Framework**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Glassmorphism, Responsive Modern Layouts
- **AI Engine**: Google Gemini API (`gemini-2.5-flash` / `gemini-1.5-flash`) via official `@google/genai` SDK
- **Video & Animation**: Remotion (`remotion`, `@remotion/player`)
- **Guided Walkthroughs**: `driver.js`
- **State & Storage**: Browser-persisted multi-chat sessions and document metadata

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0 or later)
- npm, pnpm, or yarn
- Google AI Studio API Key (optional for pre-bundled demo mode; required for live custom document analysis)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/legalsense.git
cd legalsense
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Configure your Google Gemini API key in `.env.local`:
```env
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-2.5-flash
```

> **Demo Mode**: ClariLegal includes pre-analyzed sample agreements (Commercial Lease, Vendor NDA, Senior Employment Contract) so you can evaluate the complete user flow without needing an active API key immediately.

### 4. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Build for Production
```bash
npm run build
npm run preview
```

---

## 📂 Project Structure

```
legalsense/
├── api/                           # Serverless API endpoints (Gemini integration)
│   ├── analyze.ts                 # Document risk extraction & clause parsing
│   ├── chat.ts                    # Grounded document Q&A assistant endpoint
│   ├── gemini.ts                  # Gemini SDK client configuration
│   └── health.ts                  # API health check endpoint
├── public/
│   ├── logo.svg                   # Scalable vector scales medallion logo
│   └── favicon.svg                # Browser tab icon in brand palette
├── src/
│   ├── components/                # Modular UI components
│   │   ├── AuthModal.tsx          # Workspace login & account modal
│   │   ├── Logo.tsx               # Reusable ClariLegal branding component
│   │   ├── MarkdownResponse.tsx   # Markdown & citation renderer for AI responses
│   │   ├── RemotionAnalysisModal.tsx  # Cinematic real-time contract scanner
│   │   ├── RemotionDemoModal.tsx  # Interactive product walkthrough video modal
│   │   └── RemotionHeroAnimation.tsx  # Landing page dynamic contract animation
│   ├── lib/                       # Application logic & services
│   │   ├── api.ts                 # Client-side API abstraction & fallback handlers
│   │   ├── storage.ts             # Multi-session chat & document persistence
│   │   └── tour.ts                # Driver.js interactive guided tour
│   ├── App.tsx                    # Main application shell, views & dashboard
│   ├── data.ts                    # Demo contracts & fallback audit datasets
│   ├── styles.css                 # Theme styles, utilities & responsive layouts
│   └── main.tsx                   # React DOM root entrypoint
├── .env.example                   # Environment variable template
├── package.json                   # Dependencies and scripts
└── README.md                      # Platform documentation
```

---

## 🛡️ Security & Privacy Principles

- **Server-Side Key Protection**: API keys are accessed exclusively via serverless backend endpoints and never exposed to the client browser.
- **Client-First Persistence**: Documents and chat histories are stored within the user's browser `localStorage`, ensuring data sovereignty.
- **Context Sanitation**: Document text is sanitized and structured before processing to prevent prompt injection and unnecessary data leakage.

---

## ⚖️ Legal Disclaimer

*ClariLegal is an artificial intelligence-assisted legal document intelligence and productivity tool designed strictly for informational and navigational purposes. ClariLegal is NOT a law firm and does NOT provide legal advice, formal representation, or attorney-client privileged relationships. Always review important contracts and legal commitments with a licensed attorney in your jurisdiction.*

---

## 👥 Acknowledgements & Community

Built with ❤️ to make legal clarity and contract intelligence accessible, transparent, and fair for everyone.
