import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { SkillFlowWrapper } from '@/components/skillflow-wrapper'
import type { SkillTree, SkillNode, SkillEdge, SkillFlowTemplate, UserProfile, UserBadge, TemplateNode, TemplateEdge } from '@/lib/types'

export default async function TreePage() {
  const { userId } = await auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const supabase = createClient()

  const [
    { data: trees },
    { data: templates },
    { data: userProfile },
    { data: userBadges }
  ] = await Promise.all([
    supabase.from('skill_trees').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
    supabase.from('skillflow_templates').select('*').eq('is_public', true).order('use_count', { ascending: false }),
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('user_badges').select('*').eq('user_id', userId)
  ])

  let profile = userProfile as UserProfile | null
  if (!profile) {
    const { data: newProfile } = await supabase
      .from('user_profiles')
      .insert({ user_id: userId })
      .select()
      .single()
    profile = newProfile as UserProfile | null
  }

  const parsedTemplates: SkillFlowTemplate[] = (templates || []).map(t => ({
    ...t,
    nodes_json: typeof t.nodes_json === 'string' ? JSON.parse(t.nodes_json) : t.nodes_json as TemplateNode[],
    edges_json: typeof t.edges_json === 'string' ? JSON.parse(t.edges_json) : t.edges_json as TemplateEdge[],
  }))

  let skillFlows: (SkillTree & { nodeCount: number; completedCount: number; nodes: SkillNode[]; edges: SkillEdge[] })[] = []

  if (!trees || trees.length === 0) {
    const { data: newTree } = await supabase
      .from('skill_trees')
      .insert({ 
        user_id: userId, 
        name: 'My Life',
        icon: 'target',
        color: 'cyan'
      })
      .select()
      .single()

    if (newTree) {
      const { data: rootNode } = await supabase.from('skill_nodes').insert({
        tree_id: newTree.id,
        title: 'My Life',
        status: 'available',
        is_root: true,
        position_x: 400,
        position_y: 100,
        category: 'personal',
        priority: 'medium',
      }).select().single()

      skillFlows = [{
        ...newTree as SkillTree,
        nodeCount: 1,
        completedCount: 0,
        nodes: rootNode ? [rootNode as SkillNode] : [],
        edges: []
      }]
    }
  } else {
    const flowsWithStats = await Promise.all(
      trees.map(async (tree) => {
        const { data: nodes } = await supabase
          .from('skill_nodes')
          .select('*')
          .eq('tree_id', tree.id)
          .order('created_at')

        const { data: edges } = await supabase
          .from('skill_edges')
          .select('*')
          .eq('tree_id', tree.id)

        const nodeList = (nodes || []) as SkillNode[]
        const completedCount = nodeList.filter(n => n.status === 'completed').length

        return {
          ...tree as SkillTree,
          nodeCount: nodeList.length,
          completedCount,
          nodes: nodeList,
          edges: (edges || []) as SkillEdge[]
        }
      })
    )
    skillFlows = flowsWithStats
  }

  return (
    <SkillFlowWrapper 
      skillFlows={skillFlows} 
      userId={userId}
      templates={parsedTemplates}
      userProfile={profile}
      userBadges={(userBadges || []) as UserBadge[]}
    />
  )
}
