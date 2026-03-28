# WebGen Agent Frontend

Single-page React + Vite + Tailwind control panel for `gemini-webgen-agent`.

## Features

- Settings modal (localStorage-backed): backend URL, email, API key, GitHub username
- Live backend health indicator (`/health`)
- Task submission form with task slug sanitization and deployment URL preview
- Drag-and-drop attachments (images, CSV, Markdown) converted to base64 data URIs
- Deterministic result polling (`/result/{task_id}`) with step tracker
- Collapsible live logs panel (`/logs?lines=50`)
- Success/error cards with deployment links and retry/reset actions

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
