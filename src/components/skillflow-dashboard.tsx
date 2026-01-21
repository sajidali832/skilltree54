'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import type { SkillTree, SkillNode } from '@/lib/types'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Logo } from '@/components/logo'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Plus, 
  Target, 
  Briefcase,
  Heart,
  BookOpen,
  Wallet,
  User,
  Sparkles,
  MoreVertical,
  Trash2,
  Edit3,
  ArrowRight,
  Zap,
  Globe,
  Rocket,
  Star,
  Coffee,
  Music,
  Code,
  Dumbbell,
  Palette,
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SkillFlowDashboardProps {
  skillFlows: (SkillTree & { nodeCount: number; completedCount: number })[]
  onSelectFlow: (flow: SkillTree) => void
  userId?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  briefcase: Briefcase,
  heart: Heart,
  'book-open': BookOpen,
  wallet: Wallet,
  user: User,
  sparkles: Sparkles,
  zap: Zap,
  globe: Globe,
  rocket: Rocket,
  star: Star,
  coffee: Coffee,
  music: Music,
  code: Code,
  dumbbell: Dumbbell,
  palette: Palette,
}

const colorMap: Record<string, { bg: string; border: string; text: string; glow: string }> = {
  cyan: { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/50', text: 'text-cyan-400', glow: 'shadow-cyan-500/20' },
  emerald: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/50', text: 'text-emerald-400', glow: 'shadow-emerald-500/20' },
  violet: { bg: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/50', text: 'text-violet-400', glow: 'shadow-violet-500/20' },
  amber: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/50', text: 'text-amber-400', glow: 'shadow-amber-500/20' },
  rose: { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/50', text: 'text-rose-400', glow: 'shadow-rose-500/20' },
  blue: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/50', text: 'text-blue-400', glow: 'shadow-blue-500/20' },
}

const availableIcons = [
  { id: 'target', icon: Target, label: 'Target' },
  { id: 'briefcase', icon: Briefcase, label: 'Career' },
  { id: 'heart', icon: Heart, label: 'Health' },
  { id: 'book-open', icon: BookOpen, label: 'Learning' },
  { id: 'wallet', icon: Wallet, label: 'Finance' },
  { id: 'user', icon: User, label: 'Personal' },
  { id: 'rocket', icon: Rocket, label: 'Startup' },
  { id: 'code', icon: Code, label: 'Coding' },
  { id: 'dumbbell', icon: Dumbbell, label: 'Fitness' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'palette', icon: Palette, label: 'Art' },
  { id: 'globe', icon: Globe, label: 'Travel' },
]

const availableColors = [
  { id: 'cyan', label: 'Cyan' },
  { id: 'emerald', label: 'Emerald' },
  { id: 'violet', label: 'Violet' },
  { id: 'amber', label: 'Amber' },
  { id: 'rose', label: 'Rose' },
  { id: 'blue', label: 'Blue' },
]

export function SkillFlowDashboard({ skillFlows: initialFlows, onSelectFlow, userId }: SkillFlowDashboardProps) {
  const supabase = createClient()
  const [skillFlows, setSkillFlows] = useState(initialFlows)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newFlowName, setNewFlowName] = useState('')
  const [newFlowDescription, setNewFlowDescription] = useState('')
  const [newFlowIcon, setNewFlowIcon] = useState('target')
  const [newFlowColor, setNewFlowColor] = useState('cyan')
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [selectedFlow, setSelectedFlow] = useState<SkillTree | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleCreateFlow = useCallback(async () => {
    if (!newFlowName.trim()) return

    const currentUserId = userId || skillFlows[0]?.user_id || ''
    
    const { data, error } = await supabase
      .from('skill_trees')
      .insert({
        user_id: currentUserId,
        name: newFlowName,
        description: newFlowDescription || null,
        icon: newFlowIcon,
        color: newFlowColor,
      })
      .select()
      .single()

    if (!error && data) {
      const newTree = data as SkillTree
      await supabase.from('skill_nodes').insert({
        tree_id: newTree.id,
        title: newFlowName,
        status: 'available',
        is_root: true,
        position_x: 400,
        position_y: 100,
        category: 'personal',
        priority: 'medium',
      })
      
      setSkillFlows(prev => [...prev, { ...newTree, nodeCount: 1, completedCount: 0 }])
      setNewFlowName('')
      setNewFlowDescription('')
      setNewFlowIcon('target')
      setNewFlowColor('cyan')
      setIsCreateOpen(false)
    }
  }, [supabase, newFlowName, newFlowDescription, newFlowIcon, newFlowColor, skillFlows])

  const handleDeleteFlow = useCallback(async (flowId: string) => {
    await supabase.from('skill_edges').delete().eq('tree_id', flowId)
    await supabase.from('skill_nodes').delete().eq('tree_id', flowId)
    await supabase.from('skill_trees').delete().eq('id', flowId)
    setSkillFlows(prev => prev.filter(f => f.id !== flowId))
  }, [supabase])

  const handleFlowClick = (flow: SkillTree) => {
    setSelectedFlow(flow)
    setIsAnimating(true)
  }

  return (
    <>
      <AnimatePresence>
        {isAnimating && selectedFlow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background"
            onAnimationComplete={() => {
              if (isAnimating) {
                onSelectFlow(selectedFlow)
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.3, opacity: 0, y: 100 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 25,
                duration: 0.5 
              }}
              className="h-full w-full flex items-center justify-center"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className={cn(
                    "w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center",
                    "bg-gradient-to-br",
                    colorMap[selectedFlow.color || 'cyan'].bg,
                    "border-2",
                    colorMap[selectedFlow.color || 'cyan'].border
                  )}
                >
                  {(() => {
                    const IconComponent = iconMap[selectedFlow.icon || 'target'] || Target
                    return <IconComponent className={cn("w-12 h-12", colorMap[selectedFlow.color || 'cyan'].text)} />
                  })()}
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl font-bold text-foreground"
                >
                  {selectedFlow.name}
                </motion.h2>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 flex items-center justify-center gap-2 text-muted-foreground"
                >
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  Loading your SkillFlow...
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-cyan-50 dark:from-[#0a0f1a] dark:via-[#0d1321] dark:to-[#0a1628] relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-400/10 dark:bg-cyan-500/5 rounded-full blur-[128px]" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-emerald-400/10 dark:bg-emerald-500/5 rounded-full blur-[128px]" />
        </div>

        <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(148,163,184,0.1)_1px,transparent_1px)] dark:bg-[radial-gradient(circle,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />

        <header className="relative z-10 border-b border-gray-200/50 dark:border-white/5 bg-white/50 dark:bg-black/20 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Logo size={40} showText />
                <div className="hidden sm:block h-8 w-px bg-border" />
                <div className="hidden sm:block">
                  <h1 className="text-lg font-semibold text-foreground">SkillFlow Dashboard</h1>
                  <p className="text-sm text-muted-foreground">Manage your skill journeys</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <ThemeSwitcher />
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: 'w-10 h-10 rounded-xl'
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-bold text-foreground mb-2">
              Your <span className="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent">SkillFlows</span>
            </h2>
            <p className="text-lg text-muted-foreground">
              {skillFlows.length === 0 
                ? "Create your first SkillFlow to start your journey"
                : `${skillFlows.length} active ${skillFlows.length === 1 ? 'flow' : 'flows'}`
              }
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsCreateOpen(true)}
              className="group relative p-8 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-cyan-500 dark:hover:border-cyan-500 transition-all duration-300 flex flex-col items-center justify-center min-h-[280px] bg-white/30 dark:bg-white/5 backdrop-blur-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Plus className="w-8 h-8 text-cyan-500" />
              </div>
              <span className="text-lg font-semibold text-foreground">Create New SkillFlow</span>
              <span className="text-sm text-muted-foreground mt-1">Start a new skill journey</span>
            </motion.button>

            {skillFlows.map((flow, index) => {
              const IconComponent = iconMap[flow.icon || 'target'] || Target
              const colors = colorMap[flow.color || 'cyan']
              const progress = flow.nodeCount > 0 ? (flow.completedCount / flow.nodeCount) * 100 : 0

              return (
                <motion.div
                  key={flow.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onMouseEnter={() => setHoveredId(flow.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="group relative"
                >
                  <div
                    onClick={() => handleFlowClick(flow)}
                    className={cn(
                      "relative p-6 rounded-3xl border-2 min-h-[280px] cursor-pointer transition-all duration-300",
                      "bg-white/70 dark:bg-white/5 backdrop-blur-xl",
                      hoveredId === flow.id 
                        ? `${colors.border} shadow-xl ${colors.glow}` 
                        : "border-gray-200 dark:border-gray-800",
                      "hover:-translate-y-1"
                    )}
                  >
                    <div className="absolute top-4 right-4 z-10">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); }}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={(e) => { e.stopPropagation(); handleDeleteFlow(flow.id); }}
                            className="text-red-500 focus:text-red-500"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br",
                      colors.bg,
                      "border",
                      colors.border
                    )}>
                      <IconComponent className={cn("w-7 h-7", colors.text)} />
                    </div>

                    <h3 className="text-xl font-semibold text-foreground mb-2">{flow.name}</h3>
                    {flow.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{flow.description}</p>
                    )}

                    <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">{flow.nodeCount} tasks</span>
                        <span className={colors.text}>{Math.round(progress)}% complete</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={cn("h-full rounded-full bg-gradient-to-r", 
                            flow.color === 'cyan' && "from-cyan-500 to-cyan-400",
                            flow.color === 'emerald' && "from-emerald-500 to-emerald-400",
                            flow.color === 'violet' && "from-violet-500 to-violet-400",
                            flow.color === 'amber' && "from-amber-500 to-amber-400",
                            flow.color === 'rose' && "from-rose-500 to-rose-400",
                            flow.color === 'blue' && "from-blue-500 to-blue-400",
                          )}
                        />
                      </div>
                    </div>

                    <motion.div
                      initial={false}
                      animate={{ 
                        opacity: hoveredId === flow.id ? 1 : 0,
                        x: hoveredId === flow.id ? 0 : -10
                      }}
                      className="absolute bottom-6 right-6"
                    >
                      <div className={cn(
                        "flex items-center gap-1 text-sm font-medium",
                        colors.text
                      )}>
                        Open <ArrowRight className="w-4 h-4" />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </main>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New SkillFlow</DialogTitle>
              <DialogDescription>
                Start a new skill journey with a custom flow
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Name</label>
                <Input
                  value={newFlowName}
                  onChange={(e) => setNewFlowName(e.target.value)}
                  placeholder="e.g., Learn Piano, Fitness Journey"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description (optional)</label>
                <Input
                  value={newFlowDescription}
                  onChange={(e) => setNewFlowDescription(e.target.value)}
                  placeholder="A brief description of your goal"
                  className="h-12"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Icon</label>
                <div className="grid grid-cols-6 gap-2">
                  {availableIcons.map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setNewFlowIcon(id)}
                      className={cn(
                        "p-3 rounded-xl border-2 transition-all",
                        newFlowIcon === id
                          ? "border-cyan-500 bg-cyan-500/10"
                          : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"
                      )}
                    >
                      <Icon className={cn(
                        "w-5 h-5 mx-auto",
                        newFlowIcon === id ? "text-cyan-500" : "text-muted-foreground"
                      )} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="grid grid-cols-6 gap-2">
                  {availableColors.map(({ id }) => (
                    <button
                      key={id}
                      onClick={() => setNewFlowColor(id)}
                      className={cn(
                        "h-10 rounded-xl border-2 transition-all",
                        "bg-gradient-to-br",
                        colorMap[id].bg,
                        newFlowColor === id
                          ? `${colorMap[id].border} ring-2 ring-offset-2 ring-offset-background`
                          : "border-gray-200 dark:border-gray-800"
                      )}
                      style={{
                        ringColor: newFlowColor === id ? colorMap[id].text.replace('text-', '') : undefined
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateFlow}
                  disabled={!newFlowName.trim()}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                >
                  Create SkillFlow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
