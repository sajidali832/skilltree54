'use client'

import { useCallback, useState, useEffect, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
  ConnectionLineType,
  MarkerType,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { createClient } from '@/lib/supabase'
import type { SkillNode, SkillEdge, SkillTree } from '@/lib/types'
import { SkillNodeComponent } from '@/components/skill-node'
import { NodeDetailsPanel } from '@/components/node-details-panel'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Plus, Sparkles } from 'lucide-react'
import { UserButton } from '@clerk/nextjs'

const nodeTypes = {
  skillNode: SkillNodeComponent,
}

interface SkillTreeCanvasProps {
  initialTree: SkillTree
  initialNodes: SkillNode[]
  initialEdges: SkillEdge[]
}

export function SkillTreeCanvas({ 
  initialTree, 
  initialNodes, 
  initialEdges 
}: SkillTreeCanvasProps) {
  const supabase = createClient()
  
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(initialNodes)
  const [skillEdges, setSkillEdges] = useState<SkillEdge[]>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const calculateNodeStatuses = useCallback((nodes: SkillNode[], edges: SkillEdge[]): SkillNode[] => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]))
    const parentMap = new Map<string, string[]>()
    
    edges.forEach(edge => {
      const parents = parentMap.get(edge.target_node_id) || []
      parents.push(edge.source_node_id)
      parentMap.set(edge.target_node_id, parents)
    })

    return nodes.map(node => {
      if (node.is_root) {
        return { ...node, status: node.status === 'completed' ? 'completed' : 'available' }
      }
      
      if (node.status === 'completed') return node
      
      const parents = parentMap.get(node.id) || []
      if (parents.length === 0) {
        return { ...node, status: 'available' }
      }
      
      const allParentsComplete = parents.every(parentId => {
        const parent = nodeMap.get(parentId)
        return parent?.status === 'completed'
      })
      
      return {
        ...node,
        status: allParentsComplete ? 'available' : 'locked'
      }
    })
  }, [])

  const computedNodes = useMemo(() => 
    calculateNodeStatuses(skillNodes, skillEdges),
    [skillNodes, skillEdges, calculateNodeStatuses]
  )

  const flowNodes: Node[] = useMemo(() => 
    computedNodes.map(node => ({
      id: node.id,
      type: 'skillNode',
      position: { x: node.position_x, y: node.position_y },
      data: {
        label: node.title,
        status: node.status,
        isRoot: node.is_root,
      },
    })),
    [computedNodes]
  )

  const flowEdges: Edge[] = useMemo(() => 
    skillEdges.map(edge => ({
      id: edge.id,
      source: edge.source_node_id,
      target: edge.target_node_id,
      type: 'smoothstep',
      animated: computedNodes.find(n => n.id === edge.source_node_id)?.status === 'completed',
      style: {
        stroke: computedNodes.find(n => n.id === edge.source_node_id)?.status === 'completed' 
          ? '#34d399' 
          : '#4b5563',
        strokeWidth: 2,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: computedNodes.find(n => n.id === edge.source_node_id)?.status === 'completed' 
          ? '#34d399' 
          : '#4b5563',
      },
    })),
    [skillEdges, computedNodes]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  useEffect(() => {
    setNodes(flowNodes)
  }, [flowNodes, setNodes])

  useEffect(() => {
    setEdges(flowEdges)
  }, [flowEdges, setEdges])

  const progress = useMemo(() => {
    const total = computedNodes.length
    const completed = computedNodes.filter(n => n.status === 'completed').length
    return total > 0 ? (completed / total) * 100 : 0
  }, [computedNodes])

  const onConnect = useCallback(
    async (params: Connection) => {
      if (!params.source || !params.target) return
      
      const { data, error } = await supabase
        .from('skill_edges')
        .insert({
          tree_id: initialTree.id,
          source_node_id: params.source,
          target_node_id: params.target,
        })
        .select()
        .single()

      if (!error && data) {
        setSkillEdges(prev => [...prev, data as SkillEdge])
      }
    },
    [supabase, initialTree.id]
  )

  const onNodeDragStop = useCallback(
    async (_: React.MouseEvent, node: Node) => {
      await supabase
        .from('skill_nodes')
        .update({
          position_x: node.position.x,
          position_y: node.position.y,
        })
        .eq('id', node.id)

      setSkillNodes(prev =>
        prev.map(n =>
          n.id === node.id
            ? { ...n, position_x: node.position.x, position_y: node.position.y }
            : n
        )
      )
    },
    [supabase]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const skillNode = computedNodes.find(n => n.id === node.id)
      if (skillNode) {
        setSelectedNode(skillNode)
        setIsPanelOpen(true)
      }
    },
    [computedNodes]
  )

  const handleAddNode = useCallback(async () => {
    const centerX = 400 + Math.random() * 200 - 100
    const centerY = 300 + Math.random() * 200 - 100

    const { data, error } = await supabase
      .from('skill_nodes')
      .insert({
        tree_id: initialTree.id,
        title: 'New Goal',
        status: 'available',
        position_x: centerX,
        position_y: centerY,
      })
      .select()
      .single()

    if (!error && data) {
      setSkillNodes(prev => [...prev, data as SkillNode])
    }
  }, [supabase, initialTree.id])

  const handleUpdateNode = useCallback(
    async (updatedNode: SkillNode) => {
      const wasNotCompleted = skillNodes.find(n => n.id === updatedNode.id)?.status !== 'completed'
      const isNowCompleted = updatedNode.status === 'completed'
      
      const { error } = await supabase
        .from('skill_nodes')
        .update({
          title: updatedNode.title,
          description: updatedNode.description,
          status: updatedNode.status,
          checklist: updatedNode.checklist,
        })
        .eq('id', updatedNode.id)

      if (!error) {
        setSkillNodes(prev =>
          prev.map(n => (n.id === updatedNode.id ? updatedNode : n))
        )
        setSelectedNode(updatedNode)
        
        if (wasNotCompleted && isNowCompleted) {
          setShowConfetti(true)
          setTimeout(() => setShowConfetti(false), 2000)
        }
      }
    },
    [supabase, skillNodes]
  )

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      await supabase.from('skill_nodes').delete().eq('id', nodeId)
      
      setSkillNodes(prev => prev.filter(n => n.id !== nodeId))
      setSkillEdges(prev => prev.filter(e => e.source_node_id !== nodeId && e.target_node_id !== nodeId))
      setIsPanelOpen(false)
      setSelectedNode(null)
    },
    [supabase]
  )

  const canComplete = useMemo(() => {
    if (!selectedNode) return true
    const parents = skillEdges.filter(e => e.target_node_id === selectedNode.id)
    if (parents.length === 0) return true
    return parents.every(edge => {
      const parent = computedNodes.find(n => n.id === edge.source_node_id)
      return parent?.status === 'completed'
    })
  }, [selectedNode, skillEdges, computedNodes])

  return (
    <div className="h-screen w-screen bg-[#0a0f1a] relative">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="relative">
            <Sparkles className="w-24 h-24 text-emerald-400 animate-pulse" />
            <div className="absolute inset-0 bg-emerald-400/20 blur-3xl rounded-full" />
          </div>
        </div>
      )}
      
      <div className="absolute top-4 left-4 z-10 flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center">
            <svg className="w-6 h-6 text-[#0a0f1a]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">LifeTree</span>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <div className="bg-[#111827]/90 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/10 flex items-center gap-3">
          <span className="text-gray-400 text-sm">Progress</span>
          <Progress value={progress} className="w-32 h-2 bg-gray-700" />
          <span className="text-white font-medium text-sm">{Math.round(progress)}%</span>
        </div>
        <UserButton 
          afterSignOutUrl="/"
          appearance={{
            elements: {
              avatarBox: 'w-9 h-9'
            }
          }}
        />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
        <Button
          onClick={handleAddNode}
          className="bg-cyan-500 hover:bg-cyan-600 text-white gap-2 shadow-lg shadow-cyan-500/25"
        >
          <Plus className="w-4 h-4" />
          Add Goal
        </Button>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#06b6d4', strokeWidth: 2 }}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Controls 
          className="bg-[#111827] border-white/10 rounded-xl overflow-hidden [&>button]:bg-[#111827] [&>button]:border-white/10 [&>button]:text-white [&>button:hover]:bg-white/10"
        />
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1} 
          color="#1e293b"
        />
      </ReactFlow>

      <NodeDetailsPanel
        node={selectedNode}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onUpdate={handleUpdateNode}
        onDelete={handleDeleteNode}
        canComplete={canComplete}
        canUnlock={false}
      />
    </div>
  )
}
