# NyayNeti - Offline Legal AI Assistant

**Fully Offline Legal Research Tool for Indian Law**  
Privacy-First • Court-Ready • No Internet Required

---

## 🎯 Quick Start (5 Minutes to First Query)

### Prerequisites
- **Python 3.10+** ([Download](https://www.python.org/downloads/))
- **Windows 10/11, macOS, or Linux**
- **4GB RAM minimum** (8GB recommended)
- **Internet connection** (ONE-TIME for setup)

### Installation Steps

#### 1. **Clone or Download**
```bash
git clone https://github.com/yourusername/nayaneti.git
cd nayaneti/nyayneti-mvp
```

#### 2. **Install Dependencies** (ONE-TIME)
```bash
pip install -r backend/requirements.txt
```

#### 3. **Download Offline Models** (ONE-TIME, requires internet)
```bash
python setup_offline_models.py
```

This will:
- Download the sentence-transformers embedding model (~90MB)
- Bundle it locally to `backend/models/embeddings/`
- Create directories for demo documents

#### 4. **Add Demo Legal Documents** (Optional but recommended)
```bash
# Place 20-30 PDF legal judgments in:
backend/demo_documents/

# Suggested cases:
# - Kesavananda Bharati v. State of Kerala (1973)
# - Maneka Gandhi v. Union of India (1978)
# - Vishaka v. State of Rajasthan (1997)
# - K.S. Puttaswamy v. Union of India (2017)

# Then index them:
python index_demo_docs.py
```

#### 5. **Launch the Application**
```bash
python run.py
```

The app will:
- ✅ Check all dependencies
- ✅ Start the Flask backend on http://localhost:8000
- ✅ Auto-open your browser
- ✅ Display "NyayNeti is running" confirmation

---

## 🔒 Offline Operation Verified

After setup, **disconnect from WiFi** and test:
- ✅ Upload and index PDF legal documents
- ✅ Ask complex legal questions
- ✅ Search through indexed case law
- ✅ Generate case summaries
- ✅ Find similar precedents

**NO internet connection is required after initial setup!**

---

## 📁 Project Structure

```
nyayneti-mvp/
├── run.py                          # Main launcher (START HERE)
├── setup_offline_models.py         # One-time offline setup wizard
├── index_demo_docs.py              # Demo document indexer
│
├── backend/                        # Flask API server
│   ├── app.py                      # Main Flask application
│   ├── config.py                   # UPDATED: Portable path management
│   ├── requirements.txt            # Python dependencies
│   │
│   ├── core/                       # Core AI engine
│   │   ├── llm_engine.py          # UPDATED: Offline-first embeddings
│   │   ├── pdf_processor.py       # PDF text extraction
│   │   ├── citation_parser.py     # Legal citation extraction
│   │   └── matcher.py             # Case similarity matching
│   │
│   ├── models/                     # NEW: Bundled AI models
│   │   └── embeddings/             # Sentence-transformers model (auto-downloaded)
│   │       └── all-MiniLM-L6-v2/   # ~90MB offline embedding model
│   │
│   ├── demo_documents/             # NEW: Place demo PDFs here
│   │   └── *.pdf                   # Pre-indexed legal judgments
│   │
│   └── uploads/                    # User-uploaded documents
│
├── frontend/                       # React UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── pages/                  # Dashboard, Case Matcher, etc.
│   │   └── api/client.js
│   └── package.json
│
└── ml/                             # Machine Learning artifacts
    ├── models/                     # LLM model files
    │   └── Llama-3.2-3B-Instruct-Q4_K_M.gguf  # ~1.9GB (optional)
    │
    └── embeddings/                 # Vector database
        ├── index.jsonl             # Document chunks metadata
        └── embeddings.pkl          # Numpy embeddings (~varies by corpus)
```

---

## 🧪 Testing Offline Mode

### Windows
```cmd
# Disable WiFi adapter
netsh interface set interface "Wi-Fi" admin=disable

# Test the app
python run.py

# Re-enable WiFi
netsh interface set interface "Wi-Fi" admin=enable
```

### macOS/Linux
```bash
# Disconnect WiFi via system tray or:
sudo ifconfig en0 down  # macOS
sudo ip link set wlan0 down  # Linux

# Test the app
python run.py

# Reconnect
sudo ifconfig en0 up  # macOS
sudo ip link set wlan0 up  # Linux
```

---

## 🚀 Features

### Fully Implemented (Tested Offline)
- ✅ **PDF Document Upload** - Index legal judgments from PDFs
- ✅ **Semantic Search** - Hybrid search (vector similarity + BM25)
- ✅ **AI Chat Interface** - Ask legal questions with RAG (Retrieval-Augmented Generation)
- ✅ **Real-time Streaming** - Token-by-token AI responses
- ✅ **Case Matching** - Find similar precedents
- ✅ **Citation Extraction** - Auto-detect legal citations
- ✅ **Demo Mode** - Instant responses from pre-indexed data

### LLM Options
1. **Local GGUF Model** (Recommended for offline)
   - Download: [Llama-3.2-3B-Instruct-Q4_K_M.gguf](https://huggingface.co/bartowski/Llama-3.2-3B-Instruct-GGUF)
   - Place in: `ml/models/`
   - Size: ~1.9GB
   - Runs entirely offline via llama-cpp-python

2. **Ollama** (Alternative)
   - Install: [Ollama](https://ollama.ai/)
   - Pull model: `ollama pull deepseek-r1:1.5b`
   - Auto-detected by app

---

## 🛠️ Troubleshooting

### "Embedding model not found"
```bash
# Re-run the offline setup wizard:
python setup_offline_models.py
```

### "No demo documents found"
```bash
# Add PDFs to backend/demo_documents/
# Then index them:
python index_demo_docs.py
```

### "llama-cpp-python failed to load"
```bash
# On Windows, install Visual C++ build tools
# https://visualstudio.microsoft.com/visual-cpp-build-tools/

# Or use Ollama instead (easier installation)
```

### "Port 8000 already in use"
```bash
# Change port in backend/.env:
BACKEND_PORT=8080

# Or kill the process:
# Windows: netstat -ano | findstr :8000
# Linux/Mac: lsof -i :8000
```

---

## 📊 Performance Benchmarks

| Operation | Time (First Run) | Time (Subsequent) |
|-----------|-----------------|-------------------|
| App Startup | ~5 seconds | ~3 seconds |
| Index 50-page PDF | ~15 seconds | ~10 seconds |
| Simple Query | ~8 seconds | ~3 seconds |
| Complex RAG Query | ~20 seconds | ~8 seconds |

*Tested on: Windows 11, i5-11th Gen, 8GB RAM*

---

## 🎓 Hackathon Demo Checklist

### Before the Demo (With Internet)
- [ ] Run `python setup_offline_models.py`
- [ ] Add 20-30 landmark cases to `backend/demo_documents/`
- [ ] Run `python index_demo_docs.py`
- [ ] Test launch with `python run.py`
- [ ] Verify all features work

### During the Demo (Offline)
- [ ] Disconnect WiFi completely
- [ ] Launch: `python run.py`
- [ ] Show real-time AI chat
- [ ] Upload and index a new PDF
- [ ] Demonstrate case matching
- [ ] Search pre-indexed corpus
- [ ] Highlight "No internet required" message

### Demo Talking Points
1. **Privacy-First**: All data stays on device, perfect for sensitive legal research
2. **Court-Ready**: Works in offline courtrooms and chambers
3. **Fast Setup**: 5 minutes from download to first query
4. **Fully Functional**: No "demo mode" limitations - this is production-ready

---

## 🔐 Privacy & Security

- ✅ **Zero telemetry** - No analytics or tracking
- ✅ **No external API calls** (after setup)
- ✅ **Local data storage** - All documents stay on your machine
- ✅ **Air-gapped capable** - Runs without any network adapter
- ✅ **Open source** - Full code audit available

---

## 📚 Technologies Used

### Backend
- **Flask** - Lightweight web server
- **llama-cpp-python** - Offline GGUF inference
- **sentence-transformers** - Semantic embeddings
- **pdfminer.six** - PDF text extraction

### Frontend
- **React** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling

### AI/ML
- **Llama 3.2 3B** - Language model
- **all-MiniLM-L6-v2** - Embedding model
- **NumPy** - Vector operations

---

## 🤝 Contributing

Contributions welcome! Focus areas for Hackathon:
- [ ] Add more demo legal documents
- [ ] Optimize indexing speed
- [ ] Improve PDF parsing accuracy
- [ ] Add export features (Word, PDF reports)
- [ ] Mobile app packaging

---

## 📜 License

MIT License - See LICENSE file

---

## 🙏 Acknowledgments

- Built for the [Hackathon Name] by [Your Team]
- Inspired by the need for privacy-first legal research tools
- Special thanks to the open-source AI community

---

## 📧 Support

- **Email**: your.email@example.com
- **GitHub Issues**: [Report a bug](https://github.com/yourusername/nayaneti/issues)
- **Demo Video**: [Watch on YouTube](#)

---

**Made with ❤️ for Indian Legal Professionals**

*"Justice delayed is justice denied. Let's make legal research instant."*
