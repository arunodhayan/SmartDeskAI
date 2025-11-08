from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from models.summarizer import summarize_text
from models.chat_engine import ChatEngine
from utils.file_parser import extract_text_and_images
from utils.image_captioner import caption_images
from utils.web_extractor import extract_text_from_url
import tempfile, os, traceback

# =========================================================
# 🚀 SmartDesk AI FastAPI Backend
# =========================================================
app = FastAPI(title="SmartDesk AI Backend")
chatbot = ChatEngine()

# =========================================================
# 📘 Request Schemas
# =========================================================
class TextInput(BaseModel):
    text: str


# ✅ Extended to include optional context (summary)
class ChatInput(BaseModel):
    message: str
    context: str | None = None


# =========================================================
# 🧾 Summarization Endpoint
# =========================================================
@app.post("/summarize")
def summarize(input_data: TextInput):
    """Summarize plain text."""
    try:
        summary = summarize_text(input_data.text)
        return {"summary": summary}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Summarization error: {e}")


# =========================================================
# 💬 Standard Chat Endpoint (returns full reply)
# =========================================================
@app.post("/chat")
def chat(input_data: ChatInput):
    """
    Chat with SmartDesk AI.
    If a context (summary) is provided, use it to guide the response.
    """
    try:
        prompt = (
            f"Context:\n{input_data.context}\n\nQuestion:\n{input_data.message}"
            if input_data.context
            else input_data.message
        )
        reply = chatbot.chat(prompt)
        return {"reply": reply}
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Chat error: {e}")


# =========================================================
# ⚡ Streaming Chat Endpoint (progressive token output)
# =========================================================
@app.post("/chat/stream")
def chat_stream(input_data: ChatInput):
    """
    Stream chat replies token-by-token.
    Supports optional 'context' (summary from last document).
    """
    try:
        prompt = (
            f"Context:\n{input_data.context}\n\nQuestion:\n{input_data.message}"
            if input_data.context
            else input_data.message
        )
        generator = chatbot.chat_stream(prompt)

        def generate():
            for chunk in generator:
                yield chunk

        return StreamingResponse(generate(), media_type="text/plain")

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Streaming chat error: {e}")


# =========================================================
# 📄 Document Parsing Endpoint
# =========================================================
@app.post("/parse")
def parse_document(file: UploadFile = File(...)):
    """Extract text only (PDF/DOCX/PPTX)."""
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
            tmp.write(file.file.read())
            tmp_path = tmp.name

        result = extract_text_and_images(tmp_path, output_dir="parsed_images")
        os.remove(tmp_path)

        return {
            "filename": file.filename,
            "text_preview": result["text"][:5000],
            "num_images": len(result["images"])
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"File parsing error: {e}")


# =========================================================
# 🌍 Unified Analyzer (PDF/DOCX/PPTX or Web URL)
# =========================================================
@app.post("/analyze")
async def analyze_document(file: UploadFile = None, url: str = None):
    """Analyze & Summarize any document or URL."""
    try:
        text, images = "", []

        # --- Case 1: URL provided ---
        if url:
            print(f"🌐 Extracting text from URL: {url}")
            text = await extract_text_from_url(url)

        # --- Case 2: File upload provided ---
        elif file:
            with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as tmp:
                tmp.write(file.file.read())
                tmp_path = tmp.name

            result = extract_text_and_images(tmp_path, output_dir="parsed_images")
            text, images = result["text"], result["images"]
            os.remove(tmp_path)
        else:
            raise HTTPException(status_code=400, detail="Provide either a file or a URL.")

        if not text.strip():
            raise HTTPException(status_code=400, detail="No text content found in input.")

        print(f"🧠 Summarizing extracted text ({len(text)} chars)")
        summary = summarize_text(text[:4000])

        return {
            "source": url or file.filename,
            "text_preview": text, #[:14200],
            "num_images": len(images),
            "summary": summary
        }

    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Document analysis error: {e}")


# =========================================================
# ✅ Health Check Endpoint
# =========================================================
@app.get("/")
def root():
    return {"status": "SmartDesk AI backend is running!"}
