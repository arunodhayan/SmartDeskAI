import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer
from threading import Thread
from openai import OpenAI
from config import USE_OFFLINE, MODEL_NAME_OFFLINE, MODEL_NAME_ONLINE, OPENAI_API_KEY


class ChatEngine:
    def __init__(self):
        self.history = []

        if USE_OFFLINE:
            print(f"🧠 Loading offline model: {MODEL_NAME_OFFLINE}")
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            dtype = torch.bfloat16 if torch.cuda.is_bf16_supported() else (
                torch.float16 if torch.cuda.is_available() else torch.float32
            )

            print(f"🚀 Using device: {self.device} | dtype: {dtype}")

            self.tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME_OFFLINE, trust_remote_code=True)
            self.model = AutoModelForCausalLM.from_pretrained(
                MODEL_NAME_OFFLINE,
                torch_dtype=dtype,
                device_map="auto" if torch.cuda.is_available() else None,
            )
            self.model.eval()
            if hasattr(self.model, "hf_device_map"):
                print("📊 Device map:", self.model.hf_device_map)
        else:
            print(f"🌐 Using online OpenAI model: {MODEL_NAME_ONLINE}")
            self.client = OpenAI(api_key=OPENAI_API_KEY)

    # ==========================================================
    # Main chat function (streaming)
    # ==========================================================
    def chat_stream(self, user_message: str):
        """
        Stream responses token-by-token (generator).
        Yields text chunks progressively for front-end or CLI streaming.
        """
        self.history.append({"role": "user", "content": user_message})

        if USE_OFFLINE:
            prompt = self._build_prompt()
            inputs = self.tokenizer(prompt, return_tensors="pt").to(self.device)

            streamer = TextIteratorStreamer(self.tokenizer, skip_prompt=True, skip_special_tokens=True)
            generation_kwargs = dict(
                **inputs,
                streamer=streamer,
                max_new_tokens=256,
                temperature=0.7,
                top_p=0.9,
                do_sample=True,
                pad_token_id=self.tokenizer.eos_token_id,
            )

            # Run generation in a background thread so we can stream
            thread = Thread(
                target=lambda: self.model.generate(**generation_kwargs),
                daemon=True,
            )
            thread.start()

            with torch.cuda.amp.autocast(enabled=torch.cuda.is_available()):
                for new_text in streamer:
                    yield new_text
        else:
            # OpenAI streaming mode
            stream = self.client.chat.completions.create(
                model=MODEL_NAME_ONLINE,
                messages=self.history,
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.get("content")
                if delta:
                    yield delta

    # ==========================================================
    # Build chat prompt for local model
    # ==========================================================
    def _build_prompt(self) -> str:
        prompt = ""
        for msg in self.history[-5:]:
            role = "User" if msg["role"] == "user" else "Assistant"
            prompt += f"{role}: {msg['content']}\n"
        prompt += "Assistant:"
        return prompt
