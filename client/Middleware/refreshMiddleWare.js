import axiosInstance from "../API/axios";
import { refreshAccessToken } from "../Store/Slices/authSlice";
import { getCookie, setCookie } from "../util/cookie";



let isRefreshing = false;
let refreshSubscribers = [];

const addSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const tokenRefreshMiddleware = (store) => (next) => async (action) => {
  if (!action.type.endsWith("/rejected")) {
    return next(action);
  }

  const { error, meta } = action.payload || {};

  if (error?.response?.status === 401) {
    const refreshToken = getCookie("refreshToken");

    if (refreshToken && !isRefreshing) {
      isRefreshing = true;

      try {
        const newAccessToken = await store
          .dispatch(refreshAccessToken(refreshToken))
          .unwrap();

        setCookie("accessToken", newAccessToken);
        isRefreshing = false;
        onRefreshed(newAccessToken);

        if (meta?.originalRequest) {
          meta.originalRequest.headers[
            "Authorization"
          ] = `Bearer ${newAccessToken}`;
          return axiosInstance(meta.originalRequest)
            .then((response) => {
              store.dispatch({
                type: `${meta.originalRequestType}/fulfilled`,
                payload: response.data,
                meta,
              });
            })
            .catch((retryError) => {
              store.dispatch({
                type: `${meta.originalRequestType}/rejected`,
                payload: { error: retryError },
                meta,
              });
            });
        }
      } catch (refreshError) {
        console.error("Error refreshing token:", refreshError);
        logoutUser();
      }
    } else if (!refreshToken) {
      console.error("No refresh token found. Redirecting to login...");
      logoutUser();
    }
  }

  return next(action);
};

export default tokenRefreshMiddleware;
