import base64
import io
import json
import os
import sys
from pathlib import Path
import psutil
import faiss
import numpy as np
import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import onnxruntime as ort

# Add backend directory to path so LLM_call can be imported
sys.path.append(str(Path(__file__).resolve().parent / "backend"))
from LLM_call import calling_LLM

# Configure stdout and stderr for utf-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

app = FastAPI(title="Redcaps Image Captioning Backend (DINOv2 Test)")

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

VECTOR_DIR = Path(__file__).resolve().parent / "vectors"
INDEX_FILE = VECTOR_DIR / "test_dinov2_faiss.index"
METADATA_FILE = VECTOR_DIR / "test_dinov2_metadata.json"

index = faiss.read_index(str(INDEX_FILE)) if INDEX_FILE.exists() else None
metadata = json.loads(METADATA_FILE.read_text("utf-8")) if METADATA_FILE.exists() else []

# DINOv2 Preprocessor (pure numpy/PIL - ImageNet standard normalization)
DINO_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(1, 1, 3)
DINO_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 1, 3)

def preprocess(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB")
    w, h = img.size
    scale = 224.0 / min(w, h)
    img = img.resize((int(round(w * scale)), int(round(h * scale))), Image.Resampling.BICUBIC)
    left, top = (img.width - 224) // 2, (img.height - 224) // 2
    arr = (np.asarray(img.crop((left, top, left + 224, top + 224)), dtype=np.float32) / 255.0 - DINO_MEAN) / DINO_STD
    return np.transpose(arr, (2, 0, 1))[np.newaxis, ...]

# Lazy load ONNX session on first request to keep idle RAM under 70 MB
session = None

def get_session():
    global session
    if session is None:
        model_path = VECTOR_DIR / "dinov2_onnx_quantized" / "model_quantized.onnx"
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
    ort_inputs = {"pixel_values": preprocess(img)}
    
    outputs = sess.run(["last_hidden_state"], ort_inputs)
    # CLS token at position 0 represents the 384-dimensional image embedding
    vec = outputs[0][0, 0, :]
    vec = (vec / (np.linalg.norm(vec) or 1)).astype(np.float32).reshape(1, -1)

    similar_results = []
    if index is not None and len(metadata) > 0:
        k = min(50, index.ntotal)
        distances, indices = index.search(vec, k)
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


# ---------------------------------------------------------------------------
# Demo Request & Live Server Execution
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--serve":
        print("Starting FastAPI server with DINOv2-small on http://127.0.0.1:8000...")
        uvicorn.run(app, host="127.0.0.1", port=8000)
    else:
        # Run demo request and test /memory before & after request
        from fastapi.testclient import TestClient
        client = TestClient(app)

        print("=" * 70)
        print("🧪 RUNNING DEMO REQUEST TEST WITH DINOv2 (1,000 VECTOR INDEX)")
        print("=" * 70)

        # 1. Check memory before any request (server start / idle state)
        mem_resp_start = client.get("/memory")
        mem_start = mem_resp_start.json()["ram_usage_mb"]
        print(f"📊 [Step 1] /memory at Server Start (Idle): {mem_start} MB")

        # 2. Check health endpoint
        health_resp = client.get("/health")
        print(f"✅ [Step 2] /health Response: {health_resp.json()}")

        # 3. Send demo request to /input_image with a real test image
        test_img_path = Path(__file__).resolve().parent / "testing img" / "Gym selfie.jpg"
        if not test_img_path.exists():
            test_img_path = Path(__file__).resolve().parent / "Gym selfie.jpg"

        print(f"\n🚀 [Step 3] Sending POST /input_image with '{test_img_path.name}'...")
        with open(test_img_path, "rb") as f:
            response = client.post(
                "/input_image",
                files={"file": (test_img_path.name, f, "image/jpeg")}
            )

        print(f"Status Code: {response.status_code}")
        resp_json = response.json()
        
        similar_count = len(resp_json.get("similar_results", []))
        print(f"Found {similar_count} similar captions from 1,000 vector dataset.")
        print("Top 3 Similar Captions retrieved:")
        for i, match in enumerate(resp_json.get("similar_results", [])[:3], 1):
            print(f"   #{i} [Score: {match['score']:.4f}]: \"{match['caption']}\"")

        # 4. Check memory after request has been processed (active state)
        mem_resp_after = client.get("/memory")
        mem_after = mem_resp_after.json()["ram_usage_mb"]
        print(f"\n📊 [Step 4] /memory After Request (Active): {mem_after} MB")
        
        delta = mem_after - mem_start
        print(f"📈 [Step 5] Memory Delta (Active - Start): +{delta:.2f} MB")
        
        print("\n" + "=" * 70)
        print("📋 FINAL RESULT SUMMARY")
        print("=" * 70)
        print(f"  • /memory at Start (Idle):       {mem_start:.2f} MB")
        print(f"  • /memory After Request (Active): {mem_after:.2f} MB")
        print(f"  • RAM Increase from Request:     +{delta:.2f} MB")
        print("=" * 70)
