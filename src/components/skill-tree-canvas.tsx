'use client'

import { useCallback, useState, useEffect, useMemo, useRef } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  Connection,
  Node,
  Edge,
  BackgroundVariant,
  ConnectionLineType,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { createClient } from '@/lib/supabase'
import type { SkillNode, SkillEdge, SkillTree, NodePriority, NodeCategory, Habit } from '@/lib/types'
import { SkillNodeComponent } from '@/components/skill-node'
import { NodeDetailsPanel } from '@/components/node-details-panel'
import { AddGoalSidebar } from '@/components/add-goal-sidebar'
import { FocusTimer } from '@/components/focus-timer'
import { HabitTracker } from '@/components/habit-tracker'
import { GoalCompleteCelebration } from '@/components/level-system'
import { AutoSaveIndicator } from '@/components/auto-save-indicator'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { useAutoSave } from '@/hooks/use-auto-save'
import { 
  Plus, 
  Sparkles, 
  Target, 
  Trophy,
  Grid3X3,
  LayoutGrid,
  Maximize2,
} from 'lucide-react'
import { UserButton } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const nodeTypes = {
  skillNode: SkillNodeComponent,
}

interface SkillTreeCanvasProps {
  initialTree: SkillTree
  initialNodes: SkillNode[]
  initialEdges: SkillEdge[]
  userId?: string
}

function SkillTreeCanvasInner({ 
  initialTree, 
  initialNodes, 
  initialEdges,
  userId = ''
}: SkillTreeCanvasProps) {
  const supabase = createClient()
  const reactFlowInstance = useReactFlow()
  const viewportSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  const { 
    saveStatus, 
    lastSaved, 
    saveNodePosition, 
    saveNodeData, 
    saveCanvasViewport,
    forceSave 
  } = useAutoSave()
  
  const [skillNodes, setSkillNodes] = useState<SkillNode[]>(initialNodes)
  const [skillEdges, setSkillEdges] = useState<SkillEdge[]>(initialEdges)
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [showMinimap, setShowMinimap] = useState(true)
  const [showGrid, setShowGrid] = useState(true)
  const [filterCategory, setFilterCategory] = useState<NodeCategory | 'all'>('all')
  const [showFocusTimer, setShowFocusTimer] = useState(false)
  const [showHabitTracker, setShowHabitTracker] = useState(false)
  const [currentHabit, setCurrentHabit] = useState<Habit | null>(null)
  const [celebrationData, setCelebrationData] = useState<{ title: string; xp: number } | null>(null)

  useEffect(() => {
    if (initialTree.last_canvas_state) {
      const canvasState = initialTree.last_canvas_state as { viewport?: { x: number; y: number; zoom: number } }
      if (canvasState.viewport) {
        setTimeout(() => {
          reactFlowInstance.setViewport(canvasState.viewport!)
        }, 100)
      }
    }
  }, [initialTree.last_canvas_state, reactFlowInstance])

  const handleViewportChange = useCallback(() => {
    if (viewportSaveTimeoutRef.current) {
      clearTimeout(viewportSaveTimeoutRef.current)
    }
    
    viewportSaveTimeoutRef.current = setTimeout(() => {
      const viewport = reactFlowInstance.getViewport()
      saveCanvasViewport(initialTree.id, viewport)
    }, 1000)
  }, [reactFlowInstance, saveCanvasViewport, initialTree.id])

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

  const filteredNodes = useMemo(() => {
    if (filterCategory === 'all') return computedNodes
    return computedNodes.filter(n => n.category === filterCategory || n.is_root)
  }, [computedNodes, filterCategory])

  const flowNodes: Node[] = useMemo(() => 
    filteredNodes.map(node => ({
      id: node.id,
      type: 'skillNode',
      position: { x: node.position_x, y: node.position_y },
      data: {
        label: node.title,
        status: node.status,
        isRoot: node.is_root,
        priority: node.priority,
        category: node.category,
      },
    })),
    [filteredNodes]
  )

  const flowEdges: Edge[] = useMemo(() => 
    skillEdges
      .filter(edge => {
        if (filterCategory === 'all') return true
        const sourceNode = computedNodes.find(n => n.id === edge.source_node_id)
        const targetNode = computedNodes.find(n => n.id === edge.target_node_id)
        return (sourceNode?.category === filterCategory || sourceNode?.is_root) &&
               (targetNode?.category === filterCategory || targetNode?.is_root)
      })
      .map(edge => ({
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
    [skillEdges, computedNodes, filterCategory]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(flowNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(flowEdges)

  useEffect(() => {
    setNodes(flowNodes)
  }, [flowNodes, setNodes])

  useEffect(() => {
    setEdges(flowEdges)
  }, [flowEdges, setEdges])

  const stats = useMemo(() => {
    const total = computedNodes.length
    const completed = computedNodes.filter(n => n.status === 'completed').length
    const inProgress = computedNodes.filter(n => n.status === 'available').length
    const locked = computedNodes.filter(n => n.status === 'locked').length
    const progress = total > 0 ? (completed / total) * 100 : 0
    return { total, completed, inProgress, locked, progress }
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
      saveNodePosition(node.id, node.position.x, node.position.y)

      setSkillNodes(prev =>
        prev.map(n =>
          n.id === node.id
            ? { ...n, position_x: node.position.x, position_y: node.position.y }
            : n
        )
      )
    },
    [saveNodePosition]
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

  const handleAddGoal = useCallback(async (goal: {
    title: string
    description: string
    priority: NodePriority
    category: NodeCategory
    dueDate: Date | null
    checklist: string[]
  }) => {
    const centerX = 400 + Math.random() * 200 - 100
    const centerY = 300 + Math.random() * 200 - 100

    const { data, error } = await supabase
      .from('skill_nodes')
      .insert({
        tree_id: initialTree.id,
        title: goal.title,
        description: goal.description || null,
        status: 'available',
        priority: goal.priority,
        category: goal.category,
        due_date: goal.dueDate?.toISOString() || null,
        checklist: goal.checklist.map(text => ({
          id: crypto.randomUUID(),
          text,
          completed: false,
        })),
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
      
      saveNodeData(updatedNode.id, {
        title: updatedNode.title,
        description: updatedNode.description,
        status: updatedNode.status,
        priority: updatedNode.priority,
        category: updatedNode.category,
        checklist: updatedNode.checklist,
        due_date: updatedNode.due_date,
        is_habit: updatedNode.is_habit,
      })

      setSkillNodes(prev =>
        prev.map(n => (n.id === updatedNode.id ? updatedNode : n))
      )
      setSelectedNode(updatedNode)
      
      if (wasNotCompleted && isNowCompleted) {
        setCelebrationData({ title: updatedNode.title, xp: updatedNode.xp_reward || 10 })
        
        if (userId) {
          supabase
            .from('user_profiles')
            .select('total_xp')
            .eq('user_id', userId)
            .single()
            .then(({ data }) => {
              if (data) {
                supabase
                  .from('user_profiles')
                  .update({ total_xp: (data.total_xp || 0) + (updatedNode.xp_reward || 10) })
                  .eq('user_id', userId)
              }
            })
        }
      }
    },
    [skillNodes, userId, saveNodeData, supabase]
  )

  const handleDeleteNode = useCallback(
    async (nodeId: string) => {
      await supabase.from('skill_edges').delete().or(`source_node_id.eq.${nodeId},target_node_id.eq.${nodeId}`)
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

  const categoryColors: Record<NodeCategory, string> = {
    personal: 'bg-violet-500',
    career: 'bg-blue-500',
    health: 'bg-rose-500',
    finance: 'bg-emerald-500',
    learning: 'bg-amber-500',
    relationships: 'bg-pink-500',
    other: 'bg-slate-500',
  }

  const handleOpenFocusTimer = useCallback(() => {
    setShowFocusTimer(true)
  }, [])

  const handleOpenHabitTracker = useCallback(async () => {
    if (selectedNode && userId) {
      const { data } = await supabase
        .from('habits')
        .select('*')
        .eq('node_id', selectedNode.id)
        .single()
      
      setCurrentHabit(data as Habit | null)
      setShowHabitTracker(true)
    }
  }, [supabase, selectedNode, userId])

  const handleFocusSessionComplete = useCallback((duration: number) => {
    if (selectedNode) {
      setSkillNodes(prev =>
        prev.map(n =>
          n.id === selectedNode.id
            ? { ...n, time_invested_minutes: (n.time_invested_minutes || 0) + duration }
            : n
        )
      )
    }
  }, [selectedNode])

  useEffect(() => {
    const handleBeforeUnload = () => {
      forceSave()
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [forceSave])

  return (
    <div className="h-screen w-screen bg-background relative">
      <AnimatePresence>
        {showConfetti && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="relative">
              <Sparkles className="w-32 h-32 text-emerald-400 animate-pulse" />
              <div className="absolute inset-0 bg-emerald-400/30 blur-3xl rounded-full animate-ping" />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-white px-4 py-2 rounded-full font-bold text-sm"
              >
                Goal Completed!
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
        <AutoSaveIndicator status={saveStatus} lastSaved={lastSaved} />
        
        <div className="flex items-center gap-4 px-4 py-3 rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-lg">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-muted-foreground">Completed</span>
              <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                {stats.completed}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-muted-foreground">In Progress</span>
              <Badge variant="secondary" className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                {stats.inProgress}
              </Badge>
            </div>
          </div>
          <div className="w-px h-8 bg-border" />
          <div className="flex items-center gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">Overall Progress</span>
              <div className="flex items-center gap-2">
                <Progress value={stats.progress} className="w-24 h-2" />
                <span className="text-sm font-semibold text-foreground">{Math.round(stats.progress)}%</span>
              </div>
            </div>
          </div>
        </div>
        
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

      <div className="absolute top-4 left-4 z-10">
        <div className="flex flex-col gap-2 p-2 rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-lg">
          <span className="text-xs font-medium text-muted-foreground px-2">Filter</span>
          <button
            onClick={() => setFilterCategory('all')}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all",
              filterCategory === 'all' 
                ? "bg-primary/20 text-primary" 
                : "hover:bg-muted text-muted-foreground"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            All
          </button>
          {(['personal', 'career', 'health', 'finance', 'learning'] as NodeCategory[]).map(cat => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all capitalize",
                filterCategory === cat 
                  ? "bg-primary/20 text-primary" 
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              <div className={cn("w-3 h-3 rounded-full", categoryColors[cat])} />
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 p-2 rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-lg">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowGrid(!showGrid)}
            className={cn(showGrid && "bg-primary/20 text-primary")}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowMinimap(!showMinimap)}
            className={cn(showMinimap && "bg-primary/20 text-primary")}
          >
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={() => setIsAddGoalOpen(true)}
          className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/40 transition-all hover:-translate-y-0.5"
        >
          <Plus className="w-5 h-5 mr-2" />
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
        onMoveEnd={handleViewportChange}
        nodeTypes={nodeTypes}
        connectionLineType={ConnectionLineType.SmoothStep}
        connectionLineStyle={{ stroke: '#06b6d4', strokeWidth: 2 }}
        fitView
        minZoom={0.2}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
        className="bg-background"
      >
        <Controls 
          className="bg-card border-border rounded-xl overflow-hidden [&>button]:bg-card [&>button]:border-border [&>button]:text-foreground [&>button:hover]:bg-muted"
          position="bottom-right"
        />
        {showGrid && (
          <Background 
            variant={BackgroundVariant.Dots} 
            gap={24} 
            size={1} 
            className="bg-background"
            color="var(--muted-foreground)"
            style={{ opacity: 0.3 }}
          />
        )}
        {showMinimap && (
          <MiniMap 
            className="bg-card border border-border rounded-xl overflow-hidden"
            nodeColor={(node) => {
              if (node.data.status === 'completed') return '#34d399'
              if (node.data.status === 'available') return '#06b6d4'
              return '#64748b'
            }}
            maskColor="rgba(0,0,0,0.2)"
          />
        )}
      </ReactFlow>

      <AddGoalSidebar
        open={isAddGoalOpen}
        onClose={() => setIsAddGoalOpen(false)}
        onAdd={handleAddGoal}
      />

      <NodeDetailsPanel
        node={selectedNode}
        open={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onUpdate={handleUpdateNode}
        onDelete={handleDeleteNode}
        canComplete={canComplete}
        canUnlock={false}
        onOpenFocusTimer={handleOpenFocusTimer}
        onOpenHabitTracker={handleOpenHabitTracker}
        habit={currentHabit}
      />

      <AnimatePresence>
        {showFocusTimer && selectedNode && userId && (
          <FocusTimer
            nodeId={selectedNode.id}
            nodeTitle={selectedNode.title}
            userId={userId}
            onSessionComplete={handleFocusSessionComplete}
            onClose={() => setShowFocusTimer(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showHabitTracker && selectedNode && userId && (
          <HabitTracker
            nodeId={selectedNode.id}
            nodeTitle={selectedNode.title}
            userId={userId}
            habit={currentHabit}
            onHabitUpdate={(habit) => setCurrentHabit(habit)}
            onClose={() => setShowHabitTracker(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {celebrationData && (
          <GoalCompleteCelebration
            goalTitle={celebrationData.title}
            xpGained={celebrationData.xp}
            onClose={() => setCelebrationData(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export function SkillTreeCanvas(props: SkillTreeCanvasProps) {
  return (
    <ReactFlowProvider>
      <SkillTreeCanvasInner {...props} />
    </ReactFlowProvider>
  )
}
