"use client";
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SearchLoadingSpinner } from "@/components/ui/loading-spinner";
import { Calendar } from "@/components/calendar/Calendar";

// TypeScript interfaces for Supabase integration
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
  icon: string;
}

export interface SportDiscipline {
  id: string;
  name: string;
  image_url: string;
}

export type ModalStep = 'location' | 'dates' | 'sport' | 'participants';

export interface ParticipantCounts {
  adults: number;
  teenagers: number;
  children: number;
}

// Section type for accordion
type SectionId = 'location' | 'dates' | 'sport' | 'participants';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  locations?: Location[];
  sportOptions?: SportOption[];
  sportDisciplines?: SportDiscipline[];
  onLocationSelect?: (location: Location) => void;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  isLoading?: boolean;
  selectedLocation?: Location | null;
  selectedSports?: string[];
  onSportSelect?: (sportIds: string[]) => void;
  participantCounts?: ParticipantCounts;
  onParticipantCountsChange?: (counts: ParticipantCounts) => void;
  selectedDates?: { startDate: string | null; endDate: string | null };
  onDatesSelect?: (startDate: string, endDate: string) => void;
  onSearch?: (searchData: {
    location: Location;
    sports: string[];
    participants: ParticipantCounts;
    dates: { startDate: string; endDate: string };
  }) => void;
}

// Icons for section headers
const LocationIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 10.625C11.3807 10.625 12.5 9.50571 12.5 8.125C12.5 6.74429 11.3807 5.625 10 5.625C8.61929 5.625 7.5 6.74429 7.5 8.125C7.5 9.50571 8.61929 10.625 10 10.625Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16.25 8.125C16.25 13.75 10 18.125 10 18.125C10 18.125 3.75 13.75 3.75 8.125C3.75 6.4674 4.40848 4.87769 5.58058 3.70558C6.75269 2.53348 8.3424 1.875 10 1.875C11.6576 1.875 13.2473 2.53348 14.4194 3.70558C15.5915 4.87769 16.25 6.4674 16.25 8.125Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CalendarIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15.8333 3.33334H4.16667C3.24619 3.33334 2.5 4.07953 2.5 5V16.6667C2.5 17.5872 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5872 17.5 16.6667V5C17.5 4.07953 16.7538 3.33334 15.8333 3.33334Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 1.66666V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M6.66667 1.66666V5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.5 8.33334H17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66666 10 1.66666C5.39763 1.66666 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.08333 7.5H17.9167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2.08333 12.5H17.9167" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M10 1.66666C12.0844 3.94862 13.269 6.91003 13.3333 10C13.269 13.09 12.0844 16.0514 10 18.3333C7.91562 16.0514 6.73106 13.09 6.66667 10C6.73106 6.91003 7.91562 3.94862 10 1.66666Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ParticipantsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14.1667 17.5V15.8333C14.1667 14.9493 13.8155 14.1014 13.1903 13.4763C12.5652 12.8512 11.7174 12.5 10.8333 12.5H4.16667C3.28261 12.5 2.43476 12.8512 1.80964 13.4763C1.18452 14.1014 0.833333 14.9493 0.833333 15.8333V17.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7.5 9.16667C9.34095 9.16667 10.8333 7.67428 10.8333 5.83333C10.8333 3.99238 9.34095 2.5 7.5 2.5C5.65905 2.5 4.16667 3.99238 4.16667 5.83333C4.16667 7.67428 5.65905 9.16667 7.5 9.16667Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.1667 17.5V15.8333C19.1661 15.0948 18.9203 14.3773 18.4678 13.7936C18.0153 13.2099 17.3818 12.793 16.6667 12.6083" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M13.3333 2.60834C14.0503 2.79192 14.6858 3.20892 15.1396 3.79359C15.5935 4.37827 15.8398 5.09736 15.8398 5.8375C15.8398 6.57765 15.5935 7.29674 15.1396 7.88141C14.6858 8.46609 14.0503 8.88309 13.3333 9.06667" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.3333 4L6 11.3333L2.66667 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronIcon = ({ isExpanded }: { isExpanded: boolean }) => (
  <motion.svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    animate={{ rotate: isExpanded ? 180 : 0 }}
    transition={{ duration: 0.2 }}
  >
    <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </motion.svg>
);

// Reusable SearchSection Component
interface SearchSectionProps {
  id: SectionId;
  icon: React.ReactNode;
  title: string;
  summary: string | null;
  isExpanded: boolean;
  isComplete: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const SearchSection = ({
  icon,
  title,
  summary,
  isExpanded,
  isComplete,
  onToggle,
  children,
}: SearchSectionProps) => {
  return (
    <div className="border border-[#3B3B40] rounded-2xl overflow-hidden bg-[rgba(255,255,255,0.05)] backdrop-blur-sm">
      {/* Section Header */}
      <motion.button
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left transition-colors hover:bg-[rgba(255,255,255,0.05)]"
        whileTap={{ scale: 0.995 }}
      >
        <div className="flex items-center gap-3">
          <div className={`text-white ${isComplete ? 'opacity-100' : 'opacity-60'}`}>
            {icon}
          </div>
          <div className="flex flex-col">
            <span className={`font-['Archivo'] font-medium text-[15px] ${isComplete ? 'text-white' : 'text-[#cbcbd2]'}`}>
              {title}
            </span>
            {!isExpanded && (
              <span className={`font-['Archivo'] font-light text-[13px] ${isComplete ? 'text-white' : 'text-[#cbcbd2] opacity-60'}`}>
                {summary || 'Not selected'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isComplete && !isExpanded && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-green-400"
            >
              <CheckIcon />
            </motion.div>
          )}
          <div className="text-[#cbcbd2]">
            <ChevronIcon isExpanded={isExpanded} />
          </div>
        </div>
      </motion.button>

      {/* Section Content */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.04, 0.62, 0.23, 0.98] }}
          >
            <div className="px-5 pb-5 pt-2 border-t border-[#3B3B40]">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Participant Counter Component
interface ParticipantCounterProps {
  title: string;
  description: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minimumValue?: number;
  isLast?: boolean;
}

const ParticipantCounter = ({
  title,
  description,
  count,
  onIncrement,
  onDecrement,
  minimumValue = 0,
  isLast = false
}: ParticipantCounterProps) => {
  const isAtMinimum = count <= minimumValue;

  return (
    <div className={`flex items-center justify-between py-4 ${!isLast ? 'border-b border-[#3B3B40]' : ''}`}>
      <div>
        <div className="font-['Archivo'] font-medium text-white text-base">
          {title}
        </div>
        <div className="font-['Archivo'] font-light text-[#cbcbd2] text-sm">
          {description}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <motion.button
          onClick={onDecrement}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            isAtMinimum
              ? 'bg-[rgba(255,255,255,0.05)] text-[#666] cursor-not-allowed'
              : 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)]'
          }`}
          whileHover={!isAtMinimum ? { scale: 1.1 } : {}}
          whileTap={!isAtMinimum ? { scale: 0.9 } : {}}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.button>
        <div className="w-10 text-center font-['Archivo'] font-medium text-white text-lg">
          {count}
        </div>
        <motion.button
          onClick={onIncrement}
          className="w-9 h-9 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

// Location Card Component
const LocationCard = ({
  location,
  onClick,
  isSelected
}: {
  location: Location;
  onClick?: () => void;
  isSelected?: boolean;
}) => {
  const [imageError, setImageError] = useState(false);

  // Determine country flag emoji
  const getFlagEmoji = (countryCode: string) => {
    if (countryCode === 'FR') return '🇫🇷';
    if (countryCode === 'CH') return '🇨🇭';
    if (countryCode === 'AT') return '🇦🇹';
    if (countryCode === 'IT') return '🇮🇹';
    return '🏔️';
  };

  const hasValidImage = location.thumbnail_url && location.thumbnail_url.trim() !== '' && !imageError;

  return (
    <motion.div
      className={`h-[57px] relative shrink-0 w-full cursor-pointer group rounded-xl transition-colors ${
        isSelected ? 'bg-[rgba(255,255,255,0.15)]' : 'hover:bg-[rgba(255,255,255,0.05)]'
      }`}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Location Details */}
      <div className="absolute box-border content-stretch flex flex-col items-start justify-start left-[65px] p-0 translate-y-[-50%] right-4 top-1/2">
        <div className="box-border content-stretch flex flex-row gap-2 items-center justify-start p-0 relative shrink-0 w-full">
          <div className="relative shrink-0 size-[16px] flex items-center justify-center text-sm">
            {getFlagEmoji(location.country_code)}
          </div>
          <div className="font-['Archivo'] font-medium h-full leading-[1.4] not-italic relative shrink-0 text-[#ffffff] text-[15px] text-left tracking-[0.08px] flex-1 min-w-0 truncate">
            {location.name}
          </div>
          {isSelected && (
            <div className="text-green-400 shrink-0">
              <CheckIcon />
            </div>
          )}
        </div>
        <div className="font-['Archivo'] font-light leading-[1.4] not-italic relative shrink-0 text-[#cbcbd2] text-[13px] text-left text-nowrap">
          from €{location.average_price}/ph
        </div>
      </div>

      {/* Location Image */}
      <div className="absolute left-1 top-1/2 -translate-y-1/2 rounded-lg size-[49px] overflow-hidden group-hover:scale-105 transition-transform duration-200">
        {hasValidImage ? (
          <img
            src={location.thumbnail_url}
            alt={`${location.name} ski resort`}
            className="w-full h-full object-cover rounded-lg"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500/80 to-purple-600/80 flex items-center justify-center rounded-lg">
            <span className="text-lg">{getFlagEmoji(location.country_code)}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// Default locations fallback
const defaultLocations: Location[] = [
  {
    id: "1",
    name: "Courchevel 1850",
    country: "France",
    country_code: "FR",
    average_price: 380,
    currency: "EUR",
    thumbnail_url: "",
    description: "Luxury resort in Les 3 Vallées"
  },
];

export const SearchModal = ({
  isOpen,
  onClose,
  locations = defaultLocations,
  sportDisciplines = [],
  onLocationSelect,
  searchValue = "",
  onSearchChange,
  isLoading = false,
  selectedLocation,
  selectedDates,
  onDatesSelect,
  selectedSports = [],
  onSportSelect,
  participantCounts = { adults: 1, teenagers: 0, children: 0 },
  onParticipantCountsChange,
  onSearch,
}: SearchModalProps) => {
  // Local state for expanded section
  const [expandedSection, setExpandedSection] = useState<SectionId>('location');
  const [internalSearchValue, setInternalSearchValue] = useState(searchValue);
  const [isSearching, setIsSearching] = useState(false);

  // Toggle section expansion (accordion behavior)
  const toggleSection = (section: SectionId) => {
    setExpandedSection(section);
  };

  // Debounced search function
  const debouncedSearch = useMemo(() => {
    const timeoutRef: { current: NodeJS.Timeout | null } = { current: null };

    return (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setIsSearching(true);

      timeoutRef.current = setTimeout(() => {
        onSearchChange?.(value);
        setIsSearching(false);
      }, 300);
    };
  }, [onSearchChange]);

  const handleSearchChange = (value: string) => {
    setInternalSearchValue(value);
    debouncedSearch(value);
  };

  // Filter locations based on search value
  const { filteredLocations, totalMatches } = useMemo(() => {
    if (!internalSearchValue.trim()) {
      return {
        filteredLocations: locations.slice(0, 5),
        totalMatches: 5
      };
    }

    const allMatches = locations.filter(location =>
      location.name.toLowerCase().includes(internalSearchValue.toLowerCase()) ||
      location.description?.toLowerCase().includes(internalSearchValue.toLowerCase())
    );

    return {
      filteredLocations: allMatches.slice(0, 6),
      totalMatches: allMatches.length
    };
  }, [locations, internalSearchValue]);

  // Calculate section summaries
  const locationSummary = selectedLocation?.name || null;

  const datesSummary = useMemo(() => {
    if (!selectedDates?.startDate || !selectedDates?.endDate) return null;
    const start = new Date(selectedDates.startDate);
    const end = new Date(selectedDates.endDate);
    const startFormatted = start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    const endFormatted = end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${startFormatted} - ${endFormatted}`;
  }, [selectedDates]);

  const sportsSummary = useMemo(() => {
    if (selectedSports.length === 0) return null;
    const selectedNames = sportDisciplines
      .filter(d => selectedSports.includes(d.id))
      .map(d => d.name);
    if (selectedNames.length === 0) return null;
    if (selectedNames.length === 1) return selectedNames[0];
    if (selectedNames.length === 2) return selectedNames.join(' & ');
    return `${selectedNames.length} disciplines`;
  }, [selectedSports, sportDisciplines]);

  const participantsSummary = useMemo(() => {
    const total = participantCounts.adults + participantCounts.teenagers + participantCounts.children;
    if (total === 0) return null;
    if (total === 1) return '1 participant';
    return `${total} participants`;
  }, [participantCounts]);

  // Determine section completion
  const isLocationComplete = !!selectedLocation;
  const isDatesComplete = !!(selectedDates?.startDate && selectedDates?.endDate);
  const isSportsComplete = selectedSports.length > 0;
  const isParticipantsComplete = (participantCounts.adults + participantCounts.teenagers + participantCounts.children) > 0;

  // Check if search can be submitted
  const canSearch = isLocationComplete && isDatesComplete && isParticipantsComplete;

  const handleSearchComplete = () => {
    if (onSearch && selectedLocation && selectedDates?.startDate && selectedDates?.endDate) {
      onSearch({
        location: selectedLocation,
        sports: selectedSports,
        participants: participantCounts,
        dates: {
          startDate: selectedDates.startDate,
          endDate: selectedDates.endDate
        }
      });
    }
    onClose();
  };

  const showLoading = isLoading || isSearching;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        className="absolute inset-0 bg-black/60"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 30 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className="relative z-10 w-full max-w-[600px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Modal Container */}
        <div className="bg-[rgba(20,20,24,0.95)] box-border flex flex-col gap-4 p-6 sm:p-8 relative rounded-3xl backdrop-blur-[25px] border border-[#3B3B40]">

          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-['Archivo'] font-semibold text-white text-xl sm:text-2xl">
              Find your instructor
            </h2>
            <motion.button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-[#cbcbd2] hover:text-white hover:bg-[rgba(255,255,255,0.2)] transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </motion.button>
          </div>

          {/* Accordion Sections */}
          <div className="flex flex-col gap-3">

            {/* Location Section */}
            <SearchSection
              id="location"
              icon={<LocationIcon />}
              title="Location"
              summary={locationSummary}
              isExpanded={expandedSection === 'location'}
              isComplete={isLocationComplete}
              onToggle={() => toggleSection('location')}
            >
              {/* Search Input */}
              <div className="mb-4">
                <div className="bg-[rgba(255,255,255,0.08)] relative rounded-lg w-full">
                  <div className="flex flex-row gap-3 items-center px-4 py-0 w-full">
                    <input
                      type="text"
                      value={internalSearchValue}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search resorts..."
                      className="font-['Archivo'] font-light min-h-[44px] flex-1 text-[#cbcbd2] text-[15px] bg-transparent border-none outline-none placeholder:text-[#666]"
                      autoFocus
                    />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-[#666] shrink-0">
                      <path d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>

              {/* Location Results */}
              <div className="flex flex-col gap-1">
                <div className="font-['Archivo'] font-light text-[#cbcbd2] text-[12px] mb-2 uppercase tracking-wider">
                  {internalSearchValue.trim() ? `Results` : "Popular resorts"}
                </div>

                {showLoading ? (
                  <SearchLoadingSpinner />
                ) : (
                  <>
                    {filteredLocations.map((location) => (
                      <LocationCard
                        key={location.id}
                        location={location}
                        isSelected={selectedLocation?.id === location.id}
                        onClick={() => {
                          onLocationSelect?.(location);
                          // Auto-advance to dates section after selection
                          setTimeout(() => setExpandedSection('dates'), 200);
                        }}
                      />
                    ))}

                    {filteredLocations.length === 0 && !showLoading && (
                      <div className="text-[#cbcbd2] text-center py-6 font-['Archivo'] font-light">
                        <p>No resorts found</p>
                        <p className="text-xs mt-1 opacity-70">Try a different search term</p>
                      </div>
                    )}

                    {internalSearchValue.trim() && filteredLocations.length > 0 && totalMatches > filteredLocations.length && (
                      <div className="text-[#cbcbd2] text-center text-xs mt-2 opacity-70 font-['Archivo'] font-light">
                        Showing {filteredLocations.length} of {totalMatches} resorts
                      </div>
                    )}
                  </>
                )}
              </div>
            </SearchSection>

            {/* Dates Section */}
            <SearchSection
              id="dates"
              icon={<CalendarIcon />}
              title="Dates"
              summary={datesSummary}
              isExpanded={expandedSection === 'dates'}
              isComplete={isDatesComplete}
              onToggle={() => toggleSection('dates')}
            >
              <Calendar
                selectionMode="range"
                showBookingIndicators={false}
                onRangeSelect={(startDate, endDate) => {
                  if (startDate && endDate) {
                    onDatesSelect?.(startDate, endDate);
                    // Auto-advance to sport section after selection
                    setTimeout(() => setExpandedSection('sport'), 200);
                  }
                }}
                className="w-full"
              />
            </SearchSection>

            {/* Sport Section */}
            <SearchSection
              id="sport"
              icon={<SportIcon />}
              title="Discipline"
              summary={sportsSummary}
              isExpanded={expandedSection === 'sport'}
              isComplete={isSportsComplete}
              onToggle={() => toggleSection('sport')}
            >
              <div className="font-['Archivo'] font-light text-[#cbcbd2] text-[12px] mb-3 uppercase tracking-wider">
                Select one or more disciplines
              </div>
              <div className="flex flex-wrap gap-2">
                {sportDisciplines.map((discipline) => {
                  const isSelected = selectedSports.includes(discipline.id);
                  return (
                    <motion.button
                      key={discipline.id}
                      className={`relative h-9 rounded-full shrink-0 cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'bg-white'
                          : 'bg-[#25252b] hover:bg-[#2a2a31] border border-[#3B3B40]'
                      }`}
                      onClick={() => {
                        const newSelectedSports = isSelected
                          ? selectedSports.filter(id => id !== discipline.id)
                          : [...selectedSports, discipline.id];
                        onSportSelect?.(newSelectedSports);
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex flex-row gap-2 h-9 items-center justify-center overflow-clip pl-2 pr-3 py-1">
                        {discipline.image_url && (
                          <div className="relative shrink-0 size-5">
                            <img
                              alt=""
                              className="block max-w-none size-full object-contain"
                              src={discipline.image_url}
                            />
                          </div>
                        )}
                        <span
                          className={`font-['Archivo'] font-normal text-[13px] text-nowrap ${
                            isSelected ? 'text-[#0d0d0f]' : 'text-white'
                          }`}
                        >
                          {discipline.name}
                        </span>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
              {sportDisciplines.length === 0 && (
                <div className="text-[#cbcbd2] text-center py-4 font-['Archivo'] font-light text-sm">
                  No disciplines available
                </div>
              )}
            </SearchSection>

            {/* Participants Section */}
            <SearchSection
              id="participants"
              icon={<ParticipantsIcon />}
              title="Participants"
              summary={participantsSummary}
              isExpanded={expandedSection === 'participants'}
              isComplete={isParticipantsComplete}
              onToggle={() => toggleSection('participants')}
            >
              <div className="space-y-0">
                <ParticipantCounter
                  title="Adults"
                  description="16 years and older"
                  count={participantCounts.adults}
                  onIncrement={() => {
                    onParticipantCountsChange?.({
                      ...participantCounts,
                      adults: participantCounts.adults + 1
                    });
                  }}
                  onDecrement={() => {
                    onParticipantCountsChange?.({
                      ...participantCounts,
                      adults: Math.max(0, participantCounts.adults - 1)
                    });
                  }}
                  minimumValue={0}
                />

                <ParticipantCounter
                  title="Teenagers"
                  description="10 to 15 years"
                  count={participantCounts.teenagers}
                  onIncrement={() => {
                    onParticipantCountsChange?.({
                      ...participantCounts,
                      teenagers: participantCounts.teenagers + 1
                    });
                  }}
                  onDecrement={() => {
                    onParticipantCountsChange?.({
                      ...participantCounts,
                      teenagers: Math.max(0, participantCounts.teenagers - 1)
                    });
                  }}
                  minimumValue={0}
                />

                <ParticipantCounter
                  title="Children"
                  description="4 to 9 years"
                  count={participantCounts.children}
                  onIncrement={() => {
                    onParticipantCountsChange?.({
                      ...participantCounts,
                      children: participantCounts.children + 1
                    });
                  }}
                  onDecrement={() => {
                    onParticipantCountsChange?.({
                      ...participantCounts,
                      children: Math.max(0, participantCounts.children - 1)
                    });
                  }}
                  minimumValue={0}
                  isLast={true}
                />
              </div>
            </SearchSection>
          </div>

          {/* Search Button */}
          <motion.button
            onClick={handleSearchComplete}
            disabled={!canSearch}
            className={`w-full mt-2 py-3.5 rounded-2xl font-['Archivo'] font-semibold text-[15px] transition-all ${
              canSearch
                ? 'bg-white text-[#0d0d0f] hover:bg-gray-100 cursor-pointer'
                : 'bg-[rgba(255,255,255,0.1)] text-[#666] cursor-not-allowed'
            }`}
            whileHover={canSearch ? { scale: 1.01 } : {}}
            whileTap={canSearch ? { scale: 0.99 } : {}}
          >
            {canSearch ? 'Search Instructors' : 'Complete all required fields'}
          </motion.button>

          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mt-1">
            {[
              { complete: isLocationComplete, label: 'Location' },
              { complete: isDatesComplete, label: 'Dates' },
              { complete: isParticipantsComplete, label: 'Participants' },
            ].map((item, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  item.complete ? 'bg-green-400' : 'bg-[#3B3B40]'
                }`}
                title={item.label}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchModal;
