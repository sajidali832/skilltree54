'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import type { NodePriority, NodeCategory } from '@/lib/types'
import {
  Target,
  Calendar as CalendarIcon,
  Flag,
  Folder,
  Sparkles,
  Plus,
  X,
  Briefcase,
  Heart,
  DollarSign,
  BookOpen,
  Users,
  MoreHorizontal,
  User,
  Zap,
} from 'lucide-react'

interface AddGoalSidebarProps {
  open: boolean
  onClose: () => void
  onAdd: (goal: {
    title: string
    description: string
    priority: NodePriority
    category: NodeCategory
    dueDate: Date | null
    checklist: string[]
  }) => void
}

const priorities: { value: NodePriority; label: string; color: string; icon: typeof Flag }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-500', icon: Flag },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500', icon: Flag },
  { value: 'high', label: 'High', color: 'bg-rose-500', icon: Flag },
]

const categories: { value: NodeCategory; label: string; icon: typeof User; gradient: string }[] = [
  { value: 'personal', label: 'Personal', icon: User, gradient: 'from-violet-500 to-purple-500' },
  { value: 'career', label: 'Career', icon: Briefcase, gradient: 'from-blue-500 to-cyan-500' },
  { value: 'health', label: 'Health', icon: Heart, gradient: 'from-rose-500 to-pink-500' },
  { value: 'finance', label: 'Finance', icon: DollarSign, gradient: 'from-emerald-500 to-green-500' },
  { value: 'learning', label: 'Learning', icon: BookOpen, gradient: 'from-amber-500 to-orange-500' },
  { value: 'relationships', label: 'Relationships', icon: Users, gradient: 'from-pink-500 to-rose-500' },
  { value: 'other', label: 'Other', icon: MoreHorizontal, gradient: 'from-slate-500 to-gray-500' },
]

export function AddGoalSidebar({ open, onClose, onAdd }: AddGoalSidebarProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<NodePriority>('medium')
  const [category, setCategory] = useState<NodeCategory>('personal')
  const [dueDate, setDueDate] = useState<Date | undefined>()
  const [checklistItems, setChecklistItems] = useState<string[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState('')

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setChecklistItems([...checklistItems, newChecklistItem.trim()])
      setNewChecklistItem('')
    }
  }

  const handleRemoveChecklistItem = (index: number) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    if (!title.trim()) return
    
    onAdd({
      title: title.trim(),
      description: description.trim(),
      priority,
      category,
      dueDate: dueDate || null,
      checklist: checklistItems,
    })

    setTitle('')
    setDescription('')
    setPriority('medium')
    setCategory('personal')
    setDueDate(undefined)
    setChecklistItems([])
    onClose()
  }

  const selectedCategory = categories.find(c => c.value === category)

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 border-l border-border bg-background overflow-hidden">
        <div className="h-full flex flex-col">
          <div className={cn(
            "relative px-6 py-8 bg-gradient-to-br",
            selectedCategory?.gradient || 'from-cyan-500 to-emerald-500'
          )}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <SheetHeader className="relative">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <SheetTitle className="text-white text-xl font-bold">Add New Goal</SheetTitle>
                  <p className="text-white/70 text-sm">Create a new goal for your life tree</p>
                </div>
              </div>
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Goal Title
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to achieve?"
                className="h-12 text-base bg-muted/50 border-border focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details about your goal..."
                className="min-h-[100px] bg-muted/50 border-border focus:border-primary transition-colors resize-none"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Folder className="w-4 h-4 text-primary" />
                Category
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={cn(
                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                      category === cat.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br",
                      cat.gradient
                    )}>
                      <cat.icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xs font-medium text-muted-foreground">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Flag className="w-4 h-4 text-primary" />
                Priority
              </Label>
              <div className="flex gap-2">
                {priorities.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => setPriority(p.value)}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 transition-all",
                      priority === p.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-3 h-3 rounded-full", p.color)} />
                    <span className="text-sm font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Due Date (Optional)
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-12 bg-muted/50",
                      !dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dueDate ? format(dueDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dueDate}
                    onSelect={setDueDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                Sub-tasks (Optional)
              </Label>
              <div className="space-y-2">
                <AnimatePresence>
                  {checklistItems.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border group"
                    >
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      <span className="flex-1 text-sm">{item}</span>
                      <button
                        onClick={() => handleRemoveChecklistItem(index)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-destructive/10 text-destructive transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  placeholder="Add a sub-task..."
                  className="h-10 bg-muted/50 border-border"
                />
                <Button
                  onClick={handleAddChecklistItem}
                  size="icon"
                  variant="outline"
                  className="h-10 w-10 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title.trim()}
                className={cn(
                  "flex-1 h-12 text-white font-semibold bg-gradient-to-r",
                  selectedCategory?.gradient || 'from-cyan-500 to-emerald-500',
                  "hover:opacity-90 transition-opacity"
                )}
              >
                <Plus className="w-5 h-5 mr-2" />
                Create Goal
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
