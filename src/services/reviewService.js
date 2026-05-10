import apiClient from "../lib/apiClient";

const unwrapList = (data) =>
  Array.isArray(data) ? data : Array.isArray(data?.results) ? data.results : [];

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

export const getReviewsByRoom = (roomId) =>
  apiClient
    .get("/reviews/", { params: { room: roomId } })
    .then((r) => unwrapList(r.data));

export const getReviewDetail = (reviewId) =>
  apiClient.get(`/reviews/${reviewId}/`).then((r) => r.data);

export const updateReview = (reviewId, updates) =>
  apiClient.patch(`/reviews/${reviewId}/`, updates).then((r) => r.data);

export const deleteReview = (reviewId) =>
  apiClient.delete(`/reviews/${reviewId}/`);

// ---------------------------------------------------------------------------
// Bookings (used by review flow)
// ---------------------------------------------------------------------------

/**
 * Returns the user's completed bookings that include a specific room.
 * Fetches list first, then detail for each completed booking to get booking_rooms.
 */
export const getUserCompletedBookingsForRoom = async (roomId) => {
  const all = await apiClient
    .get("/bookings/my/")
    .then((r) => unwrapList(r.data));

  const completed = all.filter((b) => b.status === "completed");
  if (completed.length === 0) return [];

  const details = await Promise.all(
    completed.map((b) =>
      apiClient
        .get(`/bookings/${b.id}/`)
        .then((r) => r.data)
        .catch(() => null),
    ),
  );

  return details.filter((b) =>
    b?.booking_rooms?.some(
      (br) => String(br.room?.id ?? br.room) === String(roomId),
    ),
  );
};

// ---------------------------------------------------------------------------
// Submit
// ---------------------------------------------------------------------------

/**
 * Submit a new review.
 * On failure, throws an Error with a plain user-readable message extracted
 * from the DRF response. Callers can do: catch(err) => Alert(..., err.message)
 */
export const submitReview = async ({ room, booking, rating, comment }) => {
  try {
    const { data } = await apiClient.post("/reviews/", {
      room: Number(room),
      booking: Number(booking),
      rating,
      comment,
    });
    return data;
  } catch (err) {
    // Re-throw with a human-readable message so callers don't need to parse anything.
    throw new Error(extractApiError(err));
  }
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Pulls the first readable error string out of an Axios error response.
 * Handles DRF field errors, non_field_errors, and our custom error_code shape.
 */
function extractApiError(err) {
  const data = err?.response?.data;

  if (!data) {
    // Network error or no response body
    return err?.message || "Network error. Please check your connection.";
  }

  // Custom shape: { error: "...", error_code: "..." }
  if (typeof data.error === "string") return data.error;

  // DRF non_field_errors
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length) {
    return data.non_field_errors.join(" ");
  }

  // DRF field errors — flatten arrays, return first meaningful string
  if (typeof data === "object") {
    for (const value of Object.values(data)) {
      const msg = Array.isArray(value) ? value[0] : value;
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    }
  }

  return "Something went wrong. Please try again.";
}
