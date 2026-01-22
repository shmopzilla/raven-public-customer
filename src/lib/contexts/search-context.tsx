"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  fallbackLocations,
  fallbackSportOptions,
  fallbackSportDisciplines,
} from '@/lib/fallback-data';

// Re-export types for convenience
export interface Location {
  id: string;
  name: string;
  country: string;
  country_code: string;
  average_price: number;
  currency: string;
  thumbnail_url: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SportOption {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export interface SportDiscipline {
  id: string;
  sportId?: string;
  name: string;
  image_url?: string;
}

export interface ParticipantCounts {
  adults: number;
  teenagers: number;
  children: number;
}

export interface SearchCriteria {
  location: string;
  startDate: string;
  endDate: string;
  participants: {
    adults: number;
    children: number;
  };
  sport?: string;
}

interface SearchContextType {
  // Final search criteria
  searchCriteria: SearchCriteria | null;
  setSearchCriteria: (criteria: SearchCriteria) => void;
  clearSearch: () => void;
  formatSearchSummary: () => string;

  // Initialize from URL params (for external Framer redirects)
  initializeFromUrl: (params: URLSearchParams) => boolean;

  // Modal state
  isModalOpen: boolean;
  openSearchModal: () => void;
  closeSearchModal: () => void;

  // In-progress selections
  selectedLocation: Location | null;
  selectedDates: { startDate: string | null; endDate: string | null };
  selectedSports: string[];
  selectedDisciplines: string[];
  participantCounts: ParticipantCounts;

  // Update functions for in-progress selections
  updateLocation: (location: Location | null) => void;
  updateDates: (startDate: string, endDate: string) => void;
  updateSports: (sports: string[]) => void;
  updateDisciplines: (disciplines: string[]) => void;
  updateParticipants: (counts: ParticipantCounts) => void;

  // Data and loading states
  locations: Location[];
  sportOptions: SportOption[];
  sportDisciplines: SportDiscipline[];
  isLoadingData: boolean;

  // Search submission
  submitSearch: () => void;
  resetModal: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  // Final search criteria
  const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);

  // Modal state (only open/close, step navigation is handled by the modal itself)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // In-progress selections (persisted when modal closes)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [selectedDates, setSelectedDates] = useState<{ startDate: string | null; endDate: string | null }>({
    startDate: null,
    endDate: null,
  });
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [selectedDisciplines, setSelectedDisciplines] = useState<string[]>([]);
  const [participantCounts, setParticipantCounts] = useState<ParticipantCounts>({
    adults: 1,
    teenagers: 0,
    children: 0,
  });

  // Data cache
  const [locations, setLocations] = useState<Location[]>([]);
  const [sportOptions, setSportOptions] = useState<SportOption[]>([]);
  const [sportDisciplines, setSportDisciplines] = useState<SportDiscipline[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch data once on mount
  useEffect(() => {
    async function fetchData() {
      setIsLoadingData(true);
      try {
        // Fetch resorts from API
        const response = await fetch('/api/resorts');
        const result = await response.json();

        if (response.ok && result.data) {
          setLocations(result.data);
        } else {
          // Fallback to default data if API fails
          setLocations(fallbackLocations);
        }

        // Sport options and disciplines still use fallback for now
        setSportOptions(fallbackSportOptions);
        setSportDisciplines(fallbackSportDisciplines);
      } catch (error) {
        console.error('Failed to fetch search data:', error);
        // Fallback to default data
        setLocations(fallbackLocations);
        setSportOptions(fallbackSportOptions);
        setSportDisciplines(fallbackSportDisciplines);
      } finally {
        setIsLoadingData(false);
      }
    }
    fetchData();
  }, []);

  // Modal control functions
  const openSearchModal = () => {
    setIsModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsModalOpen(false);
    // Don't reset selections - they persist
  };

  // Update functions for in-progress selections
  const updateLocation = (location: Location | null) => {
    setSelectedLocation(location);
  };

  const updateDates = (startDate: string, endDate: string) => {
    setSelectedDates({ startDate, endDate });
  };

  const updateSports = (sports: string[]) => {
    setSelectedSports(sports);
  };

  const updateDisciplines = (disciplines: string[]) => {
    setSelectedDisciplines(disciplines);
  };

  const updateParticipants = (counts: ParticipantCounts) => {
    setParticipantCounts(counts);
  };

  // Submit search - convert in-progress selections to final search criteria
  const submitSearch = () => {
    if (!selectedLocation || !selectedDates.startDate || !selectedDates.endDate) {
      console.warn('Cannot submit search: missing required fields');
      return;
    }

    const criteria: SearchCriteria = {
      location: selectedLocation.name,
      startDate: selectedDates.startDate,
      endDate: selectedDates.endDate,
      participants: {
        adults: participantCounts.adults,
        children: participantCounts.teenagers + participantCounts.children,
      },
      sport: selectedSports.length > 0 ? selectedSports[0] : undefined,
    };

    setSearchCriteria(criteria);
    setIsModalOpen(false);
  };

  // Reset modal - clear all in-progress selections
  const resetModal = () => {
    setSelectedLocation(null);
    setSelectedDates({ startDate: null, endDate: null });
    setSelectedSports([]);
    setSelectedDisciplines([]);
    setParticipantCounts({ adults: 1, teenagers: 0, children: 0 });
  };

  const clearSearch = () => {
    setSearchCriteria(null);
    resetModal();
  };

  const formatSearchSummary = (): string => {
    if (!searchCriteria) return "";

    const { location, startDate, endDate, participants } = searchCriteria;

    // Format dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    const startFormatted = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endFormatted = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

    // Format participants
    const totalGuests = participants.adults + participants.children;
    const guestText = totalGuests === 1 ? '1 guest' : `${totalGuests} guests`;

    return `${location}, ${startFormatted}-${endFormatted}, ${guestText}`;
  };

  // Initialize search criteria from URL params (for external Framer redirects)
  // URL format: ?location=Chamonix&startDate=2025-02-01&endDate=2025-02-07&adults=2&children=1&disciplines=1,2
  const initializeFromUrl = (params: URLSearchParams): boolean => {
    const location = params.get('location');
    const startDate = params.get('startDate');
    const endDate = params.get('endDate');
    const adults = parseInt(params.get('adults') || '0', 10);
    const children = parseInt(params.get('children') || '0', 10);
    const disciplines = params.get('disciplines');

    // Require at least location to initialize
    if (!location) {
      return false;
    }

    // Set search criteria directly
    const criteria: SearchCriteria = {
      location,
      startDate: startDate || '',
      endDate: endDate || '',
      participants: {
        adults: adults || 1, // Default to 1 adult if not specified
        children: children || 0,
      },
    };

    setSearchCriteria(criteria);

    // Also update in-progress selections for consistency
    // Find the location in our locations list if available
    const matchedLocation = locations.find(
      (loc) => loc.name.toLowerCase() === location.toLowerCase()
    );
    if (matchedLocation) {
      setSelectedLocation(matchedLocation);
    }

    if (startDate && endDate) {
      setSelectedDates({ startDate, endDate });
    }

    setParticipantCounts({
      adults: adults || 1,
      teenagers: 0,
      children: children || 0,
    });

    // Set disciplines if provided
    if (disciplines) {
      setSelectedDisciplines(disciplines.split(','));
    }

    return true;
  };

  const value: SearchContextType = {
    // Final search criteria
    searchCriteria,
    setSearchCriteria,
    clearSearch,
    formatSearchSummary,
    initializeFromUrl,

    // Modal state
    isModalOpen,
    openSearchModal,
    closeSearchModal,

    // In-progress selections
    selectedLocation,
    selectedDates,
    selectedSports,
    selectedDisciplines,
    participantCounts,

    // Update functions
    updateLocation,
    updateDates,
    updateSports,
    updateDisciplines,
    updateParticipants,

    // Data and loading
    locations,
    sportOptions,
    sportDisciplines,
    isLoadingData,

    // Search submission
    submitSearch,
    resetModal,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}
