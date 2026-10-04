import base64, io, json, os, psutil
from pathlib import Path
import faiss, numpy as np, uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from optimum.onnxruntime import ORTModelForCustomTasks
from transformers import CLIPProcessor
from LLM_call import calling_LLM

app = FastAPI()

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://caption-saas-zorojis-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VECTOR_DIR = Path(__file__).resolve().parent.parent / "vectors"
INDEX_FILE = VECTOR_DIR / "instagram_faiss.index"
METADATA_FILE = VECTOR_DIR / "instagram_metadata.json"

index = faiss.read_index(str(INDEX_FILE)) if INDEX_FILE.exists() else None
metadata = json.loads(METADATA_FILE.read_text("utf-8")) if METADATA_FILE.exists() else []

# Pre-load Quantized ONNX Model & Processor at startup for 0ms request latency
ONNX_MODEL_DIR = Path(__file__).resolve().parent / "onnx_clip_quantized"
model = ORTModelForCustomTasks.from_pretrained(
    str(ONNX_MODEL_DIR),
    file_name="model_quantized.onnx"
)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")


@app.post("/input_image")
async def process_image(file: UploadFile = File(...)):
    raw_bytes = await file.read()
    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    img_base64 = base64.b64encode(raw_bytes).decode("utf-8")
    
    inputs = processor(text=["a photo"], images=img, return_tensors="np")
    outputs = model(**inputs)
    
    vec = outputs.image_embeds[0]
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


@app.get("/memory")
def check_memory():
    ram_mb = psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024
    return {"ram_usage_mb": round(ram_mb, 2)}


@app.get("/health")
def health():
    return {"reachable": "yes"}


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
