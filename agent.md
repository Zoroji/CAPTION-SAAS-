# Reddit Image Caption Generator SaaS — System Architecture & Implementation Plan (`agent.md`)

## 1. Executive Summary & SaaS Vision

This SaaS application allows users to upload any image and receive **high-quality, authentic social media captions** inspired by real, top-performing Reddit posts. 

Unlike generic AI image captioning tools that produce dull descriptions (e.g., *"A dog sitting on the grass"*), this system leverages **vector semantic search over a curated RedCaps dataset** to find visually and contextually similar Reddit images, extracts their real captions and subreddits, and feeds those authentic Reddit captions as context to **Grok (xAI)** to generate 5 captivating, human-like captions tailored to the user's post.

---

## 2. Current Codebase & Data Analysis (`test.py`)

Inspection of `test.py` and the existing `vectors/` directory reveals the foundational engine already in place:

### Core Components in `test.py`:
1. **Dataset Ingestion (`download_first_100`)**:
   - Reads RedCaps JSON annotations from `annotations/*.json`.
   - Downloads original images to `RedditImages/<image_id>.<ext>`.
   - Extracts and structures metadata into `vectors/metadata.json`.

2. **Metadata Schema (`vectors/metadata.json`)**:
   ```json
   {
     "grraj": {
       "image_id": "grraj",
       "subreddit": "abandoned",
       "url": "https://i.imgur.com/DXOdR.jpg",
       "caption": "my personal abandoned school urban exploration. abandoned due to asbestos and it is pretty much untouched",
       "raw_caption": "My personal abandoned school urban exploration. Abandoned due to asbestos and it is pretty much untouched (x-posted)",
       "score": 2,
       "author": "EntenEller",
       "created_utc": 1302998814,
       "permalink": "/r/abandoned/comments/grraj/my_personal_abandoned_school_urban_exploration/",
       "source_annotation_file": "annotations\\abandoned_2017.json",
       "local_image": "RedditImages\\grraj.jpg"
     }
   }
   ```

3. **Vectorization Engine (`vectorize_all_images` & `vectorize_image`)**:
   - Model: `openai/clip-vit-base-patch32` (via Hugging Face `transformers` & `torch`).
   - Generates 512-dimensional image embeddings.
   - Applies **L2 normalization** ($\|\vec{v}\|_2 = 1$).
   - Saves compact NumPy matrix `embeddings.npy` (shape: `[N, 512]`) and aligned `image_ids.json`.

4. **Vector Search Engine (`test_image` & `cosine_similarity`)**:
   - Computes Cosine Similarity via matrix dot-product ($\text{sim} = \text{Matrix} \cdot \vec{q}$).
   - Extracts top $K=5$ closest images by vector distance.

---

## 3. End-to-End SaaS Pipeline Architecture

```
[ User Uploads Image ]
          │
          ▼
┌──────────────────────────┐
│   Next.js Frontend UI    │
└────────────┬─────────────┘
             │ HTTP POST /api/generate-captions (Image File)
             ▼
┌──────────────────────────┐
│  Python FastAPI Backend  │
└────────────┬─────────────┘
             │
             ├──► 1. Preprocess & Vectorize image using CLIP (`openai/clip-vit-base-patch32`)
             │
             ├──► 2. Run Vector Search against `embeddings.npy` (Cosine Similarity / FAISS)
             │       └─► Retrieve top K (e.g. 5-10) nearest `image_id`s
             │
             ├──► 3. Extract metadata captions from `metadata.json` for matched IDs
             │       └─► Format authentic captions + subreddits as contextual prompt
             │
             └──► 4. Call Grok API (xAI Multimodal / Text LLM)
                     ├─► Input: User Image + Top Retrieved Reddit Captions
                     └─► Prompt instruction: "Generate 5 distinct, engaging captions..."
             │
             ▼
┌──────────────────────────┐
│   Return JSON to User    │ ──► Display 5 options with copy button, tone filters & history
└──────────────────────────┘
```

---

## 4. Tech Stack Evaluation & Recommendations

### Proposed Stack Assessment: **Next.js (Frontend) + Python (Backend)**

> [!TIP]
> **Verdict: Highly Recommended (Best Architecture for AI/ML SaaS)**
> Keeping Next.js for UI/SaaS features and Python for the ML/Vector engine is the industry standard.

#### Why Python Backend (FastAPI):
- **Native PyTorch & CLIP Ecosystem**: Running PyTorch, Hugging Face Transformers (`transformers`), and NumPy is seamless and fastest in Python.
- **Vector DB & Numerical Performance**: Native integration with FAISS, Qdrant, ChromaDB, and SciPy.
- **Asynchronous FastAPI**: Ultra-fast REST framework with instant OpenAPI docs and simple multipart/form-data upload handling.

#### Why Next.js Frontend:
- **SaaS Readiness**: Outstanding developer experience for building landing pages, authentication (NextAuth/Clerk), billing (Stripe), dashboard layouts, and interactive UI components.
- **Performance & SEO**: Server-side rendering (SSR), optimized image loading, and React Server Components.

---

### Tech Stack Comparison Table

| Component | Recommendation (Option 1 - Best) | Alternative A (Pure Next.js) | Alternative B (PostgreSQL Stack) |
| :--- | :--- | :--- | :--- |
| **Frontend** | Next.js 14+ (TypeScript + Tailwind CSS + Shadcn UI) | Next.js 14+ | Next.js 14+ |
| **Backend** | Python FastAPI (Async REST API) | Next.js Route Handlers (Node.js) | Python FastAPI |
| **Vector Engine** | CLIP (`openai/clip-vit-base-patch32`) + FAISS / NumPy | HuggingFace Inference API / `@xenova/transformers` (ONNX) | CLIP + `pgvector` |
| **Database** | SQLite / Supabase (Metadata) + FAISS (Vectors) | Supabase (Pgvector) | PostgreSQL + `pgvector` |
| **LLM Provider** | Grok API (`xai-api` / OpenAI SDK compatible client) | Grok API | Grok API |
| **Deployment** | Vercel (Frontend) + Railway / Modal / Docker (Backend) | Vercel (Single app) | Vercel + Supabase / Railway |

#### Why NOT Pure Next.js (Node.js)?
- Running PyTorch/CLIP models locally inside Node.js or Serverless Functions can cause memory limits, high latency, and ONNX conversion friction. Python handles PyTorch model caching and GPU execution naturally.

---

## 5. Scalability & Vector Storage Roadmap

1. **MVP / Phase 1 (Current Setup - 100 to 50,000 images)**:
   - **Vector Engine**: NumPy matrix (`embeddings.npy`) or `FAISS` in-memory index in Python FastAPI.
   - **Metadata**: JSON file (`metadata.json`) or SQLite DB.
   - **Search Speed**: $< 5\text{ ms}$ query time for up to 100k vectors.

2. **Production / Phase 2 (100,000+ to Millions of images)**:
   - **Vector Database**: **Qdrant** (Fast, self-hostable Docker or Cloud) or **pgvector** (PostgreSQL extension).
   - **Benefits**: Payload filtering (filter by subreddit, score threshold), persistence, distributed scaling.

---

## 6. Prompt Engineering Strategy for Grok (xAI)

When the backend retrieves the top $K$ Reddit captions, it constructs the following system & user prompt for Grok:

```text
System Prompt:
You are an expert social media manager and viral content creator. 
Your job is to craft top-tier, engaging, real-sounding captions for a user's image post.
Instead of generating generic robotic descriptions, analyze the real-life Reddit captions provided below from similar images to capture genuine internet culture, humor, brevity, and tone.

Retrieved Context (Authentic captions from similar Reddit posts):
1. Subreddit: r/[subreddit_1] | Score: [score_1] | Caption: "[caption_1]"
2. Subreddit: r/[subreddit_2] | Score: [score_2] | Caption: "[caption_2]"
3. Subreddit: r/[subreddit_3] | Score: [score_3] | Caption: "[caption_3]"
4. Subreddit: r/[subreddit_4] | Score: [score_4] | Caption: "[caption_4]"
5. Subreddit: r/[subreddit_5] | Score: [score_5] | Caption: "[caption_5]"

Task:
Analyze the user's uploaded image alongside the retrieved Reddit captions.
Generate 5 unique, creative caption options for the user:
1. [Witty / Humorous]
2. [Storytelling / Descriptive]
3. [Short & Punchy]
4. [Engaging / Question to Audience]
5. [Aesthetic / Minimalist]

Return ONLY a clean JSON object with the array of captions.
```

---

## 7. API Specifications

### Endpoint: `POST /api/v1/generate-captions`

#### Request (Multipart Form Data):
- `file`: Image file (JPEG, PNG, WEBP)
- `top_k` (optional, int): Number of Reddit matches to query (default: 5)
- `style_preference` (optional, string): Desired tone (e.g. `witty`, `minimal`, `engaging`)

#### Response JSON:
```json
{
  "status": "success",
  "data": {
    "captions": [
      {
        "id": 1,
        "style": "Witty",
        "text": "Living rent-free in a building that time forgot."
      },
      {
        "id": 2,
        "style": "Storytelling",
        "text": "Stumbled upon this abandoned gem during yesterday's urban exploration."
      },
      ...
    ],
    "similar_reddit_context": [
      {
        "subreddit": "abandonedporn",
        "score": 1420,
        "caption": "An old abandoned school hall untouched for decades.",
        "similarity_score": 0.8942
      }
    ]
  }
}
```

---

## 8. Development Action Plan

1. **Backend Development (Python FastAPI)**:
   - Wrap `test.py` embedding load logic into FastAPI app state (load CLIP model and `embeddings.npy` once on startup).
   - Create `/api/v1/generate-captions` endpoint.
   - Integrate Grok API SDK (`xai-api` or `openai` client configured with xAI base URL `https://api.x.ai/v1`).

2. **Frontend Development (Next.js)**:
   - Create clean drag-and-drop image upload UI (`react-dropzone` / Shadcn).
   - Display loading skeleton during vector search + Grok inference.
   - Render 5 generated captions with one-click copy buttons, feedback thumbs up/down, and social media export buttons.

3. **Deployment**:
   - Frontend: Vercel.
   - Backend: Railway / Render / Modal / DigitalOcean Droplet (Docker container with PyTorch).
