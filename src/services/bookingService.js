import apiClient from "../lib/apiClient";
import guestApiClient from "../lib/guestApiClient";

export const createBooking = async ({
  room_ids,
  check_in,
  check_out,
  guest_count,
  payment_method,
  guest_details = null,
}) => {
  const payload = {
    room_ids,
    check_in,
    check_out,
    guest_count,
    payment_method,
  };

  if (guest_details) {
    payload.guest_details = guest_details;
  }

  const response = await apiClient.post("/bookings/create/", payload);
  return response.data;
};

export const createGuestBooking = async ({
  room_ids,
  check_in,
  check_out,
  guest_count,
  payment_method,
  guest_details,
}) => {
  const response = await guestApiClient.post("/bookings/guest/create/", {
    room_ids,
    check_in,
    check_out,
    guest_count,
    payment_method,
    guest_details,
  });
  return response.data;
};

export const getMyBookings = async () => {
  const response = await apiClient.get("/bookings/my/");
  return response.data;
};

export const getBookingDetail = async (id) => {
  const response = await apiClient.get(`/bookings/${id}/`);
  return response.data;
};

export const cancelBooking = async (id) => {
  const response = await apiClient.post(`/bookings/${id}/cancel/`);
  return response.data;
};
