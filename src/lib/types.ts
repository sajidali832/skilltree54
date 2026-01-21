export type NodeStatus = 'locked' | 'available' | 'completed'
export type NodePriority = 'low' | 'medium' | 'high'
export type NodeCategory = 'personal' | 'career' | 'health' | 'finance' | 'learning' | 'relationships' | 'other'
export type HabitFrequency = 'daily' | 'weekly' | 'monthly'
export type BadgeId = 
  | 'first_goal' 
  | 'streak_7' 
  | 'streak_30' 
  | 'streak_100'
  | 'level_5'
  | 'level_10'
  | 'level_25'
  | 'xp_100'
  | 'xp_500'
  | 'xp_1000'
  | 'flow_master'
  | 'habit_hero'
  | 'time_warrior'
  | 'template_user'

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
  is_habit: boolean
  time_invested_minutes: number
  xp_reward: number
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
  icon: string
  description: string | null
  color: string
  created_at: string
  updated_at: string
}

export interface UserProfile {
  id: string
  user_id: string
  display_name: string | null
  avatar_url: string | null
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  last_activity_date: string | null
  created_at: string
  updated_at: string
}

export interface UserBadge {
  id: string
  user_id: string
  badge_id: BadgeId
  earned_at: string
}

export interface Habit {
  id: string
  node_id: string
  user_id: string
  frequency: HabitFrequency
  current_streak: number
  longest_streak: number
  last_completed_at: string | null
  total_completions: number
  created_at: string
}

export interface HabitLog {
  id: string
  habit_id: string
  completed_at: string
  notes: string | null
}

export interface FocusSession {
  id: string
  node_id: string
  user_id: string
  duration_minutes: number
  started_at: string
  ended_at: string | null
  completed: boolean
}

export interface SkillFlowTemplate {
  id: string
  name: string
  description: string | null
  icon: string
  color: string
  category: string
  nodes_json: TemplateNode[]
  edges_json: TemplateEdge[]
  is_public: boolean
  created_by: string | null
  use_count: number
  created_at: string
}

export interface TemplateNode {
  title: string
  is_root?: boolean
  position_x: number
  position_y: number
  xp_reward?: number
  is_habit?: boolean
}

export interface TemplateEdge {
  source: number
  target: number
}

export interface XPTransaction {
  id: string
  user_id: string
  amount: number
  reason: string
  source_type: string | null
  source_id: string | null
  created_at: string
}

export interface Badge {
  id: BadgeId
  name: string
  description: string
  icon: string
  color: string
  requirement: string
}

export const BADGES: Badge[] = [
  { id: 'first_goal', name: 'First Step', description: 'Complete your first goal', icon: 'flag', color: 'emerald', requirement: 'Complete 1 goal' },
  { id: 'streak_7', name: 'Week Warrior', description: '7-day streak', icon: 'flame', color: 'orange', requirement: '7-day activity streak' },
  { id: 'streak_30', name: 'Monthly Master', description: '30-day streak', icon: 'flame', color: 'red', requirement: '30-day activity streak' },
  { id: 'streak_100', name: 'Unstoppable', description: '100-day streak', icon: 'zap', color: 'yellow', requirement: '100-day activity streak' },
  { id: 'level_5', name: 'Rising Star', description: 'Reach level 5', icon: 'star', color: 'blue', requirement: 'Reach level 5' },
  { id: 'level_10', name: 'Skilled', description: 'Reach level 10', icon: 'award', color: 'violet', requirement: 'Reach level 10' },
  { id: 'level_25', name: 'Expert', description: 'Reach level 25', icon: 'crown', color: 'amber', requirement: 'Reach level 25' },
  { id: 'xp_100', name: 'XP Hunter', description: 'Earn 100 XP', icon: 'sparkles', color: 'cyan', requirement: 'Earn 100 XP total' },
  { id: 'xp_500', name: 'XP Master', description: 'Earn 500 XP', icon: 'gem', color: 'purple', requirement: 'Earn 500 XP total' },
  { id: 'xp_1000', name: 'XP Legend', description: 'Earn 1000 XP', icon: 'trophy', color: 'gold', requirement: 'Earn 1000 XP total' },
  { id: 'flow_master', name: 'Flow Master', description: 'Complete a SkillFlow', icon: 'check-circle', color: 'green', requirement: 'Complete all goals in a SkillFlow' },
  { id: 'habit_hero', name: 'Habit Hero', description: 'Complete 50 habit check-ins', icon: 'repeat', color: 'pink', requirement: '50 habit completions' },
  { id: 'time_warrior', name: 'Time Warrior', description: '10 hours of focus time', icon: 'clock', color: 'slate', requirement: '10 hours focus time logged' },
  { id: 'template_user', name: 'Template Explorer', description: 'Use a template', icon: 'layout', color: 'indigo', requirement: 'Create flow from template' },
]

export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1
}

export function xpForLevel(level: number): number {
  return Math.pow(level - 1, 2) * 50
}

export function xpForNextLevel(level: number): number {
  return Math.pow(level, 2) * 50
}

export function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}
