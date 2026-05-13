import apiClient from "../lib/apiClient";

export const getRooms = async (filters = {}) => {
  const response = await apiClient.get("/rooms/", { params: filters });
  return response.data;
};

export const getFeaturedRooms = async () => {
  const response = await apiClient.get("/rooms/featured/");
  return response.data;
};

export const getRoomDetail = async (id) => {
  const response = await apiClient.get(`/rooms/${id}/`);
  return response.data;
};

export const getRoomBookedDates = async (roomId) => {
  const response = await apiClient.get(`/rooms/${roomId}/booked-dates/`);
  const rawDates = response.data?.booked_dates ?? [];
  return rawDates.map((dateStr) => {
    const [year, month, day] = dateStr.slice(0, 10).split("-").map(Number);
    return new Date(year, month - 1, day);
  });
};
