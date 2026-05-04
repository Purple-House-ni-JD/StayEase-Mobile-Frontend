// ─── Navigation Configuration ────────────────────────────────────────────────────────

// Unified navigation tabs for BottomNavBar
export const NAV_TABS = [
  { id: "home", icon: "🏠", label: "HOME" },
  { id: "cart", icon: "🛒", label: "CART" },
  { id: "bookings", icon: "📋", label: "BOOKINGS" },
  { id: "wishlist", icon: "❤️", label: "WISHLIST" },
];

// Route mappings for navigation
export const NAV_ROUTES = {
  home: "pages/HomePage",
  cart: "pages/BookingCartPage",
  bookings: "pages/BookingsPage",
  wishlist: "pages/WishlistPage",
};

// Helper function for navigation
export const navigateToTab = (router, tabId) => {
  const route = NAV_ROUTES[tabId];
  if (route) {
    router.push(route);
  }
};
