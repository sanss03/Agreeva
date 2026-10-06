# Agreeva

AI-powered financial document simplifier for Indian users. Upload a loan agreement, insurance policy, or other financial document (PDF, Word, image, or pasted text) and get:

- Plain-language summary in **English, Hindi, or Marathi**
- Risk alerts & key clauses highlighted
- EMI/loan calculations
- Voice explanation (browser TTS)
- Understanding quiz (chatbot)
- Consent capture

---

## Tech Stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Frontend | Next.js 16, React 19, Tailwind CSS, next-intl   |
| Backend  | Node.js, Express 5, Multer, pdf-parse, Mammoth  |
| AI       | Groq API (openai/gpt-oss-120b with fallbacks)   |
| OCR      | Tesseract.js (eng + hin + mar trained data)     |
| TTS      | Browser Web Speech API + Google TTS API         |

---

## Local Development

### Prerequisites
- Node.js 18+
- A free [Groq API key](https://console.groq.com/keys)

### 1. Clone the repo

```bash
git clone https://github.com/sanss03/Agreeva.git
cd Agreeva
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
# Edit .env and set your GROQ_API_KEY
npm install
npm start
```

Backend runs on: `http://localhost:5000`

Verify it's alive:
```bash
curl http://localhost:5000/health
# → {"status":"ok","timestamp":"...","groqConfigured":true}
```

### 3. Set up the frontend

```bash
cd frontend
cp .env.example .env.local
# .env.local already has: NEXT_PUBLIC_API_URL=http://localhost:5000
npm install
npm run dev
```

Frontend runs on: `http://localhost:3000`

### Local test commands

```bash
# Backend health
curl http://localhost:5000/health

# Test PDF extraction
curl -X POST http://localhost:5000/api/simplify/extract \
  -F "file=@/path/to/test.pdf"

# Test text simplification
curl -X POST http://localhost:5000/api/simplify/text \
  -H "Content-Type: application/json" \
  -d '{"text":"Loan of Rs 1 lakh at 18% for 5 years","language":"en"}'

# Test chatbot
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"What is EMI?","language":"english"}'
```

---

## Render Deployment

Deploy as **two separate services** on [Render](https://render.com):
1. A **Web Service** for the backend (Node.js)
2. A **Web Service** for the frontend (Next.js)

---

### Step 1 — Deploy the Backend

Go to [render.com](https://render.com) → **New → Web Service** → Connect your GitHub repo.

| Setting              | Value                                     |
|----------------------|-------------------------------------------|
| **Name**             | `agreeva-backend`                         |
| **Root Directory**   | `backend`                                 |
| **Runtime**          | `Node`                                    |
| **Build Command**    | `npm install`                             |
| **Start Command**    | `npm start`                               |
| **Instance Type**    | Free (or Starter for always-on)           |

**Environment Variables** (set in Render dashboard → Environment):

| Key              | Value                                         |
|------------------|-----------------------------------------------|
| `GROQ_API_KEY`   | `your_actual_groq_api_key`                    |
| `NODE_ENV`       | `production`                                  |
| `FRONTEND_URL`   | `https://agreeva-frontend.onrender.com` *(set this after deploying frontend)* |

> **Note:** `PORT` is automatically set by Render — do **not** add it manually.

After deploy, verify:
```
https://agreeva-backend.onrender.com/health
```
Should return: `{"status":"ok","groqConfigured":true,...}`

---

### Step 2 — Deploy the Frontend

Go to Render → **New → Web Service** → same repo.

| Setting              | Value                                                   |
|----------------------|---------------------------------------------------------|
| **Name**             | `agreeva-frontend`                                      |
| **Root Directory**   | `frontend`                                              |
| **Runtime**          | `Node`                                                  |
| **Build Command**    | `npm install && npm run build`                          |
| **Start Command**    | `npm start`                                             |
| **Instance Type**    | Free (or Starter for always-on)                         |

**Environment Variables:**

| Key                    | Value                                                  |
|------------------------|--------------------------------------------------------|
| `NEXT_PUBLIC_API_URL`  | `https://agreeva-backend.onrender.com`                 |
| `NODE_ENV`             | `production`                                           |

> **Important:** `NEXT_PUBLIC_API_URL` must be set **before** the build runs because Next.js bakes it into the client bundle at build time.

---

### Step 3 — Update Backend CORS

Once your frontend is live, go back to the **backend** service on Render and set:

| Key            | Value                                          |
|----------------|------------------------------------------------|
| `FRONTEND_URL` | `https://agreeva-frontend.onrender.com`        |

Then click **Manual Deploy → Deploy latest commit** to restart the backend with the updated CORS config.

---

## Environment Variables Reference

### Backend (`backend/.env`)

```env
# Required
GROQ_API_KEY=gsk_...

# Optional — defaults shown
PORT=5000
FRONTEND_URL=*          # set to your frontend URL in production for tighter CORS
NODE_ENV=development
```

### Frontend (`frontend/.env.local`)

```env
# Required for production — set on Render before building
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

## API Routes

| Method | Route                         | Description                               |
|--------|-------------------------------|-------------------------------------------|
| GET    | `/health`                     | Health check                              |
| POST   | `/api/simplify/extract`       | Extract text from PDF/DOCX/image          |
| POST   | `/api/simplify/text`          | Analyze & simplify pasted text            |
| POST   | `/api/simplify`               | Analyze & simplify uploaded file          |
| POST   | `/api/chat`                   | Stateless chatbot (recommended)           |
| POST   | `/api/chat/session`           | Create chat session (legacy)              |
| POST   | `/api/chat/message`           | Send message in session (legacy)          |
| POST   | `/api/tts`                    | Generate speech audio (MP3)               |
| POST   | `/api/upload`                 | Upload & store PDF for chatbot context    |
| GET    | `/api/upload/context`         | View stored PDF context                   |
| DELETE | `/api/upload/context`         | Clear stored PDF context                  |
| POST   | `/api/consent/session`        | Create consent session                    |

---

## Notes for Render

- **Ephemeral filesystem:** All file uploads use in-memory processing (`multer.memoryStorage()`). TTS temp files are written to `os.tmpdir()` (`/tmp`) and deleted immediately after being sent — no persistent disk usage.
- **Cold starts:** Free tier services sleep after 15 minutes of inactivity. The first request after sleep may take 30–60 seconds.
- **Knowledge base PDFs:** The `backend/docs/` folder is committed to git and loaded into memory at startup — this works fine on Render.
- **Tesseract OCR data:** `eng.traineddata`, `hin.traineddata`, `mar.traineddata` are committed and used directly by tesseract.js.

---

## Security

- `GROQ_API_KEY` lives only in the backend and is never sent to the browser.
- `.env` files are excluded from git via `.gitignore`.
- All uploads are processed in memory and never written to permanent storage.
