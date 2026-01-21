export type NodeStatus = 'locked' | 'available' | 'completed'
export type NodePriority = 'low' | 'medium' | 'high'
export type NodeCategory = 'personal' | 'career' | 'health' | 'finance' | 'learning' | 'relationships' | 'other'

export interface ChecklistItem {
  id: string
  text: string
  completed: boolean
}

export interface SkillNode {
  id: string
  tree_id: string
  title: string
  description: string | null
  status: NodeStatus
  priority: NodePriority
  category: NodeCategory
  position_x: number
  position_y: number
  due_date: string | null
  resources: string[] | null
  checklist: ChecklistItem[]
  is_root: boolean
  created_at: string
  updated_at: string
}

export interface SkillEdge {
  id: string
  tree_id: string
  source_node_id: string
  target_node_id: string
  created_at: string
}

export interface SkillTree {
  id: string
  user_id: string
  name: string
  created_at: string
  updated_at: string
}
