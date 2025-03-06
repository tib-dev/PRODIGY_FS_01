import Cookies from "js-cookie";

// Set cookie
export const setCookie = (name, value, options = {}) => {
  Cookies.set(name, value, { expires: 7, ...options }); // Set cookie with 7 days expiry by default
};

// Get cookie
export const getCookie = (name) => {
 
  return Cookies.get(name);
};

// Remove cookie
export const removeCookie = (name) => {
  Cookies.remove(name);
};
