import { supabaseServer } from './server-client'
import type { SupabaseResponse } from './types'

/**
 * Server-side database functions using service role key
 * These functions bypass RLS and have full database access
 * ⚠️ Only use in API routes and server components - never expose to client
 */

export async function getInstructorImagesServer(instructorId: string): Promise<SupabaseResponse<any[]>> {
  try {
    console.log('Server: Fetching images for instructor:', instructorId)

    const { data, error } = await supabaseServer
      .from('instructor_images')
      .select('*')
      .eq('instructor_id', instructorId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Server: Failed to fetch instructor images:', error)
      return { data: null, error }
    }

    console.log('Server: Found instructor images:', data?.length || 0)
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Server: Error fetching instructor images:', error)
    return { data: null, error: error as Error }
  }
}

export async function getInstructorsServer(): Promise<SupabaseResponse<any[]>> {
  try {
    const { data, error } = await supabaseServer
      .from('instructors')
      .select('*')
      .order('first_name')

    if (error) {
      console.error('Server: Failed to fetch instructors:', error)
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Server: Error fetching instructors:', error)
    return { data: null, error: error as Error }
  }
}

export async function getBookingItemsServer(
  instructorId?: string,
  startDate?: string,
  endDate?: string
): Promise<SupabaseResponse<any[]>> {
  try {
    // First, get booking IDs for the instructor if specified
    let bookingIds: string[] = []

    if (instructorId) {
      console.log('Server: First fetching bookings for instructor:', instructorId)

      const { data: bookings, error: bookingsError } = await supabaseServer
        .from('bookings')
        .select('id')
        .eq('instructor_id', instructorId)

      if (bookingsError) {
        console.error('Server: Failed to fetch bookings for instructor:', bookingsError)
        return { data: null, error: bookingsError }
      }

      bookingIds = bookings?.map(b => b.id) || []
      console.log('Server: Found booking IDs for instructor:', bookingIds.length)

      // If no bookings found for this instructor, return empty array
      if (bookingIds.length === 0) {
        console.log('Server: No bookings found for instructor, returning empty array')
        return { data: [], error: null }
      }
    }

    // Now fetch booking items
    let query = supabaseServer
      .from('booking_items')
      .select(`
        id,
        booking_id,
        booking_slot_id,
        day_slot_id,
        date,
        start_time,
        end_time,
        total_minutes,
        hourly_rate,
        offer_id,
        created_at,
        bookings(instructor_id, customer_id, start_date, end_date)
      `)

    // Filter by booking IDs if we have them
    if (instructorId && bookingIds.length > 0) {
      query = query.in('booking_id', bookingIds)
    }

    // Filter by date range if provided
    if (startDate) {
      query = query.gte('date', startDate)
    }
    if (endDate) {
      query = query.lte('date', endDate)
    }

    const { data, error } = await query

    console.log('Server: Booking items query result:', {
      instructorId,
      bookingIdsCount: bookingIds.length,
      data: data?.slice(0, 3),
      error,
      dataLength: data?.length
    })

    if (error) {
      console.error('Server: Failed to fetch booking items:', error)
      return { data: null, error }
    }

    return { data: data || [], error: null }
  } catch (error) {
    console.error('Server: Error fetching booking items:', error)
    return { data: null, error: error as Error }
  }
}

export async function getInstructorBookingStats(instructorId: string): Promise<SupabaseResponse<any>> {
  try {
    // Get booking count for instructor
    const { count: bookingCount, error: bookingError } = await supabaseServer
      .from('booking_items')
      .select('*', { count: 'exact', head: true })
      .eq('bookings.instructor_id', instructorId)

    if (bookingError) {
      return { data: null, error: bookingError }
    }

    // Get date range of bookings
    const { data: dateRange, error: dateError } = await supabaseServer
      .from('booking_items')
      .select('date')
      .eq('bookings.instructor_id', instructorId)
      .order('date', { ascending: true })
      .limit(1)

    const { data: dateRangeEnd, error: dateEndError } = await supabaseServer
      .from('booking_items')
      .select('date')
      .eq('bookings.instructor_id', instructorId)
      .order('date', { ascending: false })
      .limit(1)

    return {
      data: {
        bookingCount: bookingCount || 0,
        earliestBooking: dateRange?.[0]?.date || null,
        latestBooking: dateRangeEnd?.[0]?.date || null
      },
      error: null
    }
  } catch (error) {
    console.error('Server: Error fetching instructor stats:', error)
    return { data: null, error: error as Error }
  }
}

export async function getInstructorOffersServer(instructorId: string): Promise<SupabaseResponse<any>> {
  try {
    const { data, error } = await supabaseServer
      .from('instructor_offers')
      .select('*')
      .eq('instructor_id', instructorId)
      .eq('status', 'active')

    if (error) {
      console.error('Server: Failed to fetch instructor offers:', JSON.stringify(error))
      return { data: null, error }
    }

    // Log the data structure to understand the schema
    console.log('Server: Instructor offers data structure:', JSON.stringify(data))

    // Find minimum hourly_rate_weekday from active offers
    let minRate = null
    if (data && data.length > 0) {
      // Get all weekday rates that are greater than 0
      const weekdayRates = data
        .map(row => row.hourly_rate_weekday)
        .filter(rate => rate && rate > 0)

      if (weekdayRates.length > 0) {
        minRate = Math.min(...weekdayRates)
      }
    }

    return {
      data: {
        minHourlyRate: minRate,
        offerCount: data?.length || 0
      },
      error: null
    }
  } catch (error) {
    console.error('Server: Error fetching instructor offers:', JSON.stringify(error))
    return { data: null, error: error as Error }
  }
}

export async function getInstructorResorts(instructorId: string) {
  console.log('Server: Fetching resorts for instructor:', instructorId)

  try {
    // First, get all offer IDs for this instructor
    const { data: offers, error: offersError } = await supabaseServer
      .from('instructor_offers')
      .select('id')
      .eq('instructor_id', instructorId)

    if (offersError) {
      console.error('Server: Error fetching instructor offers:', offersError)
      return { data: null, error: offersError.message }
    }

    if (!offers || offers.length === 0) {
      console.log('Server: No offers found for instructor:', instructorId)
      return { data: [], error: null }
    }

    const offerIds = offers.map(offer => offer.id)
    console.log('Server: Found offer IDs:', offerIds)

    // Now get resorts for these offers
    const { data, error } = await supabaseServer
      .from('instructor_offer_resorts')
      .select(`
        resort_id,
        resorts!inner(
          id,
          name
        )
      `)
      .in('offer_id', offerIds)

    if (error) {
      console.error('Server: Error fetching instructor resorts:', error)
      return { data: null, error: error.message }
    }

    console.log('Server: Raw resorts data:', data)

    // Transform the data to return unique resort information
    const uniqueResorts = new Map()
    data?.forEach(item => {
      uniqueResorts.set(item.resorts.id, {
        id: item.resorts.id,
        name: item.resorts.name
      })
    })

    const resorts = Array.from(uniqueResorts.values())
    console.log('Server: Processed unique resorts:', resorts)

    return { data: resorts, error: null }

  } catch (err: any) {
    console.error('Server: Unexpected error in getInstructorResorts:', err)
    return { data: null, error: err.message }
  }
}

export async function getInstructorDisciplinesServer(instructorId: string): Promise<SupabaseResponse<any[]>> {
  try {
    console.log('Server: Fetching disciplines for instructor:', instructorId)

    // Get instructor offers first
    const { data: offers, error: offersError } = await supabaseServer
      .from('instructor_offers')
      .select('id, hourly_rate_weekday')
      .eq('instructor_id', instructorId)
      .eq('status', 'active')

    if (offersError) {
      console.error('Server: Failed to fetch instructor offers:', offersError)
      return { data: null, error: offersError }
    }

    if (!offers || offers.length === 0) {
      console.log('Server: No active offers found for instructor')
      return { data: [], error: null }
    }

    console.log('Server: Found offers:', offers.length)

    // Get offer IDs
    const offerIds = offers.map(offer => offer.id)

    // Get disciplines for these offers
    const { data: offerDisciplines, error: disciplinesError } = await supabaseServer
      .from('instructor_offer_disciplines')
      .select(`
        offer_id,
        discipline_id,
        disciplines!inner(id, name, color_id)
      `)
      .in('offer_id', offerIds)

    if (disciplinesError) {
      console.error('Server: Failed to fetch offer disciplines:', disciplinesError)
      return { data: null, error: disciplinesError }
    }

    console.log('Server: Found offer disciplines:', offerDisciplines?.length || 0)

    // Group by discipline and calculate min prices
    const disciplineMap = new Map()

    offers.forEach(offer => {
      const disciplinesForOffer = offerDisciplines?.filter(od => od.offer_id === offer.id) || []

      disciplinesForOffer.forEach(od => {
        const discipline = od.disciplines
        if (discipline) {
          const existing = disciplineMap.get(discipline.id)
          const currentRate = offer.hourly_rate_weekday || 0

          if (!existing || currentRate < existing.minPrice) {
            disciplineMap.set(discipline.id, {
              id: discipline.id,
              name: discipline.name,
              color_id: discipline.color_id,
              minPrice: currentRate
            })
          }
        }
      })
    })

    const result = Array.from(disciplineMap.values())
    console.log('Server: Processed disciplines result:', result)

    return { data: result, error: null }

  } catch (error) {
    console.error('Server: Error fetching instructor disciplines:', error)
    return { data: null, error: error as Error }
  }
}