import os
import json
import torch
import numpy as np
import pandas as pd
from pathlib import Path
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

ROOT_DIR = Path(__file__).resolve().parent
DATASET_BASE = ROOT_DIR / "datasets" / "prithvijaunjale" / "instagram-images-with-captions" / "versions" / "2"
OUTPUT_DIR = ROOT_DIR / "vectors"
BATCH_SIZE = 64
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

print(f"Loading CLIP model on DEVICE: {DEVICE}")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(DEVICE)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model.eval()

queue = []

folders_to_process = [
    ("instagram_data", "captions_csv.csv"),
    ("instagram_data2", "captions_csv2.csv")
]

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

        if not raw_path.endswith('.jpg'):
            full_img_path = folder_path / (raw_path + '.jpg')
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

print(f"Total valid Instagram images queued: {len(queue)}")

all_embeddings = []
image_ids = []
metadata_store = {}

print(f"\nStarting vectorization of {len(queue)} valid images...")

for i in range(0, len(queue), BATCH_SIZE):
    batch_items = queue[i:i+BATCH_SIZE]

    images = []
    valid_items = []

    for item in batch_items:
        try:
            img = Image.open(item['full_path']).convert("RGB")
            images.append(img)
            valid_items.append(item)
        except Exception:
            continue

    if not images:
        continue

    inputs = processor(images=images, return_tensors="pt", padding=True).to(DEVICE)

    with torch.no_grad():
        features = model.get_image_features(**inputs)

    features = features / features.norm(dim=-1, keepdim=True)
    embeddings_np = features.cpu().numpy().astype(np.float32)

    all_embeddings.append(embeddings_np)
    
    for idx, item in enumerate(valid_items):
        img_id = item["image_id"]
        image_ids.append(img_id)
        metadata_store[img_id] = {
            "image_id": img_id,
            "caption": item["caption"],
            "folder": item["folder"]
        }

    processed_count = min(i + BATCH_SIZE, len(queue))
    if processed_count % 1000 < BATCH_SIZE or processed_count == len(queue):
        print(f"Progress: {processed_count} / {len(queue)} images processed...")

final_embeddings = np.concatenate(all_embeddings, axis=0) if all_embeddings else np.empty((0, 512), dtype=np.float32)

embeddings_path = OUTPUT_DIR / "embeddings.npy"
image_ids_path = OUTPUT_DIR / "image_ids.json"
metadata_path = OUTPUT_DIR / "metadata.json"

print(f"\nSaving embeddings ({final_embeddings.shape}) to: {embeddings_path}")
np.save(embeddings_path, final_embeddings)

print(f"Saving Image IDs to: {image_ids_path}")
with open(image_ids_path, "w", encoding="utf-8") as f:
    json.dump(image_ids, f, indent=2)

print(f"Saving Metadata JSON to: {metadata_path}")
with open(metadata_path, "w", encoding="utf-8") as f:
    json.dump(metadata_store, f, indent=2)

print("\nDONE! Instagram dataset vectorized successfully.")