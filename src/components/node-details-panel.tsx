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
import type { SkillNode, ChecklistItem, NodeStatus } from '@/lib/types'
import { useState, useEffect } from 'react'
import { Plus, Trash2, Check, Lock, Circle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface NodeDetailsPanelProps {
  node: SkillNode | null
  open: boolean
  onClose: () => void
  onUpdate: (node: SkillNode) => void
  onDelete: (nodeId: string) => void
  canComplete: boolean
  canUnlock: boolean
}

export function NodeDetailsPanel({
  node,
  open,
  onClose,
  onUpdate,
  onDelete,
  canComplete,
  canUnlock,
}: NodeDetailsPanelProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [newChecklistItem, setNewChecklistItem] = useState('')

  useEffect(() => {
    if (node) {
      setTitle(node.title)
      setDescription(node.description || '')
      setChecklist(node.checklist || [])
    }
  }, [node])

  if (!node) return null

  const handleSave = () => {
    onUpdate({
      ...node,
      title,
      description: description || null,
      checklist,
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
    if (newStatus === 'available' && node.status === 'locked' && !canUnlock) return
    
    onUpdate({
      ...node,
      title,
      description: description || null,
      checklist,
      status: newStatus,
    })
  }

  const statusConfig = {
    locked: { icon: Lock, label: 'Locked', color: 'text-gray-400 bg-gray-700' },
    available: { icon: Circle, label: 'Available', color: 'text-cyan-400 bg-cyan-500/20' },
    completed: { icon: Check, label: 'Completed', color: 'text-emerald-400 bg-emerald-500/20' },
  }

  const StatusIcon = statusConfig[node.status].icon

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-[#0f1729] border-l border-white/10 text-white w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white flex items-center justify-between">
            <span>Node Details</span>
            <Badge className={cn('gap-1', statusConfig[node.status].color)}>
              <StatusIcon className="w-3 h-3" />
              {statusConfig[node.status].label}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-6">
          <div className="space-y-2">
            <Label className="text-gray-300">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-[#1a2744] border-white/10 text-white"
              placeholder="Enter node title"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-300">Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-[#1a2744] border-white/10 text-white min-h-[100px]"
              placeholder="Add a description..."
            />
          </div>

          <div className="space-y-3">
            <Label className="text-gray-300">Status</Label>
            <div className="flex gap-2">
              {node.status === 'available' && (
                <Button
                  onClick={() => handleStatusChange('completed')}
                  disabled={!canComplete}
                  className={cn(
                    'flex-1 gap-2',
                    canComplete 
                      ? 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50' 
                      : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Check className="w-4 h-4" />
                  Mark Complete
                </Button>
              )}
              {node.status === 'completed' && (
                <Button
                  onClick={() => handleStatusChange('available')}
                  className="flex-1 gap-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 border border-cyan-500/50"
                >
                  <Circle className="w-4 h-4" />
                  Reopen
                </Button>
              )}
              {node.status === 'locked' && (
                <div className="flex-1 p-3 rounded-lg bg-gray-800/50 border border-gray-700 text-center text-gray-400 text-sm">
                  <Lock className="w-4 h-4 inline mr-2" />
                  Complete parent nodes to unlock
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-gray-300">Checklist</Label>
            <div className="space-y-2">
              {checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-[#1a2744] group"
                >
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={() => toggleChecklistItem(item.id)}
                    className="border-white/30 data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                  />
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      item.completed && 'line-through text-gray-500'
                    )}
                  >
                    {item.text}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400"
                    onClick={() => removeChecklistItem(item.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newChecklistItem}
                onChange={(e) => setNewChecklistItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddChecklistItem()}
                placeholder="Add checklist item..."
                className="bg-[#1a2744] border-white/10 text-white"
              />
              <Button
                onClick={handleAddChecklistItem}
                size="icon"
                className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-white/10">
            <Button
              onClick={handleSave}
              className="flex-1 bg-cyan-500 hover:bg-cyan-600 text-white"
            >
              Save Changes
            </Button>
            {!node.is_root && (
              <Button
                variant="destructive"
                onClick={() => onDelete(node.id)}
                className="gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
