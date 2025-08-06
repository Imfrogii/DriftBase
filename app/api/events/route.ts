import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)

  try {
    let query = supabase
      .from('events')
      .select(`
        *,
        creator:users!events_created_by_fkey(id, display_name, email),
        location:locations(*)
      `)
      .eq('status', 'approved')
      .order('event_date', { ascending: true })

    // Apply filters
    const level = searchParams.get('level')
    const priceMin = searchParams.get('priceMin')
    const priceMax = searchParams.get('priceMax')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')

    if (level) query = query.eq('level', level)
    if (priceMin) query = query.gte('price', Number(priceMin))
    if (priceMax) query = query.lte('price', Number(priceMax))
    if (dateFrom) query = query.gte('event_date', dateFrom)
    if (dateTo) query = query.lte('event_date', dateTo)

    const { data: events, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ events })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const eventData = await request.json()
    
    const { data: event, error } = await supabase
      .from('events')
      .insert({
        ...eventData,
        created_by: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
