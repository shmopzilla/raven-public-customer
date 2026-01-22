"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SearchModal } from './search-modal';
import { useSearch } from '@/lib/contexts/search-context';

interface GlobalSearchModalProps {
  className?: string;
  shouldNavigate?: boolean; // If true, navigates to search page on submit. If false, stays on current page.
}

/**
 * GlobalSearchModal - A connected wrapper around SearchModal that manages all state through SearchContext
 *
 * This component eliminates the need for pages to manage:
 * - Modal open/close state
 * - Selection state (location, dates, sports, participants)
 * - Data fetching (locations, sports, disciplines)
 *
 * Simply add <GlobalSearchModal /> to any page where you want the search modal available.
 *
 * @param shouldNavigate - Controls navigation behavior on search submit:
 *   - true: Navigates to /raven/search (use on landing page)
 *   - false: Stays on current page (use on search results/profile pages)
 */
export function GlobalSearchModal({ className, shouldNavigate = false }: GlobalSearchModalProps) {
  const router = useRouter();
  const {
    // Modal state
    isModalOpen,
    closeSearchModal,

    // In-progress selections
    selectedLocation,
    selectedDates,
    selectedSports,
    participantCounts,

    // Update functions
    updateLocation,
    updateDates,
    updateSports,
    updateParticipants,

    // Data
    locations,
    sportDisciplines,
    isLoadingData,

    // Submit
    submitSearch,
  } = useSearch();

  // Local search input state
  const [searchValue, setSearchValue] = useState('');

  // Handle location select
  const handleLocationSelect = (location: any) => {
    updateLocation(location);
  };

  // Handle dates select
  const handleDatesSelect = (startDate: string, endDate: string) => {
    updateDates(startDate, endDate);
  };

  // Handle sport select
  const handleSportSelect = (sportIds: string[]) => {
    updateSports(sportIds);
  };

  // Handle participant counts change
  const handleParticipantCountsChange = (counts: any) => {
    updateParticipants(counts);
  };

  // Handle search submit
  const handleSearch = () => {
    submitSearch();

    // Navigate to search page if requested (e.g., from landing page)
    if (shouldNavigate) {
      router.push('/raven/search');
    }
    // Otherwise stay on current page (e.g., search results page)
  };

  return (
    <SearchModal
      isOpen={isModalOpen}
      onClose={closeSearchModal}
      locations={locations}
      sportDisciplines={sportDisciplines}
      onLocationSelect={handleLocationSelect}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
      isLoading={isLoadingData}
      selectedLocation={selectedLocation}
      selectedDates={selectedDates}
      onDatesSelect={handleDatesSelect}
      selectedSports={selectedSports}
      onSportSelect={handleSportSelect}
      participantCounts={participantCounts}
      onParticipantCountsChange={handleParticipantCountsChange}
      onSearch={handleSearch}
    />
  );
}
