"use client"

interface ColorDisplayProps {
  color: number[]
  className?: string
}

export default function ColorDisplay({ color, className = "" }: ColorDisplayProps) {
  const [r, g, b] = color
  const colorStyle = {
    backgroundColor: `rgb(${r}, ${g}, ${b})`,
    border: isDarkColor(r, g, b) ? "1px solid rgba(255, 255, 255, 0.2)" : "1px solid rgba(0, 0, 0, 0.1)",
  }

  // Helper function to determine if a color is dark
  function isDarkColor(r: number, g: number, b: number): boolean {
    // Calculate perceived brightness using the formula
    // (0.299*R + 0.587*G + 0.114*B)
    const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return brightness < 0.5
  }

  return <div className={className} style={colorStyle} />
}

