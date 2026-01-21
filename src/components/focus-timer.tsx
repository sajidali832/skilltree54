'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, RotateCcw, Check, Volume2, VolumeX, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'

interface FocusTimerProps {
  nodeId: string
  nodeTitle: string
  userId: string
  onSessionComplete?: (duration: number) => void
  onClose?: () => void
}

const PRESET_TIMES = [
  { label: '15m', minutes: 15 },
  { label: '25m', minutes: 25 },
  { label: '45m', minutes: 45 },
  { label: '60m', minutes: 60 },
]

export function FocusTimer({ nodeId, nodeTitle, userId, onSessionComplete, onClose }: FocusTimerProps) {
  const supabase = createClient()
  const [selectedMinutes, setSelectedMinutes] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [showSettings, setShowSettings] = useState(true)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  useEffect(() => {
    audioRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2teleynMpO/u37BvQDhVrN/q9eCpbEMwUJfW6/Hpy5dqRjZKjc/s9vLq0KxyUUJIgsXq9fbu3Ll7YVJKebvl8/Tw47+DaV1TdLPf7/Lw47+GbGBYcazZ6u7v4L+JcWVcdKbU5Ovu372LdWpid6LP3+Xr67mMeG9me5/J2ODo6LWPfHNrf5jC0tra5LCThHh0gZG7ytHY4KuXiX17hIuywcnR3aiajYOAiImmtrjIzqWXlImLjo6draqvwJuUlZWYnJqVn6CYlpaYnJqYl5qWlJKTlZeVkpCOkJGRkI2Ki4uMi4iGhoeJiIaEg4SGhYOBgIKDg4F/foGCgYB+fX+AgH9+fX5/f359fH5+fn18fH19fXx8fH19fXx8fH19fXx8fH19fXx8fH19fXx8fH19fXx8fH19')
  }, [])

  const playSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      audioRef.current.play().catch(() => {})
    }
  }, [soundEnabled])

  const startSession = useCallback(async () => {
    const { data } = await supabase
      .from('focus_sessions')
      .insert({
        node_id: nodeId,
        user_id: userId,
        duration_minutes: selectedMinutes,
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (data) {
      setSessionId(data.id)
    }
    startTimeRef.current = new Date()
    setShowSettings(false)
    setIsRunning(true)
  }, [supabase, nodeId, userId, selectedMinutes])

  const completeSession = useCallback(async () => {
    if (!sessionId) return

    const actualMinutes = startTimeRef.current 
      ? Math.round((new Date().getTime() - startTimeRef.current.getTime()) / 60000)
      : selectedMinutes

    await supabase
      .from('focus_sessions')
      .update({
        ended_at: new Date().toISOString(),
        completed: true,
        duration_minutes: actualMinutes,
      })
      .eq('id', sessionId)

    await supabase
      .from('skill_nodes')
      .update({
        time_invested_minutes: supabase.rpc ? actualMinutes : actualMinutes,
      })
      .eq('id', nodeId)

    await supabase.rpc('increment_time_invested', {
      p_node_id: nodeId,
      p_minutes: actualMinutes,
    }).catch(() => {
      supabase
        .from('skill_nodes')
        .select('time_invested_minutes')
        .eq('id', nodeId)
        .single()
        .then(({ data }) => {
          if (data) {
            supabase
              .from('skill_nodes')
              .update({ time_invested_minutes: (data.time_invested_minutes || 0) + actualMinutes })
              .eq('id', nodeId)
          }
        })
    })

    setIsComplete(true)
    playSound()
    onSessionComplete?.(actualMinutes)
  }, [supabase, sessionId, nodeId, selectedMinutes, playSound, onSessionComplete])

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false)
      completeSession()
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRunning, timeLeft, completeSession])

  const toggleTimer = () => {
    if (!isRunning && showSettings) {
      startSession()
    } else {
      setIsRunning(!isRunning)
    }
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(selectedMinutes * 60)
    setIsComplete(false)
    setShowSettings(true)
    setSessionId(null)
    startTimeRef.current = null
  }

  const selectPreset = (minutes: number) => {
    setSelectedMinutes(minutes)
    setTimeLeft(minutes * 60)
  }

  const formatTimeDisplay = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const progress = ((selectedMinutes * 60 - timeLeft) / (selectedMinutes * 60)) * 100

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        className="relative w-full max-w-md bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-emerald-500/5" />
        
        <div className="relative p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">Focus Session</h3>
              <p className="text-sm text-gray-400 truncate max-w-[200px]">{nodeTitle}</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-gray-400 hover:text-white"
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              {!showSettings && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSettings(true)}
                  className="text-gray-400 hover:text-white"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {isComplete ? (
              <motion.div
                key="complete"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
                >
                  <Check className="w-10 h-10 text-white" />
                </motion.div>
                <h4 className="text-2xl font-bold text-white mb-2">Session Complete!</h4>
                <p className="text-gray-400 mb-6">
                  You focused for {selectedMinutes} minutes
                </p>
                <div className="flex gap-3 justify-center">
                  <Button onClick={resetTimer} variant="outline" className="border-white/20">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Session
                  </Button>
                  <Button onClick={onClose} className="bg-gradient-to-r from-cyan-500 to-emerald-500">
                    Done
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div key="timer" className="text-center">
                {showSettings && !isRunning && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mb-6"
                  >
                    <p className="text-sm text-gray-400 mb-3">Select duration</p>
                    <div className="flex gap-2 justify-center">
                      {PRESET_TIMES.map(({ label, minutes }) => (
                        <button
                          key={minutes}
                          onClick={() => selectPreset(minutes)}
                          className={cn(
                            "px-4 py-2 rounded-xl text-sm font-medium transition-all",
                            selectedMinutes === minutes
                              ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                              : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                <div className="relative w-48 h-48 mx-auto mb-6">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="8"
                    />
                    <motion.circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="url(#timerGradient)"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={553}
                      initial={{ strokeDashoffset: 553 }}
                      animate={{ strokeDashoffset: 553 - (553 * progress) / 100 }}
                      transition={{ duration: 0.5 }}
                    />
                    <defs>
                      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#06b6d4" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-5xl font-bold text-white font-mono">
                      {formatTimeDisplay(timeLeft)}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 justify-center">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={resetTimer}
                    className="w-12 h-12 rounded-full border-white/20"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={toggleTimer}
                    className={cn(
                      "w-16 h-16 rounded-full text-white shadow-lg transition-all",
                      isRunning
                        ? "bg-orange-500 hover:bg-orange-600 shadow-orange-500/30"
                        : "bg-gradient-to-r from-cyan-500 to-emerald-500 hover:shadow-cyan-500/30"
                    )}
                  >
                    {isRunning ? (
                      <Pause className="w-6 h-6" />
                    ) : (
                      <Play className="w-6 h-6 ml-1" />
                    )}
                  </Button>
                  <div className="w-12 h-12" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
