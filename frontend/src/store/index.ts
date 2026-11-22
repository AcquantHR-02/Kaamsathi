import { configureStore } from "@reduxjs/toolkit";
import { baseApi } from "./baseApi";

// One store per browser tab, created by StoreProvider (a module-level store would be shared
// between users' requests on the server).
export const makeStore = () =>
  configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
    // Redux DevTools logs every action, including login request args (password): dev only.
    devTools: process.env.NODE_ENV !== "production",
  });

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
