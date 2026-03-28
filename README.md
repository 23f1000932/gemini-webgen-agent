# 🤖 gemini-webgen-agent

An **LLM-powered autonomous agent** that receives task briefs via HTTP, generates complete single-file web applications using **Google Gemini AI**, and automatically deploys them to **GitHub Pages** — fully hands-free.

---

## 📌 What It Does

1. **Receives** a task brief (POST request) describing a web app to build
2. **Processes** any attachments (images, CSVs, Markdown files, etc.)
3. **Generates** a complete `index.html` + `README.md` + `LICENSE` using Gemini 2.5 Flash
4. **Commits & pushes** the generated files to a GitHub repository
5. **Enables GitHub Pages** so the app is instantly live at `https://<username>.github.io/<repo>/`
6. **Returns** the deployment URL via a polling endpoint — no webhooks needed

---

## 🏗️ Architecture & Pipeline

```
Client
  │
  │  POST /ready  (TaskRequest JSON)
  ▼
┌─────────────────────────────────────────────┐
│            FastAPI Server (main.py)          │
│                                             │
│  1. Validate API key (optional)             │
│  2. Acknowledge immediately (202 Queued)    │
│  3. Spawn background asyncio task           │
│                                             │
│  ┌──────────────────────────────────────┐   │
│  │       generate_files_and_deploy()    │   │
│  │                                      │   │
│  │  ┌─────────┐    ┌────────────────┐  │   │
│  │  │ Round 1 │    │   Round 2+     │  │   │
│  │  │  Full   │    │   Surgical     │  │   │
│  │  │Generate │    │   Update       │  │   │
│  │  └────┬────┘    └───────┬────────┘  │   │
│  │       └────────┬────────┘           │   │
│  │                ▼                    │   │
│  │       Gemini 2.5 Flash API          │   │
│  │       (structured JSON output)      │   │
│  │                │                    │   │
│  │                ▼                    │   │
│  │      Save files locally             │   │
│  │      Save attachments               │   │
│  │                │                    │   │
│  │                ▼                    │   │
│  │      Git commit + push              │   │
│  │      Enable GitHub Pages            │   │
│  │                │                    │   │
│  │                ▼                    │   │
│  │      Store result in memory         │   │
│  └──────────────────────────────────────┘   │
│                                             │
│  Client polls GET /result/{task_id}  ◄──── │
└─────────────────────────────────────────────┘
```

### Multi-Round Logic

| Round | Behaviour |
|-------|-----------|
| **Round 1** | Creates a new GitHub repo and generates a complete app from scratch |
| **Round 2+** | Clones the existing repo, reads `index.html`, and applies **minimal surgical changes** only. Rejects LLM output that is < 30% of the original file size (Safe Mode) |

---

## 📂 Project Structure

```
.
├── main.py                  # Entire application (FastAPI server + agent logic)
├── requirements.txt         # Python dependencies
├── Dockerfile               # Container config (targets Hugging Face Spaces, port 7860)
├── .gitignore
├── README.md
└── generated_tasks/         # Auto-created; generated files per task (gitignored)
    └── <task-id>/
        ├── index.html
        ├── README.md
        └── LICENSE
logs/
└── app.log                  # Application logs (gitignored)
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.9+
- Git installed and on PATH
- A [GitHub Personal Access Token](https://github.com/settings/tokens) with `repo` scope
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### Step 1 — Clone the Repository

```bash
git clone https://github.com/YOUR-USERNAME/gemini-webgen-agent.git
cd gemini-webgen-agent
```

### Step 2 — Create a Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS / Linux
python -m venv venv
source venv/bin/activate
```

### Step 3 — Install Dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Configure Environment Variables

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key_here
GITHUB_TOKEN=your_github_personal_access_token_here
GITHUB_USERNAME=your_github_username_here

# Optional: protect your API with a key. Leave empty to disable auth.
API_KEY=
```

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key (used for code generation) |
| `GITHUB_TOKEN` | ✅ | GitHub PAT — must have `repo` and `pages` permissions |
| `GITHUB_USERNAME` | ✅ | Your GitHub username (used to construct repo/Pages URLs) |
| `API_KEY` | ❌ | If set, all POST `/ready` requests must include `X-API-Key: <key>` header |

### Step 5 — Run the Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Server starts at: `http://127.0.0.1:8000`  
Interactive API docs at: `http://127.0.0.1:8000/docs`

---

## 🚀 API Reference

### `POST /ready` — Submit a Task

Submits a task and immediately returns `202 Queued`. Generation and deployment run in the background.

**Request Headers (if `API_KEY` is configured):**
```
X-API-Key: your_api_key
```

**Request Body:**

```json
{
  "task": "my-calculator-app",
  "email": "you@example.com",
  "round": 1,
  "brief": "Create a responsive scientific calculator with dark mode using Tailwind CSS.",
  "attachments": []
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `task` | string | ✅ | Unique ID — becomes the GitHub repo name |
| `email` | string | ✅ | Owner email (stored in metadata) |
| `round` | int | ❌ (default: 1) | `1` = fresh generate, `2+` = surgical update |
| `brief` | string | ✅ | Natural-language description of the web app |
| `attachments` | array | ❌ | Files to include (`name` + `url` as data URI or https link) |

**Response:**

```json
{
  "status": "queued",
  "task_id": "my-calculator-app",
  "message": "Generation started. Poll GET /result/my-calculator-app for deployment details."
}
```

---

### `GET /result/{task_id}` — Poll Deployment Result

Poll this endpoint after submitting a task to get the deployment outcome.

```bash
curl http://localhost:8000/result/my-calculator-app
```

**While running:**
```json
{ "status": "pending" }
```

**On success:**
```json
{
  "status": "done",
  "repo_url": "https://github.com/youruser/my-calculator-app",
  "pages_url": "https://youruser.github.io/my-calculator-app/",
  "commit_sha": "a1b2c3d4e5f6..."
}
```

**On failure:**
```json
{ "status": "failed", "error": "error message here" }
```

---

### Other Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Service info and docs link |
| `/status` | GET | Last received task + active task count |
| `/health` | GET | Health check with timestamp |
| `/logs?lines=200` | GET | View recent application logs |

---

## 🧪 Testing Locally

```bash
# 1. Submit a task
curl -X POST http://127.0.0.1:8000/ready \
  -H "Content-Type: application/json" \
  -d '{
    "task": "todo-app",
    "email": "you@example.com",
    "round": 1,
    "brief": "Build a beautiful to-do list app with local storage persistence and dark mode.",
    "attachments": []
  }'

# 2. Poll for the result (repeat until status is "done")
curl http://127.0.0.1:8000/result/todo-app
```

After ~30–60 seconds, visit `https://<your-github-username>.github.io/todo-app/` to see the live app.

**With authentication enabled:**
```bash
curl -X POST http://127.0.0.1:8000/ready \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{ ... }'
```

---

## 🐳 Docker / Hugging Face Spaces

The `Dockerfile` is pre-configured for deployment on **Hugging Face Spaces** (port 7860):

```bash
docker build -t gemini-webgen-agent .
docker run -p 7860:7860 \
  -e GEMINI_API_KEY=... \
  -e GITHUB_TOKEN=... \
  -e GITHUB_USERNAME=... \
  -e API_KEY=... \
  gemini-webgen-agent
```

---

## 🔧 Advanced Configuration

All settings can be overridden via `.env` or environment variables:

| Variable | Default | Description |
|---|---|---|
| `MAX_CONCURRENT_TASKS` | `2` | Max parallel generation tasks |
| `KEEP_ALIVE_INTERVAL_SECONDS` | `30` | Heartbeat log interval |
| `LOG_FILE_PATH` | `logs/app.log` | Log file location |
| `GITHUB_API_BASE` | `https://api.github.com` | Override for GitHub Enterprise |
| `GITHUB_PAGES_BASE` | Auto-derived | Override if using a custom domain |

---

## ⚠️ Common Issues

| Issue | Fix |
|---|---|
| `GEMINI_API_KEY not configured` | Ensure `.env` file exists and is loaded |
| `401 Unauthorized` | If `API_KEY` is set in `.env`, include `X-API-Key` header in requests |
| `GitHub API 422 — main branch must exist` | Normal on first push; retried automatically with exponential backoff |
| `rmtree` errors on Windows | Caused by file locks; ensure no other process has the folder open |
| LLM returns empty `index.html` | Safe Mode kicks in and reverts to the existing file |
| Task stuck on `pending` | Check `GET /logs` for error details |

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🙏 Acknowledgements

- [Google Gemini API](https://ai.google.dev/) — LLM backbone for code generation
- [FastAPI](https://fastapi.tiangolo.com/) — Async Python web framework
- [GitPython](https://gitpython.readthedocs.io/) — Programmatic Git operations