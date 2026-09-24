import os
import sys
import json
import torch
import numpy as np
import faiss
from PIL import Image
from transformers import CLIPProcessor, CLIPModel

# 1. Load FAISS index and metadata
index = faiss.read_index(r"C:\Redcaps\vectors\instagram_faiss.index")
with open(r"C:\Redcaps\vectors\instagram_metadata.json", "r", encoding="utf-8") as f:
    metadata_store = json.load(f)

print(f"✅ Loaded FAISS index with {index.ntotal} vectors!")

# 2. Load CLIP model and processor
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
model = CLIPModel.from_pretrained("openai/clip-vit-base-patch32").to(DEVICE)
processor = CLIPProcessor.from_pretrained("openai/clip-vit-base-patch32")
model.eval()

def search_similar_captions(image_path, top_k=15, min_score=0.60):
    if not os.path.exists(image_path):
        print(f"❌ Error: Test image '{image_path}' not found!")
        return

    img = Image.open(image_path).convert("RGB")
    inputs = processor(images=img, return_tensors="pt").to(DEVICE)
    with torch.no_grad():
        features = model.get_image_features(**inputs)
    features = features / features.norm(dim=-1, keepdim=True)
    query_vector = features.cpu().numpy().astype(np.float32)

    candidate_k = max(100, top_k * 10)
    distances, indices = index.search(query_vector, candidate_k)

    valid_matches = []
    for score, idx in zip(distances[0], indices[0]):
        item = metadata_store[idx]
        caption = item['caption'].strip()
        if caption and float(score) >= min_score:
            valid_matches.append((score, caption, item['image_id']))
            if len(valid_matches) == top_k:
                break

    print(f"\n📸 Query Image: {os.path.basename(image_path)}")
    print(f"🎯 Settings: top_k = {top_k} | min_score threshold = {min_score}")
    print("=" * 70)
    print(f"FOUND {len(valid_matches)} MATCHES ABOVE THRESHOLD {min_score}:")
    for rank, (score, caption, img_id) in enumerate(valid_matches, 1):
        print(f"  Match #{rank} [Score: {score:.4f}] -> \"{caption}\" ({img_id})")

    print("\n" + "=" * 70)
    print("📋 READY-TO-COPY CHATGPT PROMPT:")
    print("=" * 70)

    prompt_str = f"""You are an expert Instagram caption strategist and Gen Z social media copywriter.

CONSTRAINTS:
- NO EMOJIS in any caption.
- Do NOT copy-paste words verbatim from matches. Write FRESH one-liners.
- BANNED words: "embracing", "journey", "radiating", "capturing moments", "elevating", "savoring", "vibes check".

I have attached test image ({os.path.basename(image_path)}). Below are the top visual matches retrieved from 36,000+ real human Instagram posts (score >= {min_score}):

RETRIEVED HUMAN MATCHES FOR MOOD INSPIRATION:
"""
    for rank, (score, caption, img_id) in enumerate(valid_matches, 1):
        prompt_str += f"- Match {rank} [Score: {score:.4f}]: \"{caption}\"\n"

    prompt_str += """
YOU MUST OUTPUT IN THIS EXACT FORMAT:

--- THINKING ---
STEP 1 (Image analysis): Describe what is physically in the image in 1-2 sentences. Nothing else.
STEP 2 (Cultural origin): Identify the cultural or regional setting of this photo in 1 sentence. Nothing else.
STEP 3 (Background story): Imagine what the user was feeling, where they were going, and what they were doing right before this photo. 2-3 sentences max. Nothing else.
STEP 4 (Mood extraction): From the retrieved matches above, list 3-4 moods or energies that fit this photo. Nothing else.
STEP 5 (Urban Dictionary pass): Pick 3-5 slang terms from Urban Dictionary that match this photo's mood. List them and say which caption number you will put each one in. Nothing else.
STEP 6 (Gen Z Slang 2026 pass): Now search your knowledge for the LATEST Gen Z slang trending in 2026 that is NOT already in Step 5. Pick 2-3 fresh current terms and say which caption number you will put each one in. Nothing else.
STEP 7 (Draft 10 captions): Write 10 creative captions using Steps 3-6 as input. Each caption must be casual, short, and human. Nothing else.
STEP 8 (Final slang check): Review all 10 captions. Confirm at least 4 contain slang from Step 5 or Step 6. If not, fix them now.

--- FINAL 10 CAPTIONS ---
1. ...
2. ...
3. ...
4. ...
5. ...
6. ...
7. ...
8. ...
9. ...
10. ...

RULES: No emojis. At least 4 captions must naturally contain slang from Step 5 or Step 6.
"""
    print(prompt_str)
    print("=" * 70)

if __name__ == "__main__":
    test_img = sys.argv[1] if len(sys.argv) > 1 else r"C:\Redcaps\Gym selfie.jpg"
    min_score = float(sys.argv[2]) if len(sys.argv) > 2 else 0.60
    top_k = int(sys.argv[3]) if len(sys.argv) > 3 else 15

    search_similar_captions(test_img, top_k=top_k, min_score=min_score)
