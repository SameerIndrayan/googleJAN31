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
    const body = await request.json();
    const { youtubeUrl, teamName, analysisType, opponentDNA } = body;

    if (!youtubeUrl) {
      return NextResponse.json(
        { error: "No YouTube URL provided" },
        { status: 400 }
      );
    }

    // Note: Gemini cannot directly access YouTube URLs. 
    // This endpoint analyzes based on the URL description.
    // For best results, use file upload with actual game footage.
    
    const model = genAI.getGenerativeModel({ model: "gemini-3-pro-preview" });

    let prompt = "";

    if (analysisType === "dna") {
      prompt = `You are a tactical sports analyst. Based on the YouTube video at ${youtubeUrl}, provide a tactical analysis. 

Note: Since I cannot directly access the video, please provide analysis based on typical tactical patterns. If you have access to the video content, analyze the team's "Tactical DNA" - their unique playing style signature.

Extract the team's "Tactical DNA" - their unique playing style signature. Provide a detailed analysis in JSON format with the following structure:
{
  "teamName": "${teamName || "Team"}",
  "formation": "description of formation (e.g., '4-3-3', '3-5-2')",
  "playingStyle": {
    "tempo": "fast/medium/slow",
    "possession": "high/medium/low",
    "pressing": "aggressive/moderate/passive",
    "width": "wide/narrow/balanced",
    "verticality": "direct/patient/balanced"
  },
  "tacticalTendencies": [
    "specific tendency 1",
    "specific tendency 2",
    "specific tendency 3"
  ],
  "strengths": [
    "strength 1",
    "strength 2",
    "strength 3"
  ],
  "weaknesses": [
    "weakness 1",
    "weakness 2",
    "weakness 3"
  ],
  "playerMovement": {
    "defensive": "description of defensive movement patterns",
    "offensive": "description of offensive movement patterns",
    "transitions": "description of transition patterns"
  },
  "dnaSignature": "A unique 2-3 sentence description of this team's tactical DNA that captures their essence"
}

Focus on tactical patterns visible in the footage. Return ONLY valid JSON, no markdown formatting.`;
    } else if (analysisType === "counter") {
      prompt = `You are a tactical sports analyst. Based on the opponent's Tactical DNA provided below, analyze the game footage from this YouTube URL: ${youtubeUrl} and generate specific counter-strategies.

Opponent DNA:
${opponentDNA || "No opponent DNA provided"}

Provide counter-strategies in JSON format:
{
  "counterStrategies": [
    {
      "strategy": "strategy name",
      "description": "detailed description",
      "implementation": "how to execute this",
      "targetWeakness": "which opponent weakness this exploits"
    }
  ],
  "formationRecommendation": "recommended formation to counter",
  "keyTacticalAdjustments": [
    "adjustment 1",
    "adjustment 2",
    "adjustment 3"
  ],
  "playerInstructions": {
    "defense": "specific defensive instructions",
    "midfield": "specific midfield instructions",
    "attack": "specific attacking instructions"
  }
}

Return ONLY valid JSON, no markdown formatting.`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to extract JSON from the response
    let jsonData;
    try {
      const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      jsonData = JSON.parse(cleanedText);
    } catch (e) {
      return NextResponse.json({
        success: true,
        raw: text,
        error: "Failed to parse JSON response",
      });
    }

    return NextResponse.json({
      success: true,
      data: jsonData,
    });
  } catch (error: any) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze footage" },
      { status: 500 }
    );
  }
}
