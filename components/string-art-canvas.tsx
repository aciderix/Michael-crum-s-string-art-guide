"use client"

import { useEffect, useRef } from "react"
import type { StringArtProject } from "@/lib/types"

interface StringArtCanvasProps {
  project: StringArtProject | null
  currentThreadIndex: number
  currentInstructionIndex: number
}

export default function StringArtCanvas({
  project,
  currentThreadIndex,
  currentInstructionIndex,
}: StringArtCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!project || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const size = Math.min(canvas.clientWidth, canvas.clientHeight)
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Calculate center and radius
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = (canvas.width / 2) * 0.9

    // Draw background
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--background").trim() || "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Find the maximum nail number to determine total nails
    let maxNailNumber = 0
    project.threads.forEach((thread) => {
      thread.instructions.forEach((instruction) => {
        maxNailNumber = Math.max(maxNailNumber, instruction.nailNumber)
      })
    })

    // Draw nails
    const totalNails = maxNailNumber + 1 // +1 because nail numbers might be zero-indexed
    for (let i = 0; i < totalNails; i++) {
      const angle = (i / totalNails) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      // Draw nail
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fillStyle = "#888888"
      ctx.fill()

      // Draw nail number
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--foreground").trim() || "#000000"
      ctx.font = "10px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      // Position the text slightly away from the nail
      const textX = centerX + Math.cos(angle) * (radius + 10)
      const textY = centerY + Math.sin(angle) * (radius + 10)
      ctx.fillText(i.toString(), textX, textY)
    }

    // Draw threads
    for (let t = 0; t <= currentThreadIndex; t++) {
      const thread = project.threads[t]
      const maxInstructionIndex = t === currentThreadIndex ? currentInstructionIndex : thread.instructions.length - 1

      if (maxInstructionIndex < 0) continue

      // Set thread color
      const [r, g, b] = thread.color
      ctx.strokeStyle = `rgb(${r}, ${g}, ${b})`
      ctx.lineWidth = 1

      // Draw connections
      for (let i = 0; i < maxInstructionIndex; i++) {
        const fromNail = thread.instructions[i].nailNumber
        const toNail = thread.instructions[i + 1].nailNumber

        const fromAngle = (fromNail / totalNails) * Math.PI * 2
        const toAngle = (toNail / totalNails) * Math.PI * 2

        const fromX = centerX + Math.cos(fromAngle) * radius
        const fromY = centerY + Math.sin(fromAngle) * radius
        const toX = centerX + Math.cos(toAngle) * radius
        const toY = centerY + Math.sin(toAngle) * radius

        ctx.beginPath()
        ctx.moveTo(fromX, fromY)
        ctx.lineTo(toX, toY)
        ctx.stroke()
      }
    }

    // Highlight current nail
    if (
      project.threads[currentThreadIndex] &&
      project.threads[currentThreadIndex].instructions[currentInstructionIndex]
    ) {
      const currentNail = project.threads[currentThreadIndex].instructions[currentInstructionIndex].nailNumber
      const angle = (currentNail / totalNails) * Math.PI * 2
      const x = centerX + Math.cos(angle) * radius
      const y = centerY + Math.sin(angle) * radius

      ctx.beginPath()
      ctx.arc(x, y, 6, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 0, 0, 0.7)"
      ctx.fill()
    }
  }, [project, currentThreadIndex, currentInstructionIndex])

  return <canvas ref={canvasRef} className="w-full h-full border rounded-lg" />
}

