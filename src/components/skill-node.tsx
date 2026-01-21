'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { NodeStatus, NodePriority, NodeCategory } from '@/lib/types'
import { Lock, Check, Circle, Flag } from 'lucide-react'

interface SkillNodeData {
  label: string
  status: NodeStatus
  isRoot: boolean
  priority?: NodePriority
  category?: NodeCategory
}

const categoryGradients: Record<NodeCategory, string> = {
  personal: 'from-violet-500/20 to-purple-500/10',
  career: 'from-blue-500/20 to-cyan-500/10',
  health: 'from-rose-500/20 to-pink-500/10',
  finance: 'from-emerald-500/20 to-green-500/10',
  learning: 'from-amber-500/20 to-orange-500/10',
  relationships: 'from-pink-500/20 to-rose-500/10',
  other: 'from-slate-500/20 to-gray-500/10',
}

const categoryBorders: Record<NodeCategory, string> = {
  personal: 'border-violet-400',
  career: 'border-blue-400',
  health: 'border-rose-400',
  finance: 'border-emerald-400',
  learning: 'border-amber-400',
  relationships: 'border-pink-400',
  other: 'border-slate-400',
}

const priorityColors: Record<NodePriority, string> = {
  low: 'bg-slate-500',
  medium: 'bg-amber-500',
  high: 'bg-rose-500',
}

export const SkillNodeComponent = memo(function SkillNodeComponent({ 
  data,
  selected 
}: NodeProps & { data: SkillNodeData }) {
  const { label, status, isRoot, priority, category } = data

  const getStatusStyles = () => {
    if (status === 'completed') {
      return 'bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]'
    }
    if (status === 'locked') {
      return 'bg-gray-800/80 dark:bg-gray-800/80 border-gray-600 text-gray-400'
    }
    if (category && categoryGradients[category]) {
      return cn(
        'bg-gradient-to-br',
        categoryGradients[category],
        categoryBorders[category],
        'shadow-[0_0_20px_rgba(6,182,212,0.3)]'
      )
    }
    return 'bg-card border-cyan-500 text-foreground shadow-[0_0_20px_rgba(6,182,212,0.3)]'
  }

  const StatusIcon = {
    locked: Lock,
    available: Circle,
    completed: Check,
  }[status]

  const getHandleColor = () => {
    if (status === 'completed') return 'bg-emerald-400 border-emerald-300'
    if (status === 'available') {
      if (category && categoryBorders[category]) {
        return cn('border-2', categoryBorders[category].replace('border-', 'bg-').replace('-400', '-400'), categoryBorders[category].replace('-400', '-300'))
      }
      return 'bg-cyan-400 border-cyan-300'
    }
    return 'bg-gray-600 border-gray-500'
  }

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border-2 min-w-[160px] transition-all duration-200 backdrop-blur-sm',
        getStatusStyles(),
        selected && 'ring-2 ring-primary/50 ring-offset-2 ring-offset-background',
        isRoot && 'min-w-[180px]'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          'w-3 h-3 rounded-full border-2 transition-colors',
          getHandleColor()
        )}
      />
      
      <div className="flex items-center gap-2">
        <StatusIcon className={cn(
          'w-4 h-4 flex-shrink-0',
          status === 'completed' && 'text-emerald-400',
          status === 'available' && 'text-cyan-400',
          status === 'locked' && 'text-gray-500'
        )} />
        <span className="font-medium text-sm truncate flex-1">{label}</span>
        {priority && status !== 'completed' && (
          <div className={cn('w-2 h-2 rounded-full flex-shrink-0', priorityColors[priority])} />
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          'w-3 h-3 rounded-full border-2 transition-colors',
          getHandleColor()
        )}
      />
    </div>
  )
})
