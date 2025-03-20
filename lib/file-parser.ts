import type { StringArtProject, StringArtThread } from "./types"

export function parseStringArtFile(content: string): StringArtProject {
  const lines = content.split("\n").filter((line) => line.trim() !== "")
  const threads: StringArtThread[] = []

  let currentThread: StringArtThread | null = null
  let totalInstructions = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Check if this is a thread color definition
    if (line.startsWith("Thread:")) {
      // If we already have a thread, add it to our list
      if (currentThread) {
        threads.push(currentThread)
      }

      // Parse the RGB color values
      const colorMatch = line.match(/\[(\d+),\s*(\d+),\s*(\d+)\]/)
      if (!colorMatch) {
        throw new Error(`Invalid color format at line ${i + 1}: ${line}`)
      }

      const color = [
        Number.parseInt(colorMatch[1], 10),
        Number.parseInt(colorMatch[2], 10),
        Number.parseInt(colorMatch[3], 10),
      ]

      // Create a new thread
      currentThread = {
        color,
        instructions: [],
      }
    }
    // Otherwise, this should be a nail number
    else if (currentThread) {
      const nailNumber = Number.parseInt(line, 10)
      if (isNaN(nailNumber)) {
        // Skip lines that aren't numbers
        continue
      }

      currentThread.instructions.push({
        nailNumber,
      })

      totalInstructions++
    }
  }

  // Add the last thread if it exists
  if (currentThread) {
    threads.push(currentThread)
  }

  if (threads.length === 0) {
    throw new Error("No valid thread instructions found in the file")
  }

  return {
    threads,
    totalInstructions,
  }
}

