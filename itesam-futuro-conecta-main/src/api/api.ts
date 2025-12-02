import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost/its-api/api/", // ajuste conforme necessário
  timeout: 10000,
});
