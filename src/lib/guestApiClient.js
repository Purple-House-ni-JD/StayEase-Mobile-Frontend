import axios from "axios";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim().split(",")[0];

const guestApiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default guestApiClient;
