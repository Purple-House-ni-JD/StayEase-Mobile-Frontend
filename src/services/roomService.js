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
