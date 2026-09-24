import base64, io, json
from pathlib import Path
import faiss, numpy as np, torch, uvicorn
from fastapi import FastAPI, File, UploadFile
from PIL import Image
from transformers import CLIPModel, CLIPProcessor
from LLM_call import calling_LLM

app = FastAPI()

VECTOR_DIR = Path(__file__).resolve().parent.parent / "vectors"
INDEX_FILE = VECTOR_DIR / "instagram_faiss.index"
METADATA_FILE = VECTOR_DIR / "instagram_metadata.json"

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

index = faiss.read_index(str(INDEX_FILE)) if INDEX_FILE.exists() else None
metadata = json.loads(METADATA_FILE.read_text("utf-8")) if METADATA_FILE.exists() else []


@app.post("/input_image")
async def process_image(file: UploadFile = File(...)):
    raw_bytes = await file.read()
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    img_base64 = base64.b64encode(raw_bytes).decode("utf-8")

    with torch.no_grad():
        vec = model.get_image_features(**processor(images=img, return_tensors="pt")).numpy()[0]
    vec = (vec / (np.linalg.norm(vec) or 1)).astype(np.float32).reshape(1, -1)

    similar_results = []
    if index is not None and len(metadata) > 0:
        distances, indices = index.search(vec, 200)
        for score, idx in zip(distances[0], indices[0]):
            if idx < len(metadata):
                item = metadata[idx]
                caption_text = str(item.get("caption", "")).strip()
                if caption_text:
                    similar_results.append({
                        "caption": caption_text,
                        "score": float(score)
                    })
                    if len(similar_results) == 50:
                        break

    raw_response = calling_LLM(img_base64, similar_results)
    
    try:
        llm_data = json.loads(raw_response)
    except json.JSONDecodeError:
        llm_data = {"raw_output": raw_response}

    return {"llm_response": llm_data, "similar_results": similar_results}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
