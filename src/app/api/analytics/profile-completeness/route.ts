import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server-client'
import type { ProfileCompletenessData, ApiResponse } from '@/lib/analytics/types'

export async function GET() {
  try {
    // Get all approved instructors with profile data
    const { data: instructors, error: instructorsError } = await supabaseServer
      .from('instructors')
      .select('id, first_name, last_name, avatar_url, biography, stripe_connected_account_id')
      .eq('profile_status', 2)
      .order('first_name')

    if (instructorsError) {
      throw new Error(`Failed to fetch instructors: ${instructorsError.message}`)
    }

    // Get gallery images count per instructor
    const { data: images, error: imagesError } = await supabaseServer
      .from('instructor_images')
      .select('instructor_id')

    if (imagesError) {
      throw new Error(`Failed to fetch instructor images: ${imagesError.message}`)
    }

    // Get languages count per instructor
    const { data: languages, error: languagesError } = await supabaseServer
      .from('user_languages')
      .select('user_id')

    if (languagesError) {
      throw new Error(`Failed to fetch user languages: ${languagesError.message}`)
    }

    // Count images per instructor
    const imageCountMap = new Map<string, number>()
    images?.forEach(img => {
      imageCountMap.set(img.instructor_id, (imageCountMap.get(img.instructor_id) || 0) + 1)
    })

    // Count languages per instructor
    const languageCountMap = new Map<string, number>()
    languages?.forEach(lang => {
      languageCountMap.set(lang.user_id, (languageCountMap.get(lang.user_id) || 0) + 1)
    })

    // Build details array
    const details = (instructors || []).map(instructor => ({
      id: instructor.id,
      name: `${instructor.first_name} ${instructor.last_name}`.trim(),
      hasAvatar: Boolean(instructor.avatar_url && instructor.avatar_url.trim() !== ''),
      galleryCount: imageCountMap.get(instructor.id) || 0,
      languageCount: languageCountMap.get(instructor.id) || 0,
      hasBiography: Boolean(instructor.biography && instructor.biography.trim() !== ''),
      hasStripeAccount: Boolean(instructor.stripe_connected_account_id)
    }))

    // Calculate summary
    const totalInstructors = details.length
    const withAvatar = details.filter(d => d.hasAvatar).length
    const withGallery = details.filter(d => d.galleryCount > 0).length
    const withLanguages = details.filter(d => d.languageCount > 0).length
    const withBiography = details.filter(d => d.hasBiography).length
    const withStripeAccount = details.filter(d => d.hasStripeAccount).length

    const data: ProfileCompletenessData = {
      summary: {
        totalInstructors,
        withAvatar,
        withGallery,
        withLanguages,
        withBiography,
        withStripeAccount
      },
      percentages: {
        avatar: totalInstructors > 0 ? Math.round((withAvatar / totalInstructors) * 100) : 0,
        gallery: totalInstructors > 0 ? Math.round((withGallery / totalInstructors) * 100) : 0,
        languages: totalInstructors > 0 ? Math.round((withLanguages / totalInstructors) * 100) : 0,
        biography: totalInstructors > 0 ? Math.round((withBiography / totalInstructors) * 100) : 0,
        stripeAccount: totalInstructors > 0 ? Math.round((withStripeAccount / totalInstructors) * 100) : 0
      },
      details
    }

    const response: ApiResponse<ProfileCompletenessData> = {
      success: true,
      data
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics profile completeness error:', error)
    const response: ApiResponse<ProfileCompletenessData> = {
      success: false,
      error: 'Failed to fetch profile completeness data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
    return NextResponse.json(response, { status: 500 })
  }
}
