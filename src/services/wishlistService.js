import apiClient from "../lib/apiClient";

export const getWishlist = async () => {
  const response = await apiClient.get("/wishlist/");
  return response.data;
};

export const addToWishlist = async (roomId) => {
  console.log("Adding to wishlist:", roomId);
  const response = await apiClient.post("/wishlist/", { room_id: roomId });
  console.log("Wishlist response:", response.data);
  return response.data;
};

export const removeFromWishlist = async (roomId) => {
  const response = await apiClient.delete(`/wishlist/${roomId}/`);
  return response.data;
};
