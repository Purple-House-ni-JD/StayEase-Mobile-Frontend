/**
 * authService.js
 *
 * All API calls that touch /api/v1/auth/ endpoints.
 * Covers registration, login, logout, profile read/write, and avatar upload.
 */

import apiClient from "../lib/apiClient";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const register = async ({
  email,
  username,
  first_name,
  last_name,
  phone_number,
  password,
  password2,
}) => {
  const res = await apiClient.post("/auth/register/", {
    email,
    username,
    first_name,
    last_name,
    phone_number,
    password,
    password2,
  });
  return res.data; // { user, access, refresh }
};

export const login = async (email, password) => {
  const res = await apiClient.post("/auth/login/", { email, password });
  return res.data; // { user, access, refresh }
};

export const logout = async (refresh) => {
  await apiClient.post("/auth/logout/", { refresh });
};

export const googleOAuthLogin = async (idToken) => {
  const res = await apiClient.post("/auth/oauth/google/", {
    id_token: idToken,
  });
  return res.data; // { user, access, refresh }
};

export const facebookOAuthLogin = async (accessToken) => {
  const res = await apiClient.post("/auth/oauth/facebook/", {
    access_token: accessToken,
  });
  return res.data; // { user, access, refresh }
};

// ─── Profile ─────────────────────────────────────────────────────────────────

/**
 * GET /auth/me/
 * Returns the full UserProfileSerializer shape:
 * { id, email, username, first_name, last_name, phone_number,
 *   avatar_url, role, date_joined, has_password, linked_providers }
 */
export const getMe = async () => {
  const res = await apiClient.get("/auth/me/");
  return res.data;
};

/**
 * PATCH /auth/me/
 * Updatable fields: first_name, last_name, username, phone_number
 * email and role are read-only on the backend.
 *
 * @param {{ first_name?, last_name?, username?, phone_number? }} fields
 */
export const updateMe = async (fields) => {
  const res = await apiClient.patch("/auth/me/", fields);
  return res.data;
};

/**
 * PATCH /auth/me/avatar/
 * Uploads an image to Cloudinary via multipart/form-data.
 *
 * @param {{ uri: string, mimeType?: string, fileName?: string }} imageAsset
 *   — asset object from expo-image-picker
 * @returns {{ avatar_url: string }}
 */
export const uploadAvatar = async (imageAsset) => {
  const formData = new FormData();
  formData.append("avatar", {
    uri: imageAsset.uri,
    type: imageAsset.mimeType ?? "image/jpeg",
    name: imageAsset.fileName ?? "avatar.jpg",
  });
  const res = await apiClient.patch("/auth/me/avatar/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};
