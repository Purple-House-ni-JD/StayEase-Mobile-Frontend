// ─── Mock Data ────────────────────────────────────────────────────────────────

// Room Categories
export const ROOM_CATEGORIES = [
  "STANDARD",
  "DELUXE",
  "SUITE",
  "VILLA",
  "PENTHOUSE",
];

// Featured Property
export const FEATURED_PROPERTY = {
  id: "f1",
  name: "Grand Ocean Villa",
  location: "Malibu, California",
  price: 850,
  badge: "FEATURED",
  image: require("../../assets/images/grand-ocean-villa.png"),
};

// Available Rooms
export const AVAILABLE_ROOMS = [
  {
    id: "r1",
    category: "STANDARD",
    name: "Classic Studio",
    price: 120,
    rating: 4.8,
    image: require("../../assets/images/classic-studio.png"),
  },
  {
    id: "r2",
    category: "DELUXE",
    name: "Azure Horizon",
    price: 245,
    rating: 4.9,
    image: require("../../assets/images/azure-horizon.png"),
  },
  {
    id: "r3",
    category: "SUITE",
    name: "Royal Chambers",
    price: 410,
    rating: 4.7,
    image: require("../../assets/images/royal-chambers.png"),
  },
  {
    id: "r4",
    category: "STANDARD",
    name: "Urban Retreat",
    price: 155,
    rating: 4.6,
    image: require("../../assets/images/urban-retreat.png"),
  },
];

// Mock Room for Detail Page
export const MOCK_ROOM = {
  id: "r-001",
  name: "Grand Imperial Skyline Room",
  category: "PREMIUM SUITE",
  description:
    "Experience unparalleled luxury in our Grand Imperial suite. Featuring floor-to-ceiling panoramic views of the city, custom Italian linens, and a private marble spa bath. Every detail has been curated to ensure a stay that is both restful and prestigious.",
  price_per_night: 450,
  max_guests: 2,
  rating: 4.9,
  review_count: 124,
  amenities: [
    { id: "a1", icon: "🛏", label: "King Bed" },
    { id: "a2", icon: "📶", label: "Free Wi-Fi" },
    { id: "a3", icon: "❄️", label: "Air Con" },
    { id: "a4", icon: "🛁", label: "Marble Bath" },
    { id: "a5", icon: "🌆", label: "City View" },
    { id: "a6", icon: "🍳", label: "Kitchenette" },
  ],
  policies: [
    {
      id: "p1",
      type: "CHECK_IN",
      title: "Check-in",
      description: "Check-in time: 2:00 PM",
    },
    {
      id: "p2",
      type: "CHECK_OUT",
      title: "Check-out",
      description: "Check-out time: 12:00 PM",
    },
    {
      id: "p3",
      type: "CANCELLATION",
      title: "Cancellation",
      description: "Free cancellation up to 48 hours before check-in.",
    },
    {
      id: "p4",
      type: "SMOKING",
      title: "Smoking",
      description: "Non-smoking room. Penalty applies.",
    },
  ],
};

// Policy Icons
export const POLICY_ICONS = {
  CHECK_IN: "🕑",
  CHECK_OUT: "🕛",
  CANCELLATION: "📋",
  SMOKING: "🚭",
  PET: "🐾",
  PAYMENT: "💳",
  GENERAL: "ℹ️",
};

// Mock Bookings
export const MOCK_BOOKINGS = [
  {
    id: "1",
    roomName: "Royal Penthouse Suite",
    reference: "SE-882109",
    dateRange: "Oct 12 — Oct 15",
    amount: 1240,
    currency: "$",
    status: "active",
  },
  {
    id: "2",
    roomName: "Azure Boutique Room",
    reference: "SE-119042",
    dateRange: "Nov 04 — Nov 06",
    amount: 420,
    currency: "$",
    status: "pending",
  },
  {
    id: "3",
    roomName: "Classic Deluxe Studio",
    reference: "SE-445012",
    dateRange: "Aug 20 — Aug 22",
    amount: 380,
    currency: "$",
    status: "cancelled",
  },
  {
    id: "4",
    roomName: "Skyline Executive Suite",
    reference: "SE-990031",
    dateRange: "Dec 22 — Dec 28",
    amount: 2450,
    currency: "$",
    status: "active",
  },
];

// Filter Tabs for Bookings
export const FILTER_TABS = [
  { id: "all", label: "ALL" },
  { id: "active", label: "ACTIVE" },
  { id: "pending", label: "PENDING" },
  { id: "cancelled", label: "CANCELLED" },
];

// Navigation Tabs moved to constants/navigation.js for consistency
