import apiClient from "../lib/apiClient";

export const login = async (email, password) => {
  const response = await apiClient.post("/auth/login/", { email, password });
  return response.data;
};

export const register = async ({
  email,
  username,
  first_name,
  last_name,
  phone_number,
  password,
  password2,
}) => {
  const response = await apiClient.post("/auth/register/", {
    email,
    username,
    first_name,
    last_name,
    phone_number,
    password,
    password2,
  });
  return response.data;
};

export const getMe = async () => {
  const response = await apiClient.get("/auth/me/");
  return response.data;
};

export const logout = async (refresh) => {
  await apiClient.post("/auth/logout/", { refresh });
};
