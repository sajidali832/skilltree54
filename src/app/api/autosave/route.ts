import { createClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { table, id, data } = body

    if (!table || !id || !data) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const allowedTables = ['skill_nodes', 'skill_trees', 'skill_edges', 'habits', 'reminders']
    if (!allowedTables.includes(table)) {
      return NextResponse.json({ error: 'Invalid table' }, { status: 400 })
    }

    const supabase = createClient()
    
    const { error } = await supabase
      .from(table)
      .update(data)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
  }
}
