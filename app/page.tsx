"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { levels } from "@/lib/levels"
import { Footer } from "@/components/footer"
import type { GameState } from "@/app/types"

export default function Home() {
  const [gameState, setGameState] = useState<GameState>({ currentLevel: 1, completedLevels: [], score: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("gameState")
    if (saved) {
      setGameState(JSON.parse(saved))
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem("gameState", JSON.stringify(gameState))
    }
  }, [gameState, mounted])

  if (!mounted) return null

  const progress = (gameState.completedLevels.length / (levels.length + 1)) * 100

  return (
    <main className="min-h-screen terminal-bg flex flex-col items-center justify-center p-4">
      {/* Scanlines overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-20">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl w-full">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="retro-title mb-2 text-4xl">OWASP TERMINAL</h1>
          <p className="terminal-text-cyan text-xl mb-2 tracking-widest">[ CYBERSECURITY TRAINING SIMULATOR ]</p>
          <p className="terminal-text text-sm">&gt;&gt;&gt; SECURITY LEVEL CRITICAL &lt;&lt;&lt;</p>
        </div>

        {/* Stats Panel */}
        <div className="retro-panel mb-8">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <p className="terminal-text-cyan text-sm mb-1">SCORE</p>
              <p className="terminal-text text-2xl font-bold">{gameState.score}</p>
            </div>
            <div className="text-center">
              <p className="terminal-text-cyan text-sm mb-1">LEVELS</p>
              <p className="terminal-text text-2xl font-bold">
                {gameState.completedLevels.length}/{levels.length + 1}
              </p>
            </div>
            <div className="text-center">
              <p className="terminal-text-cyan text-sm mb-1">PROGRESS</p>
              <p className="terminal-text text-2xl font-bold">{Math.round(progress)}%</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Levels Grid */}
        <div className="mb-8">
          <p className="terminal-text mb-4 text-center tracking-widest">
            &gt;&gt;&gt; AVAILABLE SECURITY LEVELS &lt;&lt;&lt;
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {levels.map((level) => (
              <Link key={level.id} href={`/level/${level.id}`}>
                <div
                  className={`retro-level-box p-4 text-center transition-all ${
                    gameState.completedLevels.includes(level.id) ? "border-retro-cyan" : ""
                  }`}
                >
                  <p className="terminal-text-cyan text-sm mb-2">[LEVEL {level.id}]</p>
                  <p className="terminal-text font-bold mb-2">{level.title}</p>
                  {gameState.completedLevels.includes(level.id) && (
                    <p className="terminal-text-cyan text-xs">✓ COMPLETED</p>
                  )}
                </div>
              </Link>
            ))}

            {/* Level 11 - AI Generated */}
            <Link href="/level/11">
              <div
                className={`retro-level-box p-4 text-center transition-all border-retro-magenta ${
                  gameState.completedLevels.includes(11) ? "border-retro-cyan" : ""
                }`}
              >
                <p className="terminal-text-magenta text-sm mb-2">[LEVEL 11]</p>
                <p className="terminal-text font-bold mb-2">DYNAMIC CHALLENGE</p>
                <p className="terminal-text-magenta text-xs">AI GENERATED</p>
                {gameState.completedLevels.includes(11) && <p className="terminal-text-cyan text-xs">✓ COMPLETED</p>}
              </div>
            </Link>
          </div>
        </div>

        {/* Instructions */}
        <div className="retro-panel retro-panel-cyan p-6 text-center">
          <p className="terminal-text-cyan mb-2 font-bold">SYSTEM MESSAGE</p>
          <p className="terminal-text text-sm">
            Complete all levels to master OWASP Top 10 vulnerabilities. Each level teaches a critical security flaw and
            how to exploit it responsibly.
          </p>
        </div>

        {/* Footer */}
        <Footer />
      </div>
    </main>
  )
}
