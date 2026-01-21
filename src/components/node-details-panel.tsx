'use client'

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
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import type { SkillNode, ChecklistItem, NodeStatus, NodePriority, NodeCategory } from '@/lib/types'
import { useState, useEffect } from 'react'
import { format } from 'date-fns'
import { 
  Plus, 
  Trash2, 
  Check, 
  Lock, 
  Circle, 
  X,
  Calendar as CalendarIcon,
  Flag,
  Folder,
  Sparkles,
  User,
  Briefcase,
  Heart,
  DollarSign,
  BookOpen,
  Users,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

interface NodeDetailsPanelProps {
  node: SkillNode | null
  open: boolean
  onClose: () => void
  onUpdate: (node: SkillNode) => void
  onDelete: (nodeId: string) => void
  canComplete: boolean
  canUnlock: boolean
}

const priorities: { value: NodePriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-slate-500' },
  { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
  { value: 'high', label: 'High', color: 'bg-rose-500' },
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

export function NodeDetailsPanel({
  node,
  open,
  onClose,
  onUpdate,
  onDelete,
  canComplete,
}: NodeDetailsPanelProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState('')
  const [priority, setPriority] = useState<NodePriority>('medium')
  const [category, setCategory] = useState<NodeCategory>('personal')
  const [dueDate, setDueDate] = useState<Date | undefined>()

  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setDescription(node.description || '')
      setChecklist(node.checklist || [])
      setPriority(node.priority || 'medium')
      setCategory(node.category || 'personal')
      setDueDate(node.due_date ? new Date(node.due_date) : undefined)
    }
  }, [node])

  if (!node) return null

  const handleSave = () => {
    onUpdate({
      ...node,
      title,
      description: description || null,
      checklist,
      priority,
      category,
      due_date: dueDate?.toISOString() || null,
    })
  }

  const handleAddChecklistItem = () => {
    if (!newChecklistItem.trim()) return
    setChecklist([
      ...checklist,
      { id: crypto.randomUUID(), text: newChecklistItem, completed: false },
    ])
    setNewChecklistItem('')
  }

  const toggleChecklistItem = (id: string) => {
    setChecklist(
      checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    )
  }

  const removeChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id))
  }

  const handleStatusChange = (newStatus: NodeStatus) => {
    if (newStatus === 'completed' && !canComplete) return
    
    onUpdate({
      ...node,
      title,
      description: description || null,
      checklist,
      priority,
      category,
      due_date: dueDate?.toISOString() || null,
      status: newStatus,
    })
  }

  const statusConfig = {
    locked: { icon: Lock, label: 'Locked', color: 'text-gray-400 bg-gray-500/20' },
    available: { icon: Circle, label: 'Available', color: 'text-cyan-400 bg-cyan-500/20' },
    completed: { icon: Check, label: 'Completed', color: 'text-emerald-400 bg-emerald-500/20' },
  }

  const StatusIcon = statusConfig[node.status].icon
  const selectedCategory = categories.find(c => c.value === category)

  const completedCount = checklist.filter(item => item.completed).length
  const totalCount = checklist.length

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[480px] p-0 border-l border-border bg-background overflow-hidden">
        <div className="h-full flex flex-col">
          <div className={cn(
            "relative px-6 py-6 bg-gradient-to-br",
            selectedCategory?.gradient || 'from-cyan-500 to-emerald-500'
          )}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23fff%22%20fill-opacity%3D%220.1%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50" />
            <SheetHeader className="relative">
              <div className="flex items-center justify-between mb-2">
                <Badge className={cn('gap-1 border', statusConfig[node.status].color)}>
                  <StatusIcon className="w-3 h-3" />
                  {statusConfig[node.status].label}
                </Badge>
                {totalCount > 0 && (
                  <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                    {completedCount}/{totalCount} tasks
                  </Badge>
                )}
              </div>
              <SheetTitle className="text-white text-xl font-bold">{title || 'Goal Details'}</SheetTitle>
              {dueDate && (
                <p className="text-white/70 text-sm flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  Due: {format(dueDate, 'PPP')}
                </p>
              )}
            </SheetHeader>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            <div className="space-y-2">
              <Label className="text-sm font-medium flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                Title
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 bg-muted/50 border-border"
                placeholder="Enter goal title"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] bg-muted/50 border-border resize-none"
                placeholder="Add a description..."
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
                      "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all",
                      category === cat.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    )}
                  >
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br",
                      cat.gradient
                    )}>
                      <cat.icon className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">{cat.label}</span>
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
                      "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 transition-all",
                      priority === p.value
                        ? "border-primary bg-primary/10"
                        : "border-border bg-muted/30 hover:border-primary/50"
                    )}
                  >
                    <div className={cn("w-2.5 h-2.5 rounded-full", p.color)} />
                    <span className="text-sm font-medium">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-primary" />
                Due Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-11 bg-muted/50",
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
              <Label className="text-sm font-medium">Status</Label>
              <div className="flex gap-2">
                {node.status === 'available' && (
                  <Button
                    onClick={() => handleStatusChange('completed')}
                    disabled={!canComplete}
                    className={cn(
                      'flex-1 gap-2 h-11',
                      canComplete 
                        ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-500 border border-emerald-500/50' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    )}
                    variant="outline"
                  >
                    <Check className="w-4 h-4" />
                    Mark Complete
                  </Button>
                )}
                {node.status === 'completed' && (
                  <Button
                    onClick={() => handleStatusChange('available')}
                    className="flex-1 gap-2 h-11 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-500 border border-cyan-500/50"
                    variant="outline"
                  >
                    <Circle className="w-4 h-4" />
                    Reopen Goal
                  </Button>
                )}
                {node.status === 'locked' && (
                  <div className="flex-1 p-3 rounded-xl bg-muted/50 border border-border text-center text-muted-foreground text-sm">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Complete parent goals to unlock
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Checklist</Label>
                {totalCount > 0 && (
                  <span className="text-xs text-muted-foreground">
                    {completedCount} of {totalCount} complete
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <AnimatePresence>
                  {checklist.map((item) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 border border-border group"
                    >
                      <Checkbox
                        checked={item.completed}
                        onCheckedChange={() => toggleChecklistItem(item.id)}
                        className="border-border data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                      />
                      <span
                        className={cn(
                          'flex-1 text-sm',
                          item.completed && 'line-through text-muted-foreground'
                        )}
                      >
                        {item.text}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"
                        onClick={() => removeChecklistItem(item.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <div className="flex gap-2">
                <Input
                  value={newChecklistItem}
                  onChange={(e) => setNewChecklistItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                  placeholder="Add checklist item..."
                  className="bg-muted/50 border-border h-10"
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
              {!node.is_root && (
                <Button
                  variant="destructive"
                  onClick={() => onDelete(node.id)}
                  className="gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
              <Button
                onClick={handleSave}
                className={cn(
                  "flex-1 h-11 text-white font-semibold bg-gradient-to-r",
                  selectedCategory?.gradient || 'from-cyan-500 to-emerald-500',
                  "hover:opacity-90 transition-opacity"
                )}
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
