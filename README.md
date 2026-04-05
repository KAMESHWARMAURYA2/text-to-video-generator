# Kie AI Text-to-Video Generator (React + Vite + Tailwind)

Production-ready frontend-only web app that integrates directly with Kie AI APIs and stores task metadata in Firebase Firestore.

## Features

- Create video generation tasks with a switchable provider flag:
  - Sora Jobs API (`sora-2-text-to-video`)
  - Runway API (`runway-duration-5-generate`)
- Switch models from the UI without changing core flow
- Track task status by `taskId` (same status flow for both providers)
- Parse provider response and play generated video
- Download generated video as `.mp4`
- Save `taskId`, `prompt`, and timestamp to Firestore
- Tailwind responsive UI with toast notifications
- Auto polling every 5 seconds while task is processing

## Security Warning

This app is frontend-only. Any key in `VITE_*` variables is exposed to end users via browser bundles.
Use a restricted/rotated API key and enforce quotas in your Kie AI account.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create env file:

```bash
cp .env.example .env
```

3. Fill in:

- `VITE_KIE_API_KEY`
- Firebase fields (`VITE_FIREBASE_*`)

4. Run locally:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
  components/
    VideoForm.jsx
    TaskStatus.jsx
    VideoPlayer.jsx
    Toast.jsx
  services/
    kieApi.js
    firebase.js
  App.jsx
  main.jsx
```

## Firestore

Collection: `videoTasks`

Fields written by `saveTask(taskId, prompt)`:
- `taskId`
- `prompt`
- `createdAt` (server timestamp)
