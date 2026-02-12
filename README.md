# Caption Studio

A client-side video captioning tool that runs entirely in your browser. No uploads, no accounts, complete privacy.

## ✅ Completed Features (Phases 1-6 + 8)

### Phase 1: Project Setup ✅
- ✅ Vite + React 19 + TypeScript
- ✅ Tailwind CSS v4 configured
- ✅ Jotai state management
- ✅ Radix UI components (Dialog, Slider, Select, Tabs, Popover)
- ✅ Complete folder structure
- ✅ TypeScript interfaces and types
- ✅ Responsive MainLayout with sidebar and video panel

### Phase 2: Video Upload + Playback ✅
- ✅ Drag-and-drop video upload
- ✅ File validation (MP4, WebM, MOV, AVI up to 2GB)
- ✅ Video player with custom controls
- ✅ Play/pause, seek, speed control (0.5x - 2x)
- ✅ Volume control
- ✅ requestAnimationFrame-based time sync (60fps precision)
- ✅ Tab visibility re-sync

### Phase 3: Caption Data + Manual Editing ✅
- ✅ Caption segment management (add, delete, update)
- ✅ Inline text editing
- ✅ Time input editing (supports multiple formats)
- ✅ SRT import/export
- ✅ Auto-scroll to active captions
- ✅ Visual indication of active/selected captions

### Phase 4: Caption Overlay Preview ✅
- ✅ HTML/CSS overlay positioned over video
- ✅ ResizeObserver for responsive scaling
- ✅ Font size scaling relative to display size (1080p reference)
- ✅ Real-time preview of all style changes
- ✅ Fade and slide-up animations

### Phase 5: Style Editor ✅
- ✅ Font family selector (15+ fonts)
- ✅ Font size, weight, style, transform controls
- ✅ Letter spacing control
- ✅ Color pickers with alpha channel (text, outline, shadow, background)
- ✅ Outline width control
- ✅ Shadow offset and blur controls
- ✅ Background box with padding and border radius
- ✅ 3x3 position grid (top/center/bottom × left/center/right)
- ✅ Margin controls
- ✅ Animation type and duration (none, fade, slide-up, typewriter*, word-highlight*)

  *Typewriter and word-highlight animations defined but not fully implemented

### Phase 6: Timeline ✅
- ✅ Time ruler with markers
- ✅ Draggable caption blocks
- ✅ Resizable caption edges
- ✅ Playhead indicator
- ✅ Click to seek
- ✅ Visual feedback for selected segments
- ✅ Zoom support (infrastructure ready)

### Phase 8: Style Presets ✅
- ✅ 6 built-in presets:
  - Classic (white text, black outline)
  - Netflix (black background box style)
  - YouTube (semi-transparent background)
  - Bold Impact (yellow uppercase, center screen)
  - Minimal (clean, simple style)
  - Karaoke (cyan text for sing-along)
- ✅ Save current style as custom preset
- ✅ Delete custom presets
- ✅ LocalStorage persistence

### Export Features ✅ (Partial)
- ✅ Download SRT subtitle files
- ⚠️ Video export with burned-in captions (NOT YET IMPLEMENTED - see Phase 9)

## 🚧 Not Yet Implemented

### Phase 7: Speech-to-Text Transcription ⚠️
**Status:** Not implemented - requires Web Worker setup

**What's needed:**
- `audio-extract.worker.ts` - FFmpeg.wasm to extract audio as WAV
- `transcription.worker.ts` - @huggingface/transformers Whisper model
- Model loading UI and progress reporting
- Segment population from transcription results
- Model selection (whisper-tiny vs whisper-small)

**Implementation notes:**
```typescript
// src/workers/transcription.worker.ts structure:
// 1. Import @huggingface/transformers
// 2. Load Whisper model (whisper-tiny-en or whisper-small)
// 3. Process audio file
// 4. Generate segments with word-level timestamps
// 5. Post back to main thread

// src/hooks/useTranscription.ts:
// - Manage worker lifecycle
// - Handle progress updates
// - Update captionSegmentsAtom with results
```

### Phase 9: Video Export ⚠️
**Status:** Not implemented - requires FFmpeg.wasm integration

**What's needed:**
- `assGenerator.ts` - Convert CaptionStyle to ASS subtitle format
- `export.worker.ts` - FFmpeg.wasm video encoding
- Quality presets (Fast CRF 28 / Balanced CRF 23 / High CRF 18)
- Progress parsing from FFmpeg stderr
- Blob download handling

**Implementation notes:**
```typescript
// src/lib/export/assGenerator.ts:
// - Convert styleToCSS logic to ASS format directives
// - Generate [V4+ Styles] section
// - Generate [Events] section with Dialogue lines
// - Must visually match CSS preview (CRITICAL)

// FFmpeg command:
// ffmpeg -i input.mp4 -vf "ass=captions.ass" -c:v libx264 -crf 23 -c:a copy output.mp4
```

### Phase 10: Polish ⚠️
**Partially implemented**

**Still needed:**
- ⚠️ Keyboard shortcuts (Space, arrows, Delete)
- ⚠️ Auto-save to localStorage every 30s
- ⚠️ Save/load project functionality
- ⚠️ Error boundaries
- ⚠️ Loading states and spinners
- ⚠️ Toast notifications
- ⚠️ Worker cleanup on unmount
- ⚠️ Object URL revocation
- ⚠️ Mobile layout optimization

## 🚀 Getting Started

```bash
cd caption-studio
npm install
npm run dev
```

Then open http://localhost:5173

## Transcription/FFmpeg Notes (COOP/COEP)

This app uses `@ffmpeg/ffmpeg` (ffmpeg.wasm) and a Whisper Web Worker. For reliability in dev/preview/prod, it must run in a cross-origin isolated context:

- `Cross-Origin-Opener-Policy: same-origin`
- `Cross-Origin-Embedder-Policy: require-corp`

Also, FFmpeg core assets are served from same-origin (`/ffmpeg/ffmpeg-core.js`, `.wasm`, `.worker.js`) because COEP can block cross-origin subresources from CDNs.

Implementation detail: `scripts/copy-ffmpeg-core.mjs` copies these assets from `node_modules/@ffmpeg/core` into `public/ffmpeg` during `postinstall`, and the npm scripts run it before `dev/build/preview`.

## Deployment gotchas

- Keep COOP/COEP headers enabled for every route in production:
  - `vercel.json` for Vercel
  - `netlify.toml` or `public/_headers` for Netlify
- The FFmpeg copy script supports multiple `@ffmpeg/core` layouts (`dist/esm`, `dist/umd`, `dist`).
- `ffmpeg-core.js` and `ffmpeg-core.wasm` are required and build will fail if they are missing.
- `ffmpeg-core.worker.js` is optional; if absent in the installed package layout, the app logs a warning and falls back without explicitly providing a worker URL.
- Build and preview run the copy script directly, so deployment does not depend solely on lifecycle hooks like `postinstall`.

## 📝 Usage

1. **Upload a video** - Click "Upload Video" or drag & drop
2. **Add captions**:
   - Manually: Click "Add Caption" in the Captions tab
   - Import: Click "Import SRT" to load existing subtitles
3. **Edit timing** - Drag caption blocks on timeline or edit time inputs
4. **Style captions** - Use the Style tab to customize appearance
5. **Apply presets** - Use the Presets tab for quick styling
6. **Export** - Download SRT file (video export not yet available)

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite 6** - Build tool
- **Jotai** - State management (atomic model for 60fps performance)
- **Tailwind CSS v4** - Styling
- **Radix UI** - Accessible component primitives
- **nanoid** - ID generation

### Planned Dependencies (not yet integrated)
- **@huggingface/transformers** - Whisper transcription (Phase 7)
- **@ffmpeg/ffmpeg** - Video encoding (Phase 9)
- **@ffmpeg/util** - FFmpeg utilities (Phase 9)

## 🏗️ Architecture Highlights

### State Management (Jotai)
```typescript
// Video state
videoFileAtom: VideoFile | null
playbackStateAtom: PlaybackState (currentTime synced via rAF)

// Caption state
captionSegmentsAtom: CaptionSegment[]
globalStyleAtom: CaptionStyle
activeCaptionsAtom: derived atom (filters by currentTime)
selectedSegmentAtom: derived atom

// UI state
isUploadModalOpenAtom, activeEditorTabAtom, timelineZoomAtom, etc.
```

### Performance Optimizations
- **requestAnimationFrame loop** for sub-frame time precision (not timeupdate event)
- **Derived atoms** prevent unnecessary re-renders (activeCaptionsAtom)
- **ResizeObserver** for efficient scaling calculations
- **CSS transforms** for GPU-accelerated caption animations

### Styling System
- Styles stored as device-independent values (1080p reference)
- `styleToCSS()` applies scale factor based on actual video dimensions
- Future `styleToASS()` will ensure visual parity for exports

## 📁 Project Structure

```
caption-studio/
├── src/
│   ├── components/
│   │   ├── editor/       CaptionList, StyleEditor, Presets, Export
│   │   ├── layout/       MainLayout, Header, Sidebar
│   │   ├── timeline/     Timeline, Ruler, CaptionTrack, Playhead
│   │   ├── upload/       UploadModal, DropZone
│   │   ├── ui/           Button, Slider, Tabs, Modal, Select, etc.
│   │   └── video/        VideoPlayer, CaptionOverlay, PlaybackControls
│   ├── atoms/            Jotai state atoms
│   ├── hooks/            useVideoPlayback, useTimeline
│   ├── lib/
│   │   ├── caption/      captionUtils, timingUtils
│   │   ├── export/       srtParser (assGenerator TODO)
│   │   ├── style/        styleToCSS, builtInPresets
│   │   └── video/        videoUtils, fileHandler
│   ├── types/            TypeScript interfaces
│   ├── constants/        defaults, fonts
│   └── workers/          (TODO: transcription, export)
├── public/fonts/         (for bundled web fonts)
└── package.json
```

## 🐛 Known Issues

1. **Video export not implemented** - Phase 9 requires significant FFmpeg.wasm integration
2. **Transcription not implemented** - Phase 7 requires Whisper model setup
3. **No keyboard shortcuts** - Phase 10 polish work
4. **No auto-save** - Phase 10 polish work
5. **Typewriter/Word-highlight animations** - Defined but not rendering correctly
6. **Timeline zoom** - Infrastructure ready but no UI controls yet
7. **Per-segment style overrides** - Data structure ready but no UI

## 🔮 Future Enhancements

- Multi-language transcription support
- Advanced animations (bounce, glow, karaoke timing)
- Caption templates and themes
- Collaborative editing (sync via WebRTC)
- Accessibility checker (readability, contrast)
- Export to multiple formats (VTT, TTML, SBV)

## 📄 License

MIT

## 🙏 Credits

Built with Claude Sonnet 4.5
