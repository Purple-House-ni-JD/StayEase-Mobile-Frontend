import { create } from "zustand";
import { getFeaturedRooms, getRooms } from "@/services/roomService";

const useRoomStore = create((set, get) => ({
  rooms: [],
  featuredProperty: null,
  searchQuery: "",
  activeCategory: "ALL",
  cart: [],
  isRoomsLoading: false,

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),

  hydrateRooms: async () => {
    set({ isRoomsLoading: true });
    try {
      const [featured, roomsResponse] = await Promise.all([
        getFeaturedRooms(),
        getRooms(),
      ]);

      const rooms = Array.isArray(roomsResponse?.results)
        ? roomsResponse.results
        : Array.isArray(roomsResponse)
          ? roomsResponse
          : [];

      set({
        rooms: rooms.map((room) => ({
          id: room.id,
          name: room.name,
          category: room.category_display || room.category,
          price: Number(room.price_per_night),
          rating: Number(room.rating || 0),
          image: room.image_urls?.[0] ? { uri: room.image_urls[0] } : null,
          imageUrls: room.image_urls || [],
        })),
        featuredProperty:
          featured?.[0] != null
            ? {
                id: featured[0].id,
                name: featured[0].name,
                location: featured[0].category_display || featured[0].category,
                price: Number(featured[0].price_per_night),
                badge: "FEATURED",
                image: featured[0].image_urls?.[0]
                  ? { uri: featured[0].image_urls[0] }
                  : null,
              }
            : null,
      });
    } finally {
      set({ isRoomsLoading: false });
    }
  },

  getRoomById: (id) => get().rooms.find((room) => String(room.id) === String(id)),

  addToCart: ({ room, checkIn, checkOut, nights }) => {
    if (!room || !checkIn || !checkOut || nights <= 0) {
      return;
    }

    const cartItem = {
      id: `cart-${Date.now()}`,
      roomId: room.id,
      name: room.name,
      pricePerNight: room.price_per_night,
      checkIn,
      checkOut,
      nights,
      total: room.price_per_night * nights,
      image: room.image,
    };

    set((state) => ({
      cart: [...state.cart, cartItem],
    }));
  },

  removeFromCart: (cartItemId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.id !== cartItemId),
    })),

  clearCart: () => set({ cart: [] }),
}));

export default useRoomStore;
