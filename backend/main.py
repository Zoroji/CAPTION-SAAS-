import base64, io, json, os, psutil
from pathlib import Path
import faiss, numpy as np, uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import onnxruntime as ort
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
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VECTOR_DIR = Path(__file__).resolve().parent.parent / "vectors"
INDEX_FILE = VECTOR_DIR / "instagram_faiss.index"
METADATA_FILE = VECTOR_DIR / "instagram_metadata.json"

index = faiss.read_index(str(INDEX_FILE)) if INDEX_FILE.exists() else None
metadata = json.loads(METADATA_FILE.read_text("utf-8")) if METADATA_FILE.exists() else []

# ponytail: Pure numpy/PIL preprocessor replaces 270MB transformers CLIPProcessor
CLIP_MEAN = np.array([0.48145466, 0.4578275, 0.40821073], dtype=np.float32).reshape(1, 1, 3)
CLIP_STD  = np.array([0.26862954, 0.26130258, 0.27577711], dtype=np.float32).reshape(1, 1, 3)

def preprocess(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB")
    w, h = img.size
    scale = 224.0 / min(w, h)
    img = img.resize((int(round(w * scale)), int(round(h * scale))), Image.Resampling.BICUBIC)
    left, top = (img.width - 224) // 2, (img.height - 224) // 2
    arr = (np.asarray(img.crop((left, top, left + 224, top + 224)), dtype=np.float32) / 255.0 - CLIP_MEAN) / CLIP_STD
    return np.transpose(arr, (2, 0, 1))[np.newaxis, ...]

# ponytail: Lazy load ONNX session on first request to keep idle RAM under 115 MB
session = None

def get_session():
    global session
    if session is None:
        model_path = Path(__file__).resolve().parent / "onnx_clip_quantized" / "model_quantized.onnx"
        opts = ort.SessionOptions()
        opts.enable_cpu_mem_arena = False
        session = ort.InferenceSession(str(model_path), sess_options=opts, providers=["CPUExecutionProvider"])
    return session


@app.post("/input_image")
async def process_image(file: UploadFile = File(...)):
    raw_bytes = await file.read()
    img = Image.open(io.BytesIO(raw_bytes))
    img_base64 = base64.b64encode(raw_bytes).decode("utf-8")
    
    sess = get_session()
    ort_inputs = {
        "input_ids": np.array([[49406, 320, 1125, 49407]], dtype=np.int64),
        "pixel_values": preprocess(img),
        "attention_mask": np.array([[1, 1, 1, 1]], dtype=np.int64)
    }
    outputs = sess.run(["image_embeds"], ort_inputs)
    vec = outputs[0][0]
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
