# Caption Studio

**AI-powered video captioning that stays on your machine.**

Caption Studio is a browser-based tool for creating, editing, and styling video captions — with or without AI transcription. No uploads. No accounts. No privacy tradeoffs.

Drop in a video, add your captions, pick a style, export. That's it.

---

## What it does

- **Import or create** — drag-and-drop any video (MP4, WebM, MOV, AVI up to 2GB), or start from scratch
- **Full timeline editor** — drag, resize, and fine-tune caption timing with frame-level precision
- **Live preview** — see exactly how captions will look overlaid on your video in real time
- **6 built-in presets** — Classic, Netflix, YouTube, Bold Impact, Minimal, Karaoke
- **Deep style controls** — font family, size, weight, color, outline, shadow, background, positioning, animations
- **SRT import/export** — load existing subtitles, export when you're done
- **AI transcription** — run Whisper directly in your browser to auto-generate captions from speech *(coming soon)*

## Privacy-first

Everything runs client-side. Your video never leaves your machine. No server calls, no telemetry, no accounts to create.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173), drop in a video, and start captioning.

## Keyboard shortcuts

| Key | Action |
|-----|--------|
| `Space` | Play / Pause |
| `←` / `→` | Seek 5 seconds |
| `Shift + ←` / `→` | Seek 1 second |
| `Delete` | Delete selected caption |
| `Cmd/Ctrl + S` | Save project |

*(Shortcuts in progress — some may still be rolling out)*

## Style presets

| Preset | Best for |
|--------|---------|
| **Classic** | White text, black outline — works everywhere |
| **Netflix** | Black background box, cinematic feel |
| **YouTube** | Semi-transparent background, high readability |
| **Bold Impact** | Yellow uppercase, center screen — high energy |
| **Minimal** | Clean and subtle, documentary style |
| **Karaoke** | Cyan text — great for sing-along videos |

Save your own custom presets — they persist in localStorage.

## Tech stack

Built with: React 19 · TypeScript · Vite · Jotai · Tailwind CSS v4 · Radix UI

Transcription powered by Whisper (WebAssembly) and video export via FFmpeg.wasm — both run in-browser with no server required.

## Deployment

Works on Vercel, Netlify, or any static host. Requires COOP/COEP headers for Whisper and FFmpeg.wasm:

```
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
```

Configs are already set for [Vercel](./vercel.json) and [Netlify](./netlify.toml).

## Status

| Feature | Status |
|---------|--------|
| Video upload + playback | Done |
| Caption editing + timeline | Done |
| Style editor + presets | Done |
| SRT import/export | Done |
| AI transcription (Whisper) | In progress |
| Video export (burned-in captions) | In progress |
| Keyboard shortcuts | In progress |
| Auto-save | In progress |

## License

MIT
