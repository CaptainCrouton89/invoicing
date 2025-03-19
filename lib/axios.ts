import axios from "axios";
import { toast } from "sonner";
export const api = axios.create();

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      window.location.href = "/sign-in";
    } else if (error.response.status === 403) {
      toast.error("You are not authorized to access this page");
    }
    return Promise.reject(error);
  }
);
