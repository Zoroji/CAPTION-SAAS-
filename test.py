import argparse
import concurrent.futures
import json
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

import numpy as np
import requests
import torch
from PIL import Image
from tqdm import tqdm
from transformers import CLIPModel, CLIPProcessor


# ============================================================
# CONFIGURATION
# ============================================================

ROOT_DIR = Path(__file__).resolve().parent

ANNOTATIONS_DIR = ROOT_DIR / "annotations"
IMAGE_DIR = ROOT_DIR / "RedditImages"
VECTOR_DIR = ROOT_DIR / "vectors"

EMBEDDINGS_FILE = VECTOR_DIR / "embeddings.npy"
IMAGE_IDS_FILE = VECTOR_DIR / "image_ids.json"
METADATA_FILE = VECTOR_DIR / "metadata.json"

DEFAULT_NUM_IMAGES = 5000
DEFAULT_TOP_K = 5
DEFAULT_WORKERS = 5  # Max 5 workers for downloading

# CLIP model. Runs locally once downloaded.
MODEL_NAME = "openai/clip-vit-base-patch32"

# Network settings
DOWNLOAD_TIMEOUT = 20
USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
    "AppleWebKit/537.36 Chrome/120 Safari/537.36"
)

# High-Value Social Media Subreddits for Everyday Captions
TARGET_SUBREDDITS: Set[str] = {
    # Selfies, People, Aesthetics & Lifestyle
    "pics", "itookapicture", "photographs", "amateurphotography",
    "streetphotography", "exposureporn", "vintage", "mildlyinteresting",
    "damnthatsinteresting", "somethingimade", "diy",
    # Pets & Animals
    "cats", "catpictures", "doggos", "dogpictures", "rarepuppers",
    "supermodelcats", "lookatmydog", "blackcats", "goldenretrievers", "husky", "corgi",
    # Travel, Outdoors & Aesthetic Scenery
    "earthporn", "cityporn", "cozyplaces", "outdoors", "hiking", "skyporn",
    "autumnporn", "mostbeautiful",
    # Food & Drinks
    "food", "foodporn", "pizza", "burgers", "baking", "cocktails", "espresso",
    "beerporn", "steak", "dessertporn",
    # Rooms, Home & Outfits
    "interiordesign", "malelivingspace", "femalelivingspace", "houseplants",
    "sneakers", "desksetup", "battlestations",
    # Gym, Active & Outdoors
    "bicycling", "trailrunning", "campingandhiking"
}

SKIP_SUBREDDITS = set()


# ============================================================
# DIRECTORIES
# ============================================================

IMAGE_DIR.mkdir(parents=True, exist_ok=True)
VECTOR_DIR.mkdir(parents=True, exist_ok=True)


# ============================================================
# HELPERS
# ============================================================

def get_json_files() -> List[Path]:
    """Return annotation files in deterministic order."""
    return sorted(ANNOTATIONS_DIR.rglob("*.json"))


def load_json(path: Path) -> Optional[Dict]:
    """Load one JSON file safely."""
    try:
        with path.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        print(f"[WARN] Could not read {path}: {exc}", flush=True)
        return None


def load_metadata() -> Dict[str, Dict]:
    """Load metadata dictionary from vectors/metadata.json."""
    if not METADATA_FILE.exists():
        return {}
    try:
        with METADATA_FILE.open("r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as exc:
        print(f"[WARN] Failed to load metadata file: {exc}", flush=True)
        return {}


def save_metadata(metadata: Dict[str, Dict]) -> None:
    """Save metadata dictionary to vectors/metadata.json."""
    with METADATA_FILE.open("w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)


def image_extension_from_url(url: str) -> str:
    """Preserve useful image file extension."""
    clean_url = url.split("?", 1)[0].lower()
    for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        if clean_url.endswith(ext):
            return ext
    return ".jpg"


def process_single_download(record: Dict, json_file_rel: str) -> Optional[Tuple[str, Path, Dict]]:
    """
    Worker task: Download an image and return (image_id, image_path, metadata_entry).
    """
    image_id = record.get("image_id")
    image_url = record.get("url")
    subreddit = record.get("subreddit")

    if not image_id or not image_url:
        return None

    if subreddit and subreddit.lower() in {s.lower() for s in SKIP_SUBREDDITS}:
        return None

    destination_without_ext = IMAGE_DIR / image_id

    # Fast local file existence check
    for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        candidate = destination_without_ext.with_suffix(ext)
        if candidate.exists() and candidate.stat().st_size > 0:
            meta_entry = {
                "image_id": image_id,
                "subreddit": record.get("subreddit"),
                "url": record.get("url"),
                "caption": record.get("caption"),
                "raw_caption": record.get("raw_caption"),
                "score": record.get("score"),
                "author": record.get("author"),
                "created_utc": record.get("created_utc"),
                "permalink": record.get("permalink"),
                "source_annotation_file": json_file_rel,
                "local_image": str(candidate.relative_to(ROOT_DIR)),
            }
            return image_id, candidate, meta_entry

    # Download image via HTTP
    extension = image_extension_from_url(image_url)
    destination = destination_without_ext.with_suffix(extension)
    headers = {"User-Agent": USER_AGENT}

    try:
        response = requests.get(
            image_url,
            headers=headers,
            timeout=DOWNLOAD_TIMEOUT,
            stream=True,
        )
        response.raise_for_status()

        content_type = response.headers.get("content-type", "").lower()
        if not content_type.startswith("image/"):
            return None

        with destination.open("wb") as f:
            for chunk in response.iter_content(chunk_size=1024 * 64):
                if chunk:
                    f.write(chunk)

        if destination.stat().st_size == 0:
            destination.unlink(missing_ok=True)
            return None

        meta_entry = {
            "image_id": image_id,
            "subreddit": record.get("subreddit"),
            "url": record.get("url"),
            "caption": record.get("caption"),
            "raw_caption": record.get("raw_caption"),
            "score": record.get("score"),
            "author": record.get("author"),
            "created_utc": record.get("created_utc"),
            "permalink": record.get("permalink"),
            "source_annotation_file": json_file_rel,
            "local_image": str(destination.relative_to(ROOT_DIR)),
        }
        return image_id, destination, meta_entry

    except Exception:
        if destination.exists() and destination.stat().st_size == 0:
            destination.unlink(missing_ok=True)
        return None


# ============================================================
# STEP 1: DOWNLOAD IMAGES (CURATED SUBREDDITS, MAX 5 WORKERS)
# ============================================================

def download_images(
    limit: Optional[int] = DEFAULT_NUM_IMAGES,
    max_workers: int = DEFAULT_WORKERS,
    curated_only: bool = True,
) -> None:
    """
    Download RedCaps images from curated social media subreddits with max 5 workers.
    """
    max_workers = min(max_workers, 5)

    print("=" * 70, flush=True)
    limit_target = limit if (limit is not None and limit > 0) else 5000
    filter_str = "CURATED SOCIAL SUBREDDITS ONLY" if curated_only else "ALL SUBREDDITS"
    print(f"STEP 1: DOWNLOADING {limit_target} IMAGES ({filter_str}) [MAX {max_workers} WORKERS]", flush=True)
    print("=" * 70, flush=True)

    json_files = get_json_files()
    if not json_files:
        print(f"[ERROR] No JSON files found in: {ANNOTATIONS_DIR}", flush=True)
        return

    # Subreddit filename parsing using rsplit("_", 1)[0] to correctly extract subreddit name before year
    if curated_only:
        selected_files = [
            f for f in json_files
            if f.stem.rsplit("_", 1)[0].lower() in TARGET_SUBREDDITS
        ]
        print(f"Matched {len(selected_files)} curated annotation files (out of {len(json_files)} total).", flush=True)
    else:
        selected_files = json_files
        print(f"Processing all {len(selected_files)} annotation files.", flush=True)

    metadata = load_metadata()
    successful = len(metadata)
    attempted = 0

    print(f"Starting download pipeline. Existing metadata count: {successful} / {limit_target}", flush=True)

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        for json_file in selected_files:
            if successful >= limit_target:
                break

            data = load_json(json_file)
            if not data:
                continue

            annotations = data.get("annotations", [])
            if not isinstance(annotations, list):
                continue

            json_rel = str(json_file.relative_to(ROOT_DIR))

            # Submit tasks for this annotation file
            futures = [
                executor.submit(process_single_download, rec, json_rel)
                for rec in annotations
                if rec.get("image_id") and rec.get("url")
            ]

            for future in concurrent.futures.as_completed(futures):
                if successful >= limit_target:
                    break
                attempted += 1
                try:
                    result = future.result()
                    if result is not None:
                        image_id, path, meta_entry = result
                        if image_id not in metadata:
                            metadata[image_id] = meta_entry
                            successful += 1

                            if successful % 25 == 0 or successful >= limit_target:
                                print(f"[{successful}/{limit_target}] Saved: {image_id} (r/{meta_entry['subreddit']})", flush=True)
                                save_metadata(metadata)
                except Exception:
                    pass

    save_metadata(metadata)

    print()
    print("-" * 70, flush=True)
    print(f"Successfully processed/downloaded: {successful} / {limit_target}", flush=True)
    print(f"Total metadata records saved:     {len(metadata)}", flush=True)
    print(f"Images directory:                  {IMAGE_DIR}", flush=True)
    print(f"Metadata file:                     {METADATA_FILE}", flush=True)
    print("-" * 70, flush=True)


# ============================================================
# CLIP MODEL SINGLETON
# ============================================================

_model = None
_processor = None
_device = None


def load_clip():
    """Load CLIP model once and reuse across operations."""
    global _model, _processor, _device
    if _model is not None:
        return _model, _processor, _device

    print("\n" + "=" * 70, flush=True)
    print("LOADING CLIP MODEL", flush=True)
    print("=" * 70, flush=True)
    print(f"Model: {MODEL_NAME}", flush=True)

    _device = "cuda" if torch.cuda.is_available() else "cpu"
    print(f"Device: {_device}", flush=True)

    _processor = CLIPProcessor.from_pretrained(MODEL_NAME)
    _model = CLIPModel.from_pretrained(MODEL_NAME)
    _model.to(_device)
    _model.eval()

    print("CLIP model loaded successfully.", flush=True)
    return _model, _processor, _device


# ============================================================
# STEP 2: VECTORIZE IMAGES ONE AT A TIME
# ============================================================

def vectorize_single_image(image_path: Path) -> np.ndarray:
    """Convert one image into normalized CLIP embedding."""
    model, processor, device = load_clip()

    img = Image.open(image_path).convert("RGB")
    inputs = processor(images=img, return_tensors="pt")
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        features = model.get_image_features(**inputs)

    vector = features.cpu().numpy()[0].astype(np.float32)
    norm = np.linalg.norm(vector)
    if norm > 0:
        vector = vector / norm
    return vector


def vectorize_all_images() -> None:
    """
    Vectorize all downloaded images ONE AT A TIME sequentially.
    """
    print("\n" + "=" * 70, flush=True)
    print("STEP 2: VECTORIZE DOWNLOADED IMAGES (ONE AT A TIME)", flush=True)
    print("=" * 70, flush=True)

    image_files = []
    for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        image_files.extend(IMAGE_DIR.glob(f"*{ext}"))
        image_files.extend(IMAGE_DIR.glob(f"*{ext.upper()}"))

    image_files = sorted(set(image_files))
    if not image_files:
        print("[ERROR] No downloaded images found.", flush=True)
        return

    print(f"Found {len(image_files)} image files on disk.", flush=True)

    existing_vectors = []
    existing_ids = []
    vectorized_set = set()

    if EMBEDDINGS_FILE.exists() and IMAGE_IDS_FILE.exists():
        try:
            existing_matrix = np.load(EMBEDDINGS_FILE)
            with IMAGE_IDS_FILE.open("r", encoding="utf-8") as f:
                existing_ids = json.load(f)
            if len(existing_matrix) == len(existing_ids):
                existing_vectors = list(existing_matrix)
                vectorized_set = set(existing_ids)
                print(f"Resuming checkpoint ({len(existing_ids)} images already vectorized).", flush=True)
        except Exception as exc:
            print(f"[WARN] Starting fresh: {exc}", flush=True)

    to_process = [p for p in image_files if p.stem not in vectorized_set]
    print(f"Images remaining to vectorize: {len(to_process)}", flush=True)

    if not to_process:
        print("All images are already vectorized!", flush=True)
        return

    vectors_list = list(existing_vectors)
    image_ids_list = list(existing_ids)

    for image_path in tqdm(to_process, desc="Vectorizing One-by-One"):
        try:
            vector = vectorize_single_image(image_path)
            image_ids_list.append(image_path.stem)
            vectors_list.append(vector)

            if len(vectors_list) % 25 == 0:
                matrix = np.vstack(vectors_list).astype(np.float32)
                np.save(EMBEDDINGS_FILE, matrix)
                with IMAGE_IDS_FILE.open("w", encoding="utf-8") as f:
                    json.dump(image_ids_list, f, indent=2)
        except Exception as exc:
            print(f"\n[WARN] Could not vectorize {image_path.name}: {exc}", flush=True)

    final_matrix = np.vstack(vectors_list).astype(np.float32)
    np.save(EMBEDDINGS_FILE, final_matrix)
    with IMAGE_IDS_FILE.open("w", encoding="utf-8") as f:
        json.dump(image_ids_list, f, indent=2)

    print("\n" + "-" * 70, flush=True)
    print(f"Total Embeddings Shape: {final_matrix.shape}", flush=True)
    print(f"Embeddings saved to:   {EMBEDDINGS_FILE}", flush=True)
    print(f"Image IDs saved to:     {IMAGE_IDS_FILE}", flush=True)
    print("-" * 70, flush=True)


# ============================================================
# STEP 3: MAPPING VERIFICATION COMMAND
# ============================================================

def verify_mapping() -> None:
    """
    Verify integrity between embeddings, image IDs, metadata, and local images.
    """
    print("\n" + "=" * 70, flush=True)
    print("STEP 3: MAPPING INTEGRITY VERIFICATION", flush=True)
    print("=" * 70, flush=True)

    errors = []
    if not EMBEDDINGS_FILE.exists():
        errors.append(f"Missing embeddings file: {EMBEDDINGS_FILE}")
    if not IMAGE_IDS_FILE.exists():
        errors.append(f"Missing image IDs file: {IMAGE_IDS_FILE}")
    if not METADATA_FILE.exists():
        errors.append(f"Missing metadata file: {METADATA_FILE}")

    if errors:
        for err in errors:
            print(f"[ERROR] {err}", flush=True)
        return

    embeddings = np.load(EMBEDDINGS_FILE)
    with IMAGE_IDS_FILE.open("r", encoding="utf-8") as f:
        image_ids = json.load(f)
    metadata = load_metadata()

    print(f"Embeddings matrix count: {len(embeddings)}", flush=True)
    print(f"Image IDs count:         {len(image_ids)}", flush=True)
    print(f"Metadata records count:  {len(metadata)}", flush=True)

    if len(embeddings) != len(image_ids):
        errors.append(
            f"Dimension mismatch: {len(embeddings)} vectors vs {len(image_ids)} image IDs!"
        )

    missing_metadata_count = 0
    missing_image_file_count = 0

    for idx, img_id in enumerate(image_ids):
        if img_id not in metadata:
            missing_metadata_count += 1

        has_file = False
        for ext in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
            if (IMAGE_DIR / f"{img_id}{ext}").exists():
                has_file = True
                break
        if not has_file:
            missing_image_file_count += 1

    print("-" * 70, flush=True)
    print(f"Missing metadata records: {missing_metadata_count}", flush=True)
    print(f"Missing local image files: {missing_image_file_count}", flush=True)
    print("-" * 70, flush=True)

    if errors:
        print("\n[VERIFICATION FAILED]", flush=True)
        for err in errors:
            print(f" - {err}", flush=True)
    else:
        print("\n[VERIFICATION SUCCESSFUL] Mapping between vectors, IDs, and metadata is intact!", flush=True)


# ============================================================
# STEP 4: SIMILARITY SEARCH & LLM PAYLOAD GENERATION
# ============================================================

def cosine_similarity(query_vector: np.ndarray, matrix: np.ndarray) -> np.ndarray:
    """Cosine similarity via vector dot-product for normalized vectors."""
    return matrix @ query_vector


def test_image(
    test_image_path: str,
    top_k: int = DEFAULT_TOP_K,
    json_output: bool = False,
    min_score: float = 0.0,
    require_caption: bool = True,
) -> List[Dict]:
    """
    Search similar Reddit images for a given query image and extract metadata.
    """
    path = Path(test_image_path)
    if not path.exists():
        print(f"[ERROR] Test image does not exist: {path}", flush=True)
        return []

    if not EMBEDDINGS_FILE.exists() or not IMAGE_IDS_FILE.exists():
        print("[ERROR] Embeddings or image IDs missing. Run vectorization first.", flush=True)
        return []

    matrix = np.load(EMBEDDINGS_FILE)
    with IMAGE_IDS_FILE.open("r", encoding="utf-8") as f:
        image_ids = json.load(f)

    metadata = load_metadata()

    # Vectorize test image
    vector = vectorize_single_image(path)

    similarities = cosine_similarity(vector, matrix)
    sorted_indices = np.argsort(similarities)[::-1]

    results = []
    rank = 1

    for index in sorted_indices:
        if len(results) >= top_k:
            break

        img_id = image_ids[int(index)]
        score = float(similarities[int(index)])

        if min_score > 0 and score < min_score:
            continue

        meta = metadata.get(img_id, {})
        caption = meta.get("caption", "") or meta.get("raw_caption", "")

        # Skip entries with empty captions if require_caption is True
        if require_caption and not caption.strip():
            continue

        results.append({
            "rank": rank,
            "image_id": img_id,
            "similarity_score": round(score, 6),
            "subreddit": meta.get("subreddit", "unknown"),
            "caption": caption,
            "raw_caption": meta.get("raw_caption", ""),
            "url": meta.get("url", ""),
            "score": meta.get("score", 0),
        })
        rank += 1

    if json_output:
        llm_payload = [
            {
                "similarity_score": r["similarity_score"],
                "subreddit": r["subreddit"],
                "caption": r["caption"],
                "score": r["score"],
            }
            for r in results
        ]
        print(json.dumps(llm_payload, indent=2, ensure_ascii=False), flush=True)
        return results

    print("\n" + "=" * 70, flush=True)
    clean_name = path.name.encode('ascii', 'ignore').decode() or "Image"
    print(f"TOP {len(results)} SEMANTIC MATCHES FOR: {clean_name}", flush=True)
    print("=" * 70, flush=True)

    for r in results:
        print(f"\n{r['rank']}. [Similarity: {r['similarity_score']}] | r/{r['subreddit']}", flush=True)
        print(f"   Image ID: {r['image_id']}", flush=True)
        print(f"   Caption:  \"{r['caption']}\"", flush=True)

    print("\n" + "-" * 70, flush=True)
    return results


def show_stats() -> None:
    """Print database statistics and list all available subreddits."""
    from collections import Counter
    metadata = load_metadata()
    if not metadata:
        print("[ERROR] No metadata found in vectors/metadata.json", flush=True)
        return

    sub_counts = Counter(v.get("subreddit", "unknown") for v in metadata.values())
    print("\n" + "=" * 70, flush=True)
    print(f"DATABASE STATISTICS (Total Images: {len(metadata)})", flush=True)
    print("=" * 70, flush=True)
    print(f"{'SUBREDDIT':<30} | {'IMAGE COUNT':<15} | {'PERCENTAGE'}")
    print("-" * 70, flush=True)

    for sub, count in sub_counts.most_common():
        pct = (count / len(metadata)) * 100
        print(f"r/{sub:<28} | {count:<15} | {pct:.1f}%", flush=True)

    print("=" * 70 + "\n", flush=True)


def search_subreddit(subreddit_name: str) -> None:
    """Search if a subreddit exists in local vector metadata or raw annotations."""
    query = subreddit_name.lower().strip()
    if query.startswith("r/"):
        query = query[2:]

    # 1. Search in active vector database (vectors/metadata.json)
    metadata = load_metadata()
    vector_matches = [
        v for v in metadata.values() if v.get("subreddit", "").lower() == query
    ]

    # 2. Search in raw RedCaps annotations (annotations/*.json)
    json_files = get_json_files()
    ann_matches = [
        f.name for f in json_files if f.stem.rsplit("_", 1)[0].lower() == query
    ]

    print("\n" + "=" * 70, flush=True)
    print(f"SEARCH RESULTS FOR SUBREDDIT: r/{query}", flush=True)
    print("=" * 70, flush=True)
    print(f"1. Active Vector DB (vectors/metadata.json):     {'FOUND (' + str(len(vector_matches)) + ' images)' if vector_matches else 'NOT FOUND'}")
    print(f"2. Raw RedCaps Annotations (annotations/*.json): {'FOUND (' + str(len(ann_matches)) + ' year archives: ' + ', '.join(ann_matches) + ')' if ann_matches else 'NOT FOUND'}")
    print("=" * 70 + "\n", flush=True)


# ============================================================
# MAIN CLI DISPATCHER
# ============================================================

def main():
    parser = argparse.ArgumentParser(
        description="RedCaps Curated Social Downloader & Vectorizer"
    )
    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Download command
    download_parser = subparsers.add_parser("download", help="Download RedCaps images from curated social subreddits")
    download_parser.add_argument(
        "--limit",
        type=int,
        default=DEFAULT_NUM_IMAGES,
        help="Number of images to download (default: 5000).",
    )
    download_parser.add_argument(
        "--all-subreddits",
        action="store_true",
        help="Disable subreddit filter and download from all 350 subreddits.",
    )
    download_parser.add_argument(
        "--workers",
        type=int,
        default=5,
        help="Number of parallel download threads (max 5)",
    )

    # Vectorize command
    subparsers.add_parser("vectorize", help="Vectorize downloaded images one-by-one")

    # Verify command
    subparsers.add_parser("verify", help="Verify mapping integrity")

    # Stats command
    subparsers.add_parser("stats", help="List all subreddits available in database")

    # Search Subreddit command
    search_parser = subparsers.add_parser("search-sub", help="Search if a subreddit exists in metadata or annotations")
    search_parser.add_argument("name", type=str, help="Subreddit name (e.g. pics, cats, sneakers, abandoned)")

    # Test command
    test_parser = subparsers.add_parser("test", help="Test semantic similarity")
    test_parser.add_argument("image_path", type=str, help="Path to input test image")
    test_parser.add_argument("--top-k", type=int, default=DEFAULT_TOP_K, help="Number of top matches")
    test_parser.add_argument(
        "--min-score",
        type=float,
        default=0.0,
        help="Minimum similarity score threshold (e.g. 0.55)",
    )
    test_parser.add_argument(
        "--allow-empty-captions",
        action="store_true",
        help="Include matches that have empty text captions",
    )
    test_parser.add_argument(
        "--json",
        dest="json_output",
        action="store_true",
        help="Output structured JSON context for LLM",
    )

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    if args.command == "download":
        download_images(
            limit=args.limit,
            max_workers=args.workers,
            curated_only=not args.all_subreddits,
        )

    elif args.command == "vectorize":
        vectorize_all_images()

    elif args.command == "verify":
        verify_mapping()

    elif args.command == "stats":
        show_stats()

    elif args.command == "search-sub":
        search_subreddit(args.name)

    elif args.command == "test":
        test_image(
            args.image_path,
            top_k=args.top_k,
            json_output=args.json_output,
            min_score=args.min_score,
            require_caption=not args.allow_empty_captions,
        )


if __name__ == "__main__":
    main()