import axios from "axios";

// Determine the environment and set base URLs
const environment = "local";
console.log("Environment:", environment);

let IMAGE_BASE_URL = "";
let APP_URL = "";

if (environment === "local") {
  APP_URL = "http://localhost:3000/";
} else if (environment === "prod") {
  APP_URL = "https://practicebackend-uat.thedoclinq.com/api/";
} else{
  APP_URL = "http://localhost:3000/"
}

export { IMAGE_BASE_URL, APP_URL };

// Axios base config
const baseURL = `${APP_URL}`;
const headers = {
  accept: "application/json",
  "Content-Type": "application/json",
};

// Create instance
export const HTTP = axios.create({
  baseURL,
  headers,
  withCredentials: false,
});

// // Token getter (matches Postman `auth_token`)
// const getToken = () => {
//   if (typeof window !== "undefined") {
//     return (
//       localStorage.getItem("auth_token") ||
//       localStorage.getItem("token") ||
//       localStorage.getItem("clientaccesstoken")
//     );
//   }

//   // 👇 Hardcoded fallback for build time or SSR
//   return "2|G3Y7woZ55m7W0vHHm0UZbTGO34i1bQJRsLUQqPEY04c662f9";
// };

// // Request interceptor for attaching Authorization header
// HTTP.interceptors.request.use(
//   (config) => {
//     const token = getToken();
//     if (token) {
//       config.headers["Authorization"] = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor for handling 401 unauthorized
// HTTP.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 || message === "Unauthenticated.") {
//       console.error("Unauthorized, redirecting to login...");
//       localStorage.removeItem("auth_token");
//       localStorage.removeItem("token");
//       localStorage.removeItem("clientaccesstoken");
//       localStorage.removeItem("healthcare_user");

//       window.location.reload();

//       // window.location.href = "/doctor-signin";
//     }
//     return Promise.reject(error);
//   }
// );
