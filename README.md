NyayNeti MVP – Offline Legal Research AI Assistant for Indian Law
================================================================

NyayNeti is a hackathon-grade MVP for an **offline legal research copilot** focused on **Indian law**.  
It lets you **upload Indian judgments / bare acts PDFs**, builds local embeddings, and answers queries using **Llama 3.2 3B** via the **RunAnywhere SDK**, with a clean React (Vite) frontend and Flask backend.

> Target event: **HackShastra – SnowHack IPEC (24-hour hackathon)**  

---

## High-level Architecture

- **Frontend (`frontend/`)**
  - React + Vite SPA with Tailwind CSS
  - Components for PDF upload, search, result cards and citation badges
  - Talks to Flask backend via REST (`/api/*`)

- **Backend (`backend/`)**
  - Flask API (CORS enabled) that:
    - Accepts PDF uploads and stores them in `backend/uploads/`
    - Runs a basic PDF → text pipeline (`core/pdf_processor.py`)
    - Extracts candidate citations (`core/citation_parser.py`)
    - Uses **RunAnywhere SDK + Llama 3.2 3B** (`core/llm_engine.py`) to:
      - Create / load a local embedding store (for MVP this is kept very simple)
      - Answer user queries grounded in uploaded documents

- **ML (`ml/`)**
  - `download_model.sh` placeholder to fetch / prepare the Llama 3.2 3B weights (or hook to RunAnywhere)

- **Automation / Tooling**
  - `scripts/` for one-command setup and demo running
  - GitHub workflow for demo backup (`.github/workflows/demo-backup.yml`)

---

## Quickstart (Hackathon Flow)

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # fill in RunAnywhere token etc.
python app.py
```

Backend will default to `http://127.0.0.1:8000`.

### 2. Frontend Setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend will default to `http://127.0.0.1:5173`.

### 3. End-to-end via helper script

From project root:

```bash
chmod +x run.sh
./run.sh
```

This script starts backend and frontend in parallel (Unix-like environments). On Windows, run backend and frontend commands in separate terminals.

---

## Environment Variables

- **Root `.env` (optional)** – shared values for scripts / CI
  - `RUNANYWHERE_API_KEY` – API key/token for RunAnywhere SDK
  - `NYAYNETI_ENV` – `dev` | `prod`

- **Backend `backend/.env`**
  - `FLASK_ENV` – `development` or `production`
  - `BACKEND_PORT` – default `8000`
  - `RUNANYWHERE_API_KEY` – required for real Llama calls
  - `LLM_MODEL_NAME` – e.g. `llama-3.2-3b-instruct`

- **Frontend `frontend/.env`**
  - `VITE_API_BASE_URL` – usually `http://127.0.0.1:8000/api`

See `.env.example` files in root, backend and frontend for templates.

---

## Key Features (MVP)

- **Offline-first research**:
  - PDF uploads stored locally; embeddings built on disk
  - No cloud requirements beyond RunAnywhere model API
- **Law-aware UI:**
  - Citations visually grouped (`CitationBadge`)
  - PDF viewer panel + answer panel side by side
- **Hackathon friendly**:
  - Minimal configuration
  - Sample demo PDFs and a scripted demo flow (`docs/DEMO_SCRIPT.md`)

---

## Development Scripts

- `scripts/setup.sh` – install backend + frontend dependencies, copy demo envs
- `scripts/run_dev.sh` – run backend and frontend concurrently
- `scripts/test_demo.sh` – smoke tests (`backend/test_api.py`, `tests/`)
- `scripts/prepare_demo_data.sh` – optional hook to pre-process demo PDFs

---

## Testing

- **Backend**: `pytest backend test_backend.py tests/test_backend.py`
- **Frontend**: `npm test` in `frontend/` (basic Jest/Vitest placeholder)

---

## License

This project is licensed under the **MIT License** – see `LICENSE` for details.

---

## Contributing

This is primarily an MVP for HackShastra, but feel free to:

- Open issues for bugs found in the demo
- Submit PRs that improve:
  - Legal citation extraction for Indian cases
  - Better offline embeddings workflow
  - UI/UX for advocates and law students

See `CONTRIBUTING.md` for guidelines.

