"use client";

// ========================================
// ENHANCED RAVEN LANDING PAGE
// ========================================
// This component renders the complete Raven landing page with:
// - Complex hero section with multiple ski photo backgrounds
// - Interactive toggle switch for Adventurers/Instructors
// - Three-step process cards with animations
// - White content sections with alternating layouts
// - All actual design assets from Figma
// ========================================

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import SearchModal, { Location, SportOption, SportDiscipline, ModalStep, ParticipantCounts } from "@/components/ui/search-modal";
import { fallbackLocations, fallbackSportOptions, fallbackSportDisciplines } from "@/lib/fallback-data";
import { useSearch } from "@/lib/contexts/search-context";
import { AnimatedTooltip } from "@/components/ui/animated-tooltip";

// ========================================
// ASSET CONSTANTS
// Images referenced by Figma design (commented out as unused)
// const heroImages = {
//   img1: "/assets/images/ski-bg-1.png",
//   img2: "/assets/images/ski-bg-2.png", 
//   img3: "/assets/images/ski-bg-3.png",
//   img4: "/assets/images/ski-bg-4.png",
//   img5: "/assets/images/ski-bg-5.png",
//   img6: "/assets/images/ski-bg-6.png",
// };

// const sectionImages = {
//   section1: "/assets/images/content-section-1.png",
//   section2: "/assets/images/content-section-2.png",
// };

// const instructorImages = [
//   "/assets/images/instructor-1.png",
//   "/assets/images/instructor-2.png",
//   "/assets/images/instructor-3.png",
// ];

// ========================================
// CUSTOM COMPONENTS
// ========================================

// ========================================
// CUSTOM CHECKBOX COMPONENT
// ========================================
// Used in Step 3 card for activity selection
// Features:
// - Custom Raven-branded styling
// - Animated interactions
// - Actual checkmark icon from Figma
// ========================================

// Unused interface (commented out)
// interface CheckboxProps {
//   checked?: boolean;
//   onChange?: () => void;
//   label: string;
// }

// Custom checkbox component (commented out as unused)
// function CustomCheckbox({ checked = false, onChange, label }: CheckboxProps) {
//   return (
//     <motion.div 
//       className="bg-[#222225] flex items-center gap-3 px-5 py-3 rounded-lg cursor-pointer shadow-[2px_2px_50px_0px_rgba(0,0,0,0.5)]"
//       onClick={onChange}
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//     >
//       <div className={cn(
//         "w-4 h-4 rounded border flex items-center justify-center",
//         checked ? "bg-white" : "bg-[#313135]"
//       )}>
//         {checked && (
//           <img src="/assets/icons/checkmark.svg" alt="Check" className="w-3 h-3" />
//         )}
//       </div>
//       <span className="text-white text-sm font-medium font-archivo tracking-[0.07px]">{label}</span>
//     </motion.div>
//   );
// }

// ========================================
// TOGGLE SWITCH COMPONENT
// ========================================
// Header toggle for "For Adventurers" / "For Instructors"
// Features:
// - Smooth spring animations
// - Glass morphism effect with backdrop blur
// - Interactive state management
// ========================================

interface ToggleSwitchProps {
  isLeft: boolean;
  onToggle: () => void;
  leftLabel: string;
  rightLabel: string;
}

function ToggleSwitch({ isLeft, onToggle, leftLabel, rightLabel }: ToggleSwitchProps) {
  return (
    <motion.div 
      className="relative bg-[rgba(39,39,42,0.6)] backdrop-blur-[15px] rounded-[800px] h-16 w-[363px] p-2"
      whileHover={{ scale: 1.02 }}
    >
      <motion.div
        className="absolute bg-white rounded-[25px] h-12 top-2"
        animate={{
          left: isLeft ? 8 : "50%",
          width: isLeft ? "48%" : "48%"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <div className="relative flex h-full">
        <button
          onClick={() => !isLeft && onToggle()}
          className={cn(
            "flex-1 flex items-center justify-center text-base font-semibold font-inter transition-colors",
            isLeft ? "text-black" : "text-white"
          )}
        >
          {leftLabel}
        </button>
        <button
          onClick={() => isLeft && onToggle()}
          className={cn(
            "flex-1 flex items-center justify-center text-base font-semibold font-inter transition-colors",
            !isLeft ? "text-black" : "text-white"
          )}
        >
          {rightLabel}
        </button>
      </div>
    </motion.div>
  );
}


// ========================================
// STEP CARD COMPONENT
// ========================================
// Individual cards for the "How it works" section
// Features:
// - Animated hover effects (lift + scale)
// - Consistent 540px height
// - Custom content area for each step
// ========================================

interface StepCardProps {
  stepNumber: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}

function StepCard({ stepNumber, title, description, children }: StepCardProps) {
  return (
    <motion.div 
      className="bg-[#111112] rounded-2xl px-5 py-[50px] w-[356px] h-[540px] flex flex-col items-center gap-[42px]"
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Step Number - Exact Figma styling */}
      <div className="text-white text-[21px] font-bold font-inter leading-[30px] text-center h-[29px] w-full">{stepNumber}</div>
      
      {/* Content Area - Exact Figma layout */}
      <div className="relative grid grid-cols-[max-content] grid-rows-[max-content] place-items-start w-full flex-1">
        {children}
        
        {/* Text Block positioned at bottom */}
        <div className="absolute bottom-0 left-0 flex flex-col gap-[31px] items-start justify-start text-center w-[285px]">
          <h3 className="text-white text-[21px] font-bold font-inter leading-[30px] w-full">{title}</h3>
          <p className="text-[#858585] text-lg font-normal font-inter leading-[28px] w-full">{description}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ========================================
// MAIN LANDING PAGE COMPONENT
// ========================================
// Complete enhanced Raven landing page with all sections
// ========================================

export default function EnhancedRavenLanding() {
  // ========================================
  // HOOKS
  // ========================================
  const router = useRouter();
  const { setSearchCriteria } = useSearch();

  // ========================================
  // INSTRUCTOR DATA FOR TOOLTIPS
  // ========================================
  const instructorTooltipData = [
    {
      id: 1,
      name: "Marie Dubois",
      designation: "Ski Instructor",
      image: "/assets/images/instructor-1.png",
    },
    {
      id: 2,
      name: "Luca Romano",
      designation: "Snowboard Guide",
      image: "/assets/images/instructor-2.png",
    },
    {
      id: 3,
      name: "Emma Fischer",
      designation: "Alpine Expert",
      image: "/assets/images/instructor-3.png",
    },
  ];

  // ========================================
  // COMPONENT STATE
  // ========================================
  const [isForAdventurers, setIsForAdventurers] = useState(true); // Toggle switch state
  const [scrollOpacity, setScrollOpacity] = useState(1); // Background fade opacity
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false); // Search modal state
  const [searchValue, setSearchValue] = useState(""); // Search input value
  const [modalStep, setModalStep] = useState<ModalStep>('location'); // Modal step state
  const [selectedLocation, setSelectedLocation] = useState<Location | undefined>(); // Selected location from modal
  const [selectedSports, setSelectedSports] = useState<string[]>([]); // Selected sports from modal
  const [participantCounts, setParticipantCounts] = useState<ParticipantCounts>({ adults: 0, teenagers: 0, children: 0 }); // Participant counts

  // Data fetching state
  const [locations, setLocations] = useState<Location[]>([]);
  const [fetchedSportDisciplines, setFetchedSportDisciplines] = useState<SportDiscipline[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  // Unused state for checkboxes (commented out)
  // const [checkboxStates, setCheckboxStates] = useState({ // Step 3 card checkboxes
  //   telemark: true,
  //   offPiste: false,
  //   skiTouring: true,
  // });

  // const toggleCheckbox = (key: keyof typeof checkboxStates) => {
  //   setCheckboxStates(prev => ({
  //     ...prev,
  //     [key]: !prev[key]
  //   }));
  // };

  // ========================================
  // DATA FETCHING EFFECT
  // ========================================
  useEffect(() => {
    const fetchData = async () => {
      setIsDataLoading(true);
      setDataError(null);

      try {
        // Fetch resorts from API endpoint
        const resortsResponse = await fetch('/api/resorts');
        let locationsData = fallbackLocations;

        if (resortsResponse.ok) {
          const resortsResult = await resortsResponse.json();
          if (resortsResult.success && resortsResult.data) {
            console.log('Successfully fetched resorts from API:', resortsResult.data.length);
            locationsData = resortsResult.data;
          } else {
            console.warn('API returned unsuccessful response, using fallback data');
          }
        } else {
          console.warn('Failed to fetch resorts from API, using fallback data');
        }

        setLocations(locationsData);
        setFetchedSportDisciplines(fallbackSportDisciplines);

      } catch (error) {
        console.error('Error fetching data:', error);
        setDataError('Failed to load data');
        // Use fallback data on error
        setLocations(fallbackLocations);
        setFetchedSportDisciplines(fallbackSportDisciplines);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, []);

  // ========================================
  // SCROLL EFFECT FOR BACKGROUND FADE
  // ========================================
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      // const heroHeight = 1107; // Height of hero section (unused)
      const fadeStart = 200; // Start fading after 200px scroll
      const fadeEnd = 600; // Complete fade by 600px scroll
      
      if (scrollY <= fadeStart) {
        setScrollOpacity(1);
      } else if (scrollY >= fadeEnd) {
        setScrollOpacity(0);
      } else {
        // Linear fade between fadeStart and fadeEnd
        const fadeProgress = (scrollY - fadeStart) / (fadeEnd - fadeStart);
        setScrollOpacity(1 - fadeProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ========================================
  // SEARCH MODAL HANDLERS
  // ========================================
  const handleSearchClick = () => {
    setModalStep('location'); // Reset to location step
    setIsSearchModalOpen(true);
  };

  const handleLocationSelect = (location: Location) => {
    console.log("Selected location:", location);
    setSelectedLocation(location);
    // Advance to the sport selection step
    setModalStep('sport');
  };

  const handleSportSelect = (sportIds: string[]) => {
    console.log("Selected sports:", sportIds);
    setSelectedSports(sportIds);
  };

  const handleStepChange = (step: ModalStep) => {
    console.log("Step changed to:", step);
    setModalStep(step);
  };

  const handleParticipantCountsChange = (counts: ParticipantCounts) => {
    console.log("Participant counts updated:", counts);
    setParticipantCounts(counts);
  };

  const handleSearchComplete = (searchData: {
    location: Location;
    sports: string[];
    participants: ParticipantCounts;
  }) => {
    console.log("Search completed with data:", searchData);
    
    // Set search criteria in context
    setSearchCriteria({
      location: searchData.location.name,
      startDate: "2025-01-19", // Mock dates for now
      endDate: "2025-01-26",
      participants: {
        adults: searchData.participants.adults,
        children: searchData.participants.teenagers + searchData.participants.children,
      },
      sport: searchData.sports.length > 0 ? searchData.sports[0] : undefined,
    });

    // Navigate to search results
    router.push('/raven/search');
  };

  const handleModalClose = () => {
    setIsSearchModalOpen(false);
    // Reset modal state when closing
    setModalStep('location');
    setSelectedLocation(undefined);
    setSelectedSports([]);
    setParticipantCounts({ adults: 0, teenagers: 0, children: 0 });
    setSearchValue(""); // Reset search field
  };

  return (
    <div className="bg-black min-h-screen text-white">
      {/* ======================================== */}
      {/* HERO SECTION */}
      {/* Complex background with multiple ski photos */}
      {/* ======================================== */}
      <div className="relative h-[1107px] overflow-hidden">
        {/* ======================================== */}
        {/* CUSTOM BACKGROUND IMAGE */}
        {/* Single full-screen skiing background image */}
        {/* ======================================== */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-100 ease-out"
          style={{ 
            backgroundImage: "url('/assets/images/landing-hero-bg.png?v=3')",
            opacity: scrollOpacity
          }}
        >
          {/* ======================================== */}
          {/* GRADIENT OVERLAY */}
          {/* Dark gradient for text readability */}
          {/* ======================================== */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0000004d] from-[21.28%] to-[#00000099] to-[98.407%]" />
        </div>

        {/* ======================================== */}
        {/* HEADER SECTION */}
        {/* Logo, Toggle Switch, Sign In Button */}
        {/* ======================================== */}
        <div className="relative z-10 flex items-center justify-between p-12 h-[159px]">
          {/* Raven Logo (actual SVG from Figma) */}
          <img src="/assets/logos/raven-logo.svg" alt="Raven" className="h-[59px] w-[166px]" />
          
          {/* Toggle Switch Component */}
          <ToggleSwitch
            isLeft={isForAdventurers}
            onToggle={() => setIsForAdventurers(!isForAdventurers)}
            leftLabel="For Adventurers"
            rightLabel="For Instructors"
          />
          
          {/* Sign In Button with User Icon */}
          <motion.button 
            className="bg-white text-black px-6 py-3 rounded-2xl font-medium font-archivo flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <img src="/assets/icons/user.svg" alt="User" className="w-5 h-5" />
            Sign in
          </motion.button>
        </div>

        {/* ======================================== */}
        {/* MAIN HERO CONTENT */}
        {/* Title, Description, Search Bar, Filter Chips - Exact Figma Layout */}
        {/* ======================================== */}
        <div className="absolute left-1/2 top-[261px] transform -translate-x-1/2 flex flex-col gap-6 items-center justify-center w-[696px]">
          {/* ======================================== */}
          {/* HERO TEXT CONTENT */}
          {/* ======================================== */}
          <motion.div 
            className="flex flex-col gap-12 items-center justify-center text-center text-white w-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Hero Title - Exact Figma specs */}
            <h1 className="text-[80px] leading-[81px] font-pp-editorial font-normal">
              Find your perfect mountain guide
            </h1>
            {/* Hero Description - Exact Figma specs */}
            <p className="text-[#858585] text-base font-light font-archivo tracking-[0.08px] leading-[22px]">
              Raven connects you with the world&apos;s best ski and snowboard instructors, handpicked for their expertise and local knowledge
            </p>
          </motion.div>

          {/* ======================================== */}
          {/* SEARCH BAR */}
          {/* Exact Figma specifications */}
          {/* ======================================== */}
          <motion.div
            className="group frosted-glass flex items-center px-6 py-4 w-full hover:bg-[rgba(255,255,255,0.25)] transition-colors duration-200 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearchClick}
          >
            {/* Search Icon */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              className="w-6 h-6 shrink-0 text-[#9696a5] group-hover:text-white transition-colors duration-200"
            >
              <path
                d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {/* Search Placeholder Text */}
            <div className="flex-1 bg-transparent text-[#9696a5] group-hover:text-white font-archivo text-base tracking-[0.08px] leading-5 min-w-0 overflow-hidden whitespace-nowrap ml-4 transition-colors duration-200">
              Find Instructors
            </div>
          </motion.div>

        </div>
      </div>

      {/* ======================================== */}
      {/* HOW IT WORKS SECTION */}
      {/* Exact Figma layout and spacing */}
      {/* ======================================== */}
      <div className="flex flex-col gap-[100px] items-center justify-start left-1/2 px-0 py-[100px] relative transform -translate-x-1/2 w-[1440px]">
        {/* ======================================== */}
        {/* SECTION HEADER */}
        {/* Exact Figma positioning and spacing */}
        {/* ======================================== */}
        <motion.div 
          className="flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          {/* Section Tag */}
          <div className="bg-[#111112] flex gap-2.5 items-center justify-center px-5 py-2.5 relative rounded-[30px]">
            <span className="text-white font-inter font-normal text-base leading-6 text-center whitespace-nowrap">How it works</span>
          </div>
          {/* Section Title */}
          <div className="flex flex-col justify-center font-pp-editorial text-[80px] text-white text-center max-w-[1112.86px]">
            <p className="leading-[81px] mb-0">
              Reserve<br />with Raven
            </p>
          </div>
          {/* Section Description */}
          <div className="font-inter font-normal text-[#858585] text-lg text-center leading-[28px] max-w-[678.452px]">
            <p className="mb-0">
              For people who live to chase the extraordinary and venture to places others only dream of. 
              You don&apos;t follow the rules, and neither do we. Push boundaries. Break limits. Reserve with Raven.
            </p>
          </div>
        </motion.div>

        {/* ======================================== */}
        {/* THREE STEP CARDS */}
        {/* Exact Figma layout - 356px width, 540px height, 24px gap */}
        {/* ======================================== */}
        <div className="flex gap-6 items-start justify-center relative w-full">
          {/* ======================================== */}
          {/* STEP 1: TELL US WHERE YOU'RE GOING */}
          {/* Destination carousel matching Figma design */}
          {/* ======================================== */}
          <StepCard
            stepNumber="01"
            title="Tell us where you're going"
            description="Elite instruction awaits at Europe's most coveted ski destinations."
          >
            {/* Destination Carousel Container - Exact Figma positioning */}
            <div className="absolute left-[35px] top-0 w-[286px]">
              {/* Card Row - Horizontal scrollable container */}
              <div className="bg-zinc-800 flex gap-[12.73px] items-center justify-start overflow-x-auto overflow-y-clip px-[19.1px] py-2 rounded-[30px] w-full">
                {/* Courchevel 1850 Card */}
                <div className="flex flex-col gap-[12.73px] items-start justify-start shrink-0 w-[128.915px]">
                  <div
                    className="bg-[#d9d9d9] bg-cover bg-center flex gap-[7.958px] h-[159.951px] items-center justify-start p-[12.73px] rounded-[12px] w-full relative"
                    style={{ backgroundImage: `url(/assets/images/ski-bg-1.png)` }}
                  >
                    <div className="basis-0 grow h-full min-h-px min-w-px rounded-tl-[9.549px] rounded-tr-[9.549px] shrink-0 relative">
                      <div className="absolute border-[1.592px_1.592px_0px] border-solid border-white inset-0 pointer-events-none rounded-tl-[9.549px] rounded-tr-[9.549px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[1.592px] items-start justify-start w-full">
                    <div className="flex gap-[6.366px] items-center justify-start w-full">
                      <div className="w-[14.324px] h-[14.324px] shrink-0">
                        <img src="/assets/logos/raven-emblem.svg" alt="FR" className="w-full h-full" />
                      </div>
                      <div className="font-['Archivo'] font-medium text-[12.73px] text-white tracking-[0.0636px] leading-[15.915px] shrink-0">
                        Courchevel 1850
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meribel Card */}
                <div className="flex flex-col gap-[12.73px] items-start justify-start shrink-0 w-[128.915px]">
                  <div
                    className="bg-[#d9d9d9] bg-cover bg-center flex gap-[7.958px] h-[159.951px] items-center justify-start p-[12.73px] rounded-[12px] w-full relative"
                    style={{ backgroundImage: `url(/assets/images/ski-bg-2.png)` }}
                  >
                    <div className="basis-0 grow h-full min-h-px min-w-px rounded-tl-[9.549px] rounded-tr-[9.549px] shrink-0 relative">
                      <div className="absolute border-[1.592px_1.592px_0px] border-solid border-white inset-0 pointer-events-none rounded-tl-[9.549px] rounded-tr-[9.549px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[1.592px] items-start justify-start w-full">
                    <div className="flex gap-[6.366px] items-center justify-start w-full">
                      <div className="w-[14.324px] h-[14.324px] shrink-0">
                        <img src="/assets/logos/raven-emblem.svg" alt="FR" className="w-full h-full" />
                      </div>
                      <div className="font-['Archivo'] font-medium text-[12.73px] text-white tracking-[0.0636px] leading-[15.915px] shrink-0">
                        Meribel
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tignes Card */}
                <div className="flex flex-col gap-[12.73px] items-start justify-start shrink-0 w-[128.915px]">
                  <div
                    className="bg-[#d9d9d9] bg-cover bg-center flex gap-[7.958px] h-[159.951px] items-center justify-start p-[12.73px] rounded-[12px] w-full relative"
                    style={{ backgroundImage: `url(/assets/images/ski-bg-3.png)` }}
                  >
                    <div className="basis-0 grow h-full min-h-px min-w-px rounded-tl-[9.549px] rounded-tr-[9.549px] shrink-0 relative">
                      <div className="absolute border-[1.592px_1.592px_0px] border-solid border-white inset-0 pointer-events-none rounded-tl-[9.549px] rounded-tr-[9.549px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[1.592px] items-start justify-start w-full">
                    <div className="flex gap-[6.366px] items-center justify-start w-full">
                      <div className="w-[14.324px] h-[14.324px] shrink-0">
                        <img src="/assets/logos/raven-emblem.svg" alt="FR" className="w-full h-full" />
                      </div>
                      <div className="font-['Archivo'] font-medium text-[12.73px] text-white tracking-[0.0636px] leading-[15.915px] shrink-0">
                        Tignes
                      </div>
                    </div>
                  </div>
                </div>

                {/* Avoriaz Card */}
                <div className="flex flex-col gap-[12.73px] items-start justify-start shrink-0 w-[128.915px]">
                  <div
                    className="bg-[#d9d9d9] bg-cover bg-center flex gap-[7.958px] h-[159.951px] items-center justify-start p-[12.73px] rounded-[12px] w-full relative"
                    style={{ backgroundImage: `url(/assets/images/ski-bg-4.png)` }}
                  >
                    <div className="basis-0 grow h-full min-h-px min-w-px rounded-tl-[9.549px] rounded-tr-[9.549px] shrink-0 relative">
                      <div className="absolute border-[1.592px_1.592px_0px] border-solid border-white inset-0 pointer-events-none rounded-tl-[9.549px] rounded-tr-[9.549px]" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[1.592px] items-start justify-start w-full">
                    <div className="flex gap-[6.366px] items-center justify-start w-full">
                      <div className="w-[14.324px] h-[14.324px] shrink-0">
                        <img src="/assets/logos/raven-emblem.svg" alt="FR" className="w-full h-full" />
                      </div>
                      <div className="font-['Archivo'] font-medium text-[12.73px] text-white tracking-[0.0636px] leading-[15.915px] shrink-0">
                        Avoriaz
                      </div>
                    </div>
                    <div className="font-['Archivo'] font-light text-[#d5d5d6] text-[11.14px] tracking-[0.0557px] leading-[14.324px] w-full">
                      Average price €180/ph
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </StepCard>

          {/* ======================================== */}
          {/* STEP 2: CHOOSE PREFERENCES */}
          {/* Exact Figma layout and positioning */}
          {/* ======================================== */}
          <StepCard
            stepNumber="02"
            title="Choose your adventure preferences"
            description="Select your dates, choose from a curated selection of instructors and locations to curate your perfect trip."
          >
            {/* Container - Exact Figma positioning */}
            <div className="absolute left-[3px] top-0 grid grid-cols-[max-content] grid-rows-[max-content] place-items-start">
              {/* Image Container */}
              <div className="bg-zinc-800 flex gap-3 h-[117px] items-center justify-start pl-3 pr-5 py-0 rounded-[500px] w-[279px]">
                {/* Image Container with overlapping photos */}
                <div className="flex h-[83px] items-center justify-center w-60">
                  <div className="flex items-center justify-center">
                    {/* Animated Tooltip Instructor Photos */}
                    <AnimatedTooltip items={instructorTooltipData} />
                  </div>
                </div>
              </div>
              
              {/* Rating - Exact Figma positioning */}
              <motion.div 
                className="absolute left-[84px] top-[91.987px] bg-zinc-800 flex gap-3 h-11 items-center justify-start px-5 py-0 rounded-[500px] shadow-[2px_2px_50px_32px_rgba(0,0,0,0.8)]"
                whileHover={{ scale: 1.05 }}
              >
                {/* Star Icon */}
                <div className="flex gap-[3.2px] items-center justify-start">
                  <img src="/assets/icons/star.svg" alt="Star" className="w-3 h-3" />
                </div>
                {/* Rating Text */}
                <span className="text-[#d5d5d6] text-sm font-light font-archivo leading-[1.4]">4.4 (13)</span>
              </motion.div>
            </div>
          </StepCard>

          {/* ======================================== */}
          {/* STEP 3: LOCK IT IN */}
          {/* Booking interface matching Figma design */}
          {/* ======================================== */}
          <StepCard
            stepNumber="03"
            title="Lock it in"
            description="Secure your preferred times and instructors before they're gone. Download our app to manage your booking on the go."
          >
            {/* Booking Container - Exact Figma positioning */}
            <div className="absolute left-[20px] top-0 w-[316px] h-[224px] flex flex-col gap-3 items-center justify-center">
              {/* Booking Card */}
              <div className="backdrop-blur-[10px] bg-zinc-800 flex flex-col gap-2 items-start justify-start p-3 rounded-[12px] w-full">
                {/* Instructor Name Row */}
                <div className="flex gap-2 items-center justify-start w-full">
                  <div className="flex gap-2 items-center justify-start flex-1">
                    {/* Instructor Photo */}
                    <div
                      className="w-5 h-5 rounded-full bg-cover bg-center shrink-0"
                      style={{ backgroundImage: `url(/assets/images/instructor-1.png)` }}
                    />
                    {/* Instructor Name */}
                    <div className="font-['PP_Editorial_New'] text-white text-[16px] tracking-[0.08px] leading-[18px] shrink-0">
                      Jono
                    </div>
                  </div>
                  {/* Arrow Icon */}
                  <div className="w-4 h-4 shrink-0">
                    <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Date and Status Row */}
                <div className="flex items-center justify-between w-full">
                  {/* Start Date */}
                  <div className="flex flex-col items-start justify-start">
                    <div className="font-['Archivo'] font-light text-[#cbcbd2] text-[12px] tracking-[0.06px] leading-[16px]">
                      Start
                    </div>
                    <div className="font-['Archivo'] text-white text-[14px] tracking-[0.07px] leading-[18px]">
                      10 Feb
                    </div>
                  </div>

                  {/* Confirmed Badge */}
                  <div className="backdrop-blur-[10px] bg-[#01270d] flex gap-1 h-5 items-center justify-center px-2 py-2 rounded-[8px]">
                    <span className="font-['Archivo'] font-medium text-[#8cfbaf] text-[12px] tracking-[0.06px] leading-[16px]">
                      Confirmed
                    </span>
                  </div>

                  {/* End Date */}
                  <div className="flex flex-col items-start justify-start">
                    <div className="font-['Archivo'] font-light text-[#cbcbd2] text-[12px] tracking-[0.06px] leading-[16px]">
                      End
                    </div>
                    <div className="font-['Archivo'] text-white text-[14px] tracking-[0.07px] leading-[18px]">
                      26 Feb
                    </div>
                  </div>
                </div>

                {/* Divider */}
                <div className="w-full h-0 border-t border-white/10" />

                {/* Metadata Row */}
                <div className="flex gap-4 items-center justify-start w-full">
                  {/* Snowboarding */}
                  <div className="flex gap-1 items-center justify-start">
                    <div className="w-3 h-3">
                      <img src="/assets/icons/snowboarding.png" alt="Snowboarding" className="w-full h-full" />
                    </div>
                    <span className="font-['Archivo'] font-light text-white text-[14px] tracking-[0.07px] leading-[18px]">
                      Snowboarding
                    </span>
                  </div>

                  {/* Location */}
                  <div className="flex gap-1 items-center justify-start">
                    <div className="w-3 h-3">
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-['Archivo'] font-light text-white text-[14px] tracking-[0.07px] leading-[18px]">
                      Meribel
                    </span>
                  </div>

                  {/* Participants */}
                  <div className="flex gap-1 items-center justify-start">
                    <div className="w-3 h-3">
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                      </svg>
                    </div>
                    <span className="font-['Archivo'] font-light text-white text-[14px] tracking-[0.07px] leading-[18px]">
                      3
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="flex gap-1 items-center justify-start">
                    <div className="w-3 h-3">
                      <svg className="w-full h-full text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-['Archivo'] font-light text-white text-[14px] tracking-[0.07px] leading-[18px]">
                      4 days
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </StepCard>
        </div>
      </div>

      {/* ======================================== */}
      {/* WHITE CONTENT SECTIONS */}
      {/* Exact Figma layout and spacing */}
      {/* ======================================== */}
      <div className="bg-white flex flex-col gap-[140px] items-center justify-start overflow-hidden pt-[140px] pb-[140px] px-0 w-full">
        {/* Section Header */}
        <motion.div 
          className="flex flex-col gap-2.5 items-center justify-start text-[#17171a] text-center w-[664px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-base font-light font-archivo tracking-[0.08px] leading-6 w-full">
            <p>Experience more than the slopes</p>
          </div>
          <div className="text-[60px] font-pp-editorial tracking-[-1.2px] leading-normal w-full">
            <p>Personalised Adventures, Local Expertise, and Après-Ski Highlights</p>
          </div>
        </motion.div>

        {/* First Content Block - Exact Figma layout */}
        <div className="flex gap-[140px] items-start justify-center relative w-full">
          {/* Image Section */}
          <motion.div 
            className="flex flex-col gap-2 items-start justify-start w-[589px]"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div 
              className="bg-center bg-cover bg-no-repeat h-[658px] rounded-md w-full"
              style={{ backgroundImage: `url(/assets/images/content-section-1.png)` }}
            />
            <div className="text-[#17171a] text-sm font-medium font-archivo opacity-60 leading-6 h-6 w-full">
              <p>Picture caption</p>
            </div>
          </motion.div>

          {/* Text Content */}
          <motion.div 
            className="flex flex-col gap-[27px] items-start justify-start w-[405px]"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Text Block */}
            <div className="flex flex-col gap-[26px] items-start justify-start text-black text-left w-full">
              <div className="text-[48px] font-normal font-archivo tracking-[-0.24px] leading-normal min-w-full">
                <p>Morbi in sem quis dui placerat ornare.</p>
              </div>
              <div className="text-base font-light font-archivo tracking-[0.08px] leading-6 w-[388px]">
                <p>
                  Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. 
                  Nullam malesuada erat ut turpis. Suspendisse urna nibh viverra non semper suscipit posuere a pede.
                </p>
              </div>
            </div>

            {/* Features List */}
            <div className="flex flex-col gap-3 items-start justify-start w-[218px]">
              <div className="flex gap-[7px] items-center justify-start">
                <img src="/assets/icons/checkmark-small.svg" alt="Check" className="w-6 h-6" />
                <span className="text-[#17171a] text-sm font-medium font-archivo tracking-[0.07px] leading-6">All snowsports</span>
              </div>
              <div className="flex gap-[7px] items-center justify-start w-full">
                <img src="/assets/icons/checkmark-small.svg" alt="Check" className="w-6 h-6" />
                <span className="text-[#17171a] text-sm font-medium font-archivo tracking-[0.07px] leading-6">Off-piste, snowpark, freestyle</span>
              </div>
              <div className="flex gap-[7px] items-center justify-start w-full">
                <img src="/assets/icons/checkmark-small.svg" alt="Check" className="w-6 h-6" />
                <span className="text-[#17171a] text-sm font-medium font-archivo tracking-[0.07px] leading-6">Discover new areas</span>
              </div>
            </div>

            {/* Button */}
            <motion.div 
              className="bg-white h-10 mix-blend-difference rounded-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="flex gap-1 h-10 items-center justify-center overflow-hidden px-5 py-2.5">
                <span className="text-[#0d0d0f] text-sm font-medium font-archivo tracking-[0.07px] leading-[18px]">Start your journey</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Second Section Header */}
        <motion.div 
          className="flex flex-col gap-2.5 items-center justify-start text-[#17171a] text-center w-[664px]"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="text-base font-light font-archivo tracking-[0.08px] leading-6 w-full">
            <p>Experience more than the slopes</p>
          </div>
          <div className="text-[60px] font-pp-editorial tracking-[-1.2px] leading-normal w-full">
            <p>Personalised Adventures, Local Expertise, and Après-Ski Highlights</p>
          </div>
        </motion.div>

        {/* Content Section - Exact Figma positioning */}
        <div className="flex flex-col gap-[70px] items-center justify-start w-full">
          <div className="flex flex-col gap-[70px] items-center justify-start w-[1200px]">
            <div className="relative h-[780px] w-[1200px]">
              {/* Text Section - Left positioned */}
              <motion.div 
                className="absolute flex flex-col gap-[26px] items-start justify-start right-[90.5px] top-1.5 w-[405px]"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <div className="text-black text-[48px] font-normal font-archivo tracking-[-0.24px] leading-normal text-left min-w-full">
                  <p>Experience family adventures</p>
                </div>
                <div className="text-black text-base font-light font-archivo tracking-[0.08px] leading-6 text-left w-[388px]">
                  <p>
                    Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Donec odio. Quisque volutpat mattis eros. 
                    Nullam malesuada erat ut turpis. Suspendisse urna nibh viverra non semper suscipit posuere a pede.
                  </p>
                </div>
                
                {/* Features List */}
                <div className="flex flex-col gap-3 items-start justify-start w-[218px]">
                  <div className="flex gap-[7px] items-center justify-start">
                    <img src="/assets/icons/checkmark-small.svg" alt="Check" className="w-6 h-6" />
                    <span className="text-[#17171a] text-sm font-medium font-archivo tracking-[0.07px] leading-6">Full families welcome</span>
                  </div>
                  <div className="flex gap-[7px] items-center justify-start w-full">
                    <img src="/assets/icons/checkmark-small.svg" alt="Check" className="w-6 h-6" />
                    <span className="text-[#17171a] text-sm font-medium font-archivo tracking-[0.07px] leading-6">Nunc dignisim risis id metus</span>
                  </div>
                  <div className="flex gap-[7px] items-center justify-start w-full">
                    <img src="/assets/icons/checkmark-small.svg" alt="Check" className="w-6 h-6" />
                    <span className="text-[#17171a] text-sm font-medium font-archivo tracking-[0.07px] leading-6">Vivamus vestibulum ntulla nec ante.</span>
                  </div>
                </div>
              </motion.div>

              {/* Image Section - Right positioned */}
              <motion.div 
                className="absolute flex flex-col gap-2 items-start justify-start left-[-35.5px] top-0 w-[660px]"
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div 
                  className="bg-center bg-cover bg-no-repeat h-[748px] rounded-md w-full"
                  style={{ backgroundImage: `url(/assets/images/content-section-2.png)` }}
                />
                <div className="text-[#17171a] text-sm font-medium font-archivo opacity-60 leading-6 h-6 w-full">
                  <p>Picture caption</p>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Footer Section - Exact Figma layout */}
          <div className="flex gap-4 items-center justify-center font-pp-editorial opacity-10 px-2 py-6 text-[#0a0c13] text-[92px] text-center tracking-[-1.84px] leading-normal">
            {Array.from({ length: 14 }, (_, i) => (
              <div key={i}>
                <p className="whitespace-nowrap">Reserved.</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ======================================== */}
      {/* SEARCH MODAL */}
      {/* ======================================== */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={handleModalClose}
        locations={locations}
        sportOptions={fallbackSportOptions}
        sportDisciplines={fetchedSportDisciplines.length > 0 ? fetchedSportDisciplines : fallbackSportDisciplines}
        onLocationSelect={handleLocationSelect}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        isLoading={isDataLoading}
        step={modalStep}
        selectedLocation={selectedLocation}
        selectedSports={selectedSports}
        onSportSelect={handleSportSelect}
        onStepChange={handleStepChange}
        participantCounts={participantCounts}
        onParticipantCountsChange={handleParticipantCountsChange}
        onSearch={handleSearchComplete}
      />
    </div>
  );
}