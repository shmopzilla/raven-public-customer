"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { InstructorProfileCard } from "@/components/raven/instructor-profile-card";
import { StickySearchHeader } from "@/components/raven/sticky-search-header";
import { GlobalSearchModal } from "@/components/ui/global-search-modal";
import { Instructor } from "@/lib/mock-data/instructors";
import { useSearch } from "@/lib/contexts/search-context";

// Types are now exported from SearchContext - no need to redefine them here

const INITIAL_LOAD_COUNT = 6;
const LOAD_MORE_COUNT = 6;

// Mock data generators for non-name/age fields
const nationalities: ("FR" | "IT" | "EN" | "SP" | "GR")[] = ["FR", "IT", "EN", "SP", "GR"];
const sports: ("ski" | "snowboard" | "touring")[] = ["ski", "snowboard", "touring"];
const priceOptions = [75, 90, 100, 120, 150, 180, 200, 220];

const languages = [
  ["French", "English"],
  ["Italian", "English", "German"],
  ["English", "French"],
  ["Spanish", "English", "Portuguese"],
  ["Greek", "English", "Italian"],
  ["French", "English", "Spanish"],
  ["German", "English"],
  ["English"],
];

const taglines = [
  "Fine tune your form, Après-ski companion",
  "Master freestyle tricks, Park specialist",
  "Off-piste expert, Avalanche certified",
  "Beginner specialist, Patient teacher",
  "Mountain guide, Backcountry specialist",
  "Freestyle coach, Youth programs",
  "Racing technique specialist",
  "All-mountain expert",
  "Powder enthusiast",
  "Competition coach",
  "Safety first instructor",
  "Advanced carving techniques",
  "Mogul master",
  "Cross-country specialist",
  "Adaptive skiing expert",
];

const profileImages = [
  "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=150&h=150&fit=crop",
];

const actionShotSets = [
  [
    "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1518611507436-f9221403cca2?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1486915309851-b0cc1f8a0084?w=800&h=600&fit=crop",
  ],
  [
    "https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1551524559-8af4e6624178?w=800&h=600&fit=crop",
  ],
  [
    "https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1544966503-7cc5ac882d5a?w=800&h=600&fit=crop",
    "https://images.unsplash.com/photo-1564919440809-55b7a1d45990?w=800&h=600&fit=crop",
  ],
];

// Helper to create hybrid instructor data (real name/age/avatar/languages/images + mock other fields)
function createHybridInstructor(dbInstructor: any, index: number): Instructor {
  return {
    id: dbInstructor.id,
    // REAL DATA: name from database
    fullName: `${dbInstructor.first_name} ${dbInstructor.last_name}`.trim(),
    // REAL DATA: date of birth from database
    dateOfBirth: dbInstructor.date_of_birth || dbInstructor.birth_date || "1990-01-01",
    // REAL DATA: avatar URL from database (with fallback to mock)
    profileThumbUrl: dbInstructor.avatar_url || profileImages[index % profileImages.length],
    // REAL DATA: languages from database (with fallback to mock)
    languages: dbInstructor.languages && dbInstructor.languages.length > 0
      ? dbInstructor.languages
      : languages[index % languages.length],
    // REAL DATA: action shot images from database (with fallback to mock)
    actionShotUrls: dbInstructor.images && dbInstructor.images.length > 0
      ? dbInstructor.images
      : actionShotSets[index % actionShotSets.length],
    // MOCK DATA: everything else
    nationality: nationalities[index % nationalities.length],
    sport: sports[index % sports.length],
    priceHourlyEuros: priceOptions[index % priceOptions.length],
    tagline: taglines[index % taglines.length],
    available: index % 3 !== 0, // 2 out of 3 are available
  };
}

export default function SearchResultsPage() {
  const router = useRouter();
  const [allInstructors, setAllInstructors] = useState<Instructor[]>([]);
  const [displayedCount, setDisplayedCount] = useState(INITIAL_LOAD_COUNT);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);
  const { searchCriteria, setSearchCriteria } = useSearch();

  // Modal state and data are now managed globally via SearchContext
  // No local state needed!

  const displayedInstructors = allInstructors.slice(0, displayedCount);
  const hasMore = displayedCount < allInstructors.length;

  const handleCardClick = (instructorId: string) => {
    console.log("Navigate to instructor profile:", instructorId);
    router.push(`/raven/profile/${instructorId}`);
  };

  // Fetch real instructors on mount
  useEffect(() => {
    async function fetchInstructors() {
      try {
        setIsLoadingInitial(true);
        setError(null);

        console.log("Fetching instructors from API...");
        const response = await fetch("/api/calendar/instructors");
        const result = await response.json();

        if (!response.ok || !result.data) {
          throw new Error(result.error || "Failed to fetch instructors");
        }

        console.log(`Found ${result.data.length} instructors from database`);

        // Create hybrid instructors: real name/age/avatar/languages/images + mock other fields
        const hybridInstructors = result.data.map((dbInstructor: any, index: number) =>
          createHybridInstructor(dbInstructor, index)
        );

        setAllInstructors(hybridInstructors);
      } catch (err: any) {
        console.error("Error fetching instructors:", err);
        setError(err.message || "Failed to load instructors");
      } finally {
        setIsLoadingInitial(false);
      }
    }

    fetchInstructors();
  }, []);

  // Data fetching and modal pre-filling are now handled by SearchContext
  // No need for local data fetching or manual pre-filling!

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setDisplayedCount((prev) => Math.min(prev + LOAD_MORE_COUNT, allInstructors.length));
    setIsLoadingMore(false);
  }, [isLoadingMore, hasMore, allInstructors.length]);

  // Event handlers - now use global context
  const { openSearchModal } = useSearch();

  const handleSearchClick = () => {
    openSearchModal();
  };

  // All other modal handlers (location, sport, participants, search complete)
  // are now managed internally by GlobalSearchModal via SearchContext

  useEffect(() => {
    setHasInitialized(true);
  }, []);

  useEffect(() => {
    if (!hasInitialized) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      {
        root: null,
        rootMargin: "100px", // Trigger 100px before the element comes into view
        threshold: 0.1,
      }
    );

    const currentObserverRef = observerRef.current;
    if (currentObserverRef) {
      observer.observe(currentObserverRef);
    }

    return () => {
      if (currentObserverRef) {
        observer.unobserve(currentObserverRef);
      }
    };
  }, [hasInitialized, hasMore, isLoadingMore, loadMore]);

  // Loading state
  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          <span className="font-['Archivo'] text-lg text-white">
            Finding the best instructors...
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-md text-center px-6">
          <span className="text-4xl">⚠️</span>
          <h2 className="font-['PP_Editorial_New'] text-2xl text-white">
            Oops! Something went wrong
          </h2>
          <p className="font-['Archivo'] text-[#d5d5d6]">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-3 bg-white text-black rounded-full font-['Archivo'] font-medium hover:bg-white/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0f]">
      {/* Sticky Search Header */}
      <StickySearchHeader onSearchClick={handleSearchClick} />

      {/* Search Results Grid */}
      <div className="container mx-auto px-6 pt-32 pb-12">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, staggerChildren: 0.1 }}
        >
          {displayedInstructors.map((instructor, index) => (
            <motion.div
              key={instructor.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.05,
                ease: "easeOut",
              }}
            >
              <InstructorProfileCard
                instructor={instructor}
                onClick={() => handleCardClick(instructor.id)}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Intersection Observer Target */}
        {hasMore && (
          <div
            ref={observerRef}
            className="flex justify-center mt-12 h-20 items-center"
          >
            {isLoadingMore && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span className="font-['Archivo'] text-sm text-[#d5d5d6]">
                  Loading more instructors...
                </span>
              </div>
            )}
          </div>
        )}

        {/* End of results message */}
        {!hasMore && allInstructors.length > 0 && (
          <div className="flex justify-center mt-12">
            <p className="font-['Archivo'] text-sm text-[#d5d5d6]">
              You've seen all {allInstructors.length} available instructors
            </p>
          </div>
        )}

        {/* No results message */}
        {!isLoadingInitial && allInstructors.length === 0 && (
          <div className="flex flex-col items-center justify-center mt-20">
            <span className="text-6xl mb-4">🏔️</span>
            <h3 className="font-['PP_Editorial_New'] text-2xl text-white mb-2">
              No instructors found
            </h3>
            <p className="font-['Archivo'] text-[#d5d5d6]">
              Try adjusting your search criteria
            </p>
          </div>
        )}
      </div>

      {/* Global Search Modal - state managed via SearchContext */}
      {/* shouldNavigate=false means it stays on this page after search */}
      <GlobalSearchModal shouldNavigate={false} />
    </div>
  );
}