import apiClient from "../lib/apiClient";

/**
 * Get all reviews for a specific room.
 * Handles paginated { results: [...] } or plain array responses.
 *
 * @param {number|string} roomId
 * @returns {Promise<Array>}
 */
export const getReviewsByRoom = async (roomId) => {
  const response = await apiClient.get("/reviews/", {
    params: { room: roomId },
  });
  const data = response.data;
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
};

/**
 * Get all reviews with optional filters.
 *
 * @param {object} filters - e.g. { ordering: "-created_at", room: 1 }
 * @returns {Promise<Array>}
 */
export const getReviews = async (filters = {}) => {
  const response = await apiClient.get("/reviews/", { params: filters });
  const data = response.data;
  return Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];
};

/**
 * Get a specific review by ID.
 *
 * @param {number} reviewId
 * @returns {Promise<object>}
 */
export const getReviewDetail = async (reviewId) => {
  const response = await apiClient.get(`/reviews/${reviewId}/`);
  return response.data;
};

/**
 * Get full booking detail — used to verify a booking before submitting a review.
 *
 * @param {number} bookingId
 * @returns {Promise<object>} BookingDetailSerializer shape (includes booking_rooms)
 */
export const getBookingDetail = async (bookingId) => {
  const response = await apiClient.get(`/bookings/${bookingId}/`);
  return response.data;
};

/**
 * Get the user's completed bookings that include a specific room.
 *
 * FIX: The list endpoint (/bookings/my/) uses BookingListSerializer which does
 * NOT include booking_rooms. We therefore cannot filter by room on the client
 * using the list response — that check always returned undefined/false, causing
 * completedBookings to always be empty.
 *
 * Strategy:
 *   1. Fetch all user bookings from the list endpoint.
 *   2. Filter client-side for status === "completed" only.
 *   3. For each candidate, fetch the full detail (which includes booking_rooms)
 *      and check that the room is present.
 *
 * The backend serializer already validates room membership on POST /reviews/,
 * so step 3 here is a UX guard — it gives the user a clear error message
 * instead of a silent 400 from the API.
 *
 * @param {number|string} roomId
 * @returns {Promise<Array>} BookingDetailSerializer objects that include roomId
 */
export const getUserCompletedBookingsForRoom = async (roomId) => {
  const response = await apiClient.get("/bookings/my/");
  const data = response.data;
  const all = Array.isArray(data)
    ? data
    : Array.isArray(data?.results)
      ? data.results
      : [];

  // Step 1: filter list for completed status only
  const completedList = all.filter((b) => b.status === "completed");

  if (completedList.length === 0) return [];

  // Step 2: fetch full detail for each completed booking so we have booking_rooms
  const detailPromises = completedList.map(
    (b) =>
      apiClient
        .get(`/bookings/${b.id}/`)
        .then((r) => r.data)
        .catch(() => null), // skip if a detail fetch fails
  );
  const details = (await Promise.all(detailPromises)).filter(Boolean);

  // Step 3: keep only those that actually contain this room
  return details.filter((booking) =>
    booking.booking_rooms?.some((br) => String(br.room?.id) === String(roomId)),
  );
};

/**
 * Submit a new review.
 * @param {{ room: number|string, booking: number|string, rating: number, comment: string }} reviewData
 * @returns {Promise<object>} Created review
 */
export const submitReview = async ({ room, booking, rating, comment }) => {
  const response = await apiClient.post("/reviews/", {
    room: parseInt(room, 10), // FIX: coerce string → integer
    booking: parseInt(booking, 10), // FIX: coerce string → integer
    rating,
    comment,
  });
  return response.data;
};

/**
 * Update an existing review (owner only).
 *
 * @param {number} reviewId
 * @param {{ rating?: number, comment?: string }} updates
 * @returns {Promise<object>}
 */
export const updateReview = async (reviewId, updates) => {
  const response = await apiClient.patch(`/reviews/${reviewId}/`, updates);
  return response.data;
};

/**
 * Delete a review (owner only).
 *
 * @param {number} reviewId
 * @returns {Promise<void>}
 */
export const deleteReview = async (reviewId) => {
  await apiClient.delete(`/reviews/${reviewId}/`);
};
