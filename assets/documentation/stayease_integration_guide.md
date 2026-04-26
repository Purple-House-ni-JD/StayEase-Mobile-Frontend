# StayEase — React Native + Expo to Django Backend Integration Guide

> **Stack:** React Native (Expo) · Django REST Framework · PostgreSQL · JWT Auth · Cloudinary  
> **Base URL:** `http://127.0.0.1:8000/api/v1` (dev) → replace with your deployed URL in production

---

## Table of Contents

1. [Project Setup & Dependencies](#1-project-setup--dependencies)
2. [Environment Configuration](#2-environment-configuration)
3. [API Client (Axios)](#3-api-client-axios)
4. [Token Management](#4-token-management)
5. [Auth Context & State](#5-auth-context--state)
6. [Auth Integration](#6-auth-integration)
7. [Google OAuth Integration](#7-google-oauth-integration)
8. [Facebook OAuth Integration](#8-facebook-oauth-integration)
9. [Rooms Integration](#9-rooms-integration)
10. [Bookings Integration](#10-bookings-integration)
11. [Payments Integration](#11-payments-integration)
12. [Reviews Integration](#12-reviews-integration)
13. [Wishlist Integration](#13-wishlist-integration)
14. [Reports Integration (Admin)](#14-reports-integration-admin)
15. [Image Uploads (Cloudinary)](#15-image-uploads-cloudinary)
16. [Error Handling Pattern](#16-error-handling-pattern)
17. [Folder Structure](#17-folder-structure)
18. [Backend CORS & Network Setup](#18-backend-cors--network-setup)

---

## 1. Project Setup & Dependencies

Install all required packages:

```bash
# Core HTTP + storage
npx expo install axios
npx expo install expo-secure-store

# OAuth
npx expo install expo-auth-session expo-web-browser expo-crypto
npx expo install react-native-fbsdk-next
# or for Facebook via Expo:
npx expo install expo-facebook

# Image picking (for avatar/room image upload)
npx expo install expo-image-picker

# Navigation (if not already installed)
npx expo install expo-router

# Environment variables
npx expo install expo-constants
```

---

## 2. Environment Configuration

Create a `.env` file in your Expo project root:

```ini
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
EXPO_PUBLIC_FACEBOOK_APP_ID=your-facebook-app-id
```

> ⚠️ For physical device testing, replace `127.0.0.1` with your machine's **local network IP**
> (e.g. `192.168.1.x`). The emulator uses `10.0.2.2` for Android.

Access in code:

```javascript
const API_URL = process.env.EXPO_PUBLIC_API_URL;
```

---

## 3. API Client (Axios)

Create `lib/apiClient.js`. This is the central Axios instance used by every service file.

```javascript
// lib/apiClient.js
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL;

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach the access token to every outgoing request automatically
apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401, try to refresh the access token once. If refresh also fails, log out.
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue subsequent requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const response = await axios.post(`${BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access, refresh } = response.data;
        await SecureStore.setItemAsync('access_token', access);
        await SecureStore.setItemAsync('refresh_token', refresh);

        apiClient.defaults.headers.common.Authorization = `Bearer ${access}`;
        processQueue(null, access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Clear tokens and force logout
        await SecureStore.deleteItemAsync('access_token');
        await SecureStore.deleteItemAsync('refresh_token');
        // Emit logout event — handled by AuthContext
        authEventEmitter.emit('logout');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Simple event emitter for logout signaling
class AuthEventEmitter {
  constructor() { this.listeners = {}; }
  on(event, fn) { this.listeners[event] = fn; }
  emit(event) { if (this.listeners[event]) this.listeners[event](); }
}

export const authEventEmitter = new AuthEventEmitter();
export default apiClient;
```

---

## 4. Token Management

Create `lib/tokenStorage.js` to keep all SecureStore logic in one place:

```javascript
// lib/tokenStorage.js
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'access_token';
const REFRESH_KEY = 'refresh_token';

export const saveTokens = async (access, refresh) => {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
};

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_KEY);
export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_KEY);

export const clearTokens = async () => {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
};
```

---

## 5. Auth Context & State

Create `context/AuthContext.js`. This wraps the whole app and gives every screen access to the current user and auth functions:

```javascript
// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { saveTokens, clearTokens, getAccessToken } from '../lib/tokenStorage';
import { authEventEmitter } from '../lib/apiClient';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // true while checking stored token

  // On app start: check if we have a stored token and fetch the user profile
  useEffect(() => {
    const bootstrapAuth = async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const me = await authService.getMe();
          setUser(me);
        }
      } catch {
        // Token is expired/invalid — the interceptor will clear it
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrapAuth();

    // Listen for forced logout from the token refresh interceptor
    authEventEmitter.on('logout', () => {
      setUser(null);
    });
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    await saveTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  };

  const register = async (payload) => {
    const data = await authService.register(payload);
    await saveTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  };

  const loginWithOAuth = async (data) => {
    // Used by both Google and Facebook OAuth views
    await saveTokens(data.access, data.refresh);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      const { getRefreshToken } = await import('../lib/tokenStorage');
      const refresh = await getRefreshToken();
      if (refresh) await authService.logout(refresh);
    } catch {
      // Ignore logout API errors — clear locally regardless
    } finally {
      await clearTokens();
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => ({ ...prev, ...updatedFields }));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout, loginWithOAuth, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
```

Wrap your root layout:

```javascript
// app/_layout.tsx
import { AuthProvider } from '../context/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack />
    </AuthProvider>
  );
}
```

---

## 6. Auth Integration

Create `services/authService.js`:

```javascript
// services/authService.js
import apiClient from '../lib/apiClient';

export const register = async ({ email, username, first_name, last_name, phone_number, password, password2 }) => {
  const res = await apiClient.post('/auth/register/', {
    email, username, first_name, last_name, phone_number, password, password2,
  });
  return res.data; // { user, access, refresh }
};

export const login = async (email, password) => {
  const res = await apiClient.post('/auth/login/', { email, password });
  return res.data; // { user, access, refresh }
};

export const logout = async (refresh) => {
  await apiClient.post('/auth/logout/', { refresh });
};

export const getMe = async () => {
  const res = await apiClient.get('/auth/me/');
  return res.data;
};

export const updateMe = async (fields) => {
  const res = await apiClient.patch('/auth/me/', fields);
  return res.data;
};
```

Usage example in a Login screen:

```javascript
// app/(auth)/login.jsx
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      setError('');
      const user = await login(email, password);
      // Redirect based on role
      if (user.role === 'admin') {
        router.replace('/(admin)/dashboard');
      } else {
        router.replace('/(guest)/home');
      }
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed. Check your credentials.';
      setError(msg);
    }
  };

  // ... render your form
}
```

---

## 7. Google OAuth Integration

**Step 1** — Set up Google Cloud Console:
- Create a project at [console.cloud.google.com](https://console.cloud.google.com)
- Enable the **Google+ API** and **Google Sign-In**
- Create OAuth credentials: choose **Android** and **iOS** client IDs
- For Expo Go testing, also create a **Web** client ID

**Step 2** — Add to `app.json`:

```json
{
  "expo": {
    "scheme": "stayease",
    "ios": {
      "bundleIdentifier": "com.yourteam.stayease",
      "googleServicesFile": "./GoogleService-Info.plist"
    },
    "android": {
      "package": "com.yourteam.stayease",
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

**Step 3** — Create `services/googleAuthService.js`:

```javascript
// services/googleAuthService.js
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import apiClient from '../lib/apiClient';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleAuth = () => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
    // For bare workflow, add iosClientId and androidClientId separately
  });

  return { request, response, promptAsync };
};

export const loginWithGoogle = async (idToken) => {
  const res = await apiClient.post('/auth/oauth/google/', { id_token: idToken });
  return res.data; // { user, access, refresh }
};
```

**Step 4** — Use in a screen:

```javascript
// app/(auth)/login.jsx
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useGoogleAuth, loginWithGoogle } from '../../services/googleAuthService';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const { loginWithOAuth } = useAuth();
  const router = useRouter();
  const { request, response, promptAsync } = useGoogleAuth();

  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      handleGoogleToken(id_token);
    }
  }, [response]);

  const handleGoogleToken = async (idToken) => {
    try {
      const data = await loginWithGoogle(idToken);
      await loginWithOAuth(data);
      router.replace('/(guest)/home');
    } catch (err) {
      console.error('Google login failed:', err.response?.data);
    }
  };

  return (
    // ...
    <Button
      title="Sign in with Google"
      disabled={!request}
      onPress={() => promptAsync()}
    />
  );
}
```

---

## 8. Facebook OAuth Integration

**Step 1** — Set up Facebook Developer Console:
- Create an app at [developers.facebook.com](https://developers.facebook.com)
- Add the **Facebook Login** product
- Add your bundle ID (iOS) and package name (Android)
- Set Required Permissions: `public_profile`, `email`

**Step 2** — Add to `app.json`:

```json
{
  "expo": {
    "plugins": [
      ["react-native-fbsdk-next", {
        "appID": "your-facebook-app-id",
        "clientToken": "your-facebook-client-token",
        "displayName": "StayEase",
        "scheme": "fb your-facebook-app-id",
        "advertiserIDCollectionEnabled": false,
        "autoLogAppEventsEnabled": false,
        "isAutoInitEnabled": true
      }]
    ]
  }
}
```

**Step 3** — Create `services/facebookAuthService.js`:

```javascript
// services/facebookAuthService.js
import { LoginManager, AccessToken } from 'react-native-fbsdk-next';
import apiClient from '../lib/apiClient';

export const loginWithFacebook = async () => {
  // Trigger the Facebook login dialog
  const result = await LoginManager.logInWithPermissions(['public_profile', 'email']);

  if (result.isCancelled) {
    throw new Error('Facebook login was cancelled.');
  }

  // Get the access token
  const tokenData = await AccessToken.getCurrentAccessToken();
  if (!tokenData) {
    throw new Error('Failed to get Facebook access token.');
  }

  // Send to our backend
  const res = await apiClient.post('/auth/oauth/facebook/', {
    access_token: tokenData.accessToken,
  });

  return res.data; // { user, access, refresh }
};
```

**Step 4** — Use in a screen:

```javascript
import { loginWithFacebook } from '../../services/facebookAuthService';
import { useAuth } from '../../context/AuthContext';

const handleFacebookLogin = async () => {
  try {
    const data = await loginWithFacebook();
    await loginWithOAuth(data);
    router.replace('/(guest)/home');
  } catch (err) {
    const msg = err.response?.data?.detail || err.message;
    setError(msg);
  }
};
```

> ⚠️ `react-native-fbsdk-next` requires a **development build** (`npx expo run:android` or `npx expo run:ios`). It does **not** work in Expo Go.

---

## 9. Rooms Integration

Create `services/roomService.js`:

```javascript
// services/roomService.js
import apiClient from '../lib/apiClient';

export const getRooms = async (filters = {}) => {
  // filters: { category, check_in, check_out, guests, min_price, max_price,
  //            is_featured, search, ordering, page }
  const res = await apiClient.get('/rooms/', { params: filters });
  return res.data; // { count, next, previous, results: [...] }
};

export const getFeaturedRooms = async () => {
  const res = await apiClient.get('/rooms/featured/');
  return res.data;
};

export const getRoomDetail = async (id) => {
  const res = await apiClient.get(`/rooms/${id}/`);
  return res.data;
};

export const getCategories = async () => {
  const res = await apiClient.get('/rooms/categories/');
  return res.data;
};

// Admin only
export const createRoom = async (payload) => {
  const res = await apiClient.post('/rooms/', payload);
  return res.data;
};

export const updateRoom = async (id, payload) => {
  const res = await apiClient.patch(`/rooms/${id}/`, payload);
  return res.data;
};

export const deleteRoom = async (id) => {
  await apiClient.delete(`/rooms/${id}/`);
};
```

Usage in a screen:

```javascript
// app/(guest)/home.jsx
import { useEffect, useState } from 'react';
import { getRooms, getFeaturedRooms } from '../../services/roomService';

export default function HomeScreen() {
  const [featured, setFeatured] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const [featuredData, allData] = await Promise.all([
          getFeaturedRooms(),
          getRooms({ page: 1 }),
        ]);
        setFeatured(featuredData);
        setRooms(allData.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  // ... render
}
```

**Available filter search:**

```javascript
// Filter rooms by availability
const availableRooms = await getRooms({
  check_in: '2026-05-10',
  check_out: '2026-05-15',
  guests: 2,
  category: 'deluxe',
});
```

---

## 10. Bookings Integration

Create `services/bookingService.js`:

```javascript
// services/bookingService.js
import apiClient from '../lib/apiClient';

export const createBooking = async ({ room_ids, check_in, check_out, guest_count, payment_method }) => {
  const res = await apiClient.post('/bookings/create/', {
    room_ids,
    check_in,
    check_out,
    guest_count,
    payment_method,
  });
  return res.data;
};

export const getMyBookings = async () => {
  const res = await apiClient.get('/bookings/my/');
  return res.data;
};

export const getBookingDetail = async (id) => {
  const res = await apiClient.get(`/bookings/${id}/`);
  return res.data;
};

export const cancelBooking = async (id) => {
  const res = await apiClient.post(`/bookings/${id}/cancel/`);
  return res.data;
};

// Admin only
export const getAllBookings = async (filters = {}) => {
  const res = await apiClient.get('/bookings/', { params: filters });
  return res.data;
};

export const updateBookingStatus = async (id, status) => {
  const res = await apiClient.patch(`/bookings/${id}/status/`, { status });
  return res.data;
};
```

Usage — Checkout screen:

```javascript
// app/(guest)/checkout.jsx
import { createBooking } from '../../services/bookingService';

const handleCheckout = async () => {
  try {
    const booking = await createBooking({
      room_ids: [selectedRoom.id],
      check_in: checkIn,          // 'YYYY-MM-DD'
      check_out: checkOut,        // 'YYYY-MM-DD'
      guest_count: guestCount,
      payment_method: paymentMethod, // 'gcash' | 'maya' | 'card' | 'cash'
    });
    // booking.booking_ref, booking.total_price, booking.status are available
    router.push(`/booking-confirmation/${booking.id}`);
  } catch (err) {
    const errors = err.response?.data;
    // e.g. errors.room_ids = ['Rooms already booked for these dates']
    setError(JSON.stringify(errors));
  }
};
```

---

## 11. Payments Integration

Create `services/paymentService.js`:

```javascript
// services/paymentService.js
import apiClient from '../lib/apiClient';

export const getPayment = async (bookingId) => {
  const res = await apiClient.get(`/payments/${bookingId}/`);
  return res.data;
};

// Admin only
export const updatePayment = async (bookingId, payload) => {
  // payload: { status, transaction_ref, paid_at }
  const res = await apiClient.patch(`/payments/${bookingId}/update/`, payload);
  return res.data;
};
```

Usage:

```javascript
import { getPayment } from '../../services/paymentService';

const payment = await getPayment(bookingId);
// payment.status: 'pending' | 'paid' | 'failed' | 'refunded'
// payment.method: 'gcash' | 'maya' | 'card' | 'cash'
// payment.amount: "7500.00"
```

---

## 12. Reviews Integration

Create `services/reviewService.js`:

```javascript
// services/reviewService.js
import apiClient from '../lib/apiClient';

export const getReviews = async (roomId) => {
  const res = await apiClient.get('/reviews/', { params: { room: roomId } });
  return res.data;
};

export const createReview = async ({ room, booking, rating, comment }) => {
  const res = await apiClient.post('/reviews/', { room, booking, rating, comment });
  return res.data;
};

export const updateReview = async (id, { rating, comment }) => {
  const res = await apiClient.patch(`/reviews/${id}/`, { rating, comment });
  return res.data;
};

export const deleteReview = async (id) => {
  await apiClient.delete(`/reviews/${id}/`);
};
```

> ⚠️ Reviews can only be submitted for **completed** bookings. The backend will return a `400` if the booking status is not `completed`.

Usage:

```javascript
// Submit review after stay
await createReview({
  room: 1,       // room ID
  booking: 3,    // booking ID (must be 'completed')
  rating: 5,
  comment: 'Excellent stay!',
});
```

---

## 13. Wishlist Integration

Create `services/wishlistService.js`:

```javascript
// services/wishlistService.js
import apiClient from '../lib/apiClient';

export const getWishlist = async () => {
  const res = await apiClient.get('/wishlist/');
  return res.data;
};

export const addToWishlist = async (roomId) => {
  const res = await apiClient.post('/wishlist/', { room_id: roomId });
  return res.data;
};

export const removeFromWishlist = async (roomId) => {
  await apiClient.delete(`/wishlist/${roomId}/`);
};
```

Usage with toggle:

```javascript
import { addToWishlist, removeFromWishlist } from '../../services/wishlistService';

const toggleWishlist = async (roomId, isWishlisted) => {
  try {
    if (isWishlisted) {
      await removeFromWishlist(roomId);
    } else {
      await addToWishlist(roomId);
    }
    setIsWishlisted(!isWishlisted);
  } catch (err) {
    console.error(err.response?.data);
  }
};
```

---

## 14. Reports Integration (Admin)

Create `services/reportService.js`:

```javascript
// services/reportService.js
import apiClient from '../lib/apiClient';

export const getDashboardSummary = async () => {
  const res = await apiClient.get('/reports/dashboard/');
  return res.data;
};

export const getRevenue = async ({ period = 'monthly', year, month } = {}) => {
  const res = await apiClient.get('/reports/revenue/', {
    params: { period, year, month },
  });
  return res.data;
};

export const getOccupancy = async (period = 'monthly') => {
  const res = await apiClient.get('/reports/occupancy/', {
    params: { period },
  });
  return res.data;
};

export const getTopRooms = async ({ order_by = 'revenue', limit = 10 } = {}) => {
  const res = await apiClient.get('/reports/top-rooms/', {
    params: { order_by, limit },
  });
  return res.data;
};
```

Usage in admin dashboard:

```javascript
// app/(admin)/dashboard.jsx
import { useEffect, useState } from 'react';
import { getDashboardSummary, getRevenue } from '../../services/reportService';

export default function AdminDashboard() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const load = async () => {
      const data = await getDashboardSummary();
      setSummary(data);
    };
    load();
  }, []);

  // summary.bookings.total, summary.revenue.this_month, etc.
}
```

---

## 15. Image Uploads (Cloudinary)

### Avatar Upload

```javascript
// services/authService.js (add to existing file)
import * as ImagePicker from 'expo-image-picker';
import apiClient from '../lib/apiClient';

export const pickAndUploadAvatar = async () => {
  // 1. Pick image from library
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  if (result.canceled) return null;

  const asset = result.assets[0];

  // 2. Build FormData — must use multipart/form-data
  const formData = new FormData();
  formData.append('avatar', {
    uri: asset.uri,
    type: asset.mimeType ?? 'image/jpeg',
    name: asset.fileName ?? 'avatar.jpg',
  });

  // 3. Send to backend (Axios will set the correct Content-Type header)
  const res = await apiClient.patch('/auth/me/avatar/', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.avatar_url;
};
```

### Room Image Upload (Admin)

```javascript
// services/roomService.js (add to existing file)
export const uploadRoomImages = async (roomId, imageAssets) => {
  const formData = new FormData();

  imageAssets.forEach((asset) => {
    formData.append('images', {
      uri: asset.uri,
      type: asset.mimeType ?? 'image/jpeg',
      name: asset.fileName ?? `room_${roomId}_image.jpg`,
    });
  });

  const res = await apiClient.post(`/rooms/${roomId}/images/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.image_urls;
};
```

---

## 16. Error Handling Pattern

Use this consistent pattern across all screens:

```javascript
// lib/errorUtils.js
export const extractErrorMessage = (err) => {
  const data = err.response?.data;

  if (!data) return 'Network error. Please check your connection.';

  // DRF field-level errors: { field: ['error msg'] }
  if (typeof data === 'object' && !data.detail) {
    const messages = Object.entries(data)
      .map(([field, errors]) => {
        const msgs = Array.isArray(errors) ? errors.join(', ') : errors;
        return `${field}: ${msgs}`;
      })
      .join('\n');
    return messages;
  }

  // DRF non-field error: { detail: 'error msg' }
  return data.detail ?? 'Something went wrong. Please try again.';
};
```

Usage in any screen:

```javascript
import { extractErrorMessage } from '../../lib/errorUtils';

try {
  await someService.doSomething();
} catch (err) {
  const message = extractErrorMessage(err);
  Alert.alert('Error', message);
}
```

---

## 17. Folder Structure

Recommended layout for your Expo project:

```
your-expo-app/
├── app/
│   ├── _layout.tsx              ← wrap with AuthProvider here
│   ├── (auth)/
│   │   ├── login.jsx
│   │   └── register.jsx
│   ├── (guest)/
│   │   ├── home.jsx
│   │   ├── room/[id].jsx
│   │   ├── checkout.jsx
│   │   ├── bookings.jsx
│   │   └── wishlist.jsx
│   └── (admin)/
│       ├── dashboard.jsx
│       ├── rooms.jsx
│       └── bookings.jsx
├── context/
│   └── AuthContext.js
├── lib/
│   ├── apiClient.js             ← Axios instance + interceptors
│   ├── tokenStorage.js
│   └── errorUtils.js
├── services/
│   ├── authService.js
│   ├── googleAuthService.js
│   ├── facebookAuthService.js
│   ├── roomService.js
│   ├── bookingService.js
│   ├── paymentService.js
│   ├── reviewService.js
│   ├── wishlistService.js
│   └── reportService.js
├── components/
│   ├── RoomCard.jsx
│   ├── BookingCard.jsx
│   └── ...
└── .env
```

---

## 18. Backend CORS & Network Setup

### For Expo Go (WiFi testing on physical device)

1. Find your machine's local IP:
   - Windows: `ipconfig` → look for IPv4 Address (e.g. `192.168.1.5`)
   - Mac/Linux: `ifconfig` → look for `inet` under `en0`

2. Update your Django `.env`:
   ```ini
   ALLOWED_HOSTS=localhost,127.0.0.1,192.168.1.5
   CORS_ALLOWED_ORIGINS=http://192.168.1.5:8081,http://localhost:8081
   ```

3. Update your Expo `.env`:
   ```ini
   EXPO_PUBLIC_API_URL=http://192.168.1.5:8000/api/v1
   ```

4. Run Django bound to all interfaces:
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

### For Android Emulator

```ini
EXPO_PUBLIC_API_URL=http://10.0.2.2:8000/api/v1
```

### For iOS Simulator

```ini
EXPO_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
```

### Production

- Deploy Django to a server (Railway, Render, DigitalOcean, etc.)
- Set `EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api/v1`
- Update `ALLOWED_HOSTS` and `CORS_ALLOWED_ORIGINS` in Django `.env` with your production domain
- Set `DEBUG=False` and configure `gunicorn` + `nginx`
