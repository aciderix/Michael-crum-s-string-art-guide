"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Toaster } from "@/components/ui/toaster"
import { useToast } from "@/hooks/use-toast"
import {
  Clock,
  RotateCcw,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  Info,
  Maximize,
  Minimize,
  Moon,
  Sun,
  Upload,
  Download,
} from "lucide-react"
import FileUploader from "@/components/file-uploader"
import StringArtCanvas from "@/components/string-art-canvas"
import InfoModal from "@/components/info-modal"
import ColorDisplay from "@/components/color-display"
import { parseStringArtFile } from "@/lib/file-parser"
import { useTimer } from "@/hooks/use-timer"
import GitHubRibbon from "@/components/github-ribbon"
import type { StringArtInstruction, StringArtProject } from "@/lib/types"

// Type for saved project data
interface SavedProjectData {
  project: StringArtProject
  currentThreadIndex: number
  currentInstructionIndex: number
  time: number
  savedAt: string
  name: string
}

export default function Home() {
  const [darkMode, setDarkMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [autoAdvance, setAutoAdvance] = useState(false)
  const [autoAdvanceSpeed, setAutoAdvanceSpeed] = useState(2000)
  const [showPreview, setShowPreview] = useState(true)
  const [currentProject, setCurrentProject] = useState<StringArtProject | null>(null)
  const [currentInstructionIndex, setCurrentInstructionIndex] = useState(0)
  const [currentThreadIndex, setCurrentThreadIndex] = useState(0)
  const [projectName, setProjectName] = useState("")
  const { toast } = useToast()
  const { time, isRunning, startTimer, pauseTimer, resetTimer } = useTimer()
  const fullscreenRef = useRef<HTMLDivElement>(null)
  const autoAdvanceIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [darkMode])

  // Handle fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  // Handle auto advance
  useEffect(() => {
    if (autoAdvance && currentProject) {
      autoAdvanceIntervalRef.current = setInterval(() => {
        handleNext()
      }, autoAdvanceSpeed)
    } else if (autoAdvanceIntervalRef.current) {
      clearInterval(autoAdvanceIntervalRef.current)
      autoAdvanceIntervalRef.current = null
    }

    return () => {
      if (autoAdvanceIntervalRef.current) {
        clearInterval(autoAdvanceIntervalRef.current)
      }
    }
  }, [autoAdvance, autoAdvanceSpeed, currentProject, currentInstructionIndex])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") {
        handleNext()
      } else if (e.key === "ArrowLeft" || e.key === "p" || e.key === "P") {
        handlePrevious()
      } else if (e.key === "s" || e.key === "S") {
        handleSaveProject()
      } else if (e.key === "l" || e.key === "L") {
        handleLoadClick()
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen()
      } else if (e.key === "Escape" && isFullscreen) {
        exitFullscreen()
      } else if (e.key === "t" || e.key === "T") {
        isRunning ? pauseTimer() : startTimer()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isRunning, isFullscreen, currentProject, currentInstructionIndex])

  const handleFileUpload = (content: string) => {
    try {
      const parsedProject = parseStringArtFile(content)
      setCurrentProject(parsedProject)
      setCurrentInstructionIndex(0)
      setCurrentThreadIndex(0)
      resetTimer()
      startTimer()
      toast({
        title: "File loaded successfully",
        description: `Loaded project with ${parsedProject.threads.length} threads and ${parsedProject.totalInstructions} total instructions.`,
      })
    } catch (error) {
      toast({
        title: "Error loading file",
        description: "The file format is invalid. Please check the file and try again.",
        variant: "destructive",
      })
    }
  }

  const handleNext = () => {
    if (!currentProject) return

    const currentThread = currentProject.threads[currentThreadIndex]
    if (currentInstructionIndex < currentThread.instructions.length - 1) {
      setCurrentInstructionIndex(currentInstructionIndex + 1)
    } else if (currentThreadIndex < currentProject.threads.length - 1) {
      setCurrentThreadIndex(currentThreadIndex + 1)
      setCurrentInstructionIndex(0)
    }
  }

  const handlePrevious = () => {
    if (!currentProject) return

    if (currentInstructionIndex > 0) {
      setCurrentInstructionIndex(currentInstructionIndex - 1)
    } else if (currentThreadIndex > 0) {
      setCurrentThreadIndex(currentThreadIndex - 1)
      const prevThread = currentProject.threads[currentThreadIndex - 1]
      setCurrentInstructionIndex(prevThread.instructions.length - 1)
    }
  }

  const handleSaveProject = () => {
    if (!currentProject || !projectName.trim()) {
      toast({
        title: "Cannot save project",
        description: "Please load a project and provide a name before saving.",
        variant: "destructive",
      })
      return
    }

    const projectToSave: SavedProjectData = {
      project: currentProject,
      currentThreadIndex,
      currentInstructionIndex,
      time,
      savedAt: new Date().toISOString(),
      name: projectName,
    }

    // Create a Blob with the project data
    const blob = new Blob([JSON.stringify(projectToSave, null, 2)], { type: "application/json" })

    // Create a download link and trigger the download
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${projectName.replace(/\s+/g, "-").toLowerCase()}-string-art.json`
    document.body.appendChild(a)
    a.click()

    // Clean up
    URL.revokeObjectURL(url)
    document.body.removeChild(a)

    toast({
      title: "Project saved",
      description: `Project "${projectName}" has been saved to a file.`,
    })
  }

  const handleLoadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleLoadProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const savedData = JSON.parse(content) as SavedProjectData

        setCurrentProject(savedData.project)
        setCurrentThreadIndex(savedData.currentThreadIndex)
        setCurrentInstructionIndex(savedData.currentInstructionIndex)
        setProjectName(savedData.name)

        // Reset the timer and set it to the saved time
        resetTimer()
        // We can't directly set the time, so we'll just display it in a toast

        toast({
          title: "Project loaded",
          description: `Project "${savedData.name}" has been loaded successfully. Previous work time: ${formatTime(savedData.time)}`,
        })
      } catch (error) {
        toast({
          title: "Error loading project",
          description: "The file format is invalid. Please check the file and try again.",
          variant: "destructive",
        })
      }
    }
    reader.readAsText(file)

    // Reset the file input so the same file can be loaded again
    if (event.target) {
      event.target.value = ""
    }
  }

  const handleReset = () => {
    setCurrentInstructionIndex(0)
    setCurrentThreadIndex(0)
    resetTimer()
    toast({
      title: "Project reset",
      description: "Progress has been reset to the beginning.",
    })
  }

  const toggleFullscreen = () => {
    if (!isFullscreen && fullscreenRef.current) {
      fullscreenRef.current.requestFullscreen()
    } else {
      exitFullscreen()
    }
  }

  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    }
  }

  const getCurrentInstruction = (): StringArtInstruction | null => {
    if (!currentProject) return null

    const thread = currentProject.threads[currentThreadIndex]
    if (!thread) return null

    return thread.instructions[currentInstructionIndex] || null
  }

  const getProgressPercentage = (): number => {
    if (!currentProject) return 0

    let completedInstructions = 0
    for (let i = 0; i < currentThreadIndex; i++) {
      completedInstructions += currentProject.threads[i].instructions.length
    }
    completedInstructions += currentInstructionIndex

    return Math.round((completedInstructions / currentProject.totalInstructions) * 100)
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const currentInstruction = getCurrentInstruction()
  const currentThread = currentProject?.threads[currentThreadIndex]
  const progressPercentage = getProgressPercentage()

  return (
    <div
      className={`min-h-screen bg-background text-foreground transition-colors duration-200 ${darkMode ? "dark" : ""}`}
    >
      <GitHubRibbon />
      <div ref={fullscreenRef} className="container mx-auto p-4 max-w-7xl">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">String Art Guide</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setShowInfoModal(true)}>
              <Info className="h-5 w-5" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => setDarkMode(!darkMode)}>
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </header>

        {!currentProject ? (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <h2 className="text-2xl font-semibold mb-4">Welcome to String Art Guide</h2>
                <p className="mb-6 text-muted-foreground">
                  Upload a string art instruction file to get started. The file should contain the sequence of nail
                  numbers to connect.
                </p>
                <FileUploader onFileLoaded={handleFileUpload} />

                <div className="mt-8">
                  <p className="mb-4 text-muted-foreground">Or load a previously saved project:</p>
                  <Button onClick={handleLoadClick} className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Load Saved Project
                  </Button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleLoadProject}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Thread Colors Summary - only visible when not in fullscreen */}
            {!isFullscreen && (
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <h2 className="text-xl font-semibold mb-4">Required Thread Colors</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {(() => {
                      // Group threads by color
                      const colorMap = new Map()

                      currentProject.threads.forEach((thread, index) => {
                        const colorKey = thread.color.join(",")
                        if (!colorMap.has(colorKey)) {
                          colorMap.set(colorKey, {
                            color: thread.color,
                            connectionCount: 0,
                            threadIndices: [],
                          })
                        }

                        const colorData = colorMap.get(colorKey)
                        colorData.connectionCount += thread.instructions.length
                        colorData.threadIndices.push(index + 1)
                      })

                      return Array.from(colorMap.values()).map((colorData, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 border rounded-md">
                          <ColorDisplay color={colorData.color} className="w-8 h-8 rounded-full flex-shrink-0" />
                          <div>
                            <div className="font-medium">{colorData.color.join(", ")}</div>
                            <div className="text-xs text-muted-foreground">{colorData.connectionCount} connections</div>
                            {colorData.threadIndices.length > 1 && (
                              <div className="text-xs text-muted-foreground">
                                Used in threads: {colorData.threadIndices.join(", ")}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    })()}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Main content layout */}
            <div className={`grid ${isFullscreen ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"} gap-6`}>
              {/* Left sidebar - only visible when not in fullscreen */}
              {!isFullscreen && (
                <div className="col-span-1">
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Project Controls</h2>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="project-name">Project Name</Label>
                          <div className="flex-1 ml-4">
                            <Input
                              id="project-name"
                              value={projectName}
                              onChange={(e) => setProjectName(e.target.value)}
                              placeholder="My String Art Project"
                            />
                          </div>
                        </div>

                        <div className="flex justify-between gap-2">
                          <Button onClick={handleSaveProject} className="flex-1 flex items-center justify-center">
                            <Download className="mr-2 h-4 w-4" /> Save to File
                          </Button>
                          <Button onClick={handleReset} variant="outline" className="flex-1">
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset
                          </Button>
                        </div>

                        <div className="pt-2">
                          <Button
                            onClick={handleLoadClick}
                            variant="outline"
                            className="w-full flex items-center justify-center"
                          >
                            <Upload className="mr-2 h-4 w-4" /> Load from File
                          </Button>
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleLoadProject}
                            accept=".json"
                            className="hidden"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Settings</h2>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="auto-advance">Auto Advance</Label>
                          <Switch id="auto-advance" checked={autoAdvance} onCheckedChange={setAutoAdvance} />
                        </div>

                        {autoAdvance && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="advance-speed">Speed (seconds)</Label>
                              <span className="text-sm">{autoAdvanceSpeed / 1000}s</span>
                            </div>
                            <Slider
                              id="advance-speed"
                              min={500}
                              max={5000}
                              step={100}
                              value={[autoAdvanceSpeed]}
                              onValueChange={(value) => setAutoAdvanceSpeed(value[0])}
                            />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-preview">Show Preview</Label>
                          <Switch id="show-preview" checked={showPreview} onCheckedChange={setShowPreview} />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4" />
                            <Label>Timer</Label>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{formatTime(time)}</span>
                            <Button size="icon" variant="outline" onClick={isRunning ? pauseTimer : startTimer}>
                              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-2">Keyboard Shortcuts</h2>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          Next: <kbd className="px-1 bg-muted rounded">→</kbd> or{" "}
                          <kbd className="px-1 bg-muted rounded">N</kbd>
                        </div>
                        <div>
                          Previous: <kbd className="px-1 bg-muted rounded">←</kbd> or{" "}
                          <kbd className="px-1 bg-muted rounded">P</kbd>
                        </div>
                        <div>
                          Save: <kbd className="px-1 bg-muted rounded">S</kbd>
                        </div>
                        <div>
                          Load: <kbd className="px-1 bg-muted rounded">L</kbd>
                        </div>
                        <div>
                          Fullscreen: <kbd className="px-1 bg-muted rounded">F</kbd>
                        </div>
                        <div>
                          Timer: <kbd className="px-1 bg-muted rounded">T</kbd>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Main content area */}
              <div className={`${isFullscreen ? "col-span-1" : "col-span-1 lg:col-span-2"}`}>
                <Card className="mb-6">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Current Instruction</h2>
                      <Button variant="outline" size="icon" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
                      </Button>
                    </div>

                    {currentThread && currentInstruction && (
                      <div className="space-y-6">
                        <div className="flex flex-col md:flex-row gap-4 items-center">
                          <ColorDisplay color={currentThread.color} className="w-20 h-20 rounded-full" />
                          <div className="flex-1">
                            <h3 className="text-lg font-medium mb-1">Thread Color</h3>
                            <div className="flex items-center gap-2">
                              <div className="px-3 py-1 bg-muted rounded-md font-mono text-sm">
                                RGB: {currentThread.color.join(", ")}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Thread {currentThreadIndex + 1} of {currentProject.threads.length}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="bg-muted p-4 rounded-lg">
                          <div className="text-center">
                            <h3 className="text-lg font-medium mb-2">Connect to Nail</h3>
                            <div className="text-5xl font-bold my-4">{currentInstruction.nailNumber}</div>
                            <div className="text-sm text-muted-foreground">
                              Instruction {currentInstructionIndex + 1} of {currentThread.instructions.length}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button
                            variant="outline"
                            onClick={handlePrevious}
                            disabled={currentThreadIndex === 0 && currentInstructionIndex === 0}
                          >
                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                          </Button>
                          <Button
                            onClick={handleNext}
                            disabled={
                              currentThreadIndex === currentProject.threads.length - 1 &&
                              currentInstructionIndex === currentThread.instructions.length - 1
                            }
                          >
                            Next <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Progress</span>
                            <span>{progressPercentage}%</span>
                          </div>
                          <Progress value={progressPercentage} className="h-2" />
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {showPreview && (
                  <Card>
                    <CardContent className="pt-6">
                      <h2 className="text-xl font-semibold mb-4">Preview</h2>
                      <div className="aspect-square w-full max-w-xl mx-auto">
                        <StringArtCanvas
                          project={currentProject}
                          currentThreadIndex={currentThreadIndex}
                          currentInstructionIndex={currentInstructionIndex}
                        />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      <InfoModal open={showInfoModal} onClose={() => setShowInfoModal(false)} />
      <Toaster />
    </div>
  )
}

