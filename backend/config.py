import os
from dotenv import load_dotenv

load_dotenv()

USE_OFFLINE = os.getenv("USE_OFFLINE", "False").lower() == "true"
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
MODEL_NAME_ONLINE = os.getenv("MODEL_NAME_ONLINE", "gpt-4o-mini")
MODEL_NAME_OFFLINE = os.getenv("MODEL_NAME_OFFLINE", "gemma:3n-e2b-it")
