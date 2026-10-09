# CAPTION AI - Monorepo

FastAPI backend engine (DINOv2 ONNX image embeddings, FAISS vector search, Groq LLM) + Next.js 15 frontend.

## Project Structure
- `frontend/`: Next.js frontend application (Deployed on Vercel)
- `backend/`: FastAPI Python server (Deployed on Render)
- `vectors/`: Pre-computed FAISS vector index & metadata store

---

## What is this?

Most AI caption tools give you generic, robotic lines like *"A person standing in the gym smiling at the camera"*. Nobody talks like that on Instagram.

This project is an **anti-AI-slop caption generator**. When you upload a photo, instead of asking an LLM to guess a caption from thin air, we run a visual RAG pipeline:
1. Your image is converted into a vector embedding using a lightweight, quantized **DINOv2 ONNX** model.
2. We query an in-memory **FAISS database** containing **35,000 real Instagram images** to find visually and contextually similar posts.
3. We extract the **top 50 matching human-written captions** from the dataset.
4. Those 50 real captions are passed as few-shot mood and style context to **Groq (LLM)** to generate punchy, authentic, human-sounding caption options tailored to your photo.

---

## Dataset

Built on the Kaggle Instagram dataset containing ~35K real images and authentic captions:
- **Kaggle Dataset**: [Instagram Images with Captions by Prithvi Jaunjale](https://www.kaggle.com/datasets/prithvijaunjale/instagram-images-with-captions)

All ~35,000 images are pre-vectorized into 384-dimensional embeddings and indexed in FAISS (`vectors/instagram_faiss.index`), with a 1:1 aligned metadata map (`vectors/instagram_metadata.json`) for instant sub-millisecond retrieval.

---

## How to Run Locally

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+** & npm
- A free **Groq API key** ([console.groq.com](https://console.groq.com))

---

### 2. Backend Setup (FastAPI)

1. Open your terminal and create a `.env` file in the project root:
   ```env
   groq_api=your_groq_api_key_here
   ```

2. Install backend dependencies:
   ```powershell
   pip install -r backend/requirements.txt
   ```

3. Start the backend server:
   ```powershell
   python backend/mainV2.py
   ```
   *The backend will boot up on `http://127.0.0.1:8000` with the 35K FAISS index loaded into memory (~170 MB idle RAM).*

---

### 3. Frontend Setup (Next.js)

1. In a new terminal window, navigate to the frontend folder:
   ```powershell
   cd frontend
   ```

2. Install dependencies:
   ```powershell
   npm install
   ```

3. Start the Next.js dev server:
   ```powershell
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser. Upload any photo to test it out!
