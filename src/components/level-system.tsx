'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Star,
  Trophy,
  Award,
  Crown,
  Zap,
  Flame,
  Sparkles,
  Gem,
  Flag,
  Clock,
  Repeat,
  Layout,
  CheckCircle,
  Share2,
  Twitter,
  Copy,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { 
  type Badge, 
  type BadgeId, 
  type UserProfile, 
  type UserBadge,
  BADGES, 
  calculateLevel, 
  xpForLevel, 
  xpForNextLevel 
} from '@/lib/types'

interface UserStatsCardProps {
  profile: UserProfile
  badges: UserBadge[]
  onClose?: () => void
}

const badgeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  flag: Flag,
  flame: Flame,
  zap: Zap,
  star: Star,
  award: Award,
  crown: Crown,
  sparkles: Sparkles,
  gem: Gem,
  trophy: Trophy,
  'check-circle': CheckCircle,
  repeat: Repeat,
  clock: Clock,
  layout: Layout,
}

const badgeColorMap: Record<string, string> = {
  emerald: 'from-emerald-500 to-emerald-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  yellow: 'from-yellow-500 to-yellow-600',
  blue: 'from-blue-500 to-blue-600',
  violet: 'from-violet-500 to-violet-600',
  amber: 'from-amber-500 to-amber-600',
  cyan: 'from-cyan-500 to-cyan-600',
  purple: 'from-purple-500 to-purple-600',
  gold: 'from-yellow-400 to-amber-500',
  green: 'from-green-500 to-green-600',
  pink: 'from-pink-500 to-pink-600',
  slate: 'from-slate-500 to-slate-600',
  indigo: 'from-indigo-500 to-indigo-600',
}

export function UserStatsCard({ profile, badges: earnedBadges, onClose }: UserStatsCardProps) {
  const level = calculateLevel(profile.total_xp)
  const currentLevelXP = xpForLevel(level)
  const nextLevelXP = xpForNextLevel(level)
  const progressXP = profile.total_xp - currentLevelXP
  const neededXP = nextLevelXP - currentLevelXP
  const progressPercent = (progressXP / neededXP) * 100

  const earnedBadgeIds = new Set(earnedBadges.map(b => b.badge_id))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <motion.div
        initial={{ y: 20, scale: 0.95 }}
        animate={{ y: 0, scale: 1 }}
        className="relative w-full max-w-lg bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-cyan-500/5" />
        
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Your Progress</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-3xl font-bold text-white">
                {level}
              </div>
              <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-amber-500 text-xs font-bold text-black">
                LVL
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-white font-semibold">{profile.total_xp.toLocaleString()} XP</span>
                <span className="text-sm text-gray-400">{nextLevelXP.toLocaleString()} XP for next</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {progressXP} / {neededXP} XP to level {level + 1}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{profile.current_streak}</p>
              <p className="text-xs text-gray-400">Day Streak</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{profile.longest_streak}</p>
              <p className="text-xs text-gray-400">Best Streak</p>
            </div>
            <div className="p-3 rounded-xl bg-white/5 text-center">
              <Award className="w-5 h-5 text-violet-500 mx-auto mb-1" />
              <p className="text-xl font-bold text-white">{earnedBadges.length}</p>
              <p className="text-xs text-gray-400">Badges</p>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">Badges</h3>
            <div className="grid grid-cols-4 gap-2">
              {BADGES.map((badge) => {
                const earned = earnedBadgeIds.has(badge.id)
                const IconComponent = badgeIconMap[badge.icon] || Star
                
                return (
                  <motion.div
                    key={badge.id}
                    whileHover={{ scale: earned ? 1.1 : 1 }}
                    className={cn(
                      "relative p-3 rounded-xl flex flex-col items-center justify-center aspect-square transition-all",
                      earned
                        ? `bg-gradient-to-br ${badgeColorMap[badge.color]} shadow-lg`
                        : "bg-white/5 opacity-40"
                    )}
                    title={earned ? `${badge.name}: ${badge.description}` : `Locked: ${badge.requirement}`}
                  >
                    <IconComponent className={cn(
                      "w-6 h-6",
                      earned ? "text-white" : "text-gray-500"
                    )} />
                    {!earned && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                        <span className="text-lg">🔒</span>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface LevelUpCelebrationProps {
  newLevel: number
  xpGained: number
  newBadges?: Badge[]
  onClose: () => void
}

export function LevelUpCelebration({ newLevel, xpGained, newBadges = [], onClose }: LevelUpCelebrationProps) {
  const [showConfetti, setShowConfetti] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      {showConfetti && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                x: Math.random() * window.innerWidth, 
                y: -20,
                rotate: 0,
                scale: Math.random() * 0.5 + 0.5,
              }}
              animate={{ 
                y: window.innerHeight + 20,
                rotate: Math.random() * 720 - 360,
              }}
              transition={{ 
                duration: Math.random() * 2 + 2,
                delay: Math.random() * 0.5,
                ease: "linear",
              }}
              className={cn(
                "absolute w-3 h-3 rounded-full",
                ['bg-cyan-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-pink-500'][i % 5]
              )}
            />
          ))}
        </div>
      )}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative text-center p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{ 
            duration: 0.5,
            repeat: 2,
          }}
          className="w-32 h-32 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-cyan-500 flex items-center justify-center shadow-2xl shadow-violet-500/50"
        >
          <span className="text-5xl font-bold text-white">{newLevel}</span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold text-white mb-2"
        >
          Level Up!
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-xl text-gray-400 mb-4"
        >
          +{xpGained} XP earned
        </motion.p>

        {newBadges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-6"
          >
            <p className="text-sm text-gray-400 mb-2">New badges unlocked!</p>
            <div className="flex gap-2 justify-center">
              {newBadges.map((badge) => {
                const IconComponent = badgeIconMap[badge.icon] || Star
                return (
                  <div
                    key={badge.id}
                    className={cn(
                      "p-3 rounded-xl",
                      `bg-gradient-to-br ${badgeColorMap[badge.color]}`
                    )}
                    title={badge.name}
                  >
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-violet-500 to-cyan-500 text-white px-8"
          >
            Awesome!
          </Button>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

interface GoalCompleteCelebrationProps {
  goalTitle: string
  xpGained: number
  onShare?: () => void
  onClose: () => void
}

export function GoalCompleteCelebration({ goalTitle, xpGained, onClose }: GoalCompleteCelebrationProps) {
  const [copied, setCopied] = useState(false)

  const shareText = `I just completed "${goalTitle}" and earned ${xpGained} XP on LifeTree! 🌳✨`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const shareToTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`
    window.open(url, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative w-full max-w-sm bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-cyan-500/10" />
        
        <div className="relative text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.1 }}
            className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center"
          >
            <CheckCircle className="w-10 h-10 text-white" />
          </motion.div>

          <h3 className="text-2xl font-bold text-white mb-2">Goal Complete!</h3>
          <p className="text-gray-400 mb-2 line-clamp-2">{goalTitle}</p>
          <p className="text-lg font-semibold text-cyan-400 mb-6">+{xpGained} XP</p>

          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={shareToTwitter}
              className="flex-1 border-white/20"
            >
              <Twitter className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={copyToClipboard}
              className="flex-1 border-white/20"
            >
              {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
              {copied ? 'Copied!' : 'Copy'}
            </Button>
          </div>

          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
          >
            Continue
          </Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface XPIndicatorProps {
  xp: number
  level: number
  streak: number
  onClick?: () => void
}

export function XPIndicator({ xp, level, streak, onClick }: XPIndicatorProps) {
  const currentLevelXP = xpForLevel(level)
  const nextLevelXP = xpForNextLevel(level)
  const progress = ((xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
    >
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold text-white">
          {level}
        </div>
        <div className="hidden sm:block">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{xp.toLocaleString()} XP</span>
          </div>
          <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
      
      {streak > 0 && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30">
          <Flame className="w-3 h-3 text-orange-500" />
          <span className="text-xs font-medium text-orange-400">{streak}</span>
        </div>
      )}
    </motion.button>
  )
}
