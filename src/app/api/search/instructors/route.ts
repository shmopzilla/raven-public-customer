import { NextResponse } from 'next/server'
import { searchInstructorsServer } from '@/lib/supabase/server-database'

/**
 * Search instructors API endpoint
 * Filters instructors by location, dates, disciplines, and availability
 *
 * Query params:
 * - location: Resort/location name (partial match)
 * - startDate: ISO date string (YYYY-MM-DD)
 * - endDate: ISO date string (YYYY-MM-DD)
 * - disciplineIds: Comma-separated discipline IDs
 * - limit: Number of results per page (default 20)
 * - offset: Pagination offset (default 0)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    const location = searchParams.get('location') || undefined
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const disciplineIdsParam = searchParams.get('disciplineIds')
    const disciplineIds = disciplineIdsParam ? disciplineIdsParam.split(',').filter(Boolean) : undefined
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    console.log('API: Search instructors request:', {
      location,
      startDate,
      endDate,
      disciplineIds,
      limit,
      offset
    })

    const { data, error } = await searchInstructorsServer({
      location,
      startDate,
      endDate,
      disciplineIds,
      limit,
      offset
    })

    if (error) {
      console.error('API: Search instructors error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to search instructors' },
        { status: 500 }
      )
    }

    console.log(`API: Returning ${data?.length || 0} instructors`)
    return NextResponse.json({
      data: data || [],
      count: data?.length || 0,
      params: { location, startDate, endDate, disciplineIds, limit, offset }
    })

  } catch (error: any) {
    console.error('API: Unexpected error in search instructors:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
