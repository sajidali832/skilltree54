import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/tree'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: existingTree } = await supabase
          .from('skill_trees')
          .select('id')
          .eq('user_id', user.id)
          .single()

        if (!existingTree) {
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
          }
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
