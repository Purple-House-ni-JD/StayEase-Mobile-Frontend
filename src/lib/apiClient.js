import axios from "axios";
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  saveTokens,
} from "./tokenStorage";

const BASE_URL = process.env.EXPO_PUBLIC_API_URL?.trim().split(",")[0];
console.log("BASE_URL", BASE_URL);

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

class AuthEventEmitter {
  constructor() {
    this.listeners = {};
  }

  on(event, fn) {
    this.listeners[event] = fn;
  }

  emit(event) {
    if (this.listeners[event]) {
      this.listeners[event]();
    }
  }
}

export const authEventEmitter = new AuthEventEmitter();

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promiseHandlers) => {
    if (error) {
      promiseHandlers.reject(error);
      return;
    }
    promiseHandlers.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;
    if (!originalRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refresh = await getRefreshToken();
        if (!refresh) {
          throw new Error("Missing refresh token.");
        }

        const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh,
        });

        const nextAccess = response.data?.access;
        const nextRefresh = response.data?.refresh || refresh;
        await saveTokens(nextAccess, nextRefresh);
        processQueue(null, nextAccess);
        originalRequest.headers.Authorization = `Bearer ${nextAccess}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        await clearTokens();
        authEventEmitter.emit("logout");
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
