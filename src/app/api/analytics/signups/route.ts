import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server-client'
import type { SignupsData, SignupDataPoint, ApiResponse } from '@/lib/analytics/types'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build instructor query (only approved instructors)
    let instructorQuery = supabaseServer
      .from('instructors')
      .select('created_at')
      .eq('profile_status', 1)

    if (startDate) {
      instructorQuery = instructorQuery.gte('created_at', startDate)
    }
    if (endDate) {
      instructorQuery = instructorQuery.lte('created_at', `${endDate}T23:59:59`)
    }

    const { data: instructors, error: instructorError } = await instructorQuery

    if (instructorError) {
      throw new Error(`Failed to fetch instructors: ${instructorError.message}`)
    }

    // Build customer query
    let customerQuery = supabaseServer
      .from('customers')
      .select('created_at')

    if (startDate) {
      customerQuery = customerQuery.gte('created_at', startDate)
    }
    if (endDate) {
      customerQuery = customerQuery.lte('created_at', `${endDate}T23:59:59`)
    }

    const { data: customers, error: customerError } = await customerQuery

    if (customerError) {
      throw new Error(`Failed to fetch customers: ${customerError.message}`)
    }

    // Group by date
    const dateMap = new Map<string, { instructors: number; customers: number }>()

    instructors?.forEach(i => {
      const date = i.created_at?.split('T')[0] || i.created_at?.split(' ')[0]
      if (date) {
        const existing = dateMap.get(date) || { instructors: 0, customers: 0 }
        existing.instructors++
        dateMap.set(date, existing)
      }
    })

    customers?.forEach(c => {
      const date = c.created_at?.split('T')[0] || c.created_at?.split(' ')[0]
      if (date) {
        const existing = dateMap.get(date) || { instructors: 0, customers: 0 }
        existing.customers++
        dateMap.set(date, existing)
      }
    })

    // Convert to sorted array
    const series: SignupDataPoint[] = Array.from(dateMap.entries())
      .map(([date, counts]) => ({
        date,
        instructorSignups: counts.instructors,
        customerSignups: counts.customers,
        totalSignups: counts.instructors + counts.customers
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Calculate actual date range
    const dates = series.map(s => s.date)
    const actualStart = dates[0] || startDate || ''
    const actualEnd = dates[dates.length - 1] || endDate || ''

    const data: SignupsData = {
      series,
      dateRange: {
        start: actualStart,
        end: actualEnd
      }
    }

    const response: ApiResponse<SignupsData> = {
      success: true,
      data
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics signups error:', error)
    const response: ApiResponse<SignupsData> = {
      success: false,
      error: 'Failed to fetch signup data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
