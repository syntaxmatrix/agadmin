import axios from "axios";
import { ADMIN_API_PREFIX, API_BASE_URL } from "@/lib/config";

function readCookie(name: string) {
  if (typeof document === "undefined") {
    return undefined;
  }

  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2];
}

const api = axios.create({
  baseURL: `${API_BASE_URL}${ADMIN_API_PREFIX}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json"
  }
});

api.interceptors.request.use((config) => {
  const token = readCookie("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message ??
      error.response?.data?.error ??
      error.message ??
      "Something went wrong.";

    return Promise.reject(new Error(message));
  }
);

export default api;
