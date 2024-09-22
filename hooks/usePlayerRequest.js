import axios from "axios";

export const BACKEND_URL = "http://localhost:3001";

export const BACKEND_FILES_URL = `${BACKEND_URL}/public/assets`;

export const usePlayerRequest = () => {
  return async ({method, path, data}) => {
    const url = `${BACKEND_URL}${path}`;
    const request = axios[method];
    const requestData = await request(url, data);
    return requestData.data;
  };
};
