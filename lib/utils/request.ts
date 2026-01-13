import axios from "axios";
import { ApiError } from "../types";
const API_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

const api = axios.create({
  // baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (config.signal) {
    const source = axios.CancelToken.source();
    config.cancelToken = source.token;

    config.signal.addEventListener?.("abort", () => {
      source.cancel("Request aborted by user");
    });
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      return { data: null, error: null };
    }

    if (error.code === "ERR_NETWORK") {
      return Promise.reject({ message: "NETWORK_ERROR" } as ApiError);
    }

    if (error.response?.data?.message) {
      return Promise.reject({
        message: error.response.data.message,
      } as ApiError);
    }

    return Promise.reject({ message: "UNKNOWN" } as ApiError);
  }
);

export default api;
