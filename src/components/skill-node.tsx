'use client'

import { memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { cn } from '@/lib/utils'
import type { NodeStatus } from '@/lib/types'
import { Lock, Check, Circle } from 'lucide-react'

interface SkillNodeData {
  label: string
  status: NodeStatus
  isRoot: boolean
}

export const SkillNodeComponent = memo(function SkillNodeComponent({ 
  data,
  selected 
}: NodeProps & { data: SkillNodeData }) {
  const { label, status, isRoot } = data

  const statusStyles = {
    locked: 'bg-gray-800/80 border-gray-600 text-gray-400',
    available: 'bg-[#0f1729] border-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    completed: 'bg-gradient-to-br from-emerald-600/20 to-emerald-500/10 border-emerald-400 text-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.4)]',
  }

  const StatusIcon = {
    locked: Lock,
    available: Circle,
    completed: Check,
  }[status]

  return (
    <div
      className={cn(
        'px-4 py-3 rounded-xl border-2 min-w-[140px] transition-all duration-200',
        statusStyles[status],
        selected && 'ring-2 ring-white/50 ring-offset-2 ring-offset-[#0a0f1a]',
        isRoot && 'min-w-[160px]'
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className={cn(
          'w-3 h-3 rounded-full border-2 transition-colors',
          status === 'completed' ? 'bg-emerald-400 border-emerald-300' : 
          status === 'available' ? 'bg-cyan-400 border-cyan-300' :
          'bg-gray-600 border-gray-500'
        )}
      />
      
      <div className="flex items-center gap-2">
        <StatusIcon className={cn(
          'w-4 h-4 flex-shrink-0',
          status === 'completed' && 'text-emerald-400',
          status === 'available' && 'text-cyan-400',
          status === 'locked' && 'text-gray-500'
        )} />
        <span className="font-medium text-sm truncate">{label}</span>
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className={cn(
          'w-3 h-3 rounded-full border-2 transition-colors',
          status === 'completed' ? 'bg-emerald-400 border-emerald-300' : 
          status === 'available' ? 'bg-cyan-400 border-cyan-300' :
          'bg-gray-600 border-gray-500'
        )}
      />
    </div>
  )
})
