Contributing to NyayNeti MVP
============================

Thanks for your interest in contributing to **NyayNeti – Offline Legal Research AI Assistant for Indian law**.

This project started as a **24-hour hackathon MVP (HackShastra – SnowHack IPEC)**, so the primary goals are:

- Simple, understandable code
- Easy local setup
- A smooth demo experience

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork:

```bash
git clone https://github.com/<your-username>/nyayneti-mvp.git
cd nyayneti-mvp
```

3. Run the setup script (Unix-like):

```bash
chmod +x scripts/setup.sh
./scripts/setup.sh
```

Or follow manual steps in `docs/SETUP_GUIDE.md`.

---

## Areas to Contribute

- **Backend**
  - Better PDF parsing for Indian judgments and bare acts
  - Smarter citation extraction and normalization
  - Improved retrieval-augmented generation (RAG) pipeline

- **Frontend**
  - UX for advocates / law students
  - Dark mode, keyboard shortcuts, better result highlighting
  - Offline/error-state handling

- **ML / LLM**
  - Optimized use of **Llama 3.2 3B** via **RunAnywhere SDK**
  - Better embeddings and indexing for large PDF collections

- **Docs**
  - Demo scripts and troubleshooting tips
  - Legal domain notes (citation formats, court hierarchy, etc.)

---

## Coding Guidelines

- **Python (backend)**
  - Use Python 3.10+ where possible.
  - Follow PEP8 style via `flake8` / `black` (if configured).
  - Keep endpoints thin; move logic into `core/` modules.

- **JavaScript/React (frontend)**
  - Use functional components + hooks.
  - Prefer small, composable components in `src/components/`.
  - Keep API calls isolated in `src/services/api.js`.

- **Commits**
  - Use clear, descriptive commit messages.
  - Reference issues when relevant (e.g. `fix #12: improve citation parser`).

---

## Running Tests

- **Backend tests**

```bash
pytest
```

- **Frontend tests**

```bash
cd frontend
npm test
```

For quick smoke tests, you can also run:

```bash
./scripts/test_demo.sh
```

---

## Submitting a Pull Request

1. Create a feature branch from `main`:

```bash
git checkout -b feature/better-citation-parser
```

2. Make your changes, add tests where appropriate.
3. Ensure tests pass and that the demo flow in `docs/DEMO_SCRIPT.md` still works.
4. Push to your fork and open a PR with:
   - A clear title
   - Short description of the change
   - Screenshots or terminal output if helpful

We will prioritize changes that:

- Improve demo stability
- Enhance the legal research experience for Indian law
- Keep the setup simple for new contributors

Thanks again for helping improve NyayNeti!

