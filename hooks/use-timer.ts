"use client"

import { useState, useEffect, useRef } from "react"

interface UseTimerReturn {
  time: number
  isRunning: boolean
  startTimer: () => void
  pauseTimer: () => void
  resetTimer: () => void
}

export function useTimer(): UseTimerReturn {
  const [time, setTime] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime((prevTime) => prevTime + 1)
      }, 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning])

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTime(0)
  }

  return { time, isRunning, startTimer, pauseTimer, resetTimer }
}

