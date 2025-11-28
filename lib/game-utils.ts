import type { Level } from "@/app/types"

export async function validateCommandWithAI(userCommand: string, level: Level): Promise<boolean> {
  try {
    const { generateText } = await import("ai")
    const { openai } = await import("@ai-sdk/openai")

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `You are a cybersecurity challenge validator. The player is attempting to exploit a vulnerability.

Expected command pattern: ${level.expectedCommand}
User's command: ${userCommand}

Evaluate if the user's command is attempting to exploit the "${level.title}" vulnerability correctly.
Be lenient with syntax variations, parameter ordering, and minor differences, but the core exploit technique must be correct.

Respond with ONLY "CORRECT" or "INCORRECT" (nothing else).`,
      temperature: 0.3,
      maxTokens: 10,
    })

    return text.trim().toUpperCase() === "CORRECT"
  } catch (error) {
    console.error("AI validation error:", error)
    // Fallback to simple validation if AI fails
    return validateCommand(userCommand, level.expectedCommand)
  }
}

export function validateCommand(userCommand: string, expectedCommand: string): boolean {
  const normalize = (cmd: string) => cmd.trim().toLowerCase().replace(/\s+/g, " ")
  return normalize(userCommand) === normalize(expectedCommand)
}

export function processConsoleOutput(command: string, isCorrect: boolean, level: Level): string[] {
  const lines: string[] = []
  lines.push(`> ${command}`)

  if (isCorrect) {
    lines.push("")
    lines.push(`✓ EXPLOIT SUCCESSFUL!`)
    lines.push(`[+] Vulnerability exploited: ${level.vulnerability.split(" ")[0]}`)
    lines.push(`[+] Access granted to: ${level.title}`)
    lines.push(`[+] Level complete!`)
    lines.push("")
    return lines
  }

  // Wrong command responses
  const responses = [
    `Error: Command not recognized`,
    `[!] Access denied - insufficient privileges`,
    `[!] Target not vulnerable with this command`,
    `[-] Exploit failed - try a different approach`,
    `Error: Invalid parameters for this tool`,
  ]

  const randomResponse = responses[Math.floor(Math.random() * responses.length)]
  lines.push(randomResponse)
  lines.push(`Hint: Try the hint button for guidance`)
  lines.push("")

  return lines
}

export function generateConsolePrompt(tool: string): string {
  return `${tool}> `
}

export const GAME_PROGRESSION = {
  LEVEL_UNLOCK_POINTS: 100,
  HINT_PENALTY: 10,
  FIRST_TRY_BONUS: 50,
}
