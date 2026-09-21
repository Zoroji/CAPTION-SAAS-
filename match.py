import os
import json
import torch
import numpy as np
import faiss
from PIL import Image
from transformers import CLIPProcessor, CLIPModel


index = faiss.read_index(r"C:\Redcaps\vectors\instagram_faiss.index")
with open(r"C:\Redcaps\vectors\instagram_metadata.json","r",encoding="utf-8") as f:
    meta_store = json.load(f)

print(f"Loaded FAISS index with {index.ntotal} vectors!")

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(DEVICE)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model.eval()

def search_similar_captions(image_path, top_k=3):

    img = Image.open(image_path).convert("RGB")
    
    inputs = processor(images=img, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        features = model.get_image_features(**inputs)
        
    features = features / features.norm(dim=-1, keepdim=True)
    query_vector = features.cpu().numpy().astype(np.float32)
    
    distances, indices = index.search(query_vector, top_k)
    
    print(f"\n📸 Query Image: {os.path.basename(image_path)}")
    print("=" * 60)
    for rank, (score, idx) in enumerate(zip(distances[0], indices[0]), 1):
        item = metadata_store[idx]
        print(f"Match #{rank} [Similarity Score: {score:.4f}]")
        print(f"  • Image ID: {item['image_id']}")
        print(f"  • Caption:  {item['caption']}")
        print(f"  • Disk Path: {item['full_path']}")
        print("-" * 60)