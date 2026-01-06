import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost/it-api/api/", // ajuste conforme necessário
  timeout: 10000,
});
