import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { SkillTreeCanvas } from '@/components/skill-tree-canvas'

export default async function TreePage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: tree } = await supabase
    .from('skill_trees')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!tree) {
    const { data: newTree } = await supabase
      .from('skill_trees')
      .insert({ user_id: user.id, name: 'My Life' })
      .select()
      .single()

    if (newTree) {
      await supabase.from('skill_nodes').insert({
        tree_id: newTree.id,
        title: 'My Life',
        status: 'available',
        is_root: true,
        position_x: 400,
        position_y: 100,
      })
      
      redirect('/tree')
    }
  }

  const { data: nodes } = await supabase
    .from('skill_nodes')
    .select('*')
    .eq('tree_id', tree.id)
    .order('created_at')

  const { data: edges } = await supabase
    .from('skill_edges')
    .select('*')
    .eq('tree_id', tree.id)

  return (
    <SkillTreeCanvas 
      initialTree={tree} 
      initialNodes={nodes || []} 
      initialEdges={edges || []} 
    />
  )
}
