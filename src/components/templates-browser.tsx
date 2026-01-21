'use client'

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Search, 
  Target, 
  Briefcase,
  Heart,
  BookOpen,
  Wallet,
  Rocket,
  Code,
  Dumbbell,
  Music,
  Globe,
  Users,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase'
import type { SkillFlowTemplate, TemplateNode, TemplateEdge } from '@/lib/types'

interface TemplatesBrowserProps {
  templates: SkillFlowTemplate[]
  userId: string
  onUseTemplate: (treeId: string) => void
  onClose?: () => void
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  briefcase: Briefcase,
  heart: Heart,
  'book-open': BookOpen,
  wallet: Wallet,
  rocket: Rocket,
  code: Code,
  dumbbell: Dumbbell,
  music: Music,
  globe: Globe,
}

const colorMap: Record<string, { bg: string; border: string; text: string }> = {
  cyan: { bg: 'from-cyan-500/20 to-cyan-600/10', border: 'border-cyan-500/50', text: 'text-cyan-400' },
  emerald: { bg: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/50', text: 'text-emerald-400' },
  violet: { bg: 'from-violet-500/20 to-violet-600/10', border: 'border-violet-500/50', text: 'text-violet-400' },
  amber: { bg: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/50', text: 'text-amber-400' },
  rose: { bg: 'from-rose-500/20 to-rose-600/10', border: 'border-rose-500/50', text: 'text-rose-400' },
  blue: { bg: 'from-blue-500/20 to-blue-600/10', border: 'border-blue-500/50', text: 'text-blue-400' },
}

const CATEGORIES = [
  { id: 'all', label: 'All', icon: Sparkles },
  { id: 'career', label: 'Career', icon: Briefcase },
  { id: 'health', label: 'Health', icon: Heart },
  { id: 'creative', label: 'Creative', icon: Music },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'finance', label: 'Finance', icon: Wallet },
]

export function TemplatesBrowser({ templates, userId, onUseTemplate, onClose }: TemplatesBrowserProps) {
  const supabase = createClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTemplate, setSelectedTemplate] = useState<SkillFlowTemplate | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const useTemplate = useCallback(async () => {
    if (!selectedTemplate) return
    setIsCreating(true)

    const { data: newTree, error: treeError } = await supabase
      .from('skill_trees')
      .insert({
        user_id: userId,
        name: selectedTemplate.name,
        description: selectedTemplate.description,
        icon: selectedTemplate.icon,
        color: selectedTemplate.color,
      })
      .select()
      .single()

    if (treeError || !newTree) {
      setIsCreating(false)
      return
    }

    const nodes = selectedTemplate.nodes_json as TemplateNode[]
    const edges = selectedTemplate.edges_json as TemplateEdge[]

    const nodeInserts = nodes.map((node, index) => ({
      tree_id: newTree.id,
      title: node.title,
      status: index === 0 ? 'available' : 'locked',
      is_root: node.is_root || false,
      is_habit: node.is_habit || false,
      position_x: node.position_x,
      position_y: node.position_y,
      xp_reward: node.xp_reward || 10,
      category: 'personal' as const,
      priority: 'medium' as const,
    }))

    const { data: createdNodes } = await supabase
      .from('skill_nodes')
      .insert(nodeInserts)
      .select()

    if (createdNodes && createdNodes.length > 0) {
      const edgeInserts = edges.map(edge => ({
        tree_id: newTree.id,
        source_node_id: createdNodes[edge.source].id,
        target_node_id: createdNodes[edge.target].id,
      }))

      await supabase.from('skill_edges').insert(edgeInserts)
    }

    await supabase
      .from('skillflow_templates')
      .update({ use_count: (selectedTemplate.use_count || 0) + 1 })
      .eq('id', selectedTemplate.id)

    setIsCreating(false)
    onUseTemplate(newTree.id)
  }, [supabase, selectedTemplate, userId, onUseTemplate])

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
        className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">SkillFlow Templates</h2>
              <p className="text-sm text-gray-400">Start with a pre-built template</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="pl-10 bg-white/5 border-white/10"
              />
            </div>
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {CATEGORIES.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedCategory(id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
                  selectedCategory === id
                    ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {selectedTemplate ? (
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="h-full"
              >
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-sm text-gray-400 hover:text-white mb-4 flex items-center gap-1"
                >
                  ← Back to templates
                </button>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center mb-4",
                      "bg-gradient-to-br",
                      colorMap[selectedTemplate.color || 'cyan'].bg,
                      "border-2",
                      colorMap[selectedTemplate.color || 'cyan'].border
                    )}>
                      {(() => {
                        const IconComponent = iconMap[selectedTemplate.icon || 'target'] || Target
                        return <IconComponent className={cn("w-8 h-8", colorMap[selectedTemplate.color || 'cyan'].text)} />
                      })()}
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2">{selectedTemplate.name}</h3>
                    <p className="text-gray-400 mb-4">{selectedTemplate.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                      <span className="flex items-center gap-1">
                        <Target className="w-4 h-4" />
                        {(selectedTemplate.nodes_json as TemplateNode[]).length} goals
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedTemplate.use_count || 0} uses
                      </span>
                    </div>

                    <Button
                      onClick={useTemplate}
                      disabled={isCreating}
                      className="w-full bg-gradient-to-r from-cyan-500 to-emerald-500 text-white"
                    >
                      {isCreating ? 'Creating...' : 'Use This Template'}
                    </Button>
                  </div>

                  <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                    <p className="text-sm text-gray-400 mb-3">Goals included:</p>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {(selectedTemplate.nodes_json as TemplateNode[]).map((node, i) => (
                        <div
                          key={i}
                          className={cn(
                            "p-3 rounded-xl",
                            node.is_root ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30" : "bg-white/5"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white text-sm">{node.title}</span>
                            <span className="text-xs text-cyan-400">+{node.xp_reward || 10} XP</span>
                          </div>
                          {node.is_habit && (
                            <span className="text-xs text-orange-400 mt-1 inline-block">🔥 Repeatable habit</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filteredTemplates.map((template) => {
                  const IconComponent = iconMap[template.icon || 'target'] || Target
                  const colors = colorMap[template.color || 'cyan']

                  return (
                    <motion.button
                      key={template.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTemplate(template)}
                      className="p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-left transition-all group"
                    >
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center mb-3",
                        "bg-gradient-to-br",
                        colors.bg,
                        "border",
                        colors.border
                      )}>
                        <IconComponent className={cn("w-6 h-6", colors.text)} />
                      </div>

                      <h4 className="text-lg font-semibold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                        {template.name}
                      </h4>
                      <p className="text-sm text-gray-400 line-clamp-2 mb-3">{template.description}</p>

                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{(template.nodes_json as TemplateNode[]).length} goals</span>
                        <span>•</span>
                        <span>{template.use_count || 0} uses</span>
                      </div>
                    </motion.button>
                  )
                })}

                {filteredTemplates.length === 0 && (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-400">No templates found</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}
