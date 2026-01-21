'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Check, Calendar, TrendingUp, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import type { Habit, HabitFrequency } from '@/lib/types'

interface HabitTrackerProps {
  nodeId: string
  nodeTitle: string
  userId: string
  habit: Habit | null
  onHabitUpdate?: (habit: Habit) => void
  onClose?: () => void
}

const FREQUENCY_OPTIONS: { value: HabitFrequency; label: string; description: string }[] = [
  { value: 'daily', label: 'Daily', description: 'Every day' },
  { value: 'weekly', label: 'Weekly', description: 'Once a week' },
  { value: 'monthly', label: 'Monthly', description: 'Once a month' },
]

export function HabitTracker({ nodeId, nodeTitle, userId, habit: initialHabit, onHabitUpdate, onClose }: HabitTrackerProps) {
  const supabase = createClient()
  const [habit, setHabit] = useState<Habit | null>(initialHabit)
  const [isCreating, setIsCreating] = useState(!initialHabit)
  const [selectedFrequency, setSelectedFrequency] = useState<HabitFrequency>('daily')
  const [isCompleting, setIsCompleting] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [recentLogs, setRecentLogs] = useState<{ completed_at: string }[]>([])

  useEffect(() => {
    if (habit) {
      supabase
        .from('habit_logs')
        .select('completed_at')
        .eq('habit_id', habit.id)
        .order('completed_at', { ascending: false })
        .limit(30)
        .then(({ data }) => {
          if (data) setRecentLogs(data)
        })
    }
  }, [supabase, habit])

  const createHabit = useCallback(async () => {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        node_id: nodeId,
        user_id: userId,
        frequency: selectedFrequency,
      })
      .select()
      .single()

    if (!error && data) {
      setHabit(data as Habit)
      setIsCreating(false)
      onHabitUpdate?.(data as Habit)
    }
  }, [supabase, nodeId, userId, selectedFrequency, onHabitUpdate])

  const canCompleteToday = useCallback(() => {
    if (!habit?.last_completed_at) return true
    
    const lastCompleted = new Date(habit.last_completed_at)
    const now = new Date()
    
    if (habit.frequency === 'daily') {
      return lastCompleted.toDateString() !== now.toDateString()
    } else if (habit.frequency === 'weekly') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      return lastCompleted < weekAgo
    } else {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      return lastCompleted < monthAgo
    }
  }, [habit])

  const completeHabit = useCallback(async () => {
    if (!habit || !canCompleteToday()) return

    setIsCompleting(true)

    await supabase.from('habit_logs').insert({
      habit_id: habit.id,
    })

    const newStreak = habit.current_streak + 1
    const newLongest = Math.max(habit.longest_streak, newStreak)

    const { data, error } = await supabase
      .from('habits')
      .update({
        current_streak: newStreak,
        longest_streak: newLongest,
        last_completed_at: new Date().toISOString(),
        total_completions: habit.total_completions + 1,
      })
      .eq('id', habit.id)
      .select()
      .single()

    if (!error && data) {
      setHabit(data as Habit)
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 2000)
      onHabitUpdate?.(data as Habit)
      setRecentLogs(prev => [{ completed_at: new Date().toISOString() }, ...prev])
    }

    setIsCompleting(false)
  }, [supabase, habit, canCompleteToday, onHabitUpdate])

  const getLast7Days = () => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      days.push(date)
    }
    return days
  }

  const isCompletedOnDate = (date: Date) => {
    return recentLogs.some(log => {
      const logDate = new Date(log.completed_at)
      return logDate.toDateString() === date.toDateString()
    })
  }

  const canComplete = canCompleteToday()

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
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5" />
        
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex items-center justify-center bg-black/50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5 }}
                  className="text-6xl mb-2"
                >
                  🔥
                </motion.div>
                <p className="text-2xl font-bold text-white">Streak!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Habit Tracker</h3>
                <p className="text-sm text-gray-400 truncate max-w-[200px]">{nodeTitle}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {isCreating ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <p className="text-sm text-gray-400 mb-3">How often?</p>
                <div className="space-y-2">
                  {FREQUENCY_OPTIONS.map(({ value, label, description }) => (
                    <button
                      key={value}
                      onClick={() => setSelectedFrequency(value)}
                      className={cn(
                        "w-full p-4 rounded-xl text-left transition-all",
                        selectedFrequency === value
                          ? "bg-gradient-to-r from-orange-500/20 to-red-500/20 border-2 border-orange-500"
                          : "bg-white/5 border-2 border-transparent hover:bg-white/10"
                      )}
                    >
                      <p className="font-medium text-white">{label}</p>
                      <p className="text-sm text-gray-400">{description}</p>
                    </button>
                  ))}
                </div>
              </div>

              <Button
                onClick={createHabit}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white"
              >
                Start Tracking
              </Button>
            </motion.div>
          ) : habit ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Flame className="w-6 h-6 text-orange-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{habit.current_streak}</p>
                  <p className="text-xs text-gray-400">Current</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <TrendingUp className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{habit.longest_streak}</p>
                  <p className="text-xs text-gray-400">Best</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 text-center">
                  <Check className="w-6 h-6 text-cyan-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-white">{habit.total_completions}</p>
                  <p className="text-xs text-gray-400">Total</p>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-400">Last 7 days</p>
                </div>
                <div className="flex justify-between gap-1">
                  {getLast7Days().map((date, i) => {
                    const completed = isCompletedOnDate(date)
                    const isToday = date.toDateString() === new Date().toDateString()
                    return (
                      <div key={i} className="flex-1 text-center">
                        <div
                          className={cn(
                            "w-full aspect-square rounded-lg flex items-center justify-center mb-1 transition-all",
                            completed
                              ? "bg-gradient-to-br from-orange-500 to-red-500"
                              : isToday
                              ? "bg-white/10 border-2 border-dashed border-white/30"
                              : "bg-white/5"
                          )}
                        >
                          {completed && <Check className="w-4 h-4 text-white" />}
                        </div>
                        <p className={cn(
                          "text-xs",
                          isToday ? "text-white font-medium" : "text-gray-500"
                        )}>
                          {['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>

              <Button
                onClick={completeHabit}
                disabled={!canComplete || isCompleting}
                className={cn(
                  "w-full h-14 text-lg font-semibold transition-all",
                  canComplete
                    ? "bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-lg hover:shadow-orange-500/30"
                    : "bg-white/10 text-gray-500 cursor-not-allowed"
                )}
              >
                {isCompleting ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : canComplete ? (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Complete Today
                  </>
                ) : (
                  "Already completed!"
                )}
              </Button>

              {!canComplete && (
                <p className="text-center text-sm text-gray-400">
                  Come back {habit.frequency === 'daily' ? 'tomorrow' : habit.frequency === 'weekly' ? 'next week' : 'next month'} to keep your streak!
                </p>
              )}
            </motion.div>
          ) : null}
        </div>
      </motion.div>
    </motion.div>
  )
}
