"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { levels, getDynamicLevelPrompt } from "@/lib/levels"
import type { Level, GameState } from "@/app/types"
import { validateCommandWithAI, processConsoleOutput, generateConsolePrompt } from "@/lib/game-utils"

export default function LevelPage() {
  const params = useParams()
  const router = useRouter()
  const levelId = Number.parseInt(params.id as string)

  const [level, setLevel] = useState<Level | null>(null)
  const [command, setCommand] = useState("")
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])
  const [isCompleted, setIsCompleted] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [showSolution, setShowSolution] = useState(false)
  const [usedHint, setUsedHint] = useState(false)
  const [usedSolution, setUsedSolution] = useState(false)
  const [gameState, setGameState] = useState<GameState>({ currentLevel: levelId, completedLevels: [], score: 0 })
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const [validating, setValidating] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("gameState")
    if (saved) {
      setGameState(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    setCommand("")
    setConsoleOutput([])
    setIsCompleted(false)
    setShowHint(false)
    setShowSolution(false)
    setUsedHint(false)
    setUsedSolution(false)
    setLoading(true)

    const loadLevel = async () => {
      if (levelId <= 10) {
        setLevel(levels[levelId - 1])
        setLoading(false)
      } else if (levelId === 11) {
        try {
          const response = await fetch("/api/generate-level", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: getDynamicLevelPrompt() }),
          })

          if (response.ok) {
            const data = await response.json()
            setLevel({
              id: 11,
              ...data,
            })
          } else {
            setLevel({
              id: 11,
              title: "API Security - Rate Limiting Bypass",
              vulnerability:
                "Improper rate limiting allows attackers to bypass API protections through request manipulation.",
              tool: "rate-limit-bypass",
              description:
                "API endpoints without proper rate limiting can be exploited for credential stuffing, DDoS amplification, or resource exhaustion.",
              expectedCommand: "rate-limit-bypass --endpoint=/api/auth --threads=1000 --delay=0ms --header-rotation",
              hint: "Try removing rate limit headers or using different IP addresses",
            })
          }
        } catch (error) {
          console.error("Error generating level:", error)
          setLevel({
            id: 11,
            title: "API Security - Rate Limiting Bypass",
            vulnerability:
              "Improper rate limiting allows attackers to bypass API protections through request manipulation.",
            tool: "rate-limit-bypass",
            description:
              "API endpoints without proper rate limiting can be exploited for credential stuffing, DDoS amplification, or resource exhaustion.",
            expectedCommand: "rate-limit-bypass --endpoint=/api/auth --threads=1000 --delay=0ms --header-rotation",
            hint: "Try removing rate limit headers or using different IP addresses",
          })
        }
        setLoading(false)
      }
    }

    loadLevel()
  }, [levelId])

  const handleSubmitCommand = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!level || !command.trim() || validating) return

    setValidating(true)

    try {
      const isCorrect = await validateCommandWithAI(command, level)
      const output = processConsoleOutput(command, isCorrect, level)

      setConsoleOutput((prev) => [...prev, ...output])
      setCommand("")

      if (isCorrect) {
        setIsCompleted(true)

        if (!gameState.completedLevels.includes(levelId)) {
          const newCompletedLevels = [...gameState.completedLevels, levelId]
          let newScore = gameState.score + 100

          if (usedHint) {
            newScore -= 15
          }
          if (usedSolution) {
            newScore -= 40
          }

          const updatedState = {
            ...gameState,
            completedLevels: newCompletedLevels,
            score: newScore,
          }

          setGameState(updatedState)
          localStorage.setItem("gameState", JSON.stringify(updatedState))
        }
      }
    } finally {
      setValidating(false)
    }
  }

  const handleResetLevel = () => {
    setCommand("")
    setConsoleOutput([])
    setIsCompleted(false)
    setShowHint(false)
    setShowSolution(false)
    setUsedHint(false)
    setUsedSolution(false)
  }

  const handleShowHint = () => {
    if (!usedHint && level) {
      setShowHint(true)
      setUsedHint(true)
    }
  }

  const handleShowSolution = () => {
    if (!usedSolution && level) {
      setShowSolution(true)
      setUsedSolution(true)
    }
  }

  if (!mounted || loading || !level) {
    return (
      <main className="min-h-screen terminal-bg flex items-center justify-center">
        <div className="text-center">
          <p className="retro-title text-2xl mb-4">LOADING LEVEL...</p>
          <p className="terminal-text animate-pulse">Initializing neural interface...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen terminal-bg py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-3 gap-4 mb-8 items-center">
          <Link href="/">
            <button className="terminal-button text-sm justify-self-start">← MENU</button>
          </Link>
          <div className="terminal-text-cyan font-bold text-center text-lg">LEVEL {level.id} / 11</div>
          <div className="justify-self-end">
            <span className="terminal-text-yellow">Score: {gameState.score}</span>
          </div>
        </div>

        <div className="retro-panel mb-8">
          <div className="mb-4">
            <p className="terminal-text-cyan mb-2 font-bold text-lg">&gt; {level.title.toUpperCase()}</p>
            <p className="terminal-text-magenta mb-4 text-sm">
              VULNERABILITY CLASS: {level.vulnerability.split(" ")[0].toUpperCase()}
            </p>
            <div className="border-t border-retro-green pt-4">
              <p className="terminal-text text-sm leading-relaxed mb-4">{level.description}</p>
            </div>
          </div>

          <div className="bg-retro-dark-green border-2 border-retro-cyan p-3 mt-4">
            <p className="terminal-text-cyan font-bold mb-2">AVAILABLE TOOL</p>
            <p className="terminal-text font-bold text-lg mb-1">{level.tool}</p>
            <p className="terminal-text text-xs opacity-75">This tool is available for exploitation on this level</p>
          </div>
        </div>

        <div className="mb-8">
          <p className="terminal-text-cyan text-sm mb-2 font-bold">CONSOLE OUTPUT</p>
          <div className="console-output">
            <div className="terminal-text-cyan mb-3">
              {generateConsolePrompt(level.tool)} Connected to Level {level.id}
            </div>
            {consoleOutput.length === 0 && (
              <div className="terminal-text text-xs opacity-50">[Ready for commands...]</div>
            )}
            {consoleOutput.map((line, idx) => (
              <div
                key={idx}
                className={`console-line ${
                  line.includes("✓") || line.includes("[+]")
                    ? "console-line-success"
                    : line.includes("[!]") || line.includes("Error")
                      ? "console-line-error"
                      : line.startsWith(">")
                        ? "console-line-prompt"
                        : ""
                }`}
              >
                {line}
              </div>
            ))}
          </div>
        </div>

        {!isCompleted && (
          <form onSubmit={handleSubmitCommand} className="mb-8">
            <p className="terminal-text-cyan text-sm mb-2 font-bold">COMMAND INPUT</p>
            <div className="relative">
              <textarea
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder={`${level.tool}> Enter command here...`}
                className="terminal-input-console"
                autoFocus
                disabled={validating}
              />
              <button
                type="submit"
                disabled={validating || !command.trim()}
                className="terminal-button absolute bottom-4 right-4"
              >
                {validating ? "VALIDATING..." : "EXECUTE"}
              </button>
            </div>
          </form>
        )}

        {isCompleted && (
          <div className="retro-panel retro-panel-cyan mb-8 p-4 text-center achievement-popup">
            <p className="terminal-text-cyan font-bold text-lg mb-2">✓ LEVEL COMPLETED!</p>
            <p className="terminal-text text-sm mb-4">You have successfully exploited this vulnerability.</p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/">
                <button className="terminal-button text-sm">BACK TO LEVELS</button>
              </Link>
              {levelId < 11 && (
                <Link href={`/level/${levelId + 1}`}>
                  <button className="terminal-button text-sm">NEXT LEVEL →</button>
                </Link>
              )}
            </div>
          </div>
        )}

        {showHint && (
          <div className="retro-panel retro-panel-cyan mb-8 p-4">
            <p className="terminal-text-cyan font-bold mb-2">HINT:</p>
            <p className="terminal-text text-sm">{level.hint}</p>
            {usedHint && <p className="terminal-text-magenta text-xs mt-2">[-] Hint used: -15 points</p>}
          </div>
        )}

        {showSolution && (
          <div className="retro-panel retro-panel-magenta mb-8 p-4">
            <p className="terminal-text-magenta font-bold mb-2">SOLUTION:</p>
            <div className="bg-black bg-opacity-50 border border-retro-magenta p-3 rounded mb-2">
              <p className="terminal-text font-mono text-sm break-all">{level.expectedCommand}</p>
            </div>
            <p className="terminal-text-red text-xs mt-2">[-] Solution revealed: -40 points</p>
          </div>
        )}

        <div className="mb-8 flex flex-wrap gap-3 justify-center">
          <button onClick={handleShowHint} disabled={showHint || isCompleted || usedHint} className="terminal-button">
            HINT
          </button>
          <button
            onClick={handleShowSolution}
            disabled={showSolution || isCompleted || usedSolution}
            className="terminal-button"
          >
            SOLUTION
          </button>
          <button onClick={handleResetLevel} className="terminal-button">
            RESET
          </button>
          <Link href="/">
            <button className="terminal-button">MENU</button>
          </Link>
        </div>
      </div>
    </main>
  )
}
