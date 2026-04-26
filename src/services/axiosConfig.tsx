import axios from "axios";

// Add a request interceptor to automatically include token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = (error.config?.url as string | undefined) ?? "";
    const isAuthRequest =
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/signup");

    if (status === 401 && !isAuthRequest) {
      // Token expired or invalid on protected endpoints; clear session and redirect.
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");

      const isAlreadyOnPublicAuthRoute =
        window.location.pathname === "/" || window.location.pathname === "/login";

      if (!isAlreadyOnPublicAuthRoute) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
