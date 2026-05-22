/**
 * Localized coupon catalog — filtered by geographicArea and interest categories.
 */
const MOCK_COUPONS = [
  {
    id: "c1",
    title: "Trail Gear 15% Off",
    description: "Outdoor apparel and sun protection at participating retailers.",
    category: "Outdoor",
    geographicArea: "Phoenix",
    code: "TRAIL-PHX-15",
  },
  {
    id: "c2",
    title: "Garden & Grow Co-op",
    description: "20% off soil, seeds, and tools for home gardeners.",
    category: "Gardening",
    geographicArea: "Phoenix",
    code: "GROW-PHX-20",
  },
  {
    id: "c3",
    title: "Pet Wellness Clinic",
    description: "Free nail trim with any vaccination for household pets.",
    category: "Pets",
    geographicArea: "Phoenix",
    code: "PET-PHX-FREE",
  },
  {
    id: "c4",
    title: "Cool Home HVAC Service",
    description: "$50 off seasonal AC tune-up and filter bundle.",
    category: "Home",
    geographicArea: "Phoenix",
    code: "COOL-PHX-50",
  },
  {
    id: "c5",
    title: "Healthcare Heroes Café",
    description: "Buy-one-get-one drinks for nurses and healthcare staff.",
    category: "Healthcare",
    geographicArea: "Phoenix",
    code: "HERO-PHX-BOGO",
  },
  {
    id: "c6",
    title: "Game Night Arcade",
    description: "30% off arcade passes on weekday evenings.",
    category: "Gaming",
    geographicArea: "Tempe",
    code: "GAME-TEM-30",
  },
  {
    id: "c7",
    title: "Yoga in the Park",
    description: "First month membership half off at metro studios.",
    category: "Yoga",
    geographicArea: "Scottsdale",
    code: "YOGA-SC-50",
  },
  {
    id: "c8",
    title: "Farmers Market Fresh",
    description: "$10 off when you spend $40 at weekend markets.",
    category: "Outdoor",
    geographicArea: "Tempe",
    code: "FRESH-TEM-10",
  },
];

module.exports = { MOCK_COUPONS };
