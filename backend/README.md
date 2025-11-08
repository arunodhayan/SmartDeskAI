# 🧠 SmartDesk AI — FastAPI Backend

SmartDesk AI is a modular **FastAPI** backend for intelligent document analysis, summarization, and conversational AI.  
It supports both **offline Hugging Face models** (e.g. Gemma, Paligemma) and **online OpenAI APIs**, with endpoints for summarization, chat, document parsing, and web extraction.

---

## 🚀 Features

- 📄 Extracts **text + images** from PDF, DOCX, PPTX  
- 🌐 Fetches and cleans **web articles** (Nature, PLOS, MDPI, etc.)  
- 🧾 Summarizes text using **Gemma (offline)** or **GPT-4o-mini (online)**  
- 💬 Chat endpoint with **token streaming** support  
- ⚙️ Easily toggle offline / online inference with environment variables  

---

## 📦 Folder Structure

```
smartdesk_backend/
├── main.py               # FastAPI entrypoint
├── mains_backend.sh      # Launch script (Uvicorn)
├── docker-compose.yml    # Compose file for deployment
├── config.py             # Loads environment variables
│
├── models/
│   ├── summarizer.py     # Text summarization logic
│   └── chat_engine.py    # Chat engine + streaming output
│
├── utils/
│   ├── file_parser.py    # PDF/DOCX/PPTX parsing + OCR
│   ├── image_captioner.py# Image caption generation
│   └── web_extractor.py  # Extracts text from URLs
```

---

## ⚙️ Configuration

All runtime variables are set in `docker-compose.yml`:

```yaml
environment:
  USE_OFFLINE: "True"                 # True = local Hugging Face model
  MODEL_NAME_OFFLINE: "google/gemma-3n-e2b-it"
  MODEL_NAME_ONLINE: "gpt-4o-mini"
  OPENAI_API_KEY: "sk-your-openai-key"
  HUGGINGFACE_HUB_TOKEN: "your-hf-token"
```

> When `USE_OFFLINE=True`, make sure your local model folders (e.g. `gemma-3n-e2b-it`) exist inside the container or are mounted.

---

## 🐳 Deployment via Docker Hub

You **don’t need to build** the image locally.  
Just pull the pre-built backend from Docker Hub and start it using Docker Compose.

### 1️⃣ Pull the image
```bash
docker pull arunodhayan/smartdeskai:latest
```

### 2️⃣ Run with Docker Compose
```bash
clone the repo 
docker-compose up -d
```

The FastAPI backend will be available at:  
👉 **http://localhost:8000**  
(or the host IP specified in `mains_backend.sh`)

---

## ⚙️ GPU Server Deployment Example

If you are deploying on a GPU-enabled server (e.g., NVIDIA H100/A100):

```bash
clone the repo 
update in docker compose with machine ipaddress
docker-compose up -d
```

---

## 🔧 Manual Startup (without Docker)

If you prefer running locally:
```bash
pip install -r requirements.txt
python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
```

Or use the helper shell script:
```bash
bash mains_backend.sh
```

---

## 🌍 API Endpoints

| Method | Endpoint | Description |
|:-------|:----------|:-------------|
| GET | `/` | Health check |
| POST | `/summarize` | Summarize text |
| POST | `/chat` | Chat endpoint |
| POST | `/chat/stream` | Stream token-by-token output |
| POST | `/parse` | Parse document (PDF/DOCX/PPTX) |
| POST | `/analyze` | Analyze & summarize document or URL |

---

### 🧾 Example — Summarization

```bash
curl -X POST http://localhost:8000/summarize      -H "Content-Type: application/json"      -d '{"text": "AI helps automate document summarization and improve productivity."}'
```

Response:
```json
{
  "summary": "• AI automates document summarization.\n• Enhances productivity and saves time."
}
```

---

### 💬 Example — Chat

```bash
curl -X POST http://localhost:8000/chat      -H "Content-Type: application/json"      -d '{"message": "Explain how SmartDesk AI works."}'
```

Response:
```json
{
  "reply": "SmartDesk AI extracts, summarizes, and interprets documents using Gemma or GPT models."
}
```

---

### ⚡ Example — Streaming Chat
For real-time responses:
```bash
curl -X POST http://localhost:8000/chat/stream      -H "Content-Type: application/json"      -d '{"message": "Summarize the benefits of AI in healthcare."}'
```
The output will stream token-by-token.

---

### 📄 Example — Parse Document

```bash
curl -X POST http://localhost:8000/parse      -F "file=@sample.pdf"
```

Response:
```json
{
  "filename": "sample.pdf",
  "text_preview": "The document discusses AI-based diagnosis systems...",
  "num_images": 3
}
```

---

### 🧠 Example — Analyze Document or URL

Option 1 — File upload:
```bash
curl -X POST http://localhost:8000/analyze      -F "file=@report.pdf"
```

Option 2 — URL input:
```bash
curl -X POST "http://localhost:8000/analyze?url=https://www.nature.com/articles/ai-healthcare"
```

Response:
```json
{
  "source": "https://www.nature.com/articles/ai-healthcare",
  "num_images": 2,
  "summary": "AI improves diagnostics, treatment, and research efficiency."
}
```

---



## 🧰 Requirements (for local execution)

- Python 3.10+
- CUDA 12.4+ (optional, for GPU)
- Libraries:
  ```
  torch
  transformers
  fastapi
  uvicorn
  pdfplumber
  python-docx
  python-pptx
  pytesseract
  fitz (PyMuPDF)
  playwright
  openai
  ```

---

## 🧑‍💻 Author

**Arunodhayan Sampathkumar, M.Sc.**  
Ph.D. Candidate — Medical Informatics  
Chemnitz University of Technology  
<<<<<<< HEAD
📧 [LinkedIn](https://www.linkedin.com/in/arunodhayan-sampath-kumar/)
=======
📧 [LinkedIn]([https://www.linkedin.com/in/arunodhayan-sampathkumar](https://www.linkedin.com/in/arunodhayan-sampath-kumar/))
>>>>>>> 422c6f4 (frontend)

---

## 🪪 License
Released under the **MIT License**.

---


