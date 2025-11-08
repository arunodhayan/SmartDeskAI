import torch
from transformers import AutoTokenizer, AutoModelForCausalLM
from openai import OpenAI
from config import USE_OFFLINE, MODEL_NAME_OFFLINE, MODEL_NAME_ONLINE, OPENAI_API_KEY

# ---------------------------------------------------------
#  Load model / tokenizer once at startup
# ---------------------------------------------------------
tokenizer, model, client = None, None, None

if USE_OFFLINE:
    print(f"🧠 Loading offline model: {MODEL_NAME_OFFLINE}")
    # Hugging Face model identifier or local path
    tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME_OFFLINE, trust_remote_code=True)
    model = AutoModelForCausalLM.from_pretrained(
        MODEL_NAME_OFFLINE,
        torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
        device_map="auto",
    )
else:
    print(f"🌐 Using online model: {MODEL_NAME_ONLINE}")
    client = OpenAI(api_key=OPENAI_API_KEY)

# ---------------------------------------------------------
#  Summarization function
# ---------------------------------------------------------
def summarize_text(text: str) -> str:
    if USE_OFFLINE:
        prompt = f"Summarize this text in 5 concise bullet points:\n\n{text[:3000]}"
        inputs = tokenizer(prompt, return_tensors="pt").to(model.device)

        with torch.no_grad():
            outputs = model.generate(
                **inputs,
                max_new_tokens=256,
                temperature=0.5,
                do_sample=False,
                pad_token_id=tokenizer.eos_token_id,
            )

        summary = tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Clean prefix if present
        summary = summary.split("Summarize this text in 5 concise bullet points:")[-1].strip()
        return summary

    else:
        completion = client.chat.completions.create(
            model=MODEL_NAME_ONLINE,
            messages=[
                {"role": "system", "content": "You are a concise summarizer."},
                {"role": "user", "content": f"Summarize this text:\n{text[:4000]}"},
            ],
            temperature=0.5,
        )
        return completion.choices[0].message.content
