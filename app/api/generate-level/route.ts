import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: prompt,
      temperature: 0.8,
      maxTokens: 500,
    })

    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const levelData = JSON.parse(jsonMatch[0])
      return Response.json(levelData)
    }

    throw new Error("Invalid response format")
  } catch (error) {
    console.error("Error generating level:", error)
    return Response.json({ error: "Failed to generate level" }, { status: 500 })
  }
}
