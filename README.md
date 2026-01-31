# Tactical DNA Fingerprint

A cutting-edge sports analytics tool that extracts unique playing style signatures (Tactical DNA) from game footage and generates personalized counter-strategies using Gemini 3 Vision AI.

## Features

- **DNA Extraction**: Analyze game footage (images/videos) to extract a team's unique tactical DNA
- **Counter-Strategy Generation**: Generate personalized counter-strategies based on opponent's DNA
- **Multiple Input Methods**: Upload files or paste YouTube URLs
- **Comprehensive Analysis**: Formation, playing style, strengths, weaknesses, movement patterns

## Getting Started

### Prerequisites

- Node.js 18+ 
- Gemini API Key (get from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Extracting DNA

1. Select "Extract DNA" tab
2. Enter team name (optional)
3. Upload game footage (image/video) - **Recommended method**
   - Or paste YouTube URL (note: requires video frame extraction for full functionality)
4. Click "Extract DNA"
5. View the comprehensive tactical analysis

### Generating Counter-Strategies

1. First extract the opponent's DNA
2. Click "Generate Counter-Strategies for This Team"
3. Or manually paste opponent DNA in the "Counter" tab
4. Upload your team's footage
5. Get personalized counter-strategies

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Gemini 2.0 Flash** - Vision AI analysis
- **Lucide React** - Icons

## License

MIT License - Open Source

## Hackathon

Built for Gemini 3 SuperHack 2026 - The Playbook Track
