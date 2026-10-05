import os
import sys
import time
import json
import torch
import numpy as np
import pandas as pd
from pathlib import Path
from PIL import Image
import faiss
from transformers import AutoImageProcessor, AutoModel

# ---------------------------------------------------------------------------
# Paths & Configuration
# ---------------------------------------------------------------------------
ROOT_DIR = Path(__file__).resolve().parent
DATASET_BASE = ROOT_DIR / "datasets" / "prithvijaunjale" / "instagram-images-with-captions" / "versions" / "2"
OUTPUT_DIR = ROOT_DIR / "vectors"
BACKUP_DIR = OUTPUT_DIR / "backup_clip_vectors"

BATCH_SIZE = 64
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
MODEL_NAME = "facebook/dinov2-small"

# Configure stdout for utf-8 on Windows
if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
BACKUP_DIR.mkdir(parents=True, exist_ok=True)

# ---------------------------------------------------------------------------
# Step 1: Backup old CLIP vectors if they exist
# ---------------------------------------------------------------------------
files_to_backup = ["instagram_faiss.index", "instagram_metadata.json", "embeddings.npy", "image_ids.json"]
for fname in files_to_backup:
    src = OUTPUT_DIR / fname
    if src.exists() and not (BACKUP_DIR / fname).exists():
        try:
            import shutil
            shutil.copy2(src, BACKUP_DIR / fname)
            print(f"Backed up {fname} to {BACKUP_DIR / fname}")
        except Exception as e:
            print(f"Backup warning for {fname}: {e}")

# ---------------------------------------------------------------------------
# Step 2: Load Model & Processor
# ---------------------------------------------------------------------------
print(f"\nLoading DINOv2 model '{MODEL_NAME}' on DEVICE: {DEVICE}...")
processor = AutoImageProcessor.from_pretrained(MODEL_NAME)
model = AutoModel.from_pretrained(MODEL_NAME).to(DEVICE)
model.eval()

# ---------------------------------------------------------------------------
# Step 3: Queue All Valid Images from Dataset
# ---------------------------------------------------------------------------
queue = []
folders_to_process = [
    ("instagram_data", "captions_csv.csv"),
    ("instagram_data2", "captions_csv2.csv")
]

print("Scanning dataset directories for valid image files...")
for folder_name, csv_filename in folders_to_process:
    folder_path = DATASET_BASE / folder_name
    csv_path = folder_path / csv_filename

    if not csv_path.exists():
        print(f"Warning: {csv_path} not found.")
        continue

    print(f"Reading {csv_filename}...")
    df = pd.read_csv(csv_path, header=None)

    for _, row in df.iterrows():
        raw_path = str(row[1]).strip()
        
        if raw_path.lower() in ["image file", "image_file", "image_path"]:
            continue
            
        caption = str(row[2]).strip() if len(row) > 2 and pd.notna(row[2]) else ""

        if not raw_path.endswith(".jpg"):
            full_img_path = folder_path / (raw_path + ".jpg")
        else:
            full_img_path = folder_path / raw_path

        if full_img_path.exists():
            image_id = f"{folder_name}/{full_img_path.name}"
            queue.append({
                "image_id": image_id,
                "full_path": str(full_img_path),
                "caption": caption,
                "folder": folder_name
            })

total_images = len(queue)
print(f"Total valid Instagram images queued for vectorization: {total_images}")

# ---------------------------------------------------------------------------
# Step 4: Batch Vectorization
# ---------------------------------------------------------------------------
all_embeddings = []
metadata_store = []
image_ids = []

print(f"\nStarting batch vectorization of {total_images} images (Batch Size: {BATCH_SIZE})...")
t_start = time.time()

for i in range(0, total_images, BATCH_SIZE):
    batch_items = queue[i:i + BATCH_SIZE]
    images = []
    valid_items = []

    for item in batch_items:
        try:
            img = Image.open(item["full_path"]).convert("RGB")
            images.append(img)
            valid_items.append(item)
        except Exception:
            continue

    if not images:
        continue

    inputs = processor(images=images, return_tensors="pt").to(DEVICE)

    with torch.no_grad():
        outputs = model(**inputs)
        # Use pooler_output or CLS token
        if hasattr(outputs, "pooler_output") and outputs.pooler_output is not None:
            features = outputs.pooler_output
        else:
            features = outputs.last_hidden_state[:, 0, :]

    # L2 normalize for cosine similarity
    features = features / features.norm(dim=-1, keepdim=True)
    embeddings_np = features.cpu().numpy().astype(np.float32)

    all_embeddings.append(embeddings_np)
    
    for item in valid_items:
        image_ids.append(item["image_id"])
        # 1:1 aligned metadata list for O(1) indexed lookup in FAISS
        metadata_store.append({
            "image_id": item["image_id"],
            "caption": item["caption"],
            "folder": item["folder"],
            "full_path": item["full_path"]
        })

    processed_count = min(i + BATCH_SIZE, total_images)
    if processed_count % 1000 < BATCH_SIZE or processed_count == total_images:
        elapsed = time.time() - t_start
        speed = processed_count / (elapsed or 1)
        remaining_secs = (total_images - processed_count) / (speed or 1)
        print(f"Progress: {processed_count}/{total_images} images ({processed_count/total_images*100:.1f}%) | Speed: {speed:.1f} img/s | Est. Remaining: {remaining_secs/60:.1f} min", flush=True)

total_time = time.time() - t_start
final_embeddings = np.concatenate(all_embeddings, axis=0) if all_embeddings else np.empty((0, 384), dtype=np.float32)

print(f"\nVectorization complete in {total_time/60:.2f} minutes ({len(final_embeddings)/total_time:.1f} img/s).")
print(f"Final Embeddings Shape: {final_embeddings.shape}")

# ---------------------------------------------------------------------------
# Step 5: Save Embeddings, Build FAISS Index, and Save Metadata
# ---------------------------------------------------------------------------
embeddings_path = OUTPUT_DIR / "embeddings.npy"
image_ids_path = OUTPUT_DIR / "image_ids.json"
metadata_path = OUTPUT_DIR / "instagram_metadata.json"
faiss_index_path = OUTPUT_DIR / "instagram_faiss.index"

print(f"\n1. Saving NumPy embeddings ({final_embeddings.shape}) to: {embeddings_path}")
np.save(embeddings_path, final_embeddings)

print(f"2. Saving Image IDs to: {image_ids_path}")
with open(image_ids_path, "w", encoding="utf-8") as f:
    json.dump(image_ids, f, indent=2)

print(f"3. Saving 1:1 aligned Metadata JSON to: {metadata_path}")
with open(metadata_path, "w", encoding="utf-8") as f:
    json.dump(metadata_store, f, indent=2)

print(f"4. Building and saving FAISS IndexFlatIP (384 dimensions) with {len(final_embeddings)} vectors...")
dimension = final_embeddings.shape[1]
index = faiss.IndexFlatIP(dimension)
index.add(final_embeddings)
faiss.write_index(index, str(faiss_index_path))

print(f"   Saved FAISS index ({os.path.getsize(faiss_index_path)/(1024*1024):.2f} MB) to: {faiss_index_path}")
print("\nDONE! Full dataset vectorized, indexed in FAISS, and metadata mapped successfully.")