import io, json
from pathlib import Path
import numpy as np, torch, uvicorn
from fastapi import FastAPI, File, UploadFile
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

app = FastAPI()

VECTOR_DIR = Path(__file__).resolve().parent.parent / "vectors"
EMBEDDINGS_FILE = VECTOR_DIR / "embeddings.npy"
IMAGE_IDS_FILE = VECTOR_DIR / "image_ids.json"

model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32")
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")

dataset_embeddings = np.load(EMBEDDINGS_FILE) if EMBEDDINGS_FILE.exists() else np.empty((0, 512), dtype=np.float32)
image_ids = json.loads(IMAGE_IDS_FILE.read_text("utf-8")) if IMAGE_IDS_FILE.exists() else []


@app.post("/input_image")
async def process_image(file: UploadFile = File(...)):
    img = Image.open(io.BytesIO(await file.read())).convert("RGB")
    
    with torch.no_grad():
        vec = model.get_image_features(**processor(images=img, return_tensors="pt")).numpy()[0]
    vec /= np.linalg.norm(vec) or 1

    # ponytail: in-memory numpy dot product. Ceiling: ~50k vectors. Upgrade: FAISS / vector DB.
    scores = np.dot(dataset_embeddings, vec)
    top_k = np.argsort(scores)[-5:][::-1]

    return {"similar_images": [{"image_id": image_ids[i], "score": float(scores[i])} for i in top_k]}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
