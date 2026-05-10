import apiClient from "../lib/apiClient";

export const getWishlist = async () => {
  const response = await apiClient.get("/wishlist/");
  return response.data;
};

export const addToWishlist = async (roomId) => {
  const response = await apiClient.post("/wishlist/", { room_id: roomId });
  return response.data;
};

export const removeFromWishlist = async (roomId) => {
  const response = await apiClient.delete(`/wishlist/${roomId}/`);
  return response.data;
};
