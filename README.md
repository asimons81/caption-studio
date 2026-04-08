# Caption Studio

**AI-powered video captions — no uploads, no accounts, no privacy tradeoffs.**

Drop in a video, transcribe it with AI, style your captions, and export. Everything runs in your browser.

---

## What it does

- **Import any video** — MP4, WebM, MOV, AVI up to 2GB via drag-and-drop
- **AI transcription** — runs Whisper directly in your browser to auto-generate captions from speech
- **Full timeline editor** — drag, resize, and fine-tune caption timing with frame-level precision
- **Live preview** — see exactly how captions look overlaid on your video in real time
- **6 built-in presets** — Classic, Netflix, YouTube, Bold Impact, Minimal, Karaoke
- **Deep style controls** — font, size, color, outline, shadow, background, positioning, animations
- **SRT import/export** — load existing subtitles, export when you're done
- **Burned-in video export** — download your video with captions baked in

---

## Privacy

Everything runs client-side. Your video never leaves your machine. No server calls, no telemetry, no accounts.

Transcription uses [Whisper](https://openai.com/research/whisper) via WebAssembly. Video export uses FFmpeg.wasm. Both run entirely in-browser.

---

## Quick start

```bash
git clone https://github.com/asimons81/caption-studio.git
cd caption-studio
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), drop in a video, and start captioning.

---

## How to use it

**Transcribe a video:**
1. Drop in a video file
2. Click "Transcribe" in the caption toolbar
3. Choose a model — Tiny (fast, ~40MB download) or Small (more accurate, ~240MB download)
4. Watch captions appear in real-time as they're generated
5. Edit timing and text as needed

**Style captions:**
1. Pick a preset from the Style tab, or customize manually
2. Adjust font, colors, outline, shadow, background
3. Set position (9-point grid) and animation
4. Preview updates live

**Export:**
1. Go to the Export tab
2. Choose format — SRT (subtitles only) or burned-in video (captions baked into the video file)
3. Download

---

## Presets

| Preset | Best for |
|--------|----------|
| **Classic** | White text, black outline — works everywhere |
| **Netflix** | Black background box, cinematic feel |
| **YouTube** | Semi-transparent background, high readability |
| **Bold Impact** | Yellow uppercase, center screen — high energy |
| **Minimal** | Clean and subtle, documentary style |
| **Karaoke** | Cyan text — great for sing-along videos |

Custom presets save to localStorage and persist between sessions.

---

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Seek 5 seconds |
| `Shift + ←` / `→` | Seek 1 second |
| `Delete` | Delete selected caption |
| `Cmd/Ctrl + S` | Save project |

---

## Tech

- React 19 + TypeScript
- Vite (build tool)
- Jotai (state management)
- Tailwind CSS v4 (styling)
- Radix UI (accessible UI primitives)
- Whisper via `@huggingface/transformers` (client-side transcription)
- FFmpeg.wasm (client-side video export)

No backend. No server. No accounts.

---

## Deployment

Works on Vercel, Netlify, or any static host.

**Required headers** (Whisper and FFmpeg.wasm need these):

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Already configured for [Vercel](./vercel.json) and [Netlify](./netlify.toml).

---

## Current status

| Feature | Status |
|---------|--------|
| Video upload + playback | Done |
| Caption editing + timeline | Done |
| Style editor + presets | Done |
| SRT import/export | Done |
| AI transcription (Whisper) | Done |
| Video export (burned-in captions) | Done |
| Keyboard shortcuts | Done |
| Auto-save | Done |

---

## License

MIT
