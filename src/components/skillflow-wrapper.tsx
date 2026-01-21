'use client'

import { useState } from 'react'
import { SkillFlowDashboard } from '@/components/skillflow-dashboard'
import { SkillTreeCanvas } from '@/components/skill-tree-canvas'
import type { SkillTree, SkillNode, SkillEdge } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface SkillFlowWithStats extends SkillTree {
  nodeCount: number
  completedCount: number
  nodes?: SkillNode[]
  edges?: SkillEdge[]
}

interface SkillFlowWrapperProps {
  skillFlows: SkillFlowWithStats[]
  userId: string
}

export function SkillFlowWrapper({ skillFlows: initialFlows, userId }: SkillFlowWrapperProps) {
  const [selectedFlow, setSelectedFlow] = useState<SkillTree | null>(null)
  const [flowData, setFlowData] = useState<{ nodes: SkillNode[]; edges: SkillEdge[] } | null>(null)
  const [showCanvas, setShowCanvas] = useState(false)

  const handleSelectFlow = async (flow: SkillTree) => {
    const flowWithData = initialFlows.find(f => f.id === flow.id)
    if (flowWithData?.nodes && flowWithData?.edges) {
      setSelectedFlow(flow)
      setFlowData({ nodes: flowWithData.nodes, edges: flowWithData.edges })
      setTimeout(() => setShowCanvas(true), 600)
    }
  }

  const handleBackToDashboard = () => {
    setShowCanvas(false)
    setTimeout(() => {
      setSelectedFlow(null)
      setFlowData(null)
    }, 300)
  }

  if (showCanvas && selectedFlow && flowData) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackToDashboard}
          className="absolute top-4 left-4 z-50 gap-2 bg-card/80 backdrop-blur-xl border border-border shadow-lg hover:bg-card"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Button>
        <SkillTreeCanvas 
          initialTree={selectedFlow} 
          initialNodes={flowData.nodes} 
          initialEdges={flowData.edges} 
        />
      </motion.div>
    )
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="dashboard"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <SkillFlowDashboard 
          skillFlows={initialFlows} 
          onSelectFlow={handleSelectFlow}
          userId={userId}
        />
      </motion.div>
    </AnimatePresence>
  )
}
