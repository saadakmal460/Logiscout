import axios, { AxiosInstance } from "axios";

const HTTP: AxiosInstance = axios.create({
  baseURL: "http://127.0.0.1:3000/api/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: false,
});

export default HTTP;
