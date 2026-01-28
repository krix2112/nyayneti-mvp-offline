# 🚀 NyayNeti - Quick Start Guide (Hackathon Edition)

**Get from zero to running in 5 minutes!**

---

## ⏱️ Pre-Demo Setup (Do This BEFORE Jan 31st)

### Step 1: Install Python (If not already installed)
- Download Python 3.10+ from [python.org](https://www.python.org/downloads/)
- ✅ CHECK: `python --version` should show 3.10 or higher

### Step 2: Install Dependencies (ONE-TIME)
```bash
cd nyayneti-mvp
pip install -r backend/requirements.txt
```
⏱️ Expected time: 3-5 minutes

### Step 3: Download Offline Models (ONE-TIME, needs internet)
```bash
python setup_offline_models.py
```
This will:
- Download sentence-transformers embedding model (~90MB)
- Create necessary directories
- Prepare for offline operation

⏱️ Expected time: 2-3 minutes

### Step 4: Add Demo Legal Documents
```bash
# 1. Place 20-30 Indian Supreme Court PDF judgments in:
#    backend/demo_documents/

# 2. Index them:
python index_demo_docs.py
```

**Recommended cases to include:**
- Kesavananda Bharati v. State of Kerala (1973) - Basic Structure Doctrine
- Maneka Gandhi v. Union of India (1978) - Article 21 Expansion
- Vishaka v. State of Rajasthan (1997) - Sexual Harassment Guidelines
- K.S. Puttaswamy v. Union of India (2017) - Right to Privacy
- Arnesh Kumar v. State of Bihar (2014) - Arrest Guidelines

⏱️ Expected time: 5-10 minutes (depends on number of PDFs)

### Step 5: Verify Offline Readiness
```bash
python verify_offline.py
```
Should show: ✅ ALL CHECKS PASSED

---

## 🎬 Demo Day Procedure (Jan 31st)

### Before Your Presentation:
1. **Test internet disconnection:**
   ```bash
   # Disconnect WiFi
   # Run: python verify_offline.py
   # Should confirm: "OFFLINE MODE CONFIRMED"
   ```

2. **Do a dry run:**
   ```bash
   python run.py
   # Should open browser to http://localhost:8000
   # Try a sample query: "Tell me about Article 21 interpretations"
   ```

3. **Prepare talking points:**
   - "Zero internet dependencies after setup"
   - "Perfect for court chambers with no WiFi"
   - "All data stays on device - full privacy"

### During Your Presentation:

#### 1. DRAMATIC OPENING (30 seconds)
- Show WiFi settings on screen
- **Disconnect WiFi in front of judges**
- Say: *"Let me show you an AI that works without internet..."*

#### 2. LAUNCH THE APP (15 seconds)
```bash
python run.py
```
- Auto-opens browser
- Point out: "5 second startup, no cloud connection"

#### 3. CORE DEMO (2 minutes)

**Query 1: Pre-indexed corpus search**
```
"What are the key principles from Kesavananda Bharati case?"
```
- Show instant retrieval from local docs
- Point out: "No API call, all local AI reasoning"

**Query 2: Upload new document**
- Drag & drop a landmark judgment PDF
- Show indexing progress (~10 seconds)
- Query it immediately

**Query 3: Case matching**
- Open Case Matcher tab
- Upload a legal brief
- Show similar case discovery

#### 4. TECHNICAL HIGHLIGHT (1 minute)
Open terminal and show:
```bash
# Show no internet
python verify_offline.py

# Show embedding model location
ls backend/models/embeddings/

# Show indexed documents
ls ml/embeddings/
```

#### 5. CLOSING STATEMENT (30 seconds)
- "This runs on a $500 laptop"
- "No monthly API fees, no data privacy concerns"
- "Ready for deployment in any Indian court today"

---

## 🔥 Demo Script (Copy-Paste Ready)

```
NARRATOR:
"Legal research tools today require constant internet and send 
sensitive case data to cloud servers. But what if you're in a 
rural court with no WiFi? Or handling confidential matters?"

[DISCONNECT WIFI ON SCREEN]

"Let me introduce NyayNeti - India's first fully offline legal AI."

[LAUNCH]
python run.py

[DEMO]
"I can ask complex legal questions..."
[Type: "Explain Arnesh Kumar guidelines for arrest procedures"]

"Upload PDFs and search them immediately..."
[Upload → Index → Query]

"Find similar precedents automatically..."
[Show Case Matcher with similarity scores]

[VERIFY]
python verify_offline.py
[Show "OFFLINE MODE CONFIRMED"]

"All of this - with ZERO internet connection. Perfect for 
Indian courts, law firms, and anyone who values privacy."

[RE-CONNECT WIFI]

"Questions?"
```

---

## ⚡ Lightning Troubleshooting

### Issue: "Port 8000 already in use"
```bash
# Windows
netstat -ano | findstr :8000
taskkill /F /PID [PID_from_above]

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

### Issue: "Embedding model not found"
```bash
python setup_offline_models.py
```

### Issue: "llama-cpp-python import error"
```bash
# Use Ollama instead:
# 1. Install: https://ollama.ai/
# 2. Run: ollama pull deepseek-r1:1.5b
# 3. App will auto-detect and use it
```

### Issue: "No demo documents indexed"
```bash
# Check if PDFs exist
ls backend/demo_documents/

# Re-index
python index_demo_docs.py
```

---

## 📊 What Judges Will Ask (Be Prepared!)

**Q: "How accurate is the AI?"**
A: "We use Llama 3.2 3B with RAG (Retrieval-Augmented Generation). 
It cites specific documents, so lawyers can verify every answer. 
It's a research assistant, not a decision-maker."

**Q: "What about data security?"**
A: "Everything runs locally. No cloud uploads, no API calls. 
You can audit the code - it's open source. Perfect for 
confidential cases."

**Q: "Can it handle regional languages?"**
A: "Current version is English. We're working on Hindi and 
other regional languages using similar offline AI techniques."

**Q: "What's the total cost?"**
A: "Zero recurring costs. One-time setup. Compare that to 
cloud AI tools charging $20-50/month per user."

**Q: "What hardware is needed?"**
A: "Any laptop with 4GB RAM. We tested on a basic i3 processor. 
No GPU required (though it helps for speed)."

---

## 🎯 Success Metrics to Highlight

- ✅ **Response time**: 3-8 seconds per query (locally!)
- ✅ **Setuptime**: 5 minutes from download to first query
- ✅ **Database size**: 20-30 cases indexed (~500MB total)
- ✅ **Privacy**: 100% offline, zero external calls
- ✅ **Cost**: $0 recurring fees

---

## 🏆 Competitive Advantages for Pitch

| Feature | NyayNeti | Cloud AI Tools |
|---------|----------|----------------|
| Internet Required | ❌ No | ✅ Yes (always) |
| Data Privacy | ✅ 100% Local | ❌ Uploaded to cloud |
| Monthly Cost | ₹0 | ₹1500-4000 |
| Rural Court Access | ✅ Yes | ❌ No |
| Confidential Cases | ✅ Safe | ⚠️ Risk |

---

## 📞 Emergency Contact (Day-of Demo)

If something breaks during demo:
1. **Restart**: `Ctrl+C` then `python run.py` again
2. **Reset**: Delete `ml/embeddings/` and re-index
3. **Fallback**: Use Demo Mode in Dashboard (instant responses)

---

**Remember: The fact that it works OFFLINE is your killer feature. 
Make sure judges see the WiFi disconnection!**

Good luck! 🚀

---

*Last updated: Jan 27, 2026*
*For: Hackathon Demo on Jan 31, 2026*
