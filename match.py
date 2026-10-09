import os
import sys
import json
from pathlib import Path
import numpy as np
from PIL import Image
import faiss
import onnxruntime as ort

# Configure stdout for utf-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
    except Exception:
        pass

ROOT_DIR = Path(__file__).resolve().parent
VECTOR_DIR = ROOT_DIR / "vectors"
INDEX_PATH = VECTOR_DIR / "instagram_faiss.index"
METADATA_PATH = VECTOR_DIR / "instagram_metadata.json"
MODEL_PATH = VECTOR_DIR / "dinov2_onnx_quantized" / "model_quantized.onnx"

# 1. Load FAISS index and metadata
index = faiss.read_index(str(INDEX_PATH))
with open(METADATA_PATH, "r", encoding="utf-8") as f:
    metadata_store = json.load(f)

print(f"Loaded FAISS index with {index.ntotal} vectors (384-dim)!")

# 2. Load DINOv2 ONNX quantized model session
opts = ort.SessionOptions()
opts.enable_cpu_mem_arena = False
session = ort.InferenceSession(str(MODEL_PATH), sess_options=opts, providers=["CPUExecutionProvider"])

DINO_MEAN = np.array([0.485, 0.456, 0.406], dtype=np.float32).reshape(1, 1, 3)
DINO_STD  = np.array([0.229, 0.224, 0.225], dtype=np.float32).reshape(1, 1, 3)

def preprocess(img: Image.Image) -> np.ndarray:
    img = img.convert("RGB")
    w, h = img.size
    scale = 224.0 / min(w, h)
    img_resized = img.resize((int(round(w * scale)), int(round(h * scale))), Image.Resampling.BICUBIC)
    left, top = (img_resized.width - 224) // 2, (img_resized.height - 224) // 2
    arr = (np.asarray(img_resized.crop((left, top, left + 224, top + 224)), dtype=np.float32) / 255.0 - DINO_MEAN) / DINO_STD
    return np.transpose(arr, (2, 0, 1))[np.newaxis, ...]

def search_similar_captions(image_path: str, top_k: int = 5):
    if not os.path.exists(image_path):
        print(f"Error: Test image '{image_path}' not found!")
        return

    img = Image.open(image_path)
    ort_inputs = {"pixel_values": preprocess(img)}
    outputs = session.run(["last_hidden_state"], ort_inputs)
    cls_token = outputs[0][0, 0, :]
    query_vector = (cls_token / (np.linalg.norm(cls_token) or 1)).astype(np.float32).reshape(1, -1)

    distances, indices = index.search(query_vector, top_k)

    print(f"\nQuery Image: {os.path.basename(image_path)}")
    print("=" * 60)
    for rank, (score, idx) in enumerate(zip(distances[0], indices[0]), 1):
        item = metadata_store[idx]
        print(f"Match #{rank} [Similarity Score: {score:.4f}]")
        print(f"  * Image ID: {item['image_id']}")
        print(f"  * Caption:  {item['caption']}")
        print(f"  * Disk Path: {item['full_path']}")
        print("-" * 60)

if __name__ == "__main__":
    test_img = sys.argv[1] if len(sys.argv) > 1 else str(ROOT_DIR / "testing img" / "Gym selfie.jpg")
    search_similar_captions(test_img, top_k=5)
