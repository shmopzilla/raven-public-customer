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
    console.log('Server: Fetching instructors with languages...')

    // First, get all instructors
    const { data: instructors, error: instructorsError } = await supabaseServer
      .from('instructors')
      .select('*')
      .order('first_name')

    if (instructorsError) {
      console.error('Server: Failed to fetch instructors:', instructorsError)
      return { data: null, error: instructorsError }
    }

    if (!instructors || instructors.length === 0) {
      return { data: [], error: null }
    }

    // Get all instructor IDs
    const instructorIds = instructors.map(instructor => instructor.id)

    // Fetch languages for all instructors
    const { data: userLanguages, error: languagesError } = await supabaseServer
      .from('user_languages')
      .select('user_id, name')
      .in('user_id', instructorIds)

    if (languagesError) {
      console.error('Server: Failed to fetch user languages:', languagesError)
      // Continue without languages data if fetch fails
    }

    // Fetch images for all instructors
    const { data: instructorImages, error: imagesError } = await supabaseServer
      .from('instructor_images')
      .select('instructor_id, image_url')
      .in('instructor_id', instructorIds)
      .order('created_at', { ascending: true })

    if (imagesError) {
      console.error('Server: Failed to fetch instructor images:', imagesError)
      // Continue without images data if fetch fails
    }

    // Map languages to instructors
    const languagesMap = new Map<string, string[]>()
    userLanguages?.forEach(ul => {
      if (!languagesMap.has(ul.user_id)) {
        languagesMap.set(ul.user_id, [])
      }
      languagesMap.get(ul.user_id)?.push(ul.name)
    })

    // Map images to instructors
    const imagesMap = new Map<string, string[]>()
    instructorImages?.forEach(img => {
      if (!imagesMap.has(img.instructor_id)) {
        imagesMap.set(img.instructor_id, [])
      }
      imagesMap.get(img.instructor_id)?.push(img.image_url)
    })

    // Add languages and images to each instructor
    const instructorsWithData = instructors.map(instructor => ({
      ...instructor,
      languages: languagesMap.get(instructor.id) || [],
      images: imagesMap.get(instructor.id) || []
    }))

    console.log(`Server: Found ${instructorsWithData.length} instructors with languages and images`)
    return { data: instructorsWithData, error: null }
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

export async function getResortsServer(): Promise<SupabaseResponse<any[]>> {
  try {
    console.log('Server: Fetching all resorts from resorts table')

    const { data, error } = await supabaseServer
      .from('resorts')
      .select('*')
      .order('name')

    if (error) {
      console.error('Server: Failed to fetch resorts:', error)
      return { data: null, error }
    }

    console.log(`Server: Found ${data?.length || 0} resorts`)
    return { data: data || [], error: null }
  } catch (error) {
    console.error('Server: Error fetching resorts:', error)
    return { data: null, error: error as Error }
  }
}

export async function searchInstructorsServer(params: {
  location?: string
  startDate?: string
  endDate?: string
  disciplineIds?: string[]
  limit?: number
  offset?: number
}): Promise<SupabaseResponse<any[]>> {
  try {
    const { location, startDate, endDate, disciplineIds, limit = 20, offset = 0 } = params

    console.log('Server: Searching instructors with params:', params)

    // Step 1: Get all instructors with their basic data
    const { data: instructors, error: instructorsError } = await supabaseServer
      .from('instructors')
      .select('*')
      .order('first_name')

    if (instructorsError) {
      console.error('Server: Failed to fetch instructors:', instructorsError)
      return { data: null, error: instructorsError }
    }

    if (!instructors || instructors.length === 0) {
      return { data: [], error: null }
    }

    const instructorIds = instructors.map(i => i.id)

    // Step 2: Get active offers for all instructors
    const { data: offers, error: offersError } = await supabaseServer
      .from('instructor_offers')
      .select('id, instructor_id, hourly_rate_weekday')
      .in('instructor_id', instructorIds)
      .eq('status', 'active')

    if (offersError) {
      console.error('Server: Failed to fetch offers:', offersError)
      return { data: null, error: offersError }
    }

    if (!offers || offers.length === 0) {
      console.log('Server: No active offers found')
      return { data: [], error: null }
    }

    const offerIds = offers.map(o => o.id)

    // Step 3: Filter by location (resort name) if provided
    let validOfferIds = offerIds
    if (location) {
      const { data: resortMatches, error: resortsError } = await supabaseServer
        .from('instructor_offer_resorts')
        .select(`
          offer_id,
          resorts!inner(name)
        `)
        .in('offer_id', offerIds)
        .ilike('resorts.name', `%${location}%`)

      if (resortsError) {
        console.error('Server: Failed to filter by resort:', resortsError)
      } else if (resortMatches && resortMatches.length > 0) {
        validOfferIds = resortMatches.map(r => r.offer_id)
        console.log(`Server: Filtered to ${validOfferIds.length} offers by location: ${location}`)
      } else {
        console.log('Server: No offers found for location:', location)
        return { data: [], error: null }
      }
    }

    // Step 4: Filter by disciplines if provided
    if (disciplineIds && disciplineIds.length > 0) {
      const { data: disciplineMatches, error: disciplinesError } = await supabaseServer
        .from('instructor_offer_disciplines')
        .select('offer_id')
        .in('offer_id', validOfferIds)
        .in('discipline_id', disciplineIds)

      if (disciplinesError) {
        console.error('Server: Failed to filter by disciplines:', disciplinesError)
      } else if (disciplineMatches && disciplineMatches.length > 0) {
        validOfferIds = disciplineMatches.map(d => d.offer_id)
        console.log(`Server: Filtered to ${validOfferIds.length} offers by disciplines`)
      } else {
        console.log('Server: No offers found for disciplines:', disciplineIds)
        return { data: [], error: null }
      }
    }

    // Get instructors with valid offers
    const validInstructorIds = [...new Set(
      offers.filter(o => validOfferIds.includes(o.id)).map(o => o.instructor_id)
    )]

    console.log(`Server: Found ${validInstructorIds.length} instructors with valid offers`)

    // Step 5: Filter out fully booked instructors if date range provided
    let availableInstructorIds = validInstructorIds
    if (startDate && endDate) {
      const { data: bookings, error: bookingsError } = await supabaseServer
        .from('bookings')
        .select('instructor_id, id')
        .in('instructor_id', validInstructorIds)
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)

      if (bookingsError) {
        console.error('Server: Failed to fetch bookings:', bookingsError)
      } else if (bookings && bookings.length > 0) {
        const bookingIds = bookings.map(b => b.id)

        // Get booking items for these bookings in the date range
        const { data: bookingItems, error: itemsError } = await supabaseServer
          .from('booking_items')
          .select('booking_id')
          .in('booking_id', bookingIds)
          .gte('date', startDate)
          .lte('date', endDate)

        if (!itemsError && bookingItems && bookingItems.length > 0) {
          // Get instructor IDs with bookings
          const bookedInstructorIds = new Set(
            bookings
              .filter(b => bookingItems.some(bi => bi.booking_id === b.id))
              .map(b => b.instructor_id)
          )

          // Exclude fully booked instructors
          availableInstructorIds = validInstructorIds.filter(id => !bookedInstructorIds.has(id))
          console.log(`Server: Filtered out ${bookedInstructorIds.size} booked instructors, ${availableInstructorIds.length} available`)
        }
      }
    }

    if (availableInstructorIds.length === 0) {
      console.log('Server: No available instructors found')
      return { data: [], error: null }
    }

    // Step 6: Get languages for available instructors
    const { data: userLanguages, error: languagesError } = await supabaseServer
      .from('user_languages')
      .select('user_id, name')
      .in('user_id', availableInstructorIds)

    if (languagesError) {
      console.error('Server: Failed to fetch languages:', languagesError)
    }

    // Step 7: Get images for available instructors
    const { data: instructorImages, error: imagesError } = await supabaseServer
      .from('instructor_images')
      .select('instructor_id, image_url')
      .in('instructor_id', availableInstructorIds)
      .order('created_at', { ascending: true })

    if (imagesError) {
      console.error('Server: Failed to fetch images:', imagesError)
    }

    // Step 8: Aggregate data per instructor
    const languagesMap = new Map<string, string[]>()
    userLanguages?.forEach(ul => {
      if (!languagesMap.has(ul.user_id)) {
        languagesMap.set(ul.user_id, [])
      }
      languagesMap.get(ul.user_id)?.push(ul.name)
    })

    const imagesMap = new Map<string, string[]>()
    instructorImages?.forEach(img => {
      if (!imagesMap.has(img.instructor_id)) {
        imagesMap.set(img.instructor_id, [])
      }
      imagesMap.get(img.instructor_id)?.push(img.image_url)
    })

    const pricesMap = new Map<string, number>()
    offers.forEach(offer => {
      if (validOfferIds.includes(offer.id) && offer.hourly_rate_weekday) {
        const current = pricesMap.get(offer.instructor_id)
        if (!current || offer.hourly_rate_weekday < current) {
          pricesMap.set(offer.instructor_id, offer.hourly_rate_weekday)
        }
      }
    })

    // Step 9: Build result set with pagination
    const results = availableInstructorIds
      .map(instructorId => {
        const instructor = instructors.find(i => i.id === instructorId)
        if (!instructor) return null

        return {
          ...instructor,
          languages: languagesMap.get(instructorId) || [],
          images: imagesMap.get(instructorId) || [],
          minPrice: pricesMap.get(instructorId) || null
        }
      })
      .filter(Boolean)
      .slice(offset, offset + limit)

    console.log(`Server: Returning ${results.length} instructors (offset: ${offset}, limit: ${limit})`)
    return { data: results, error: null }

  } catch (error) {
    console.error('Server: Error searching instructors:', error)
    return { data: null, error: error as Error }
  }
}