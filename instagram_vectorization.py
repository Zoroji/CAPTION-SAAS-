import os
import json
import torch
import numpy as np
import pandas as pd
from PIL import Image
import faiss
from transformers import CLIPProcessor, CLIPModel

DATASET_BASE = r"F:\bin\Redcaps\datasets\prithvijaunjale\instagram-images-with-captions\versions\2"
OUTPUT_DIR = r"C:\Redcaps\vectors"
BATCH_SIZE = 64  
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

os.makedirs(OUTPUT_DIR, exist_ok=True)

print(f"Loading CLIP model on DEVICE: {DEVICE}")
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(DEVICE)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model.eval()  # Set model to evaluation mode 

queue = []

folders_to_process = [
    ("instagram_data", "captions_csv.csv"),
    ("instagram_data2", "captions_csv2.csv")
]

for folder_name, csv_filename in folders_to_process:
    folder_path = os.path.join(DATASET_BASE, folder_name)
    csv_path = os.path.join(folder_path, csv_filename)

    print(f"Reading {csv_filename}...")
    # Read without assuming header names so both header and headerless CSVs work
    df = pd.read_csv(csv_path, header=None)

    for _, row in df.iterrows():
        raw_path = str(row[1]).strip()
        
        # Skip header line if present
        if raw_path.lower() in ["image file", "image_file", "image_path"]:
            continue
            
        caption = str(row[2]).strip() if len(row) > 2 and pd.notna(row[2]) else ""

        if not raw_path.endswith('.jpg'):
            full_img_path = os.path.join(folder_path, raw_path + '.jpg')
        else:
            full_img_path = os.path.join(folder_path, raw_path)

        if os.path.exists(full_img_path):
            image_id = f"{folder_name}/{os.path.basename(full_img_path)}"
            queue.append({
                "image_id": image_id,
                "full_path": full_img_path,
                "caption": caption,
                "folder": folder_name
            })

print(f"Total valid images queued: {len(queue)}")

dimension = 512  # CLIP output embedding size (512 numbers)
index = faiss.IndexFlatIP(dimension)  # IndexFlatIP = Dot Product / Cosine Similarity index
metadata_store = []

print(f"\n🚀 Starting vectorization of {len(queue)} valid images...")

for i in range(0, len(queue), BATCH_SIZE):
    batch_items = queue[i:i+BATCH_SIZE]

    images = []
    valid_items = []

    for item in batch_items:
        try:
            img = Image.open(item['full_path']).convert("RGB")
            images.append(img)
            valid_items.append(item)
        except Exception as e:
            continue

    if not images:
        continue

    # Preprocessing images
    inputs = processor(images=images, return_tensors="pt", padding=True).to(DEVICE)

    # Generate embeddings
    with torch.no_grad():
        features = model.get_image_features(**inputs)

    # Scale embeddings to unit length (L2 norm)
    features = features / features.norm(dim=-1, keepdim=True)

    # Convert embeddings to float32 numpy array
    embeddings_np = features.cpu().numpy().astype(np.float32)

    # Add to FAISS and metadata
    index.add(embeddings_np)
    metadata_store.extend(valid_items)

    # Print progress every 1,000 images
    processed_count = min(i + BATCH_SIZE, len(queue))
    if processed_count % 1000 < BATCH_SIZE or processed_count == len(queue):
        print(f"📊 Progress: {processed_count} / {len(queue)} images processed...")

faiss_path = os.path.join(OUTPUT_DIR, "instagram_faiss.index")
metadata_path = os.path.join(OUTPUT_DIR, "instagram_metadata.json")

print(f"\n💾 Saving FAISS index to: {faiss_path}")
faiss.write_index(index, faiss_path)
print(f"💾 Saving Metadata JSON to: {metadata_path}")
with open(metadata_path, "w", encoding="utf-8") as f:
    json.dump(metadata_store, f, indent=2)

print("\n🎉 DONE! All vectors and metadata are stored successfully.")
