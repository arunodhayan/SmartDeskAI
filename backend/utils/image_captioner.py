import os
import torch
from transformers import AutoProcessor, AutoModelForVision2Seq, VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
from PIL import Image

def caption_images(image_paths):
    """
    Generate captions for each image using either local Paligemma or fallback ViT-GPT2 model.
    """
    # --- Detect local model ---
    local_path = os.getenv("LOCAL_PALIGEMMA_PATH", "paligemma-3b-mix-448")
    device = "cuda" if torch.cuda.is_available() else "cpu"

    model_name = None
    if os.path.exists(os.path.join(local_path, "config.json")):
        model_name = local_path
        print(f"🧠 Using local Paligemma model from: {model_name}")
        processor = AutoProcessor.from_pretrained(model_name)
        model = AutoModelForVision2Seq.from_pretrained(
            model_name,
            torch_dtype=torch.bfloat16 if torch.cuda.is_available() else torch.float32,
            device_map="auto",
        )
    else:
        # --- fallback open model ---
        model_name = "nlpconnect/vit-gpt2-image-captioning"
        print(f"⚠️ Local model not found, using fallback: {model_name}")
        processor = ViTImageProcessor.from_pretrained(model_name)
        tokenizer = AutoTokenizer.from_pretrained(model_name)
        model = VisionEncoderDecoderModel.from_pretrained(model_name).to(device)

    # --- Caption each image ---
    captions = []
    for img_path in image_paths:
        try:
            img = Image.open(img_path).convert("RGB")
            if "paligemma" in model_name:
                inputs = processor(images=img, return_tensors="pt").to(device)
                out = model.generate(**inputs, max_new_tokens=64)
                caption = processor.batch_decode(out, skip_special_tokens=True)[0]
            else:
                pixel_values = processor(images=img, return_tensors="pt").pixel_values.to(device)
                output_ids = model.generate(pixel_values, max_length=64, num_beams=4)
                caption = tokenizer.decode(output_ids[0], skip_special_tokens=True)
            captions.append({"image": img_path, "caption": caption})
        except Exception as e:
            print(f"⚠️ Failed to caption {img_path}: {e}")
            captions.append({"image": img_path, "caption": "Caption generation failed."})
    return captions
