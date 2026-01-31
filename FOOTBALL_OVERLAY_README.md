# Football Play Understanding Overlay

A simple, accessible video overlay prototype that helps beginners and deaf viewers understand football plays through synchronized text explanations.

## Features

- **Synchronized Text Overlays**: Text appears at specific timestamps explaining the play
- **Three Phases**: Pre-snap, mid-play, and post-play explanations
- **Toggle Overlay**: Show/hide overlay text
- **Timeline Markers**: Visual markers on the scrub bar showing when overlays appear
- **Accessible Design**: Large, high-contrast text for readability
- **Side Panel**: Complete play breakdown visible at all times

## Setup

1. **Add a football video file**:
   - Place a video file named `football-clip.mp4` in the `public/` folder
   - Or update the video source in `app/page.tsx` (line 60)
   - Recommended: 15-30 second clip showing a single play

2. **Run the app**:
   ```bash
   npm run dev
   ```

3. **Open**: http://localhost:3000

## How It Works

- Video plays normally with standard controls
- Text overlays appear automatically at predefined timestamps
- Overlays stay visible for 3 seconds after their timestamp
- Timeline shows markers where overlays appear
- Right panel shows all overlay text organized by phase

## Customizing Overlays

Edit the `overlayData` array in `app/page.tsx` to change:
- Timestamps (in seconds)
- Overlay text
- Phase (pre-snap, mid-play, post-play)

## Design Principles

- **Short sentences**: One idea per line
- **Plain language**: No jargon without explanation
- **Cause and effect**: Focus on what matters and why
- **High contrast**: Large, readable text with clear colors
- **No audio dependency**: Everything is visual

## Tech Stack

- Next.js 16
- React
- TypeScript
- Tailwind CSS
- HTML5 Video Element
