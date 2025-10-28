"use client";
import React from "react";
import { motion } from "motion/react";
import { SearchLoadingSpinner } from "@/components/ui/loading-spinner";

// Reusable Button Components
interface ModalButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export const ModalButton = ({ onClick, children, variant = 'primary' }: ModalButtonProps) => {
  const baseClasses = "px-4 py-2.5 rounded-2xl font-['Archivo'] font-medium w-[126px]";
  const variantClasses = variant === 'primary' 
    ? "bg-[#ffffff] text-[#0d0d0f]"
    : "border border-[#ffffff] border-solid bg-transparent text-white";

  return (
    <motion.button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.button>
  );
};

export const ModalNavigationButtons = ({ 
  onBack, 
  onNext, 
  backLabel = "Back", 
  nextLabel = "Next" 
}: {
  onBack: () => void;
  onNext: () => void;
  backLabel?: string;
  nextLabel?: string;
}) => {
  return (
    <div className="flex justify-between mt-8">
      <ModalButton onClick={onBack} variant="secondary">
        {backLabel}
      </ModalButton>
      <ModalButton onClick={onNext} variant="primary">
        {nextLabel}
      </ModalButton>
    </div>
  );
};

// Reusable Participant Counter Component
interface ParticipantCounterProps {
  title: string;
  description: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
  minimumValue?: number;
  isLast?: boolean;
}

export const ParticipantCounter = ({ 
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
    <div className={`flex items-center justify-between py-6 ${!isLast ? 'border-b border-[#3B3B40]' : ''}`}>
      <div>
        <div className="font-['Archivo'] font-medium text-white text-lg">
          {title}
        </div>
        <div className="font-['Archivo'] font-light text-[#cbcbd2] text-sm">
          {description}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <motion.button
          onClick={onDecrement}
          className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
            isAtMinimum 
              ? 'bg-[rgba(255,255,255,0.05)] text-[#666] cursor-not-allowed' 
              : 'bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)]'
          }`}
          whileHover={!isAtMinimum ? { scale: 1.1 } : {}}
          whileTap={!isAtMinimum ? { scale: 0.9 } : {}}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.button>
        <div className="w-12 text-center font-['Archivo'] font-medium text-white text-xl">
          {count}
        </div>
        <motion.button
          onClick={onIncrement}
          className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-white hover:bg-[rgba(255,255,255,0.2)] transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M8 4V12M4 8H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </motion.button>
      </div>
    </div>
  );
};

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

export type ModalStep = 'location' | 'sport' | 'participants';

export interface ParticipantCounts {
  adults: number;
  teenagers: number;
  children: number;
}

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
  step?: ModalStep;
  selectedLocation?: Location;
  selectedSports?: string[];
  onSportSelect?: (sportIds: string[]) => void;
  onStepChange?: (step: ModalStep) => void;
  participantCounts?: ParticipantCounts;
  onParticipantCountsChange?: (counts: ParticipantCounts) => void;
  onSearch?: (searchData: {
    location: Location;
    sports: string[];
    participants: ParticipantCounts;
  }) => void;
}

// Sport options for the dropdown
export const sportOptions: SportOption[] = [
  {
    id: "skiing",
    name: "Skiing",
    icon: "🎿"
  },
  {
    id: "snowboarding",
    name: "Snowboarding", 
    icon: "🏂"
  },
  {
    id: "ski-touring",
    name: "Ski Touring",
    icon: "⛷️"
  },
  {
    id: "all-sports",
    name: "All Sports",
    icon: "🏔️"
  }
];

// Comprehensive French ski resorts database - ready for Supabase integration
const defaultLocations: Location[] = [
  // Les 3 Vallées (Three Valleys)
  {
    id: "1",
    name: "Courchevel 1850",
    country: "France",
    country_code: "FR",
    average_price: 380,
    currency: "EUR",
    thumbnail_url: "/assets/images/ski-bg-1.png",
    description: "Luxury resort in Les 3 Vallées, world's largest ski area"
  },
  {
    id: "2", 
    name: "Méribel",
    country: "France",
    country_code: "FR",
    average_price: 320,
    currency: "EUR",
    thumbnail_url: "/assets/images/ski-bg-2.png",
    description: "Heart of Les 3 Vallées with traditional Alpine architecture"
  },
  {
    id: "3",
    name: "Val Thorens", 
    country: "France",
    country_code: "FR",
    average_price: 340,
    currency: "EUR",
    thumbnail_url: "/assets/images/ski-bg-3.png",
    description: "Highest ski resort in Europe at 2,300m altitude"
  },
  {
    id: "4",
    name: "Les Menuires",
    country: "France", 
    country_code: "FR",
    average_price: 280,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-bb8b0c4dda5e?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Family-friendly resort in Les 3 Vallées"
  },
  {
    id: "5",
    name: "La Tania",
    country: "France", 
    country_code: "FR",
    average_price: 260,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Charming village resort in Les 3 Vallées"
  },

  // Espace Killy (Tignes & Val d'Isère)
  {
    id: "6",
    name: "Tignes",
    country: "France",
    country_code: "FR",
    average_price: 310,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "High-altitude resort with glacier skiing"
  },
  {
    id: "7",
    name: "Val d'Isère",
    country: "France",
    country_code: "FR",
    average_price: 350,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=300&fit=crop&crop=center&q=80",
    description: "World-class resort in Espace Killy"
  },

  // Chamonix Valley
  {
    id: "8",
    name: "Chamonix",
    country: "France",
    country_code: "FR",
    average_price: 400,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Birthplace of extreme skiing, home of the first Winter Olympics"
  },

  // Portes du Soleil
  {
    id: "9",
    name: "Avoriaz",
    country: "France",
    country_code: "FR",
    average_price: 290,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-6cf2ac44c8e8?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Car-free resort in Portes du Soleil area"
  },
  {
    id: "10",
    name: "Morzine",
    country: "France",
    country_code: "FR",
    average_price: 270,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Traditional Alpine town in Portes du Soleil"
  },
  {
    id: "11",
    name: "Les Gets",
    country: "France",
    country_code: "FR",
    average_price: 250,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Charming traditional village in Portes du Soleil"
  },

  // Paradiski
  {
    id: "12",
    name: "La Plagne",
    country: "France",
    country_code: "FR",
    average_price: 280,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-bb8b0c4dda5e?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Large ski area in Paradiski domain"
  },
  {
    id: "13",
    name: "Les Arcs",
    country: "France",
    country_code: "FR",
    average_price: 290,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Modern resort architecture in Paradiski"
  },

  // Southern French Alps
  {
    id: "14",
    name: "Alpe d'Huez",
    country: "France",
    country_code: "FR",
    average_price: 320,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Famous for 21 hairpin bends and glacier skiing"
  },
  {
    id: "15",
    name: "Les Deux Alpes",
    country: "France",
    country_code: "FR",
    average_price: 300,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-6cf2ac44c8e8?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Europe's largest skiable glacier"
  },
  {
    id: "16",
    name: "Serre Chevalier",
    country: "France",
    country_code: "FR",
    average_price: 270,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Diverse terrain with authentic Alpine villages"
  },
  {
    id: "17",
    name: "Isola 2000",
    country: "France",
    country_code: "FR",
    average_price: 240,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Purpose-built resort near Nice"
  },

  // Savoie Region
  {
    id: "18",
    name: "La Clusaz",
    country: "France",
    country_code: "FR",
    average_price: 260,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-bb8b0c4dda5e?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Traditional Savoyard village resort"
  },
  {
    id: "19",
    name: "Le Grand Bornand",
    country: "France",
    country_code: "FR",
    average_price: 240,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Authentic mountain village with Nordic skiing"
  },
  {
    id: "20",
    name: "Megève",
    country: "France",
    country_code: "FR",
    average_price: 420,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Chic resort with luxury hotels and spas"
  },

  // French Pyrenees
  {
    id: "21",
    name: "Saint-Lary-Soulan",
    country: "France",
    country_code: "FR",
    average_price: 180,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-6cf2ac44c8e8?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Largest ski resort in French Pyrenees"
  },
  {
    id: "22",
    name: "Grand Tourmalet",
    country: "France",
    country_code: "FR",
    average_price: 170,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Largest ski area in Pyrenees including La Mongie and Barèges"
  },
  {
    id: "23",
    name: "Cauterets",
    country: "France",
    country_code: "FR",
    average_price: 160,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Historic spa town with excellent snow record"
  },
  {
    id: "24",
    name: "Luz-Ardiden",
    country: "France",
    country_code: "FR",
    average_price: 150,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-bb8b0c4dda5e?w=400&h=300&fit=crop&crop=center&q=80",
    description: "High-altitude Pyrenees resort with panoramic views"
  },
  {
    id: "25",
    name: "Piau-Engaly",
    country: "France",
    country_code: "FR",
    average_price: 140,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Highest resort in French Pyrenees"
  },
  {
    id: "26",
    name: "Gourette",
    country: "France",
    country_code: "FR",
    average_price: 135,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Family-friendly Pyrenees resort"
  },
  {
    id: "27",
    name: "Peyragudes",
    country: "France",
    country_code: "FR",
    average_price: 130,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-6cf2ac44c8e8?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Modern Pyrenees resort with varied terrain"
  },

  // Additional Alpine Resorts
  {
    id: "28",
    name: "Flaine",
    country: "France",
    country_code: "FR",
    average_price: 280,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1551524164-bb8b0c4dda5e?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Purpose-built resort in Grand Massif"
  },
  {
    id: "29",
    name: "Samoëns",
    country: "France",
    country_code: "FR",
    average_price: 250,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1605540436563-5bca919ae766?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Historic stone village in Grand Massif"
  },
  {
    id: "30",
    name: "Morillon",
    country: "France",
    country_code: "FR",
    average_price: 230,
    currency: "EUR",
    thumbnail_url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop&crop=center&q=80",
    description: "Family resort in Grand Massif area"
  }
];

const LocationCard = ({ 
  location, 
  onClick 
}: { 
  location: Location; 
  onClick?: () => void;
}) => {
  return (
    <motion.div
      className="h-[57px] relative shrink-0 w-full cursor-pointer group"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Location Details */}
      <div className="absolute box-border content-stretch flex flex-col items-start justify-start left-[73px] p-0 translate-y-[-50%] right-4 top-1/2">
        <div className="box-border content-stretch flex flex-row gap-[7px] items-center justify-start p-0 relative shrink-0 w-full">
          {/* Country Flag - using emoji for now, replace with actual flag icons */}
          <div className="relative shrink-0 size-[18px] flex items-center justify-center text-sm">
            🇫🇷
          </div>
          <div className="font-['Archivo'] font-medium h-full leading-[1.4] not-italic relative shrink-0 text-[#ffffff] text-[16px] text-left tracking-[0.08px] flex-1 min-w-0">
            {location.name}
          </div>
        </div>
        <div className="font-['Archivo'] font-light leading-[1.4] not-italic relative shrink-0 text-[#cbcbd2] text-[14px] text-left text-nowrap">
          Average price €{location.average_price}/ph
        </div>
      </div>
      
      {/* Location Image */}
      <div className="absolute left-0 rounded-xl size-[57px] top-0 overflow-hidden group-hover:scale-105 transition-transform duration-200 bg-gray-600">
        {location.thumbnail_url ? (
          <img
            src={location.thumbnail_url}
            alt={`${location.name} ski resort`}
            className="w-full h-full object-cover rounded-xl"
            onError={(e) => {
              // Fallback to gradient if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
              }
            }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600" />
        )}
      </div>
    </motion.div>
  );
};


export const SearchModal = ({
  isOpen,
  onClose,
  locations = defaultLocations,
  sportOptions = [],
  sportDisciplines = [],
  onLocationSelect,
  searchValue = "",
  onSearchChange,
  isLoading = false,
  step = 'location',
  selectedLocation,
  selectedSports = [],
  onSportSelect,
  onStepChange,
  participantCounts = { adults: 2, teenagers: 0, children: 0 },
  onParticipantCountsChange,
  onSearch,
}: SearchModalProps) => {
  const [internalSearchValue, setInternalSearchValue] = React.useState(searchValue);
  const [isSearching, setIsSearching] = React.useState(false);

  const handleSearchComplete = () => {
    if (onSearch && selectedLocation) {
      onSearch({
        location: selectedLocation,
        sports: selectedSports,
        participants: participantCounts
      });
    }
    onClose();
  };

  // Debounced search function
  const debouncedSearch = React.useMemo(() => {
    const timeoutRef: { current: NodeJS.Timeout | null } = { current: null };
    
    return (value: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      setIsSearching(true);
      
      timeoutRef.current = setTimeout(() => {
        onSearchChange?.(value);
        setIsSearching(false);
      }, 300); // 300ms debounce
    };
  }, [onSearchChange]);

  const handleSearchChange = (value: string) => {
    setInternalSearchValue(value);
    debouncedSearch(value);
  };

  // Filter locations based on search value
  const { filteredLocations, totalMatches } = React.useMemo(() => {
    if (!internalSearchValue.trim()) {
      return {
        filteredLocations: locations.slice(0, 4), // Show top 4 by default
        totalMatches: 4
      };
    }
    
    const allMatches = locations.filter(location =>
      location.name.toLowerCase().includes(internalSearchValue.toLowerCase()) ||
      location.description?.toLowerCase().includes(internalSearchValue.toLowerCase())
    );
    
    return {
      filteredLocations: allMatches.slice(0, 6), // Maximum 6 when searching
      totalMatches: allMatches.length
    };
  }, [locations, internalSearchValue]);

  const showLoading = isLoading || isSearching;

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop with blur */}
      <motion.div
        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
        animate={{ opacity: 1, backdropFilter: "blur(10px)" }}
        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
        className="absolute inset-0 bg-black bg-opacity-50"
      />

      {/* Modal Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 25,
        }}
        className="relative z-10 w-[90vw] min-w-[350px] max-w-[750px] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Modal Container - Exact Figma Specifications */}
        <div className="bg-[rgba(255,255,255,0.1)] box-border content-stretch flex flex-col gap-[33px] items-start justify-start p-12 relative rounded-[60px] backdrop-blur-[25px] backdrop-filter">
          
          {/* Header Section */}
          <div className="box-border content-stretch flex flex-col gap-2 items-start justify-start p-0 relative shrink-0 w-full">
            <div className="flex flex-col font-['Archivo'] font-medium justify-center leading-[28px] not-italic relative shrink-0 text-[#ffffff] text-[20px] sm:text-[24px] text-left text-nowrap tracking-[0.12px]">
              {step === 'location' && 'Where to?'}
              {step === 'sport' && 'What are you into?'}
              {step === 'participants' && 'How many participants?'}
            </div>
            
            {/* Search Input - Only for location step */}
            {step === 'location' && (
              <div className="backdrop-blur-[25px] backdrop-filter bg-[rgba(255,255,255,0.1)] relative rounded-lg shrink-0 w-full">
                <div className="box-border content-stretch flex flex-row gap-4 items-center justify-start overflow-clip pl-4 pr-3 py-0 relative w-full">
                  <input
                    type="text"
                    value={internalSearchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search destinations..."
                    className="basis-0 font-['Archivo'] font-light grow leading-[24px] min-h-[52px] min-w-px not-italic relative shrink-0 text-[#cbcbd2] text-[16px] text-left tracking-[0.08px] bg-transparent border-none outline-none placeholder:text-[#cbcbd2]"
                    autoFocus
                  />
                  <div className="h-[52px] relative shrink-0 w-6 flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      className="text-[#cbcbd2]"
                    >
                      <path
                        d="M21 21L16.5 16.5M19 11C19 15.4183 15.4183 19 11 19C6.58172 19 3 15.4183 3 11C3 6.58172 6.58172 3 11 3C15.4183 3 19 6.58172 19 11Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Step Content */}
          <div className="box-border content-stretch flex flex-col gap-3 items-start justify-start p-0 relative shrink-0 w-full">
            {step === 'location' && (
              <>
                <div className="font-['Archivo'] font-light leading-[18px] not-italic relative shrink-0 text-[#cbcbd2] text-[14px] text-left tracking-[0.07px]">
                  {internalSearchValue.trim() ? `Results for "${internalSearchValue}"` : "Suggested"}
                </div>
              </>
            )}
            
            {step === 'sport' && (
              <div className="font-['Archivo'] font-light leading-[18px] not-italic relative shrink-0 text-[#cbcbd2] text-[14px] text-left tracking-[0.07px]">
                Sports and disciplines
              </div>
            )}
            
            {step === 'participants' && (
              <div className="font-['Archivo'] font-light leading-[18px] not-italic relative shrink-0 text-[#cbcbd2] text-[14px] text-left tracking-[0.07px]">
                Set the number of participants
              </div>
            )}
            
            {/* Step-specific Content */}
            <div className="flex flex-col gap-3 w-full">
              {step === 'location' && (
                <>
                  {showLoading ? (
                    <SearchLoadingSpinner />
                  ) : (
                    <>
                      {filteredLocations.map((location) => (
                        <LocationCard
                          key={location.id}
                          location={location}
                          onClick={() => onLocationSelect?.(location)}
                        />
                      ))}
                      
                      {filteredLocations.length === 0 && !showLoading && (
                        <div className="text-[#cbcbd2] text-center py-8 font-['Archivo'] font-light">
                          <p>No destinations found</p>
                          <p className="text-xs mt-1 opacity-70">Try searching for different terms</p>
                        </div>
                      )}
                      
                      {internalSearchValue.trim() && filteredLocations.length > 0 && !showLoading && (
                        <div className="text-[#cbcbd2] text-center text-xs mt-2 opacity-70 font-['Archivo'] font-light">
                          {totalMatches === filteredLocations.length ? (
                            `Found ${totalMatches} destination${totalMatches !== 1 ? 's' : ''}`
                          ) : (
                            `Showing ${filteredLocations.length} of ${totalMatches} destination${totalMatches !== 1 ? 's' : ''}`
                          )}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
              
              {step === 'sport' && (
                <div className="w-full">
                  {/* Sport Disciplines Pills */}
                  <div className="flex flex-wrap gap-3 w-full">
                    {sportDisciplines.map((discipline) => {
                      const isSelected = selectedSports.includes(discipline.id);
                      return (
                        <motion.div
                          key={discipline.id}
                          className={`relative h-9 rounded-[500px] shrink-0 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'bg-[#ffffff]' 
                              : 'bg-[#25252b] hover:bg-[#2a2a31]'
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
                          <div className="box-border content-stretch flex flex-row gap-2 h-9 items-center justify-center overflow-clip pl-1.5 pr-3 py-1 relative">
                            <div className="relative shrink-0 size-6">
                              <img 
                                alt="" 
                                className="block max-w-none size-full" 
                                height="24" 
                                src={discipline.image_url} 
                                width="24" 
                              />
                            </div>
                            <div
                              className={`font-['Archivo'] font-light leading-[18px] not-italic relative shrink-0 text-[14px] text-left text-nowrap tracking-[0.07px] ${
                                isSelected ? 'text-[#0d0d0f]' : 'text-[#ffffff]'
                              }`}
                            >
                              {discipline.name}
                            </div>
                          </div>
                          <div
                            aria-hidden="true"
                            className={`absolute border border-solid inset-0 pointer-events-none rounded-[500px] ${
                              isSelected ? 'border-[rgba(255,255,255,0.01)]' : 'border-[#3B3B40]'
                            }`}
                          />
                        </motion.div>
                      );
                    })}
                  </div>
                  
                  {/* Navigation Buttons */}
                  <ModalNavigationButtons
                    onBack={() => onStepChange?.('location')}
                    onNext={() => onStepChange?.('participants')}
                    backLabel="Back"
                    nextLabel="Next"
                  />
                </div>
              )}
              
              {step === 'participants' && (
                <div className="w-full">
                  {/* Participant Counters */}
                  <div className="space-y-0">
                    <ParticipantCounter
                      title="Adults"
                      description="Older than 16"
                      count={participantCounts.adults}
                      onIncrement={() => {
                        const newCounts = {
                          ...participantCounts,
                          adults: participantCounts.adults + 1
                        };
                        onParticipantCountsChange?.(newCounts);
                      }}
                      onDecrement={() => {
                        const newCounts = {
                          ...participantCounts,
                          adults: Math.max(0, participantCounts.adults - 1)
                        };
                        onParticipantCountsChange?.(newCounts);
                      }}
                      minimumValue={0}
                    />
                    
                    <ParticipantCounter
                      title="Teenagers"
                      description="From 10 to 15"
                      count={participantCounts.teenagers}
                      onIncrement={() => {
                        const newCounts = {
                          ...participantCounts,
                          teenagers: participantCounts.teenagers + 1
                        };
                        onParticipantCountsChange?.(newCounts);
                      }}
                      onDecrement={() => {
                        const newCounts = {
                          ...participantCounts,
                          teenagers: Math.max(0, participantCounts.teenagers - 1)
                        };
                        onParticipantCountsChange?.(newCounts);
                      }}
                      minimumValue={0}
                    />
                    
                    <ParticipantCounter
                      title="Children"
                      description="From 4 to 9"
                      count={participantCounts.children}
                      onIncrement={() => {
                        const newCounts = {
                          ...participantCounts,
                          children: participantCounts.children + 1
                        };
                        onParticipantCountsChange?.(newCounts);
                      }}
                      onDecrement={() => {
                        const newCounts = {
                          ...participantCounts,
                          children: Math.max(0, participantCounts.children - 1)
                        };
                        onParticipantCountsChange?.(newCounts);
                      }}
                      minimumValue={0}
                      isLast={true}
                    />
                  </div>
                  
                  {/* Navigation Buttons */}
                  <ModalNavigationButtons
                    onBack={() => onStepChange?.('sport')}
                    onNext={handleSearchComplete}
                    backLabel="Back"
                    nextLabel="Search"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SearchModal;