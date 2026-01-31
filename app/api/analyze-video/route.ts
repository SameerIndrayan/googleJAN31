import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: NextRequest) {
  if (!apiKey) {
    return NextResponse.json(
      { error: "GEMINI_API_KEY is not set. Please add it to your .env.local file." },
      { status: 500 }
    );
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const duration = parseFloat(formData.get("duration") as string) || 0;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Convert file to base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString("base64");
    const mimeType = file.type;

    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    // Analyze the video and generate overlays
    const prompt = `You are analyzing a football play video to create accessible text overlays for beginners and deaf viewers.

Analyze this video and generate synchronized text overlays that explain what's happening at key moments. Focus on:
- Pre-snap: Offense expectations, defensive look, primary responsibilities
- Mid-play: Coverage shifts, pressure sources, window changes
- Post-play: Outcome summary, main reason

Provide your response as a JSON array of overlay objects. Each overlay should have:
- timestamp: number (in seconds, when this overlay should appear)
- phase: "pre-snap" | "mid-play" | "post-play"
- text: string (short, clear sentence explaining what matters - one idea per line, no jargon)

Generate 6-10 overlays spread across the video duration (${duration} seconds). Make them evenly distributed and focus on the most important moments.

Return ONLY valid JSON array, no markdown formatting. Example format:
[
  {"timestamp": 0, "phase": "pre-snap", "text": "Offense lines up in spread formation."},
  {"timestamp": 2, "phase": "pre-snap", "text": "Defense shows zone coverage look."},
  {"timestamp": 5, "phase": "mid-play", "text": "Quarterback drops back to pass."},
  {"timestamp": 8, "phase": "mid-play", "text": "Defensive pressure forces quick throw."},
  {"timestamp": 12, "phase": "post-play", "text": "Pass incomplete due to pressure."}
]`;

    const result = await model.generateContent([
      {
        inlineData: {
          data: base64,
          mimeType: mimeType,
        },
      },
      { text: prompt },
    ]);

    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let jsonData;
    try {
      const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      jsonData = JSON.parse(cleanedText);
    } catch (e) {
      return NextResponse.json({
        success: false,
        error: "Failed to parse JSON response",
        raw: text,
      });
    }

    return NextResponse.json({
      success: true,
      overlays: jsonData,
    });
  } catch (error: any) {
    console.error("Video analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze video" },
      { status: 500 }
    );
  }
}
