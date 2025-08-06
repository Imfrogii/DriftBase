import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient()
  const { searchParams } = new URL(request.url)

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let query = supabase
      .from('registrations')
      .select(`
        *,
        event:events(*),
        car:cars(*)
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // Apply filters
    const level = searchParams.get('level')
    const priceMax = searchParams.get('priceMax')

    if (level) {
      query = query.eq('event.level', level)
    }
    if (priceMax) {
      query = query.lte('event.price', Number(priceMax))
    }

    const { data: registrations, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ registrations })
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

    const registrationData = await request.json()
    
    const { data: registration, error } = await supabase
      .from('registrations')
      .insert({
        ...registrationData,
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ registration })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
