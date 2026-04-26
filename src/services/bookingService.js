import apiClient from "../lib/apiClient";

export const createBooking = async ({
  room_ids,
  check_in,
  check_out,
  guest_count,
  payment_method,
}) => {
  const response = await apiClient.post("/bookings/create/", {
    room_ids,
    check_in,
    check_out,
    guest_count,
    payment_method,
  });
  return response.data;
};

export const getMyBookings = async () => {
  const response = await apiClient.get("/bookings/my/");
  return response.data;
};
