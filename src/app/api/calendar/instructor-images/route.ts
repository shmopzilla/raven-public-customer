import { NextRequest, NextResponse } from 'next/server'
import { getInstructorImagesServer } from '@/lib/supabase/server-database'

export async function GET(request: NextRequest) {
  try {
    console.log('API: Fetching instructor images...')

    const { searchParams } = new URL(request.url)
    const instructorId = searchParams.get('instructorId')

    if (!instructorId) {
      return NextResponse.json(
        { error: 'instructorId parameter is required', details: 'Missing instructorId in query parameters' },
        { status: 400 }
      )
    }

    console.log('API: Getting images for instructor:', instructorId)

    const { data, error } = await getInstructorImagesServer(instructorId)

    if (error) {
      console.error('API: Database error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch instructor images', details: error.message },
        { status: 500 }
      )
    }

    console.log('API: Successfully fetched instructor images:', data?.length || 0)

    return NextResponse.json({
      data: data || [],
      count: data?.length || 0
    })

  } catch (error: any) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}