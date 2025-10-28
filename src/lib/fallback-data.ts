import { Location, SportOption, SportDiscipline } from "@/components/ui/search-modal";

// Fallback data for development when Supabase is not configured
export const fallbackLocations: Location[] = [
  // Les 3 Vallées (Three Valleys)
  {
    id: "1",
    name: "Courchevel 1850",
    country: "France",
    country_code: "FR",
    average_price: 380,
    currency: "EUR",
    thumbnail_url: "/assets/images/courchevel.jpg",
    description: "Luxury resort in Les 3 Vallées, world's largest ski area"
  },
  {
    id: "2", 
    name: "Méribel",
    country: "France",
    country_code: "FR",
    average_price: 320,
    currency: "EUR",
    thumbnail_url: "/assets/images/meribel.jpg",
    description: "Heart of Les 3 Vallées with traditional Alpine architecture"
  },
  {
    id: "3",
    name: "Val Thorens", 
    country: "France",
    country_code: "FR",
    average_price: 340,
    currency: "EUR",
    thumbnail_url: "/assets/images/val-thorens.jpg",
    description: "Europe's highest ski resort with glacier skiing"
  },
  {
    id: "4",
    name: "Les Menuires",
    country: "France", 
    country_code: "FR",
    average_price: 280,
    currency: "EUR",
    thumbnail_url: "/assets/images/les-menuires.jpg",
    description: "Modern resort in Les 3 Vallées with ski-in ski-out access"
  },
  {
    id: "5",
    name: "Saint-Martin-de-Belleville",
    country: "France",
    country_code: "FR", 
    average_price: 260,
    currency: "EUR",
    thumbnail_url: "/assets/images/saint-martin.jpg",
    description: "Authentic Savoyard village connected to Les 3 Vallées"
  },
  
  // Paradiski
  {
    id: "6",
    name: "La Plagne",
    country: "France",
    country_code: "FR",
    average_price: 250,
    currency: "EUR", 
    thumbnail_url: "/assets/images/la-plagne.jpg",
    description: "Purpose-built resort with extensive high-altitude skiing"
  },
  {
    id: "7",
    name: "Les Arcs",
    country: "France",
    country_code: "FR",
    average_price: 270,
    currency: "EUR",
    thumbnail_url: "/assets/images/les-arcs.jpg",
    description: "Modern architecture meets extensive off-piste terrain"
  },
  
  // Espace Killy
  {
    id: "8",
    name: "Val d'Isère",
    country: "France",
    country_code: "FR",
    average_price: 350,
    currency: "EUR",
    thumbnail_url: "/assets/images/val-disere.jpg",
    description: "High-altitude resort with guaranteed snow and vibrant nightlife"
  },
  {
    id: "9",
    name: "Tignes",
    country: "France",
    country_code: "FR",
    average_price: 310,
    currency: "EUR",
    thumbnail_url: "/assets/images/tignes.jpg", 
    description: "Glacier skiing and modern facilities at high altitude"
  },
  
  // Chamonix Valley
  {
    id: "10",
    name: "Chamonix-Mont-Blanc",
    country: "France",
    country_code: "FR",
    average_price: 290,
    currency: "EUR",
    thumbnail_url: "/assets/images/chamonix.jpg",
    description: "Birthplace of extreme skiing with legendary off-piste terrain"
  },
  
  // Les Portes du Soleil
  {
    id: "11",
    name: "Avoriaz",
    country: "France",
    country_code: "FR",
    average_price: 240,
    currency: "EUR",
    thumbnail_url: "/assets/images/avoriaz.jpg",
    description: "Car-free resort with stunning architecture and tree skiing"
  },
  {
    id: "12",
    name: "Châtel",
    country: "France",
    country_code: "FR",
    average_price: 200,
    currency: "EUR",
    thumbnail_url: "/assets/images/chatel.jpg",
    description: "Traditional Alpine village with access to vast ski area"
  },
  {
    id: "13",
    name: "Morzine",
    country: "France",
    country_code: "FR",
    average_price: 220,
    currency: "EUR", 
    thumbnail_url: "/assets/images/morzine.jpg",
    description: "Year-round resort town with easy access to multiple ski areas"
  },
  
  // Alpe d'Huez
  {
    id: "14",
    name: "Alpe d'Huez",
    country: "France",
    country_code: "FR",
    average_price: 260,
    currency: "EUR",
    thumbnail_url: "/assets/images/alpe-dhuez.jpg",
    description: "Island in the sky with 300+ days of sunshine annually"
  },
  
  // Les Deux Alpes
  {
    id: "15",
    name: "Les Deux Alpes",
    country: "France",
    country_code: "FR",
    average_price: 240,
    currency: "EUR",
    thumbnail_url: "/assets/images/les-deux-alpes.jpg",
    description: "Europe's largest skiable glacier with summer skiing"
  },
  
  // Serre Chevalier 
  {
    id: "16",
    name: "Serre Chevalier",
    country: "France",
    country_code: "FR",
    average_price: 210,
    currency: "EUR",
    thumbnail_url: "/assets/images/serre-chevalier.jpg",
    description: "Authentic villages with extensive intermediate terrain"
  },
  
  // La Rosière
  {
    id: "17",
    name: "La Rosière",
    country: "France",
    country_code: "FR",
    average_price: 190,
    currency: "EUR",
    thumbnail_url: "/assets/images/la-rosiere.jpg",
    description: "Sunny slopes with views of Mont Blanc massif"
  },
  
  // Verbier (technically Swiss but close to French border)
  {
    id: "18",
    name: "Verbier",
    country: "Switzerland",
    country_code: "CH",
    average_price: 420,
    currency: "EUR",
    thumbnail_url: "/assets/images/verbier.jpg",
    description: "Legendary off-piste skiing and vibrant après-ski scene"
  },
  
  // Additional French resorts
  {
    id: "19",
    name: "La Clusaz",
    country: "France",
    country_code: "FR",
    average_price: 180,
    currency: "EUR",
    thumbnail_url: "/assets/images/la-clusaz.jpg",
    description: "Charming traditional village with family-friendly slopes"
  },
  {
    id: "20",
    name: "Le Grand-Bornand",
    country: "France",
    country_code: "FR",
    average_price: 170,
    currency: "EUR",
    thumbnail_url: "/assets/images/le-grand-bornand.jpg",
    description: "Authentic Savoyard village with excellent Nordic skiing"
  },
  {
    id: "21",
    name: "Megève",
    country: "France",
    country_code: "FR",
    average_price: 380,
    currency: "EUR",
    thumbnail_url: "/assets/images/megeve.jpg",
    description: "Elegant resort with luxury shopping and fine dining"
  },
  {
    id: "22",
    name: "Saint-Gervais",
    country: "France",
    country_code: "FR",
    average_price: 200,
    currency: "EUR",
    thumbnail_url: "/assets/images/saint-gervais.jpg",
    description: "Thermal spa town with access to Mont Blanc ski areas"
  },
  {
    id: "23",
    name: "Flaine",
    country: "France",
    country_code: "FR",
    average_price: 230,
    currency: "EUR",
    thumbnail_url: "/assets/images/flaine.jpg",
    description: "High-altitude resort with snow-sure skiing and modern architecture"
  },
  {
    id: "24",
    name: "Les Gets",
    country: "France",
    country_code: "FR",
    average_price: 210,
    currency: "EUR",
    thumbnail_url: "/assets/images/les-gets.jpg",
    description: "Traditional mountain village with tree-lined slopes"
  },
  {
    id: "25",
    name: "Samoëns",
    country: "France",
    country_code: "FR",
    average_price: 190,
    currency: "EUR",
    thumbnail_url: "/assets/images/samoens.jpg",
    description: "Historic village with access to Grand Massif ski area"
  },
  {
    id: "26",
    name: "Morillon",
    country: "France",
    country_code: "FR",
    average_price: 180,
    currency: "EUR",
    thumbnail_url: "/assets/images/morillon.jpg",
    description: "Family-friendly resort in the Grand Massif domain"
  },
  {
    id: "27",
    name: "Sixt-Fer-à-Cheval",
    country: "France",
    country_code: "FR",
    average_price: 170,
    currency: "EUR",
    thumbnail_url: "/assets/images/sixt.jpg",
    description: "Scenic village at the heart of a nature reserve"
  },
  {
    id: "28",
    name: "Valloire",
    country: "France",
    country_code: "FR",
    average_price: 160,
    currency: "EUR",
    thumbnail_url: "/assets/images/valloire.jpg",
    description: "Authentic village with extensive intermediate skiing"
  },
  {
    id: "29",
    name: "Valmeinier",
    country: "France",
    country_code: "FR",
    average_price: 150,
    currency: "EUR",
    thumbnail_url: "/assets/images/valmeinier.jpg",
    description: "High-altitude resort with stunning mountain views"
  },
  {
    id: "30",
    name: "Orelle",
    country: "France",
    country_code: "FR", 
    average_price: 140,
    currency: "EUR",
    thumbnail_url: "/assets/images/orelle.jpg",
    description: "Gateway to Les 3 Vallées with authentic mountain atmosphere"
  }
];

export const fallbackSportOptions: SportOption[] = [
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

export const fallbackSportDisciplines: SportDiscipline[] = [
  {
    id: "skiing",
    name: "Skiing",
    image_url: "/assets/icons/skiing.png"
  },
  {
    id: "snowboarding",
    name: "Snowboarding",
    image_url: "/assets/icons/snowboarding.png"
  },
  {
    id: "ski-touring",
    name: "Ski-Touring",
    image_url: "/assets/icons/Ski-Touring.png"
  },
  {
    id: "free-ride",
    name: "Free-ride (off-piste)",
    image_url: "/assets/icons/free-ride-off-piste.png"
  },
  {
    id: "cross-country",
    name: "Cross-Country",
    image_url: "/assets/icons/cross-country.png"
  },
  {
    id: "free-style",
    name: "Free-style (Snowpark)",
    image_url: "/assets/icons/free-style-snowpark.png"
  },
  {
    id: "telemark",
    name: "Telemark",
    image_url: "/assets/icons/telemark.png"
  },
  {
    id: "adaptive",
    name: "Adaptive",
    image_url: "/assets/icons/adaptive.png"
  }
];