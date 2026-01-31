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
    const teamName = formData.get("teamName") as string || "Team";
    const analysisType = formData.get("analysisType") as string || "dna";

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

    let prompt = "";

    if (analysisType === "dna") {
      prompt = `You are a tactical sports analyst. Analyze this game footage/image and extract the team's "Tactical DNA" - their unique playing style signature.

Provide a detailed analysis in JSON format with the following structure:
{
  "teamName": "${teamName}",
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

Focus on:
- Player positioning and spacing
- Movement patterns and rotations
- Ball circulation patterns
- Defensive shape and pressing triggers
- Attacking patterns and preferred areas
- Transition behavior (defense to attack, attack to defense)

Be specific and tactical. Return ONLY valid JSON, no markdown formatting.`;
    } else if (analysisType === "counter") {
      const opponentDNA = formData.get("opponentDNA") as string;
      prompt = `You are a tactical sports analyst. Based on the opponent's Tactical DNA provided below, analyze this game footage and generate specific counter-strategies.

Opponent DNA:
${opponentDNA}

Analyze this footage and provide counter-strategies in JSON format:
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
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      jsonData = JSON.parse(cleanedText);
    } catch (e) {
      // If parsing fails, return the raw text
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
