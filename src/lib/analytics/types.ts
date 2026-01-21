// Analytics Dashboard Types

export interface OverviewData {
  totalUsers: number
  totalInstructors: number
  totalCustomers: number
  instructorsWithAvailability: number
  averageSlotTypesPerInstructor: number
  slotTypesUsed: string[]
}

export interface SignupDataPoint {
  date: string
  instructorSignups: number
  customerSignups: number
  totalSignups: number
}

export interface SignupsData {
  series: SignupDataPoint[]
  dateRange: {
    start: string
    end: string
  }
}

export interface SlotTypeInfo {
  id: number
  name: string
  defaultStartTime: string
  defaultEndTime: string
}

export interface InstructorWithAvailability {
  id: string
  name: string
  slotTypeCount: number
  slotTypes: string[]
  dateRange: {
    earliest: string
    latest: string
  } | null
}

export interface SlotTypeAggregate {
  id: number
  name: string
  defaultStartTime: string
  defaultEndTime: string
  instructorCount: number
  instructorNames: string[]
}

export interface InstructorsAnalyticsData {
  instructors: InstructorWithAvailability[]
  summary: {
    totalInstructorsWithSlotTypes: number
    totalInstructors: number
  }
  aggregate: {
    slotTypes: SlotTypeAggregate[]
    dateRange: {
      earliest: string
      latest: string
    } | null
  }
}

export interface SlotTypeBreakdown {
  id: number
  name: string
  startTime: string
  endTime: string
  daysConfigured: string[]
}

export interface InstructorSlotDetails {
  instructor: {
    id: string
    name: string
  }
  slotTypes: SlotTypeBreakdown[]
  dateRange: {
    earliest: string
    latest: string
  } | null
}

export interface ProfileCompletenessData {
  summary: {
    totalInstructors: number
    withAvatar: number
    withGallery: number
    withLanguages: number
    withBiography: number
    withStripeAccount: number
  }
  percentages: {
    avatar: number
    gallery: number
    languages: number
    biography: number
    stripeAccount: number
  }
  details: {
    id: string
    name: string
    hasAvatar: boolean
    galleryCount: number
    languageCount: number
    hasBiography: boolean
    hasStripeAccount: boolean
  }[]
}

// API Response wrappers
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  details?: string
}
