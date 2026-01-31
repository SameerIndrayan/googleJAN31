# Setup Instructions

## Quick Start

1. **Get your Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the API key

2. **Create `.env.local` file**
   ```bash
   # In the root directory of the project
   echo "GEMINI_API_KEY=your_api_key_here" > .env.local
   ```
   
   Or manually create `.env.local` and add:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

3. **Restart the dev server**
   ```bash
   # Stop the current server (Ctrl+C)
   npm run dev
   ```

4. **Test the app**
   - Open http://localhost:3000
   - Upload a game footage image/video
   - Extract DNA!

## Troubleshooting

### Error: "GEMINI_API_KEY is not set"
- Make sure `.env.local` exists in the root directory
- Make sure the file contains: `GEMINI_API_KEY=your_key_here`
- Restart the dev server after creating/updating `.env.local`
- The file should be in the same directory as `package.json`

### Error: "403 Forbidden" or "unregistered callers"
- Your API key might be invalid
- Make sure there are no extra spaces in `.env.local`
- Try generating a new API key from Google AI Studio

### File upload not working
- Make sure you're using the "Upload File" option (not YouTube URL)
- Supported formats: images (jpg, png, etc.) and videos (mp4, etc.)
- Try a smaller file first (under 10MB recommended)

## Getting Game Footage

See `TESTING_GUIDE.md` for detailed instructions on finding and downloading game footage for testing.
