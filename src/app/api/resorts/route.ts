import { NextResponse } from 'next/server'
import { getResortsServer } from '@/lib/supabase/server-database'

export async function GET() {
  try {
    console.log('API: Fetching resorts with service role...')

    const { data, error } = await getResortsServer()

    if (error) {
      console.error('API: Failed to fetch resorts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch resorts', details: error.message },
        { status: 500 }
      )
    }

    console.log(`API: Found ${data?.length || 0} resorts`)

    return NextResponse.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('API: Error in resorts endpoint:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}